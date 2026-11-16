// What a laptop tells Naga's operator service, and how each message is signed.
// Every message is signed with the laptop's peaq key (EIP-191), so the operator can check who sent it
// without accounts or passwords. A message carries its own time and is refused when it is old.
export const MAX_AGE_SECONDS = 600;

/** The exact text that gets signed. Keys are sorted, so both sides build the same bytes. */
export function canonical(kind, body) {
  const keys = Object.keys(body).filter((k) => k !== 'signature').sort();
  return 'naga-node:' + kind + '\n' + keys.map((k) => k + ': ' + body[k]).join('\n');
}

export async function sign(account, kind, body) {
  const full = Object.assign({}, body, { sentAt: new Date().toISOString() });
  return Object.assign(full, { signature: await account.signMessage({ message: canonical(kind, full) }) });
}

export function enrollment(snapshot, model) {
  return { machineId: snapshot.machineId, peaqAddress: snapshot.addresses.peaq, solanaAddress: snapshot.addresses.solana, model: model || 'unknown', network: snapshot.network };
}

export function dayReport(machineId, peaqAddress, day, entry) {
  // networkPayUsdCents is what a partner network paid this laptop that day. No network is connected yet, so it is 0.
  return { machineId, peaqAddress, day, onlineSeconds: entry.seconds, heartbeats: entry.heartbeats, networkPayUsdCents: 0 };
}
