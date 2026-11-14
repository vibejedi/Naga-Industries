// Run with: npm test   (no network: a stand-in SDK plays peaq)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

process.env.NAGA_NODE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'naga-node-test-'));
const { derive, createVault, openVault, ed25519Multibase } = await import('../src/vault.js');
const { machineAnchor, machineId } = await import('../src/anchor.js');
const { NagaNode } = await import('../src/agent.js');
const { createServer } = await import('../src/server.js');
const { DEFAULTS, file } = await import('../src/config.js');

const PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const reset = () => { for (const f of fs.readdirSync(process.env.NAGA_NODE_HOME)) fs.rmSync(file(f)); };

// A stand-in for @peaqos/peaq-os-sdk. `chain` is the world it reports.
function fakeSdk(chain) {
  const calls = [];
  class PeaqosClient {
    constructor(c) { this.c = c; }
    async previewMachineActivation(p) { calls.push(['preview', p]); return { machineId: machineId(p.machineType, p.credentialSubject), tier: p.tier, controller: p.controller, bondAmount: chain.bond, voucherCredit: 0n, netPeaqAmount: chain.bond, balance: chain.balance }; }
    async activateMachine(p) {
      calls.push(['activate', p]);
      if (chain.failActivation) throw chain.failActivation;
      chain.machine = { owner: '0xOwner', controller: p.controller, subscription: { tier: p.tier, periodStart: 1n, periodEnd: 1800000000n }, isHomedLocally: true };
      return { machineId: p.expectedMachineId, owner: '0xOwner', controller: p.controller, transactionHash: '0xabc', netPeaqAmount: chain.bond };
    }
    async getMachineActivationState() { if (!chain.machine) { const e = new Error('machine not found'); e.code = 'MACHINE_NOT_FOUND'; throw e; } return chain.machine; }
  }
  return {
    calls, PeaqosClient, MAX_HEARTBEAT_INTERVAL_MS: 120000,
    eip191SignerFromPrivateKey: (k) => ({ k }),
    getMonetization: async () => ({ status: chain.monetization }),
    optIn: async (cfg, id) => { calls.push(['optIn', id]); chain.monetization = 'OPTED_IN'; return { status: 'OPTED_IN' }; },
    optOut: async (cfg, id) => { calls.push(['optOut', id]); chain.monetization = 'OPTED_OUT'; return { status: 'OPTED_OUT' }; },
    HeartbeatClient: class { start(c) { calls.push(['hbStart', c]); chain.hb = c; } stop() { calls.push(['hbStop']); chain.hb = null; } },
  };
}
const world = (over = {}) => Object.assign({ bond: 800000000000000000n, balance: 0n, machine: null, monetization: 'PENDING', hb: null }, over);
const cfg = (over = {}) => Object.assign({}, DEFAULTS, over);

test('one phrase gives the standard peaq and Solana addresses', () => {
  const k = derive(PHRASE);
  assert.equal(k.evm.address, '0x9858EfFD232B4033E47d90003D41EC34EcaEda94');          // m/44'/60'/0'/0/0
  assert.equal(k.solana.address, 'HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk');     // m/44'/501'/0'/0', as peaq's OWS vault derives it
  assert.match(ed25519Multibase(k.solana.publicKey), /^z6Mk/);
  assert.throws(() => derive('not a real phrase at all'), /valid recovery phrase/);
});

test('the vault encrypts the phrase and refuses a wrong passphrase or a second wallet', () => {
  reset();
  createVault('correct horse', PHRASE);
  const raw = fs.readFileSync(file('vault.json'), 'utf8');
  assert.ok(!raw.includes('abandon'), 'the phrase is not on disk in the clear');
  if (process.platform !== 'win32') assert.equal(fs.statSync(file('vault.json')).mode & 0o777, 0o600);
  assert.equal(openVault('correct horse').mnemonic, PHRASE);
  assert.throws(() => openVault('wrong horse'), /Wrong passphrase/);
  assert.throws(() => createVault('correct horse'), /already has a wallet/);
  assert.throws(() => { reset(); createVault('short'); }, /at least 8/);
});

