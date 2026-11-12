# $NAGA token model (v1 draft)

Status: **draft for legal review. Nothing here is live.** `naga.html` is kept out of deploys by
`.vercelignore` and carries `noindex`. This is not legal advice; it is the brief for a Philippine
securities lawyer. Sources for the legal points are listed at the end.

## The model in one paragraph

$NAGA is a fair-launch token on Machine.Fun. It unlocks perks in Naga products (a holder
discount, first access for stakers, Baku unlocks) and funds a school program. Each bonded laptop
gets a fixed amount of $NAGA bought by Naga on the open market and locked to that machine for a
year; the bond makes the machine eligible for Machine Rewards, which are paid for work the
machine does through peaqOS (Naga Node, opt-in). Nobody is paid for simply holding or staking.

## Mechanics

| Piece | Rule |
|---|---|
| Launch | Fair launch on Machine.Fun, no presale. Chain, contract and creator-fee rate: confirm with Machine.Fun |
| Creator fees | Paid by the platform to Naga's wallet. Split: 50% Machine Rewards pool, 40% Naga (Baku, products, bonds), 10% school fund. Three public wallets |
| Pay | Holders and stakers get 5% off a laptop (currently international orders; `naga` block in `store.json`). Verified on the server at checkout |
| Stake | Locks tokens for access: pre-release products, starting with DIWA. First 300 stakers get a Naga Karga backpack (buyer pays shipping). No yield |
| Burn | Burn $NAGA to unlock Baku when it launches |
| Machine Bond | Per bonded laptop sold, Naga buys $NAGA on the open market and locks it on-chain to the machine's ID for 12 months: US$50 (LAKAN II), US$35 (SIPAG I). At expiry 50% is burned and 50% returns to the Naga treasury |
| Renewal | After 12 months the owner keeps eligibility by staking their own $NAGA to the machine (same size as the original bond) for another 12 months. Staked tokens are returned in full |
| Naga Node | peaqOS on every bonded laptop. Offered explicitly at purchase, off by default, can be left at any time |
| Machine Rewards | The pool (50% of creator fees) is shared monthly among active bonded machines in proportion to verified work (uptime and contribution through peaqOS), on top of what partner networks pay the machine directly |
| Drive wipe | The machine wallet and peaqOS identity live on the drive. Wiping, reinstalling or replacing it ends the bond link and forfeits unclaimed rewards. The owner accepts this at opt-in |

## What changed from the first brief, and why

1. **Bond size: fixed dollars per machine, not 30% of gross revenue.** 30% of gross revenue is
   about ₱29,970 on a LAKAN II against a net profit of about ₱10,060 per unit, a loss of roughly
   ₱20,000 on every sale. 30% of *net profit* is about ₱3,000 (LAKAN II) and ₱2,260 (SIPAG I),
   which is where US$50 and US$35 come from. A fixed amount is also safer legally: "a share of
   company profit buys back the token" reads like an investment contract, and it would publish
   Naga's margins. A fixed bond per machine is a product feature anyone can verify on-chain.
2. **Trading fees go to machines that work, not to holders or stakers.** Paying a share of
   trading fees to people because they hold or stake is the clearest marker of a security under
   the Howey test the Philippine SEC applies (money in, common enterprise, profit from others'
   efforts). Paying machines for verified work is a reward for a service. Stakers keep access
   perks only. Restoring a fee share for pure stakers means registering $NAGA as a security.
3. **Renewal is a stake that comes back, not a purchase that is consumed.** "Buy and stake to keep
   receiving fees" becomes "stake your own tokens to keep your machine eligible"; the tokens are
   returned, and rewards still depend on work.
4. **Rewards language.** Always pay for the work the laptop does, with ranges, the power bill
   and the months it collects nothing. The page states the payback plainly: at ₱450 a month a
   SIPAG I needs about nine years to cover its price. Never "passive income", "earn while you sleep" without the
   fine print, "pays for itself", yield, APY or price talk.

