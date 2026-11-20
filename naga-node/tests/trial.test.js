// Run with: npm test   (nvidia-smi and the clients are stand-ins)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

process.env.NAGA_NODE_HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'naga-trial-test-'));
const { Trial, sampleGpu, csv } = await import('../src/trial.js');

const smi = (line) => async () => line;

test('reads the GPU, and says so when there is none', async () => {
  assert.deepEqual(await sampleGpu(smi('NVIDIA GeForce RTX 5080, 251.30, 97, 71\n')), { gpu: 'NVIDIA GeForce RTX 5080', watts: 251.3, util: 97, temp: 71 });
  assert.equal(await sampleGpu(smi('')), null);
  assert.equal((await sampleGpu(smi('NVIDIA GeForce RTX 4060 Laptop GPU, [N/A], 40, 60\n'))).watts, null, 'a laptop that hides its power draw');
});

test('one GPU network at a time, bandwidth networks alongside, and the sums add up', async () => {
  let t = Date.parse('2026-11-20T00:00:00Z'); const spawned = [], killed = [];
  const trial = new Trial({ exec: smi('RTX 5080, 240, 95, 70\n'), now: () => t, intervalMs: 3600000,
    spawnFn: (cmd, args) => { spawned.push([cmd, ...args]); return { unref() {}, on() {}, kill() { killed.push(cmd); } }; } });
  trial.setCommand('salad', 'salad.exe', ['--headless']);
  assert.equal((await trial.start('salad')).launched, true);
  assert.deepEqual(spawned, [['salad.exe', '--headless']]);
  await assert.rejects(trial.start('ionet'), /Stop Salad first/);
  assert.match((await trial.start('grass')).note, /start Grass's own app yourself/);
  await assert.rejects(trial.start('nope'), /Unknown network/);

  for (let i = 0; i < 10; i++) { await trial.sample(); t += 3600000; }       // ten hours of both
  await trial.stop('salad'); assert.deepEqual(killed, ['salad.exe']);
  await trial.start('ionet');                                                 // now allowed
  for (let i = 0; i < 5; i++) { await trial.sample(); t += 3600000; }
  trial.unwatch();

  trial.earn('salad', '2026-11-20', 1.2, 'USD', 1.2);
  trial.earn('salad', '2026-11-20', 1.5, 'USD', 1.5);                         // a correction replaces the day
  trial.earn('grass', '2026-11-20', 30, 'GRASS points', 0);
  assert.throws(() => trial.earn('salad', 'yesterday', 1, 'USD', 1), /YYYY-MM-DD/);

  const r = Object.fromEntries(trial.report({ usdPerKwh: 0.25 }).map((x) => [x.network, x]));
  assert.deepEqual([r.Salad.hours, r.Salad.avgGpuWatts, r.Salad.gpuKwh, r.Salad.powerCostUsd, r.Salad.earnedUsd, r.Salad.netUsd], [10, 240, 2.4, 0.6, 1.5, 0.9]);
  assert.deepEqual([r['io.net'].hours, r['io.net'].gpuKwh, r['io.net'].earnedUsd, r['io.net'].netUsd], [5, 1.2, 0, -0.3]);
  assert.deepEqual([r.Grass.hours, r.Grass.gpuKwh, r.Grass.avgGpuWatts], [15, 0, null], 'bandwidth is charged no GPU power');
  assert.equal(r.Teneo.hours, 0);
  assert.match(csv(trial.report()), /^network,uses,hours,/);
});
