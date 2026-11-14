// The machine anchor: what makes this laptop this laptop on chain.
// peaq derives the permanent machine ID from the machine type and these bytes, so the same laptop
// always gets the same ID, and the ID can be activated once. We hash the serial so the number
// printed under the laptop is not published.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { encodeAbiParameters, keccak256, toHex } from 'viem';
import { readJson, writeJson } from './config.js';

const BLANK = /^(|0+|none|default string|to be filled by o\.e\.m\.|system serial number|not specified|unknown)$/i;

function run(cmd, args) {
  try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: 8000, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; }
}

export function readSerial(platform = process.platform) {
  let serial = '';
  if (platform === 'win32') {
    serial = run('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_BIOS).SerialNumber']);
  } else if (platform === 'darwin') {
    serial = (run('ioreg', ['-rd1', '-c', 'IOPlatformExpertDevice']).match(/"IOPlatformSerialNumber" = "([^"]+)"/) || [])[1] || '';
  } else {
    for (const f of ['/sys/class/dmi/id/product_serial', '/sys/class/dmi/id/board_serial']) {
      try { serial = fs.readFileSync(f, 'utf8').trim(); } catch (e) { /* needs root on most distros */ }
      if (serial && !BLANK.test(serial)) break;
    }
  }
  return BLANK.test(serial) ? '' : serial;
}

/**
 * Returns { source, credentialSubject }. The first answer is saved and reused, so a firmware update
 * or a different user account can never change the machine's ID after activation.
 */
export function machineAnchor(serial = readSerial()) {
  const saved = readJson('anchor.json');
  if (saved) return saved;
  // No readable serial (a virtual machine, or Linux without root): fall back to the OS install ID.
  let source = 'serial', value = serial;
  if (!value) {
    source = 'install-id';
    try { value = fs.readFileSync('/etc/machine-id', 'utf8').trim(); } catch (e) { value = ''; }
    if (!value) { source = 'random'; value = crypto.randomBytes(32).toString('hex'); }
  }
  const anchor = { source, credentialSubject: keccak256(toHex('naga-node:v1:' + value)) };
  writeJson('anchor.json', anchor);
  return anchor;
}

/** peaq's machine ID: uint256(keccak256(abi.encode(machineType, credentialSubject))). */
export function machineId(machineType, credentialSubject) {
  return BigInt(keccak256(encodeAbiParameters([{ type: 'string' }, { type: 'bytes' }], [machineType, credentialSubject])));
}
