/* ============================================================
   AZ CHAMPIONS — Game State, Save/Load, Economy
   ============================================================ */
'use strict';

const SAVE_VERSION = 1;

const State = {
  data: null,
  listeners: [],
  activeSlot: null,

  getActiveSlot() {
    if (this.activeSlot !== null) return this.activeSlot;
    const s = safeStorage.getItem('az_champions_active_slot');
    if (s) {
      this.activeSlot = parseInt(s, 10);
      return this.activeSlot;
    }
    return null;
  },

  setActiveSlot(slot) {
    this.activeSlot = slot;
    if (slot === null) {
      safeStorage.removeItem('az_champions_active_slot');
    } else {
      safeStorage.setItem('az_champions_active_slot', slot);
    }
  },

  getSaveKey(slot) {
    return 'az_champions_save_slot_' + slot;
  },

  getSlotMeta(slot) {
    try {
      const key = this.getSaveKey(slot);
      
      // Migrate old save on meta query too, so it shows up in Main Menu on Slot 1
      if (slot === 1) {
        const oldRaw = safeStorage.getItem('az_champions_save_v1');
        const slot1Raw = safeStorage.getItem(key);
        if (oldRaw && !slot1Raw) {
          safeStorage.setItem(key, oldRaw);
        }
      }

      const raw = safeStorage.getItem(key);
      if (!raw) return { exist: false };
      const d = JSON.parse(raw);
      if (!d || d.version !== SAVE_VERSION) return { exist: false };
      
      // Calculate team power for slot meta
      let power = 0;
      if (d.formation && d.roster) {
        d.formation.forEach(cid => {
          const rc = d.roster[cid];
          if (rc) {
            const def = DATA.CHAMP_BY_ID[cid];
            if (def) {
              const tierMult = DATA.TIERS[rc.tier].mult;
              const basehp = DATA.statAtLevel(def.base.hp, rc.level) * tierMult;
              const baseatk = DATA.statAtLevel(def.base.atk, rc.level) * tierMult;
              const basedef = DATA.statAtLevel(def.base.def, rc.level) * tierMult;
              const basespd = def.base.spd + rc.level * 0.15;
              let hp = basehp, atk = baseatk, defStat = basedef, spd = basespd, crit = def.crit;

              // add gear
              DATA.GEAR_SLOTS.forEach(slotKey => {
                const gid = rc.gear[slotKey];
                if (gid && d.gear && d.gear[gid]) {
                  const g = d.gear[gid];
                  const gBase = g.exclusiveId
                    ? DATA.gearMainStat(g.slot, 'exclusive', g.stage)
                    : DATA.gearMainStat(g.slot, g.rarity, g.stage);
                  const v = +(gBase * (1 + DATA.gearLevelBonus * g.level)).toFixed(1);
                  if (slotKey === 'weapon') atk += v;
                  else if (slotKey === 'armor') hp += v;
                  else if (slotKey === 'boots') { spd += v; hp += v * 12; }
                  else if (slotKey === 'talisman') { crit += v; atk += v * 3; }
                }
              });
              hp = Math.round(hp);
              atk = Math.round(atk);
              defStat = Math.round(defStat);
              spd = Math.round(spd * 10) / 10;
              crit = Math.round(crit * 10) / 10;
              const p = Math.round(atk * 4.2 + hp * 0.55 + defStat * 5.5 + spd * 12 + crit * 30);
              power += p;
            }
          }
        });
      }

      return {
        exist: true,
        name: d.player ? d.player.name : 'Champion',
        server: d.player ? d.player.server : '',
        created: d.created || Date.now(),
        diamonds: d.res ? d.res.diamonds : 0,
        maxStage: d.campaign ? d.campaign.maxStage : 1,
        power: power,
        lastSaved: d.lastSaved || d.created || Date.now()
      };
    } catch(e) {
      return { exist: false };
    }
  },

  duplicateSlot(srcSlot, destSlot) {
    try {
      const srcKey = this.getSaveKey(srcSlot);
      const destKey = this.getSaveKey(destSlot);
      const raw = safeStorage.getItem(srcKey);
      if (raw) {
        const d = JSON.parse(raw);
        d.created = Date.now();
        d.lastSaved = Date.now();
        safeStorage.setItem(destKey, JSON.stringify(d));
        return true;
      }
      return false;
    } catch(e) {
      console.warn('Duplication failed', e);
      return false;
    }
  },

  deleteSlot(slot) {
    try {
      const key = this.getSaveKey(slot);
      safeStorage.removeItem(key);
      return true;
    } catch(e) {
      return false;
    }
  },

  /* ---------- lifecycle ---------- */
  newGame() {
    const now = Date.now();
    this.data = {
      version: SAVE_VERSION,
      created: now,
      player: {
        name: 'Champion',
        server: DATA.SERVER_NAMES[Math.floor(Math.random() * DATA.SERVER_NAMES.length)],
        badges: [],
      },
      res: Object.assign({}, DATA.STARTING_RESOURCES),
      roster: {},              // champId -> { level, tier, copies, gear: {slot: gearId} }
      gear: {},                // gearId -> { id, slot, rarity, nameIdx, stage, level, exclusiveId? }
      gearSeq: 1,
      formation: [],           // up to 5 champ ids (order = slots)
      campaign: { maxStage: 1 },        // next stage to beat
      tower: { floor: 1 },
      arena: { fightsToday: 0, rating: 1000, wins: 0, losses: 0 },
      modes: {
        bossrush: { attemptsToday: 0, round: 0, active: false, clears: 0, bestRound: 0 },
        trials: { clearedTier: 0 },
        abyss: { depth: 1, best: 0 },
        tournament: { entriesToday: 0, round: 0, active: false, titles: 0 },
      },
      chests: {},                       // chestId -> count owned (earned/purchased, opened from Store)
      dungeons: { runsToday: {}, clears: {} },   // Map of Agdao raids
      idle: { lastCollect: now },
      pity: 0,
      totalSummons: 0,
      quests: { day: this.dayKey(), progress: {}, claimed: {}, chestsClaimed: [], points: 0 },
      purchases: [],           // {id, packId, txn, date, price}
      unlockedPaid: [],        // champ ids granted via purchase
      settings: { sfx: true, music: true, autoUlt: true, speed: 1, reducedFx: false, viewMode: safeStorage.getItem('az_champions_boot_view_mode') || 'mobile' },
      stats: { battles: 0, wins: 0, summons: 0, ascends: 0, chestsOpened: 0, crafts: 0 },
      seenIntro: false,
      seenViewModeTutorial: false,
      earlyUnlocksGiven: [],
      battlesSinceRemind: 0,
      nextRemindBattles: Math.floor(Math.random() * 5) + 4,
      achievementsClaimed: [],
      streak: { last: '', count: 0 },
      sweepsToday: 0,
      forgeCount: 0,
      presets: [null, null, null],
    };
    DATA.STARTING_ROSTER.forEach(id => this.addChampion(id));
    this.data.formation = DATA.STARTING_ROSTER.slice();
    this.save();
  },

  load() {
    try {
      const slot = this.getActiveSlot();
      if (!slot) return false;
      const key = this.getSaveKey(slot);

      // Migrate old single save to Slot 1 if empty
      if (slot === 1) {
        const oldRaw = safeStorage.getItem('az_champions_save_v1');
        const slot1Raw = safeStorage.getItem(key);
        if (oldRaw && !slot1Raw) {
          safeStorage.setItem(key, oldRaw);
        }
      }

      const raw = safeStorage.getItem(key);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d || d.version !== SAVE_VERSION) return false;

      // Ensure settings and viewMode are initialized (migration)
      if (!d.settings) d.settings = { sfx: true, music: true, autoUlt: true, speed: 1, reducedFx: false };
      if (d.settings.viewMode === undefined) d.settings.viewMode = safeStorage.getItem('az_champions_boot_view_mode') || 'mobile';
      if (d.seenViewModeTutorial === undefined) d.seenViewModeTutorial = false;
      if (d.battlesSinceRemind === undefined) d.battlesSinceRemind = 0;
      if (d.nextRemindBattles === undefined) d.nextRemindBattles = Math.floor(Math.random() * 5) + 4;
      // Game modes + chests (migration for pre-expansion saves)
      if (!d.modes) d.modes = {};
      if (!d.modes.bossrush) d.modes.bossrush = { attemptsToday: 0, round: 0, active: false, clears: 0, bestRound: 0 };
      if (!d.modes.trials) d.modes.trials = { clearedTier: 0 };
      if (!d.modes.abyss) d.modes.abyss = { depth: 1, best: 0 };
      if (!d.modes.tournament) d.modes.tournament = { entriesToday: 0, round: 0, active: false, titles: 0 };
      if (!d.chests) d.chests = {};
      if (!d.dungeons) d.dungeons = { runsToday: {}, clears: {} };
      // Grand Overhaul migrations
      if (d.stats.ascends === undefined) d.stats.ascends = 0;
      if (d.stats.chestsOpened === undefined) d.stats.chestsOpened = 0;
      if (d.stats.crafts === undefined) d.stats.crafts = 0;
      if (!d.achievementsClaimed) d.achievementsClaimed = [];
      if (!d.streak) d.streak = { last: '', count: 0 };
      if (d.sweepsToday === undefined) d.sweepsToday = 0;
      if (d.forgeCount === undefined) d.forgeCount = 0;
      if (!d.presets) d.presets = [null, null, null];

      this.data = d;
      return true;
    } catch (e) { console.warn('Save load failed', e); return false; }
  },

  save() {
    try {
      const slot = this.getActiveSlot();
      if (!slot) return;
      if (this.data) this.data.lastSaved = Date.now();
      safeStorage.setItem(this.getSaveKey(slot), JSON.stringify(this.data));
    }
    catch (e) { console.warn('Save failed', e); }
  },

  exportSave() { return btoa(unescape(encodeURIComponent(JSON.stringify(this.data)))); },
  importSave(str) {
    try {
      const d = JSON.parse(decodeURIComponent(escape(atob(str.trim()))));
      if (!d || d.version !== SAVE_VERSION || !d.roster) return false;
      this.data = d; this.save(); return true;
    } catch (e) { return false; }
  },
  reset() {
    const slot = this.getActiveSlot();
    if (slot) {
      safeStorage.removeItem(this.getSaveKey(slot));
    }
    this.newGame();
  },

  dayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },

  /* ---------- resources ---------- */
  canAfford(cost) {
    const r = this.data.res;
    return Object.keys(cost).every(k => (r[k] || 0) >= cost[k]);
  },
  spend(cost) {
    if (!this.canAfford(cost)) return false;
    Object.keys(cost).forEach(k => { this.data.res[k] -= cost[k]; });
    this.save(); return true;
  },
  grant(rw) {
    const r = this.data.res;
    ['gold', 'xp', 'diamonds', 'scrolls', 'dust'].forEach(k => { if (rw[k]) r[k] = (r[k] || 0) + Math.round(rw[k]); });
    this.save();
  },

  /* ---------- roster ---------- */
  addChampion(id) {
    const d = this.data;
    if (d.roster[id]) { d.roster[id].copies += 1; this.save(); return 'dupe'; }
    d.roster[id] = { level: 1, tier: 0, copies: 0, gear: {} };
    this.save(); return 'new';
  },
  ownedChampions() { return Object.keys(this.data.roster); },

  champTierCap(id) {
    const def = DATA.CHAMP_BY_ID[id];
    return ['common', 'uncommon', 'rare'].includes(def.rarity) ? DATA.RARE_MAX_TIER : DATA.TIERS.length - 1;
  },
  champLevelCap(id) {
    const rc = this.data.roster[id];
    return DATA.TIERS[rc.tier].cap;
  },
  canAscend(id) {
    const rc = this.data.roster[id];
    if (rc.tier >= this.champTierCap(id)) return false;
    return rc.copies >= DATA.ASCEND_COST[rc.tier];
  },
  ascend(id) {
    const rc = this.data.roster[id];
    if (!this.canAscend(id)) return false;
    rc.copies -= DATA.ASCEND_COST[rc.tier];
    rc.tier += 1;
    this.data.stats.ascends = (this.data.stats.ascends || 0) + 1;
    this.save(); return true;
  },
  levelUp(id, times = 1) {
    const rc = this.data.roster[id];
    let done = 0;
    for (let i = 0; i < times; i++) {
      if (rc.level >= this.champLevelCap(id)) break;
      const cost = DATA.levelUpCost(rc.level);
      if (!this.canAfford(cost)) break;
      this.spend(cost);
      rc.level += 1; done++;
    }
    if (done) { this.questProgress('level3', done); this.save(); }
    return done;
  },

  /* combat-ready stats for an owned champion (base * level * tier * gear * sets) */
  champStats(id) {
    const def = DATA.CHAMP_BY_ID[id];
    const rc = this.data.roster[id];
    const tierMult = DATA.TIERS[rc.tier].mult;
    const s = {
      hp: DATA.statAtLevel(def.base.hp, rc.level) * tierMult,
      atk: DATA.statAtLevel(def.base.atk, rc.level) * tierMult,
      def: DATA.statAtLevel(def.base.def, rc.level) * tierMult,
      spd: def.base.spd + rc.level * 0.15,
      crit: def.crit,
    };
    DATA.GEAR_SLOTS.forEach(slot => {
      const gid = rc.gear[slot];
      if (!gid) return;
      const g = this.data.gear[gid];
      if (!g) return;
      const v = this.gearStatValue(g);
      if (slot === 'weapon') s.atk += v;
      else if (slot === 'armor') s.hp += v;
      else if (slot === 'boots') { s.spd += v; s.hp += v * 12; }
      else if (slot === 'talisman') { s.crit += v; s.atk += v * 3; }
    });
    // gear set bonuses (Battle-Ready / Master-Forged)
    this.gearSetBonuses(id).forEach(b => {
      s.atk *= 1 + b.atk;
      s.hp *= 1 + b.hp;
    });
    ['hp', 'atk', 'def'].forEach(k => s[k] = Math.round(s[k]));
    s.spd = Math.round(s.spd * 10) / 10;
    s.crit = Math.round(s.crit * 10) / 10;
    return s;
  },

  /* set bonuses currently active for a champion */
  gearSetBonuses(id) {
    const rc = this.data.roster[id];
    if (!rc) return [];
    const pieces = DATA.GEAR_SLOTS.map(slot => rc.gear[slot] && this.data.gear[rc.gear[slot]]).filter(Boolean);
    return DATA.SET_BONUSES.filter(b => b.check(pieces));
  },
  champPower(id) {
    const s = this.champStats(id);
    return Math.round(s.atk * 4.2 + s.hp * 0.55 + s.def * 5.5 + s.spd * 12 + s.crit * 30);
  },
  teamPower(ids) { return ids.reduce((t, id) => t + (this.data.roster[id] ? this.champPower(id) : 0), 0); },

  /* ---------- gear ---------- */
  gearStatValue(g) {
    const base = g.exclusiveId
      ? DATA.gearMainStat(g.slot, 'exclusive', g.stage)
      : DATA.gearMainStat(g.slot, g.rarity, g.stage);
    return +(base * (1 + DATA.gearLevelBonus * g.level)).toFixed(1);
  },
  gearName(g) {
    if (g.itemId && DATA.ITEM_BY_ID[g.itemId]) return DATA.ITEM_BY_ID[g.itemId].name;
    if (g.exclusiveId) return DATA.EXCLUSIVE_GEAR.find(x => x.id === g.exclusiveId).name;
    return DATA.GEAR_NAMES[g.slot][g.nameIdx];
  },
  gearRarity(g) { return DATA.GEAR_RARITIES.find(r => r.id === g.rarity); },

  dropGear(stage) {
    // rarity weights shift with stage
    const roll = Math.random() * 100;
    let rarity;
    const t = Math.min(1, stage / DATA.MAX_STAGE);
    if (roll < 4 + t * 10) rarity = 'mythic';
    else if (roll < 14 + t * 22) rarity = 'epic';
    else if (roll < 40 + t * 25) rarity = 'rare';
    else if (roll < 72) rarity = 'fine';
    else rarity = 'common';
    return this.dropGearOfRarity(rarity, stage);
  },
  dropGearOfRarity(rarity, stage) {
    const slot = DATA.GEAR_SLOTS[Math.floor(Math.random() * DATA.GEAR_SLOTS.length)];
    const rIdx = DATA.GEAR_RARITIES.findIndex(r => r.id === rarity);
    // late-game drops pull from the legendary half of the name pool
    const names = DATA.GEAR_NAMES[slot];
    const nameIdx = Math.min(names.length - 1, Math.min(rIdx, 4) + (stage > 100 ? 5 : 0));
    const id = 'g' + (this.data.gearSeq++);
    const g = { id, slot, rarity, nameIdx, stage, level: 0 };
    this.data.gear[id] = g;
    this.save();
    return g;
  },
  grantExclusiveGear(exclusiveId) {
    const def = DATA.EXCLUSIVE_GEAR.find(x => x.id === exclusiveId);
    if (!def) return null;
    const id = 'g' + (this.data.gearSeq++);
    const g = { id, slot: def.slot, rarity: 'exclusive', nameIdx: 0, stage: def.stage, level: 0, exclusiveId };
    this.data.gear[id] = g; this.save(); return g;
  },

  /* ---------- named relics (Epic / Legendary / AETHER) ---------- */
  grantNamedItem(itemId) {
    const def = DATA.ITEM_BY_ID[itemId];
    if (!def) return null;
    const stage = Math.min(this.data.campaign.maxStage, DATA.MAX_STAGE);
    const id = 'g' + (this.data.gearSeq++);
    const g = { id, slot: def.slot, rarity: def.tier, nameIdx: 0, stage, level: 0, itemId };
    this.data.gear[id] = g; this.save(); return g;
  },
  randomItemOfTier(tier) {
    const pool = DATA.ITEMS.filter(i => i.tier === tier);
    return pool[Math.floor(Math.random() * pool.length)];
  },
  /* combat effect list from equipped named relics — consumed by combat.js */
  champItemEffects(id) {
    const rc = this.data.roster[id];
    if (!rc) return [];
    const out = [];
    DATA.GEAR_SLOTS.forEach(slot => {
      const gid = rc.gear[slot];
      const g = gid && this.data.gear[gid];
      if (g && g.itemId && DATA.ITEM_BY_ID[g.itemId]) {
        const it = DATA.ITEM_BY_ID[g.itemId];
        out.push(Object.assign({ itemName: it.name, tier: it.tier }, it.fx));
      }
    });
    return out;
  },
  equipGear(champId, gearId) {
    const g = this.data.gear[gearId];
    if (!g) return false;
    // unequip from anyone else
    Object.keys(this.data.roster).forEach(cid => {
      const rc = this.data.roster[cid];
      if (rc.gear[g.slot] === gearId) delete rc.gear[g.slot];
    });
    this.data.roster[champId].gear[g.slot] = gearId;
    this.save(); return true;
  },
  unequipGear(champId, slot) { delete this.data.roster[champId].gear[slot]; this.save(); },
  enhanceGear(gearId) {
    const g = this.data.gear[gearId];
    if (!g || g.level >= DATA.GEAR_MAX_LEVEL) return false;
    const cost = DATA.gearEnhanceCost(g.level);
    if (!this.spend(cost)) return false;
    g.level += 1;
    this.questProgress('enhance1', 1);
    this.save(); return true;
  },
  gearEquippedBy(gearId) {
    for (const cid of Object.keys(this.data.roster)) {
      const rc = this.data.roster[cid];
      for (const slot of DATA.GEAR_SLOTS) if (rc.gear[slot] === gearId) return cid;
    }
    return null;
  },
  salvageGear(gearId) {
    const g = this.data.gear[gearId];
    if (!g || g.exclusiveId) return false;
    if (this.gearEquippedBy(gearId)) return false;
    const rIdx = DATA.GEAR_RARITIES.findIndex(r => r.id === g.rarity);
    this.grant({ dust: 3 + rIdx * 4 + g.level * 2, gold: 50 * (rIdx + 1) });
    delete this.data.gear[gearId];
    this.save(); return true;
  },

  /* ---------- idle ---------- */
  idlePending() {
    const now = Date.now();
    const elapsedMin = Math.min((now - this.data.idle.lastCollect) / 60000, DATA.IDLE_CAP_HOURS * 60);
    const rates = DATA.idleRates(this.data.campaign.maxStage);
    return {
      minutes: elapsedMin,
      capped: elapsedMin >= DATA.IDLE_CAP_HOURS * 60 - 0.01,
      gold: Math.floor(rates.goldPerMin * elapsedMin),
      xp: Math.floor(rates.xpPerMin * elapsedMin),
      dust: Math.floor(rates.dustPerMin * elapsedMin),
    };
  },
  collectIdle() {
    const p = this.idlePending();
    this.grant({ gold: p.gold, xp: p.xp, dust: p.dust });
    this.data.idle.lastCollect = Date.now();
    this.questProgress('collectIdle', 1);
    this.save();
    return p;
  },

  /* ---------- summoning ---------- */
  summonPool() {
    const pool = {};
    ['common', 'uncommon', 'rare', 'elite', 'epic', 'mystic', 'ultimate', 'legendary'].forEach(r => {
      pool[r] = DATA.CHAMPIONS.filter(c => c.rarity === r && !c.paid).map(c => c.id);
    });
    return pool;
  },
  summonOne() {
    if (!this.spend({ scrolls: 1 })) return null;
    const pool = this.summonPool();
    this.data.pity += 1;
    this.data.totalSummons += 1;
    this.data.stats.summons += 1;
    
    let rarity = 'common';
    if (this.data.pity >= 30) {
      // Pity guarantees: Elite, Epic, Mystic, Ultimate, or Legendary
      const pityRoll = Math.random() * 100;
      if (pityRoll < 1) rarity = 'legendary';
      else if (pityRoll < 4) rarity = 'ultimate';
      else if (pityRoll < 15) rarity = 'mystic';
      else if (pityRoll < 40) rarity = 'epic';
      else rarity = 'elite';
      this.data.pity = 0;
    } else {
      const roll = Math.random() * 100;
      if (roll < 0.2) rarity = 'legendary';
      else if (roll < 1.0) rarity = 'ultimate';
      else if (roll < 4.0) rarity = 'mystic';
      else if (roll < 9.0) rarity = 'epic';
      else if (roll < 19.0) rarity = 'elite';
      else if (roll < 37.0) rarity = 'rare';
      else if (roll < 65.0) rarity = 'uncommon';
      else rarity = 'common';
      
      // Reset pity if we rolled Elite or better naturally
      if (['elite', 'epic', 'mystic', 'ultimate', 'legendary'].includes(rarity)) {
        this.data.pity = 0;
      }
    }
    
    const finalRarity = (pool[rarity] && pool[rarity].length > 0) ? rarity : 'common';
    const list = pool[finalRarity];
    const id = list[Math.floor(Math.random() * list.length)];
    const result = this.addChampion(id);
    const isElite = ['elite', 'epic', 'mystic', 'ultimate', 'legendary'].includes(finalRarity);
    
    this.questProgress('summon1', 1);
    this.save();
    return { id, isElite, rarity: finalRarity, result };
  },

  /* ---------- quests ---------- */
  ensureQuestDay() {
    const key = this.dayKey();
    if (this.data.quests.day !== key) {
      this.data.quests = { day: key, progress: {}, claimed: {}, chestsClaimed: [], points: 0 };
      this.data.arena.fightsToday = 0;
      this.data.sweepsToday = 0;
      // daily mode resets (Abyss depth and Boss Rush records persist)
      if (this.data.modes) {
        this.data.modes.bossrush.attemptsToday = 0;
        this.data.modes.bossrush.active = false;
        this.data.modes.bossrush.round = 0;
        this.data.modes.trials.clearedTier = 0;
        this.data.modes.tournament.entriesToday = 0;
        this.data.modes.tournament.active = false;
        this.data.modes.tournament.round = 0;
      }
      if (this.data.dungeons) this.data.dungeons.runsToday = {};
      this.save();
    }
  },
  questProgress(qid, amount) {
    this.ensureQuestDay();
    const q = this.data.quests;
    q.progress[qid] = (q.progress[qid] || 0) + amount;
    this.save();
  },
  questState(qdef) {
    const q = this.data.quests;
    const prog = Math.min(q.progress[qdef.id] || 0, qdef.goal);
    return { prog, done: prog >= qdef.goal, claimed: !!q.claimed[qdef.id] };
  },
  claimQuest(qid) {
    const qdef = DATA.DAILY_QUESTS.find(q => q.id === qid);
    const st = this.questState(qdef);
    if (!st.done || st.claimed) return false;
    this.data.quests.claimed[qid] = true;
    this.data.quests.points += qdef.points;
    this.save(); return true;
  },
  claimChest(at) {
    const chest = DATA.QUEST_CHESTS.find(c => c.at === at);
    if (!chest) return false;
    if (this.data.quests.points < at) return false;
    if (this.data.quests.chestsClaimed.includes(at)) return false;
    this.data.quests.chestsClaimed.push(at);
    const rw = Object.assign({}, chest.reward);
    this.grant(rw);
    this.save(); return rw;
  },

  /* ---------- campaign / tower / arena results ---------- */
  currentStage() { return Math.min(this.data.campaign.maxStage, DATA.MAX_STAGE); },
  stageInfo(stage) {
    const chIdx = Math.floor((stage - 1) / DATA.STAGES_PER_CHAPTER);
    const ch = DATA.CHAPTERS[Math.min(chIdx, DATA.CHAPTERS.length - 1)];
    const inChapter = ((stage - 1) % DATA.STAGES_PER_CHAPTER) + 1;
    return { chapter: ch, inChapter, isBoss: inChapter === 10, isElite: inChapter === 5, label: `${ch.id}-${inChapter}` };
  },
  winCampaignStage(stage) {
    const rw = DATA.stageClearRewards(stage);
    this.grant(rw);
    let gear = null;
    if (Math.random() < rw.gearChance) gear = this.dropGear(stage);

    const info = this.stageInfo(stage);
    if (info.isBoss) {
      this.grantChest('boss', 1);
      rw.bossChestDropped = true;
    }

    if (stage === this.data.campaign.maxStage && stage < DATA.MAX_STAGE + 1) {
      this.data.campaign.maxStage = Math.min(stage + 1, DATA.MAX_STAGE + 1);
    }
    // free early unlocks
    Object.keys(DATA.EARLY_UNLOCKS).forEach(cid => {
      if (stage >= DATA.EARLY_UNLOCKS[cid] && !this.data.earlyUnlocksGiven.includes(cid)) {
        this.data.earlyUnlocksGiven.push(cid);
        this.addChampion(cid);
        rw.unlockedChamp = cid;
      }
    });
    this.save();
    return { rw, gear };
  },
  winTowerFloor(floor) {
    const rw = DATA.towerRewards(floor);
    this.grant(rw);
    if (floor === this.data.tower.floor) this.data.tower.floor = floor + 1;
    this.save();
    return rw;
  },

  /* ---------- chests ---------- */
  grantChest(chestId, n) {
    this.data.chests[chestId] = (this.data.chests[chestId] || 0) + (n || 1);
    this.save();
  },
  chestCount(chestId) { return this.data.chests[chestId] || 0; },

  /* Open one owned chest → returns loot list for the reveal animation,
     or null if none owned. Loot is granted immediately. */
  openChest(chestId) {
    const def = DATA.CHEST_BY_ID[chestId];
    if (!def || this.chestCount(chestId) < 1) return null;
    this.data.chests[chestId] -= 1;
    const loot = [];
    if (def.guaranteed) loot.push(this.rollChestEntry(def.guaranteed));
    const totalW = def.table.reduce((t, e) => t + e.w, 0);
    for (let i = 0; i < def.rolls; i++) {
      let r = Math.random() * totalW;
      let pick = def.table[0];
      for (const e of def.table) { r -= e.w; if (r <= 0) { pick = e; break; } }
      loot.push(this.rollChestEntry(pick));
    }
    this.data.stats.chestsOpened = (this.data.stats.chestsOpened || 0) + 1;
    this.questProgress('chest1', 1);
    this.save();
    return loot.filter(Boolean);
  },

  /* Open EVERY owned chest (or all of one tier) → aggregated loot for
     the bulk reveal. Returns { loot, opened } or null if nothing owned. */
  openAllChests(chestId) {
    const ids = chestId ? [chestId] : Object.keys(this.data.chests || {});
    const loot = [];
    let opened = 0;
    ids.forEach(id => {
      while (this.chestCount(id) > 0 && opened < 60) { // sanity cap per bulk action
        const l = this.openChest(id);
        if (!l) break;
        loot.push(...l);
        opened++;
      }
    });
    if (!opened) return null;
    return { loot, opened };
  },

  /* Resolve one loot-table entry: grant it and describe it for the UI. */
  rollChestEntry(e) {
    const stage = Math.min(this.data.campaign.maxStage, DATA.MAX_STAGE);
    const rates = DATA.idleRates(stage);
    const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    switch (e.kind) {
      case 'gold': {
        const amt = Math.floor(rates.goldPerMin * e.idleMin * (0.85 + Math.random() * 0.3));
        this.grant({ gold: amt });
        return { kind: 'gold', glyph: '💰', label: 'Gold', amt };
      }
      case 'xp': {
        const amt = Math.floor(rates.xpPerMin * e.idleMin * (0.85 + Math.random() * 0.3));
        this.grant({ xp: amt });
        return { kind: 'xp', glyph: '📗', label: 'XP', amt };
      }
      case 'dust': {
        const amt = rnd(e.amt[0], e.amt[1]);
        this.grant({ dust: amt });
        return { kind: 'dust', glyph: '✨', label: 'Gear Dust', amt };
      }
      case 'scrolls': {
        const amt = rnd(e.amt[0], e.amt[1]);
        this.grant({ scrolls: amt });
        return { kind: 'scrolls', glyph: '📜', label: 'Summon Scrolls', amt };
      }
      case 'diamonds': {
        const amt = rnd(e.amt[0], e.amt[1]);
        this.grant({ diamonds: amt });
        return { kind: 'diamonds', glyph: '💎', label: 'Diamonds', amt, jackpot: true };
      }
      case 'gear': {
        if (e.exclusive) {
          // exclusive jackpot: only pieces you don't own yet; falls back to mythic
          const ownedEx = Object.values(this.data.gear).map(g => g.exclusiveId).filter(Boolean);
          const pool = DATA.EXCLUSIVE_GEAR.filter(x => !ownedEx.includes(x.id));
          if (pool.length) {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            const g = this.grantExclusiveGear(pick.id);
            return { kind: 'gear', glyph: DATA.GEAR_SLOT_INFO[g.slot].glyph, label: this.gearName(g), rarity: 'exclusive', jackpot: true, gearId: g.id };
          }
          const g2 = this.dropGearOfRarity('mythic', stage);
          return { kind: 'gear', glyph: DATA.GEAR_SLOT_INFO[g2.slot].glyph, label: this.gearName(g2), rarity: 'mythic', gearId: g2.id };
        }
        const rarity = e.rarities[Math.floor(Math.random() * e.rarities.length)];
        const g = this.dropGearOfRarity(rarity, stage);
        return { kind: 'gear', glyph: DATA.GEAR_SLOT_INFO[g.slot].glyph, label: this.gearName(g), rarity, gearId: g.id, jackpot: rarity === 'mythic' };
      }
      case 'champcopy': {
        const rarity = e.rarities[Math.floor(Math.random() * e.rarities.length)];
        const pool = DATA.CHAMPIONS.filter(c => c.rarity === rarity && !c.paid);
        if (!pool.length) { this.grant({ dust: 60 }); return { kind: 'dust', glyph: '✨', label: 'Gear Dust', amt: 60 }; }
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const res = this.addChampion(pick.id);
        return { kind: 'champ', glyph: '🛡️', label: pick.name, champId: pick.id, rarity, isNew: res === 'new', jackpot: true };
      }
      case 'item': {
        // named relic — Epic / Legendary / AETHER
        const tier = e.tiers[Math.floor(Math.random() * e.tiers.length)];
        const pick = this.randomItemOfTier(tier);
        const g = this.grantNamedItem(pick.id);
        return { kind: 'gear', glyph: DATA.GEAR_SLOT_INFO[g.slot].glyph, label: pick.name, rarity: tier, gearId: g.id, jackpot: tier !== 'epic', fx: pick.fxDesc };
      }
    }
    return null;
  },

  /* ---------- game modes ---------- */
  winBossRushRound(round) {
    const m = this.data.modes.bossrush;
    const rw = DATA.BOSSRUSH.roundReward(this.data.campaign.maxStage, round);
    this.grant(rw);
    m.round = round;
    m.bestRound = Math.max(m.bestRound, round);
    let chest = null;
    if (round >= DATA.BOSSRUSH.rounds) {
      m.active = false;
      m.clears += 1;
      chest = DATA.BOSSRUSH.finalChest;
      this.grantChest(chest, 1);
    }
    this.save();
    return { rw, chest };
  },
  winTrialsTier(tier) {
    const rw = DATA.TRIALS.tierReward(tier);
    this.grant(rw);
    if (rw.chest) this.grantChest(rw.chest, 1);
    this.data.modes.trials.clearedTier = Math.max(this.data.modes.trials.clearedTier, tier);
    this.save();
    return rw;
  },
  winAbyssDepth(depth) {
    const rw = DATA.ABYSS.depthReward(depth);
    this.grant(rw);
    if (rw.chest) this.grantChest(rw.chest, 1);
    const a = this.data.modes.abyss;
    if (depth === a.depth) a.depth = depth + 1;
    a.best = Math.max(a.best, depth);
    this.save();
    return rw;
  },
  winTournamentRound(roundIdx) {
    const t = this.data.modes.tournament;
    const round = DATA.TOURNAMENT.rounds[roundIdx];
    this.grant(round.reward);
    if (round.reward.chest) this.grantChest(round.reward.chest, 1);
    t.round = roundIdx + 1;
    let champion = false;
    if (roundIdx >= DATA.TOURNAMENT.rounds.length - 1) {
      t.active = false;
      t.titles += 1;
      champion = true;
      if (!this.data.player.badges.includes(DATA.TOURNAMENT.badge)) {
        this.data.player.badges.push(DATA.TOURNAMENT.badge);
      }
    }
    this.save();
    return { rw: round.reward, champion };
  },

  /* ---------- dungeons (Map of Agdao) ----------
     Attempts are only consumed on VICTORY — a stuck player can
     retry a lost raid for free. 3 wins per dungeon per day. */
  dungeonRunsLeft(dgId) {
    const runs = (this.data.dungeons && this.data.dungeons.runsToday[dgId]) || 0;
    return Math.max(0, DATA.DUNGEONS.attemptsPerDay - runs);
  },
  regionUnlocked(regionId) {
    const r = DATA.AGDAO_REGION_BY_ID[regionId];
    return !!r && this.data.campaign.maxStage >= r.unlockStage;
  },
  winDungeon(dgId) {
    const dg = DATA.DUNGEON_BY_ID[dgId];
    if (!dg) return null;
    const dd = this.data.dungeons;
    dd.runsToday[dgId] = (dd.runsToday[dgId] || 0) + 1;
    dd.clears[dgId] = (dd.clears[dgId] || 0) + 1;
    const rw = DATA.DUNGEONS.reward(dg, this.data.campaign.maxStage);
    this.grant(rw);
    let gear = null, item = null;
    if (rw.gearRarities) {
      const rarity = rw.gearRarities[Math.floor(Math.random() * rw.gearRarities.length)];
      gear = this.dropGearOfRarity(rarity, DATA.DUNGEONS.stageEq(this.data.campaign.maxStage, dg));
    }
    if (rw.itemRoll) {
      const totalW = DATA.DUNGEONS.ITEM_ROLL.reduce((t, e) => t + e.w, 0);
      let r = Math.random() * totalW, tier = 'epic';
      for (const e of DATA.DUNGEONS.ITEM_ROLL) { r -= e.w; if (r <= 0) { tier = e.tier; break; } }
      const pick = this.randomItemOfTier(tier);
      item = this.grantNamedItem(pick.id);
    }
    this.save();
    return { rw, gear, item, dg };
  },

  /* ---------- achievements ---------- */
  achievementStat(statKey) {
    const d = this.data;
    switch (statKey) {
      case 'maxStage': return d.campaign.maxStage;
      case 'summons': return d.stats.summons || 0;
      case 'battles': return d.stats.battles || 0;
      case 'towerFloor': return d.tower.floor;
      case 'arenaWins': return d.arena.wins || 0;
      case 'ascends': return d.stats.ascends || 0;
      case 'chestsOpened': return d.stats.chestsOpened || 0;
      case 'rosterSize': return Object.keys(d.roster).length;
      case 'crafts': return d.stats.crafts || 0;
      default: return 0;
    }
  },
  achievementState(a) {
    const prog = Math.min(this.achievementStat(a.stat), a.goal);
    return { prog, done: prog >= a.goal, claimed: this.data.achievementsClaimed.includes(a.id) };
  },
  claimableAchievements() {
    return DATA.ACHIEVEMENTS.filter(a => { const s = this.achievementState(a); return s.done && !s.claimed; }).length;
  },
  claimAchievement(id) {
    const a = DATA.ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return null;
    const st = this.achievementState(a);
    if (!st.done || st.claimed) return null;
    this.data.achievementsClaimed.push(id);
    this.grant(a.reward);
    if (a.badge && !this.data.player.badges.includes(a.badge)) this.data.player.badges.push(a.badge);
    this.save();
    return a;
  },

  /* ---------- daily login streak ---------- */
  /* Called once at game start. Returns today's streak info the first
     time it runs on a new day (reward already granted), else null. */
  ensureLoginStreak() {
    const today = this.dayKey();
    const st = this.data.streak;
    if (st.last === today) return null;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterday = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    st.count = (st.last === yesterday) ? st.count + 1 : 1;
    st.last = today;
    const dayIdx = (st.count - 1) % DATA.LOGIN_STREAK.length;
    const entry = DATA.LOGIN_STREAK[dayIdx];
    const rw = Object.assign({}, entry.reward);
    if (rw.chest) { this.grantChest(rw.chest, 1); }
    this.grant(rw);
    this.save();
    return { count: st.count, dayIdx, entry };
  },

  /* ---------- stage sweep (instant raid) ---------- */
  sweepsLeft() { return Math.max(0, DATA.SWEEP.perDay - (this.data.sweepsToday || 0)); },
  canSweep() { return this.data.campaign.maxStage > 1 && this.sweepsLeft() > 0; },
  sweepStage() {
    if (!this.canSweep()) return null;
    const stage = Math.min(this.data.campaign.maxStage - 1, DATA.MAX_STAGE);
    const rw = DATA.stageClearRewards(stage);
    this.grant(rw);
    let gear = null;
    if (Math.random() < rw.gearChance * DATA.SWEEP.gearChanceFactor) gear = this.dropGear(stage);
    this.data.sweepsToday = (this.data.sweepsToday || 0) + 1;
    this.save();
    return { rw, gear, stage };
  },

  /* ---------- relic forge ---------- */
  craftGear(slot, rarity) {
    const opt = DATA.FORGE.options.find(o => o.rarity === rarity);
    if (!opt || !DATA.GEAR_SLOTS.includes(slot)) return null;
    if (!this.spend(opt.cost)) return null;
    this.data.forgeCount = (this.data.forgeCount || 0) + 1;
    this.data.stats.crafts = (this.data.stats.crafts || 0) + 1;
    // pity: every Nth craft upgrades the result to Mythic
    let finalRarity = rarity;
    let pity = false;
    if (this.data.forgeCount % DATA.FORGE.pityEvery === 0 && rarity !== 'mythic') {
      finalRarity = 'mythic'; pity = true;
    }
    const stage = Math.min(this.data.campaign.maxStage, DATA.MAX_STAGE);
    const g = this.dropGearOfRarity(finalRarity, stage);
    this.save();
    return { gear: g, pity };
  },
  craftsUntilPity() {
    return DATA.FORGE.pityEvery - ((this.data.forgeCount || 0) % DATA.FORGE.pityEvery);
  },

  /* ---------- formation presets ---------- */
  savePreset(idx) {
    if (!this.data.formation.length) return false;
    this.data.presets[idx] = this.data.formation.slice();
    this.save(); return true;
  },
  loadPreset(idx) {
    const p = this.data.presets[idx];
    if (!p || !p.length) return false;
    this.data.formation = p.filter(id => this.data.roster[id]).slice(0, 5);
    this.save(); return true;
  },
  /* auto-build the strongest team: top-5 by power, front-liners first */
  optimizeFormation() {
    const owned = this.ownedChampions();
    if (!owned.length) return false;
    const byPower = owned.slice().sort((a, b) => this.champPower(b) - this.champPower(a));
    const picks = byPower.slice(0, 5);
    // front-position champions into slots 1-2, everyone else behind
    const front = picks.filter(id => DATA.CHAMP_BY_ID[id].pos === 'front');
    const back = picks.filter(id => DATA.CHAMP_BY_ID[id].pos !== 'front');
    this.data.formation = front.concat(back).slice(0, 5);
    this.save(); return true;
  },

  /* ---------- purchases ---------- */
  recordPurchase(packId, price, txn) {
    this.data.purchases.push({ id: 'p' + Date.now(), packId, price, txn: txn || 'BETA', date: new Date().toISOString() });
    this.save();
  },
  hasPurchased(packId) { return this.data.purchases.some(p => p.packId === packId); },
};