test('the machine anchor is fixed after the first read, and hides the serial', () => {
  reset();
  const a = machineAnchor('NAGA-SN-0001');
  assert.equal(a.source, 'serial');
  assert.match(a.credentialSubject, /^0x[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(a).includes('NAGA-SN-0001'));
  assert.deepEqual(machineAnchor('ANOTHER-SERIAL'), a, 'a later read cannot change the ID');
  assert.equal(machineId('Laptop', a.credentialSubject).toString().length > 70, true);
});

test('activation: refuses without funds, sends once, never twice', async () => {
  reset();
  const chain = world(); const sdk = fakeSdk(chain);
  const node = new NagaNode({ cfg: cfg({ operator: '0x1111111111111111111111111111111111111111' }), sdk });
  node.setup('correct horse', PHRASE); machineAnchor('NAGA-SN-0002');
  await assert.rejects(node.activate(), /needs 0\.85 more PEAQ/);
  assert.ok(!sdk.calls.some((c) => c[0] === 'activate'), 'nothing was sent');

  chain.balance = 10n ** 18n;
  const r = await node.activate();
  assert.equal(r.transactionHash, '0xabc');
  const sent = sdk.calls.find((c) => c[0] === 'activate')[1];
  assert.equal(sent.controller, '0x1111111111111111111111111111111111111111', 'the operator is the controller');
  assert.equal(sent.expectedMachineId.toString(), node.id());
  assert.equal(sent.maxNetPeaqAmount, 840000000000000000n, 'at most 5% above the quote');
  assert.match(sent.verificationMethods[0].publicKeyMultibase, /^z6Mk/);
  assert.equal(node.snapshot().activated, true);
  await assert.rejects(node.activate(), /already activated/);
});

test('an unconfirmed activation locks out a second one', async () => {
  reset();
  const err = Object.assign(new Error('receipt unavailable'), { code: 'RECEIPT_UNAVAILABLE', transactionHash: '0xpending' });
  const chain = world({ balance: 10n ** 18n, failActivation: err }); const sdk = fakeSdk(chain);
  const node = new NagaNode({ cfg: cfg(), sdk });
  node.setup('correct horse', PHRASE);
  await assert.rejects(node.activate(), /not confirmed yet \(0xpending\)/);
  chain.failActivation = null;
  await assert.rejects(node.activate(), /already sent/);
  assert.equal(sdk.calls.filter((c) => c[0] === 'activate').length, 1);
  // A plain failure before sending leaves no lock.
  reset(); const chain2 = world({ balance: 10n ** 18n, failActivation: new Error('simulation reverted') });
  const node2 = new NagaNode({ cfg: cfg(), sdk: fakeSdk(chain2) }); node2.setup('correct horse', PHRASE);
  await assert.rejects(node2.activate(), /simulation reverted/);
  assert.equal(node2.snapshot().pendingActivation, null);
});

test('the switch: off by default, opts in and heartbeats when on, opts out when off', async () => {
  reset();
  const chain = world({ balance: 10n ** 18n }); const sdk = fakeSdk(chain);
  const node = new NagaNode({ cfg: cfg(), sdk });
  node.setup('correct horse', PHRASE);
  assert.equal(node.snapshot().switch, 'off');
  await assert.rejects(node.switchOn(), /Activate this laptop/);
  await node.activate();
  assert.equal(chain.hb, null, 'activating does not turn the node on');

  await node.switchOn();
  assert.equal(chain.monetization, 'OPTED_IN');
  assert.equal(chain.hb.machineId, node.id());
  assert.match(chain.hb.publicKey, /^0x04[0-9a-f]{128}$/, 'uncompressed secp256k1 key');
  assert.equal(chain.hb.intervalMs, 60000);
  assert.match(await chain.hb.signer.sign('machineId: 1\nsentAt: now'), /^0x[0-9a-f]{130}$/);

  chain.hb.onResult({ accepted: true, online: true, lastHeartbeatAt: '2026-11-14T00:00:00.000Z' });
  chain.hb.onResult({ accepted: false, online: false });
  const snap = node.snapshot();
  assert.equal(snap.work.todaySeconds, 60, 'only accepted heartbeats count');
  assert.match(snap.heartbeat.error, /refused/);

  // Locking stops the heartbeat; unlocking resumes it because the switch is still on.
  node.lock(); assert.equal(chain.hb, null);
  await node.unlock('correct horse'); assert.ok(chain.hb);

  await node.switchOff();
  assert.equal(chain.hb, null); assert.equal(chain.monetization, 'OPTED_OUT'); assert.equal(node.snapshot().switch, 'off');
  node.lock(); await node.unlock('correct horse'); assert.equal(chain.hb, null, 'stays off after a restart');
});

test('the dashboard answers only its own page', async () => {
  reset();
  const node = new NagaNode({ cfg: cfg(), sdk: fakeSdk(world()) });
  const { server, token, url } = await createServer(node, { port: 0 });
  const port = server.address().port;
  const post = (p, body, headers = {}) => fetch(url + p, { method: 'POST', headers: Object.assign({ 'content-type': 'application/json' }, headers), body: JSON.stringify(body) });
  try {
    const page = await (await fetch(url + '/')).text();
    assert.ok(page.includes(token) && !page.includes('__NAGA_TOKEN__'));
    assert.equal((await (await fetch(url + '/api/state')).json()).hasWallet, false);
    assert.equal((await post('/api/setup', { passphrase: 'correct horse' })).status, 403, 'no token, no change');
    assert.equal((await post('/api/setup', { passphrase: 'correct horse' }, { 'x-naga-token': 'x'.repeat(48) })).status, 403);
    // A page on another site that resolves its own name to 127.0.0.1 sends its own Host header.
    const rebind = await new Promise((resolve) => { import('node:http').then(({ default: http }) => http.get({ host: '127.0.0.1', port, path: '/api/state', headers: { host: 'evil.example:' + port } }, (r) => resolve(r.statusCode))); });
    assert.equal(rebind, 403);
    const made = await (await post('/api/setup', { passphrase: 'correct horse' }, { 'x-naga-token': token })).json();
    assert.equal(made.mnemonic.split(' ').length, 12);
    const state = await (await fetch(url + '/api/state')).json();
    assert.ok(!JSON.stringify(state).includes(made.mnemonic.split(' ')[0] + ' ' + made.mnemonic.split(' ')[1]), 'the state never carries the phrase');
    assert.equal((await post('/api/activate', {}, { 'x-naga-token': token })).status, 400, 'activation needs an explicit confirm');
    assert.equal((await post('/api/phrase', { passphrase: 'wrong' }, { 'x-naga-token': token })).status, 400);
  } finally { server.close(); }
});
