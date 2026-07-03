# ⚔️ AZ CHAMPIONS

**By Aljay Leodones.**

---

## ▶️ How to run

The game is 100% client-side — no build step, no dependencies to install.

**Option A (recommended):** serve the folder with any static server:

```
cd az-champions
python -m http.server 8321
```

then open **http://localhost:8321** — on your phone too, if it's on the same network
(`http://<your-pc-ip>:8321`). The game is portrait-mobile-first.

**Option B:** double-click `index.html`. Everything (including Three.js) is bundled locally,
so it works offline from `file://` in Chrome/Edge/Firefox.

> **Releasing an update?** Bump the `?v=` cache version on every asset reference in
> `index.html` (currently `v=20260702b`) whenever any js/css file changes, then re-copy
> the game files into `android/app/src/main/assets/`. Phones cache aggressively — a stale
> mixed version is how you get a black screen at boot. The boot splash and error trap live
> inline in `index.html` so players always see UI, even if a script fails to load.

**To share the beta:** upload the whole folder to any static host (itch.io, Netlify,
GitHub Pages, etc.). Saves live in each player's browser (`localStorage`), and can be
exported/imported from **Settings → Save data**.

---

## 🕹️ Game systems

| System | Details |
|---|---|
| **Factions** | Ember 🔥 → Verdant 🌿 → Tide 🌊 → Ember, plus Radiant ☀ ↔ Umbra ☽ (mutual). Advantage = +30% damage, +10% crit. |
| **Combat** | Real-time 5v5 auto-battle in 3D. Front row (slots 1–2) tanks; back row deals/heals. Energy builds from attacking and being hit; ultimates fire at full energy (manual tap or AUTO). 1×/2× speed. 90s timer — timeout is a loss. |
| **Campaign** | 10 chapters × 10 stages, each themed to an enemy family. Elite fight at x-5, boss at x-10. Bosses drop scrolls and big diamonds. |
| **Idle chest** | Gold/XP/dust accrue from your best stage, capped at **12 hours** — collect at least twice a day. |
| **Summoning** | 4.6% Elite rate, guaranteed Elite within 30 pulls (pity). Duplicates become **copies**. |
| **Ascension** | Copies push Champions up tiers: Elite → Elite+ → Legendary → Legendary+ → Mythic → Mythic+ → Ascended. Each tier boosts stats ~28% compounding and raises the level cap by 20. Rare champions cap at Elite+. |
| **Gear** | 4 slots. Weapon (ATK) and Armor (HP) scale with the stage they drop from; Boots (SPD) and Talisman (CRIT) are flat utility that never expires. Enhance to +20 with gold + dust; salvage spares. |
| **Daily quests** | The 100-point system: total available points exceed 100 so players choose their routine. 5 chests on the track. Resets daily. |
| **Tower of Trials** | Endless floors, boss every 5th, scrolls + diamonds. |
| **Arena** | 5 free fights/day vs power-matched AI teams. Rating, W/L record, reroll opponents. |
| **Healer AI** | Supports open every battle with party shields + ATK boost and blind/ATK-cut the enemy front line; when party HP drops below 30% they fire a massive one-time Emergency Aid heal. |
| **Debuff scaling** | Elite→Legendary champions land 10–30% stronger debuffs. Aljay's Vampiric Strike drains enemies per second and heals your weakest ally for every point drained. Azrana's Divine Resurrection cheats death once per battle (revive at 50% + 3s party invulnerability). |
| **Chest Manager** | 🎁 HUD button — every chest tier with exact counts and a bulk **Open All** with aggregated loot reveal. |
| **Inventory & Relic Forge** | 🎒 HUD button — all gear with "equipped by" portraits, deep item tooltips (stat breakdown, set bonuses, lore), and dust-powered crafting with a guaranteed-Mythic pity every 8 crafts. |
| **Achievements** | 🏅 22 lifetime feats paying diamonds; the big ones grant permanent title badges (WARLORD, SAVIOR, MIDAS…). |
| **Login streak** | 7-day rolling calendar with escalating rewards, Golden Chest on day 7. |
| **Stage Sweep** | Instantly raid your highest cleared stage 5×/day for full rewards — no battle required. |
| **Formation presets** | 3 savable team presets + one-tap 🧠 AUTO-BUILD that assembles your strongest legal lineup. |
| **Set bonuses** | Battle-Ready (4 slots filled): +6% ATK/HP. Master-Forged (all Epic+): +8% more. |

