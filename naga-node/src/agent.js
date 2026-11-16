// The node itself: one laptop, one wallet, one machine on peaqOS, one switch.
// Rules it keeps:
//   - Off until the owner turns it on. Turning it off stops the heartbeat and opts the machine out.
//   - It signs only while the wallet is unlocked, and it never writes the phrase or a key to disk in the clear.
//   - It activates a machine once. A second attempt is refused here before it reaches the chain.
import { loadConfig, readJson, writeJson } from './config.js';
import { machineAnchor, machineId } from './anchor.js';
import { createVault, openVault, publicAddresses, vaultExists } from './vault.js';
import { Peaq, activationParams, loadSdk } from './peaq.js';
import { dayReport, enrollment, sign } from './report.js';

const today = () => new Date().toISOString().slice(0, 10);

export class NagaNode {
  constructor({ cfg = loadConfig(), sdk = null, log = () => {}, fetch: fetchFn = null } = {}) {
    this.cfg = cfg; this.sdk = sdk; this.log = log;
    this.keys = null; this.hb = null;
    this.beat = { running: false, online: false, lastAcceptedAt: null, error: null };
    this.remote = { machine: undefined, monetization: undefined, error: null, checkedAt: null };
    this.fetch = fetchFn || globalThis.fetch;
    this.operator = { enrolled: !!this.state().enrolledAt, lastReportAt: null, error: null };
  }

  async peaq() { this.sdk ||= await loadSdk(); return new Peaq(this.cfg, this.sdk); }
  state() { return readJson('state.json', { switch: 'off' }); }
  save(patch) { const s = Object.assign(this.state(), patch); writeJson('state.json', s); return s; }
  anchor() { return machineAnchor(); }
  id() { return machineId(this.cfg.machineType, this.anchor().credentialSubject).toString(); }
  needKeys() { if (!this.keys) throw new Error('Unlock the wallet first.'); return this.keys; }

  /** First run: make the wallet. Returns the recovery phrase once; it is never shown again without the passphrase. */
  setup(passphrase, mnemonic) {
    const v = createVault(passphrase, mnemonic);
    this.keys = v.keys; this.anchor();
    return { mnemonic: v.mnemonic, addresses: publicAddresses() };
  }

  async unlock(passphrase) {
    this.keys = openVault(passphrase).keys;
    await this.refresh();
    if (this.state().switch === 'on') await this.resume();
    return this.snapshot();
  }

  lock() { this.stopHeartbeat(); this.keys = null; return this.snapshot(); }
  phrase(passphrase) { return openVault(passphrase).mnemonic; }

  /** Ask the chain and the opt-in API where this machine stands. Network errors are kept, not thrown. */
  async refresh() {
    const keys = this.keys; if (!keys) return this.remote;
    try {
      const p = await this.peaq();
      const machine = await p.machine(keys.evmPrivateKey, this.id());
      const monetization = machine ? await p.monetization(this.id()) : null;
      this.remote = { machine, monetization, error: null, checkedAt: new Date().toISOString() };
    } catch (e) {
      this.remote = Object.assign({}, this.remote, { error: short(e), checkedAt: new Date().toISOString() });
    }
    return this.remote;
  }

  async preview() {
    const keys = this.needKeys();
    return (await this.peaq()).preview(keys.evmPrivateKey, activationParams(this.cfg, keys, this.anchor()));
  }

  async activate() {
    const keys = this.needKeys();
    await this.refresh();
    if (this.remote.error) throw new Error('Could not read the chain, so nothing was sent: ' + this.remote.error);
    if (this.remote.machine) throw new Error('This laptop is already activated.');
    const pending = this.state().pendingActivation;
    if (pending) throw new Error('An activation was already sent (' + pending + '). Wait for it to confirm. Sending a second one is never safe.');
    const p = await this.peaq();
    const params = activationParams(this.cfg, keys, this.anchor());
    const quote = await p.preview(keys.evmPrivateKey, params);
    if (quote.machineId !== this.id()) throw new Error('The machine ID from peaq does not match this laptop. Nothing was sent.');
    if (!quote.ready) throw new Error('The wallet needs ' + quote.shortfall + ' more PEAQ for the bond and gas.');
    this.save({ pendingActivation: 'sent ' + new Date().toISOString() });
    let result;
    try { result = await p.activate(keys.evmPrivateKey, params, BigInt(this.id()), quote.netWei); }
    catch (e) {
      // A receipt that did not arrive in time may still mine: keep the lock. Anything else was not sent.
      if (e && (e.code === 'RECEIPT_UNAVAILABLE' || e.transactionHash)) { this.save({ pendingActivation: e.transactionHash || 'unknown hash' }); throw new Error('The activation was sent and is not confirmed yet (' + (e.transactionHash || 'no hash') + '). Do not send it again.'); }
      this.save({ pendingActivation: undefined });
      throw e;
    }
    this.save({ pendingActivation: undefined, activation: { transactionHash: result.transactionHash, at: new Date().toISOString(), net: result.net } });
    await this.refresh();
    return result;
  }

  /** Clears the "already sent" lock once the chain shows no machine, e.g. after a transaction that failed. */
  async clearPending() {
    await this.refresh();
    if (this.remote.error) throw new Error('Could not read the chain: ' + this.remote.error);
    this.save({ pendingActivation: undefined });
    return this.snapshot();
  }

