# Naga Node

The app that runs on a Naga laptop and puts it on peaqOS. Version 0.1 is a prototype: it creates the laptop's
wallet, quotes and sends the peaqOS activation, turns the node on and off, and reports the laptop online.
It connects no paid work yet, so a laptop running it earns nothing today.

It lives in this repo for now and is not part of the website (`.vercelignore` leaves it out).

## Run it

Needs Node.js 22 or newer.

```bash
cd naga-node
npm install
npm start            # dashboard at http://127.0.0.1:4747
npm test             # no network needed
```

From the terminal: `node bin/naga-node.js help` lists `init`, `status`, `preview`, `activate`, `on`, `off`, `phrase`.
Everything the app keeps is in `~/.naga-node` (set `NAGA_NODE_HOME` to move it).

## What it does

| Step | What happens | Where |
|---|---|---|
| Wallet | One 12-word phrase gives a peaq address (identity) and a Solana address (USDC rewards). Stored with scrypt and AES-256-GCM | `src/vault.js` |
| Machine anchor | Hashes the laptop's serial into the bytes peaq derives the machine ID from. Saved on first read | `src/anchor.js` |
| Quote | Asks peaq for the bond at today's rate. Signs and sends nothing | `Peaq.preview` |
| Activate | One transaction from the laptop's own wallet: peaqID, machine NFT, one-year PEAQ bond. Naga's operator address is recorded as controller | `NagaNode.activate` |
| Switch on | Signs the monetization opt-in at `mcr.peaq.xyz` (no gas) and starts a heartbeat to `heartbeat.peaq.xyz` every 60 s | `NagaNode.switchOn` |
| Switch off | Stops the heartbeat and opts out. peaq marks the laptop offline after 180 s | `NagaNode.switchOff` |
| Work record | Counts accepted heartbeats per day in `worklog.json` | `NagaNode.onBeat` |

Safety rules in the code: off until the owner turns it on; one activation per laptop, with a lock that survives
a transaction whose receipt did not arrive; the phrase is shown once and never returned by the state API; the
dashboard listens on 127.0.0.1, checks the Host header and needs a page token for every change; peaq's SDK
telemetry (PostHog) is switched off.

## Checked against peaq mainnet on 14 November 2026

- The wallet derives the same peaq and Solana addresses as peaq's own vault (OWS) from the same phrase.
- The machine ID computed here equals the SDK's.
- A quote for a new laptop: Entry tier bond 0.8017 PEAQ for one year, plus 0.05 PEAQ kept for gas.
- The opt-in API answers with protocol `tokenomics-2.0-monetization-v1`; an unknown machine reads `MACHINE_NOT_FOUND`.
- The heartbeat service accepts an EIP-191 signature with the uncompressed secp256k1 public key.

Not run: a real activation, opt-in and a heartbeat for an activated machine. They need a wallet holding PEAQ.

## What the peaq docs say that changes our plan

Read on 14 November 2026 from docs.peaq.xyz (peaqOS, SDK 0.12.0).

1. **peaq's bond is in PEAQ, and it is small.** Activation bonds PEAQ on a tier priced per year: Entry US$0.02,
   Basic US$0.20, Pro US$40. It is not withdrawable. peaqOS has no notion of a $NAGA bond. Our US$50 / US$35
   $NAGA lock is a second, separate mechanism that Naga has to build on Solana (a lock keyed to the machine ID).
   On peaqOS, "bonded" means the PEAQ tier bond.
2. **Home the laptops on peaq, not Solana.** A machine homed on Solana is refused the monetization opt-in
   (`SOLANA_MONETIZATION_UNVERIFIED`). So the laptop's identity sits on peaq and only its rewards address is on
   Solana. This app does that.
3. **peaqOS supplies no bandwidth work.** Monetize v1 covers one kind of work, compute, through one network,
   Akash, and calls itself an early release that is "not yet hardened for production scale". An Akash provider
   needs a server setup (Kubernetes, a public address), which a consumer laptop on home internet is not. Paid
   bandwidth work has to come from a bandwidth network Naga signs with directly. peaqOS then holds the identity
   and the record of that work.
4. **peaq's docs give no earnings figure.** The US$0.50 to US$3 a day figure is not in them.
5. **The work record is ours to write.** Revenue and activity events go on chain only when the machine's owner
   or controller submits them. Events we submit about our own laptops are "self-reported", the lowest trust
   level. Heartbeat presence is not proof either: the service accepted a heartbeat for a machine ID that does
   not exist, signed by a key it had never seen.
6. **No operator-paid activation.** The account that signs the activation owns the machine and pays. For a
   fleet, each laptop signs its own activation and Naga's operator address is its controller: it can suspend,
   resume, renew and update the DID, and cannot move the machine. Naga funds each laptop's wallet first
   (about 0.85 PEAQ at Entry), from the Gas Station (2FA) or a treasury wallet.
7. **A wiped drive is worse than the site says.** The machine ID comes from the laptop's serial, and an ID can
   be activated once. If the wallet is lost, the same laptop cannot be activated again under that ID, and Naga
   as controller cannot move the machine NFT. The recovery phrase is the only way back.
8. **peaq's wallet vault has no Windows build** (Linux and macOS only), so this app keeps its own vault with the
   same derivation paths.
9. **Hardware attestation is out of reach for now.** Verify accepts one chip, the Infineon OPTIGA Trust M
   Express. A laptop TPM does not count.

## Decisions needed from Naga

- **Operator wallet.** Create Naga's operator address (a hardware wallet or a multisig-controlled key) and set
  it as `operator` and `manufacturer` in the config. Until then a laptop is its own controller.
- **Tier.** Entry (US$0.02 a year) is the default. Higher tiers earn more bonding points, which only reduce the
  next renewal.
- **Where paid work comes from.** Name the bandwidth network. Without one, Naga Node reports presence only.
- **How work is measured for Machine Rewards.** Heartbeats are easy to fake. The measure should be the pay a
  network reports for a laptop, since the site already caps rewards at twice network pay.
- **Who funds the PEAQ bond and when:** at the factory before shipping, or on first run.
- **Where this app lives.** It is in the website repo for now. It should move to its own repository before a
  release.

## Next

1. One real activation on mainnet with a funded test wallet (under US$0.05 of PEAQ), then opt-in and heartbeat.
2. An operator service: holds the fleet index (peaq does not list a fleet), funds new wallets, submits the
   monthly work events, and feeds the Machine Rewards payout.
3. A bandwidth network integration, once named.
4. The $NAGA lock on Solana, keyed to the machine ID.
5. Packaging: a signed installer for the OS the laptops ship with, starting with the heartbeat as a background service.
