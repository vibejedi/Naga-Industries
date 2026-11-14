// Everything Naga Node asks of peaqOS, through peaq's own SDK (@peaqos/peaq-os-sdk).
// The SDK reports usage to PostHog unless told not to. Naga Node turns that off: a laptop owner
// agreed to run a node, not to send analytics to a third party.
import { formatEther } from 'viem';
import { ed25519Multibase } from './vault.js';

let cached;
export async function loadSdk() {
  if (process.env.PEAQOS_TELEMETRY === undefined) process.env.PEAQOS_TELEMETRY = '0';
  cached ||= await import('@peaqos/peaq-os-sdk');
  return cached;
}

/** PEAQ for people: four decimals, rounded up so a quoted amount always covers what the chain asks for. */
export function peaq(wei) {
  const unit = 10n ** 14n, n = (BigInt(wei) + unit - 1n) / unit;
  return formatEther(n * unit);
}
export const TIERS = ['Entry', 'Basic', 'Pro'];

/** The activation call. The laptop signs it, owns its machine NFT and pays its own bond. */
export function activationParams(cfg, keys, anchor) {
  const controller = cfg.operator || keys.evm.address;
  return {
    controller,
    // The DID document names the laptop's Solana key, the address Machine Rewards are paid to.
    verificationMethods: [{ id: '#solana', methodType: 'Ed25519VerificationKey2020', controller, publicKeyMultibase: ed25519Multibase(keys.solana.publicKey) }],
    authentication: [0n],
    serviceEndpoints: [{ id: '#naga-node', serviceType: 'naga-node', serviceEndpoint: 'https://naga.industries/node' }],
    machineType: cfg.machineType,
    credentialSubject: anchor.credentialSubject,
    manufacturer: cfg.manufacturer || controller,
    tier: cfg.tier,
  };
}

export class Peaq {
  constructor(cfg, sdk) { this.cfg = cfg; this.sdk = sdk; }

  client(privateKey) {
    return new this.sdk.PeaqosClient({ rpcUrl: this.cfg.rpcUrl, privateKey, deployment: { deploymentId: this.cfg.deploymentId } });
  }

  /** Quote the bond without signing anything. */
  async preview(privateKey, params) {
    const p = await this.client(privateKey).previewMachineActivation(params);
    const gasMargin = 50_000_000_000_000_000n;                    // 0.05 PEAQ, the margin peaq's CLI keeps for gas
    const needed = p.netPeaqAmount + gasMargin;
    return {
      machineId: p.machineId.toString(), tier: TIERS[p.tier], controller: p.controller,
      bond: peaq(p.bondAmount), voucher: peaq(p.voucherCredit), net: peaq(p.netPeaqAmount), netWei: p.netPeaqAmount.toString(),
      balance: peaq(p.balance), needed: peaq(needed), shortfall: p.balance >= needed ? '0' : peaq(needed - p.balance),
      ready: p.balance >= needed,
    };
  }

  /** One transaction: mints the machine NFT, stores the DID document and bonds PEAQ. Never call it twice. */
  async activate(privateKey, params, expectedMachineId, netWei) {
    const r = await this.client(privateKey).activateMachine(Object.assign({}, params, {
      expectedMachineId,
      maxNetPeaqAmount: BigInt(netWei) * 105n / 100n,             // the oracle reprices daily: accept 5% more, no further
    }));
    return { machineId: r.machineId.toString(), owner: r.owner, controller: r.controller, transactionHash: r.transactionHash, net: peaq(r.netPeaqAmount) };
  }

  /** What the chain says about a machine. Returns null for a machine that was never activated. */
  async machine(privateKey, machineId) {
    let s;
    try { s = await this.client(privateKey).getMachineActivationState(BigInt(machineId)); }
    catch (e) { if (isMissing(e)) return null; throw e; }
    if (!s || !s.subscription || s.subscription.periodStart === 0n) return null;
    return { owner: s.owner, controller: s.controller, tier: TIERS[s.subscription.tier], periodEnd: Number(s.subscription.periodEnd), homedOnPeaq: s.isHomedLocally };
  }

  /** PENDING, OPTED_IN or OPTED_OUT. Public read; null on the testnet, which has no opt-in API. */
  async monetization(machineId) {
    if (this.cfg.deploymentId !== 'peaq-mainnet') return null;
    return (await this.sdk.getMonetization({ deploymentId: this.cfg.deploymentId }, BigInt(machineId))).status;
  }

  /** The Naga Node switch. A signed message to peaq's API, no transaction and no gas. */
  async setMonetization(privateKey, machineId, on) {
    if (this.cfg.deploymentId !== 'peaq-mainnet') return null;
    const config = { deploymentId: this.cfg.deploymentId, signer: this.sdk.eip191SignerFromPrivateKey(privateKey) };
    const state = await (on ? this.sdk.optIn : this.sdk.optOut)(config, BigInt(machineId));
    return state.status;
  }

  /** Signed "I am online" every interval. The service marks the machine offline 180 s after the last one. */
  heartbeat(keys, machineId, onResult) {
    const hb = new this.sdk.HeartbeatClient();
    hb.start({
      baseUrl: this.cfg.heartbeatUrl,
      intervalMs: Math.min(this.cfg.heartbeatSeconds * 1000, this.sdk.MAX_HEARTBEAT_INTERVAL_MS || 120000),
      machineId: String(machineId),
      publicKey: keys.evm.publicKey,
      signer: { sign: (message) => keys.evm.signMessage({ message }) },
      onResult,
    });
    return hb;
  }
}

function isMissing(e) {
  const text = [e && e.code, e && e.name, e && e.shortMessage, e && e.message].join(' ');
  return /NONEXISTENT|NOT_FOUND|NotFound|not found|does not exist|ERC721NonexistentToken|MACHINE_NOT_ACTIVATED|NOT_ACTIVATED/i.test(text);
}