### The roster (25 Champions)

**The Primary Seven:** Azrin (Radiant duelist), Azrael (Umbra reaper), Ezekiel Fitz (Tide stormcaller),
Raphael Rich (Radiant healer), Yoon Sul (Verdant archer), **Ivcan** (Umbra void-tank, Store exclusive),
**Lemon Quake** (Ember seismic bruiser, Store exclusive).

**Expanded:** Seraphelle, Justicar Bram, Nyxara, Vesper Gloom, Kagemaru, Pyra Vex, Brandt Koal,
Cinderlyn, Marina Vale, Okho Reef, Sirene, Thornwick, Fenra Wilde — plus 5 Rare pool champions
(Perrin, Vosk, Nimue, Fyn, Morr).

Every champion has a unique passive, skill, and ultimate implemented in the combat engine —
no stat-clone kits.

---

## 💳 Payments (PayPal)

Real-money items (diamond packs, Ivcan, Lemon Quake, exclusive gear, Founder's Pack) check out
through **PayPal hosted Buy Now**, paying the merchant account **lemonquake@gmail.com**
(configured in `js/data.js → DATA.STORE.paypalEmail`).

### Beta flow (current)
1. Player taps a pack → PayPal checkout opens in a new tab with the item + price pre-filled.
2. The game generates an **Order ID** (also sent to PayPal as `custom`/`item_number`).
3. After paying, the player returns and enters their **PayPal Transaction ID**; the item is
   granted and the order is logged in their save (visible under Settings → Purchases).
4. You reconcile manually: every real payment appears in your PayPal activity with the
   matching Order ID.

### ⚠️ Before public launch — read this
Client-side granting is fine for a **closed beta with trusted testers**, but any player can
type a fake transaction ID. Before charging the public:

1. Stand up the verification server (see `server/paypal-verify-example.js`).
2. Create a PayPal REST app at https://developer.paypal.com → get Client ID + Secret.
3. Set `VERIFY_ENDPOINT` at the top of `js/store.js` to your server URL.
   The game already POSTs `{packId, txnId}` and grants **only** if the server replies
   `{verified: true}`.
4. Also note: **you cannot pay yourself** — PayPal blocks payments from the merchant's own
   account. Test purchases with a second PayPal account or PayPal Sandbox.

---

## 🗂️ Project layout

```
index.html            entry point
css/style.css         full UI theme
js/lib/three.min.js   Three.js r128 (bundled, works offline)
js/data.js            ALL game data: champions, enemies, campaign, economy, store
js/state.js           save/load, roster, gear, idle, summoning, quests
js/combat.js          real-time battle simulation (data-driven ability engine)
js/battle3d.js        3D renderer: procedural characters, VFX, portraits
js/audio.js           synthesized SFX + ambient music (zero audio assets)
js/store.js           PayPal checkout + purchase granting
js/ui.js              every screen, modal, and the battle HUD
js/main.js            boot + game loop
server/               production payment-verification example (optional)
```

### Balance tuning knobs (all in `js/data.js`)
- `DATA.STAT_GROWTH` — the shared per-level stat curve (1.048)
- `DATA.enemyScaleForStage` — the `1 + s*0.008` term is the difficulty ramp
- `DATA.idleRates`, `DATA.stageClearRewards`, `DATA.levelUpCost` — economy
- `DATA.SUMMON` — gacha rates and pity
- Champion kits — numbers live next to each champion definition

The design targets (verified by simulation): a team kept at `enemy level + 4` with
appropriate ascensions clears ~98% of the campaign; the chapter 9–10 bosses are
deliberate late-game walls that push players into gear, tiers, and faction counters.

---

*AZ Champions © Aljay Leodones. Built on the architecture defined in
"AZ Champions Game Development.docx" — WebGL 3D battles, interlocking retention loops,
merge-token gacha, and a 12-hour idle appointment mechanic.*
