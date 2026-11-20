// The DePIN trial: run other networks' own clients on a Naga machine and measure what each one
// really costs and pays. Naga Node does not contain those clients and downloads nothing. You install
// each network's official app yourself; this starts and stops it (if you give it the command), keeps
// one GPU network running at a time, samples the GPU every minute and adds up the result.
//
// What it measures: time on each network, GPU watts, load and temperature from nvidia-smi.
// What you type in: what each network's dashboard says you earned. No network here offers a public
// way to read that for you, and a figure we cannot check is better entered by a person than guessed.
import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs';
import { file, readJson, writeJson } from './config.js';

export const NETWORKS = Object.freeze({
  salad:  { name: 'Salad',  uses: 'gpu' },
  ionet:  { name: 'io.net', uses: 'gpu' },
  grass:  { name: 'Grass',  uses: 'bandwidth' },
  teneo:  { name: 'Teneo',  uses: 'bandwidth' },
});

const run = (cmd, args) => new Promise((resolve) => execFile(cmd, args, { timeout: 8000 }, (err, out) => resolve(err ? '' : String(out))));

/** One reading from the first NVIDIA GPU, or null when there is none. Watts are the GPU alone, not the whole machine. */
export async function sampleGpu(exec = run) {
  const out = await exec('nvidia-smi', ['--query-gpu=name,power.draw,utilization.gpu,temperature.gpu', '--format=csv,noheader,nounits']);
  const line = out.trim().split('\n')[0];
  if (!line) return null;
  const [name, watts, util, temp] = line.split(',').map((s) => s.trim());
  const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
  return { gpu: name, watts: n(watts), util: n(util), temp: n(temp) };
}

export class Trial {
  constructor({ exec = run, now = () => Date.now(), spawnFn = spawn, intervalMs = 60000 } = {}) {
    this.exec = exec; this.now = now; this.spawnFn = spawnFn; this.intervalMs = intervalMs;
    this.children = {}; this.timer = null;
  }

  state() { return readJson('trial.json', { running: {}, commands: {}, earnings: [] }); }
  save(s) { writeJson('trial.json', s); return s; }
  known(id) { if (!NETWORKS[id]) throw new Error('Unknown network. Use one of: ' + Object.keys(NETWORKS).join(', ')); return NETWORKS[id]; }

  /** Tell the trial how to start a network's client, e.g. setCommand('salad', 'C:\\Program Files\\Salad\\Salad.exe'). */
  setCommand(id, cmd, args = []) { this.known(id); const s = this.state(); s.commands[id] = { cmd, args }; this.save(s); return s.commands[id]; }

  async start(id) {
    const net = this.known(id); const s = this.state();
    if (s.running[id]) throw new Error(net.name + ' is already running in this trial.');
    // Two GPU networks at once would fight for the card and neither number would mean anything.
    const clash = Object.keys(s.running).find((k) => NETWORKS[k].uses === 'gpu' && net.uses === 'gpu');
    if (clash) throw new Error('Stop ' + NETWORKS[clash].name + ' first. Only one GPU network runs at a time.');
    const c = s.commands[id];
    if (c) { const child = this.spawnFn(c.cmd, c.args, { detached: true, stdio: 'ignore' }); child.on && child.on('error', () => {}); child.unref && child.unref(); this.children[id] = child; }
    s.running[id] = { since: new Date(this.now()).toISOString(), launched: !!c };
    this.save(s); this.watch();
    return { network: net.name, launched: !!c, note: c ? 'Started its client.' : 'No command set: start ' + net.name + '\'s own app yourself. The clock is running.' };
  }

  async stop(id) {
    const net = this.known(id); const s = this.state();
    if (!s.running[id]) throw new Error(net.name + ' is not running in this trial.');
    const child = this.children[id]; if (child && child.kill) { try { child.kill(); } catch (e) { /* already gone */ } }
    delete this.children[id];
    const was = s.running[id]; delete s.running[id]; this.save(s);
    if (!Object.keys(s.running).length) this.unwatch();
    return { network: net.name, since: was.since, note: was.launched ? 'Stopped its client.' : 'Close ' + net.name + '\'s own app yourself. The clock has stopped.' };
  }

