# LAKAN II vs RTX 5060 rivals: Philippine fact sheet

Compiled and every source accessed: **2026-11-11**. Re-verify all prices before publishing; PH retailers reprice weekly.

## How this was gathered (read first)

- **Live page loads were blocked.** This session's network could not open villman.com or pcx.com.ph directly (DNS blocked by the sandbox), so no retailer or brand page was opened in a browser. Every figure below comes from **search-engine index text (cached snippets) of the cited URL**. That text can be days or months older than the live page. Treat every price as "listed at some point, seen in the index on 2026-11-11", not "current price".
- **Source labels** in each row:
  - `OFFICIAL`: manufacturer page (ASUS, Acer, Lenovo PSREF, MSI store)
  - `RETAIL`: PH retailer listing
  - `REVIEW`: review outlet or aggregator (Notebookcheck, LaptopMedia, Tom's Hardware and others)
  - `DB`: spec database (nanoreview), the weakest source
- **UNVERIFIED** means one weak source, or sources that conflict. Do not publish an UNVERIFIED figure as fact.
- I did **not** fetch the full text of any review. The drawbacks come from review summaries, Notebookcheck's pros and cons, and index text. Quote reviewers only after you open the article.

## Shortlist and why

| Picked | SKU sold in PH | Why it is a fair rival |
|---|---|---|
| Lenovo LOQ 15 (Gen 10) | 15AHP10 **83JG00C4PH** | The cheapest well-known RTX 5060 15.6" model; Lenovo is the volume leader |
| MSI Katana 15 HX | **B14WFK-880PH** | Same price band, 15.6", HX CPU, QHD panel |
| ASUS TUF Gaming A16 (2025) | **FA608UM-RV069W** | The RTX 5060 TUF actually sold in PH, from ASUS PH's own page |
| Acer Nitro 16S AI (sold as "Nitro 16 Slim") | **AN16S-61-R24N** | Acer PH's RTX 5060 Nitro; same price band |

**Dropped:**
- **ASUS TUF A15 / F15:** I found no RTX 5060 config in PH. The A15/F15 listings found carry RTX 2050 to 4060. ASUS's RTX 5060 TUF models in PH are the A16 and the F16. The F16 FX608JMR-RV314WSM (i7-14650HX, 1TB) is listed at Villman at ₱104,995 (RETAIL, villman.com, snippet), but I did not research it further.
- **HP Victus 15/16:** I found no PH RTX 5060 listing. PH Victus stock seen is RTX 5050 or older; the RTX 5060 Victus appears only in US listings (Best Buy, Walmart).
- **Acer Nitro V 15 (ANV15-52) RTX 5060:** acer.com/ph-en lists a Core 7 + RTX 5060 option with no price, and I found no PH retailer price. A UniPC guide says the RTX 5060 Nitro in its catalog is the 16" AN16S-61-R24N.
- **Acer Nitro 5:** discontinued, per Unicorp's 2026 guide.

## Naga LAKAN II (our baseline, from the brief, not researched)

| Field | Value |
|---|---|
| Base | Clevo V255RNN1 |
| CPU | Intel Core 7 250H (up to 5.4 GHz) |
| GPU / max TGP | RTX 5060 Laptop 8GB GDDR7, up to 115 W |
| RAM | 16GB DDR5-5600 (**confirm 1x16 or 2x8**; see the single-channel note under LOQ) |
| SSD | 512GB PCIe Gen4 |
| Display | 15.6" (resolution and refresh not yet confirmed) |
| Keyboard | One-zone RGB |
| Price | ₱89,900, includes the Naga Karga backpack |
| Weight, battery, warranty | Not in the brief; fill these in before publishing a comparison table |

---

## 1. Lenovo LOQ 15 (Gen 10), 15AHP10, 83JG00C4PH

| Field | Value | Source | Label | Confidence |
|---|---|---|---|---|
| CPU | AMD Ryzen 7 250 | [S1], [S2], [S4] | RETAIL | high |
| GPU | RTX 5060 Laptop 8GB GDDR7, boost 2497 MHz | [S5] | OFFICIAL (PSREF) | high |
| GPU max TGP | **100 W** (PSREF). PCWorld and nanoreview say 115 W; Lenovo's figure wins | [S5], [S6] | OFFICIAL | high for 100 W |
| RAM | 16GB DDR5-5600 in **one** SO-DIMM (single-channel); 2 slots, up to 32GB | [S4], [S5], [S7] | OFFICIAL + REVIEW | high |
| SSD | 512GB; second M.2 slot present. PCIe generation for this SKU UNVERIFIED | [S1], [S7] | RETAIL/REVIEW | medium |
| Display | 15.6" FHD 1920x1080 IPS, 300 nits, 100% sRGB, 144 Hz, G-SYNC, anti-glare | [S5] | OFFICIAL (PSREF, family page) | high |
| Weight | Starting at 2.4 kg | [S5] | OFFICIAL | high |
| Battery | 60 Wh (80 Wh exists on other SKUs). The 83JG00C4PH has the 60 Wh pack per a retailer; not confirmed on PSREF for this exact SKU | [S5], [S4] | OFFICIAL + RETAIL | medium (60 Wh) |
| Warranty (PH) | 1-year base, courier or carry-in (PSREF base; PH retailers show 1 year). Premium Care upgrades exist; terms vary | [S5], [S8] | OFFICIAL + RETAIL | medium |
| PH price | Varies. Unicorp **₱75,499** (from ₱78,699); Netcodex ₱76,995 (from ₱88,540); PC Express ₱79,995 sale (from ₱82,995), though another PCX page shows ₱83,995; Villman ₱82,995; Home Credit "from ₱72,995" | [S2], [S1], [S3], [S9], [S10] | RETAIL (snippets) | medium. Band is about ₱75k to ₱83k |
| Availability | **Being replaced.** Unicorp's 2026 guide says the LOQ 15AHP11 replaced the 15AHP10; the remaining stock is old | [S11] | RETAIL blog | medium |

**Drawbacks (REVIEW):**
1. **Single-channel memory as shipped** (one 16GB stick, second slot empty), which Notebookcheck flags as a weakness. PC Gamer calls the single-channel RAM and 512GB SSD underwhelming. [S7], [S12]
2. **Display ghosting and motion blur** in some test reports, plus limited battery life; this comes from Notebookcheck's aggregated summary. GPU TGP is 100 W, below the 115 W some rivals run. [S7], [S5]

> **Fairness note for our page:** if LAKAN II also ships 16GB as 1x16GB, do not use "single-channel" against LOQ. Confirm LAKAN's DIMM layout first.

**Successor to watch: LOQ 15AHP11 (83TN005HPH).** PSREF lists a 15.3" WUXGA 165 Hz panel, RTX 5060 at 115 W, Ryzen 7 250 and a 60 Wh battery on at least one SKU [S13]. **The GPU in PH stock is UNVERIFIED:** PC Express and Unicorp list the 83TN005HPH with an **RTX 5050**, while Villman's title says RTX 5060 [S14], [S11], [S15]. Price is also UNVERIFIED: ₱74,995 to ₱99,900 across sellers.

---

## 2. MSI Katana 15 HX, B14WFK-880PH

| Field | Value | Source | Label | Confidence |
|---|---|---|---|---|
| CPU | Intel Core i7-14650HX (16 cores) | [S16], [S17] | RETAIL | high |
| GPU | RTX 5060 Laptop 8GB GDDR7 | [S16], [S18] | RETAIL | high |
| GPU max TGP | **115 W** (with Dynamic Boost). Not seen on an msi.com page | [S19], [S20] | RETAIL / REVIEW / DB | medium, UNVERIFIED on MSI's own site |
| RAM | 16GB DDR5-5600; 2 slots; MSI store says up to 96GB. The DIMM layout of the PH SKU (1x16 or 2x8) is UNVERIFIED | [S21], [S16] | OFFICIAL (MSI MY store, family) | medium |
| SSD | 512GB NVMe. PCIe Gen4 per EU listings of the same family; PH SKU UNVERIFIED | [S16], [S22] | RETAIL | medium |
| Display | 15.6" QHD 2560x1440, 165 Hz, IPS-level. EU listings say 100% DCI-P3; PH SKU UNVERIFIED | [S16], [S17], [S22] | RETAIL | high (res/Hz) |
| Weight | 2.4 kg | [S23], [S24] | REVIEW | high |
| Battery | 75 Wh, 240 W adapter | [S21], [S20] | OFFICIAL (MSI store) + DB | high |
| Warranty (PH) | Retailers list "2 years limited" for the B14WFK-893PH/-1046PH siblings. MSI PH says terms vary by product and channel. For -880PH: UNVERIFIED | [S25], [S26], [S27] | RETAIL | low to medium |
| PH price | Unicorp **₱84,399** (from ₱87,999); iTech ₱87,995 (in stock); Game One ₱87,995 (from ₱92,955); Datablitz ₱87,995 / ₱92,995; PC Express ₱92,995; Silicon Valley ₱92,995 (out of stock) | [S17], [S28], [S29], [S30], [S31] | RETAIL (snippets) | medium. Band is about ₱84k to ₱93k |
| Bundle | Datablitz bundles include an MSI Essential backpack (some include an M99 Pro mouse) | [S30] | RETAIL | medium |

**Drawbacks (REVIEW):**
1. **Dim screen.** Tom's Guide calls the QHD panel a little dim and slightly washed out at peak brightness, and RTINGS rates it bright enough for indoor use only. Tom's Hardware measured 257 nits, but on an RTX 5050 unit whose panel may differ, so **do not quote 257 nits for the B14WFK**. [S32], [S33], [S34]
2. **Short battery life, loud fans and weight.** Tom's Guide calls battery life "nothing to write home about". RTINGS reports fans audible even at idle, a hot keyboard and a thick, heavy chassis (2.4 kg). Notebookcheck's sibling (B14WGK) review lists budget chassis materials and a 720p webcam. [S32], [S33], [S24]

---

## 3. ASUS TUF Gaming A16 (2025), FA608UM-RV069W

| Field | Value | Source | Label | Confidence |
|---|---|---|---|---|
| CPU | AMD Ryzen 7 260 | [S35], [S36] | OFFICIAL (ASUS PH) + RETAIL | high |
| GPU | RTX 5060 Laptop 8GB GDDR7 | [S35], [S37] | OFFICIAL | high |
| GPU max TGP | **115 W** including Dynamic Boost (ASUS: 100 W + 15 W; the Baltic page phrases it as "55 W base, up to 115 W"). Nanoreview's 140 W is for another config; ignore it | [S37], [S38] | OFFICIAL | high |
| RAM | 16GB DDR5-5600 SO-DIMM, up to 64GB (ASUS PH spec); 2 slots per nanoreview. **Conflict:** one LaptopMedia config summary calls the memory soldered, so check the RV069W | [S39], [S40], [S41] | OFFICIAL + DB + REVIEW | medium |
| SSD | 512GB NVMe (generation UNVERIFIED for the PH SKU) | [S35], [S36] | RETAIL/OFFICIAL | medium |
| Display | 16" FHD+ 1920x1200 16:10 IPS-level, anti-glare, 100% sRGB. **Refresh conflict:** ASUS PH spec page shows 144 Hz for the FA608UM; iTech's RV069W listing says 165 Hz, 3 ms. UNVERIFIED | [S39], [S36] | OFFICIAL vs RETAIL | low (Hz) |
| Weight | 2.20 kg | [S42], [S43] | OFFICIAL | high |
| Battery | 90 Wh, 4-cell | [S37] | OFFICIAL | high |
| Warranty (PH) | **2 years local and international** for TUF Gaming laptops under the ASUS No. 1 Quality & Service Program (effective 8 June 2026), plus 1-year Local Accidental Damage Protection on eligible laptops. Press coverage, not the ASUS warranty page itself | [S44], [S45] | PRESS | medium to high |
| PH price | **ASUS PH: "starting at ₱92,995"**; Home Credit from ₱92,995; iTech ₱88,995 (out of stock); Denvers ₱88,345 sale (reg. ₱92,995); PC Express shows both ₱89,295 and ₱118,995 on different pages (conflict) | [S35], [S46], [S36], [S47], [S48] | OFFICIAL + RETAIL | high for the ₱92,995 SRP |

**Drawbacks (REVIEW):**
1. **Low resolution for a 16" screen.** LaptopMedia names the 1920x1200 panel as its only serious drawback. [S41]
2. **Value is questioned at full price.** PC Gamer, as aggregated by Notebookcheck, scored it 70% with a 50% price subscore ("if it was only just a little bit cheaper"). Also check whether the RAM is soldered or SO-DIMM on the RV069W before claiming either way. [S49], [S41]

> Strength to state honestly: 90 Wh battery and 2.2 kg (LaptopMedia headline: "A 14-hour battery... on a gaming laptop?!" [S50]), plus a 2-year PH warranty.

---

## 4. Acer Nitro 16S AI ("Nitro 16 Slim" in PH), AN16S-61-R24N

| Field | Value | Source | Label | Confidence |
|---|---|---|---|---|
| CPU | AMD Ryzen AI 7 350 (8 cores) | [S51], [S52] | OFFICIAL (Acer PH store) + RETAIL | high |
| GPU | RTX 5060 Laptop 8GB GDDR7 | [S51], [S52] | OFFICIAL | high |
| GPU max TGP | **115 W** per Notebookcheck's AN16S-61 RTX 5060 entry; one Acer AN16S-61 page also shows 115 W. **Not seen on the PH SKU page**, so UNVERIFIED. Do not confuse it with the Nitro **V** 16S AI (ANV16S-61), which is 85 W | [S53], [S54], [S55] | REVIEW + OFFICIAL (other SKU) | medium |
| RAM | 1x16GB DDR5 (single SO-DIMM), upgradable to 32GB across 2 SO-DIMMs. Speed UNVERIFIED | [S52] | RETAIL | medium |
| SSD | 512GB NVMe (generation UNVERIFIED) | [S51], [S52] | RETAIL | medium |
| Display | 16" WQXGA 2560x1600 16:10 IPS, 180 Hz | [S51], [S52], [S56] | OFFICIAL + RETAIL | high |
| Weight | About 2.18 kg (Acer AN16S-61-R9TK page; nanoreview) | [S57], [S58] | OFFICIAL (other SKU) + DB | medium |
| Battery | 76 Wh, 4-cell | [S57], [S52] | OFFICIAL (family) + RETAIL | high |
| Warranty (PH) | Villman lists 2 years. Acer PH's warranty table shows "Gaming Notebook: 2 years", but the same page also states a general 1-year standard. Probably 2 years; confirm | [S59], [S60] | RETAIL + OFFICIAL | medium |
| PH price | **Acer PH store: ₱94,999 special** (regular ₱99,999, in stock); Datablitz ₱89,995 (bundle with Acer VX15 backpack); Bermorzone ₱91,995; Villman ₱91,999; Gigahertz ₱99,999; PC Express ₱104,999; UniPC ₱85,399 (Aug 2026 guide; product page shows out of stock) | [S51], [S56], [S61], [S59], [S62], [S63] | OFFICIAL + RETAIL | high for ₱94,999 at Acer store, as indexed |

**Drawbacks (REVIEW):**
1. **The RTX 5060 struggles at the panel's native 1600p.** TweakTown: "RTX 5060 not quite powerful enough for the WQXGA 1600p display". [S64]
2. **Keyboard bounce, and an IPS panel without OLED punch** (Notebookcheck's cons). Pickr calls battery life "less than stellar" and the power brick large, while Trusted Reviews (via Notebookcheck) found battery life surprisingly strong. Reviewers disagree, so do not claim either. [S53], [S65]

---

## Side by side (for drafting only; recheck before publishing)

| | LAKAN II | LOQ 15AHP10 | Katana 15 HX B14WFK-880PH | TUF A16 FA608UM-RV069W | Nitro 16S AI AN16S-61-R24N |
|---|---|---|---|---|---|
| CPU | Core 7 250H | Ryzen 7 250 | i7-14650HX | Ryzen 7 260 | Ryzen AI 7 350 |
| RTX 5060 max TGP | 115 W | **100 W** | 115 W (UNVERIFIED on msi.com) | 115 W (incl. boost) | 115 W (UNVERIFIED for PH SKU) |
| RAM | 16GB DDR5-5600 | 16GB DDR5-5600, 1 stick | 16GB DDR5-5600 | 16GB DDR5-5600 | 16GB DDR5, 1 stick |
| Max RAM | ? | 32GB | 96GB | 64GB (soldered? check) | 32GB |
| SSD | 512GB Gen4 | 512GB | 512GB | 512GB | 512GB |
| Screen | 15.6" (TBC) | 15.6" FHD 144 Hz | 15.6" QHD 165 Hz | 16" 1920x1200, 144 or 165 Hz (conflict) | 16" 2560x1600 180 Hz |
| Weight | ? | 2.4 kg | 2.4 kg | 2.2 kg | ~2.18 kg |
| Battery | ? | 60 Wh | 75 Wh | 90 Wh | 76 Wh |
| PH warranty | ? | 1 yr base | 2 yr (retailer-stated, UNVERIFIED) | 2 yr + 1 yr ADP | 2 yr (probable) |
| PH price seen | ₱89,900 + backpack | ₱75.5k to ₱83k (old stock) | ₱84.4k to ₱93k | ₱88.3k to ₱93k (SRP ₱92,995) | ₱85.4k to ₱105k (Acer store ₱94,999) |

**Honest read:** LAKAN II is not the cheapest; the LOQ undercuts it by roughly ₱7k to ₱15k but runs the RTX 5060 at 100 W. On TGP, LAKAN II only matches the field: three of four rivals also list 115 W. Where it can differ: its price includes a backpack, and so do some Datablitz bundles of the Katana and Nitro. Rivals win on screens (Katana QHD, Nitro 1600p 180 Hz), battery (TUF 90 Wh) and established 2-year PH warranties. Fill in LAKAN's weight, battery, panel and warranty before claiming anything in those rows.

---

## Sources (all accessed 2026-11-11, via search-engine index text; pages not opened live)

- [S1] Netcodex, LOQ 15AHP10 83JG00C4PH: https://netcodex.ph/product/lenovo-loq-15ahp10-15-6-inch-fhd-144hz-amd-ryzen-7-rtx-5060-gaming-laptop-83jg00c4ph/
- [S2] Unicorp, LOQ 15AHP10 83JG00C4PH (₱75,499): https://unicorp.ph/shop/laptops/gaming/lenovo-loq-15ahp10-83jg00c4ph
- [S3] PC Express, LOQ 15AHP10 83JG00C4PH: https://pcx.com.ph/products/lenovo-loq-15ahp10-83jg00c4ph-geforce-rtx-5060-amd-ryzen-7-laptop-luna-grey
- [S4] PC Central, 83JG00C4PH listing (1 SODIMM, 60 Wh): https://pccentralcomputerstore.com/products/lenovo-loq-83jg00c4ph-15-6-laptop-1920x1080-144hz-display-amd-ryzen-7-250-512gb-pcie-nvme-ssd-16gb-ddr5-nvidia-rtx-5060-8gb-win-11-home-pc-central
- [S5] Lenovo PSREF, LOQ 15AHP10: https://psref.lenovo.com/Product/LOQ/LOQ_15AHP10?MT=83JG ; spec PDF https://psref.lenovo.com/syspool/Sys/PDF/LOQ/LOQ_15AHP10/LOQ_15AHP10_Spec.pdf ; model page https://psref.lenovo.com/Detail/LOQ_15AHP10?M=83JG004BBM
- [S6] PCWorld, Lenovo LOQ 15 review: https://www.pcworld.com/article/2934656/lenovo-loq-15-review-3.html
- [S7] Notebookcheck, LOQ 15AHP10 reviews page: https://www.notebookcheck.net/Lenovo-LOQ-15AHP10.1161528.0.html (CN summary: https://www.notebookcheck-cn.com/LOQ-15AHP10.1161538.0.html)
- [S8] Villman/PCWorx LOQ warranty lines: https://pcworx.ph/collections/lenovo-loq ; Philstartech on Premium Care: https://philstartech.com/news/2024/06/25/5676/lenovo-legion-introduces-2024-lineup-of-next-gen-gaming-devices/
- [S9] Villman, LOQ 15AHP10 83JG00C4PH (₱82,995): https://villman.com/Product-Detail/lenovo_loq-15ahp10-83jg00c4ph--156in-fhd-144hz--amd-ryzen-7-250--16gb-ddr5--512gb-ssd--rtx-5060-8gb--win11-home
- [S10] Home Credit Shopping Mall, 83JG00C4PH: https://shoppingmall.homecredit.ph/installment-deals/lenovo/lenovo-loq-15ahp10-83jg00c4ph-gaming-laptop-amd-ryzen-7-250-512gb-luna-grey
- [S11] Unicorp blog, Every Lenovo LOQ in the Philippines 2026: https://unicorp.ph/blog/lenovo-loq-philippines-2026
- [S12] PC Gamer, LOQ 15 Gen10 review: https://www.pcgamer.com/hardware/gaming-laptops/lenovo-loq-15-gen10-review
- [S13] Lenovo PSREF, LOQ 15AHP11: https://psref.lenovo.com/Product/LOQ/LOQ_15AHP11 ; https://psref.lenovo.com/Detail/LOQ_15AHP11?M=83TN002JRM
- [S14] PC Express, LOQ 15AHP11 83TN005HPH (RTX 5050): https://pcx.com.ph/collections/all-products/products/lenovo-loq-15ahp11-83tn005hph-geforce-rtx-5050-amd-ryzen-7-laptop-luna-grey
- [S15] Villman, LOQ 15AHP11 83TN005HPH (titled RTX 5060): https://villman.com/Product-Detail/lenovo_loq-15ahp11-83tn005hph--153in-wuxga-165hz--amd-ryzen-7-250--16gb-ddr5--512gb-ssd--gf-rtx-5060-8gb--win11
- [S16] Datablitz, Katana 15 HX B14WFK-880PH: https://ecommerce.datablitz.com.ph/products/msi-katana-15-hx-b14wfk-880ph-gaming-laptop-black-15-6-qhd-2560x1440-165hz-ips-core-i7-14650hx-16gb-ram-512gb-ssd-rtx-5060-windows-11-home-msi-essential-backpack
- [S17] Unicorp, Katana 15 HX B14WFK-880PH (₱84,399): https://unicorp.ph/shop/laptops/gaming/msi-katana-15-hx-b14wfk-880ph
- [S18] CGMagazine, Katana 15 HX B14WFK review: https://www.cgmagonline.com/review/hardware/msi-katana-15-hx-b14wfk-gaming-laptop
- [S19] Silicon Computer, B14WFK-246XEG (TGP up to 115 W): https://www.silicon-computer.com/product-page/msi-katana-15-hx-b14wfk-246xeg-core-i7-14650hx-rtx-5060-8gb-16gb-512gb-nvme-15-6
- [S20] nanoreview, MSI Katana 15 (2025): https://nanoreview.net/en/laptop/msi-katana-15-2025
- [S21] MSI Malaysia store, Katana 15 HX B14WFK-289MY: https://my-store.msi.com/products/msi-katana-15-hx-b14wfk-289-gaming-laptop
- [S22] Sigma Computer, B14WFK-245EG (QHD 165 Hz, 100% DCI-P3, PCIe 4.0): https://sigma-computer.com/en/item?id=msi-katana-15-hx-b14wfk-245eg-intel-core-i9-14900hx-nvidia-rtx-5060-8gb-16gb-ddr5-5600mhz-1tb-nvme-pcie-40-156-inch-qhd-ips-165hz-windows-11-wq6kdzceuwnc
- [S23] PC Guide, Katana 15 HX B14WFK review: https://www.pcguide.com/laptop/review/msi-katana-15-hx-b14wfk/
- [S24] Notebookcheck, Katana 15 HX B14WFK page: https://www.notebookcheck.net/MSI-Katana-15-HX-B14WFK.1237787.0.html ; B14WGK cons: https://www.notebookcheck.net/MSI-Katana-15-HX-B14WGK-i7-14650HX.1243320.0.html
- [S25] Villman, Katana 15 HX B14WFK-893PH (2 years limited): https://villman.com/Product-Detail/msi_katana-15-hx-b14wfk-893ph--intel-core-i9-14900hx--156in-qhd-165hz--16gb-ddr5--512gb-ssd--rtx-5060-8gb--win11
- [S26] Datablitz, Katana 15 HX B14WFK-1046PH: https://ecommerce.datablitz.com.ph/products/msi-katana-15-hx-b14wfk-1046ph-gaming-laptop-black-15-6-qhd-2560x1440-165hz-core-i9-14900hx-16gb-ram-512gb-ssd-rtx-5060-windows-11-home-msi-essential-backpack-msi-m99-pro-mouse
- [S27] MSI Philippines (warranty varies by product and channel): https://ph.msi.com/llms-full.txt
- [S28] iTech, Katana 15 HX B14WFK-880PH: https://www.itech.ph/product/msi-katana-15-hx-b14wfk-880ph-gaming-laptop-15-6-qhd-core-i7-14650hx-16gb-ram-rtx-5060-512gb-ssd/
- [S29] Game One, Katana 15 HX B14WFK-880PH: https://gameone.ph/msi-katana-15-hx-b14wfk-880ph-gaming-laptop-15-6-qhd-core-i7-14650hx-16gb-ram-rtx-5060-512gb-ssd.html
- [S30] Datablitz, same as [S16]; and B14WFK-285PH bundle: https://ecommerce.datablitz.com.ph/products/msi-katana-15-hx-b14wfk-285ph-gaming-laptop-black-15-6-qhd-2560x1440-165hz-core-i7-14650hx-16gb-ram-512gb-ssd-rtx-5060-windows-11-home-msi-essential-backpack-msi-m99-pro-gaming-mouse
- [S31] Silicon Valley PH, B14WFK-880PH: https://siliconvalley.com.ph/product/msi-15-6-katana-15-hx-b14wfk-880ph-black-intel-core-i7-14650hx-16gb-ram-512gb-ssd-rtx5060-gddr7-8gb-windows-11/ ; PC Express Katana 15 HX collection: https://pcx.com.ph/collections/gaming-laptops/katana-15-hx
- [S32] Tom's Guide, Katana 15 HX B14W review: https://www.tomsguide.com/computing/gaming-laptops/msi-katana-15-hx-b14w-review
- [S33] RTINGS, MSI Katana 15 HX (2025): https://www.rtings.com/laptop/reviews/msi/katana-15-hx-2025
- [S34] Tom's Hardware, Katana 15 HX (RTX 5050) review: https://www.tomshardware.com/laptops/gaming-laptops/msi-katana-15-hx-review
- [S35] ASUS Philippines, TUF Gaming A16 (2025): https://www.asus.com/ph/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/
- [S36] iTech, TUF A16 FA608UM-RV069W: https://www.itech.ph/product/asus-tuf-gaming-a16-fa608um-rv069w-jaeger-gray-16-fhd-165hz-ips-ryzen-7-260-16gb-ram-512gb-ssd-rtx-5060/
- [S37] ASUS Baltics, TUF A16 (2025) tech specs: https://www.asus.com/bt/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/techspec/
- [S38] ASUS Middle East, TUF A16 (2025) tech specs: https://www.asus.com/me-en/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/techspec/
- [S39] ASUS Philippines, TUF A16 (2025) tech specs: https://www.asus.com/ph/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/techspec/
- [S40] nanoreview, ASUS TUF Gaming A16 FA608: https://nanoreview.net/en/laptop/asus-tuf-gaming-a16-fa608
- [S41] LaptopMedia, TUF Gaming A16 config review summaries: https://laptopmedia.com/laptop-specs/asus-tuf-gaming-a16-304/review/ and https://laptopmedia.com/laptop-specs/asus-tuf-gaming-a16-305/review/
- [S42] ASUS global, TUF A16 (2025) tech specs (2.20 kg): https://www.asus.com/laptops/for-gaming/tuf-gaming/asus-tuf-gaming-a16-2025/techspec/
- [S43] ASUS US eShop, FA608UMI-NB73: https://eshop.asus.com/us/90nr0kv1-m00fb0-asus-tuf-gaming-a16-2025.html
- [S44] Pinoy Metro Geek, ASUS expanded warranty PH (June 2026): https://www.pinoymetrogeek.com/2026/06/asus-enhanced-warranty-service-philippines.html
- [S45] Unbox PH, ASUS No.1 Quality & Service program: https://unbox.ph/news/asus-quality-service-program-philippines/
- [S46] Home Credit Shopping Mall, TUF A16 FA608UM-RV069W: https://shoppingmall.homecredit.ph/installment-deals/asus/asus-tuf-a16-fa608um-rv069w-gaming-laptop-amd-ryzen-7-260-512gb-16gb-jaeger-gray
- [S47] Denvers PH notebooks: https://www.denversph.com/notebooks
- [S48] PC Express, TUF A16 FA608UM-RV069W: https://pcx.com.ph/products/asus-tuf-gaming-a16-fa608um-rv069w-90nr0kv1-m009s0-geforce-rtx-5060-amd-ryzen-7-laptop-jaeger-gray ; collection https://pcx.com.ph/collections/asus-1/fa608um-rv069w
- [S49] Notebookcheck, TUF Gaming A16 FA608UM page (aggregates PC Gamer and others): https://www.notebookcheck.net/Asus-TUF-Gaming-A16-FA608UM.1185477.0.html
- [S50] LaptopMedia, TUF Gaming A16 (FA608, 2025) review: https://laptopmedia.com/review/asus-tuf-gaming-a16-fa608-2025-review-a-14-hour-battery-on-a-gaming-laptop/
- [S51] Acer Philippines Store, Nitro 16 Slim AN16S-61-R24N: https://store.acer.com/en-ph/nitro-16-slim-an16s-61-r24n-opi-obsidian-black
- [S52] Gigahertz, Nitro 16 Slim AN16S-61-R24N: https://www.gigahertz.com.ph/products/acer-nitro-16-slim-an16s-61-r24n-16in-wqxga-180hz-ryzen-ai-7-350-16gb-ddr5-512gb-ssd-rtx-5060-8gb-win11
- [S53] Notebookcheck, Acer Nitro 16S AI AN16S-61: https://www.notebookcheck.net/Acer-Nitro-16S-AI-AN16S-61.1241808.0.html
- [S54] Acer US, Nitro V 16S AI ANV16S-61-R9TR tech specs (85 W, a different model): https://www.acer.com/us-en/laptops/nitro/nitro-v-16s-ai-amd/pdp/NH.U0EAA.002
- [S55] Tom's Hardware, Acer Nitro V 16S AI review (85 W, a different model): https://www.tomshardware.com/laptops/gaming-laptops/acer-nitro-v-16s-ai-review
- [S56] Datablitz, Nitro 16S AI AN16S-61-R24N: https://ecommerce.datablitz.com.ph/products/acer-nitro-16s-ai-an16s-61-r24n-gaming-laptop-obsidian-black-16-wqxga-2560x1600-180hz-ips-ryzen-ai-7-350-16gb-ram-512gb-ssd-rtx-5060-windows-11-home-acer-vx15-backpack
- [S57] Acer UK, Nitro 16S AI AN16S-61-R9TK tech specs (76 Wh, 2.18 kg): https://www.acer.com/gb-en/laptops/nitro/nitro-16s-ai-amd/pdp/NH.U06EK.003
- [S58] nanoreview, Acer Nitro 16S AI (AN16S-61): https://nanoreview.net/en/laptop/acer-nitro-16s-ai-an16s-61
- [S59] Villman, Nitro 16 Slim AN16S-61-R24N: https://villman.com/Product-Detail/acer-nitro_16-slim-an16s-61-r24n--16in-wqxga-180hz--ryzen-ai-7-350--16gb-ddr5--512gb-ssd--rtx-5060-8gb--win11
- [S60] Acer Philippines warranty page: https://www.acer.com/ph-en/support/warranty/warranty
- [S61] Bermorzone, Nitro AN16S-61-R24N: https://bermorzone.com.ph/shop/laptop/acerpredator-notebook/acer-nitro-v-anv16s-41-r6tm-opi-ryzen-ai-7-350-octa-core-16gb-ddr5-ram-512gb-ssd-ips-rtx-5060-8gb-windows-11-gaming-laptop/
- [S62] PC Express, Nitro 16 Slim AN16S-61-R24N: https://pcx.com.ph/products/acer-nitro-16-slim-an16s-61-r24n-geforce-rtx-5060-amd-ryzen-ai-7-laptop-obsidian-black
- [S63] UniPC, Acer Nitro V Philippines 2026 guide: https://unipc.ph/blog/acer-nitro-v-lineup-philippines-guide
- [S64] TweakTown, Acer Nitro 16S AI review: https://www.tweaktown.com/reviews/11662/acer-predator-nitro-16s-ai-gaming-laptop-built-for-pc-gaming-ai-and-productivity/index.html
- [S65] Pickr, Acer Nitro 16S AI review: https://www.pickr.com.au/reviews/2026/acer-nitro-16s-ai-an16s-61/
- Dropped-model evidence: Villman TUF F16 FX608JMR: https://villman.com/Product-Detail/asus-tuf_gaming-f16-fx608jmr-rv314wsm--16in-fhd-165hz--intel-core-i7-14650hx--16gb-ddr5--1tb-ssd--gf-rtx-5060-8gb--win11 ; Acer PH Nitro V 15: https://www.acer.com/ph-en/laptops/nitro/nitro-v-15 ; Unicorp Nitro 5 discontinued: https://unicorp.ph/blog/acer-nitro-5-philippines-2026 ; Tom's Guide on the US-only RTX 5060 Victus deal: https://www.tomsguide.com/computing/gaming-laptops/this-rtx-5060-gaming-laptop-is-now-usd370-off-at-best-buy-act-fast

## Still to verify before publishing

1. Every price, on the live page (villman.com and pcx.com.ph were unreachable from this session).
2. Katana B14WFK-880PH: TGP on msi.com, RAM layout, PH warranty term.
3. TUF A16 RV069W: 144 Hz vs 165 Hz panel; soldered RAM vs SO-DIMM.
4. Nitro AN16S-61-R24N: TGP on the PH SKU (115 W vs 85 W), RAM speed, warranty term.
5. LOQ 15AHP10: whether stock remains; if it is gone, swap in the LOQ 15AHP11 once its PH GPU (5050 vs 5060) and price are confirmed.
6. LAKAN II's own weight, battery, panel, DIMM layout and warranty, so our row is as complete as the rivals'.
