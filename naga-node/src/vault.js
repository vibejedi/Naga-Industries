// The laptop's wallet. One 12-word recovery phrase gives two addresses:
//   peaq (EVM, m/44'/60'/0'/0/0)      signs the activation, the opt-in and the heartbeat
//   Solana (ed25519, m/44'/501'/0'/0') receives Machine Rewards in USDC
// The phrase is stored encrypted (scrypt + AES-256-GCM) and never leaves this machine.
// peaq's own vault (OWS) has no Windows build, so Naga Node keeps its own; the paths match OWS,
// so the same phrase restores the same addresses in OWS and in any standard wallet.
import crypto from 'node:crypto';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { mnemonicToAccount } from 'viem/accounts';
import { readJson, writeJson } from './config.js';

const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58(bytes) {
  let n = BigInt('0x' + (Buffer.from(bytes).toString('hex') || '0'));
  let out = '';
  while (n > 0n) { out = B58[Number(n % 58n)] + out; n /= 58n; }
  for (const b of bytes) { if (b !== 0) break; out = '1' + out; }
  return out;
}

// SLIP-0010 hardened derivation for ed25519.
function slip10(seed, path) {
  let I = crypto.createHmac('sha512', 'ed25519 seed').update(seed).digest();
  for (const index of path) {
    const data = Buffer.concat([Buffer.from([0]), I.subarray(0, 32), Buffer.alloc(4)]);
    data.writeUInt32BE((index | 0x80000000) >>> 0, 33);
    I = crypto.createHmac('sha512', I.subarray(32)).update(data).digest();
  }
  return I.subarray(0, 32);
}

function ed25519PublicKey(secret32) {
  const pkcs8 = Buffer.concat([Buffer.from('302e020100300506032b657004220420', 'hex'), secret32]);
  const key = crypto.createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
  return crypto.createPublicKey(key).export({ format: 'der', type: 'spki' }).subarray(-32);
}

/** Everything derived from a phrase. Holds secrets: keep it in memory only. */
export function derive(mnemonic) {
  if (!validateMnemonic(mnemonic, wordlist)) throw new Error('That is not a valid recovery phrase.');
  const evm = mnemonicToAccount(mnemonic);
  const solanaSecret = slip10(Buffer.from(mnemonicToSeedSync(mnemonic)), [44, 501, 0, 0]);
  const solanaPublicKey = ed25519PublicKey(solanaSecret);
  return {
    evm,                                             // viem account: address, publicKey, signMessage
    evmPrivateKey: '0x' + Buffer.from(evm.getHdKey().privateKey).toString('hex'),
    solana: { address: base58(solanaPublicKey), publicKey: solanaPublicKey },
  };
}

/** did:key style multibase for an ed25519 public key ("z6Mk..."), used in the machine's DID document. */
export const ed25519Multibase = (publicKey) => 'z' + base58(Buffer.concat([Buffer.from([0xed, 0x01]), publicKey]));

export const vaultExists = () => !!readJson('vault.json');
export const publicAddresses = () => (readJson('vault.json') || {}).addresses || null;

export function createVault(passphrase, mnemonic = generateMnemonic(wordlist, 128)) {
  if (vaultExists()) throw new Error('This laptop already has a wallet. Naga Node never overwrites one.');
  if (typeof passphrase !== 'string' || passphrase.length < 8) throw new Error('Use a passphrase of at least 8 characters.');
  const keys = derive(mnemonic);
  const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(passphrase, salt, 32, SCRYPT);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()]);
  writeJson('vault.json', {
    version: 1,
    createdAt: new Date().toISOString(),
    addresses: { peaq: keys.evm.address, solana: keys.solana.address },
    crypto: { cipher: 'aes-256-gcm', kdf: 'scrypt', N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p,
      salt: salt.toString('hex'), iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), ciphertext: ciphertext.toString('hex') },
  });
  return { mnemonic, keys };
}

export function openVault(passphrase) {
  const v = readJson('vault.json');
  if (!v) throw new Error('This laptop has no wallet yet.');
  const c = v.crypto;
  const key = crypto.scryptSync(String(passphrase), Buffer.from(c.salt, 'hex'), 32, { N: c.N, r: c.r, p: c.p, maxmem: SCRYPT.maxmem });
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(c.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(c.tag, 'hex'));
  let mnemonic;
  try { mnemonic = Buffer.concat([decipher.update(Buffer.from(c.ciphertext, 'hex')), decipher.final()]).toString('utf8'); }
  catch (e) { throw new Error('Wrong passphrase.'); }
  return { mnemonic, keys: derive(mnemonic) };
}