  /** Take one sample and append it to the log. Called every minute while anything runs. */
  async sample() {
    const s = this.state(); const on = Object.keys(s.running);
    if (!on.length) return null;
    const g = await sampleGpu(this.exec);
    const row = { t: new Date(this.now()).toISOString(), on, seconds: this.intervalMs / 1000, watts: g ? g.watts : null, util: g ? g.util : null, temp: g ? g.temp : null };
    fs.appendFileSync(file('trial-log.jsonl'), JSON.stringify(row) + '\n');
    return row;
  }
  watch() { if (!this.timer) { this.timer = setInterval(() => this.sample().catch(() => {}), this.intervalMs); this.timer.unref && this.timer.unref(); } }
  unwatch() { clearInterval(this.timer); this.timer = null; }

  /** What a network's own dashboard says you earned that day. usd is its dollar value on the day. */
  earn(id, day, amount, unit, usd) {
    this.known(id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error('Give the day as YYYY-MM-DD.');
    if (!(amount >= 0) || !(usd >= 0)) throw new Error('Give the amount and its US dollar value as numbers, zero or more.');
    const s = this.state();
    s.earnings = s.earnings.filter((e) => !(e.network === id && e.day === day));
    s.earnings.push({ network: id, day, amount, unit: String(unit || 'USD'), usd });
    this.save(s); return s.earnings[s.earnings.length - 1];
  }

  /**
   * Hours, energy and money per network. GPU energy is charged to the GPU network that was running;
   * a bandwidth network is charged none, since it adds little to a machine that is already on.
   * The power figure is the GPU alone: the whole machine draws more, so the true net is lower.
   */
  report({ usdPerKwh = 0.23 } = {}) {
    let rows = [];
    try { rows = fs.readFileSync(file('trial-log.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)); } catch (e) { /* no samples yet */ }
    const s = this.state();
    return Object.keys(NETWORKS).map((id) => {
      const mine = rows.filter((r) => r.on.includes(id));
      const seconds = mine.reduce((n, r) => n + r.seconds, 0);
      const withW = mine.filter((r) => r.watts != null);
      const gpu = NETWORKS[id].uses === 'gpu';
      const kwh = gpu ? withW.reduce((n, r) => n + r.watts * r.seconds / 3600000, 0) : 0;
      const earned = s.earnings.filter((e) => e.network === id).reduce((n, e) => n + e.usd, 0);
      const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
      return { network: NETWORKS[id].name, uses: NETWORKS[id].uses, hours: round(seconds / 3600, 1),
        avgGpuWatts: gpu && withW.length ? Math.round(withW.reduce((n, r) => n + r.watts, 0) / withW.length) : null,
        avgGpuLoad: gpu && withW.length ? Math.round(mine.reduce((n, r) => n + (r.util || 0), 0) / mine.length) : null,
        maxTemp: gpu && mine.length ? Math.max(...mine.map((r) => r.temp || 0)) : null,
        gpuKwh: round(kwh, 2), powerCostUsd: round(kwh * usdPerKwh), earnedUsd: round(earned), netUsd: round(earned - kwh * usdPerKwh),
        daysWithEarnings: s.earnings.filter((e) => e.network === id).length, running: !!s.running[id] };
    });
  }
}

export function csv(report) {
  const cols = ['network', 'uses', 'hours', 'avgGpuWatts', 'avgGpuLoad', 'maxTemp', 'gpuKwh', 'powerCostUsd', 'earnedUsd', 'netUsd', 'daysWithEarnings'];
  return [cols.join(',')].concat(report.map((r) => cols.map((c) => (r[c] == null ? '' : r[c])).join(','))).join('\n') + '\n';
}