## Legal map (Philippines)

| Topic | Position | Open question for counsel |
|---|---|---|
| Is $NAGA a security? | Designed as a utility token: immediate use, no profit promise, no pay for holding | Written classification opinion; does the Machine Rewards pool (funded by trading fees) change it? Would a per-machine cap or paying it in USDC help? |
| Public offering | SEC MC 4 and 5 (2025): disclosure document filed and public 30 days before any marketing in the Philippines | Who files when the token launches on a third-party launchpad? |
| Launch platform | Machine.Fun must be allowed to serve Philippine users, or Philippine marketing must not point buyers to it | Is Machine.Fun a registered CASP? If not: geoblock, or list through a licensed local platform |
| Marketing | Posts, pages, events, airdrops and paid promoters are all regulated; promoters of unregistered offerings face criminal liability | Review of `naga.html`, the launch thread and any KOL brief |
| Bonded laptop | A consumer product with an optional program, sold at the normal price | Does bundling the bond make the laptop an investment contract? Wording of the opt-in |
| Naga Node terms | Explicit opt-in at purchase with the "before you opt in" disclosures | Consumer Act and Data Privacy Act (partner traffic through the owner's connection), ISP terms |
| Drive wipe | Owner's responsibility, disclosed before opt-in | Is the forfeiture enforceable when Naga's own warranty repair wipes or replaces the drive? Recommend a re-link at service centers |
| Backpack for 300 stakers | A sales promotion | DTI sales promotion permit |
| School fund | 10% of creator fees, public wallet, named partner, delivery reports | DSWD solicitation permit if buyers are told their trades fund it |
| Money handling | Naga never holds customer funds; machine wallets are self-custodial; rewards are paid on-chain | Any BSP VASP licence trigger; AML |
| Tax | Creator fees are Naga's income; rewards may be income to owners | BIR treatment of fees, bonds, burns and token-paid discounts; VAT on token-priced sales |
| Other countries | Exports go worldwide | Which countries to exclude from the token (US, and others) |

## Before `naga.html` goes live

1. Counsel signs off the model and the page text.
2. The SEC disclosure document has been public for 30 days; link it on the page.
3. Confirm with Machine.Fun: chain, contract address, creator-fee rate and payout, and the
   peaqOS bonding and staking contracts. Fill "The details" on the page.
4. Build what the page promises: wallet check for the 5% discount, the Naga Node opt-in checkbox
   on the order forms (recorded with the order), the staking and bond contracts, three public
   wallets, and a rewards dashboard with real numbers.
5. Publish: remove `naga.html` from `.vercelignore`, delete its `noindex` line, add it to
   `seo/site.json`, `seo/urls.txt` and every footer, then run `npm run seo`.

## Sources

- SEC MC 4 and 5 (2025), CASP rules: https://insightplus.bakermckenzie.com/bm/technology-media-telecommunications_1/philippines-sec-issues-rules-and-guidelines-on-crypto-asset-service-providers-casp
- Public offering and marketing rules: https://www.ocamposuralvo.com/2025/09/29/sec-issues-the-rules-on-crypto-asset-service-providers-relevant-to-its-public-offering-and-marketing/
- Marketing scope, airdrops, promoters: https://bitpinas.com/regulation/ph-sec-crypto-rules-airdrops-events-content
- Howey test and utility tokens in the Philippines: https://www.respicio.ph/commentaries/are-digital-assets-required-to-be-registered-with-the-sec-in-the-philippines
- SEC advisories on unregistered platforms and promoter liability: https://www.manilatimes.net/2026/04/22/business/top-business/sec-warns-vs-cryptocurrency-platforms/2325249
- peaq on token models (bonding, buy-and-burn, stablecoins), as quoted in: https://cryptoast.fr/crypto-robotique-opportunite-esbroufe-analyse-projets/
- Machine.Fun (built on Raydium LaunchLab, supported by peaq): https://x.com/machinedotfun
