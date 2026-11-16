// Machine Rewards, as the Rewards page describes them:
//   - the month's pool is shared among bonded laptops that worked, by how much each one did;
//   - a laptop collects at most twice its network pay for that month;
//   - what the caps leave over goes back to the treasury.
// "How much each one did" is measured by network pay, the one figure a third party stands behind.
// Online time is recorded and shown, and it earns nothing by itself: a heartbeat is easy to fake.
// All amounts are whole US cents, so nothing is lost to rounding and the totals always add up.

/**
 * @param poolCents  the month's Machine Rewards pool, in US cents
 * @param machines   [{ machineId, solanaAddress, networkPayCents }]
 * @returns { payouts: [{ machineId, solanaAddress, networkPayCents, capCents, rewardCents }], paidCents, treasuryCents }
 */
export function distribute(poolCents, machines) {
  if (!Number.isInteger(poolCents) || poolCents < 0) throw new Error('The pool must be a whole number of cents, zero or more.');
  const rows = machines.map((m) => {
    if (!Number.isInteger(m.networkPayCents) || m.networkPayCents < 0) throw new Error('Network pay must be whole cents, zero or more: ' + m.machineId);
    return { machineId: m.machineId, solanaAddress: m.solanaAddress, networkPayCents: m.networkPayCents, capCents: m.networkPayCents * 2, rewardCents: 0 };
  });
  // Share by network pay; whoever hits the cap stops there and the rest is shared again among the others.
  let left = poolCents, open = rows.filter((r) => r.capCents > 0);
  while (left > 0 && open.length) {
    const weight = open.reduce((n, r) => n + r.networkPayCents, 0);
    let given = 0; const still = [];
    for (const r of open) {
      const room = r.capCents - r.rewardCents;
      const share = Math.min(room, Math.floor(left * r.networkPayCents / weight));
      r.rewardCents += share; given += share;
      if (r.rewardCents < r.capCents) still.push(r);
    }
    if (given === 0) break;                      // less than one cent each: the remainder stays in the treasury
    left -= given; open = still;
  }
  const paidCents = rows.reduce((n, r) => n + r.rewardCents, 0);
  return { payouts: rows, paidCents, treasuryCents: poolCents - paidCents };
}