  async switchOn() {
    const keys = this.needKeys();
    await this.refresh();
    if (!this.remote.machine) throw new Error('Activate this laptop on peaqOS first.');
    const p = await this.peaq();
    if (this.remote.monetization !== 'OPTED_IN') this.remote.monetization = await p.setMonetization(keys.evmPrivateKey, this.id(), true);
    this.save({ switch: 'on' });
    this.startHeartbeat(p);
    await this.syncOperator();
    return this.snapshot();
  }

  async switchOff() {
    this.stopHeartbeat();
    await this.syncOperator();
    this.save({ switch: 'off' });
    if (this.keys && this.remote.machine && this.remote.monetization === 'OPTED_IN') {
      try { this.remote.monetization = await (await this.peaq()).setMonetization(this.keys.evmPrivateKey, this.id(), false); }
      catch (e) { this.remote.error = 'Heartbeat stopped. The opt-out did not reach peaq: ' + short(e); }
    }
    return this.snapshot();
  }

  async resume() {
    if (!this.keys || !this.remote.machine) return;
    if (this.remote.monetization !== null && this.remote.monetization !== 'OPTED_IN') return;   // null: testnet has no opt-in API
    this.startHeartbeat(await this.peaq());
  }

  startHeartbeat(p) {
    if (this.hb) return;
    this.beat = Object.assign(this.beat, { running: true, error: null });
    this.hb = p.heartbeat(this.keys, this.id(), (res) => this.onBeat(res));
  }

  stopHeartbeat() {
    if (this.hb) { try { this.hb.stop(); } catch (e) { /* already stopped */ } }
    this.hb = null;
    this.beat = Object.assign(this.beat, { running: false, online: false });
  }

  onBeat(res) {
    const ok = !!(res && res.accepted);
    this.beat.online = !!(res && res.online);
    this.beat.error = ok ? null : 'The heartbeat service refused the last heartbeat.';
    if (!ok) return;
    this.beat.lastAcceptedAt = res.lastHeartbeatAt || new Date().toISOString();
    // The work record: accepted heartbeats per day. Each one stands for one interval online.
    const log = readJson('worklog.json', { days: {} });
    const d = log.days[today()] ||= { heartbeats: 0, seconds: 0 };
    d.heartbeats += 1; d.seconds += this.cfg.heartbeatSeconds;
    writeJson('worklog.json', log);
    if (d.heartbeats % 30 === 0) this.syncOperator();          // about every half hour while on
  }

  /**
   * Tell Naga's operator service this laptop exists and what it did today. Signed with the laptop's key.
   * It sends the machine ID, both addresses, the model and online time. Nothing about what you do on the laptop.
   * Never throws: a laptop keeps working when Naga's server is down.
   */
  async syncOperator() {
    if (!this.cfg.operatorUrl || !this.keys || !this.remote.machine) return this.operator;
    const post = async (path, body) => {
      const r = await this.fetch(this.cfg.operatorUrl.replace(/\/$/, '') + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'The operator service answered ' + r.status);
      return data;
    };
    try {
      const snap = this.snapshot();
      if (!this.operator.enrolled) {
        const e = await post('/v1/machines', await sign(this.keys.evm, 'enroll', enrollment(snap, this.cfg.model)));
        this.save({ enrolledAt: e.enrolledAt }); this.operator.enrolled = true;
      }
      const days = readJson('worklog.json', { days: {} }).days;
      const sent = this.state().reported || {};
      for (const day of Object.keys(days).sort()) {
        if (sent[day] === days[day].heartbeats) continue;       // nothing new that day
        await post('/v1/reports', await sign(this.keys.evm, 'report', dayReport(snap.machineId, snap.addresses.peaq, day, days[day])));
        sent[day] = days[day].heartbeats;
      }
      this.save({ reported: sent });
      this.operator.lastReportAt = new Date().toISOString(); this.operator.error = null;
    } catch (e) { this.operator.error = short(e); }
    return this.operator;
  }

  work() {
    const days = readJson('worklog.json', { days: {} }).days;
    const total = Object.values(days).reduce((n, d) => n + d.seconds, 0);
    return { todaySeconds: (days[today()] || { seconds: 0 }).seconds, totalSeconds: total, days: Object.keys(days).length };
  }

  snapshot() {
    const s = this.state();
    const has = vaultExists();
    return {
      hasWallet: has, unlocked: !!this.keys,
      addresses: has ? publicAddresses() : null,
      machineId: has ? this.id() : null,
      anchorSource: has ? this.anchor().source : null,
      network: this.cfg.deploymentId, tier: ['Entry', 'Basic', 'Pro'][this.cfg.tier],
      controller: this.cfg.operator || 'this laptop',
      machine: this.remote.machine === undefined ? null : this.remote.machine,
      activated: !!this.remote.machine,
      pendingActivation: s.pendingActivation || null,
      monetization: this.remote.monetization || null,
      switch: s.switch,
      heartbeat: this.beat,
      work: this.work(),
      operator: this.cfg.operatorUrl ? this.operator : null,
      error: this.remote.error, checkedAt: this.remote.checkedAt,
    };
  }
}

function short(e) { return String((e && (e.shortMessage || e.message)) || e).split('\n')[0].slice(0, 240); }
