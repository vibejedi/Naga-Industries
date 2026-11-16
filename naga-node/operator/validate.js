// Shape checks for what laptops send. Anything that does not fit is refused before a signature is checked.
const ID = /^[1-9]\d{10,79}$/, EVM = /^0x[0-9a-fA-F]{40}$/, SOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, SIG = /^0x[0-9a-f]{130}$/, DAY = /^\d{4}-\d{2}-\d{2}$/;
const bad = (m) => { throw Object.assign(new Error(m), { status: 400 }); };
const base = (b) => {
  if (!b || typeof b !== 'object') bad('Bad request.');
  if (!ID.test(String(b.machineId))) bad('Bad machine ID.');
  if (!EVM.test(String(b.peaqAddress))) bad('Bad peaq address.');
  if (!SIG.test(String(b.signature))) bad('Bad signature.');
  if (typeof b.sentAt !== 'string' || Number.isNaN(Date.parse(b.sentAt))) bad('Bad time.');
};
export const anchorless = {
  enroll(b) { base(b); if (!SOL.test(String(b.solanaAddress))) bad('Bad Solana address.'); if (typeof b.model !== 'string' || b.model.length > 40) bad('Bad model.'); if (typeof b.network !== 'string' || b.network.length > 40) bad('Bad network.'); },
  report(b) { base(b); if (!DAY.test(String(b.day))) bad('Bad day.'); for (const k of ['onlineSeconds', 'heartbeats', 'networkPayUsdCents']) if (!Number.isInteger(b[k]) || b[k] < 0) bad('Bad ' + k + '.'); },
};
