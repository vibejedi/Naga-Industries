// Settings and file locations. Everything Naga Node keeps lives in one folder on the laptop's drive.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const home = () => process.env.NAGA_NODE_HOME || path.join(os.homedir(), '.naga-node');
export const file = (name) => path.join(home(), name);

export const DEFAULTS = Object.freeze({
  deploymentId: 'peaq-mainnet',              // or 'agung-2026-08-28' (testnet: no ratings, no opt-in API)
  rpcUrl: 'https://quicknode1.peaq.xyz',
  heartbeatUrl: 'https://heartbeat.peaq.xyz',
  heartbeatSeconds: 60,                      // the service drops a machine after 180 s; the SDK caps this at 120
  // Naga's operator wallet. It becomes the machine's DID controller: it can suspend, resume, renew and
  // update the DID, and it cannot move the machine or take its wallet. Empty = the laptop controls itself.
  operator: '',
  manufacturer: '',                          // Naga's address, recorded on chain and never checked by peaq
  machineType: 'Laptop',                     // part of the machine ID: never change it after the first activation
  tier: 0,                                   // 0 Entry, 1 Basic, 2 Pro
  port: 4747,
});

export function readJson(name, fallback = null) {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); } catch (e) { return fallback; }
}

export function writeJson(name, value) {
  fs.mkdirSync(home(), { recursive: true, mode: 0o700 });
  const tmp = file(name + '.tmp');
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file(name));
}

export function loadConfig() {
  const saved = readJson('config.json', {});
  const env = {};
  if (process.env.NAGA_NODE_RPC_URL) env.rpcUrl = process.env.NAGA_NODE_RPC_URL;
  if (process.env.NAGA_NODE_DEPLOYMENT) env.deploymentId = process.env.NAGA_NODE_DEPLOYMENT;
  if (process.env.NAGA_NODE_OPERATOR) env.operator = process.env.NAGA_NODE_OPERATOR;
  if (process.env.NAGA_NODE_PORT) env.port = Number(process.env.NAGA_NODE_PORT);
  return Object.assign({}, DEFAULTS, saved, env);
}
