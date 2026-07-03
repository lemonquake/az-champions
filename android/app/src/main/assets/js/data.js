/* ============================================================
   AZ CHAMPIONS — Game Data
   by Aljay Leodones
   All champions, enemies, campaign, gear, quests, store.
   ============================================================ */
'use strict';

const DATA = {};

/* ---------------- Factions ----------------
   Fire > Nature > Rock > Electric > Water > Fire (Cycle 1)
   Holy > Dark > Cosmic > Aether > Wind > Holy (Cycle 2) */
DATA.FACTIONS = {
  fire:     { id: 'fire',     name: 'Fire',     color: '#ff6b35', glyph: '🔥', desc: 'Forge-lords of the burning peaks. Strong against Nature.' },
  nature:   { id: 'nature',   name: 'Nature',   color: '#52c97a', glyph: '🌿', desc: 'Wardens of the Elderroot. Strong against Rock.' },
  rock:     { id: 'rock',     name: 'Rock',     color: '#8b8589', glyph: '🪨', desc: 'Unyielding stone and earth. Strong against Electric.' },
  electric: { id: 'electric', name: 'Electric', color: '#ffeb3b', glyph: '⚡', desc: 'Sparking lightning and energy. Strong against Water.' },
  water:    { id: 'water',    name: 'Water',    color: '#38b6ff', glyph: '🌊', desc: 'Storm-callers of the drowned coast. Strong against Fire.' },
  
  holy:     { id: 'holy',     name: 'Holy',     color: '#f5c542', glyph: '☀️', desc: 'Knights and clerics sworn to the Dawnspire. Strong against Dark.' },
  dark:     { id: 'dark',     name: 'Dark',     color: '#a56bff', glyph: '🌙', desc: 'Reapers and dream-weavers of the Veil. Strong against Cosmic.' },
  cosmic:   { id: 'cosmic',   name: 'Cosmic',   color: '#ff4d6d', glyph: '🌌', desc: 'Wielders of stellar alignment. Strong against Aether.' },
  aether:   { id: 'aether',   name: 'Aether',   color: '#7cf5ff', glyph: '✨', desc: 'Essence of pure energy. Strong against Wind.' },
  wind:     { id: 'wind',     name: 'Wind',     color: '#a8e8b0', glyph: '💨', desc: 'Swirling storms and galeforce. Strong against Holy.' },
};

DATA.factionBeats = function (a, b) {
  const beats = {
    fire: 'nature',
    nature: 'rock',
    rock: 'electric',
    electric: 'water',
    water: 'fire',
    holy: 'dark',
    dark: 'cosmic',
    cosmic: 'aether',
    aether: 'wind',
    wind: 'holy'
  };
  return beats[a] === b;
};
DATA.FACTION_DMG_BONUS = 0.30;   // +30% damage with advantage
DATA.FACTION_CRIT_BONUS = 10;    // +10 crit chance with advantage

/* ---------------- Rarity / Ascension ---------------- */
DATA.TIERS = [
  { id: 0, name: 'Elite',       short: 'E',  stars: 1, mult: 1.00, cap: 80,  color: '#b45cff' },
  { id: 1, name: 'Elite+',      short: 'E+', stars: 2, mult: 1.28, cap: 100, color: '#b45cff' },
  { id: 2, name: 'Legendary',   short: 'L',  stars: 3, mult: 1.65, cap: 120, color: '#ffb14d' },
  { id: 3, name: 'Legendary+',  short: 'L+', stars: 4, mult: 2.10, cap: 140, color: '#ffb14d' },
  { id: 4, name: 'Mythic',      short: 'M',  stars: 5, mult: 2.75, cap: 160, color: '#ff5e7e' },
  { id: 5, name: 'Mythic+',     short: 'M+', stars: 6, mult: 3.55, cap: 180, color: '#ff5e7e' },
  { id: 6, name: 'Ascended',    short: 'A',  stars: 7, mult: 4.60, cap: 200, color: '#7cf5ff' },
];
DATA.ASCEND_COST = [1, 2, 2, 4, 4, 8];       // copies needed to reach tier i+1
DATA.RARE_MAX_TIER = 1;                       // rare champions cap at Elite+

DATA.getTierInfo = function(rarity, tier) {
  const baseTiers = {
    common: [
      { name: 'Common', short: 'C', color: '#b0b5c0' },
      { name: 'Common+', short: 'C+', color: '#b0b5c0' }
    ],
    uncommon: [
      { name: 'Uncommon', short: 'U', color: '#52c97a' },
      { name: 'Uncommon+', short: 'U+', color: '#52c97a' }
    ],
    rare: [
      { name: 'Rare', short: 'R', color: '#38b6ff' },
      { name: 'Rare+', short: 'R+', color: '#38b6ff' }
    ],
    elite: [
      { name: 'Elite', short: 'E', color: '#f5c542' },
      { name: 'Elite+', short: 'E+', color: '#f5c542' },
      { name: 'Legendary', short: 'L', color: '#ffb14d' },
      { name: 'Legendary+', short: 'L+', color: '#ffb14d' },
      { name: 'Mythic', short: 'M', color: '#ff5e7e' },
      { name: 'Mythic+', short: 'M+', color: '#ff5e7e' },
      { name: 'Ascended', short: 'A', color: '#7cf5ff' }
    ],
    epic: [
      { name: 'Epic', short: 'Ep', color: '#b45cff' },
      { name: 'Epic+', short: 'Ep+', color: '#b45cff' },
      { name: 'Legendary', short: 'L', color: '#ffb14d' },
      { name: 'Legendary+', short: 'L+', color: '#ffb14d' },
      { name: 'Mythic', short: 'M', color: '#ff5e7e' },
      { name: 'Mythic+', short: 'M+', color: '#ff5e7e' },
      { name: 'Ascended', short: 'A', color: '#7cf5ff' }
    ],
    mystic: [
      { name: 'Mystic', short: 'My', color: '#00e5ff' },
      { name: 'Mystic+', short: 'My+', color: '#00e5ff' },
      { name: 'Legendary', short: 'L', color: '#ffb14d' },
      { name: 'Legendary+', short: 'L+', color: '#ffb14d' },
      { name: 'Mythic', short: 'M', color: '#ff5e7e' },
      { name: 'Mythic+', short: 'M+', color: '#ff5e7e' },
      { name: 'Ascended', short: 'A', color: '#7cf5ff' }
    ],
    ultimate: [
      { name: 'Ultimate', short: 'Ul', color: '#ff9100' },
      { name: 'Ultimate+', short: 'Ul+', color: '#ff9100' },
      { name: 'Legendary', short: 'L', color: '#ffb14d' },
      { name: 'Legendary+', short: 'L+', color: '#ffb14d' },
      { name: 'Mythic', short: 'M', color: '#ff5e7e' },
      { name: 'Mythic+', short: 'M+', color: '#ff5e7e' },
      { name: 'Ascended', short: 'A', color: '#7cf5ff' }
    ],
    legendary: [
      { name: 'Legendary', short: 'L', color: '#ff3355' },
      { name: 'Legendary+', short: 'L+', color: '#ff3355' },
      { name: 'Mythic', short: 'M', color: '#ff5e7e' },
      { name: 'Mythic+', short: 'M+', color: '#ff5e7e' },
      { name: 'Ascended', short: 'A', color: '#7cf5ff' },
      { name: 'Ascended+', short: 'A+', color: '#7cf5ff' },
      { name: 'Celestial', short: 'Cel', color: '#ffe9a0' }
    ]
  };
  const list = baseTiers[rarity] || baseTiers.elite;
  const info = list[Math.min(tier, list.length - 1)];
  return {
    name: info.name,
    short: info.short,
    color: info.color,
    stars: tier + 1
  };
};


/* ---------------- Champions ----------------
   base stats are level-1. Growth handled in state.js.
   pos: preferred row. kit = { passive, skill, ult } interpreted by combat.js
------------------------------------------------ */
DATA.CHAMPIONS = [

  /* ============ THE PRIMARY SEVEN ============ */
  {
    id: 'azrin', name: 'Azrin', epithet: 'The Dawnblade', gender: 'F',
    faction: 'holy', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1150, atk: 172, def: 88, spd: 112 }, crit: 15,
    lore: 'Firstborn of the Dawnspire and the last student of the Solar Fencing Hall, Azrin duels as if sunrise itself were choreography. Her blade has never been drawn in anger — only in certainty.',
    kit: {
      passive: { name: 'First Light', desc: 'Begins battle with 50% Energy and +10% Crit for 8s.', spec: { trigger: 'battleStart', energy: 500, status: [{ kind: 'critUp', power: 10, dur: 8 }] } },
      skill: { name: 'Sunpiercer', desc: 'Dashes to the weakest enemy, striking twice for 175% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, hits: 2, dash: true } },
      ult: { name: 'Daybreak Waltz', desc: 'A blinding dance of 6 slashes on random enemies for 125% ATK each. Critical slashes add one extra slash (max 9).', spec: { type: 'damage', target: 'randomEach', mult: 1.25, hits: 6, bonusHitOnCrit: true, maxHits: 9 } },
    },
    model: { body: 'slim', bulk: 0.95, height: 1.02, weapon: 'sword', headgear: 'circlet', hair: '#f7e7b0',
      palette: { primary: '#f2e3c0', secondary: '#f5c542', accent: '#fff6d8', skin: '#f0c8a0' }, aura: '#ffe9a0' },
  },
  {
    id: 'azrael', name: 'Azrael', epithet: 'Herald of the Veil', gender: 'F',
    faction: 'dark', role: 'Assassin', rarity: 'elite', pos: 'front',
    base: { hp: 980, atk: 198, def: 62, spd: 124 }, crit: 20,
    lore: 'They say the Veil keeps a ledger of every soul, and Azrael is its collector. She is unfailingly polite about it, which somehow makes it worse.',
    kit: {
      passive: { name: 'Deathmark', desc: 'Deals +25% damage to enemies below 50% HP.', spec: { trigger: 'aura', executeBonus: 0.25 } },
      skill: { name: "Reaper's Hook", desc: 'Hooks the lowest-HP enemy for 200% ATK, healing herself for 50% of damage dealt.', cd: 8, spec: { type: 'damage', target: 'lowestHp', mult: 2.0, selfHealPct: 0.5 } },
      ult: { name: 'Harvest Eternal', desc: 'Executes the lowest-HP enemy for 330% ATK. If it kills, refunds 500 Energy and strikes again at 165%.', spec: { type: 'damage', target: 'lowestHp', mult: 3.3, chainOnKill: { mult: 1.65, energyRefund: 500 } } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.05, weapon: 'scythe', headgear: 'hood', hair: '#cfc7ff',
      palette: { primary: '#241a3a', secondary: '#a56bff', accent: '#e3d5ff', skin: '#d9c8e8' }, aura: '#b98cff' },
  },
  {
    id: 'ezekiel', name: 'Ezekiel Fitz', epithet: 'The Stormbinder', gender: 'M',
    faction: 'water', role: 'Mage', rarity: 'elite', pos: 'back',
    base: { hp: 900, atk: 205, def: 58, spd: 100 }, crit: 12,
    lore: 'Ezekiel bottled his first thunderstorm at nine years old and has been negotiating with weather ever since. The storms usually lose.',
    kit: {
      passive: { name: 'Static Charge', desc: 'Basic attacks have a 25% chance to arc to a second enemy for 70% ATK.', spec: { trigger: 'onBasic', chance: 25, chain: { mult: 0.7 } } },
      skill: { name: 'Thunderlash', desc: 'Strikes the current target for 210% ATK, arcing to 2 others for 120% ATK.', cd: 8, spec: { type: 'damage', target: 'current', mult: 2.1, splash: { count: 2, mult: 1.2 } } },
      ult: { name: 'Tempest Crown', desc: 'Calls 6 bolts on random enemies for 115% ATK, each bolt 6% stronger than the last. Victims are slowed 15% for 4s.', spec: { type: 'damage', target: 'randomEach', mult: 1.15, hits: 6, ramp: 0.06, onHit: [{ kind: 'slow', power: 15, dur: 4, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'staff', headgear: 'none', hair: '#274060',
      palette: { primary: '#16324a', secondary: '#38b6ff', accent: '#a5e3ff', skin: '#e8bd98' }, aura: '#6fd1ff' },
  },
  {
    id: 'raphael', name: 'Raphael Rich', epithet: 'The Goldenheart', gender: 'M',
    faction: 'holy', role: 'Support', rarity: 'elite', pos: 'back',
    base: { hp: 1050, atk: 148, def: 80, spd: 96 }, crit: 8,
    lore: 'A merchant-prince who liquidated his entire fortune to fund a field hospital, Raphael discovered the interest on kindness compounds better than gold.',
    kit: {
      passive: { name: 'Benediction', desc: 'Every 4th basic attack also heals the lowest-HP ally for 130% ATK.', spec: { trigger: 'everyNBasics', n: 4, heal: { target: 'lowestAlly', mult: 1.3 } } },
      skill: { name: 'Gilded Ward', desc: 'Shields the two weakest allies for 240% ATK for 6s.', cd: 9, spec: { type: 'shield', target: 'weakest2Allies', mult: 2.4, dur: 6 } },
      ult: { name: 'Golden Hour', desc: 'Heals all allies for 240% ATK and grants +20% ATK for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 2.4, onHit: [{ kind: 'atkUp', power: 20, dur: 8, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.0, height: 1.0, weapon: 'staff', headgear: 'halo', hair: '#e8d9b0',
      palette: { primary: '#fdf6e3', secondary: '#f5c542', accent: '#ffffff', skin: '#caa27c' }, aura: '#ffe9a0' },
  },
  {
    id: 'yoonsul', name: 'Yoon Sul', epithet: 'The Moonpetal Archer', gender: 'F',
    faction: 'nature', role: 'Ranger', rarity: 'elite', pos: 'back',
    base: { hp: 940, atk: 188, def: 60, spd: 118 }, crit: 18,
    lore: 'Yoon Sul fletches her arrows with petals from the Elderroot\'s thousand-year bloom. Each one lands exactly where she promised it would — she has never once promised mercy.',
    kit: {
      passive: { name: 'Petal Wind', desc: 'Every 5th basic attack becomes a volley hitting all enemies for 70% ATK.', spec: { trigger: 'everyNBasics', n: 5, dmg: { target: 'all', mult: 0.7 } } },
      skill: { name: 'Crescent Volley', desc: 'Fires 3 arrows at the lowest-HP enemy for 135% ATK each.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.35, hits: 3 } },
      ult: { name: 'Thousand Petals', desc: 'Looses 12 arrows at random enemies for 60% ATK each. Repeated hits on the same target apply Bleed.', spec: { type: 'damage', target: 'randomEach', mult: 0.6, hits: 12, bleedOnRepeat: { power: 0.3, dur: 4 } } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.98, weapon: 'bow', headgear: 'circlet', hair: '#2b2b33',
      palette: { primary: '#eef7ea', secondary: '#52c97a', accent: '#d9f5e0', skin: '#f2d3b3' }, aura: '#9df0b8' },
  },
  {
    id: 'ivcan', name: 'Ivcan', epithet: 'The Voidforged', gender: 'M',
    faction: 'dark', role: 'Tank', rarity: 'elite', paid: true, price: 9.99, pos: 'front',
    base: { hp: 2475, atk: 225, def: 192, spd: 135 }, crit: 12,
    lore: 'Forged in the collapsed heart of a dead star and quenched in the Veil itself, Ivcan does not remember being mortal. He remembers gravity, and he holds grudges the way black holes hold light.',
    kit: {
      passive: { name: 'Event Horizon', desc: 'Gains +30 extra Energy when struck and reflects 12% of damage taken.', spec: { trigger: 'onHitTaken', energy: 30, reflect: 0.12 } },
      skill: { name: 'Gravity Well', desc: 'Crushes all enemies for 135% ATK and slows them 20% for 4s.', cd: 9, spec: { type: 'damage', target: 'all', mult: 1.35, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
      ult: { name: 'Singularity', desc: 'Collapses space: 260% ATK to all enemies, stunning them for 2s, and shields himself for 300% ATK.', spec: { type: 'damage', target: 'all', mult: 2.6, onHit: [{ kind: 'stun', power: 0, dur: 2, chance: 100 }], selfShield: { mult: 3.0, dur: 8 } } },
    },
    model: { body: 'brute', bulk: 1.35, height: 1.12, weapon: 'voidreaver', headgear: 'helm', hair: '#000000',
      signature: 'ivcan', hands: 'voidgrips', feet: 'voidsteps',
      palette: { primary: '#17121f', secondary: '#5b3d99', accent: '#b98cff', skin: '#8a7ba8' }, aura: '#8b5cf6' },
  },
  {
    id: 'lemonquake', name: 'Lemon Quake', epithet: 'The Seismic Sovereign', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'ultimate', paid: true, price: 14.99, pos: 'front',
    base: { hp: 2130, atk: 278, def: 158, spd: 147 }, crit: 18,
    lore: 'Crowned king of the Citrine Fault after out-wrestling a mountain, Lemon Quake speaks softly and carries a hammer that registers on seismographs three kingdoms away. His laughter has a magnitude.',
    kit: {
      passive: { name: 'Richter Rind', desc: 'Every 4th basic attack sends a shockwave hitting all front-row enemies for 120% ATK.', spec: { trigger: 'everyNBasics', n: 4, dmg: { target: 'frontRow', mult: 1.2 } } },
      skill: { name: 'Zest Fault', desc: 'Splits the earth: 175% ATK to the target and the enemy behind it, stunning both for 1s.', cd: 8, spec: { type: 'damage', target: 'column', mult: 1.75, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 100 }] } },
      ult: { name: 'Magnitude X', desc: 'Five escalating quakes strike all enemies (70/85/100/120/150% ATK). The final quake stuns for 1.5s.', spec: { type: 'quakeSeries', target: 'all', mults: [0.7, 0.85, 1.0, 1.2, 1.5], finalStun: 1.5 } },
    },
    model: { body: 'brute', bulk: 1.4, height: 1.08, weapon: 'tectonicmaul', headgear: 'crown', hair: '#d8b02a',
      signature: 'lemonquake', hands: 'stonefists', feet: 'magmaboots',
      palette: { primary: '#4a3b28', secondary: '#f0c322', accent: '#ff8c3a', skin: '#d89b62' }, aura: '#ffd94d' },
  },

  /* ============ EXPANDED ROSTER — RADIANT ============ */
  {
    id: 'seraphelle', name: 'Seraphelle', epithet: 'Lantern of Dawn', gender: 'F',
    faction: 'holy', role: 'Mage', rarity: 'epic', pos: 'back',
    base: { hp: 880, atk: 210, def: 55, spd: 102 }, crit: 12,
    lore: 'Seraphelle carries a lantern lit from the first sunrise. She has crossed the Veil four times to bring people home, and the lantern has never gone out. Neither has she.',
    kit: {
      passive: { name: 'Searing Truth', desc: 'Basic attacks Scorch the target for 20% ATK/s for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'burn', power: 0.2, dur: 2, chance: 100 }] } },
      skill: { name: 'Prism Lance', desc: 'A piercing beam hits the target and the enemy behind it for 240% ATK.', cd: 8, spec: { type: 'damage', target: 'column', mult: 2.4 } },
      ult: { name: 'Solar Requiem', desc: 'Floods the field with light: 200% ATK to all enemies and -15% ATK for 6s.', spec: { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'atkDown', power: 15, dur: 6, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'orb', headgear: 'halo', hair: '#fff2cc',
      palette: { primary: '#fff8e6', secondary: '#ffd166', accent: '#ffffff', skin: '#e8b88a' }, aura: '#fff0b0' },
  },
  {
    id: 'bram', name: 'Justicar Bram', epithet: 'The Unbroken Bulwark', gender: 'M',
    faction: 'holy', role: 'Tank', rarity: 'epic', pos: 'front',
    base: { hp: 1720, atk: 128, def: 135, spd: 86 }, crit: 6,
    lore: 'Bram has personally read every law of the Accord aloud to an invading army, one clause at a time, while holding a mountain pass alone. The army surrendered out of respect. Or boredom.',
    kit: {
      passive: { name: 'Aegis Oath', desc: 'Allies in the back row take 12% less damage while Bram lives.', spec: { trigger: 'aura', backRowDR: 0.12 } },
      skill: { name: 'Verdict Slam', desc: 'Slams his shield for 165% ATK, stunning the target for 1.5s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.65, onHit: [{ kind: 'stun', power: 0, dur: 1.5, chance: 100 }] } },
      ult: { name: 'Last Bastion', desc: 'Taunts all enemies for 5s, shields himself for 400% ATK and gains +40% DEF for 8s.', spec: { type: 'selfBuff', taunt: 5, shield: { mult: 4.0, dur: 8 }, status: [{ kind: 'defUp', power: 40, dur: 8, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.3, height: 1.05, weapon: 'shield', headgear: 'helm', hair: '#b0885a',
      palette: { primary: '#e9e2d0', secondary: '#f5c542', accent: '#ffffff', skin: '#d8a87e' }, aura: '#ffe9a0' },
  },

  /* ============ EXPANDED ROSTER — UMBRA ============ */
  {
    id: 'nyxara', name: 'Nyxara', epithet: 'Weaver of Nightmares', gender: 'F',
    faction: 'dark', role: 'Mage', rarity: 'epic', pos: 'back',
    base: { hp: 870, atk: 215, def: 52, spd: 104 }, crit: 12,
    lore: 'Nyxara collects bad dreams the way others collect butterflies — pinned, labeled, and occasionally released back into the wild for special occasions.',
    kit: {
      passive: { name: 'Lucid Venom', desc: 'All damage-over-time effects from Nyxara tick 30% harder.', spec: { trigger: 'aura', dotAmp: 0.3 } },
      skill: { name: 'Dread Coil', desc: 'Lashes 3 random enemies for 170% ATK, applying Nightmare (25% ATK/s poison) for 3s.', cd: 8, spec: { type: 'damage', target: 'random3', mult: 1.7, onHit: [{ kind: 'poison', power: 0.25, dur: 3, chance: 100 }] } },
      ult: { name: 'Umbral Tide', desc: 'Drowns the field in shadow: 185% ATK to all enemies and 30% slow for 6s.', spec: { type: 'damage', target: 'all', mult: 1.85, onHit: [{ kind: 'slow', power: 30, dur: 6, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.88, height: 1.0, weapon: 'orb', headgear: 'horns', hair: '#3d2b66',
      palette: { primary: '#1d1430', secondary: '#7b4dff', accent: '#d8c5ff', skin: '#cbb4e0' }, aura: '#9a6bff' },
  },
  {
    id: 'vesper', name: 'Vesper Gloom', epithet: 'The Dirge-Singer', gender: 'F',
    faction: 'dark', role: 'Support', rarity: 'epic', pos: 'back',
    base: { hp: 1020, atk: 145, def: 74, spd: 94 }, crit: 8,
    lore: 'Every funeral in the Covenant ends with a song from Vesper, and every battle begins with one. Enemies who hear the opening notes have been known to apologize and leave.',
    kit: {
      passive: { name: 'Mourning Veil', desc: 'Enemies begin battle with -8% ATK.', spec: { trigger: 'battleStart', enemyStatus: [{ kind: 'atkDown', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Lament', desc: 'A grief-stricken chord deals 90% ATK to all enemies and -25% ATK to the 2 strongest for 6s.', cd: 9, spec: { type: 'damage', target: 'all', mult: 0.9, extra: { target: 'strongest2', status: [{ kind: 'atkDown', power: 25, dur: 6, chance: 100 }] } } },
      ult: { name: 'Requiem of Ash', desc: 'All enemies suffer -30% DEF for 8s and lose 150 Energy; allies are healed for 160% ATK.', spec: { type: 'composite', actions: [ { type: 'debuff', target: 'all', status: [{ kind: 'defDown', power: 30, dur: 8, chance: 100 }], energyDrain: 150 }, { type: 'heal', target: 'allAllies', mult: 1.6 } ] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'orb', headgear: 'hood', hair: '#8a7fae',
      palette: { primary: '#2a2140', secondary: '#8e7cc3', accent: '#cfc3ee', skin: '#d8cce8' }, aura: '#a08cd8' },
  },
  {
    id: 'kagemaru', name: 'Kagemaru', epithet: 'Blade of the Last Hour', gender: 'M',
    faction: 'dark', role: 'Assassin', rarity: 'epic', pos: 'front',
    base: { hp: 950, atk: 202, def: 60, spd: 130 }, crit: 22,
    lore: 'Kagemaru trained under seven masters and outlived them all — not through betrayal, but by taking their final lessons seriously. He fights like a clock striking midnight.',
    kit: {
      passive: { name: 'Shadowstep', desc: 'Dodges 25% of attacks for the first 6 seconds of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'dodge', power: 25, dur: 6, chance: 100 }] } },
      skill: { name: 'Twin Fangs', desc: 'Blinks to the backmost enemy, striking twice for 155% ATK and applying Bleed for 4s.', cd: 8, spec: { type: 'damage', target: 'backmost', mult: 1.55, hits: 2, dash: true, onHit: [{ kind: 'bleed', power: 0.25, dur: 4, chance: 100 }] } },
      ult: { name: 'Midnight Sever', desc: 'Executes the highest-ATK enemy for 290% ATK and Silences them (no Energy gain) for 4s.', spec: { type: 'damage', target: 'highestAtk', mult: 2.9, onHit: [{ kind: 'silence', power: 0, dur: 4, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'daggers', headgear: 'mask', hair: '#1c1c28',
      palette: { primary: '#1f2233', secondary: '#4e5d8c', accent: '#8f9fd8', skin: '#c8b8a8' }, aura: '#7c8ae0' },
  },

  /* ============ EXPANDED ROSTER — EMBER ============ */
  {
    id: 'pyravex', name: 'Pyra Vex', epithet: 'The Cinder Duchess', gender: 'F',
    faction: 'fire', role: 'Mage', rarity: 'mystic', pos: 'back',
    base: { hp: 860, atk: 218, def: 50, spd: 100 }, crit: 14,
    lore: 'The Duchess burned down her own castle to win an argument about interior design. History records that she was right.',
    kit: {
      passive: { name: 'Kindling', desc: 'Basic attacks Burn the target for 22% ATK/s for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'burn', power: 0.22, dur: 2, chance: 100 }] } },
      skill: { name: 'Flare Cascade', desc: 'Hurls 3 fireballs at random enemies for 135% ATK, each Burning for 3s.', cd: 8, spec: { type: 'damage', target: 'randomEach', mult: 1.35, hits: 3, onHit: [{ kind: 'burn', power: 0.25, dur: 3, chance: 100 }] } },
      ult: { name: 'Pyroclasm', desc: 'Erupts beneath all enemies for 220% ATK, Burning for 30% ATK/s over 5s.', spec: { type: 'damage', target: 'all', mult: 2.2, onHit: [{ kind: 'burn', power: 0.3, dur: 5, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'staff', headgear: 'crown', hair: '#ff7b3a',
      palette: { primary: '#3d1a12', secondary: '#ff6b35', accent: '#ffc14d', skin: '#e8a87c' }, aura: '#ff8c4d' },
  },
  {
    id: 'brandt', name: 'Brandt Koal', epithet: 'Warden of the Forge', gender: 'M',
    faction: 'fire', role: 'Tank', rarity: 'mystic', pos: 'front',
    base: { hp: 1680, atk: 132, def: 130, spd: 84 }, crit: 6,
    lore: 'Brandt was the anvil before he was the smith. Struck ten thousand times in the Great Forge\'s heart, he emerged convinced that patience is just armor you wear on the inside.',
    kit: {
      passive: { name: 'Tempered', desc: 'Gains +30% DEF while below 50% HP.', spec: { trigger: 'below50', status: [{ kind: 'defUp', power: 30, dur: 9999, chance: 100 }] } },
      skill: { name: 'Anvil Guard', desc: 'Shields himself for 260% ATK and taunts enemies for 3s.', cd: 9, spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.6, dur: 6 } } },
      ult: { name: 'Molten Rampart', desc: 'Shields all allies for 180% ATK; attackers who strike shielded allies are Burned for 4s.', spec: { type: 'shield', target: 'allAllies', mult: 1.8, dur: 8, thornsBurn: { power: 0.15, dur: 4 } } },
    },
    model: { body: 'brute', bulk: 1.38, height: 1.04, weapon: 'hammer', headgear: 'helm', hair: '#3a2a1a',
      palette: { primary: '#33241a', secondary: '#c1440e', accent: '#ff9d4d', skin: '#b57e54' }, aura: '#ff7b3a' },
  },
  {
    id: 'cinderlyn', name: 'Cinderlyn', epithet: 'The Ash Dancer', gender: 'F',
    faction: 'fire', role: 'Assassin', rarity: 'mystic', pos: 'front',
    base: { hp: 930, atk: 196, def: 58, spd: 126 }, crit: 20,
    lore: 'Cinderlyn dances in the space between spark and wildfire. Her performances sell out; her enemies burn out.',
    kit: {
      passive: { name: 'Fan the Flames', desc: 'Deals +40% damage to Burning enemies.', spec: { trigger: 'aura', bonusVsBurning: 0.4 } },
      skill: { name: 'Ember Waltz', desc: 'Dashes through the lowest-HP enemy, striking twice for 180% ATK and Burning for 3s.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.8, hits: 2, dash: true, onHit: [{ kind: 'burn', power: 0.2, dur: 3, chance: 100 }] } },
      ult: { name: 'Immolation Finale', desc: 'Strikes one enemy for 300% ATK. If the target is Burning, detonates the flames for +160% ATK bonus damage.', spec: { type: 'damage', target: 'lowestHp', mult: 3.0, detonateBurn: 1.6 } },
    },
    model: { body: 'slim', bulk: 0.88, height: 0.98, weapon: 'daggers', headgear: 'none', hair: '#ff5e3a',
      palette: { primary: '#40201a', secondary: '#ff5e3a', accent: '#ffd166', skin: '#e8b088' }, aura: '#ff7b4d' },
  },

  /* ============ EXPANDED ROSTER — TIDE ============ */
  {
    id: 'marina', name: 'Marina Vale', epithet: 'The Lighthouse Keeper', gender: 'F',
    faction: 'water', role: 'Support', rarity: 'rare', pos: 'back',
    base: { hp: 1040, atk: 150, def: 76, spd: 95 }, crit: 8,
    lore: 'For forty years the light at Vale Point never went dark, through hurricanes, sieges, and one especially stubborn kraken. Marina considers her champions just another kind of ship worth guiding home.',
    kit: {
      passive: { name: 'Harbor Light', desc: 'Her heals also grant a shield equal to 25% of the amount healed (6s).', spec: { trigger: 'aura', healShieldPct: 0.25 } },
      skill: { name: 'Restoring Tide', desc: 'Heals the two lowest-HP allies for 200% ATK.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.0 } },
      ult: { name: 'Beacon Surge', desc: 'Heals all allies for 220% ATK, cleanses damage-over-time effects, and grants +15% Speed for 6s.', spec: { type: 'heal', target: 'allAllies', mult: 2.2, cleanse: true, onHit: [{ kind: 'haste', power: 15, dur: 6, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 0.95, height: 1.0, weapon: 'staff', headgear: 'none', hair: '#cfe8f5',
      palette: { primary: '#eaf6fb', secondary: '#38b6ff', accent: '#ffffff', skin: '#e8c8a8' }, aura: '#8fdcff' },
  },
  {
    id: 'okho', name: 'Okho Reef', epithet: 'The Living Atoll', gender: 'M',
    faction: 'water', role: 'Tank', rarity: 'rare', pos: 'front',
    base: { hp: 1750, atk: 125, def: 132, spd: 82 }, crit: 6,
    lore: 'Okho slept at the bottom of the bay for a century and woke up covered in coral, barnacles, and three shipwrecks\' worth of treasure. He kept the coral.',
    kit: {
      passive: { name: 'Barnacle Hide', desc: 'Enemies who strike Okho are slowed 10% for 2s.', spec: { trigger: 'onHitTaken', attackerStatus: [{ kind: 'slow', power: 10, dur: 2, chance: 100 }] } },
      skill: { name: 'Undertow', desc: 'Drags the front row under for 145% ATK, slowing them 20% for 4s.', cd: 8, spec: { type: 'damage', target: 'frontRow', mult: 1.45, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
      ult: { name: 'Maelstrom Bulwark', desc: 'Taunts for 4s, heals himself for 300% ATK and reflects 20% of damage taken for 6s.', spec: { type: 'composite', actions: [ { type: 'selfBuff', taunt: 4, status: [{ kind: 'reflect', power: 20, dur: 6, chance: 100 }] }, { type: 'heal', target: 'self', mult: 3.0 } ] } },
    },
    model: { body: 'brute', bulk: 1.42, height: 1.06, weapon: 'fists', headgear: 'none', hair: '#2a6478',
      palette: { primary: '#1e4a5a', secondary: '#3aa8c9', accent: '#8fe8d8', skin: '#7ab8a8' }, aura: '#5fd8e8' },
  },
  {
    id: 'sirene', name: 'Sirene', epithet: 'Voice of the Deep', gender: 'F',
    faction: 'water', role: 'Mage', rarity: 'rare', pos: 'back',
    base: { hp: 890, atk: 212, def: 54, spd: 103 }, crit: 16,
    lore: 'Sailors write songs about Sirene. Sirene writes better ones back, and hers have a body count.',
    kit: {
      passive: { name: 'Resonance', desc: 'Critical hits restore 80 bonus Energy.', spec: { trigger: 'onCrit', energy: 80 } },
      skill: { name: "Siren's Kiss", desc: 'A haunting note deals 190% ATK to the strongest enemy and -20% ATK for 4s.', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 1.9, onHit: [{ kind: 'atkDown', power: 20, dur: 4, chance: 100 }] } },
      ult: { name: 'Abyssal Chorus', desc: 'A crushing chord deals 230% ATK to all enemies — doubled against enemies below 30% HP.', spec: { type: 'damage', target: 'all', mult: 2.3, executeBelow: { hpPct: 0.3, factor: 2 } } },
    },
    model: { body: 'slim', bulk: 0.88, height: 1.0, weapon: 'orb', headgear: 'circlet', hair: '#3a7ba8',
      palette: { primary: '#12293d', secondary: '#4dc3e8', accent: '#b0f0ff', skin: '#c8e0e8' }, aura: '#66d9ff' },
  },

  /* ============ EXPANDED ROSTER — VERDANT ============ */
  {
    id: 'thornwick', name: 'Thornwick', epithet: 'The Elderroot Warden', gender: 'M',
    faction: 'nature', role: 'Tank', rarity: 'rare', pos: 'front',
    base: { hp: 1700, atk: 126, def: 128, spd: 80 }, crit: 6,
    lore: 'Part treant, part gardener, entirely unmovable. Thornwick once refused to yield a footpath to an imperial legion because the moss there was "having a good year."',
    kit: {
      passive: { name: 'Deep Roots', desc: 'Regenerates 2% of max HP every 3 seconds.', spec: { trigger: 'aura', regenPct: 0.02, every: 3 } },
      skill: { name: 'Rootbind', desc: 'Roots erupt for 150% ATK on the front row, stunning for 1.2s.', cd: 9, spec: { type: 'damage', target: 'frontRow', mult: 1.5, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 100 }] } },
      ult: { name: 'Heart of the Grove', desc: 'The grove answers: heals all allies for 180% ATK and grants +30% DEF for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 1.8, onHit: [{ kind: 'defUp', power: 30, dur: 8, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.36, height: 1.1, weapon: 'fists', headgear: 'horns', hair: '#3a5a2a',
      palette: { primary: '#2f4a26', secondary: '#52c97a', accent: '#a8e8b0', skin: '#8aa87c' }, aura: '#7de89a' },
  },
  {
    id: 'fenra', name: 'Fenra Wilde', epithet: 'The Stormpaw', gender: 'F',
    faction: 'nature', role: 'Warrior', rarity: 'rare', pos: 'front',
    base: { hp: 1180, atk: 178, def: 84, spd: 116 }, crit: 14,
    lore: 'Raised by direwolves who were themselves raised by druids, Fenra\'s family reunions are complicated and her battle instincts are not.',
    kit: {
      passive: { name: 'Blood of the Pack', desc: 'Each enemy kill grants +8% ATK for the rest of battle (stacks up to 5).', spec: { trigger: 'onKill', status: [{ kind: 'atkUp', power: 8, dur: 9999, chance: 100 }], maxStacks: 5 } },
      skill: { name: 'Savage Rend', desc: 'Rends the target for 200% ATK, applying Bleed (25% ATK/s) for 4s.', cd: 7, spec: { type: 'damage', target: 'current', mult: 2.0, onHit: [{ kind: 'bleed', power: 0.25, dur: 4, chance: 100 }] } },
      ult: { name: 'Feral Ascension', desc: 'Unleashes the wild: +50% ATK, +40% Speed and 30% lifesteal for 10s.', spec: { type: 'selfBuff', status: [ { kind: 'atkUp', power: 50, dur: 10, chance: 100 }, { kind: 'haste', power: 40, dur: 10, chance: 100 }, { kind: 'lifesteal', power: 30, dur: 10, chance: 100 } ] } },
    },
    model: { body: 'std', bulk: 1.05, height: 1.0, weapon: 'daggers', headgear: 'horns', hair: '#a87c4a',
      palette: { primary: '#4a3a26', secondary: '#7ac952', accent: '#d8e8a0', skin: '#e0b88a' }, aura: '#a0e87a' },
  },

  /* ============ RARE POOL (summon filler, cap Elite+) ============ */
  {
    id: 'perrin', name: 'Perrin', epithet: 'Shield Cadet', gender: 'M',
    faction: 'holy', role: 'Tank', rarity: 'common', pos: 'front',
    base: { hp: 1350, atk: 105, def: 100, spd: 84 }, crit: 5,
    lore: 'Perrin polishes his shield every night and names every dent. He is going to make Justicar someday, and absolutely everyone knows it except him.',
    kit: {
      passive: { name: 'Steady Drill', desc: '+10% DEF at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Shield Bash', desc: 'Bashes the target for 150% ATK.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.5 } },
      ult: { name: 'Hold the Line', desc: 'Taunts for 3s and shields himself for 250% ATK.', spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.5, dur: 6 } } },
    },
    model: { body: 'std', bulk: 1.15, height: 1.0, weapon: 'shield', headgear: 'helm', hair: '#8a6a4a',
      palette: { primary: '#d8d0c0', secondary: '#c9a542', accent: '#f0e8d8', skin: '#e0b088' }, aura: '#ffe9a0' },
  },
  {
    id: 'vosk', name: 'Vosk', epithet: 'Ashen Recruit', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'common', pos: 'front',
    base: { hp: 1150, atk: 140, def: 72, spd: 100 }, crit: 10,
    lore: 'Vosk joined the Dominion for the signing bonus and stayed for the flamethrower privileges.',
    kit: {
      passive: { name: 'Hot-Blooded', desc: '+10% ATK at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'atkUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Cinder Chop', desc: 'Chops for 160% ATK with a chance to Burn.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'burn', power: 0.15, dur: 3, chance: 50 }] } },
      ult: { name: 'Reckless Blaze', desc: 'Strikes the front row for 190% ATK.', spec: { type: 'damage', target: 'frontRow', mult: 1.9 } },
    },
    model: { body: 'std', bulk: 1.1, height: 1.0, weapon: 'sword', headgear: 'none', hair: '#4a2a1a',
      palette: { primary: '#5a3a2a', secondary: '#e06b35', accent: '#ffb066', skin: '#c89068' }, aura: '#ff8c4d' },
  },
  {
    id: 'nimue', name: 'Nimue', epithet: 'Tidecaller Adept', gender: 'F',
    faction: 'water', role: 'Mage', rarity: 'common', pos: 'back',
    base: { hp: 780, atk: 158, def: 48, spd: 98 }, crit: 10,
    lore: 'Nimue graduated third in her class at the Drowned Academy. The first two are currently fish.',
    kit: {
      passive: { name: 'Tidal Focus', desc: '+15 Energy on basic attacks.', spec: { trigger: 'onBasic', chance: 100, energy: 15 } },
      skill: { name: 'Water Bolt', desc: 'A pressurized bolt for 170% ATK.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.7 } },
      ult: { name: 'Wavebreak', desc: 'A crashing wave deals 150% ATK to all enemies.', spec: { type: 'damage', target: 'all', mult: 1.5 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.97, weapon: 'staff', headgear: 'none', hair: '#6ab8d8',
      palette: { primary: '#2a5a7a', secondary: '#5ac8e8', accent: '#c0ecff', skin: '#e8cfae' }, aura: '#8fdcff' },
  },
  {
    id: 'fyn', name: 'Fyn', epithet: 'Bramblekin Scout', gender: 'M',
    faction: 'nature', role: 'Ranger', rarity: 'common', pos: 'back',
    base: { hp: 800, atk: 152, def: 50, spd: 112 }, crit: 14,
    lore: 'Fyn can track a sparrow through a thunderstorm, but has been lost in the same tavern twice.',
    kit: {
      passive: { name: 'Keen Eye', desc: '+8% Crit at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Thorn Shot', desc: 'Snipes the lowest-HP enemy for 165% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.65 } },
      ult: { name: 'Twin Bramble', desc: 'Two heavy shots at random enemies for 180% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.8, hits: 2 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.95, weapon: 'bow', headgear: 'hood', hair: '#5a7a3a',
      palette: { primary: '#3a5a2a', secondary: '#7ac952', accent: '#c8e8a0', skin: '#d8b088' }, aura: '#9df0b8' },
  },
  {
    id: 'morr', name: 'Morr', epithet: 'Gravewisp', gender: 'F',
    faction: 'dark', role: 'Support', rarity: 'common', pos: 'back',
    base: { hp: 850, atk: 118, def: 55, spd: 92 }, crit: 6,
    lore: 'Morr is either a very small ghost or a very committed girl in a sheet. The Covenant\'s HR department has stopped asking.',
    kit: {
      passive: { name: 'Chill Presence', desc: 'Enemies who strike Morr lose 20 Energy.', spec: { trigger: 'onHitTaken', attackerEnergyDrain: 20 } },
      skill: { name: 'Soothing Wisp', desc: 'Heals the lowest-HP ally for 180% ATK.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 1.8 } },
      ult: { name: 'Vigil of the Lost', desc: 'Heals all allies for 130% ATK.', spec: { type: 'heal', target: 'allAllies', mult: 1.3 } },
    },
    model: { body: 'slim', bulk: 0.85, height: 0.92, weapon: 'orb', headgear: 'hood', hair: '#c8c0e8',
      palette: { primary: '#3a3352', secondary: '#9a8cc8', accent: '#e0d8f8', skin: '#e8e0f0' }, aura: '#b8a8e8' },
  },

  /* ============ NEW EXPANDED CHAMPIONS (10 UNIQUE DESIGNS) ============ */
  {
    id: 'aljay', name: 'Aljay', epithet: 'The Legendary Creator', gender: 'M',
    faction: 'aether', role: 'Mage', rarity: 'legendary', paid: true, price: 99.99, pos: 'back',
    base: { hp: 1875, atk: 375, def: 120, spd: 173 }, crit: 38,
    lore: 'Aljay Leodones, creator of the realm of AZ Champions. With a strike of his keyboard, code compiles and universes shift. His presence alone dictates the laws of physics.',
    kit: {
      passive: { name: 'Source Code', desc: 'Begins battle with 50% Energy and +10% Crit for 8s.', spec: { trigger: 'battleStart', energy: 500, status: [{ kind: 'critUp', power: 10, dur: 8 }] } },
      skill: { name: 'Vampiric Strike', desc: 'Strikes the highest ATK enemy for 220% ATK, silencing them for 3s and injecting a Vampiric Curse: 25% ATK drained per second for 5s, healing your lowest-HP ally for every point drained.', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 2.2, onHit: [{ kind: 'silence', power: 0, dur: 3, chance: 100 }, { kind: 'vampiric', power: 0.25, dur: 5, chance: 100 }] } },
      ult: { name: 'Antigravity Strike', desc: 'Deals 320% ATK damage to all enemies, stunning them for 2s and cursing them with Vampiric drain (15% ATK/s for 4s).', spec: { type: 'damage', target: 'all', mult: 3.2, onHit: [{ kind: 'stun', power: 0, dur: 2, chance: 100 }, { kind: 'vampiric', power: 0.15, dur: 4, chance: 100 }] } }
    },
    model: { body: 'std', bulk: 1.08, height: 1.05, weapon: 'elderstaff', headgear: 'crown', hair: '#1a1a2e',
      signature: 'aljay', hands: 'clawtips', feet: 'sabatons',
      palette: { primary: '#2a040a', secondary: '#c1122f', accent: '#ff5e70', skin: '#d8a080' }, aura: '#ff1e3c' },
  },
  {
    id: 'azrana', name: 'Azrana', epithet: 'The Dawn Eternal', gender: 'F',
    faction: 'holy', role: 'Support', rarity: 'legendary', pos: 'back',
    base: { hp: 1260, atk: 172, def: 90, spd: 104 }, crit: 10,
    lore: 'When the Veil took her sister, Azrana followed it into death and argued her way back out. Death, embarrassed, granted her one standing exception. She has been spending it on other people ever since.',
    kit: {
      passive: { name: 'Divine Resurrection', desc: 'The first time Azrana takes fatal damage each battle, she instantly revives with 50% HP and the entire party becomes invulnerable for 3s. Once per battle.', spec: { trigger: 'onFatal', revivePct: 0.5, partyInvuln: 3 } },
      skill: { name: 'Aurora Mend', desc: 'Heals the two weakest allies for 240% ATK and cleanses damage-over-time effects.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.4, cleanse: true } },
      ult: { name: 'LIGHT WITHOUT END', desc: 'Dawn refuses the dark: heals all allies for 270% ATK and shields them for 120% ATK for 6s.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 2.7 }, { type: 'shield', target: 'allAllies', mult: 1.2, dur: 6 } ] } },
    },
    model: { body: 'valkyrie', bulk: 0.92, height: 1.04, weapon: 'celestorb', headgear: 'sunhalo', hair: '#ffe9c0',
      palette: { primary: '#fff4dc', secondary: '#ffd166', accent: '#ffffff', skin: '#f0d0a8' }, aura: '#ffe9a0' },
  },
  {
    id: 'jolt', name: 'Jolt', epithet: 'Spark of the Spire', gender: 'M',
    faction: 'electric', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 820, atk: 165, def: 52, spd: 114 }, crit: 18,
    lore: 'A hyperactive scout whose boots spark with raw kinetic static. He claims he cannot stand still because the ground moves too slowly.',
    kit: {
      passive: { name: 'Overcharge', desc: 'Begins battle with +15% Crit for 8s.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 15, dur: 8 }] } },
      skill: { name: 'Lightning Bolt', desc: 'Shoots the lowest HP enemy for 180% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.8 } },
      ult: { name: 'Thunder Storm', desc: 'Strikes all enemies for 160% ATK.', spec: { type: 'damage', target: 'all', mult: 1.6 } }
    },
    model: { body: 'slim', bulk: 0.88, height: 0.98, weapon: 'bow', headgear: 'mask', hair: '#ffd700',
      palette: { primary: '#111111', secondary: '#ffeb3b', accent: '#ffffff', skin: '#e8bd98' }, aura: '#ffeb3b' },
  },
  {
    id: 'crag', name: 'Crag', epithet: 'Gravel Giant', gender: 'M',
    faction: 'rock', role: 'Tank', rarity: 'uncommon', pos: 'front',
    base: { hp: 1600, atk: 122, def: 125, spd: 82 }, crit: 6,
    lore: 'Formed from old volcanic debris, Crag moves with geological pacing but strikes with tectonic force. He likes quiet days and long rests.',
    kit: {
      passive: { name: 'Stonewall', desc: 'Gains 15% DEF at start of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 15, dur: 9999 }] } },
      skill: { name: 'Earthquake Slam', desc: 'Slam target for 140% ATK and slows 15% for 3s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.4, onHit: [{ kind: 'slow', power: 15, dur: 3, chance: 100 }] } },
      ult: { name: 'Gravel Fortress', desc: 'Taunts for 3s and shields self for 280% ATK.', spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.8, dur: 6 } } }
    },
    model: { body: 'brute', bulk: 1.35, height: 1.05, weapon: 'hammer', headgear: 'mask', hair: '#4e4e4e',
      palette: { primary: '#3e2723', secondary: '#8b8589', accent: '#d7ccc8', skin: '#a1887f' }, aura: '#8b8589' },
  },
  {
    id: 'gale', name: 'Gale', epithet: 'The Whistling Dervish', gender: 'F',
    faction: 'wind', role: 'Assassin', rarity: 'uncommon', pos: 'front',
    base: { hp: 960, atk: 195, def: 58, spd: 125 }, crit: 20,
    lore: 'Born in the eye of a desert sandstorm, Gale dances through battlefield ranks like a loose breeze — sharp, fast, and impossible to pin down.',
    kit: {
      passive: { name: 'Tailwind', desc: 'Gains +20% Speed for the first 8s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 20, dur: 8 }] } },
      skill: { name: 'Cyclone Slice', desc: 'Slashes the backmost enemy for 190% ATK.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.9, dash: true } },
      ult: { name: 'Tornado Dance', desc: 'Strikes random enemies 5 times for 140% ATK each, with a 30% chance to stun for 1s per hit.', spec: { type: 'damage', target: 'randomEach', mult: 1.4, hits: 5, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 30 }] } }
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'daggers', headgear: 'circlet', hair: '#b2dfdb',
      palette: { primary: '#004d40', secondary: '#a8e8b0', accent: '#e0f2f1', skin: '#ffe0b2' }, aura: '#a8e8b0' },
  },
  {
    id: 'nova', name: 'Nova', epithet: 'Nebula Witch', gender: 'F',
    faction: 'cosmic', role: 'Mage', rarity: 'mystic', pos: 'back',
    base: { hp: 880, atk: 208, def: 54, spd: 102 }, crit: 14,
    lore: 'Nova spends her nights mapping constellations that do not exist yet. Her magic calls down pieces of the void to rearrange local geometry.',
    kit: {
      passive: { name: 'Nebula Focus', desc: 'Heals herself for 2% of max HP every 3 seconds.', spec: { trigger: 'aura', regenPct: 0.02, every: 3 } },
      skill: { name: 'Starfall', desc: 'Strikes 2 random enemies for 180% ATK.', cd: 8, spec: { type: 'damage', target: 'randomEach', mult: 1.8, hits: 2 } },
      ult: { name: 'Supernova', desc: 'Explodes for 240% ATK damage to all enemies, slowing them by 20% for 4s.', spec: { type: 'damage', target: 'all', mult: 2.4, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } }
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'staff', headgear: 'halo', hair: '#e040fb',
      palette: { primary: '#311b92', secondary: '#ff4d6d', accent: '#b388ff', skin: '#f3e5f5' }, aura: '#ff4d6d' },
  },
  {
    id: 'astral', name: 'Astral', epithet: 'Aether Herald', gender: 'M',
    faction: 'aether', role: 'Support', rarity: 'mystic', pos: 'back',
    base: { hp: 1050, atk: 152, def: 78, spd: 96 }, crit: 8,
    lore: 'A monk who speaks only in harmonics. He channels the fundamental background hum of the universe to shield his allies and disrupt his foes.',
    kit: {
      passive: { name: 'Aether Shield', desc: 'Every 5th basic attack shields the weakest ally for 150% ATK.', spec: { trigger: 'everyNBasics', n: 5, shield: { target: 'lowestAlly', mult: 1.5, dur: 5 } } },
      skill: { name: 'Essence Pulse', desc: 'Heals the two weakest allies for 180% ATK.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 1.8 } },
      ult: { name: 'Cosmic Rebirth', desc: 'Heals all allies for 220% ATK and increases their DEF by 20% for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 2.2, onHit: [{ kind: 'defUp', power: 20, dur: 8, chance: 100 }] } }
    },
    model: { body: 'std', bulk: 0.98, height: 1.02, weapon: 'staff', headgear: 'hood', hair: '#b2ebf2',
      palette: { primary: '#006064', secondary: '#7cf5ff', accent: '#e0f7fa', skin: '#fff9c4' }, aura: '#7cf5ff' },
  },
  {
    id: 'ignis', name: 'Ignis', epithet: 'Flame Vanguard', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'uncommon', pos: 'front',
    base: { hp: 1200, atk: 182, def: 86, spd: 110 }, crit: 16,
    lore: 'Ignis commands the forward shocktroops of the Firepeaks. His blade is continuously heated to a dull orange glow, melting shields upon contact.',
    kit: {
      passive: { name: 'Furious Flame', desc: 'Gains +15% ATK when below 50% HP.', spec: { trigger: 'below50', status: [{ kind: 'atkUp', power: 15, dur: 9999 }] } },
      skill: { name: 'Blazing Dash', desc: 'Dashes and strikes the weakest enemy for 170% ATK, burning them for 2s.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.7, dash: true, onHit: [{ kind: 'burn', power: 0.2, dur: 2, chance: 100 }] } },
      ult: { name: 'Inferno Cleave', desc: 'Slashes the front row for 230% ATK, burning them for 4s.', spec: { type: 'damage', target: 'frontRow', mult: 2.3, onHit: [{ kind: 'burn', power: 0.25, dur: 4, chance: 100 }] } }
    },
    model: { body: 'std', bulk: 1.05, height: 1.0, weapon: 'sword', headgear: 'helm', hair: '#d84315',
      palette: { primary: '#4e342e', secondary: '#ff6b35', accent: '#ffb74d', skin: '#ffcc80' }, aura: '#ff6b35' },
  },
  {
    id: 'vortex', name: 'Vortex', epithet: 'Abyssal Channeler', gender: 'M',
    faction: 'water', role: 'Mage', rarity: 'uncommon', pos: 'back',
    base: { hp: 900, atk: 215, def: 55, spd: 100 }, crit: 14,
    lore: 'A silent exile from the deep sea trenches who commands localized pressure systems. He can drown an enemy on dry land by condensing the air around them.',
    kit: {
      passive: { name: 'Flowing Mind', desc: 'Critical hits restore 80 bonus Energy.', spec: { trigger: 'onCrit', energy: 80 } },
      skill: { name: 'Water Spout', desc: 'Strikes the target and the enemy behind for 210% ATK.', cd: 8, spec: { type: 'damage', target: 'column', mult: 2.1 } },
      ult: { name: 'Tsunami', desc: 'Deals 200% ATK to all enemies and slows them by 25% for 5s.', spec: { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'slow', power: 25, dur: 5, chance: 100 }] } }
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'staff', headgear: 'circlet', hair: '#00bcd4',
      palette: { primary: '#006064', secondary: '#38b6ff', accent: '#b2ebf2', skin: '#e0f7fa' }, aura: '#38b6ff' },
  },
  {
    id: 'celestia', name: 'Celestia', epithet: 'Nova Empress', gender: 'F',
    faction: 'cosmic', role: 'Support', rarity: 'legendary', pos: 'back',
    base: { hp: 1100, atk: 158, def: 82, spd: 98 }, crit: 10,
    lore: 'The sovereign of a forgotten lunar dynasty. Celestia treats battles like royal audiences, directing starlight to shield her subjects and blind her detractors.',
    kit: {
      passive: { name: 'Starlight Blessing', desc: 'Allies in the back row take 10% less damage.', spec: { trigger: 'aura', backRowDR: 0.10 } },
      skill: { name: 'Astral Ward', desc: 'Shields the two weakest allies for 250% ATK for 6s.', cd: 9, spec: { type: 'shield', target: 'weakest2Allies', mult: 2.5, dur: 6 } },
      ult: { name: 'Celestial Harmony', desc: 'Heals all allies for 250% ATK and grants them +15% Speed for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 2.5, onHit: [{ kind: 'haste', power: 15, dur: 8, chance: 100 }] } }
    },
    model: { body: 'slim', bulk: 0.88, height: 1.0, weapon: 'orb', headgear: 'crown', hair: '#f3e5f5',
      palette: { primary: '#4a148c', secondary: '#ff4d6d', accent: '#ea80fc', skin: '#e1bee7' }, aura: '#ff9d2e' },
  },
  {
    id: 'terra', name: 'Terra', epithet: 'Tectonic Sovereign', gender: 'F',
    faction: 'rock', role: 'Warrior', rarity: 'ultimate', pos: 'front',
    base: { hp: 1450, atk: 190, def: 110, spd: 95 }, crit: 15,
    lore: 'A gladiator whose skin is crusted with pure diamonds. Terra does not dodge attacks — she welcomes them, turning the kinetic impact back into explosive shards.',
    kit: {
      passive: { name: 'Grit', desc: 'Reflects 15% of damage taken.', spec: { trigger: 'onHitTaken', reflect: 0.15 } },
      skill: { name: 'Avalanche Strike', desc: 'Crushes the front row for 150% ATK and stuns them for 1s.', cd: 9, spec: { type: 'damage', target: 'frontRow', mult: 1.5, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 100 }] } },
      ult: { name: 'Earth Shatter', desc: 'Deals 280% ATK to all enemies and stuns them for 1.5s.', spec: { type: 'damage', target: 'all', mult: 2.8, onHit: [{ kind: 'stun', power: 0, dur: 1.5, chance: 100 }] } }
    },
    model: { body: 'brute', bulk: 1.3, height: 1.12, weapon: 'greatsword', headgear: 'horns', hair: '#3e2723',
      palette: { primary: '#1a0f0d', secondary: '#8b8589', accent: '#ffd54f', skin: '#d7ccc8' }, aura: '#ffb14d' },
  },

  /* ============ THE UNIQUE TEN — signature weapon designs ============ */
  {
    id: 'voltessa', name: 'Voltessa', epithet: 'Empress of the Storm Spire', gender: 'F',
    faction: 'electric', role: 'Mage', rarity: 'legendary', pos: 'back',
    base: { hp: 1080, atk: 242, def: 70, spd: 108 }, crit: 18,
    lore: 'Voltessa was struck by lightning seven times before her coronation, and the eighth bolt knelt. Her scepter is the only throne she has ever needed, and the sky signs its treaties in her name.',
    kit: {
      passive: { name: 'Static Court', desc: 'Basic attacks arc to a second enemy for 80% ATK (40% chance).', spec: { trigger: 'onBasic', chance: 40, chain: { mult: 0.8 } } },
      skill: { name: 'Scepter of Storms', desc: 'Calls 4 bolts on random enemies for 145% ATK, each with a 25% chance to stun for 1s.', cd: 8, spec: { type: 'damage', target: 'randomEach', mult: 1.45, hits: 4, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 25 }] } },
      ult: { name: 'CORONATION: MAELSTROM', desc: 'The sky answers: 8 escalating bolts on random enemies for 120% ATK, each 8% stronger. The final bolt hits all enemies.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'randomEach', mult: 1.2, hits: 7, ramp: 0.08 }, { type: 'damage', target: 'all', mult: 1.9, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } ] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.05, weapon: 'scepter', headgear: 'crown', hair: '#fff59d',
      palette: { primary: '#1a1a2e', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#ffee58' },
  },
  {
    id: 'kensei', name: 'Kensei', epithet: 'The Hundred-Blade Shogun', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'ultimate', pos: 'front',
    base: { hp: 1380, atk: 200, def: 96, spd: 106 }, crit: 18,
    lore: 'Kensei has broken ninety-nine blades in ninety-nine wars and forged each shard into his armor. The hundredth blade has never been drawn to less than total victory.',
    kit: {
      passive: { name: 'Iaijutsu', desc: 'Opens every battle with +100% Crit and +30% ATK for 3s — the first draw never misses.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 100, dur: 3, chance: 100 }, { kind: 'atkUp', power: 30, dur: 3, chance: 100 }] } },
      skill: { name: 'Crimson Draw', desc: 'Dashes through the weakest enemy: 2 slashes of 165% ATK that Bleed for 4s.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.65, hits: 2, dash: true, onHit: [{ kind: 'bleed', power: 0.22, dur: 4, chance: 100 }] } },
      ult: { name: 'HUNDREDTH BLADE', desc: 'An unrepeatable stance: 7 slashes on random enemies for 115% ATK. Critical slashes grant Kensei +8% ATK for the rest of battle.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'randomEach', mult: 1.15, hits: 7 }, { type: 'selfBuff', status: [{ kind: 'atkUp', power: 12, dur: 9999, chance: 100 }] } ] } },
    },
    model: { body: 'std', bulk: 1.1, height: 1.03, weapon: 'katana', headgear: 'kabuto', hair: '#1c1c28',
      palette: { primary: '#7a1f1f', secondary: '#ff6b35', accent: '#ffd166', skin: '#e0b088' }, aura: '#ff7043' },
  },
  {
    id: 'lumina', name: 'Lumina', epithet: 'The Dawnspear Oracle', gender: 'F',
    faction: 'aether', role: 'Mage', rarity: 'ultimate', pos: 'back',
    base: { hp: 1020, atk: 232, def: 68, spd: 104 }, crit: 15,
    lore: 'Lumina sees every battle three heartbeats before it happens, and her spear of woven starlight arrives exactly two heartbeats early. The extra heartbeat is for mercy — she rarely uses it.',
    kit: {
      passive: { name: 'Prescience', desc: 'Begins battle with 40% Energy and grants all allies +10% Speed for 8s.', spec: { trigger: 'battleStart', energy: 400, status: [{ kind: 'haste', power: 10, dur: 8, chance: 100 }] } },
      skill: { name: 'Lance of First Light', desc: 'Pierces the target column for 230% ATK, reducing their ATK by 15% for 5s.', cd: 8, spec: { type: 'damage', target: 'column', mult: 2.3, onHit: [{ kind: 'atkDown', power: 15, dur: 5, chance: 100 }] } },
      ult: { name: 'DAWN ETERNAL', desc: 'Reality blooms: 240% ATK to all enemies, and allies are healed for 120% ATK.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'all', mult: 2.4 }, { type: 'heal', target: 'allAllies', mult: 1.2 } ] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.04, weapon: 'spear', headgear: 'flame', hair: '#e1f5fe',
      palette: { primary: '#e8f7ff', secondary: '#7cf5ff', accent: '#ffffff', skin: '#f0d8b8' }, aura: '#a5f3ff' },
  },
  {
    id: 'sylvara', name: 'Sylvara', epithet: 'Heartsong of the Wild', gender: 'F',
    faction: 'nature', role: 'Support', rarity: 'mystic', pos: 'back',
    base: { hp: 1120, atk: 150, def: 78, spd: 98 }, crit: 8,
    lore: 'Every creature in the Elderroot knows one verse of the Heartsong. Sylvara knows them all, and when she plays her living harp, even wounds remember how to close.',
    kit: {
      passive: { name: 'Verdant Chord', desc: 'Her heals also grant +10% ATK for 4s.', spec: { trigger: 'aura', healShieldPct: 0.15 } },
      skill: { name: 'Ballad of Bloom', desc: 'Heals the two weakest allies for 210% ATK and cleanses damage-over-time effects.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.1, cleanse: true } },
      ult: { name: 'SYMPHONY OF SEASONS', desc: 'Four seasons in four bars: heals all allies for 200% ATK, grants +18% ATK and +18% Speed for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 2.0, onHit: [{ kind: 'atkUp', power: 18, dur: 8, chance: 100 }, { kind: 'haste', power: 18, dur: 8, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'harp', headgear: 'antlers', hair: '#8bc34a',
      palette: { primary: '#2f4a26', secondary: '#7ac952', accent: '#eaffd0', skin: '#e8cfa8' }, aura: '#a5e87a' },
  },
  {
    id: 'aegisia', name: 'Aegisia', epithet: 'The Living Rampart', gender: 'F',
    faction: 'rock', role: 'Tank', rarity: 'mystic', pos: 'front',
    base: { hp: 1780, atk: 128, def: 140, spd: 82 }, crit: 6,
    lore: 'When the walls of Fort Kelder fell, Aegisia picked up the gate and kept fighting. The fort was rebuilt around her stance; the architects simply drew where she was standing.',
    kit: {
      passive: { name: 'Bulwark Oath', desc: 'Allies in the back row take 12% less damage while Aegisia lives.', spec: { trigger: 'aura', backRowDR: 0.12 } },
      skill: { name: 'Lance Vault', desc: 'Slams her lance for 160% ATK on the front row, stunning for 1.2s.', cd: 9, spec: { type: 'damage', target: 'frontRow', mult: 1.6, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 100 }] } },
      ult: { name: 'UNBREAKABLE', desc: 'Plants the banner-lance: taunts 5s, shields herself for 380% ATK and reflects 25% of damage for 8s.', spec: { type: 'selfBuff', taunt: 5, shield: { mult: 3.8, dur: 8 }, status: [{ kind: 'reflect', power: 25, dur: 8, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.28, height: 1.06, weapon: 'lance', headgear: 'plume', hair: '#bcaaa4',
      palette: { primary: '#4e4438', secondary: '#c0a06a', accent: '#ffd54f', skin: '#d8b08a' }, aura: '#d8bd7a' },
  },
  {
    id: 'zephyrion', name: 'Zephyrion', epithet: 'Sovereign of the Nine Winds', gender: 'M',
    faction: 'wind', role: 'Ranger', rarity: 'epic', pos: 'back',
    base: { hp: 920, atk: 205, def: 58, spd: 122 }, crit: 19,
    lore: 'Zephyrion carries nine chakrams, one for each wind he has tamed. He only ever throws one — the other eight are for winds that might get ideas.',
    kit: {
      passive: { name: 'Tailwind Court', desc: 'All allies gain +8% Speed while Zephyrion lives.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Ninefold Arc', desc: 'A chakram carves through 3 random enemies for 150% ATK.', cd: 7, spec: { type: 'damage', target: 'random3', mult: 1.5 } },
      ult: { name: 'WINDS OF THE COMPASS', desc: 'All nine winds fly: 9 chakram strikes on random enemies for 75% ATK each, slowing victims 15% for 3s.', spec: { type: 'damage', target: 'randomEach', mult: 0.75, hits: 9, onHit: [{ kind: 'slow', power: 15, dur: 3, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.02, weapon: 'chakram', headgear: 'wings', hair: '#e0f2f1',
      palette: { primary: '#00463a', secondary: '#a8e8b0', accent: '#e0fff2', skin: '#e8c8a0' }, aura: '#b8f0c8' },
  },
  {
    id: 'umbrax', name: 'Umbrax', epithet: 'The Void Reaper', gender: 'M',
    faction: 'dark', role: 'Assassin', rarity: 'epic', pos: 'front',
    base: { hp: 940, atk: 210, def: 58, spd: 132 }, crit: 24,
    lore: 'Umbrax\'s claws were grown, not forged — cultured in a garden where light was never invented. He does not sneak; the darkness simply agrees to arrive with him.',
    kit: {
      passive: { name: 'Lightless Garden', desc: 'Deals +30% damage to enemies below 40% HP.', spec: { trigger: 'aura', executeBonus: 0.3 } },
      skill: { name: 'Umbral Rend', desc: 'Blinks behind the backmost enemy: 3 claw strikes of 120% ATK, applying Bleed for 4s.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.2, hits: 3, dash: true, onHit: [{ kind: 'bleed', power: 0.2, dur: 4, chance: 100 }] } },
      ult: { name: 'GARDEN OF NIGHT', desc: 'Executes the lowest-HP enemy for 320% ATK. On kill, refunds 400 Energy and Silences the next weakest for 3s.', spec: { type: 'damage', target: 'lowestHp', mult: 3.2, chainOnKill: { mult: 1.4, energyRefund: 400 }, onHit: [{ kind: 'silence', power: 0, dur: 3, chance: 50 }] } },
    },
    model: { body: 'slim', bulk: 0.95, height: 1.02, weapon: 'claws', headgear: 'visor', hair: '#12081f',
      palette: { primary: '#160e2a', secondary: '#8a4af8', accent: '#e8d0ff', skin: '#b8a8d8' }, aura: '#9a5cff' },
  },
  {
    id: 'solaria', name: 'Solaria', epithet: 'Blade of the First Dawn', gender: 'F',
    faction: 'holy', role: 'Warrior', rarity: 'epic', pos: 'front',
    base: { hp: 1240, atk: 186, def: 90, spd: 110 }, crit: 15,
    lore: 'Solaria\'s twinblades are two halves of the same sunrise, split by an oath. Sheathed, they are night. Drawn together, they are the exact moment the dark gives up.',
    kit: {
      passive: { name: 'Sunrise Oath', desc: 'Every 4th basic attack strikes twice and heals Solaria for 60% ATK.', spec: { trigger: 'everyNBasics', n: 4, dmg: { target: 'current', mult: 1.0 }, heal: { target: 'self', mult: 0.6 } } },
      skill: { name: 'Twin Daybreak', desc: 'Cross-slashes the target for 190% ATK twice.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.9, hits: 2 } },
      ult: { name: 'FIRST LIGHT UNSHEATHED', desc: 'Both dawns drawn: 6 radiant slashes on random enemies for 110% ATK; allies are mended for 30% ATK and gain +12% ATK for 6s.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'randomEach', mult: 1.1, hits: 6 }, { type: 'heal', target: 'allAllies', mult: 0.3, onHit: [{ kind: 'atkUp', power: 12, dur: 6, chance: 100 }] } ] } },
    },
    model: { body: 'slim', bulk: 1.0, height: 1.02, weapon: 'twinblades', headgear: 'wings', hair: '#fff3c0',
      palette: { primary: '#f7ecd0', secondary: '#f5c542', accent: '#ffffff', skin: '#f0c8a0' }, aura: '#ffe9a0' },
  },
  {
    id: 'maelis', name: 'Maelis', epithet: 'The Tidecaller Admiral', gender: 'F',
    faction: 'water', role: 'Ranger', rarity: 'epic', pos: 'back',
    base: { hp: 950, atk: 198, def: 62, spd: 108 }, crit: 16,
    lore: 'Admiral Maelis lost her fleet to the abyss and negotiated it back with interest. Her shoulder-cannon fires compressed maelstroms, and her aim has ended three naval eras.',
    kit: {
      passive: { name: 'Broadside Doctrine', desc: 'Every 5th basic attack fires a barrage hitting all enemies for 65% ATK.', spec: { trigger: 'everyNBasics', n: 5, dmg: { target: 'all', mult: 0.65 } } },
      skill: { name: 'Depth Charge', desc: 'Lobs a pressurized shell at the strongest enemy: 210% ATK and -20% DEF for 5s.', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 2.1, onHit: [{ kind: 'defDown', power: 20, dur: 5, chance: 100 }] } },
      ult: { name: 'FLEET IN A BARREL', desc: 'The lost fleet fires once more: 5 cannonades on random enemies for 130% ATK, slowing 20% for 4s.', spec: { type: 'damage', target: 'randomEach', mult: 1.3, hits: 5, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.0, height: 1.0, weapon: 'cannon', headgear: 'plume', hair: '#c8d8e8',
      palette: { primary: '#12324a', secondary: '#38b6ff', accent: '#d0f0ff', skin: '#e8c0a0' }, aura: '#6fd1ff' },
  },
  {
    id: 'astrion', name: 'Astrion', epithet: 'The Starforged Herald', gender: 'M',
    faction: 'cosmic', role: 'Tank', rarity: 'mystic', pos: 'front',
    base: { hp: 1720, atk: 134, def: 132, spd: 86 }, crit: 8,
    lore: 'Astrion carries the banner of a constellation that no longer exists. As long as he holds it high, its stars refuse to accept that they have gone out.',
    kit: {
      passive: { name: 'Banner of the Lost Sky', desc: 'The banner drinks every blow: gains +25 extra Energy when struck.', spec: { trigger: 'onHitTaken', energy: 25 } },
      skill: { name: 'Starfall Standard', desc: 'Plants the banner: shields the two weakest allies for 220% ATK for 6s.', cd: 9, spec: { type: 'shield', target: 'weakest2Allies', mult: 2.2, dur: 6 } },
      ult: { name: 'CONSTELLATION REBORN', desc: 'The dead stars answer: 210% ATK to all enemies, taunts for 4s and shields himself for 280% ATK.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'all', mult: 2.1 }, { type: 'selfBuff', taunt: 4, shield: { mult: 2.8, dur: 8 } } ] } },
    },
    model: { body: 'brute', bulk: 1.3, height: 1.08, weapon: 'banner', headgear: 'visor', hair: '#b39ddb',
      palette: { primary: '#241a42', secondary: '#ff4d6d', accent: '#ffd6e0', skin: '#c8b8e0' }, aura: '#ff6d8d' },
  },

  /* ============ NEW ELITES ============ */
  {
    id: 'drakthar', name: 'Drakthar', epithet: 'Son of the Ash Wyrm', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1260, atk: 180, def: 92, spd: 104 }, crit: 14,
    lore: 'Raised in a dragon\'s midden and proud of it, Drakthar swings an axe quenched in wyrm-fire. His family reunions require evacuation notices.',
    kit: {
      passive: { name: 'Wyrmblood', desc: 'Gains +20% ATK when below 50% HP.', spec: { trigger: 'below50', status: [{ kind: 'atkUp', power: 20, dur: 9999, chance: 100 }] } },
      skill: { name: 'Cinder Cleave', desc: 'Cleaves the front row for 155% ATK with a 60% chance to Burn.', cd: 8, spec: { type: 'damage', target: 'frontRow', mult: 1.55, onHit: [{ kind: 'burn', power: 0.2, dur: 3, chance: 60 }] } },
      ult: { name: 'Ashfall Verdict', desc: 'Brings the axe down for 300% ATK on the current target, Burning for 30% ATK/s over 4s.', spec: { type: 'damage', target: 'current', mult: 3.0, onHit: [{ kind: 'burn', power: 0.3, dur: 4, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.25, height: 1.04, weapon: 'axe', headgear: 'horns', hair: '#8d2f0b',
      palette: { primary: '#4e2418', secondary: '#ff6b35', accent: '#ffcc80', skin: '#c8906a' }, aura: '#ff8a50' },
  },
  {
    id: 'selune', name: 'Selune', epithet: 'Whisper of the Crescent', gender: 'F',
    faction: 'dark', role: 'Mage', rarity: 'elite', pos: 'back',
    base: { hp: 890, atk: 212, def: 54, spd: 102 }, crit: 14,
    lore: 'Selune speaks only in moonlight; her spells are the pauses between words. Scholars who transcribed her silence went home and locked their doors forever.',
    kit: {
      passive: { name: 'Moonlit Veil', desc: 'Dodges 15% of attacks for the first 8s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'dodge', power: 15, dur: 8, chance: 100 }] } },
      skill: { name: 'Crescent Lash', desc: 'Strikes 3 random enemies for 160% ATK, draining 40 Energy from each.', cd: 8, spec: { type: 'composite', actions: [ { type: 'damage', target: 'random3', mult: 1.6 }, { type: 'debuff', target: 'random3', status: [], energyDrain: 40 } ] } },
      ult: { name: 'Total Eclipse', desc: 'Silence falls: 195% ATK to all enemies and Silence (no Energy gain) for 3s.', spec: { type: 'damage', target: 'all', mult: 1.95, onHit: [{ kind: 'silence', power: 0, dur: 3, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.88, height: 1.0, weapon: 'orb', headgear: 'circlet', hair: '#d1c4e9',
      palette: { primary: '#1d1430', secondary: '#9575cd', accent: '#ede7f6', skin: '#d8c8e8' }, aura: '#b39ddb' },
  },
  {
    id: 'torvald', name: 'Torvald', epithet: 'The Landslide', gender: 'M',
    faction: 'rock', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1340, atk: 172, def: 100, spd: 96 }, crit: 10,
    lore: 'Torvald once lost a bet and had to hold up a collapsing mine for three days. He won the rematch by dropping it.',
    kit: {
      passive: { name: 'Stoneskin', desc: '+15% DEF at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 15, dur: 9999, chance: 100 }] } },
      skill: { name: 'Rubble Toss', desc: 'Hurls a boulder at the backmost enemy for 195% ATK.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.95 } },
      ult: { name: 'Landslide', desc: 'The mountain arrives: 235% ATK to all enemies, slowing them 25% for 5s.', spec: { type: 'damage', target: 'all', mult: 2.35, onHit: [{ kind: 'slow', power: 25, dur: 5, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.3, height: 1.02, weapon: 'hammer', headgear: 'helm', hair: '#a1887f',
      palette: { primary: '#3e2f23', secondary: '#8b8589', accent: '#e0d0b0', skin: '#c8a080' }, aura: '#a89880' },
  },
  {
    id: 'galewyn', name: 'Galewyn', epithet: 'Zephyr Chorister', gender: 'F',
    faction: 'wind', role: 'Support', rarity: 'elite', pos: 'back',
    base: { hp: 1010, atk: 148, def: 72, spd: 100 }, crit: 8,
    lore: 'Galewyn conducts the wind like a choir — sopranos in the treetops, bass in the canyons. Her lullabies have becalmed armadas.',
    kit: {
      passive: { name: 'Choral Updraft', desc: 'Every 4th basic attack mends the weakest ally for 90% ATK.', spec: { trigger: 'everyNBasics', n: 4, heal: { target: 'lowestAlly', mult: 0.9 } } },
      skill: { name: 'Song of Second Wind', desc: 'Heals the two weakest allies for 190% ATK and grants +12% Speed for 5s.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 1.9, onHit: [{ kind: 'haste', power: 12, dur: 5, chance: 100 }] } },
      ult: { name: 'Crescendo of Gales', desc: 'The full choir sings: heals all allies for 200% ATK; enemies suffer -15% Speed for 6s.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 2.0 }, { type: 'debuff', target: 'all', status: [{ kind: 'slow', power: 15, dur: 6, chance: 100 }] } ] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'staff', headgear: 'circlet', hair: '#c5e1a5',
      palette: { primary: '#e8f5e9', secondary: '#a8e8b0', accent: '#ffffff', skin: '#f0d0b0' }, aura: '#c8f5d0' },
  },
  {
    id: 'voltan', name: 'Voltan', epithet: 'The Thunderhide', gender: 'M',
    faction: 'electric', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1300, atk: 176, def: 94, spd: 108 }, crit: 12,
    lore: 'Voltan wrestled a storm cell to the ground and wears its hide as a cloak. It still grumbles when it rains.',
    kit: {
      passive: { name: 'Capacitor', desc: 'Gains +35 extra Energy when struck.', spec: { trigger: 'onHitTaken', energy: 35 } },
      skill: { name: 'Volt Tackle', desc: 'Dashes into the current target for 185% ATK with a 40% chance to stun 1s.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.85, dash: true, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 40 }] } },
      ult: { name: 'Storm Cell', desc: 'Discharges everything: 220% ATK to the front row and 140% ATK to the back row.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'frontRow', mult: 2.2 }, { type: 'damage', target: 'backRow', mult: 1.4 } ] } },
    },
    model: { body: 'brute', bulk: 1.22, height: 1.03, weapon: 'greatsword', headgear: 'visor', hair: '#fff176',
      palette: { primary: '#26261a', secondary: '#ffeb3b', accent: '#ffffff', skin: '#d8b088' }, aura: '#fff176' },
  },
  {
    id: 'corvina', name: 'Corvina', epithet: 'Nightfall Auger', gender: 'F',
    faction: 'cosmic', role: 'Assassin', rarity: 'elite', pos: 'front',
    base: { hp: 960, atk: 196, def: 60, spd: 128 }, crit: 21,
    lore: 'Corvina reads fates in the wheeling of crows and corrects the inaccurate ones personally. Her ledger has no erasures — only endings.',
    kit: {
      passive: { name: 'Omen Eater', desc: 'Critical hits restore 70 bonus Energy.', spec: { trigger: 'onCrit', energy: 70 } },
      skill: { name: 'Murder of Crows', desc: 'Shadows peck 3 random enemies for 145% ATK, reducing ATK 12% for 4s.', cd: 8, spec: { type: 'damage', target: 'random3', mult: 1.45, onHit: [{ kind: 'atkDown', power: 12, dur: 4, chance: 100 }] } },
      ult: { name: 'The Auspice', desc: 'Fate corrected: executes the lowest-HP enemy for 310% ATK — doubled below 30% HP.', spec: { type: 'damage', target: 'lowestHp', mult: 3.1, executeBelow: { hpPct: 0.3, factor: 2 } } },
    },
    model: { body: 'slim', bulk: 0.88, height: 1.0, weapon: 'daggers', headgear: 'hood', hair: '#4a148c',
      palette: { primary: '#1a1030', secondary: '#ff4d6d', accent: '#e1bee7', skin: '#d8c0d8' }, aura: '#ff6d8d' },
  },

  /* ============ NEW RARES ============ */
  {
    id: 'bramblet', name: 'Bramblet', epithet: 'Thicket Warden', gender: 'M',
    faction: 'nature', role: 'Tank', rarity: 'rare', pos: 'front',
    base: { hp: 1680, atk: 122, def: 126, spd: 80 }, crit: 6,
    lore: 'Bramblet is 60% shield, 30% hedge, and 10% opinions about trespassing.',
    kit: {
      passive: { name: 'Thornhide', desc: 'Attackers take 10% reflected damage.', spec: { trigger: 'onHitTaken', reflect: 0.10 } },
      skill: { name: 'Hedge Wall', desc: 'Shields himself for 240% ATK and taunts for 3s.', cd: 9, spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.4, dur: 6 } } },
      ult: { name: 'Bramble Fortress', desc: 'Shields all allies for 160% ATK; attackers are slowed 15% for 3s.', spec: { type: 'shield', target: 'allAllies', mult: 1.6, dur: 8 } },
    },
    model: { body: 'brute', bulk: 1.32, height: 1.02, weapon: 'shield', headgear: 'horns', hair: '#33691e',
      palette: { primary: '#33491e', secondary: '#7ac952', accent: '#c5e1a5', skin: '#a8b87c' }, aura: '#9ccc65' },
  },
  {
    id: 'pyrrha', name: 'Pyrrha', epithet: 'The Emberpriestess', gender: 'F',
    faction: 'fire', role: 'Support', rarity: 'rare', pos: 'back',
    base: { hp: 1000, atk: 152, def: 70, spd: 94 }, crit: 8,
    lore: 'Pyrrha keeps a coal from every fire she has ever blessed. Her satchel is a national heat hazard.',
    kit: {
      passive: { name: 'Warmth of the Hearth', desc: 'Heals the lowest-HP ally for 90% ATK every 4th basic attack.', spec: { trigger: 'everyNBasics', n: 4, heal: { target: 'lowestAlly', mult: 0.9 } } },
      skill: { name: 'Kindled Blessing', desc: 'Heals the weakest ally for 230% ATK and grants +15% ATK for 5s.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.3, onHit: [{ kind: 'atkUp', power: 15, dur: 5, chance: 100 }] } },
      ult: { name: 'Rite of the Phoenix', desc: 'Heals all allies for 210% ATK; enemies are scorched for 90% ATK.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 2.1 }, { type: 'damage', target: 'all', mult: 0.9, onHit: [{ kind: 'burn', power: 0.15, dur: 3, chance: 60 }] } ] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'orb', headgear: 'circlet', hair: '#ff8a65',
      palette: { primary: '#4e2a18', secondary: '#ff8a50', accent: '#ffe0b2', skin: '#e8b088' }, aura: '#ffab74' },
  },
  {
    id: 'wavecrest', name: 'Wavecrest', epithet: 'The Tidelancer', gender: 'M',
    faction: 'water', role: 'Warrior', rarity: 'rare', pos: 'front',
    base: { hp: 1200, atk: 174, def: 86, spd: 112 }, crit: 13,
    lore: 'Wavecrest surfs into battle on his own spear. The technique is officially banned in four navies and taught secretly in all of them.',
    kit: {
      passive: { name: 'Riptide Momentum', desc: '+12% Speed for the first 10s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 12, dur: 10, chance: 100 }] } },
      skill: { name: 'Harpoon Rush', desc: 'Dashes through the weakest enemy for 200% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 2.0, dash: true } },
      ult: { name: 'Breaker Line', desc: 'A wall of surf hits all enemies for 185% ATK, slowing 20% for 4s.', spec: { type: 'damage', target: 'all', mult: 1.85, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.05, height: 1.01, weapon: 'spear', headgear: 'none', hair: '#4dd0e1',
      palette: { primary: '#0e3a4a', secondary: '#38b6ff', accent: '#b2ebf2', skin: '#d8b090' }, aura: '#4dd0e1' },
  },
  {
    id: 'sparkfin', name: 'Sparkfin', epithet: 'Voltaic Mender', gender: 'F',
    faction: 'electric', role: 'Support', rarity: 'rare', pos: 'back',
    base: { hp: 980, atk: 146, def: 68, spd: 98 }, crit: 8,
    lore: 'Sparkfin defibrillates morale. Her bedside manner is technically a weather event.',
    kit: {
      passive: { name: 'Galvanize', desc: '+20 Energy to self on every basic attack.', spec: { trigger: 'onBasic', chance: 100, energy: 20 } },
      skill: { name: 'Jump-Start', desc: 'Heals the weakest ally for 210% ATK and grants +15% Speed for 4s.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.1, onHit: [{ kind: 'haste', power: 15, dur: 4, chance: 100 }] } },
      ult: { name: 'Defib Field', desc: 'Heals all allies for 190% ATK and grants +12% ATK for 6s.', spec: { type: 'heal', target: 'allAllies', mult: 1.9, onHit: [{ kind: 'atkUp', power: 12, dur: 6, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.98, weapon: 'staff', headgear: 'none', hair: '#fff59d',
      palette: { primary: '#33331a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#fff176' },
  },
  {
    id: 'dustwake', name: 'Dustwake', epithet: 'Canyon Marksman', gender: 'M',
    faction: 'rock', role: 'Ranger', rarity: 'rare', pos: 'back',
    base: { hp: 900, atk: 188, def: 58, spd: 110 }, crit: 17,
    lore: 'Dustwake can ricochet a crossbow bolt off three canyon walls and an insult. Ask the last guy. You can\'t — that\'s the point.',
    kit: {
      passive: { name: 'Deadeye', desc: '+10% Crit at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Ricochet Bolt', desc: 'Snipes the lowest-HP enemy for 175% ATK, splashing to 1 other for 100% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, splash: { count: 1, mult: 1.0 } } },
      ult: { name: 'Canyon Volley', desc: 'Fires 4 heavy bolts at random enemies for 155% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.55, hits: 4 } },
    },
    model: { body: 'std', bulk: 0.98, height: 1.0, weapon: 'crossbow', headgear: 'hood', hair: '#8d6e63',
      palette: { primary: '#4e3a28', secondary: '#bcaaa4', accent: '#ffd54f', skin: '#d8a878' }, aura: '#c8a878' },
  },

  /* ============ NEW UNCOMMONS ============ */
  {
    id: 'flick', name: 'Flick', epithet: 'Backalley Breeze', gender: 'F',
    faction: 'wind', role: 'Assassin', rarity: 'uncommon', pos: 'front',
    base: { hp: 900, atk: 178, def: 54, spd: 128 }, crit: 19,
    lore: 'Flick has never opened a door in her life. Windows, chimneys, keyholes — the world is full of perfectly good entrances.',
    kit: {
      passive: { name: 'Slipstream', desc: 'Dodges 20% of attacks for the first 5s.', spec: { trigger: 'battleStart', status: [{ kind: 'dodge', power: 20, dur: 5, chance: 100 }] } },
      skill: { name: 'Gust Cut', desc: 'Slips to the backmost enemy for 180% ATK.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.8, dash: true } },
      ult: { name: 'Whirlwind Heist', desc: 'Strikes 4 random enemies for 130% ATK, draining 30 Energy from each.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'randomEach', mult: 1.3, hits: 4 }, { type: 'debuff', target: 'all', status: [], energyDrain: 30 } ] } },
    },
    model: { body: 'slim', bulk: 0.85, height: 0.96, weapon: 'daggers', headgear: 'mask', hair: '#b2dfdb',
      palette: { primary: '#1a332e', secondary: '#a8e8b0', accent: '#e0f2f1', skin: '#e8c8a8' }, aura: '#a8e8b0' },
  },
  {
    id: 'coralie', name: 'Coralie', epithet: 'Reef Chanter', gender: 'F',
    faction: 'water', role: 'Support', rarity: 'uncommon', pos: 'back',
    base: { hp: 960, atk: 138, def: 64, spd: 94 }, crit: 6,
    lore: 'Coralie grows a reef wherever she sings too long. Her home town is now a very confused island.',
    kit: {
      passive: { name: 'Coral Bloom', desc: 'Heals grant a shield equal to 20% of the amount (5s).', spec: { trigger: 'aura', healShieldPct: 0.20 } },
      skill: { name: 'Tidal Hymn', desc: 'Heals the weakest ally for 200% ATK.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.0 } },
      ult: { name: 'Reefsong', desc: 'Heals all allies for 165% ATK and cleanses damage-over-time effects.', spec: { type: 'heal', target: 'allAllies', mult: 1.65, cleanse: true } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.97, weapon: 'orb', headgear: 'circlet', hair: '#ff8a80',
      palette: { primary: '#124a52', secondary: '#4dc3e8', accent: '#ffccbc', skin: '#e8c8a8' }, aura: '#80deea' },
  },
  {
    id: 'bolter', name: 'Bolter', epithet: 'Static Sniper', gender: 'M',
    faction: 'electric', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 840, atk: 172, def: 50, spd: 112 }, crit: 17,
    lore: 'Bolter\'s crossbow charges off his own nervous energy. He is extremely well supplied.',
    kit: {
      passive: { name: 'Live Rounds', desc: 'Basic attacks have a 20% chance to arc for 60% ATK.', spec: { trigger: 'onBasic', chance: 20, chain: { mult: 0.6 } } },
      skill: { name: 'Overvolt Shot', desc: 'Snipes the lowest-HP enemy for 185% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.85 } },
      ult: { name: 'Chain Barrage', desc: 'Fires 3 charged bolts at random enemies for 165% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.65, hits: 3 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.98, weapon: 'crossbow', headgear: 'visor', hair: '#ffd54f',
      palette: { primary: '#26261a', secondary: '#ffeb3b', accent: '#ffffff', skin: '#d8b088' }, aura: '#ffeb3b' },
  },
  {
    id: 'mosswick', name: 'Mosswick', epithet: 'The Lichen Sage', gender: 'M',
    faction: 'nature', role: 'Support', rarity: 'uncommon', pos: 'back',
    base: { hp: 1020, atk: 132, def: 72, spd: 88 }, crit: 5,
    lore: 'Mosswick moves at the speed of moss and thinks at the speed of forests. His advice is always right and always three weeks late.',
    kit: {
      passive: { name: 'Slow Growth', desc: 'Regenerates 1.5% of max HP every 3 seconds.', spec: { trigger: 'aura', regenPct: 0.015, every: 3 } },
      skill: { name: 'Spore Mend', desc: 'Heals the two weakest allies for 170% ATK.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 1.7 } },
      ult: { name: 'Old Growth', desc: 'Heals all allies for 150% ATK and grants +20% DEF for 7s.', spec: { type: 'heal', target: 'allAllies', mult: 1.5, onHit: [{ kind: 'defUp', power: 20, dur: 7, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.0, height: 0.96, weapon: 'staff', headgear: 'hood', hair: '#7cb342',
      palette: { primary: '#33491e', secondary: '#8bc34a', accent: '#dcedc8', skin: '#c8b890' }, aura: '#aed581' },
  },
  {
    id: 'cindra', name: 'Cindra', epithet: 'The Ashfletcher', gender: 'F',
    faction: 'fire', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 830, atk: 170, def: 50, spd: 114 }, crit: 16,
    lore: 'Cindra fletches her arrows with phoenix down. They always arrive warm, like fresh bread, if bread exploded.',
    kit: {
      passive: { name: 'Tinder Tips', desc: 'Basic attacks Burn for 15% ATK/s for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'burn', power: 0.15, dur: 2, chance: 100 }] } },
      skill: { name: 'Flare Shot', desc: 'Snipes the lowest-HP enemy for 170% ATK, Burning for 3s.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.7, onHit: [{ kind: 'burn', power: 0.2, dur: 3, chance: 100 }] } },
      ult: { name: 'Rain of Embers', desc: 'Fires 6 burning arrows at random enemies for 85% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 0.85, hits: 6, onHit: [{ kind: 'burn', power: 0.15, dur: 3, chance: 60 }] } },
    },
    model: { body: 'slim', bulk: 0.88, height: 0.98, weapon: 'bow', headgear: 'none', hair: '#ff7043',
      palette: { primary: '#4e2a18', secondary: '#ff7043', accent: '#ffccbc', skin: '#e8b088' }, aura: '#ff8a65' },
  },
  {
    id: 'gloam', name: 'Gloam', epithet: 'The Duskwarden', gender: 'M',
    faction: 'dark', role: 'Tank', rarity: 'uncommon', pos: 'front',
    base: { hp: 1520, atk: 118, def: 116, spd: 82 }, crit: 5,
    lore: 'Gloam guards the hour between day and night. Nothing gets through on his watch — not even the sunset, which files complaints.',
    kit: {
      passive: { name: 'Dusk Mantle', desc: 'Enemies who strike Gloam lose 15 Energy.', spec: { trigger: 'onHitTaken', attackerEnergyDrain: 15 } },
      skill: { name: 'Twilight Bash', desc: 'Bashes the target for 150% ATK with a 30% chance to stun 1s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.5, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 30 }] } },
      ult: { name: 'Hold the Hour', desc: 'Taunts 4s and shields himself for 300% ATK.', spec: { type: 'selfBuff', taunt: 4, shield: { mult: 3.0, dur: 7 } } },
    },
    model: { body: 'brute', bulk: 1.28, height: 1.03, weapon: 'greatsword', headgear: 'helm', hair: '#5c6bc0',
      palette: { primary: '#1a1a2e', secondary: '#5c6bc0', accent: '#c5cae9', skin: '#b8a8c8' }, aura: '#7986cb' },
  },

  /* ============ NEW COMMONS ============ */
  {
    id: 'pebble', name: 'Pebble', epithet: 'Quarry Guard', gender: 'M',
    faction: 'rock', role: 'Tank', rarity: 'common', pos: 'front',
    base: { hp: 1380, atk: 102, def: 104, spd: 80 }, crit: 5,
    lore: 'Pebble is small for a golem and large for a career in security. He takes both very seriously.',
    kit: {
      passive: { name: 'Dense', desc: '+12% DEF at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 12, dur: 9999, chance: 100 }] } },
      skill: { name: 'Gravel Punch', desc: 'Punches for 150% ATK.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.5 } },
      ult: { name: 'Stand Very Still', desc: 'Taunts 3s and shields himself for 240% ATK.', spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.4, dur: 6 } } },
    },
    model: { body: 'brute', bulk: 1.2, height: 0.9, weapon: 'fists', headgear: 'none', hair: '#9e9e9e',
      palette: { primary: '#4e4438', secondary: '#8b8589', accent: '#d7ccc8', skin: '#a1887f' }, aura: '#a1887f' },
  },
  {
    id: 'zippy', name: 'Zippy', epithet: 'Live Wire', gender: 'F',
    faction: 'electric', role: 'Assassin', rarity: 'common', pos: 'front',
    base: { hp: 800, atk: 150, def: 46, spd: 126 }, crit: 15,
    lore: 'Zippy drank a bottled thunderstorm on a dare. The dare is ongoing.',
    kit: {
      passive: { name: 'Jittery', desc: '+15% Speed for the first 6s.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 15, dur: 6, chance: 100 }] } },
      skill: { name: 'Zap Dash', desc: 'Dashes to the weakest enemy for 165% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.65, dash: true } },
      ult: { name: 'Short Circuit', desc: 'Two wild strikes at random enemies for 170% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.7, hits: 2 } },
    },
    model: { body: 'slim', bulk: 0.82, height: 0.92, weapon: 'daggers', headgear: 'none', hair: '#ffee58',
      palette: { primary: '#33331a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#ffee58' },
  },
  {
    id: 'willo', name: 'Willo', epithet: 'Stray Spark', gender: 'F',
    faction: 'aether', role: 'Support', rarity: 'common', pos: 'back',
    base: { hp: 820, atk: 116, def: 52, spd: 92 }, crit: 5,
    lore: 'Willo fell off a shooting star and decided to stay. She grants very small wishes with great enthusiasm.',
    kit: {
      passive: { name: 'Glimmer', desc: '+10 Energy to self on basic attacks.', spec: { trigger: 'onBasic', chance: 100, energy: 10 } },
      skill: { name: 'Wisp Mend', desc: 'Heals the weakest ally for 170% ATK.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 1.7 } },
      ult: { name: 'Tiny Miracle', desc: 'Heals all allies for 120% ATK.', spec: { type: 'heal', target: 'allAllies', mult: 1.2 } },
    },
    model: { body: 'slim', bulk: 0.82, height: 0.9, weapon: 'orb', headgear: 'none', hair: '#b2ebf2',
      palette: { primary: '#1a3340', secondary: '#7cf5ff', accent: '#e0f7fa', skin: '#f0e0c8' }, aura: '#7cf5ff' },
  },

  /* ============ THE LEGENDARY TEN — one per faction, no two alike ============
     Every legendary pairs a unique body archetype with a unique signature
     weapon and headpiece. No duplicates, by design. */
  {
    id: 'ashkarr', name: 'Ashkarr', epithet: 'Wyrmking Reborn', gender: 'M',
    faction: 'fire', role: 'Warrior', rarity: 'legendary', pos: 'front',
    base: { hp: 1460, atk: 208, def: 104, spd: 106 }, crit: 16,
    lore: 'The last wyrmking died in the Cindermaw eruption — and refused to accept it. Ashkarr walked back out of the caldera wearing his own funeral pyre as a crown, and the mountains have apologized ever since.',
    kit: {
      passive: { name: 'Pyre Heart', desc: 'Gains +25% ATK below 50% HP and Burns melee attackers for 3s.', spec: { trigger: 'below50', status: [{ kind: 'atkUp', power: 25, dur: 9999, chance: 100 }] } },
      skill: { name: 'Caldera Lance', desc: 'Impales the target column for 220% ATK, Burning for 4s.', cd: 8, spec: { type: 'damage', target: 'column', mult: 2.2, onHit: [{ kind: 'burn', power: 0.28, dur: 4, chance: 100 }] } },
      ult: { name: 'FUNERAL OF MOUNTAINS', desc: 'The wyrmking erupts: 250% ATK to all enemies, Burning for 30% ATK/s over 5s.', spec: { type: 'damage', target: 'all', mult: 2.5, onHit: [{ kind: 'burn', power: 0.3, dur: 5, chance: 100 }] } },
    },
    model: { body: 'colossus', bulk: 1.15, height: 1.1, weapon: 'wyrmlance', headgear: 'skullhelm', hair: '#8d2f0b',
      hands: 'clawtips', feet: 'talons',
      palette: { primary: '#3a0f08', secondary: '#ff5e2a', accent: '#ffcc80', skin: '#c8785a' }, aura: '#ff7b3a' },
  },
  {
    id: 'thalassia', name: 'Thalassia', epithet: 'Empress of the Nine Deeps', gender: 'F',
    faction: 'water', role: 'Mage', rarity: 'legendary', pos: 'back',
    base: { hp: 1060, atk: 246, def: 68, spd: 106 }, crit: 16,
    lore: 'Each of the nine ocean trenches swears fealty to a different terror. All nine terrors swear fealty to Thalassia, and none of them enjoys discussing why.',
    kit: {
      passive: { name: 'Crushing Depths', desc: 'Basic attacks slow the target 12% for 3s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'slow', power: 12, dur: 3, chance: 100 }] } },
      skill: { name: 'Trench Grasp', desc: 'Drowning coils strike 3 random enemies for 165% ATK, slowing 20% for 4s.', cd: 8, spec: { type: 'damage', target: 'random3', mult: 1.65, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
      ult: { name: 'THE NINTH DEEP RISES', desc: 'The last trench opens: 235% ATK to all enemies — doubled against enemies below 30% HP.', spec: { type: 'damage', target: 'all', mult: 2.35, executeBelow: { hpPct: 0.3, factor: 2 } } },
    },
    model: { body: 'serpent', bulk: 1.0, height: 1.05, weapon: 'trident', headgear: 'tentacles', hair: '#2a6478',
      hands: 'runebands',
      palette: { primary: '#06222e', secondary: '#2a9ac8', accent: '#8fe8d8', skin: '#9ac8c0' }, aura: '#5ae8d8' },
  },
  {
    id: 'verdanox', name: 'Verdanox', epithet: "The Worldtree's Wrath", gender: 'M',
    faction: 'nature', role: 'Tank', rarity: 'legendary', pos: 'front',
    base: { hp: 1880, atk: 136, def: 146, spd: 82 }, crit: 6,
    lore: 'When the Elderroot finally lost patience, it grew itself a fist. Verdanox is that fist — bark older than kingdoms, sap that remembers every axe.',
    kit: {
      passive: { name: 'Heartwood', desc: 'Regenerates 2.5% of max HP every 3 seconds.', spec: { trigger: 'aura', regenPct: 0.025, every: 3 } },
      skill: { name: 'Root Verdict', desc: 'Roots crush the front row for 165% ATK, stunning for 1.4s.', cd: 9, spec: { type: 'damage', target: 'frontRow', mult: 1.65, onHit: [{ kind: 'stun', power: 0, dur: 1.4, chance: 100 }] } },
      ult: { name: 'AGE OF BRANCHES', desc: 'The forest takes the field: taunts 5s, shields himself for 420% ATK and heals all allies for 130% ATK.', spec: { type: 'composite', actions: [ { type: 'selfBuff', taunt: 5, shield: { mult: 4.2, dur: 8 } }, { type: 'heal', target: 'allAllies', mult: 1.3 } ] } },
    },
    model: { body: 'golem', bulk: 1.12, height: 1.12, weapon: 'runehammer', headgear: 'antlers', hair: '#3a5a2a',
      hands: 'stonefists', feet: 'hooves',
      palette: { primary: '#243a1c', secondary: '#52c97a', accent: '#a8e8b0', skin: '#7a9a6a' }, aura: '#7de89a' },
  },
  {
    id: 'khorgrim', name: 'Khorgrim', epithet: 'The Mountain That Walks', gender: 'M',
    faction: 'rock', role: 'Warrior', rarity: 'legendary', pos: 'front',
    base: { hp: 1560, atk: 198, def: 118, spd: 92 }, crit: 12,
    lore: 'Cartographers hate Khorgrim. Every map of the Citrine Fault has to be redrawn whenever he stretches his legs, and he stretches his legs whenever someone redraws a map.',
    kit: {
      passive: { name: 'Bedrock Stride', desc: 'Reflects 15% of damage taken and gains +25 Energy when struck.', spec: { trigger: 'onHitTaken', energy: 25, reflect: 0.15 } },
      skill: { name: 'Fault Pick', desc: 'Cracks the earth under the target for 210% ATK with a 50% chance to stun 1.2s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 2.1, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 50 }] } },
      ult: { name: 'CONTINENTAL DRIFT', desc: 'The mountain arrives: 265% ATK to all enemies, slowing them 25% for 5s.', spec: { type: 'damage', target: 'all', mult: 2.65, onHit: [{ kind: 'slow', power: 25, dur: 5, chance: 100 }] } },
    },
    model: { body: 'juggernaut', bulk: 1.1, height: 1.1, weapon: 'warpick', headgear: 'mohawk', hair: '#8b8589',
      hands: 'stonefists', feet: 'sabatons',
      palette: { primary: '#2e2418', secondary: '#8b8589', accent: '#ffd54f', skin: '#a1887f' }, aura: '#c8b078' },
  },
  {
    id: 'fulminara', name: 'Fulminara', epithet: 'The Storm Unending', gender: 'F',
    faction: 'electric', role: 'Mage', rarity: 'legendary', pos: 'back',
    base: { hp: 1050, atk: 248, def: 66, spd: 110 }, crit: 17,
    lore: 'Most storms end. Fulminara simply changed venues. She has been raining somewhere on the continent for two hundred years, and her arrival is considered a weather forecast.',
    kit: {
      passive: { name: 'Ion Wake', desc: 'Basic attacks arc to a second enemy for 85% ATK (45% chance).', spec: { trigger: 'onBasic', chance: 45, chain: { mult: 0.85 } } },
      skill: { name: 'Stormglaive Arc', desc: 'The glaive sweeps 3 random enemies for 160% ATK, each hit 25% likely to stun 1s.', cd: 8, spec: { type: 'damage', target: 'random3', mult: 1.6, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 25 }] } },
      ult: { name: 'TWO HUNDRED YEARS OF RAIN', desc: '9 escalating bolts strike random enemies for 105% ATK, each 7% stronger than the last.', spec: { type: 'damage', target: 'randomEach', mult: 1.05, hits: 9, ramp: 0.07 } },
    },
    model: { body: 'valkyrie', bulk: 0.95, height: 1.05, weapon: 'stormglaive', headgear: 'diadem', hair: '#fff59d',
      feet: 'windgreaves',
      palette: { primary: '#14142a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#ffee58' },
  },
  {
    id: 'solmaris', name: 'Solmaris', epithet: 'The Last Radiance', gender: 'F',
    faction: 'holy', role: 'Support', rarity: 'legendary', pos: 'back',
    base: { hp: 1170, atk: 164, def: 84, spd: 100 }, crit: 8,
    lore: 'When the first sunrise ended, one spark refused to set. Solmaris is small enough to sit in a lantern and bright enough to argue with the night — she has never lost the argument.',
    kit: {
      passive: { name: 'Everdawn', desc: 'Her heals also grant a shield equal to 30% of the amount healed (6s).', spec: { trigger: 'aura', healShieldPct: 0.3 } },
      skill: { name: 'Radiant Writ', desc: 'Heals the two weakest allies for 230% ATK and cleanses damage-over-time effects.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.3, cleanse: true } },
      ult: { name: 'THE SUN REMEMBERS', desc: 'Dawn breaks twice: heals all allies for 260% ATK and grants +20% ATK for 8s.', spec: { type: 'heal', target: 'allAllies', mult: 2.6, onHit: [{ kind: 'atkUp', power: 20, dur: 8, chance: 100 }] } },
    },
    model: { body: 'sprite', bulk: 0.9, height: 1.0, weapon: 'celestorb', headgear: 'sunhalo', hair: '#fff2cc',
      palette: { primary: '#fff8e6', secondary: '#ffd166', accent: '#ffffff', skin: '#f0d8b0' }, aura: '#ffe9a0' },
  },
  {
    id: 'morvane', name: 'Morvane', epithet: 'The Pale Sovereign', gender: 'M',
    faction: 'dark', role: 'Assassin', rarity: 'legendary', pos: 'front',
    base: { hp: 1010, atk: 228, def: 62, spd: 134 }, crit: 24,
    lore: 'The Veil keeps a throne no one is meant to sit on. Morvane sat on it. Now he collects crowns the way the tide collects shipwrecks — patiently, completely, and without being asked.',
    kit: {
      passive: { name: 'Pale Court', desc: 'Deals +35% damage to enemies below 40% HP.', spec: { trigger: 'aura', executeBonus: 0.35 } },
      skill: { name: 'Sovereign Scythe', desc: 'Drifts through the lowest-HP enemy: 2 reaping cuts of 170% ATK that heal him for 40% of damage dealt.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.7, hits: 2, dash: true, selfHealPct: 0.4 } },
      ult: { name: 'CORONATION IN REVERSE', desc: 'Uncrowns the lowest-HP enemy for 340% ATK. On kill, refunds 500 Energy and reaps again at 170%.', spec: { type: 'damage', target: 'lowestHp', mult: 3.4, chainOnKill: { mult: 1.7, energyRefund: 500 } } },
    },
    model: { body: 'wraith', bulk: 0.95, height: 1.06, weapon: 'soulscythe', headgear: 'veil', hair: '#cfc7ff',
      hands: 'voidgrips',
      palette: { primary: '#141020', secondary: '#8e7cc3', accent: '#e3d5ff', skin: '#d8cce8' }, aura: '#b8a8ff' },
  },
  {
    id: 'zerathis', name: 'Zerathis', epithet: 'Devourer of Constellations', gender: 'M',
    faction: 'cosmic', role: 'Assassin', rarity: 'legendary', pos: 'front',
    base: { hp: 1000, atk: 232, def: 60, spd: 132 }, crit: 25,
    lore: 'Seventeen constellations are missing from the old star charts. Zerathis is politely not answering questions. His twin blades wax and wane like the moons he ate for dessert.',
    kit: {
      passive: { name: 'Starving Sky', desc: 'Critical hits restore 90 bonus Energy.', spec: { trigger: 'onCrit', energy: 90 } },
      skill: { name: 'Eclipse Bite', desc: 'Lunges at the backmost enemy: 3 cuts of 125% ATK that Bleed for 4s.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.25, hits: 3, dash: true, onHit: [{ kind: 'bleed', power: 0.22, dur: 4, chance: 100 }] } },
      ult: { name: 'SWALLOW THE ZODIAC', desc: '7 devouring slashes on random enemies for 120% ATK; victims are Silenced for 2s.', spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 7, onHit: [{ kind: 'silence', power: 0, dur: 2, chance: 60 }] } },
    },
    model: { body: 'stalker', bulk: 1.0, height: 1.04, weapon: 'eclipseblades', headgear: 'crescent', hair: '#12081f',
      hands: 'clawtips', feet: 'talons',
      palette: { primary: '#160e2a', secondary: '#ff4d6d', accent: '#ffd6e0', skin: '#b8a8d8' }, aura: '#ff6d8d' },
  },
  {
    id: 'aetherion', name: 'Aetherion', epithet: 'The First Harmonic', gender: 'M',
    faction: 'aether', role: 'Support', rarity: 'legendary', pos: 'back',
    base: { hp: 1160, atk: 160, def: 86, spd: 102 }, crit: 8,
    lore: 'Before the first word there was a hum, and before the hum there was Aetherion clearing his throat. His tome contains one page, and the page contains everything.',
    kit: {
      passive: { name: 'Standing Wave', desc: 'All allies gain +8% Speed while Aetherion lives.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Chord of Making', desc: 'Heals the two weakest allies for 220% ATK and grants +15% ATK for 6s.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.2, onHit: [{ kind: 'atkUp', power: 15, dur: 6, chance: 100 }] } },
      ult: { name: 'THE ONE PAGE', desc: 'Reads the universe aloud: heals all allies for 230% ATK; enemies lose 200 Energy and suffer -20% ATK for 6s.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 2.3 }, { type: 'debuff', target: 'all', status: [{ kind: 'atkDown', power: 20, dur: 6, chance: 100 }], energyDrain: 200 } ] } },
    },
    model: { body: 'djinn', bulk: 1.0, height: 1.06, weapon: 'tome', headgear: 'runecrown', hair: '#b2ebf2',
      hands: 'runebands',
      palette: { primary: '#0e3038', secondary: '#7cf5ff', accent: '#e0f7fa', skin: '#d8ecec' }, aura: '#7cf5ff' },
  },
  {
    id: 'boreathan', name: 'Boreathan', epithet: 'The Walking Monsoon', gender: 'M',
    faction: 'wind', role: 'Tank', rarity: 'legendary', pos: 'front',
    base: { hp: 1840, atk: 138, def: 142, spd: 86 }, crit: 6,
    lore: 'Sailors pray for Boreathan to pass them by. Farmers pray for him to visit. Boreathan, who contains an entire rainy season, tries very hard to be fair about scheduling.',
    kit: {
      passive: { name: 'Pressure Front', desc: 'Enemies who strike Boreathan are slowed 12% for 3s.', spec: { trigger: 'onHitTaken', attackerStatus: [{ kind: 'slow', power: 12, dur: 3, chance: 100 }] } },
      skill: { name: 'Gale Bulwark', desc: 'Shields himself for 280% ATK and taunts for 4s.', cd: 9, spec: { type: 'selfBuff', taunt: 4, shield: { mult: 2.8, dur: 7 } } },
      ult: { name: 'SEASON OF STORMS', desc: 'The monsoon lands: 200% ATK to all enemies, -20% Speed for 6s, and Boreathan heals himself for 250% ATK.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'slow', power: 20, dur: 6, chance: 100 }] }, { type: 'heal', target: 'self', mult: 2.5 } ] } },
    },
    model: { body: 'sentinel', bulk: 1.18, height: 1.1, weapon: 'warhorn', headgear: 'wings', hair: '#e0f2f1',
      feet: 'windgreaves',
      palette: { primary: '#0e3a30', secondary: '#a8e8b0', accent: '#e0fff2', skin: '#c8d8c0' }, aura: '#b8f0c8' },
  },

  /* ============ THE MYSTIC TEN ============ */
  {
    id: 'pyraxis', name: 'Pyraxis', epithet: 'The Cinder Prophet', gender: 'M',
    faction: 'fire', role: 'Ranger', rarity: 'mystic', pos: 'back',
    base: { hp: 900, atk: 206, def: 56, spd: 116 }, crit: 18,
    lore: 'Pyraxis reads the future in cooling embers and corrects it with burning arrows. His prophecies have a 100% accuracy rate, largely because he fires them personally.',
    kit: {
      passive: { name: 'Ember Augury', desc: 'Basic attacks Burn the target for 18% ATK/s for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'burn', power: 0.18, dur: 2, chance: 100 }] } },
      skill: { name: 'Foretold Shot', desc: 'Snipes the lowest-HP enemy for 190% ATK, Burning for 3s.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.9, onHit: [{ kind: 'burn', power: 0.24, dur: 3, chance: 100 }] } },
      ult: { name: 'Prophecy of Ash', desc: '7 burning arrows rain on random enemies for 90% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 0.9, hits: 7, onHit: [{ kind: 'burn', power: 0.16, dur: 3, chance: 70 }] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'phoenixbow', headgear: 'flame', hair: '#ff7b3a',
      feet: 'magmaboots',
      palette: { primary: '#3d1a12', secondary: '#ff6b35', accent: '#ffc14d', skin: '#e8a87c' }, aura: '#ff8c4d' },
  },
  {
    id: 'maelgor', name: 'Maelgor', epithet: 'Tidebound Executioner', gender: 'M',
    faction: 'water', role: 'Warrior', rarity: 'mystic', pos: 'front',
    base: { hp: 1290, atk: 186, def: 94, spd: 108 }, crit: 14,
    lore: 'Maelgor\'s chainblade was forged from an anchor that dragged a warship under. He carries out the sea\'s sentences, and the sea sentences everyone eventually.',
    kit: {
      passive: { name: 'Anchor Weight', desc: 'Basic attacks slow the target 10% for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'slow', power: 10, dur: 2, chance: 100 }] } },
      skill: { name: 'Undertow Chain', desc: 'Hooks the backmost enemy for 205% ATK, dragging 30 Energy from them.', cd: 8, spec: { type: 'composite', actions: [ { type: 'damage', target: 'backmost', mult: 2.05 }, { type: 'debuff', target: 'backmost', status: [], energyDrain: 30 } ] } },
      ult: { name: 'Sentence of the Sea', desc: 'Executes the lowest-HP enemy for 300% ATK — doubled below 30% HP.', spec: { type: 'damage', target: 'lowestHp', mult: 3.0, executeBelow: { hpPct: 0.3, factor: 2 } } },
    },
    model: { body: 'std', bulk: 1.12, height: 1.03, weapon: 'chainblade', headgear: 'tricorn', hair: '#2a4a5a',
      hands: 'gauntlets',
      palette: { primary: '#0e2a3a', secondary: '#3aa8c9', accent: '#b2ebf2', skin: '#c8a888' }, aura: '#4dc3e8' },
  },
  {
    id: 'thornelle', name: 'Thornelle', epithet: 'The Briar Queen', gender: 'F',
    faction: 'nature', role: 'Support', rarity: 'mystic', pos: 'back',
    base: { hp: 1130, atk: 152, def: 80, spd: 98 }, crit: 8,
    lore: 'Thornelle\'s garden has never been raided twice. Her whip is a living briar that blooms after every battle, and she deadheads it with unsettling tenderness.',
    kit: {
      passive: { name: 'Rose Tithe', desc: 'Enemies who strike her allies\' back row lose 15 Energy.', spec: { trigger: 'onHitTaken', attackerEnergyDrain: 15 } },
      skill: { name: 'Bramble Benediction', desc: 'Heals the two weakest allies for 200% ATK and grants +18% DEF for 6s.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.0, onHit: [{ kind: 'defUp', power: 18, dur: 6, chance: 100 }] } },
      ult: { name: 'GARDEN OF TEETH', desc: 'The briar blooms: heals all allies for 190% ATK; enemies take 100% ATK and Bleed for 4s.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 1.9 }, { type: 'damage', target: 'all', mult: 1.0, onHit: [{ kind: 'bleed', power: 0.18, dur: 4, chance: 80 }] } ] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'whip', headgear: 'circlet', hair: '#8bc34a',
      hands: 'clawtips', feet: 'hooves',
      palette: { primary: '#2f4a26', secondary: '#7ac952', accent: '#ffccdc', skin: '#e8cfa8' }, aura: '#a5e87a' },
  },
  {
    id: 'basaltus', name: 'Basaltus', epithet: 'The Obsidian Monk', gender: 'M',
    faction: 'rock', role: 'Warrior', rarity: 'mystic', pos: 'front',
    base: { hp: 1320, atk: 184, def: 98, spd: 104 }, crit: 13,
    lore: 'Basaltus took a vow of silence and a vow of stillness. He keeps exactly one of them at a time, and battlefields strongly prefer the days he keeps the second.',
    kit: {
      passive: { name: 'Stone Palm', desc: 'Every 4th basic attack strikes the whole front row for 110% ATK.', spec: { trigger: 'everyNBasics', n: 4, dmg: { target: 'frontRow', mult: 1.1 } } },
      skill: { name: 'Mantra of Weight', desc: 'A grounded strike for 195% ATK with a 45% chance to stun 1.2s.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.95, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 45 }] } },
      ult: { name: 'HUNDRED-STEP AVALANCHE', desc: '5 open-palm strikes at random enemies for 130% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.3, hits: 5 } },
    },
    model: { body: 'std', bulk: 1.15, height: 1.0, weapon: 'fists', headgear: 'topknot', hair: '#3e2723',
      hands: 'stonefists', feet: 'sabatons',
      palette: { primary: '#2a2018', secondary: '#8b8589', accent: '#ffd54f', skin: '#b09078' }, aura: '#a89880' },
  },
  {
    id: 'galvana', name: 'Galvana', epithet: 'Mistress of the Coil', gender: 'F',
    faction: 'electric', role: 'Support', rarity: 'mystic', pos: 'back',
    base: { hp: 1060, atk: 154, def: 76, spd: 100 }, crit: 8,
    lore: 'Galvana keeps her allies\' hearts beating on schedule and her enemies\' hair permanently dramatic. Her crystal coil hums lullabies at eighty thousand volts.',
    kit: {
      passive: { name: 'Trickle Charge', desc: '+20 Energy to self on every basic attack.', spec: { trigger: 'onBasic', chance: 100, energy: 20 } },
      skill: { name: 'Defibrillate', desc: 'Heals the weakest ally for 230% ATK and grants +18% Speed for 5s.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.3, onHit: [{ kind: 'haste', power: 18, dur: 5, chance: 100 }] } },
      ult: { name: 'FULL CURRENT', desc: 'Heals all allies for 200% ATK and grants +15% ATK for 7s.', spec: { type: 'heal', target: 'allAllies', mult: 2.0, onHit: [{ kind: 'atkUp', power: 15, dur: 7, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'crystalwand', headgear: 'visor', hair: '#fff59d',
      hands: 'runebands',
      palette: { primary: '#26261a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#fff176' },
  },
  {
    id: 'aurelius', name: 'Aurelius', epithet: 'The Gilded Justicar', gender: 'M',
    faction: 'holy', role: 'Tank', rarity: 'mystic', pos: 'front',
    base: { hp: 1760, atk: 132, def: 136, spd: 84 }, crit: 6,
    lore: 'Aurelius gilded his armor with the melted-down crowns of seven unjust kings. He is transparent about where the gold came from, which the eighth king finds deeply motivating.',
    kit: {
      passive: { name: 'Weight of Crowns', desc: 'Allies in the back row take 13% less damage while Aurelius lives.', spec: { trigger: 'aura', backRowDR: 0.13 } },
      skill: { name: 'Gavel of Dawn', desc: 'The morningstar falls for 175% ATK, stunning the target for 1.5s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.75, onHit: [{ kind: 'stun', power: 0, dur: 1.5, chance: 100 }] } },
      ult: { name: 'THE EIGHTH VERDICT', desc: 'Taunts all enemies for 5s, shields himself for 400% ATK and gains +40% DEF for 8s.', spec: { type: 'selfBuff', taunt: 5, shield: { mult: 4.0, dur: 8 }, status: [{ kind: 'defUp', power: 40, dur: 8, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.3, height: 1.05, weapon: 'morningstar', headgear: 'helm', hair: '#b0885a',
      hands: 'gauntlets', feet: 'sabatons',
      palette: { primary: '#e9e2d0', secondary: '#f5c542', accent: '#ffffff', skin: '#d8a87e' }, aura: '#ffe9a0' },
  },
  {
    id: 'nocturnia', name: 'Nocturnia', epithet: 'The Silent Bell', gender: 'F',
    faction: 'dark', role: 'Support', rarity: 'mystic', pos: 'back',
    base: { hp: 1080, atk: 150, def: 78, spd: 96 }, crit: 8,
    lore: 'There is a bell in the Veil that has never been rung. Nocturnia carries its lantern-light and its silence; when she finally rings it, everyone will hear what quiet really means.',
    kit: {
      passive: { name: 'Hush', desc: 'Enemies begin battle with -10% ATK.', spec: { trigger: 'battleStart', enemyStatus: [{ kind: 'atkDown', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Lantern Vigil', desc: 'Heals the two weakest allies for 210% ATK.', cd: 8, spec: { type: 'heal', target: 'weakest2Allies', mult: 2.1 } },
      ult: { name: 'TOLL THE UNRUNG', desc: 'A silence falls: enemies lose 180 Energy and suffer -25% DEF for 7s; allies are healed for 150% ATK.', spec: { type: 'composite', actions: [ { type: 'debuff', target: 'all', status: [{ kind: 'defDown', power: 25, dur: 7, chance: 100 }], energyDrain: 180 }, { type: 'heal', target: 'allAllies', mult: 1.5 } ] } },
    },
    model: { body: 'wraith', bulk: 0.9, height: 1.0, weapon: 'lantern', headgear: 'veil', hair: '#8a7fae',
      hands: 'voidgrips',
      palette: { primary: '#1d1628', secondary: '#8e7cc3', accent: '#cfc3ee', skin: '#d8cce8' }, aura: '#a08cd8' },
  },
  {
    id: 'stellaris', name: 'Stellaris', epithet: 'Chartmaster of the Void', gender: 'M',
    faction: 'cosmic', role: 'Ranger', rarity: 'mystic', pos: 'back',
    base: { hp: 920, atk: 202, def: 58, spd: 114 }, crit: 17,
    lore: 'Stellaris throws stars for a living. Not shaped like stars — actual, catalogued, formerly-orbiting stars. The astronomy guild has stopped sending him invoices.',
    kit: {
      passive: { name: 'Catalogue', desc: '+10% Crit at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Meteor Toss', desc: 'Hurls a cindered star at the strongest enemy: 200% ATK and -18% DEF for 5s.', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 2.0, onHit: [{ kind: 'defDown', power: 18, dur: 5, chance: 100 }] } },
      ult: { name: 'FIVE-POINT EXTINCTION', desc: '5 catalogued stars strike random enemies for 135% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.35, hits: 5 } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'shuriken', headgear: 'crescent', hair: '#b39ddb',
      hands: 'fistwraps',
      palette: { primary: '#241a42', secondary: '#ff4d6d', accent: '#ffd6e0', skin: '#c8b8e0' }, aura: '#ff6d8d' },
  },
  {
    id: 'etheria', name: 'Etheria', epithet: 'The Prism Walker', gender: 'F',
    faction: 'aether', role: 'Mage', rarity: 'mystic', pos: 'back',
    base: { hp: 890, atk: 216, def: 54, spd: 102 }, crit: 15,
    lore: 'Etheria walks through light the way others walk through doors. She has been briefly every color, and she reports that ultraviolet is rude.',
    kit: {
      passive: { name: 'Refraction', desc: 'Dodges 15% of attacks for the first 8s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'dodge', power: 15, dur: 8, chance: 100 }] } },
      skill: { name: 'Spectrum Lance', desc: 'A refracted beam pierces the target column for 235% ATK.', cd: 8, spec: { type: 'damage', target: 'column', mult: 2.35 } },
      ult: { name: 'WHITE LIGHT / WHITE HEAT', desc: 'All colors at once: 215% ATK to all enemies and -15% ATK for 6s.', spec: { type: 'damage', target: 'all', mult: 2.15, onHit: [{ kind: 'atkDown', power: 15, dur: 6, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.02, weapon: 'orb', headgear: 'diadem', hair: '#e0f7fa',
      hands: 'runebands', feet: 'voidsteps',
      palette: { primary: '#0e3038', secondary: '#7cf5ff', accent: '#ffffff', skin: '#e8dcc8' }, aura: '#a5f3ff' },
  },
  {
    id: 'zephyra', name: 'Zephyra', epithet: 'Dancer of the High Blue', gender: 'F',
    faction: 'wind', role: 'Assassin', rarity: 'mystic', pos: 'front',
    base: { hp: 960, atk: 204, def: 58, spd: 130 }, crit: 21,
    lore: 'Zephyra performs at ten thousand feet without a stage. Her war-fans have been mistaken for wings, weather, and — by one late duelist — mercy.',
    kit: {
      passive: { name: 'Updraft Poise', desc: '+18% Speed for the first 8s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 18, dur: 8, chance: 100 }] } },
      skill: { name: 'Fan Cadenza', desc: 'Dances through the weakest enemy: 2 cuts of 175% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, hits: 2, dash: true } },
      ult: { name: 'FINALE AT ALTITUDE', desc: '6 spinning fan-cuts on random enemies for 115% ATK, slowing victims 15% for 3s.', spec: { type: 'damage', target: 'randomEach', mult: 1.15, hits: 6, onHit: [{ kind: 'slow', power: 15, dur: 3, chance: 100 }] } },
    },
    model: { body: 'valkyrie', bulk: 0.88, height: 1.0, weapon: 'warfan', headgear: 'jesterhat', hair: '#b2dfdb',
      feet: 'windgreaves',
      palette: { primary: '#0e3a30', secondary: '#a8e8b0', accent: '#e0f2f1', skin: '#f0d8b8' }, aura: '#b8f0c8' },
  },

  /* ============ THE ELITE TEN ============ */
  {
    id: 'emberix', name: 'Emberix', epithet: 'The Ash Adjutant', gender: 'M',
    faction: 'fire', role: 'Support', rarity: 'elite', pos: 'back',
    base: { hp: 1020, atk: 150, def: 72, spd: 96 }, crit: 8,
    lore: 'Every fire brigade needs a quartermaster. Emberix requisitions kindling, morale, and second chances — and audits his enemies down to the last spark.',
    kit: {
      passive: { name: 'Stoke the Line', desc: 'Every 4th basic attack heals the weakest ally for 95% ATK.', spec: { trigger: 'everyNBasics', n: 4, heal: { target: 'lowestAlly', mult: 0.95 } } },
      skill: { name: 'Ration of Flame', desc: 'Heals the weakest ally for 220% ATK and grants +15% ATK for 5s.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.2, onHit: [{ kind: 'atkUp', power: 15, dur: 5, chance: 100 }] } },
      ult: { name: 'Requisition: Inferno', desc: 'Heals all allies for 190% ATK; enemies are scorched for 85% ATK.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 1.9 }, { type: 'damage', target: 'all', mult: 0.85, onHit: [{ kind: 'burn', power: 0.14, dur: 3, chance: 60 }] } ] } },
    },
    model: { body: 'std', bulk: 0.98, height: 1.0, weapon: 'staff', headgear: 'mohawk', hair: '#ff8a50',
      feet: 'magmaboots',
      palette: { primary: '#4e2a18', secondary: '#ff8a50', accent: '#ffe0b2', skin: '#d8a078' }, aura: '#ffab74' },
  },
  {
    id: 'squallon', name: 'Squallon', epithet: 'Rider of the Foam', gender: 'M',
    faction: 'water', role: 'Ranger', rarity: 'elite', pos: 'back',
    base: { hp: 930, atk: 194, def: 60, spd: 114 }, crit: 17,
    lore: 'Squallon throws javelins from the crest of a wave that follows him around out of loyalty. Harbor-masters list the wave as a separate combatant.',
    kit: {
      passive: { name: 'Crestborne', desc: '+12% Speed for the first 10s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 12, dur: 10, chance: 100 }] } },
      skill: { name: 'Harpoon Verdict', desc: 'Skewers the lowest-HP enemy for 185% ATK, splashing to 1 other for 90% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.85, splash: { count: 1, mult: 0.9 } } },
      ult: { name: 'Breaker Volley', desc: '4 tide-javelins strike random enemies for 150% ATK, slowing 15% for 4s.', spec: { type: 'damage', target: 'randomEach', mult: 1.5, hits: 4, onHit: [{ kind: 'slow', power: 15, dur: 4, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.0, height: 1.0, weapon: 'javelin', headgear: 'tricorn', hair: '#4dd0e1',
      feet: 'windgreaves',
      palette: { primary: '#0e3a4a', secondary: '#38b6ff', accent: '#b2ebf2', skin: '#d8b090' }, aura: '#4dd0e1' },
  },
  {
    id: 'briarhart', name: 'Briarhart', epithet: 'Sap-Blooded Duelist', gender: 'M',
    faction: 'nature', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1270, atk: 178, def: 90, spd: 108 }, crit: 14,
    lore: 'Cut Briarhart and he blooms. He has lost count of his dueling scars because every one of them is now a flowering vine, and gardeners keep challenging him just for cuttings.',
    kit: {
      passive: { name: 'Bloom Where Struck', desc: 'Regenerates 1.8% of max HP every 3 seconds.', spec: { trigger: 'aura', regenPct: 0.018, every: 3 } },
      skill: { name: 'Thorned Riposte', desc: 'A curved slash for 200% ATK, applying Bleed for 4s.', cd: 7, spec: { type: 'damage', target: 'current', mult: 2.0, onHit: [{ kind: 'bleed', power: 0.22, dur: 4, chance: 100 }] } },
      ult: { name: 'GRAFT AND GUILLOTINE', desc: 'Strikes the front row for 220% ATK and heals himself for 60% of damage dealt.', spec: { type: 'damage', target: 'frontRow', mult: 2.2, selfHealPct: 0.6 } },
    },
    model: { body: 'std', bulk: 1.05, height: 1.01, weapon: 'scimitar', headgear: 'antlers', hair: '#5a7a3a',
      hands: 'clawtips',
      palette: { primary: '#33491e', secondary: '#7ac952', accent: '#ffccdc', skin: '#c8b088' }, aura: '#9ccc65' },
  },
  {
    id: 'gravelyn', name: 'Gravelyn', epithet: 'The Quarry Witch', gender: 'F',
    faction: 'rock', role: 'Mage', rarity: 'elite', pos: 'back',
    base: { hp: 900, atk: 210, def: 56, spd: 100 }, crit: 13,
    lore: 'Gravelyn divines with gravestones instead of tea leaves. Her bone-staff once belonged to something enormous, and she politely declines to say what — or whether it misses it.',
    kit: {
      passive: { name: 'Sediment', desc: 'Basic attacks slow the target 8% for 2s.', spec: { trigger: 'onBasic', chance: 100, status: [{ kind: 'slow', power: 8, dur: 2, chance: 100 }] } },
      skill: { name: 'Headstone Hex', desc: 'Drops a monument on the strongest enemy: 195% ATK and -15% ATK for 5s.', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 1.95, onHit: [{ kind: 'atkDown', power: 15, dur: 5, chance: 100 }] } },
      ult: { name: 'THE QUARRY REMEMBERS', desc: '230% ATK to all enemies, slowing them 20% for 5s.', spec: { type: 'damage', target: 'all', mult: 2.3, onHit: [{ kind: 'slow', power: 20, dur: 5, chance: 100 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'bonestaff', headgear: 'hood', hair: '#bcaaa4',
      hands: 'stonefists',
      palette: { primary: '#3e2f23', secondary: '#bcaaa4', accent: '#ffd54f', skin: '#d8b898' }, aura: '#c8a878' },
  },
  {
    id: 'voltix', name: 'Voltix', epithet: 'The Circuit Breaker', gender: 'M',
    faction: 'electric', role: 'Assassin', rarity: 'elite', pos: 'front',
    base: { hp: 970, atk: 198, def: 60, spd: 128 }, crit: 21,
    lore: 'Voltix cuts power. To buildings, to wards, to people\'s plans. His twin sickles complete a circuit with whatever they touch, and whatever they touch completes very little afterwards.',
    kit: {
      passive: { name: 'Grounded Out', desc: 'Critical hits restore 75 bonus Energy.', spec: { trigger: 'onCrit', energy: 75 } },
      skill: { name: 'Short the Line', desc: 'Blinks to the backmost enemy for 190% ATK, draining 40 Energy.', cd: 7, spec: { type: 'composite', actions: [ { type: 'damage', target: 'backmost', mult: 1.9, dash: true }, { type: 'debuff', target: 'backmost', status: [], energyDrain: 40 } ] } },
      ult: { name: 'ROLLING BLACKOUT', desc: '5 sickle-strikes on random enemies for 125% ATK, each Silencing for 1.5s (40%).', spec: { type: 'damage', target: 'randomEach', mult: 1.25, hits: 5, onHit: [{ kind: 'silence', power: 0, dur: 1.5, chance: 40 }] } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.99, weapon: 'sickles', headgear: 'visor', hair: '#ffd700',
      feet: 'voidsteps',
      palette: { primary: '#111111', secondary: '#ffeb3b', accent: '#ffffff', skin: '#e8bd98' }, aura: '#ffeb3b' },
  },
  {
    id: 'castellan', name: 'Castellan', epithet: 'Keeper of the White Gate', gender: 'M',
    faction: 'holy', role: 'Tank', rarity: 'elite', pos: 'front',
    base: { hp: 1700, atk: 128, def: 132, spd: 84 }, crit: 6,
    lore: 'The White Gate has stood unbreached for four hundred years. Castellan is younger than that, which raises questions about the previous keeper he refuses to answer while smiling.',
    kit: {
      passive: { name: 'Gatekeeper\'s Toll', desc: 'Gains +30 extra Energy when struck.', spec: { trigger: 'onHitTaken', energy: 30 } },
      skill: { name: 'Portcullis Slam', desc: 'Slams the shield for 160% ATK, stunning the target for 1.4s.', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'stun', power: 0, dur: 1.4, chance: 100 }] } },
      ult: { name: 'NONE SHALL PASS', desc: 'Taunts 5s, shields himself for 360% ATK and reflects 20% of damage for 8s.', spec: { type: 'selfBuff', taunt: 5, shield: { mult: 3.6, dur: 8 }, status: [{ kind: 'reflect', power: 20, dur: 8, chance: 100 }] } },
    },
    model: { body: 'sentinel', bulk: 1.1, height: 1.04, weapon: 'shield', headgear: 'plume', hair: '#b0885a',
      hands: 'gauntlets', feet: 'sabatons',
      palette: { primary: '#e9e2d0', secondary: '#c9a542', accent: '#ffffff', skin: '#d8a87e' }, aura: '#ffe9a0' },
  },
  {
    id: 'duskrow', name: 'Duskrow', epithet: 'The Gallows Bard', gender: 'M',
    faction: 'dark', role: 'Support', rarity: 'elite', pos: 'back',
    base: { hp: 1040, atk: 146, def: 74, spd: 94 }, crit: 8,
    lore: 'Duskrow plays requests. Unfortunately, the requests come from the departed, and the departed have strong opinions about the living. Tips are accepted in regrets.',
    kit: {
      passive: { name: 'Last Verse', desc: 'Enemies begin battle with -8% ATK.', spec: { trigger: 'battleStart', enemyStatus: [{ kind: 'atkDown', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Dirge Chord', desc: 'A mournful chord deals 85% ATK to all enemies and -20% ATK to the 2 strongest for 5s.', cd: 9, spec: { type: 'damage', target: 'all', mult: 0.85, extra: { target: 'strongest2', status: [{ kind: 'atkDown', power: 20, dur: 5, chance: 100 }] } } },
      ult: { name: 'ENCORE FOR THE EMPTY SEATS', desc: 'Heals all allies for 170% ATK; enemies lose 120 Energy.', spec: { type: 'composite', actions: [ { type: 'heal', target: 'allAllies', mult: 1.7 }, { type: 'debuff', target: 'all', status: [], energyDrain: 120 } ] } },
    },
    model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'harp', headgear: 'jesterhat', hair: '#5c6bc0',
      hands: 'fistwraps',
      palette: { primary: '#1a1a2e', secondary: '#5c6bc0', accent: '#c5cae9', skin: '#c8b8c8' }, aura: '#7986cb' },
  },
  {
    id: 'cometra', name: 'Cometra', epithet: 'The Falling Star', gender: 'F',
    faction: 'cosmic', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1250, atk: 182, def: 88, spd: 110 }, crit: 15,
    lore: 'Cometra fell from the sky as a child and has been trying to fall back up ever since. Her flail is the chunk of sky that came down with her — it still wants to go home too.',
    kit: {
      passive: { name: 'Re-entry', desc: 'Begins battle with +15% ATK for 8s.', spec: { trigger: 'battleStart', status: [{ kind: 'atkUp', power: 15, dur: 8, chance: 100 }] } },
      skill: { name: 'Perihelion Swing', desc: 'The sky-chunk orbits into the target for 205% ATK.', cd: 7, spec: { type: 'damage', target: 'current', mult: 2.05 } },
      ult: { name: 'IMPACT EVENT', desc: 'Comes down hard: 240% ATK to the front row, stunning for 1.3s.', spec: { type: 'damage', target: 'frontRow', mult: 2.4, onHit: [{ kind: 'stun', power: 0, dur: 1.3, chance: 100 }] } },
    },
    model: { body: 'valkyrie', bulk: 1.0, height: 1.01, weapon: 'flail', headgear: 'circlet', hair: '#e040fb',
      feet: 'voidsteps',
      palette: { primary: '#241a42', secondary: '#ff4d6d', accent: '#b388ff', skin: '#e0c8e8' }, aura: '#ff6d8d' },
  },
  {
    id: 'aeloria', name: 'Aeloria', epithet: 'The Chime of Dawn', gender: 'F',
    faction: 'aether', role: 'Ranger', rarity: 'elite', pos: 'back',
    base: { hp: 920, atk: 190, def: 58, spd: 116 }, crit: 17,
    lore: 'Aeloria\'s boomerang is a bell that rings on the way out and answers on the way back. Enemies who hear both notes rarely stay for the third throw.',
    kit: {
      passive: { name: 'Resonant Return', desc: 'Basic attacks have a 25% chance to strike a second enemy for 65% ATK.', spec: { trigger: 'onBasic', chance: 25, chain: { mult: 0.65 } } },
      skill: { name: 'Carillon Cast', desc: 'The chime arcs through the lowest-HP enemy for 175% ATK, splashing to 1 other for 95% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, splash: { count: 1, mult: 0.95 } } },
      ult: { name: 'MATINS', desc: '5 ringing arcs strike random enemies for 120% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 5 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.99, weapon: 'boomerang', headgear: 'foxears', hair: '#b2ebf2',
      feet: 'windgreaves',
      palette: { primary: '#1a3340', secondary: '#7cf5ff', accent: '#e0f7fa', skin: '#f0e0c8' }, aura: '#7cf5ff' },
  },
  {
    id: 'galebrand', name: 'Galebrand', epithet: 'The Kite Knight', gender: 'M',
    faction: 'wind', role: 'Warrior', rarity: 'elite', pos: 'front',
    base: { hp: 1240, atk: 180, def: 88, spd: 112 }, crit: 14,
    lore: 'Knighted mid-air during a hurricane by a queen who needed rescuing from the same hurricane, Galebrand fights with two axes because parachutes are for people with plans.',
    kit: {
      passive: { name: 'Terminal Velocity', desc: '+15% Speed for the first 8s of battle.', spec: { trigger: 'battleStart', status: [{ kind: 'haste', power: 15, dur: 8, chance: 100 }] } },
      skill: { name: 'Crosswind Cleave', desc: 'Dashes through the weakest enemy: 2 axe-cuts of 160% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.6, hits: 2, dash: true } },
      ult: { name: 'DEAD DROP', desc: 'Falls on the front row for 225% ATK, slowing them 20% for 4s.', spec: { type: 'damage', target: 'frontRow', mult: 2.25, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.06, height: 1.02, weapon: 'twinaxes', headgear: 'wings', hair: '#c5e1a5',
      feet: 'windgreaves',
      palette: { primary: '#0e3a30', secondary: '#a8e8b0', accent: '#e0fff2', skin: '#e8c8a0' }, aura: '#b8f0c8' },
  },

  /* ============ THE UNCOMMON TEN ============ */
  {
    id: 'sootle', name: 'Sootle', epithet: 'Chimney Imp', gender: 'M',
    faction: 'fire', role: 'Assassin', rarity: 'uncommon', pos: 'front',
    base: { hp: 880, atk: 176, def: 52, spd: 126 }, crit: 18,
    lore: 'Sootle has never used a door and considers windows a scenic detour. If your chimney is warm, he is already inside.',
    kit: {
      passive: { name: 'Flue Runner', desc: 'Dodges 18% of attacks for the first 5s.', spec: { trigger: 'battleStart', status: [{ kind: 'dodge', power: 18, dur: 5, chance: 100 }] } },
      skill: { name: 'Soot Shiv', desc: 'Dashes to the weakest enemy for 175% ATK with a chance to Burn.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, dash: true, onHit: [{ kind: 'burn', power: 0.15, dur: 3, chance: 50 }] } },
      ult: { name: 'Chimney Sweep', desc: '3 sooty strikes at random enemies for 145% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.45, hits: 3 } },
    },
    model: { body: 'slim', bulk: 0.84, height: 0.94, weapon: 'daggers', headgear: 'mohawk', hair: '#ff7043',
      feet: 'magmaboots',
      palette: { primary: '#33241a', secondary: '#ff7043', accent: '#ffccbc', skin: '#b09078' }, aura: '#ff8a65' },
  },
  {
    id: 'puddle', name: 'Puddle', epithet: 'The Damp Squire', gender: 'M',
    faction: 'water', role: 'Tank', rarity: 'uncommon', pos: 'front',
    base: { hp: 1560, atk: 118, def: 118, spd: 82 }, crit: 5,
    lore: 'Puddle wanted to be a lake when he grew up. He settled for being extremely difficult to remove from hallways, doorways, and battlefields.',
    kit: {
      passive: { name: 'Absorbent', desc: '+12% DEF at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 12, dur: 9999, chance: 100 }] } },
      skill: { name: 'Splash Guard', desc: 'Shields himself for 250% ATK and taunts for 3s.', cd: 9, spec: { type: 'selfBuff', taunt: 3, shield: { mult: 2.5, dur: 6 } } },
      ult: { name: 'Standing Water', desc: 'Soaks the front row for 175% ATK, slowing them 20% for 4s.', spec: { type: 'damage', target: 'frontRow', mult: 1.75, onHit: [{ kind: 'slow', power: 20, dur: 4, chance: 100 }] } },
    },
    model: { body: 'brute', bulk: 1.22, height: 0.96, weapon: 'shield', headgear: 'none', hair: '#4dd0e1',
      hands: 'fistwraps',
      palette: { primary: '#12405a', secondary: '#5ac8e8', accent: '#c0ecff', skin: '#a8c8c8' }, aura: '#8fdcff' },
  },
  {
    id: 'fernick', name: 'Fernick', epithet: 'Sprout Scout', gender: 'M',
    faction: 'nature', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 820, atk: 168, def: 50, spd: 116 }, crit: 16,
    lore: 'Fernick reports troop movements to the forest and pollen counts to the army. Both sides consider him indispensable and mildly confusing.',
    kit: {
      passive: { name: 'Camouflage', desc: '+8% Crit at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 8, dur: 9999, chance: 100 }] } },
      skill: { name: 'Seed Shot', desc: 'Snipes the lowest-HP enemy for 170% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.7 } },
      ult: { name: 'Sapling Salvo', desc: '4 sprouting arrows at random enemies for 120% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 4 } },
    },
    model: { body: 'slim', bulk: 0.88, height: 0.95, weapon: 'bow', headgear: 'foxears', hair: '#7cb342',
      feet: 'talons',
      palette: { primary: '#33491e', secondary: '#8bc34a', accent: '#dcedc8', skin: '#d8b088' }, aura: '#aed581' },
  },
  {
    id: 'chip', name: 'Chip', epithet: 'Pebble Slinger', gender: 'M',
    faction: 'rock', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 850, atk: 170, def: 54, spd: 110 }, crit: 15,
    lore: 'Chip\'s crossbow fires gravel, opinions, and the occasional geode. He calls every shot, mostly names like "Gerald".',
    kit: {
      passive: { name: 'Skipping Stones', desc: 'Basic attacks have a 20% chance to bounce for 55% ATK.', spec: { trigger: 'onBasic', chance: 20, chain: { mult: 0.55 } } },
      skill: { name: 'Geode Bolt', desc: 'Snipes the lowest-HP enemy for 180% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.8 } },
      ult: { name: 'Gravel Storm', desc: '3 heavy stones at random enemies for 160% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.6, hits: 3 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.94, weapon: 'crossbow', headgear: 'hood', hair: '#8d6e63',
      hands: 'stonefists',
      palette: { primary: '#3e2f23', secondary: '#bcaaa4', accent: '#ffd54f', skin: '#c8a080' }, aura: '#c8a878' },
  },
  {
    id: 'statica', name: 'Statica', epithet: 'The Frizz', gender: 'F',
    faction: 'electric', role: 'Mage', rarity: 'uncommon', pos: 'back',
    base: { hp: 830, atk: 178, def: 50, spd: 104 }, crit: 14,
    lore: 'Statica\'s hair predicts thunderstorms and starts most of them. Hairbrush manufacturers send her thank-you letters.',
    kit: {
      passive: { name: 'Static Cling', desc: '+15 Energy on basic attacks.', spec: { trigger: 'onBasic', chance: 100, energy: 15 } },
      skill: { name: 'Frizz Bolt', desc: 'Zaps the current target for 180% ATK.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.8 } },
      ult: { name: 'Bad Hair Day', desc: 'Discharges everything: 155% ATK to all enemies.', spec: { type: 'damage', target: 'all', mult: 1.55 } },
    },
    model: { body: 'slim', bulk: 0.86, height: 0.96, weapon: 'orb', headgear: 'none', hair: '#fff176',
      hands: 'runebands',
      palette: { primary: '#33331a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#e8c8a0' }, aura: '#ffee58' },
  },
  {
    id: 'vellum', name: 'Vellum', epithet: 'Apprentice of the Third Desk', gender: 'M',
    faction: 'holy', role: 'Support', rarity: 'uncommon', pos: 'back',
    base: { hp: 900, atk: 128, def: 60, spd: 92 }, crit: 5,
    lore: 'Vellum files miracles in triplicate. His tome of minor blessings is overdue at the temple library, which is itself a minor blessing for everyone he heals.',
    kit: {
      passive: { name: 'Marginalia', desc: '+12 Energy to self on basic attacks.', spec: { trigger: 'onBasic', chance: 100, energy: 12 } },
      skill: { name: 'Form 7-B: Mend', desc: 'Heals the weakest ally for 185% ATK.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 1.85 } },
      ult: { name: 'Notarized Miracle', desc: 'Heals all allies for 135% ATK.', spec: { type: 'heal', target: 'allAllies', mult: 1.35 } },
    },
    model: { body: 'slim', bulk: 0.9, height: 0.96, weapon: 'tome', headgear: 'circlet', hair: '#e8d9b0',
      hands: 'fistwraps',
      palette: { primary: '#fdf6e3', secondary: '#f5c542', accent: '#ffffff', skin: '#e8c8a0' }, aura: '#ffe9a0' },
  },
  {
    id: 'snuff', name: 'Snuff', epithet: 'Candle Thief', gender: 'F',
    faction: 'dark', role: 'Assassin', rarity: 'uncommon', pos: 'front',
    base: { hp: 860, atk: 174, def: 50, spd: 128 }, crit: 18,
    lore: 'Snuff steals lit candles and leaves the darkness as a receipt. Her lantern is full of flames that used to belong to other people.',
    kit: {
      passive: { name: 'Lights Out', desc: 'Enemies who strike Snuff lose 15 Energy.', spec: { trigger: 'onHitTaken', attackerEnergyDrain: 15 } },
      skill: { name: 'Wick Cut', desc: 'Slips to the backmost enemy for 175% ATK.', cd: 7, spec: { type: 'damage', target: 'backmost', mult: 1.75, dash: true } },
      ult: { name: 'Steal the Sun', desc: '3 shadowed strikes at random enemies for 140% ATK, draining 25 Energy from each.', spec: { type: 'composite', actions: [ { type: 'damage', target: 'randomEach', mult: 1.4, hits: 3 }, { type: 'debuff', target: 'all', status: [], energyDrain: 25 } ] } },
    },
    model: { body: 'slim', bulk: 0.84, height: 0.93, weapon: 'lantern', headgear: 'hood', hair: '#8a7fae',
      feet: 'voidsteps',
      palette: { primary: '#1d1430', secondary: '#7b4dff', accent: '#d8c5ff', skin: '#d0c0e0' }, aura: '#9a6bff' },
  },
  {
    id: 'twinkle', name: 'Twinkle', epithet: 'The Lesser Omen', gender: 'F',
    faction: 'cosmic', role: 'Support', rarity: 'uncommon', pos: 'back',
    base: { hp: 840, atk: 122, def: 54, spd: 94 }, crit: 5,
    lore: 'Grand omens announce the fall of empires. Twinkle announces lost keys, light rain, and which queue will move faster. She is consulted far more often.',
    kit: {
      passive: { name: 'Small Blessings', desc: 'Heals grant a shield equal to 15% of the amount (5s).', spec: { trigger: 'aura', healShieldPct: 0.15 } },
      skill: { name: 'Minor Portent', desc: 'Heals the weakest ally for 175% ATK.', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 1.75 } },
      ult: { name: 'Constellation Prize', desc: 'Heals all allies for 125% ATK and grants +10% Speed for 5s.', spec: { type: 'heal', target: 'allAllies', mult: 1.25, onHit: [{ kind: 'haste', power: 10, dur: 5, chance: 100 }] } },
    },
    model: { body: 'sprite', bulk: 0.8, height: 0.9, weapon: 'orb', headgear: 'crescent', hair: '#f3e5f5',
      feet: 'voidsteps',
      palette: { primary: '#2a1a48', secondary: '#ff9de0', accent: '#ffd6f0', skin: '#e8d8f0' }, aura: '#ff9de0' },
  },
  {
    id: 'drift', name: 'Drift', epithet: 'The Slow Breeze', gender: 'M',
    faction: 'wind', role: 'Warrior', rarity: 'uncommon', pos: 'front',
    base: { hp: 1160, atk: 158, def: 78, spd: 106 }, crit: 12,
    lore: 'Drift is in no hurry. Hurricanes are just breezes that panicked, he says, sharpening his sword at the pace of continental drift. He has never once been late to a victory.',
    kit: {
      passive: { name: 'Unhurried', desc: '+10% DEF at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'defUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Eventual Slash', desc: 'A patient cut for 185% ATK.', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.85 } },
      ult: { name: 'The Long Calm', desc: 'Strikes the front row for 195% ATK, slowing them 15% for 4s.', spec: { type: 'damage', target: 'frontRow', mult: 1.95, onHit: [{ kind: 'slow', power: 15, dur: 4, chance: 100 }] } },
    },
    model: { body: 'std', bulk: 1.02, height: 1.0, weapon: 'sword', headgear: 'topknot', hair: '#b2dfdb',
      feet: 'windgreaves',
      palette: { primary: '#1a332e', secondary: '#a8e8b0', accent: '#e0f2f1', skin: '#e0c8a8' }, aura: '#a8e8b0' },
  },
  {
    id: 'glimmer', name: 'Glimmer', epithet: 'Aether Moth', gender: 'F',
    faction: 'aether', role: 'Ranger', rarity: 'uncommon', pos: 'back',
    base: { hp: 810, atk: 166, def: 48, spd: 114 }, crit: 16,
    lore: 'Glimmer navigates by lights that haven\'t been lit yet. Her wand-bolts arrive slightly before she fires them, which referees have given up litigating.',
    kit: {
      passive: { name: 'Mothlight', desc: '+10% Crit at battle start.', spec: { trigger: 'battleStart', status: [{ kind: 'critUp', power: 10, dur: 9999, chance: 100 }] } },
      skill: { name: 'Lumen Dart', desc: 'Snipes the lowest-HP enemy for 175% ATK.', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75 } },
      ult: { name: 'Wingbeat Barrage', desc: '4 shimmering darts at random enemies for 115% ATK each.', spec: { type: 'damage', target: 'randomEach', mult: 1.15, hits: 4 } },
    },
    model: { body: 'slim', bulk: 0.84, height: 0.94, weapon: 'crystalwand', headgear: 'wings', hair: '#b2ebf2',
      palette: { primary: '#1a3340', secondary: '#7cf5ff', accent: '#e0f7fa', skin: '#f0e0c8' }, aura: '#7cf5ff' },
  },
];

DATA.CHAMP_BY_ID = {};
DATA.CHAMPIONS.forEach(c => { DATA.CHAMP_BY_ID[c.id] = c; });

/* ---------------- Enemy Families ---------------- */
DATA.ENEMY_FAMILIES = {
  gnawrath: {
    name: 'The Gnawrath Pack', theme: '#7a5a3a', env: 'plains',
    desc: 'Ravenous beast-kin that hunt the borderlands in howling packs.',
    units: {
      fangling:  { id: 'fangling', name: 'Fangling', role: 'melee', base: { hp: 420, atk: 60, def: 22, spd: 108 }, crit: 8,
        model: { body: 'crouch', bulk: 0.8, height: 0.8, weapon: 'fists', headgear: 'horns', palette: { primary: '#6a4a2a', secondary: '#8a6a3a', accent: '#d8b088', skin: '#8a6a4a' } },
        skill: { name: 'Frenzied Bite', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.5, onHit: [{ kind: 'bleed', power: 0.15, dur: 3, chance: 60 }] } } },
      howler:    { id: 'howler', name: 'Howler', role: 'ranged', base: { hp: 360, atk: 72, def: 16, spd: 96 }, crit: 10,
        model: { body: 'crouch', bulk: 0.85, height: 0.9, weapon: 'staff', headgear: 'horns', palette: { primary: '#5a4a3a', secondary: '#a88a5a', accent: '#e8d0a0', skin: '#7a5a3a' } },
        skill: { name: 'Rending Howl', cd: 8, spec: { type: 'damage', target: 'all', mult: 0.8, onHit: [{ kind: 'atkDown', power: 10, dur: 4, chance: 100 }] } } },
      mauler:    { id: 'mauler', name: 'Gnash Mauler', role: 'tank', base: { hp: 900, atk: 48, def: 45, spd: 82 }, crit: 5,
        model: { body: 'brute', bulk: 1.3, height: 1.0, weapon: 'hammer', headgear: 'none', palette: { primary: '#4a3a2a', secondary: '#7a5a3a', accent: '#b89068', skin: '#6a5a3a' } },
        skill: { name: 'Bone Crush', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'stun', power: 0, dur: 1, chance: 40 }] } } },
    },
    boss: { id: 'alpha_gnawrath', name: 'Alpha Gnawrath', title: 'Tyrant of the Hunting Grounds',
      base: { hp: 2600, atk: 95, def: 60, spd: 100 }, crit: 12,
      model: { body: 'brute', bulk: 1.6, height: 1.25, weapon: 'fists', headgear: 'horns', palette: { primary: '#5a3a1a', secondary: '#a86a2a', accent: '#ffd088', skin: '#7a5a2a' } },
      skill: { name: 'Pack Hunger', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 2.0, selfHealPct: 0.6 } },
      ult: { name: 'Apex Roar', spec: { type: 'damage', target: 'all', mult: 1.8, onHit: [{ kind: 'atkDown', power: 20, dur: 6, chance: 100 }] } } },
  },
  hollowed: {
    name: 'The Hollowed Legion', theme: '#8a92a8', env: 'crypt',
    desc: 'Soldiers who never noticed they died, still marching under a rusted banner.',
    units: {
      husk:      { id: 'husk', name: 'Rattling Husk', role: 'melee', base: { hp: 480, atk: 55, def: 28, spd: 88 }, crit: 5,
        model: { body: 'std', bulk: 0.9, height: 1.0, weapon: 'sword', headgear: 'helm', palette: { primary: '#5a6272', secondary: '#8a92a8', accent: '#c8d0e0', skin: '#a8b0c0' } },
        skill: { name: 'Rusted Cleave', cd: 8, spec: { type: 'damage', target: 'frontRow', mult: 1.2 } } },
      gravebow:  { id: 'gravebow', name: 'Gravebow', role: 'ranged', base: { hp: 350, atk: 75, def: 14, spd: 94 }, crit: 12,
        model: { body: 'slim', bulk: 0.85, height: 1.0, weapon: 'bow', headgear: 'hood', palette: { primary: '#3a4252', secondary: '#7a8298', accent: '#b8c0d0', skin: '#98a0b0' } },
        skill: { name: 'Coffin Nail', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.8 } } },
      wightpriest: { id: 'wightpriest', name: 'Wight Priest', role: 'support', base: { hp: 420, atk: 58, def: 20, spd: 90 }, crit: 5,
        model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'staff', headgear: 'hood', palette: { primary: '#2a3242', secondary: '#6a7288', accent: '#a8b0c0', skin: '#8890a0' } },
        skill: { name: 'Grave Mending', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.2 } } },
    },
    boss: { id: 'boneheap', name: 'Boneheap Colossus', title: 'A Thousand Funerals, One Body',
      base: { hp: 3200, atk: 88, def: 75, spd: 78 }, crit: 6,
      model: { body: 'brute', bulk: 1.7, height: 1.35, weapon: 'greatsword', headgear: 'helm', palette: { primary: '#4a5262', secondary: '#9aa2b8', accent: '#e0e8f8', skin: '#b8c0d0' } },
      skill: { name: 'Mass Grave', cd: 8, spec: { type: 'damage', target: 'all', mult: 1.1, onHit: [{ kind: 'defDown', power: 15, dur: 5, chance: 100 }] } },
      ult: { name: 'March of the Unforgotten', spec: { type: 'damage', target: 'all', mult: 1.7, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 50 }] } } },
  },
  cindermaw: {
    name: 'The Cindermaw Cult', theme: '#d84a2a', env: 'volcano',
    desc: 'Zealots who worship the hungry fire beneath the mountains — and feed it.',
    units: {
      zealot:    { id: 'zealot', name: 'Ash Zealot', role: 'melee', base: { hp: 460, atk: 62, def: 24, spd: 102 }, crit: 8,
        model: { body: 'std', bulk: 0.95, height: 1.0, weapon: 'daggers', headgear: 'hood', palette: { primary: '#5a2a1a', secondary: '#d84a2a', accent: '#ffb066', skin: '#c89068' } },
        skill: { name: 'Fervent Slash', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'burn', power: 0.15, dur: 3, chance: 70 }] } } },
      pyromancer:{ id: 'pyromancer', name: 'Pyromancer', role: 'ranged', base: { hp: 340, atk: 82, def: 12, spd: 92 }, crit: 10,
        model: { body: 'slim', bulk: 0.9, height: 1.0, weapon: 'staff', headgear: 'horns', palette: { primary: '#3a1a12', secondary: '#ff6b35', accent: '#ffd166', skin: '#d8a078' } },
        skill: { name: 'Cinder Bolt', cd: 7, spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 2, onHit: [{ kind: 'burn', power: 0.2, dur: 3, chance: 100 }] } } },
      ashpriest: { id: 'ashpriest', name: 'Ash Priest', role: 'support', base: { hp: 430, atk: 60, def: 22, spd: 88 }, crit: 5,
        model: { body: 'std', bulk: 1.0, height: 1.0, weapon: 'orb', headgear: 'hood', palette: { primary: '#4a221a', secondary: '#c1440e', accent: '#ff9d4d', skin: '#b88058' } },
        skill: { name: 'Emberward', cd: 8, spec: { type: 'shield', target: 'weakest2Allies', mult: 2.0, dur: 6 } } },
    },
    boss: { id: 'cindermaw_avatar', name: 'Cindermaw Avatar', title: 'The Mountain\'s Appetite',
      base: { hp: 3400, atk: 100, def: 68, spd: 86 }, crit: 10,
      model: { body: 'brute', bulk: 1.65, height: 1.3, weapon: 'hammer', headgear: 'horns', palette: { primary: '#3a1208', secondary: '#ff5e2a', accent: '#ffd166', skin: '#a84a22' } },
      skill: { name: 'Feed the Furnace', cd: 7, spec: { type: 'damage', target: 'current', mult: 2.2, onHit: [{ kind: 'burn', power: 0.25, dur: 4, chance: 100 }] } },
      ult: { name: 'Caldera Collapse', spec: { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'burn', power: 0.3, dur: 4, chance: 100 }] } } },
  },
  tidewrought: {
    name: 'The Tidewrought', theme: '#2a8aa8', env: 'abyss',
    desc: 'Things the deep ocean built from drowned sailors and older ideas.',
    units: {
      brinespawn:{ id: 'brinespawn', name: 'Brinespawn', role: 'melee', base: { hp: 500, atk: 58, def: 26, spd: 96 }, crit: 6,
        model: { body: 'crouch', bulk: 1.0, height: 0.9, weapon: 'fists', headgear: 'none', palette: { primary: '#1a4a5a', secondary: '#2a8aa8', accent: '#8fe8d8', skin: '#4a8a8a' } },
        skill: { name: 'Brine Lash', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.5, onHit: [{ kind: 'slow', power: 15, dur: 3, chance: 80 }] } } },
      depthcaller:{ id: 'depthcaller', name: 'Depthcaller', role: 'ranged', base: { hp: 360, atk: 78, def: 15, spd: 90 }, crit: 8,
        model: { body: 'slim', bulk: 0.9, height: 1.05, weapon: 'staff', headgear: 'horns', palette: { primary: '#122a3d', secondary: '#3aa8c9', accent: '#b0f0ff', skin: '#5a9aa8' } },
        skill: { name: 'Pressure Spike', cd: 8, spec: { type: 'damage', target: 'backRow', mult: 1.3 } } },
      anchorite: { id: 'anchorite', name: 'Anchorite', role: 'tank', base: { hp: 950, atk: 45, def: 50, spd: 76 }, crit: 4,
        model: { body: 'brute', bulk: 1.35, height: 1.05, weapon: 'hammer', headgear: 'helm', palette: { primary: '#14323d', secondary: '#2a7a8a', accent: '#8fd8c8', skin: '#3a6a6a' } },
        skill: { name: 'Anchor Drop', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.7, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 50 }] } } },
    },
    boss: { id: 'leviathans_hand', name: "Leviathan's Hand", title: 'Five Fingers of the Abyss',
      base: { hp: 3600, atk: 105, def: 72, spd: 84 }, crit: 8,
      model: { body: 'brute', bulk: 1.7, height: 1.35, weapon: 'fists', headgear: 'horns', palette: { primary: '#0a2a3d', secondary: '#2a9ac8', accent: '#b0f0ff', skin: '#3a7a8a' } },
      skill: { name: 'Crushing Depth', cd: 7, spec: { type: 'damage', target: 'frontRow', mult: 1.8, onHit: [{ kind: 'slow', power: 25, dur: 4, chance: 100 }] } },
      ult: { name: 'Drowning World', spec: { type: 'damage', target: 'all', mult: 1.9, onHit: [{ kind: 'atkDown', power: 20, dur: 6, chance: 100 }] } } },
  },
  clockwork: {
    name: 'The Clockwork Directive', theme: '#c8a83a', env: 'foundry',
    desc: 'An ancient automated army still executing a war nobody remembers declaring.',
    units: {
      scrapper:  { id: 'scrapper', name: 'Scrapper Unit', role: 'melee', base: { hp: 520, atk: 60, def: 32, spd: 94 }, crit: 6,
        model: { body: 'std', bulk: 1.05, height: 0.95, weapon: 'daggers', headgear: 'helm', palette: { primary: '#5a5242', secondary: '#c8a83a', accent: '#ffe8a0', skin: '#8a8272' } },
        skill: { name: 'Shear Protocol', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'defDown', power: 15, dur: 4, chance: 70 }] } } },
      arcturret: { id: 'arcturret', name: 'Arc Turret', role: 'ranged', base: { hp: 380, atk: 85, def: 20, spd: 86 }, crit: 12,
        model: { body: 'crouch', bulk: 1.1, height: 0.75, weapon: 'staff', headgear: 'none', palette: { primary: '#4a4232', secondary: '#d8b84a', accent: '#fff0b0', skin: '#7a7262' } },
        skill: { name: 'Overcharge Volley', cd: 8, spec: { type: 'damage', target: 'randomEach', mult: 1.1, hits: 3 } } },
      mendbot:   { id: 'mendbot', name: 'Mend-Frame', role: 'support', base: { hp: 450, atk: 55, def: 26, spd: 88 }, crit: 4,
        model: { body: 'slim', bulk: 0.95, height: 0.9, weapon: 'orb', headgear: 'none', palette: { primary: '#3a3a32', secondary: '#a8a84a', accent: '#e8e8a0', skin: '#6a6a5a' } },
        skill: { name: 'Repair Beam', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.4 } } },
    },
    boss: { id: 'foundry_titan', name: 'Foundry Titan', title: 'Directive Zero',
      base: { hp: 3800, atk: 110, def: 85, spd: 80 }, crit: 8,
      model: { body: 'brute', bulk: 1.75, height: 1.4, weapon: 'greatsword', headgear: 'helm', palette: { primary: '#3a3226', secondary: '#e8c84a', accent: '#fff8d0', skin: '#6a6252' } },
      skill: { name: 'Piston Barrage', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.4, hits: 3 } },
      ult: { name: 'Smelting Order', spec: { type: 'damage', target: 'all', mult: 1.8, onHit: [{ kind: 'defDown', power: 25, dur: 6, chance: 100 }] } } },
  },
  voidspawn: {
    name: 'The Null Court', theme: '#6a3ad8', env: 'void',
    desc: 'What waits on the far side of every unmade decision. It has decided about you.',
    units: {
      riftling:  { id: 'riftling', name: 'Riftling', role: 'melee', base: { hp: 560, atk: 68, def: 30, spd: 110 }, crit: 12,
        model: { body: 'crouch', bulk: 0.85, height: 0.85, weapon: 'daggers', headgear: 'none', palette: { primary: '#241a42', secondary: '#6a3ad8', accent: '#c8a8ff', skin: '#4a3a7a' } },
        skill: { name: 'Unravel', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.8 } } },
      nulleye:   { id: 'nulleye', name: 'Eye of Null', role: 'ranged', base: { hp: 400, atk: 90, def: 18, spd: 92 }, crit: 14,
        model: { body: 'slim', bulk: 0.9, height: 1.1, weapon: 'orb', headgear: 'none', palette: { primary: '#1a1232', secondary: '#8a5af8', accent: '#e0c8ff', skin: '#5a4a8a' } },
        skill: { name: 'Gaze of Undoing', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 2.0, onHit: [{ kind: 'silence', power: 0, dur: 3, chance: 60 }] } } },
      voidknight:{ id: 'voidknight', name: 'Void Knight', role: 'tank', base: { hp: 1050, atk: 52, def: 58, spd: 84 }, crit: 6,
        model: { body: 'brute', bulk: 1.3, height: 1.1, weapon: 'greatsword', headgear: 'helm', palette: { primary: '#160e2a', secondary: '#5a3aa8', accent: '#b898f8', skin: '#3a2a6a' } },
        skill: { name: 'Entropy Cleave', cd: 8, spec: { type: 'damage', target: 'frontRow', mult: 1.4, onHit: [{ kind: 'atkDown', power: 15, dur: 4, chance: 100 }] } } },
    },
    boss: { id: 'null_sovereign', name: 'The Null Sovereign', title: 'Monarch of the Unmade',
      base: { hp: 4500, atk: 125, def: 90, spd: 92 }, crit: 12,
      model: { body: 'brute', bulk: 1.6, height: 1.5, weapon: 'scythe', headgear: 'crown', palette: { primary: '#12082a', secondary: '#8a4af8', accent: '#e8d0ff', skin: '#4a327a' } },
      skill: { name: 'Decree of Absence', cd: 7, spec: { type: 'damage', target: 'randomEach', mult: 1.5, hits: 3, onHit: [{ kind: 'defDown', power: 20, dur: 5, chance: 100 }] } },
      ult: { name: 'The Unmaking', spec: { type: 'damage', target: 'all', mult: 2.2, onHit: [{ kind: 'stun', power: 0, dur: 1.5, chance: 60 }] } } },
  },

  /* ============ NEW FAMILIES — 20 new enemies ============ */
  frostborn: {
    name: 'The Frostborn Court', theme: '#7ec8e8', env: 'glacier',
    desc: 'Nobles of a kingdom that froze mid-betrayal. They are still arguing about the throne.',
    units: {
      icethrall:   { id: 'icethrall', name: 'Ice Thrall', role: 'melee', base: { hp: 540, atk: 66, def: 32, spd: 92 }, crit: 6,
        model: { body: 'std', bulk: 1.0, height: 1.0, weapon: 'sword', headgear: 'helm', palette: { primary: '#1a3a52', secondary: '#7ec8e8', accent: '#e0f4ff', skin: '#a8d0e0' } },
        skill: { name: 'Frostbite Slash', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.5, onHit: [{ kind: 'slow', power: 20, dur: 3, chance: 80 }] } } },
      shardcaster: { id: 'shardcaster', name: 'Shardcaster', role: 'ranged', base: { hp: 400, atk: 88, def: 18, spd: 94 }, crit: 12,
        model: { body: 'slim', bulk: 0.9, height: 1.02, weapon: 'staff', headgear: 'circlet', palette: { primary: '#12283d', secondary: '#a0e0ff', accent: '#ffffff', skin: '#98c0d8' } },
        skill: { name: 'Glacial Lance', cd: 8, spec: { type: 'damage', target: 'backRow', mult: 1.35, onHit: [{ kind: 'slow', power: 15, dur: 3, chance: 100 }] } } },
      frostpriest: { id: 'frostpriest', name: 'Frost Priest', role: 'support', base: { hp: 460, atk: 62, def: 24, spd: 88 }, crit: 5,
        model: { body: 'slim', bulk: 0.92, height: 1.0, weapon: 'orb', headgear: 'hood', palette: { primary: '#1a3048', secondary: '#8ed8f8', accent: '#e8faff', skin: '#a8c8d8' } },
        skill: { name: 'Rimeward', cd: 8, spec: { type: 'shield', target: 'weakest2Allies', mult: 2.2, dur: 6 } } },
    },
    boss: { id: 'permafrost_monarch', name: 'The Permafrost Monarch', title: 'King of the Frozen Instant',
      base: { hp: 4200, atk: 118, def: 88, spd: 84 }, crit: 10,
      model: { body: 'brute', bulk: 1.65, height: 1.4, weapon: 'greatsword', headgear: 'crown', palette: { primary: '#0e2438', secondary: '#a0e0ff', accent: '#ffffff', skin: '#88b8d0' } },
      skill: { name: 'Winter\'s Verdict', cd: 7, spec: { type: 'damage', target: 'frontRow', mult: 1.9, onHit: [{ kind: 'slow', power: 30, dur: 4, chance: 100 }] } },
      ult: { name: 'ABSOLUTE ZERO', spec: { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'stun', power: 0, dur: 1.4, chance: 60 }] } } },
  },
  stormspire: {
    name: 'The Stormspire Legion', theme: '#ffe86a', env: 'stormspire',
    desc: 'Sky-soldiers who mine lightning from the world\'s tallest peak and spend it like coin.',
    units: {
      voltling:   { id: 'voltling', name: 'Voltling', role: 'melee', base: { hp: 500, atk: 70, def: 26, spd: 116 }, crit: 12,
        model: { body: 'crouch', bulk: 0.82, height: 0.85, weapon: 'daggers', headgear: 'visor', palette: { primary: '#2a2a1a', secondary: '#ffeb3b', accent: '#fffde7', skin: '#c8b868' } },
        skill: { name: 'Static Shank', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.7 } } },
      skybreaker:  { id: 'skybreaker', name: 'Skybreaker', role: 'ranged', base: { hp: 420, atk: 92, def: 18, spd: 96 }, crit: 14,
        model: { body: 'slim', bulk: 0.95, height: 1.05, weapon: 'cannon', headgear: 'visor', palette: { primary: '#1f1f2a', secondary: '#ffe86a', accent: '#ffffff', skin: '#b8a878' } },
        skill: { name: 'Thunder Shell', cd: 8, spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 2, onHit: [{ kind: 'stun', power: 0, dur: 0.8, chance: 30 }] } } },
      galecleric:  { id: 'galecleric', name: 'Gale Cleric', role: 'support', base: { hp: 470, atk: 64, def: 24, spd: 90 }, crit: 5,
        model: { body: 'std', bulk: 0.95, height: 1.0, weapon: 'staff', headgear: 'hood', palette: { primary: '#26262e', secondary: '#d8e858', accent: '#f8ffd0', skin: '#c0b088' } },
        skill: { name: 'Charged Mending', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.3 } } },
    },
    boss: { id: 'tempest_incarnate', name: 'Tempest Incarnate', title: 'The Storm That Learned Ambition',
      base: { hp: 4400, atk: 128, def: 82, spd: 100 }, crit: 14,
      model: { body: 'brute', bulk: 1.55, height: 1.45, weapon: 'scepter', headgear: 'flame', palette: { primary: '#1a1a26', secondary: '#ffeb3b', accent: '#ffffff', skin: '#a8a868' } },
      skill: { name: 'Forked Ruin', cd: 7, spec: { type: 'damage', target: 'randomEach', mult: 1.4, hits: 3 } },
      ult: { name: 'SUPERCELL', spec: { type: 'damage', target: 'all', mult: 2.1, onHit: [{ kind: 'stun', power: 0, dur: 1.2, chance: 50 }] } } },
  },
  mirage: {
    name: 'The Mirage Caliphate', theme: '#e8c05a', env: 'desert',
    desc: 'An empire of heat-haze and stolen reflections. Half its citizens may not exist. The taxes are real.',
    units: {
      dunestalker:  { id: 'dunestalker', name: 'Dunestalker', role: 'melee', base: { hp: 520, atk: 68, def: 28, spd: 108 }, crit: 12,
        model: { body: 'crouch', bulk: 0.9, height: 0.9, weapon: 'katana', headgear: 'hood', palette: { primary: '#4e3a20', secondary: '#e8c05a', accent: '#fff0c0', skin: '#c8a068' } },
        skill: { name: 'Sand Slash', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.6, onHit: [{ kind: 'bleed', power: 0.18, dur: 3, chance: 60 }] } } },
      mirageweaver: { id: 'mirageweaver', name: 'Mirage Weaver', role: 'ranged', base: { hp: 400, atk: 86, def: 16, spd: 94 }, crit: 10,
        model: { body: 'slim', bulk: 0.88, height: 1.02, weapon: 'orb', headgear: 'circlet', palette: { primary: '#3a2a14', secondary: '#ffd97a', accent: '#fffbe8', skin: '#d8b088' } },
        skill: { name: 'Heat Haze', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 1.9, onHit: [{ kind: 'atkDown', power: 18, dur: 4, chance: 100 }] } } },
      sandsworn:    { id: 'sandsworn', name: 'Sandsworn Colossus', role: 'tank', base: { hp: 1000, atk: 52, def: 54, spd: 76 }, crit: 4,
        model: { body: 'brute', bulk: 1.4, height: 1.1, weapon: 'axe', headgear: 'none', palette: { primary: '#5a4426', secondary: '#c8a058', accent: '#ffe8b0', skin: '#b89058' } },
        skill: { name: 'Dune Crush', cd: 8, spec: { type: 'damage', target: 'current', mult: 1.7, onHit: [{ kind: 'stun', power: 0, dur: 1.1, chance: 45 }] } } },
    },
    boss: { id: 'sultan_of_glass', name: 'The Sultan of Glass', title: 'Emperor of Everything You Almost Saw',
      base: { hp: 4300, atk: 122, def: 86, spd: 92 }, crit: 12,
      model: { body: 'std', bulk: 1.2, height: 1.45, weapon: 'scepter', headgear: 'crown', palette: { primary: '#3a2a10', secondary: '#ffd97a', accent: '#ffffff', skin: '#d8b078' } },
      skill: { name: 'Shatterlight', cd: 7, spec: { type: 'damage', target: 'random3', mult: 1.6, onHit: [{ kind: 'defDown', power: 18, dur: 5, chance: 100 }] } },
      ult: { name: 'PALACE OF MIRRORS', spec: { type: 'damage', target: 'all', mult: 2.0, onHit: [{ kind: 'atkDown', power: 20, dur: 6, chance: 100 }] } } },
  },
  bloomspawn: {
    name: 'The Verdant Blight', theme: '#8adf5a', env: 'jungle',
    desc: 'A garden that decided gardeners were optional, then decided they were food.',
    units: {
      sporeling:   { id: 'sporeling', name: 'Sporeling', role: 'melee', base: { hp: 540, atk: 64, def: 30, spd: 98 }, crit: 8,
        model: { body: 'crouch', bulk: 0.95, height: 0.85, weapon: 'fists', headgear: 'none', palette: { primary: '#2a4a1a', secondary: '#8adf5a', accent: '#e8ffc8', skin: '#78a858' } },
        skill: { name: 'Spore Burst', cd: 7, spec: { type: 'damage', target: 'current', mult: 1.5, onHit: [{ kind: 'poison', power: 0.2, dur: 3, chance: 80 }] } } },
      thornlasher: { id: 'thornlasher', name: 'Thornlasher', role: 'ranged', base: { hp: 420, atk: 84, def: 18, spd: 92 }, crit: 10,
        model: { body: 'slim', bulk: 0.95, height: 1.05, weapon: 'staff', headgear: 'antlers', palette: { primary: '#1e3a12', secondary: '#a8e858', accent: '#f0ffd8', skin: '#88b868' } },
        skill: { name: 'Barbed Vine', cd: 8, spec: { type: 'damage', target: 'backRow', mult: 1.3, onHit: [{ kind: 'bleed', power: 0.2, dur: 3, chance: 100 }] } } },
      rotshaman:   { id: 'rotshaman', name: 'Rot Shaman', role: 'support', base: { hp: 470, atk: 62, def: 22, spd: 88 }, crit: 5,
        model: { body: 'std', bulk: 1.0, height: 0.98, weapon: 'staff', headgear: 'horns', palette: { primary: '#33421a', secondary: '#b8d858', accent: '#f8ffe0', skin: '#98a868' } },
        skill: { name: 'Blighted Bloom', cd: 8, spec: { type: 'heal', target: 'lowestAlly', mult: 2.4 } } },
    },
    boss: { id: 'verdant_maw', name: 'The Verdant Maw', title: 'The Garden\'s Appetite',
      base: { hp: 4600, atk: 120, def: 84, spd: 82 }, crit: 8,
      model: { body: 'brute', bulk: 1.7, height: 1.4, weapon: 'fists', headgear: 'antlers', palette: { primary: '#1e3a12', secondary: '#8adf5a', accent: '#f0ffd8', skin: '#68a848' } },
      skill: { name: 'Devouring Bloom', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 2.1, selfHealPct: 0.6 } },
      ult: { name: 'OVERGROWTH', spec: { type: 'damage', target: 'all', mult: 1.9, onHit: [{ kind: 'poison', power: 0.25, dur: 4, chance: 100 }] } } },
  },
  starfallen: {
    name: 'The Starfallen Host', theme: '#ff9de0', env: 'celestial',
    desc: 'Angels of a sky that no longer exists, holding a grudge the size of a firmament.',
    units: {
      cometling:    { id: 'cometling', name: 'Cometling', role: 'melee', base: { hp: 560, atk: 72, def: 30, spd: 112 }, crit: 12,
        model: { body: 'crouch', bulk: 0.85, height: 0.88, weapon: 'twinblades', headgear: 'none', palette: { primary: '#2a1a3a', secondary: '#ff9de0', accent: '#ffe8f8', skin: '#c8a0d0' } },
        skill: { name: 'Impact Trail', cd: 7, spec: { type: 'damage', target: 'lowestHp', mult: 1.75, dash: true } } },
      voidgazer:    { id: 'voidgazer', name: 'Voidgazer', role: 'ranged', base: { hp: 430, atk: 94, def: 18, spd: 94 }, crit: 14,
        model: { body: 'slim', bulk: 0.9, height: 1.08, weapon: 'orb', headgear: 'halo', palette: { primary: '#1a1030', secondary: '#ff6da8', accent: '#ffe0f0', skin: '#b890c8' } },
        skill: { name: 'Event Gaze', cd: 8, spec: { type: 'damage', target: 'highestAtk', mult: 2.0, onHit: [{ kind: 'silence', power: 0, dur: 2.5, chance: 60 }] } } },
      astralwarden: { id: 'astralwarden', name: 'Astral Warden', role: 'tank', base: { hp: 1080, atk: 54, def: 60, spd: 80 }, crit: 6,
        model: { body: 'brute', bulk: 1.35, height: 1.12, weapon: 'lance', headgear: 'wings', palette: { primary: '#241a42', secondary: '#ff9de0', accent: '#fff0f8', skin: '#a888c0' } },
        skill: { name: 'Halo Breaker', cd: 8, spec: { type: 'damage', target: 'frontRow', mult: 1.45, onHit: [{ kind: 'defDown', power: 15, dur: 4, chance: 100 }] } } },
    },
    boss: { id: 'fallen_seraph', name: 'The Fallen Seraph', title: 'First Light, Last Grudge',
      base: { hp: 5000, atk: 135, def: 95, spd: 96 }, crit: 14,
      model: { body: 'std', bulk: 1.25, height: 1.5, weapon: 'twinblades', headgear: 'wings', palette: { primary: '#1a1030', secondary: '#ff9de0', accent: '#ffffff', skin: '#c8a0d0' } },
      skill: { name: 'Sixfold Severance', cd: 7, spec: { type: 'damage', target: 'randomEach', mult: 1.2, hits: 4 } },
      ult: { name: 'FIRMAMENT\'S END', spec: { type: 'damage', target: 'all', mult: 2.3, onHit: [{ kind: 'stun', power: 0, dur: 1.5, chance: 55 }] } } },
  },
};

/* ---------------- Campaign ----------------
   20 chapters x 10 stages. Boss at stage 10, elite at 5. */
DATA.CHAPTERS = [
  { id: 1,  name: 'The Broken Borderlands', family: 'gnawrath',   env: 'plains'  },
  { id: 2,  name: 'Barrow of Silent Drums', family: 'hollowed',   env: 'crypt'   },
  { id: 3,  name: 'The Scorchvein Ascent',  family: 'cindermaw',  env: 'volcano' },
  { id: 4,  name: 'Drowned Cathedral',      family: 'tidewrought',env: 'abyss'   },
  { id: 5,  name: 'The Rustworks',          family: 'clockwork',  env: 'foundry' },
  { id: 6,  name: 'Howling Wastes',         family: 'gnawrath',   env: 'plains'  },
  { id: 7,  name: 'Legion\'s Last March',   family: 'hollowed',   env: 'crypt'   },
  { id: 8,  name: 'Caldera of the Feast',   family: 'cindermaw',  env: 'volcano' },
  { id: 9,  name: 'The Foundry Heart',      family: 'clockwork',  env: 'foundry' },
  { id: 10, name: 'Court of the Unmade',    family: 'voidspawn',  env: 'void'    },
  { id: 11, name: 'Glacier of Silent Kings',family: 'frostborn',  env: 'glacier' },
  { id: 12, name: 'The Stormspire',         family: 'stormspire', env: 'stormspire' },
  { id: 13, name: 'Sea of Singing Dunes',   family: 'mirage',     env: 'desert'  },
  { id: 14, name: 'The Weeping Canopy',     family: 'bloomspawn', env: 'jungle'  },
  { id: 15, name: 'Ruins of the First Accord', family: 'hollowed', env: 'ruins'  },
  { id: 16, name: 'Bloodmoon Hunting Grounds', family: 'gnawrath', env: 'bloodmoon' },
  { id: 17, name: 'The Faewild Crossing',   family: 'bloomspawn', env: 'faewild' },
  { id: 18, name: 'Shadowkeep Bastion',     family: 'voidspawn',  env: 'shadowkeep' },
  { id: 19, name: 'The Shattered Firmament',family: 'starfallen', env: 'celestial' },
  { id: 20, name: 'Sanctum of the Last Dawn', family: 'starfallen', env: 'sanctum' },
];
DATA.STAGES_PER_CHAPTER = 10;
DATA.MAX_STAGE = DATA.CHAPTERS.length * DATA.STAGES_PER_CHAPTER;

// Enemy scaling: enemies ride the same exponential stat curve as heroes
// (see DATA.statAtLevel), plus a slow difficulty ramp that creates the
// intended "progression walls" without ever going vertical.
DATA.enemyLevelForStage = s => Math.max(1, Math.round(1 + s * 1.55));
DATA.STAT_GROWTH = 1.048;   // per-level exponential growth shared by heroes & enemies
DATA.enemyScaleForStage = s =>
  Math.pow(DATA.STAT_GROWTH, DATA.enemyLevelForStage(s) - 1) * (1 + s * 0.008) * 0.5;

/* ---------------- Idle economy ---------------- */
DATA.IDLE_CAP_HOURS = 12;
DATA.idleRates = function (maxStage) {
  const m = Math.pow(1.055, Math.max(0, maxStage - 1));
  return {
    goldPerMin: 10 * m,
    xpPerMin: 7 * m * 1.75,
    dustPerMin: 0.16 * Math.pow(1.04, maxStage - 1),  // gear dust for enhancing
  };
};
DATA.stageClearRewards = function (stage) {
  const boss = stage % 10 === 0, elite = stage % 5 === 0;
  return {
    gold: Math.round(220 * Math.pow(1.10, stage)),
    xp: Math.round(140 * Math.pow(1.10, stage) * 1.75),
    diamonds: Math.round((boss ? 150 : (elite ? 80 : 30)) * 1.75),
    scrolls: boss ? 1 : 0,
    gearChance: elite ? 1.0 : 0.35,
  };
};

/* ---------------- Leveling ---------------- */
DATA.levelUpCost = function (level) {
  return {
    gold: Math.round(48 * Math.pow(level, 1.42)),
    xp: Math.round(80 * Math.pow(level, 1.56)),
  };
};
DATA.statAtLevel = (base, level) => base * Math.pow(DATA.STAT_GROWTH, level - 1);

/* ---------------- Summoning ---------------- */
DATA.SUMMON = {
  scrollCostDiamonds: 280,
  eliteRate: 4.6,            // % chance per pull
  pity: 30,                  // guaranteed elite within 30 pulls
  x10Discount: 10,           // 10 for the price of 9 (in scrolls: pay 9? keep 10 scrolls but bonus) — implemented: x10 costs 10 scrolls & guarantees 1 elite if none in first 30 lifetime pity handles it
};

/* ---------------- Gear ---------------- */
DATA.GEAR_SLOTS = ['weapon', 'armor', 'boots', 'talisman'];
DATA.GEAR_SLOT_INFO = {
  weapon:   { name: 'Weapon',   glyph: '⚔️', main: 'atk' },
  armor:    { name: 'Armor',    glyph: '🛡️', main: 'hp' },
  boots:    { name: 'Boots',    glyph: '🥾', main: 'spd' },
  talisman: { name: 'Talisman', glyph: '📿', main: 'crit' },
};
DATA.GEAR_RARITIES = [
  { id: 'common', name: 'Common', color: '#9aa5b1', mult: 1.0 },
  { id: 'fine',   name: 'Fine',   color: '#58c26a', mult: 1.5 },
  { id: 'rare',   name: 'Rare',   color: '#3fa7f5', mult: 2.2 },
  { id: 'epic',   name: 'Epic',   color: '#b45cff', mult: 3.2 },
  { id: 'mystic', name: 'Mystic', color: '#00e5ff', mult: 3.8 },
  { id: 'mythic', name: 'Mythic', color: '#ff9d2e', mult: 4.6 },
  { id: 'ultimate', name: 'Ultimate', color: '#ff9100', mult: 4.9 },
  { id: 'legendary', name: 'Legendary', color: '#ff3355', mult: 5.2 },
  { id: 'exclusive', name: 'Exclusive', color: '#ff4d6d', mult: 5.5 },
  { id: 'aether', name: 'AETHER', color: '#7cf5ff', mult: 6.4 },
  { id: 'ascension', name: 'ASCENSION', color: '#ffd75a', mult: 8.2 },
];
/* Class groups for class-exclusive Ascension gear. Champions carry one
   of six classes (Warrior/Assassin/Mage/Ranger/Support/Tank); exclusives
   gate on these groups. */
DATA.ROLE_INFO = {
  melee:   { name: 'Melee',  glyph: '🗡️', roles: ['Warrior', 'Assassin'], label: 'Warriors & Assassins' },
  ranged:  { name: 'Ranged', glyph: '🏹', roles: ['Ranger', 'Mage'],      label: 'Rangers & Mages' },
  tank:    { name: 'Tank',   glyph: '🛡️', roles: ['Tank'],                label: 'Tanks' },
  support: { name: 'Healer', glyph: '✚',  roles: ['Support'],             label: 'Healers' },
};
DATA.roleMatches = (champRole, groupId) => {
  const gi = DATA.ROLE_INFO[groupId];
  return !!gi && gi.roles.includes(champRole);
};
DATA.GEAR_NAMES = {
  weapon:   ['Squire\'s Blade', 'Keen Falchion', 'Stormcut Saber', 'Duskrender', 'Worldsplitter',
             'Dawnfang', 'The Umbral Kiss', 'Starpiercer', 'Kingslayer\'s Edge', 'The Last Argument',
             'Sunfury Greatstaff', 'Souldrinker Scythe', 'Aetherflux Wand', 'Bloodquench Daggers', 'Voidcarver Katana',
             'Obsidian Warhammer', 'Titan\'s Spear', 'Radiant Scepter', 'Gale-Force Longbow', 'World-Ender Axe',
             'Crystalline Lance', 'Phoenix Talons', 'Rune-Inscribed Orb', 'Starfall Scepter', 'Serpentspit Dagger'],
  armor:    ['Padded Vest', 'Riveted Hauberk', 'Wardplate', 'Aegis of Hours', 'Titanheart Mail',
             'Bulwark of Embers', 'Frostforged Carapace', 'Mantle of the Deep', 'Aegis Eternal', 'Worldbearer Plate',
             'Lich-Lord\'s Robes', 'Dragonscale Hauberk', 'Umbral Shroud', 'Spire-Guardian Aegis', 'Dreadplate Mail',
             'Sylvan Vestments', 'Ironbark Cuirass', 'Void-Shield Carapace', 'Star-Weave Tunic', 'Storm-Caller Cloak',
             'Phoenix Embervest', 'Leviathan Mail', 'Crystalline Bulwark', 'Radiant Greatcloak', 'Necrotic Vestments'],
  boots:    ['Worn Treads', 'Scout\'s Striders', 'Galewalkers', 'Voidstep Greaves', 'Comet Chasers',
             'Duneskimmers', 'Stormchaser Boots', 'Moonlit Slippers', 'Meteor Stompers', 'Heralds of Haste',
             'Sunstriders', 'Faestep Boots', 'Tide-Rider Treads', 'Shadow-Walkers', 'Aether-Drift Greaves',
             'Wyrm-Hide Striders', 'Iron-Clad Boots', 'Swift-Wind Sandals', 'Lava-Walkers', 'Glacier Boots',
             'Star-Path Treads', 'Void-Tracer Boots', 'Runic Sabatons', 'Forest-Spirit Treads', 'Abyssal Slippers'],
  talisman: ['Clay Charm', 'Fox-Eye Bead', 'Hunter\'s Sigil', 'Oracle Prism', 'Crown of Omens',
             'Wyrmheart Locket', 'Tideglass Pendant', 'The Seventh Star', 'Eye of the Accord', 'Relic of the First Dawn',
             'Dragon-Eye Pendant', 'Vortex Stone', 'Solar Crest', 'Shadow-Heart Ring', 'Aether-Shard Charm',
             'Nature\'s Whisper', 'Rune-Stone Ring', 'Star-Dust Amulet', 'Ember-Core Talisman', 'Tide-Glass Pearl',
             'Chrono-Anchor', 'Void-Eye Orb', 'Lich\'s Phylactery', 'Angel\'s Feather', 'Storm-Core Ring'],
};
// main stat value at gear level 0 for a stage-appropriate drop.
// Weapon/armor ride the shared stat curve so they stay relevant at any level;
// boots (SPD) and talisman (CRIT) are flat utility stats that never expire.
DATA.gearMainStat = function (slot, rarity, dropStage) {
  const r = DATA.GEAR_RARITIES.find(x => x.id === rarity).mult;
  const s = Math.pow(DATA.STAT_GROWTH, DATA.enemyLevelForStage(dropStage) - 1);
  switch (slot) {
    case 'weapon': return Math.round(16 * r * s);
    case 'armor': return Math.round(110 * r * s);
    case 'boots': return +(2.5 + 2.0 * r).toFixed(1);
    case 'talisman': return +(1.2 + 1.1 * r).toFixed(1);
  }
};
DATA.gearEnhanceCost = lvl => ({ gold: Math.round(160 * Math.pow(1.35, lvl)), dust: Math.round(4 * Math.pow(1.22, lvl)) });
DATA.GEAR_MAX_LEVEL = 20;
DATA.gearLevelBonus = 0.08; // +8% of main stat per enhance level

/* Exclusive gear (paid packs + rare chest jackpots, pre-leveled stats) */
DATA.EXCLUSIVE_GEAR = [
  { id: 'voidforged_edge', slot: 'weapon', name: 'Voidforged Edge', rarity: 'exclusive', stage: 55, flavor: 'A shard of the dead star that made Ivcan. It is always slightly colder than the room.' },
  { id: 'seismic_crown', slot: 'talisman', name: 'The Seismic Crown', rarity: 'exclusive', stage: 55, flavor: 'Lemon Quake\'s spare crown. Wearing it makes your footsteps feel important.' },
  { id: 'dawnplate', slot: 'armor', name: 'Dawnplate of the First Light', rarity: 'exclusive', stage: 55, flavor: 'Forged from a sunrise that refused to end.' },
  { id: 'tidewalkers', slot: 'boots', name: 'Leviathan Tidewalkers', rarity: 'exclusive', stage: 55, flavor: 'Walk on water. Terms and conditions apply during storms.' },
  /* chest-jackpot exclusives */
  { id: 'stormcrown_blade', slot: 'weapon', name: 'Stormcrown Blade', rarity: 'exclusive', stage: 70, flavor: 'Voltessa\'s eighth lightning bolt, folded a thousand times and given a handle.' },
  { id: 'seraph_aegis', slot: 'armor', name: 'Aegis of the Fallen Seraph', rarity: 'exclusive', stage: 70, flavor: 'One wing\'s worth of feathers, each harder than regret.' },
  { id: 'faewild_striders', slot: 'boots', name: 'Faewild Striders', rarity: 'exclusive', stage: 70, flavor: 'Every step lands slightly before you take it. Unnerving. Effective.' },
  { id: 'creators_sigil', slot: 'talisman', name: 'The Creator\'s Sigil', rarity: 'exclusive', stage: 70, flavor: 'Aljay\'s own mark. Reality double-checks its math around the wearer.' },
];

/* ============================================================
   NAMED ITEMS — 90 relics of Agdao with real combat effects.
   30 Epic · 30 Legendary · 30 AETHER. Aether relics glow, pulse,
   and carry effects that exist on NO other tier. Stats ride the
   shared curve via DATA.gearMainStat (balance invariant intact);
   the effect is pure bonus, applied by combat.js via itemFx.
   Sources: Chests of Agdao (Store), Dungeon raids, Rift drops.
   ============================================================ */
DATA.ITEM_TIER_INFO = {
  epic:      { id: 'epic',      name: 'Epic',      color: '#b45cff' },
  mystic:    { id: 'mystic',    name: 'Mystic',    color: '#00e5ff' },
  ultimate:  { id: 'ultimate',  name: 'Ultimate',  color: '#ff9100' },
  legendary: { id: 'legendary', name: 'Legendary', color: '#ff3355' },
  aether:    { id: 'aether',    name: 'AETHER',    color: '#7cf5ff' },
  ascension: { id: 'ascension', name: 'ASCENSION', color: '#ffd75a' },
};
/* Ascending power order for fusion & sorting.
   ASCENSION is deliberately NOT here — it cannot be fused into;
   it only drops from deep Expedition floors (Map of Agdao). */
DATA.ITEM_TIER_ORDER = ['epic', 'mystic', 'ultimate', 'legendary', 'aether'];
DATA.ITEMS = [
  /* ---------- EPIC (30) — solid procs & auras ---------- */
  { id: 'ep_w1', slot: 'weapon', tier: 'epic', name: 'Palandine Warbrand', fx: { kind: 'burnOnHit', power: 0.20, dur: 3, chance: 35 }, fxDesc: '35% chance on basic attacks to Burn the target (20% ATK/s for 3s).', lore: 'Quenched in the ember canyons of Palandine. It never fully cooled.' },
  { id: 'ep_w2', slot: 'weapon', tier: 'epic', name: 'Salmonrun Harpoon', fx: { kind: 'executeBonus', power: 15 }, fxDesc: '+15% damage to enemies below 50% HP.', lore: 'New Salmon fishers say the harpoon chooses the catch. The catch disagrees, briefly.' },
  { id: 'ep_w3', slot: 'weapon', tier: 'epic', name: 'Aespo Stormpike', fx: { kind: 'energyOnBasic', power: 15 }, fxDesc: '+15 bonus Energy on every basic attack.', lore: 'Still crackling from the storm that forged it atop Great Aespo.' },
  { id: 'ep_w4', slot: 'weapon', tier: 'epic', name: 'Jeehva Thornsong Bow', fx: { kind: 'bleedOnHit', power: 0.20, dur: 3, chance: 35 }, fxDesc: '35% chance on basic attacks to Bleed the target (20% ATK/s for 3s).', lore: 'Strung with a vine from Jeehva that still remembers being a predator.' },
  { id: 'ep_w5', slot: 'weapon', tier: 'epic', name: 'Astorvian Oathkeeper', fx: { kind: 'critDmg', power: 25 }, fxDesc: 'Critical hits deal +25% more damage.', lore: 'Sworn blades of Astorvia never break a promise. Especially the sharp ones.' },
  { id: 'ep_w6', slot: 'weapon', tier: 'epic', name: 'Gravewhisper Kris', fx: { kind: 'poisonOnHit', power: 0.20, dur: 3, chance: 35 }, fxDesc: '35% chance on basic attacks to Poison the target (20% ATK/s for 3s).', lore: 'It whispers. Do not answer while holding it.' },
  { id: 'ep_w7', slot: 'weapon', tier: 'epic', name: 'Duskfall Cleaver', fx: { kind: 'firstStrike', power: 20, dur: 6 }, fxDesc: '+20% ATK for the first 6 seconds of battle.', lore: 'Ends arguments the way dusk ends the day: promptly.' },
  { id: 'ep_w8', slot: 'weapon', tier: 'epic', name: 'Riftglass Shard', fx: { kind: 'dotAmp', power: 20 }, fxDesc: 'Your damage-over-time effects tick 20% harder.', lore: 'A splinter from the Rift of Leodones. It hums at midnight.' },
  { id: 'ep_a1', slot: 'armor', tier: 'epic', name: 'Bulwark of the Accord', fx: { kind: 'shieldStart', power: 1.5 }, fxDesc: 'Begin battle with a shield equal to 150% ATK (10s).', lore: 'Signed by all five regions. Arrows respect the paperwork.' },
  { id: 'ep_a2', slot: 'armor', tier: 'epic', name: 'Emberweave Plate', fx: { kind: 'thorns', power: 8 }, fxDesc: 'Reflects 8% of damage taken back to attackers.', lore: 'Woven in Palandine looms from thread that holds a grudge.' },
  { id: 'ep_a3', slot: 'armor', tier: 'epic', name: 'Tidewarden Scale', fx: { kind: 'regen', power: 1.5 }, fxDesc: 'Regenerates 1.5% of max HP every 3 seconds.', lore: 'Shed by a leviathan that guards the Salmonrun. It grew back. So do you.' },
  { id: 'ep_a4', slot: 'armor', tier: 'epic', name: 'Palisade of Roots', fx: { kind: 'defUp', power: 12 }, fxDesc: '+12% DEF for the whole battle.', lore: 'Jeehva\'s Elderroot lends a branch to those it likes.' },
  { id: 'ep_a5', slot: 'armor', tier: 'epic', name: 'Stormshroud Mantle', fx: { kind: 'dodge', power: 8 }, fxDesc: '8% chance to dodge any attack.', lore: 'Wearing weather is impractical for everyone except you.' },
  { id: 'ep_a6', slot: 'armor', tier: 'epic', name: 'Sunblessed Aegis', fx: { kind: 'regen', power: 2.0 }, fxDesc: 'Regenerates 2% of max HP every 3 seconds.', lore: 'Astorvian dawn-priests blessed it 100 times. 99 took.' },
  { id: 'ep_a7', slot: 'armor', tier: 'epic', name: 'Nightveil Carapace', fx: { kind: 'dodge', power: 10 }, fxDesc: '10% chance to dodge any attack.', lore: 'Cut from a shadow that got too confident.' },
  { id: 'ep_a8', slot: 'armor', tier: 'epic', name: 'Foundry-Forged Mail', fx: { kind: 'thorns', power: 10 }, fxDesc: 'Reflects 10% of damage taken back to attackers.', lore: 'The Rustworks\' finest export, after regret.' },
  { id: 'ep_b1', slot: 'boots', tier: 'epic', name: 'Skyrunner Greaves', fx: { kind: 'haste', power: 8 }, fxDesc: '+8% Speed for the whole battle.', lore: 'The sky does not technically have a floor. Details.' },
  { id: 'ep_b2', slot: 'boots', tier: 'epic', name: 'Tidechaser Fins', fx: { kind: 'energyOnBasic', power: 10 }, fxDesc: '+10 bonus Energy on every basic attack.', lore: 'New Salmon racing gear. Banned in three regattas.' },
  { id: 'ep_b3', slot: 'boots', tier: 'epic', name: 'Cinderstep Sabatons', fx: { kind: 'firstStrike', power: 15, dur: 8 }, fxDesc: '+15% ATK for the first 8 seconds of battle.', lore: 'Each step leaves a small opinion in the ground.' },
  { id: 'ep_b4', slot: 'boots', tier: 'epic', name: 'Rootbound Striders', fx: { kind: 'regen', power: 1.5 }, fxDesc: 'Regenerates 1.5% of max HP every 3 seconds.', lore: 'Jeehva moss lines the soles. It photosynthesizes courage.' },
  { id: 'ep_b5', slot: 'boots', tier: 'epic', name: 'Duneglider Sandals', fx: { kind: 'dodge', power: 8 }, fxDesc: '8% chance to dodge any attack.', lore: 'Sand taught them everything it knows about slipping away.' },
  { id: 'ep_b6', slot: 'boots', tier: 'epic', name: 'Galewoven Boots', fx: { kind: 'haste', power: 10 }, fxDesc: '+10% Speed for the whole battle.', lore: 'Knitted from wind by a very patient grandmother in Great Aespo.' },
  { id: 'ep_b7', slot: 'boots', tier: 'epic', name: 'Vanguard Warboots', fx: { kind: 'shieldStart', power: 1.0 }, fxDesc: 'Begin battle with a shield equal to 100% ATK (10s).', lore: 'First over the wall, last to fall over.' },
  { id: 'ep_t1', slot: 'talisman', tier: 'epic', name: 'Eye of Palandine', fx: { kind: 'critDmg', power: 20 }, fxDesc: 'Critical hits deal +20% more damage.', lore: 'It blinks when you land a good hit. Nobody knows how.' },
  { id: 'ep_t2', slot: 'talisman', tier: 'epic', name: 'Salmon Pearl Locket', fx: { kind: 'lifesteal', power: 8 }, fxDesc: 'Heal for 8% of all damage you deal.', lore: 'The pearl of New Salmon\'s deepest trench. It missed the sun.' },
  { id: 'ep_t3', slot: 'talisman', tier: 'epic', name: 'Aespo Charge Coil', fx: { kind: 'energyStart', power: 200 }, fxDesc: 'Begin battle with +200 Energy.', lore: 'Pre-charged with one medium thunderstorm.' },
  { id: 'ep_t4', slot: 'talisman', tier: 'epic', name: 'Jeehva Bloom Sigil', fx: { kind: 'regen', power: 2.0 }, fxDesc: 'Regenerates 2% of max HP every 3 seconds.', lore: 'Blooms once a year. Heals all year out of enthusiasm.' },
  { id: 'ep_t5', slot: 'talisman', tier: 'epic', name: 'Astorvia Dawn Medal', fx: { kind: 'firstStrike', power: 15, dur: 8 }, fxDesc: '+15% ATK for the first 8 seconds of battle.', lore: 'Awarded for valor at first light. Mornings only.' },
  { id: 'ep_t6', slot: 'talisman', tier: 'epic', name: 'Whisperwind Chime', fx: { kind: 'dodge', power: 6 }, fxDesc: '6% chance to dodge any attack.', lore: 'Rings a heartbeat before danger. Learn the tune.' },
  { id: 'ep_t7', slot: 'talisman', tier: 'epic', name: 'Ember Core Pendant', fx: { kind: 'dotAmp', power: 25 }, fxDesc: 'Your damage-over-time effects tick 25% harder.', lore: 'A coal from Palandine\'s first forge. Still going.' },

  /* ---------- LEGENDARY (30) — battle-turning power ---------- */
  { id: 'lg_w1', slot: 'weapon', tier: 'legendary', name: 'Kingfisher, Blade of New Salmon', fx: { kind: 'executeBonus', power: 30 }, fxDesc: '+30% damage to enemies below 50% HP.', lore: 'The royal blade of New Salmon dives exactly once per enemy.' },
  { id: 'lg_w2', slot: 'weapon', tier: 'legendary', name: 'Aespo\'s Thunderclap Maul', fx: { kind: 'stunOnHit', dur: 1, chance: 12 }, fxDesc: '12% chance on basic attacks to Stun for 1s.', lore: 'The echo arrives three seconds after the verdict.' },
  { id: 'lg_w3', slot: 'weapon', tier: 'legendary', name: 'Palandine Sunforge Greatsword', fx: { kind: 'burnOnHit', power: 0.35, dur: 4, chance: 50 }, fxDesc: '50% chance on basic attacks to Burn (35% ATK/s for 4s).', lore: 'Forged in a furnace fed by a captive sunbeam. The sunbeam signed off on it.' },
  { id: 'lg_w4', slot: 'weapon', tier: 'legendary', name: 'Verdict of Astorvia', fx: { kind: 'critDmg', power: 45 }, fxDesc: 'Critical hits deal +45% more damage.', lore: 'Astorvia\'s high court owns one gavel. This is not it, but it agrees with it.' },
  { id: 'lg_w5', slot: 'weapon', tier: 'legendary', name: 'Jeehva Serpentfang', fx: { kind: 'poisonOnHit', power: 0.35, dur: 4, chance: 50 }, fxDesc: '50% chance on basic attacks to Poison (35% ATK/s for 4s).', lore: 'The serpent regrew the fang. It did not ask for this one back.' },
  { id: 'lg_w6', slot: 'weapon', tier: 'legendary', name: 'Warcry of the Five Regions', fx: { kind: 'aoeBasic', n: 5, power: 0.8 }, fxDesc: 'Every 5th basic attack strikes ALL enemies for 80% ATK.', lore: 'Five banners, one blade, zero indoor voice.' },
  { id: 'lg_w7', slot: 'weapon', tier: 'legendary', name: 'Nightreaver Edge', fx: { kind: 'lifesteal', power: 15 }, fxDesc: 'Heal for 15% of all damage you deal.', lore: 'It drinks. You toast. The arrangement works.' },
  { id: 'lg_w8', slot: 'weapon', tier: 'legendary', name: 'Comet Lance of the Rift', fx: { kind: 'energyOnBasic', power: 30 }, fxDesc: '+30 bonus Energy on every basic attack.', lore: 'Caught mid-fall over the Rift of Leodones. It still thinks it is falling.' },
  { id: 'lg_a1', slot: 'armor', tier: 'legendary', name: 'Heartwall of Astorvia', fx: { kind: 'shieldStart', power: 2.8 }, fxDesc: 'Begin battle with a shield equal to 280% ATK (10s).', lore: 'When Astorvia\'s wall fell, its heart did not. Someone forged the difference.' },
  { id: 'lg_a2', slot: 'armor', tier: 'legendary', name: 'Molten Crown Plate', fx: { kind: 'thorns', power: 15 }, fxDesc: 'Reflects 15% of damage taken back to attackers.', lore: 'Wearing lava is a statement. Mostly to your enemies.' },
  { id: 'lg_a3', slot: 'armor', tier: 'legendary', name: 'Leviathan Kingscale', fx: { kind: 'regen', power: 3.0 }, fxDesc: 'Regenerates 3% of max HP every 3 seconds.', lore: 'The king of the deep sheds one scale per century. You were on time.' },
  { id: 'lg_a4', slot: 'armor', tier: 'legendary', name: 'Stormeater Harness', fx: { kind: 'dodge', power: 14 }, fxDesc: '14% chance to dodge any attack.', lore: 'It has eaten four storms and remains hungry.' },
  { id: 'lg_a5', slot: 'armor', tier: 'legendary', name: 'Aegis of the Rift Wardens', fx: { kind: 'defUp', power: 20 }, fxDesc: '+20% DEF for the whole battle.', lore: 'Standard issue for those who stand where the world thins.' },
  { id: 'lg_a6', slot: 'armor', tier: 'legendary', name: 'Wyrmbone Bulwark', fx: { kind: 'thorns', power: 18 }, fxDesc: 'Reflects 18% of damage taken back to attackers.', lore: 'The wyrm\'s ribs remember biting. They pass it on.' },
  { id: 'lg_a7', slot: 'armor', tier: 'legendary', name: 'Ghostweave Shroud', fx: { kind: 'dodge', power: 16 }, fxDesc: '16% chance to dodge any attack.', lore: 'Half of it is not entirely here. The useful half.' },
  { id: 'lg_a8', slot: 'armor', tier: 'legendary', name: 'Worldroot Cuirass', fx: { kind: 'regen', power: 3.5 }, fxDesc: 'Regenerates 3.5% of max HP every 3 seconds.', lore: 'Grown, not forged. Watered weekly.' },
  { id: 'lg_b1', slot: 'boots', tier: 'legendary', name: 'Stormstride Greaves', fx: { kind: 'haste', power: 15 }, fxDesc: '+15% Speed for the whole battle.', lore: 'Great Aespo measures its storms in strides. These set the record.' },
  { id: 'lg_b2', slot: 'boots', tier: 'legendary', name: 'Riptide Dancers', fx: { kind: 'energyOnBasic', power: 20 }, fxDesc: '+20 bonus Energy on every basic attack.', lore: 'The tide leads. You follow. Enemies drown in the choreography.' },
  { id: 'lg_b3', slot: 'boots', tier: 'legendary', name: 'Magma Crushers', fx: { kind: 'firstStrike', power: 30, dur: 8 }, fxDesc: '+30% ATK for the first 8 seconds of battle.', lore: 'Palandine smiths made boots that win the argument early.' },
  { id: 'lg_b4', slot: 'boots', tier: 'legendary', name: 'Featherfall Slippers', fx: { kind: 'dodge', power: 12 }, fxDesc: '12% chance to dodge any attack.', lore: 'Gravity files a complaint every time you wear them.' },
  { id: 'lg_b5', slot: 'boots', tier: 'legendary', name: 'Warpath Stompers', fx: { kind: 'shieldStart', power: 1.8 }, fxDesc: 'Begin battle with a shield equal to 180% ATK (10s).', lore: 'The path is wherever these land. Repeatedly.' },
  { id: 'lg_b6', slot: 'boots', tier: 'legendary', name: 'Zephyr Kingboots', fx: { kind: 'haste', power: 18 }, fxDesc: '+18% Speed for the whole battle.', lore: 'The west wind abdicated. These are the crown.' },
  { id: 'lg_b7', slot: 'boots', tier: 'legendary', name: 'Pilgrim\'s Endless Road', fx: { kind: 'regen', power: 2.5 }, fxDesc: 'Regenerates 2.5% of max HP every 3 seconds.', lore: 'Every step home. Every step healing. Same thing, says the pilgrim.' },
  { id: 'lg_t1', slot: 'talisman', tier: 'legendary', name: 'Crown Jewel of Agdao', fx: { kind: 'critDmg', power: 40 }, fxDesc: 'Critical hits deal +40% more damage.', lore: 'All five regions claim it. It claims you.' },
  { id: 'lg_t2', slot: 'talisman', tier: 'legendary', name: 'Blood Chalice Pendant', fx: { kind: 'lifesteal', power: 18 }, fxDesc: 'Heal for 18% of all damage you deal.', lore: 'It refills itself. Best not to ask from where.' },
  { id: 'lg_t3', slot: 'talisman', tier: 'legendary', name: 'Stormheart Battery', fx: { kind: 'energyStart', power: 400 }, fxDesc: 'Begin battle with +400 Energy.', lore: 'The heart of Aespo\'s eldest storm, still beating at 50 hertz.' },
  { id: 'lg_t4', slot: 'talisman', tier: 'legendary', name: 'Emberlord\'s Signet', fx: { kind: 'dotAmp', power: 40 }, fxDesc: 'Your damage-over-time effects tick 40% harder.', lore: 'Sealed every treaty Palandine ever burned.' },
  { id: 'lg_t5', slot: 'talisman', tier: 'legendary', name: 'Halo of the First Dawn', fx: { kind: 'firstStrike', power: 25, dur: 10 }, fxDesc: '+25% ATK for the first 10 seconds of battle.', lore: 'Astorvia\'s first sunrise, bent into a circle for carrying.' },
  { id: 'lg_t6', slot: 'talisman', tier: 'legendary', name: 'Abyssal Sonar Pearl', fx: { kind: 'executeBonus', power: 25 }, fxDesc: '+25% damage to enemies below 50% HP.', lore: 'It pings when something is nearly finished. Finish it.' },
  { id: 'lg_t7', slot: 'talisman', tier: 'legendary', name: 'Sigil of Five Banners', fx: { kind: 'critUp', power: 8 }, fxDesc: '+8% Critical chance for the whole battle.', lore: 'One banner per region, stitched into a single unreasonable flag.' },

  /* ---------- EPIC EXPANSION (20) — regional war-surplus ---------- */
  { id: 'ep_n1', slot: 'weapon', tier: 'epic', name: 'Borderland Skirmish Axe', fx: { kind: 'slowOnHit', power: 15, dur: 3, chance: 30 }, fxDesc: '30% chance on basic attacks to Slow the target 15% for 3s.', lore: 'Cuts tendon first, argument second.' },
  { id: 'ep_n2', slot: 'weapon', tier: 'epic', name: 'Grotto Pearl Trident', fx: { kind: 'defShredOnHit', power: 10, dur: 4, chance: 30 }, fxDesc: '30% chance on basic attacks to shred DEF by 10% for 4s.', lore: 'Three tines: one for fish, two for anyone who asks about the pearls.' },
  { id: 'ep_n3', slot: 'weapon', tier: 'epic', name: 'Sporewild Cudgel', fx: { kind: 'blindOnHit', power: 15, dur: 2, chance: 25 }, fxDesc: '25% chance on basic attacks to Blind the target (15% miss) for 2s.', lore: 'The spores get in the eyes. The cudgel handles the rest.' },
  { id: 'ep_n4', slot: 'weapon', tier: 'epic', name: 'Catacomb Warden Mace', fx: { kind: 'energyDrainOnHit', power: 30, chance: 35 }, fxDesc: '35% chance on basic attacks to drain 30 Energy from the target.', lore: 'The honored dead nap deeply. This enforces quiet hours.' },
  { id: 'ep_n5', slot: 'weapon', tier: 'epic', name: 'Vintner\'s Wrath', fx: { kind: 'skillVamp', power: 50 }, fxDesc: 'Casting your Skill heals you for 50% ATK.', lore: 'Jeehva\'s angriest gardener pruned an entire warband with it.' },
  { id: 'ep_n6', slot: 'weapon', tier: 'epic', name: 'Colosseum Practice Blade', fx: { kind: 'might', power: 8 }, fxDesc: '+8% ATK for the whole battle.', lore: 'The Ashen Colosseum calls it a practice blade. Practice for what, they never say.' },
  { id: 'ep_n7', slot: 'armor', tier: 'epic', name: 'Salmonscale Jerkin', fx: { kind: 'vitality', power: 8 }, fxDesc: '+8% Max HP at battle start.', lore: 'Swim upstream long enough and you become the current.' },
  { id: 'ep_n8', slot: 'armor', tier: 'epic', name: 'Ashen Pilgrim Robes', fx: { kind: 'berserkRage', power: 15 }, fxDesc: 'First time below 50% HP: +15% ATK for the rest of battle.', lore: 'Palandine pilgrims walk through fire on purpose. It puts them in a mood.' },
  { id: 'ep_n9', slot: 'armor', tier: 'epic', name: 'Dawnwatch Parade Plate', fx: { kind: 'lastStand', power: 150 }, fxDesc: 'First time below 30% HP: gain a shield equal to 150% ATK (8s).', lore: 'Polished for parades. Proven at the last hour of the last watch.' },
  { id: 'ep_n10', slot: 'armor', tier: 'epic', name: 'Banner-Sergeant\'s Cuirass', fx: { kind: 'rally', power: 8, dur: 8 }, fxDesc: 'Battle start: ALL allies gain +8% ATK for 8s.', lore: 'The sergeant never shouted. The armor did it for him.' },
  { id: 'ep_n11', slot: 'armor', tier: 'epic', name: 'Moss-Bound Aegis', fx: { kind: 'regen', power: 2.5 }, fxDesc: 'Regenerates 2.5% of max HP every 3 seconds.', lore: 'The moss is doing all the work. Do not tell the shield.' },
  { id: 'ep_n12', slot: 'boots', tier: 'epic', name: 'Bounty Runner\'s Treads', fx: { kind: 'frenzyKill', power: 5, max: 5 }, fxDesc: 'Each enemy kill grants +5% Speed (stacks up to 5).', lore: 'Paid by the head. Sprints accordingly.' },
  { id: 'ep_n13', slot: 'boots', tier: 'epic', name: 'Stormcrown Climbers', fx: { kind: 'haste', power: 12 }, fxDesc: '+12% Speed for the whole battle.', lore: 'Rated for peaks, storms, and hasty exits from both.' },
  { id: 'ep_n14', slot: 'boots', tier: 'epic', name: 'Wisp-Chaser Moccasins', fx: { kind: 'energyOnBasic', power: 18 }, fxDesc: '+18 bonus Energy on every basic attack.', lore: 'Sewn by someone who almost caught a Golden Wisp. Almost.' },
  { id: 'ep_n15', slot: 'boots', tier: 'epic', name: 'Grave-Quiet Soles', fx: { kind: 'blindOnHit', power: 12, dur: 2, chance: 20 }, fxDesc: '20% chance on basic attacks to Blind the target (12% miss) for 2s.', lore: 'Enemies hear nothing, then see less.' },
  { id: 'ep_n16', slot: 'talisman', tier: 'epic', name: 'Warlord\'s Iron Fang', fx: { kind: 'executeBonus', power: 18 }, fxDesc: '+18% damage to enemies below 50% HP.', lore: 'Pulled from the first Warlord to fall in Agdao. It remembers how.' },
  { id: 'ep_n17', slot: 'talisman', tier: 'epic', name: 'Guardian\'s Oath Knot', fx: { kind: 'wardAura', power: 0.6 }, fxDesc: 'Battle start: ALL allies gain a shield equal to 60% of your ATK (10s).', lore: 'Tied once. Never untied. That is the whole oath.' },
  { id: 'ep_n18', slot: 'talisman', tier: 'epic', name: 'Avenger\'s Ember', fx: { kind: 'avenger', power: 10 }, fxDesc: 'When an ally falls: +10% ATK for the rest of battle (stacks).', lore: 'It only glows when someone you love stops.' },
  { id: 'ep_n19', slot: 'talisman', tier: 'epic', name: 'Tide-Chart Compass', fx: { kind: 'critUp', power: 6 }, fxDesc: '+6% Critical chance for the whole battle.', lore: 'It does not point north. It points at weaknesses.' },
  { id: 'ep_n20', slot: 'talisman', tier: 'epic', name: 'Skyvault Lens', fx: { kind: 'critDmg', power: 22 }, fxDesc: 'Critical hits deal +22% more damage.', lore: 'The storm-lords used it to read. You use it to underline.' },

  /* ---------- MYSTIC (20) — arcana of the Accord, cyan-sealed ---------- */
  { id: 'my_1', slot: 'weapon', tier: 'mystic', name: 'Moonpetal Glaive', fx: { kind: 'slowOnHit', power: 20, dur: 3, chance: 40 }, fxDesc: '40% chance on basic attacks to Slow the target 20% for 3s.', lore: 'Blooms only at night. Harvests around the clock.' },
  { id: 'my_2', slot: 'weapon', tier: 'mystic', name: 'Accord-Sealed Saber', fx: { kind: 'defShredOnHit', power: 14, dur: 4, chance: 40 }, fxDesc: '40% chance on basic attacks to shred DEF by 14% for 4s.', lore: 'Five signatures on the blade. Each one voids a different kind of armor.' },
  { id: 'my_3', slot: 'weapon', tier: 'mystic', name: 'Whispering Tidefang', fx: { kind: 'skillVamp', power: 80 }, fxDesc: 'Casting your Skill heals you for 80% ATK.', lore: 'It murmurs the names of drowned kings. They tithe you their strength.' },
  { id: 'my_4', slot: 'weapon', tier: 'mystic', name: 'Mistral Songblade', fx: { kind: 'energyDrainOnHit', power: 50, chance: 40 }, fxDesc: '40% chance on basic attacks to drain 50 Energy from the target.', lore: 'It steals the breath mid-battle-cry. Rude. Effective.' },
  { id: 'my_5', slot: 'weapon', tier: 'mystic', name: 'Elderroot Heartspear', fx: { kind: 'might', power: 12 }, fxDesc: '+12% ATK for the whole battle.', lore: 'A branch the Elderroot gave willingly. It grows heavier with purpose.' },
  { id: 'my_6', slot: 'weapon', tier: 'mystic', name: 'Sirene\'s Encore', fx: { kind: 'blindOnHit', power: 20, dur: 2, chance: 30 }, fxDesc: '30% chance on basic attacks to Blind the target (20% miss) for 2s.', lore: 'The second verse is always aimed at the eyes.' },
  { id: 'my_7', slot: 'armor', tier: 'mystic', name: 'Robes of the Silent Vow', fx: { kind: 'vitality', power: 12 }, fxDesc: '+12% Max HP at battle start.', lore: 'The vow was never spoken, so it can never be broken.' },
  { id: 'my_8', slot: 'armor', tier: 'mystic', name: 'Mystic Wardweave', fx: { kind: 'wardAura', power: 0.9 }, fxDesc: 'Battle start: ALL allies gain a shield equal to 90% of your ATK (10s).', lore: 'Woven from the pause before a healer says "you\'ll be fine."' },
  { id: 'my_9', slot: 'armor', tier: 'mystic', name: 'Carapace of Rising Fury', fx: { kind: 'berserkRage', power: 22 }, fxDesc: 'First time below 50% HP: +22% ATK for the rest of battle.', lore: 'Pain in, power out. The exchange rate is excellent.' },
  { id: 'my_10', slot: 'armor', tier: 'mystic', name: 'Vigilkeeper Plate', fx: { kind: 'lastStand', power: 220 }, fxDesc: 'First time below 30% HP: gain a shield equal to 220% ATK (8s).', lore: 'The watch ends when the keeper says it ends.' },
  { id: 'my_11', slot: 'armor', tier: 'mystic', name: 'Deepcurrent Scalemail', fx: { kind: 'thorns', power: 12 }, fxDesc: 'Reflects 12% of damage taken back to attackers.', lore: 'Strike the ocean. See what comes back.' },
  { id: 'my_12', slot: 'boots', tier: 'mystic', name: 'Petalfall Dancers', fx: { kind: 'dodge', power: 12 }, fxDesc: '12% chance to dodge any attack.', lore: 'Yoon Sul choreographed one duel in these. The duel apologized.' },
  { id: 'my_13', slot: 'boots', tier: 'mystic', name: 'Currentstep Waders', fx: { kind: 'frenzyKill', power: 7, max: 5 }, fxDesc: 'Each enemy kill grants +7% Speed (stacks up to 5).', lore: 'The river never stops. Neither, apparently, do you.' },
  { id: 'my_14', slot: 'boots', tier: 'mystic', name: 'Moonlit Escort Greaves', fx: { kind: 'rally', power: 10, dur: 10 }, fxDesc: 'Battle start: ALL allies gain +10% ATK for 10s.', lore: 'Whoever walks beside you walks taller.' },
  { id: 'my_15', slot: 'boots', tier: 'mystic', name: 'Sagegrass Striders', fx: { kind: 'haste', power: 14 }, fxDesc: '+14% Speed for the whole battle.', lore: 'The grass bends before the wind arrives. So do you.' },
  { id: 'my_16', slot: 'talisman', tier: 'mystic', name: 'Third Eye of the Accord', fx: { kind: 'critUp', power: 7 }, fxDesc: '+7% Critical chance for the whole battle.', lore: 'It blinks at treaties and stares at throats.' },
  { id: 'my_17', slot: 'talisman', tier: 'mystic', name: 'Vow of the Fallen', fx: { kind: 'avenger', power: 14 }, fxDesc: 'When an ally falls: +14% ATK for the rest of battle (stacks).', lore: 'Grief, notarized and weaponized.' },
  { id: 'my_18', slot: 'talisman', tier: 'mystic', name: 'Lantern of Patient Tides', fx: { kind: 'regen', power: 2.8 }, fxDesc: 'Regenerates 2.8% of max HP every 3 seconds.', lore: 'The tide always comes back. So will you.' },
  { id: 'my_19', slot: 'talisman', tier: 'mystic', name: 'Charm of Hollow Hunger', fx: { kind: 'lifesteal', power: 12 }, fxDesc: 'Heal for 12% of all damage you deal.', lore: 'It is always a little empty. Feed it violence.' },
  { id: 'my_20', slot: 'talisman', tier: 'mystic', name: 'Mystic Charge Prism', fx: { kind: 'energyStart', power: 300 }, fxDesc: 'Begin battle with +300 Energy.', lore: 'Charged under five moons. Discharged under one bad decision.' },

  /* ---------- ULTIMATE (20) — conquest-forged, warlord orange ---------- */
  { id: 'ul_1', slot: 'weapon', tier: 'ultimate', name: 'Warlord\'s Mandate', fx: { kind: 'might', power: 16 }, fxDesc: '+16% ATK for the whole battle.', lore: 'Not a sword. A decree with an edge.' },
  { id: 'ul_2', slot: 'weapon', tier: 'ultimate', name: 'Conqueror\'s Cleaver', fx: { kind: 'executeBonus', power: 26 }, fxDesc: '+26% damage to enemies below 50% HP.', lore: 'Territory is negotiated. This is the negotiator.' },
  { id: 'ul_3', slot: 'weapon', tier: 'ultimate', name: 'Sunspite Warglaive', fx: { kind: 'defShredOnHit', power: 18, dur: 4, chance: 50 }, fxDesc: '50% chance on basic attacks to shred DEF by 18% for 4s.', lore: 'Forged at noon out of pure spite for shadows.' },
  { id: 'ul_4', slot: 'weapon', tier: 'ultimate', name: 'Tyrantbreaker Maul', fx: { kind: 'stunOnHit', dur: 1, chance: 10 }, fxDesc: '10% chance on basic attacks to Stun for 1s.', lore: 'Seven tyrants. Seven very short final speeches.' },
  { id: 'ul_5', slot: 'weapon', tier: 'ultimate', name: 'Bloodmoon Harvester', fx: { kind: 'skillVamp', power: 110 }, fxDesc: 'Casting your Skill heals you for 110% ATK.', lore: 'Under the bloodmoon, every swing is also a meal.' },
  { id: 'ul_6', slot: 'weapon', tier: 'ultimate', name: 'Siegecrown Lance', fx: { kind: 'slowOnHit', power: 25, dur: 3, chance: 50 }, fxDesc: '50% chance on basic attacks to Slow the target 25% for 3s.', lore: 'Walls fall. Knees follow.' },
  { id: 'ul_7', slot: 'armor', tier: 'ultimate', name: 'Unyielding Warplate', fx: { kind: 'lastStand', power: 300 }, fxDesc: 'First time below 30% HP: gain a shield equal to 300% ATK (8s).', lore: 'Retreat is a word it was never taught.' },
  { id: 'ul_8', slot: 'armor', tier: 'ultimate', name: 'Rage-Tempered Bulwark', fx: { kind: 'berserkRage', power: 30 }, fxDesc: 'First time below 50% HP: +30% ATK for the rest of battle.', lore: 'Quenched in fury instead of water. The smith needed a vacation after.' },
  { id: 'ul_9', slot: 'armor', tier: 'ultimate', name: 'Colossus-Bone Harness', fx: { kind: 'vitality', power: 16 }, fxDesc: '+16% Max HP at battle start.', lore: 'The Colossus does not miss it. The Colossus is in it.' },
  { id: 'ul_10', slot: 'armor', tier: 'ultimate', name: 'Standard-Bearer\'s Mantle', fx: { kind: 'rally', power: 14, dur: 10 }, fxDesc: 'Battle start: ALL allies gain +14% ATK for 10s.', lore: 'Whoever carries the banner carries the battle.' },
  { id: 'ul_11', slot: 'armor', tier: 'ultimate', name: 'Molten Vengeance Mail', fx: { kind: 'thorns', power: 16 }, fxDesc: 'Reflects 16% of damage taken back to attackers.', lore: 'Every blow paid back with interest and heat.' },
  { id: 'ul_12', slot: 'boots', tier: 'ultimate', name: 'Overrun Stompers', fx: { kind: 'frenzyKill', power: 9, max: 5 }, fxDesc: 'Each enemy kill grants +9% Speed (stacks up to 5).', lore: 'Momentum is a weapon. These are its holsters.' },
  { id: 'ul_13', slot: 'boots', tier: 'ultimate', name: 'Warpath Vanguards', fx: { kind: 'firstStrike', power: 32, dur: 8 }, fxDesc: '+32% ATK for the first 8 seconds of battle.', lore: 'First in. The rest is bookkeeping.' },
  { id: 'ul_14', slot: 'boots', tier: 'ultimate', name: 'Duskmarch Enforcers', fx: { kind: 'haste', power: 16 }, fxDesc: '+16% Speed for the whole battle.', lore: 'The march that ended three wars by arriving early.' },
  { id: 'ul_15', slot: 'boots', tier: 'ultimate', name: 'Gravebreaker Sabatons', fx: { kind: 'energyOnBasic', power: 25 }, fxDesc: '+25 bonus Energy on every basic attack.', lore: 'Each step wakes something. Fortunately, it is you.' },
  { id: 'ul_16', slot: 'talisman', tier: 'ultimate', name: 'Warhorn of Agdao', fx: { kind: 'wardAura', power: 1.2 }, fxDesc: 'Battle start: ALL allies gain a shield equal to 120% of your ATK (10s).', lore: 'One note. Five regions answer.' },
  { id: 'ul_17', slot: 'talisman', tier: 'ultimate', name: 'Oathbreaker\'s Debt', fx: { kind: 'avenger', power: 18 }, fxDesc: 'When an ally falls: +18% ATK for the rest of battle (stacks).', lore: 'Someone broke a promise. You are the collections department.' },
  { id: 'ul_18', slot: 'talisman', tier: 'ultimate', name: 'Crown of Spited Kings', fx: { kind: 'critDmg', power: 42 }, fxDesc: 'Critical hits deal +42% more damage.', lore: 'Every king it outlived sharpened it a little more.' },
  { id: 'ul_19', slot: 'talisman', tier: 'ultimate', name: 'Ultimatum Sigil', fx: { kind: 'energyDrainOnHit', power: 70, chance: 50 }, fxDesc: '50% chance on basic attacks to drain 70 Energy from the target.', lore: 'Surrender now, or surrender shortly.' },
  { id: 'ul_20', slot: 'talisman', tier: 'ultimate', name: 'Heart of the Conquest', fx: { kind: 'energyStart', power: 350 }, fxDesc: 'Begin battle with +350 Energy.', lore: 'It beats in war drums. It skips in peace.' },

  /* ---------- LEGENDARY EXPANSION (20) — relics of the great names ---------- */
  { id: 'lg_n1', slot: 'weapon', tier: 'legendary', name: 'Dawnbreaker, Oath of Azrin', fx: { kind: 'might', power: 20 }, fxDesc: '+20% ATK for the whole battle.', lore: 'Azrin swore one oath at sunrise. The blade has kept it every dawn since.' },
  { id: 'lg_n2', slot: 'weapon', tier: 'legendary', name: 'Ledger of Azrael', fx: { kind: 'executeBonus', power: 32 }, fxDesc: '+32% damage to enemies below 50% HP.', lore: 'Every soul owes. This is the polite final notice.' },
  { id: 'lg_n3', slot: 'weapon', tier: 'legendary', name: 'Maw of the Rift Wyrm', fx: { kind: 'skillVamp', power: 150 }, fxDesc: 'Casting your Skill heals you for 150% ATK.', lore: 'The wyrm ate light itself. Its teeth learned generosity from no one.' },
  { id: 'lg_n4', slot: 'weapon', tier: 'legendary', name: 'Stormherald\'s Judgment', fx: { kind: 'slowOnHit', power: 30, dur: 3, chance: 60 }, fxDesc: '60% chance on basic attacks to Slow the target 30% for 3s.', lore: 'The verdict arrives before the thunder does.' },
  { id: 'lg_n5', slot: 'weapon', tier: 'legendary', name: 'Worldsplitter Reforged', fx: { kind: 'defShredOnHit', power: 24, dur: 4, chance: 60 }, fxDesc: '60% chance on basic attacks to shred DEF by 24% for 4s.', lore: 'It split the world once. The world flinches on sight now.' },
  { id: 'lg_n6', slot: 'weapon', tier: 'legendary', name: 'The Creator\'s Quill', fx: { kind: 'energyDrainOnHit', power: 100, chance: 60 }, fxDesc: '60% chance on basic attacks to drain 100 Energy from the target.', lore: 'Aljay crossed out an entire villain arc with it. Twice.' },
  { id: 'lg_n7', slot: 'armor', tier: 'legendary', name: 'Bulwark of Ten Thousand Oaths', fx: { kind: 'lastStand', power: 400 }, fxDesc: 'First time below 30% HP: gain a shield equal to 400% ATK (8s).', lore: 'Every oath ever kept in Astorvia, hammered into one wall.' },
  { id: 'lg_n8', slot: 'armor', tier: 'legendary', name: 'Heartfire Juggernaut Plate', fx: { kind: 'berserkRage', power: 40 }, fxDesc: 'First time below 50% HP: +40% ATK for the rest of battle.', lore: 'The wound is the ignition. Stand back.' },
  { id: 'lg_n9', slot: 'armor', tier: 'legendary', name: 'Leviathan-King Aegis', fx: { kind: 'vitality', power: 22 }, fxDesc: '+22% Max HP at battle start.', lore: 'The king of the deep donated his crown-scale. He insists it was a donation.' },
  { id: 'lg_n10', slot: 'armor', tier: 'legendary', name: 'Warbanner of the Five Dawns', fx: { kind: 'rally', power: 18, dur: 12 }, fxDesc: 'Battle start: ALL allies gain +18% ATK for 12s.', lore: 'Five sunrises stitched into cloth. Morale is now structural.' },
  { id: 'lg_n11', slot: 'armor', tier: 'legendary', name: 'Shroud of the Patient Reaper', fx: { kind: 'dodge', power: 15 }, fxDesc: '15% chance to dodge any attack.', lore: 'Azrael\'s spare cloak. Death is punctual; you don\'t have to be.' },
  { id: 'lg_n12', slot: 'boots', tier: 'legendary', name: 'Apexhunter Talons', fx: { kind: 'frenzyKill', power: 12, max: 5 }, fxDesc: 'Each enemy kill grants +12% Speed (stacks up to 5).', lore: 'The food chain has a top. These are its shoes.' },
  { id: 'lg_n13', slot: 'boots', tier: 'legendary', name: 'Vowkeeper\'s March', fx: { kind: 'wardAura', power: 1.6 }, fxDesc: 'Battle start: ALL allies gain a shield equal to 160% of your ATK (10s).', lore: 'Where these boots walk, promises hold.' },
  { id: 'lg_n14', slot: 'boots', tier: 'legendary', name: 'Thunderking Stride', fx: { kind: 'haste', power: 20 }, fxDesc: '+20% Speed for the whole battle.', lore: 'Aespo crowned the storm. The storm bought boots.' },
  { id: 'lg_n15', slot: 'boots', tier: 'legendary', name: 'Executioner\'s Approach', fx: { kind: 'executeBonus', power: 22 }, fxDesc: '+22% damage to enemies below 50% HP.', lore: 'You hear them coming. That is the point.' },
  { id: 'lg_n16', slot: 'talisman', tier: 'legendary', name: 'Tear of the First Dawn', fx: { kind: 'avenger', power: 25 }, fxDesc: 'When an ally falls: +25% ATK for the rest of battle (stacks).', lore: 'The first sunrise saw the first loss, and wept exactly once.' },
  { id: 'lg_n17', slot: 'talisman', tier: 'legendary', name: 'Blood-Debt Reliquary', fx: { kind: 'lifesteal', power: 20 }, fxDesc: 'Heal for 20% of all damage you deal.', lore: 'All debts are payable in one currency. It makes change.' },
  { id: 'lg_n18', slot: 'talisman', tier: 'legendary', name: 'Eye of the Sleeping Storm', fx: { kind: 'energyStart', power: 500 }, fxDesc: 'Begin battle with +500 Energy.', lore: 'The storm is asleep. You are holding its alarm clock.' },
  { id: 'lg_n19', slot: 'talisman', tier: 'legendary', name: 'Seismic Heartstone', fx: { kind: 'critDmg', power: 48 }, fxDesc: 'Critical hits deal +48% more damage.', lore: 'A pebble from Lemon Quake\'s coronation. It still shakes with applause.' },
  { id: 'lg_n20', slot: 'talisman', tier: 'legendary', name: 'Sovereign\'s Iron Promise', fx: { kind: 'vitality', power: 18 }, fxDesc: '+18% Max HP at battle start.', lore: 'Kings die. Promises made in iron do not.' },

  /* ---------- AETHER (30) — effects found NOWHERE else ---------- */
  { id: 'ae_w1', slot: 'weapon', tier: 'aether', name: 'Riftrender, Fang of Leodones', fx: { kind: 'echoStrike', power: 0.45 }, fxDesc: 'AETHER · Basic attacks ECHO, striking the target again for 45% ATK.', lore: 'The Rift bit back once. This is the tooth it left in the world.' },
  { id: 'ae_w2', slot: 'weapon', tier: 'aether', name: 'Chronoblade Eternal', fx: { kind: 'timeWarp', power: 35 }, fxDesc: 'AETHER · Skill cooldowns recover 35% faster.', lore: 'It cuts seconds. The wound never closes.' },
  { id: 'ae_w3', slot: 'weapon', tier: 'aether', name: 'Starfall Warpike', fx: { kind: 'starfall', power: 1.0, every: 5 }, fxDesc: 'AETHER · Every 5s, a star falls on a random enemy for 100% ATK.', lore: 'Point it at the sky and the sky takes requests.' },
  { id: 'ae_w4', slot: 'weapon', tier: 'aether', name: 'Soulmirror Scythe', fx: { kind: 'vampiricOnHit', power: 0.20, dur: 4, chance: 30 }, fxDesc: 'AETHER · 30% chance on basics to inflict Vampiric Curse (20% ATK/s drained to heal your weakest ally, 4s).', lore: 'It shows enemies their reflection, then keeps it.' },
  { id: 'ae_w5', slot: 'weapon', tier: 'aether', name: 'The Unmade Edge', fx: { kind: 'soulHarvest', hpPct: 15, energy: 250 }, fxDesc: 'AETHER · On kill: restore 15% max HP and gain 250 Energy.', lore: 'Whatever it unmakes, it keeps a little for you.' },
  { id: 'ae_w6', slot: 'weapon', tier: 'aether', name: 'Aetherlash, Whip of Dawn', fx: { kind: 'echoStrike', power: 0.60 }, fxDesc: 'AETHER · Basic attacks ECHO, striking the target again for 60% ATK.', lore: 'Dawn cracks. This is the sound, weaponized.' },
  { id: 'ae_w7', slot: 'weapon', tier: 'aether', name: 'Voidsinger Katana', fx: { kind: 'timeWarp', power: 50 }, fxDesc: 'AETHER · Skill cooldowns recover 50% faster.', lore: 'It sings in a key that time signature theory forbids.' },
  { id: 'ae_w8', slot: 'weapon', tier: 'aether', name: 'Lance of the Falling Sky', fx: { kind: 'starfall', power: 1.4, every: 6 }, fxDesc: 'AETHER · Every 6s, a star falls on a random enemy for 140% ATK.', lore: 'Chicken Little was right. He was holding this.' },
  { id: 'ae_a1', slot: 'armor', tier: 'aether', name: 'Phaseweave Robes', fx: { kind: 'phaseShift', charges: 3 }, fxDesc: 'AETHER · PHASE through the first 3 attacks against you — they miss entirely.', lore: 'Sometimes you are simply elsewhere. The robes handle scheduling.' },
  { id: 'ae_a2', slot: 'armor', tier: 'aether', name: 'Aegis of Undying Light', fx: { kind: 'guardianAngel', revivePct: 20 }, fxDesc: 'AETHER · GUARDIAN ANGEL: the first fatal blow each battle leaves you alive at 20% HP.', lore: 'Death knocked. The light answered the door.' },
  { id: 'ae_a3', slot: 'armor', tier: 'aether', name: 'Stasis-Locked Warplate', fx: { kind: 'stasis' }, fxDesc: 'AETHER · STASIS: immune to Stun and Silence.', lore: 'Frozen at the exact moment of being unstoppable.' },
  { id: 'ae_a4', slot: 'armor', tier: 'aether', name: 'Mantle of Second Dawn', fx: { kind: 'guardianAngel', revivePct: 30 }, fxDesc: 'AETHER · GUARDIAN ANGEL: the first fatal blow each battle leaves you alive at 30% HP.', lore: 'Every day has two dawns. Most people never need the spare.' },
  { id: 'ae_a5', slot: 'armor', tier: 'aether', name: 'Ghostlight Carapace', fx: { kind: 'phaseShift', charges: 4 }, fxDesc: 'AETHER · PHASE through the first 4 attacks against you — they miss entirely.', lore: 'Grown from light that died and refused to go dark.' },
  { id: 'ae_a6', slot: 'armor', tier: 'aether', name: 'Riftguard Exoshell', fx: { kind: 'stasis' }, fxDesc: 'AETHER · STASIS: immune to Stun and Silence.', lore: 'Built for the Rift Wardens, who cannot afford to blink.' },
  { id: 'ae_a7', slot: 'armor', tier: 'aether', name: 'Chronomail of the First Hour', fx: { kind: 'chronoShift', power: 4, every: 5, max: 40 }, fxDesc: 'AETHER · CHRONOSHIFT: gain +4% Speed every 5s, up to +40%.', lore: 'The first hour of the world, hammered flat and worn since.' },
  { id: 'ae_a8', slot: 'armor', tier: 'aether', name: 'Shell of the Sleeping Star', fx: { kind: 'guardianAngel', revivePct: 25 }, fxDesc: 'AETHER · GUARDIAN ANGEL: the first fatal blow each battle leaves you alive at 25% HP.', lore: 'The star is still asleep inside. It rolls over when you fall.' },
  { id: 'ae_b1', slot: 'boots', tier: 'aether', name: 'Blinkstep Voidwalkers', fx: { kind: 'phaseShift', charges: 2 }, fxDesc: 'AETHER · PHASE through the first 2 attacks against you — they miss entirely.', lore: 'Two steps ahead is a location. These know the way.' },
  { id: 'ae_b2', slot: 'boots', tier: 'aether', name: 'Chronostep Striders', fx: { kind: 'chronoShift', power: 3, every: 4, max: 36 }, fxDesc: 'AETHER · CHRONOSHIFT: gain +3% Speed every 4s, up to +36%.', lore: 'Each stride borrows a moment from tomorrow. Tomorrow keeps a tab.' },
  { id: 'ae_b3', slot: 'boots', tier: 'aether', name: 'Comet-Trail Greaves', fx: { kind: 'timeWarp', power: 25 }, fxDesc: 'AETHER · Skill cooldowns recover 25% faster.', lore: 'Comets envy the schedule you keep.' },
  { id: 'ae_b4', slot: 'boots', tier: 'aether', name: 'Eventide Phasetreads', fx: { kind: 'phaseShift', charges: 3 }, fxDesc: 'AETHER · PHASE through the first 3 attacks against you — they miss entirely.', lore: 'At twilight, edges blur. These stay blurred on purpose.' },
  { id: 'ae_b5', slot: 'boots', tier: 'aether', name: 'Riftskip Sandals', fx: { kind: 'chronoShift', power: 4, every: 5, max: 32 }, fxDesc: 'AETHER · CHRONOSHIFT: gain +4% Speed every 5s, up to +32%.', lore: 'Skipping stones, but the pond is causality.' },
  { id: 'ae_b6', slot: 'boots', tier: 'aether', name: 'Boots of Borrowed Time', fx: { kind: 'timeWarp', power: 30 }, fxDesc: 'AETHER · Skill cooldowns recover 30% faster.', lore: 'The interest rate is fair. The collector is not.' },
  { id: 'ae_b7', slot: 'boots', tier: 'aether', name: 'Starstride Heels', fx: { kind: 'starfall', power: 0.7, every: 6 }, fxDesc: 'AETHER · Every 6s, a star falls on a random enemy for 70% ATK.', lore: 'Walk hard enough and the constellations shake loose.' },
  { id: 'ae_t1', slot: 'talisman', tier: 'aether', name: 'Heart of the Rift', fx: { kind: 'overcharge' }, fxDesc: 'AETHER · OVERCHARGE: begin battle with your ULTIMATE fully charged.', lore: 'The Rift of Leodones has a pulse. Now it is yours.' },
  { id: 'ae_t2', slot: 'talisman', tier: 'aether', name: 'Leodones\' Last Ember', fx: { kind: 'soulHarvest', hpPct: 20, energy: 300 }, fxDesc: 'AETHER · On kill: restore 20% max HP and gain 300 Energy.', lore: 'What Leodones left burning when the Rift took the rest.' },
  { id: 'ae_t3', slot: 'talisman', tier: 'aether', name: 'Pendant of Frozen Hours', fx: { kind: 'stasis' }, fxDesc: 'AETHER · STASIS: immune to Stun and Silence.', lore: 'Inside the crystal, an hour that never happened. It protects its own.' },
  { id: 'ae_t4', slot: 'talisman', tier: 'aether', name: 'The Creator\'s Paradox', fx: { kind: 'overcharge' }, fxDesc: 'AETHER · OVERCHARGE: begin battle with your ULTIMATE fully charged.', lore: 'Aljay wrote a rule that breaks the rules. This is the semicolon.' },
  { id: 'ae_t5', slot: 'talisman', tier: 'aether', name: 'Singularity Prism', fx: { kind: 'starfall', power: 0.9, every: 5 }, fxDesc: 'AETHER · Every 5s, a star falls on a random enemy for 90% ATK.', lore: 'All light bends toward it. Some of it never leaves.' },
  { id: 'ae_t6', slot: 'talisman', tier: 'aether', name: 'Echo of the First Words', fx: { kind: 'echoStrike', power: 0.35 }, fxDesc: 'AETHER · Basic attacks ECHO, striking the target again for 35% ATK.', lore: 'The realm\'s first sentence, still bouncing off the mountains.' },
  { id: 'ae_t7', slot: 'talisman', tier: 'aether', name: 'Vampire Star Fragment', fx: { kind: 'vampiricOnHit', power: 0.25, dur: 4, chance: 35 }, fxDesc: 'AETHER · 35% chance on basics to inflict Vampiric Curse (25% ATK/s drained to heal your weakest ally, 4s).', lore: 'A star that feeds on other stars. It is on your side now. Probably.' },

  /* ============================================================
     ASCENSION (40) — the gear of the level-100 champions.
     Only drops in the DEPTHS OF AGDAO (Expeditions). Every piece
     demands a Level 100 champion; sixteen are CLASS-EXCLUSIVE
     (Healer ✚ / Tank 🛡️ / Melee 🗡️ / Ranged 🏹). Stats still ride
     the shared curve (mult 8.2) — the effects are the legend.
     ============================================================ */
  /* ---- WEAPONS (10) ---- */
  { id: 'as_w1', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'Zenith, the Hundredth Dawn', fx: { kind: 'echoStrike', power: 1.0 }, fxDesc: 'ASCENSION · Basic attacks ECHO, striking the target AGAIN for 100% ATK.', lore: 'Raised at the hundredth sunrise by the first champion to see it. It has never set.' },
  { id: 'as_w2', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'Worldsbane Ultima', fx: { kind: 'executeBonus', power: 60 }, fxDesc: 'ASCENSION · +60% damage to enemies below 50% HP.', lore: 'The realm keeps a list of things that must end. This is the pen and the period.' },
  { id: 'as_w3', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'Starforge Apotheosis', fx: { kind: 'starfall', power: 2.2, every: 4 }, fxDesc: 'ASCENSION · Every 4s, a star falls on a random enemy for 220% ATK.', lore: 'Not forged under the stars. Forged FROM them.' },
  { id: 'as_w4', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'The Infinite Argument', fx: { kind: 'timeWarp', power: 80 }, fxDesc: 'ASCENSION · Skill cooldowns recover 80% faster.', lore: 'It has never lost a debate. Its rebuttals arrive before the objection.' },
  { id: 'as_w5', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'Doomwhisper, Voice of the Deep', fx: { kind: 'defShredOnHit', power: 40, dur: 5, chance: 75 }, fxDesc: 'ASCENSION · 75% chance on basics to SHRED enemy DEF by 40% for 5s.', lore: 'It speaks once per swing. Armor listens, then leaves.' },
  { id: 'as_w6', slot: 'weapon', tier: 'ascension', levelReq: 100, name: 'Aetherstorm Cataclysm', fx: { kind: 'aoeBasic', power: 0.65, n: 3 }, fxDesc: 'ASCENSION · Every 3rd basic attack unleashes a storm hitting ALL enemies for 65% ATK.', lore: 'The storm that ate Great Aespo\'s tallest peak, folded into a handle.' },
  { id: 'as_wm', slot: 'weapon', tier: 'ascension', levelReq: 100, classReq: 'melee', name: '⟐ Worldbreaker Edgelord', fx: { kind: 'culling', power: 15 }, fxDesc: 'MELEE EXCLUSIVE · CULLING: basic attacks EXECUTE enemies below 15% HP outright.', lore: 'For the blade-sworn only. It does not finish fights — it deletes their endings.' },
  { id: 'as_wr', slot: 'weapon', tier: 'ascension', levelReq: 100, classReq: 'ranged', name: '⟐ Horizon\'s End Longbow', fx: { kind: 'echoStrike', power: 1.4 }, fxDesc: 'RANGED EXCLUSIVE · Basic attacks ECHO for 140% ATK — the second arrow arrives first.', lore: 'Strung with the line where sky meets sea. Range is a rumor it started.' },
  { id: 'as_wt', slot: 'weapon', tier: 'ascension', levelReq: 100, classReq: 'tank', name: '⟐ Bastionbreaker Maul', fx: { kind: 'stunOnHit', dur: 1.6, chance: 30 }, fxDesc: 'TANK EXCLUSIVE · 30% chance on basics to STUN the target for 1.6s.', lore: 'Walls respect it. Skulls obey it.' },
  { id: 'as_wh', slot: 'weapon', tier: 'ascension', levelReq: 100, classReq: 'support', name: '⟐ Lifebloom Scepter of Dawn', fx: { kind: 'healAmp', power: 50 }, fxDesc: 'HEALER EXCLUSIVE · ALL your healing is 50% stronger.', lore: 'It flowered once in the Creator\'s hand. It has been spring around it ever since.' },
  /* ---- ARMOR (10) ---- */
  { id: 'as_a1', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Aegis of the Ascended', fx: { kind: 'guardianAngel', revivePct: 50 }, fxDesc: 'ASCENSION · GUARDIAN ANGEL: the first fatal blow leaves you alive at 50% HP.', lore: 'Worn by the first champion to reach the hundredth level. Death filed a complaint.' },
  { id: 'as_a2', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Colossus Eternal Warplate', fx: { kind: 'vitality', power: 40 }, fxDesc: 'ASCENSION · +40% Max HP at battle start.', lore: 'The Colossus was melted down and reforged willingly. It wanted a better view.' },
  { id: 'as_a3', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Phasewrought Infinity Shell', fx: { kind: 'phaseShift', charges: 6 }, fxDesc: 'ASCENSION · PHASE through the first 6 attacks against you — they miss entirely.', lore: 'It exists in six places at once. You are wearing all of them.' },
  { id: 'as_a4', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Mirrorstorm Carapace', fx: { kind: 'thorns', power: 35 }, fxDesc: 'ASCENSION · Reflects 35% of damage taken back to attackers.', lore: 'Strike it and meet yourself, mid-swing, less friendly.' },
  { id: 'as_a5', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Deathless Sovereign Mail', fx: { kind: 'lastStand', power: 800 }, fxDesc: 'ASCENSION · First time below 30% HP: gain a shield equal to 800% ATK (8s).', lore: 'Its last three owners are still alive. That is the entire sales pitch.' },
  { id: 'as_a6', slot: 'armor', tier: 'ascension', levelReq: 100, name: 'Robes of the Silent Hour', fx: { kind: 'dodge', power: 25 }, fxDesc: 'ASCENSION · 25% chance to dodge any attack.', lore: 'Woven from the hour the Rift held its breath. Blades pass through the pause.' },
  { id: 'as_am', slot: 'armor', tier: 'ascension', levelReq: 100, classReq: 'melee', name: '⟐ Bloodforged Berserker Plate', fx: { kind: 'berserkRage', power: 80 }, fxDesc: 'MELEE EXCLUSIVE · First time below 50% HP: +80% ATK for the rest of battle.', lore: 'It drinks the wearer\'s fury and pours back a flood.' },
  { id: 'as_ar', slot: 'armor', tier: 'ascension', levelReq: 100, classReq: 'ranged', name: '⟐ Windshadow Sniper Shroud', fx: { kind: 'critUp', power: 25 }, fxDesc: 'RANGED EXCLUSIVE · +25% Critical chance for the whole battle.', lore: 'The wind cannot find you. Your arrows tell it where to look.' },
  { id: 'as_at', slot: 'armor', tier: 'ascension', levelReq: 100, classReq: 'tank', name: '⟐ Bulwark of the Last Wall', fx: { kind: 'guardAura', power: 20 }, fxDesc: 'TANK EXCLUSIVE · GUARD AURA: while you stand, ALL other allies take 20% less damage.', lore: 'When the last wall of Astorvia fell, this is what the defenders found still standing.' },
  { id: 'as_ah', slot: 'armor', tier: 'ascension', levelReq: 100, classReq: 'support', name: '⟐ Vestments of the Dawnmother', fx: { kind: 'wardAura', power: 3.0 }, fxDesc: 'HEALER EXCLUSIVE · Battle start: ALL allies gain a shield equal to 300% of your ATK (10s).', lore: 'The Dawnmother swaddled the first morning in this cloth. It still keeps things safe.' },
  /* ---- BOOTS (10) ---- */
  { id: 'as_b1', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Striders of the Hundredfold Path', fx: { kind: 'haste', power: 35 }, fxDesc: 'ASCENSION · +35% Speed for the whole battle.', lore: 'They walked all hundred roads to mastery, then asked for a hundred more.' },
  { id: 'as_b2', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Chronoflux Voidrunners', fx: { kind: 'chronoShift', power: 6, every: 3, max: 72 }, fxDesc: 'ASCENSION · CHRONOSHIFT: gain +6% Speed every 3s, up to +72%.', lore: 'Each step arrives before the last one leaves. Physics has stopped asking.' },
  { id: 'as_b3', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Gravemarch Dominators', fx: { kind: 'frenzyKill', power: 18, max: 6 }, fxDesc: 'ASCENSION · Each enemy kill grants +18% Speed (stacks up to 6).', lore: 'Momentum incarnate. The battlefield is just a runway.' },
  { id: 'as_b4', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Dawnsprint Eternals', fx: { kind: 'firstStrike', power: 60, dur: 10 }, fxDesc: 'ASCENSION · +60% ATK for the first 10 seconds of battle.', lore: 'The first ten seconds of every war belong to whoever wears these.' },
  { id: 'as_b5', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Comet-Heart Chargers', fx: { kind: 'energyOnBasic', power: 45 }, fxDesc: 'ASCENSION · +45 bonus Energy on every basic attack.', lore: 'A comet\'s heart beats in each heel. They are always mid-arrival.' },
  { id: 'as_b6', slot: 'boots', tier: 'ascension', levelReq: 100, name: 'Riftwalker Paradox Treads', fx: { kind: 'phaseShift', charges: 4 }, fxDesc: 'ASCENSION · PHASE through the first 4 attacks against you — they miss entirely.', lore: 'Half a step into the Rift at all times. The Rift finds it flattering.' },
  { id: 'as_bm', slot: 'boots', tier: 'ascension', levelReq: 100, classReq: 'melee', name: '⟐ Warpath Annihilators', fx: { kind: 'lifesteal', power: 30 }, fxDesc: 'MELEE EXCLUSIVE · Heal for 30% of ALL damage you deal.', lore: 'They march on spilled strength and never tire.' },
  { id: 'as_br', slot: 'boots', tier: 'ascension', levelReq: 100, classReq: 'ranged', name: '⟐ Skyhunter Zephyr Boots', fx: { kind: 'hasteAura', power: 15 }, fxDesc: 'RANGED EXCLUSIVE · SQUALL AURA: ALL allies gain +15% Speed for the whole battle.', lore: 'The wind follows the hunter home and stays for the war.' },
  { id: 'as_bt', slot: 'boots', tier: 'ascension', levelReq: 100, classReq: 'tank', name: '⟐ Unmovable Mountain Greaves', fx: { kind: 'bulwarkAura', power: 18 }, fxDesc: 'TANK EXCLUSIVE · MOUNTAIN AURA: ALL allies gain +18% DEF for the whole battle.', lore: 'The mountain was asked to move. These are its written refusal.' },
  { id: 'as_bh', slot: 'boots', tier: 'ascension', levelReq: 100, classReq: 'support', name: '⟐ Pilgrim Steps of Renewal', fx: { kind: 'regen', power: 5 }, fxDesc: 'HEALER EXCLUSIVE · Regenerate 5% of max HP every 3 seconds.', lore: 'Every step plants a small spring. The road behind you blooms.' },
  /* ---- TALISMANS (10) ---- */
  { id: 'as_t1', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'Crown of the Ascended King', fx: { kind: 'mightAura', power: 15 }, fxDesc: 'ASCENSION · SOVEREIGN AURA: ALL allies gain +15% ATK for the whole battle.', lore: 'Whoever wears it is king. The crown decided; the realms adjusted.' },
  { id: 'as_t2', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'The Creator\'s Final Word', fx: { kind: 'overcharge' }, fxDesc: 'ASCENSION · OVERCHARGE: begin battle with your ULTIMATE fully charged.', lore: 'Aljay wrote it, read it twice, and locked it in the deepest floor of the deepest depth.' },
  { id: 'as_t3', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'Heart of a Dead God', fx: { kind: 'soulHarvest', hpPct: 30, energy: 500 }, fxDesc: 'ASCENSION · On kill: restore 30% max HP and gain 500 Energy.', lore: 'It still beats. It has simply changed employers.' },
  { id: 'as_t4', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'Oblivion\'s Measuring Eye', fx: { kind: 'critDmg', power: 90 }, fxDesc: 'ASCENSION · Critical hits deal +90% more damage.', lore: 'It measures exactly how much ending each thing needs, then provides it.' },
  { id: 'as_t5', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'Sigil of the Hundred Souls', fx: { kind: 'avenger', power: 45 }, fxDesc: 'ASCENSION · When an ally falls: +45% ATK for the rest of battle (stacks).', lore: 'One hundred champions signed it. Harm their heir and meet all of them.' },
  { id: 'as_t6', slot: 'talisman', tier: 'ascension', levelReq: 100, name: 'Pulse of the First Rift', fx: { kind: 'energyStart', power: 750 }, fxDesc: 'ASCENSION · Begin battle with +750 Energy.', lore: 'The Rift\'s first heartbeat, bottled. It is very eager to be spent.' },
  { id: 'as_tm', slot: 'talisman', tier: 'ascension', levelReq: 100, classReq: 'melee', name: '⟐ Duelist\'s Deathmark Pendant', fx: { kind: 'executeBonus', power: 75 }, fxDesc: 'MELEE EXCLUSIVE · +75% damage to enemies below 50% HP.', lore: 'It marks the exact heartbeat a duel ends. Wearers just arrive early.' },
  { id: 'as_tr', slot: 'talisman', tier: 'ascension', levelReq: 100, classReq: 'ranged', name: '⟐ Eye of the Stormhawk', fx: { kind: 'critAura', power: 12 }, fxDesc: 'RANGED EXCLUSIVE · HAWKEYE AURA: ALL allies gain +12% Critical chance.', lore: 'The Stormhawk sees every opening in the realm. Now your whole warband does.' },
  { id: 'as_tt', slot: 'talisman', tier: 'ascension', levelReq: 100, classReq: 'tank', name: '⟐ Heartstone of the Bulwark', fx: { kind: 'stasis' }, fxDesc: 'TANK EXCLUSIVE · STASIS: immune to Stun and Silence — the wall does not blink.', lore: 'Cut from the core of the Unmovable Mountain. Opinions bounce off it. So does everything else.' },
  { id: 'as_th', slot: 'talisman', tier: 'ascension', levelReq: 100, classReq: 'support', name: '⟐ Teardrop of Eternal Mercy', fx: { kind: 'healAmp', power: 35 }, fxDesc: 'HEALER EXCLUSIVE · ALL your healing is 35% stronger.', lore: 'The Dawnmother wept once for every fallen champion. This is the tear that refused to dry.' },
];
DATA.ITEM_BY_ID = {};
DATA.ITEMS.forEach(it => { DATA.ITEM_BY_ID[it.id] = it; });

/* ---------------- Tower of Trials ---------------- */
DATA.towerEnemyLevel = f => Math.max(1, Math.round(2 + f * 2.1));
DATA.towerScale = f =>
  Math.pow(DATA.STAT_GROWTH, DATA.towerEnemyLevel(f) - 1) * (1 + f * 0.012) * 0.5;
DATA.towerRewards = function (floor) {
  const big = floor % 5 === 0;
  return {
    diamonds: Math.round((big ? 200 : 60) * 1.75),
    gold: Math.round(300 * Math.pow(1.11, floor)),
    scrolls: big ? 1 : 0,
    dust: Math.round(6 * Math.pow(1.06, floor)),
  };
};

/* ---------------- Arena ---------------- */
DATA.ARENA_FREE_FIGHTS = 5;
DATA.arenaReward = win => win ? { diamonds: Math.round(60 * 1.75), gold: 800 } : { diamonds: Math.round(15 * 1.75), gold: 200 };
DATA.ARENA_NAMES = ['DuskReaver', 'xXShadowLordXx', 'PetalStorm', 'IronBarnacle', 'QuakeFan99', 'MoonlitSonata', 'GoldenRatio', 'VoidWalker', 'SirCritsALot', 'TheGardener', 'AbyssGazer', 'HammerTime', 'Nocturnelle', 'SunKing', 'BrambleJack'];

/* Arena rank tiers (by rating) */
DATA.ARENA_RANKS = [
  { id: 'bronze',   name: 'Bronze',   min: 0,    color: '#b08050', glyph: '🥉' },
  { id: 'silver',   name: 'Silver',   min: 1100, color: '#c0c8d8', glyph: '🥈' },
  { id: 'gold',     name: 'Gold',     min: 1250, color: '#f5c542', glyph: '🥇' },
  { id: 'platinum', name: 'Platinum', min: 1450, color: '#8fe8d8', glyph: '💠' },
  { id: 'diamond',  name: 'Diamond',  min: 1700, color: '#7cd5ff', glyph: '💎' },
  { id: 'mythic',   name: 'Mythic',   min: 2000, color: '#ff5e7e', glyph: '👑' },
];
DATA.arenaRank = rating => {
  let r = DATA.ARENA_RANKS[0];
  DATA.ARENA_RANKS.forEach(x => { if (rating >= x.min) r = x; });
  return r;
};

/* ============================================================
   GAME MODES — Boss Rush · Faction Trials · Endless Abyss ·
   Grand Tournament. All enemy scaling rides the shared
   exponential stat curve via a "stage equivalent".
   ============================================================ */

/* ---------------- Boss Rush ---------------- */
DATA.BOSSRUSH = {
  attemptsPerDay: 2,
  rounds: 5,
  stageEq: (maxStage, round) => Math.max(4, maxStage - 6 + round * 4),
  roundReward: (maxStage, round) => ({
    gold: Math.round(500 * Math.pow(1.09, Math.min(maxStage, DATA.MAX_STAGE)) * (1 + round * 0.4) / 40),
    dust: Math.round(14 + round * 8),
    diamonds: Math.round((40 + round * 25) * 1.75),
  }),
  finalChest: 'boss',   // clearing all rounds awards a Boss Chest
};

/* ---------------- Faction Trials ---------------- */
DATA.TRIALS = {
  tiers: 7,
  // rotating pair: the day's faction + the faction it defeats
  factionOfDay(dayKey) {
    const keys = Object.keys(DATA.FACTIONS);
    let h = 0;
    String(dayKey).split('').forEach(c => { h = (h * 31 + c.charCodeAt(0)) >>> 0; });
    return keys[h % keys.length];
  },
  partnerOf(fid) {
    const beats = { fire: 'nature', nature: 'rock', rock: 'electric', electric: 'water', water: 'fire',
      holy: 'dark', dark: 'cosmic', cosmic: 'aether', aether: 'wind', wind: 'holy' };
    return beats[fid];
  },
  stageEq: (maxStage, tier) => Math.max(3, Math.round(maxStage * 0.5) + tier * 6),
  tierReward: tier => ({
    dust: 30 + tier * 22,
    gold: 800 * tier,
    diamonds: Math.round((30 + tier * 20) * 1.75),
    scrolls: tier >= 5 ? 1 : 0,
    chest: tier === 7 ? 'mystic' : null,
  }),
};

/* ---------------- Endless Abyss ---------------- */
DATA.ABYSS = {
  stageEq: depth => Math.max(2, Math.round(depth * 2.4)),
  // corruption modifiers cycle with depth — shown in UI, applied in combat
  modifiers: [
    { id: 'ferocity',  name: 'Ferocity',  desc: 'Enemies deal +20% damage', glyph: '🩸', enemyAtk: 1.2 },
    { id: 'swiftness', name: 'Swiftness', desc: 'Enemies act 15% faster',   glyph: '💨', enemySpd: 1.15 },
    { id: 'bulwark',   name: 'Bulwark',   desc: 'Enemies have +25% HP',     glyph: '🛡️', enemyHp: 1.25 },
    { id: 'frenzy',    name: 'Frenzy',    desc: 'Enemies crit 10% more',    glyph: '⚡', enemyCrit: 10 },
  ],
  modifiersAt(depth) {
    const out = [];
    if (depth >= 3)  out.push(this.modifiers[(depth) % 4]);
    if (depth >= 8)  out.push(this.modifiers[(depth + 2) % 4]);
    if (depth >= 15) out.push(this.modifiers[(depth + 1) % 4]);
    // dedupe by id
    return out.filter((m, i) => out.findIndex(x => x.id === m.id) === i);
  },
  depthReward: depth => ({
    gold: Math.round(400 * Math.pow(1.09, Math.min(depth * 2, 160))),
    dust: Math.round(8 * Math.pow(1.05, depth)),
    diamonds: Math.round((depth % 5 === 0 ? 150 : 40) * 1.75),
    chest: depth % 5 === 0 ? (depth % 10 === 0 ? 'golden' : 'iron') : null,
  }),
  envAt: depth => ['void', 'shadowkeep', 'bloodmoon', 'celestial'][Math.floor((depth - 1) / 5) % 4],
};

/* ---------------- Grand Tournament ---------------- */
DATA.TOURNAMENT = {
  entriesPerDay: 1,
  rounds: [
    { id: 0, name: 'QUARTERFINAL', mult: 0.95, reward: { gold: 1200, diamonds: Math.round(60 * 1.75) } },
    { id: 1, name: 'SEMIFINAL',    mult: 1.12, reward: { gold: 2400, diamonds: Math.round(100 * 1.75) } },
    { id: 2, name: 'GRAND FINAL',  mult: 1.30, reward: { gold: 5000, diamonds: Math.round(220 * 1.75), scrolls: 2, chest: 'golden' } },
  ],
  badge: 'GLADIATOR',   // earned on first tournament victory
  titles: ['Contender', 'Challenger', 'Finalist', 'GRAND CHAMPION'],
};

/* ============================================================
   THE MAP OF AGDAO — the realm itself. Five great regions plus
   the Rift of Leodones. Each region hosts themed DUNGEONS the
   player can raid when the campaign wall gets too tall:
   pick WHERE you fight, farm WHAT you're missing.
   Dungeon enemies scale at ~80% of your wall stage, so a stuck
   player can always win here, catch up, then break the wall.
   ============================================================ */
DATA.AGDAO = {
  name: 'Agdao',
  regions: [
    { id: 'newsalmon', name: 'New Salmon', glyph: '🌊', color: '#38b6ff', unlockStage: 1,
      title: 'Kingdom of the Western Tides',
      desc: 'Fisher-lords, pearl divers and the great Salmonrun. Half the realm\'s songs and all of its best storms come ashore here.' },
    { id: 'jeehva', name: 'Jeehva', glyph: '🌿', color: '#52c97a', unlockStage: 8,
      title: 'The Verdant Deep',
      desc: 'A jungle old enough to remember being a seed. The Elderroot\'s children grow tall here — and hungry.' },
    { id: 'palandine', name: 'Palandine', glyph: '🔥', color: '#ff6b35', unlockStage: 18,
      title: 'The Ember Canyons',
      desc: 'Forge-cities hang over rivers of magma. Palandine smiths sign their work by leaving it slightly on fire.' },
    { id: 'aespo', name: 'Great Aespo', glyph: '⚡', color: '#ffe86a', unlockStage: 30,
      title: 'The Storm Highlands',
      desc: 'Peaks that harvest lightning like wheat. The sky here is not weather — it is architecture.' },
    { id: 'astorvia', name: 'Astorvia', glyph: '☀️', color: '#f5c542', unlockStage: 44,
      title: 'The Dawnlit Plains',
      desc: 'Golden fields around the Dawnspire, where every sunrise is a public holiday and every oath is kept.' },
    { id: 'rift', name: 'Rift of Leodones', glyph: '🌀', color: '#7cf5ff', unlockStage: 60, rift: true,
      title: 'The Wound in the World',
      desc: 'Where the Creator\'s pen slipped. Reality frays, AETHER bleeds through, and the bravest raiders come home glowing.' },
  ],
};
DATA.AGDAO_REGION_BY_ID = {};
DATA.AGDAO.regions.forEach(r => { DATA.AGDAO_REGION_BY_ID[r.id] = r; });

DATA.DUNGEONS = {
  attemptsPerDay: 3,     // per dungeon per day — generous on purpose: this is the anti-stuck valve
  // ~80% of your current wall + per-dungeon offset: always winnable, always worth it
  stageEq(maxStage, dg) { return Math.max(2, Math.round(Math.min(maxStage, DATA.MAX_STAGE) * 0.8) + (dg.offset || 0)); },
  list: [
    /* --- New Salmon --- */
    { id: 'grotto',    region: 'newsalmon', name: 'Drowned Grotto', glyph: '🐚', env: 'abyss', family: 'tidewrought', offset: 0, focus: 'gold',
      desc: 'Pearl hoards of the sunken fisher-kings. The current owners have gills and objections.' },
    { id: 'shipgraves', region: 'newsalmon', name: 'Salmonrun Shipgraves', glyph: '⚓', env: 'abyss', family: 'tidewrought', offset: 4, focus: 'gear',
      desc: 'A century of proud fleets, one reef. Their armories survived better than their crews.' },
    /* --- Jeehva --- */
    { id: 'roothollow', region: 'jeehva', name: 'Weeping Root Hollow', glyph: '🌱', env: 'jungle', family: 'bloomspawn', offset: 0, focus: 'xp',
      desc: 'Beneath the Elderroot, sap runs like liquid experience. Drink deep; duck often.' },
    { id: 'sporewild',  region: 'jeehva', name: 'Sporewild Thicket', glyph: '🍄', env: 'faewild', family: 'bloomspawn', offset: 4, focus: 'dust',
      desc: 'Everything here sparkles, spreads, or screams. The dust is worth all three.' },
    /* --- Palandine --- */
    { id: 'cinderforge', region: 'palandine', name: 'Cinderforge Depths', glyph: '⚒️', env: 'volcano', family: 'cindermaw', offset: 0, focus: 'gold',
      desc: 'The first forge of Palandine still pays wages in molten gold. Collection is the hard part.' },
    { id: 'colosseum',  region: 'palandine', name: 'Ashen Colosseum', glyph: '🏛️', env: 'foundry', family: 'clockwork', offset: 4, focus: 'gear',
      desc: 'The crowd is cinders and the trophies are real. Winners keep the arsenal.' },
    /* --- Great Aespo --- */
    { id: 'stormcrown', region: 'aespo', name: 'Stormcrown Peaks', glyph: '🌩️', env: 'stormspire', family: 'stormspire', offset: 0, focus: 'dust',
      desc: 'Lightning grinds the peaks to glittering dust. Bring a jar and a death wish.' },
    { id: 'skyvault',   region: 'aespo', name: 'Skyvault of Aespo', glyph: '🗝️', env: 'stormspire', family: 'clockwork', offset: 4, focus: 'xp',
      desc: 'The storm-lords archived their wisdom above the clouds, guarded by clockwork librarians.' },
    /* --- Astorvia --- */
    { id: 'reliquary',  region: 'astorvia', name: 'Sunken Reliquary', glyph: '📿', env: 'sanctum', family: 'hollowed', offset: 0, focus: 'scrolls',
      desc: 'Astorvia buried its saints with their summoning scrolls. The saints kept busy.' },
    { id: 'catacombs',  region: 'astorvia', name: 'Dawnwatch Catacombs', glyph: '🕯️', env: 'crypt', family: 'hollowed', offset: 4, focus: 'gear',
      desc: 'The honored dead still stand their watch — in full parade armor you may requisition.' },
    /* --- The Rift (endgame) --- */
    { id: 'riftcore',   region: 'rift', name: 'The Rift of Leodones', glyph: '🌀', env: 'void', family: 'starfallen', offset: 8, focus: 'item',
      desc: 'Raid the wound in the world. Named relics bleed through — Epic, Legendary, and if the Rift blinks… AETHER.' },
  ],
  FOCUS_INFO: {
    gold:    { glyph: '💰', label: 'Gold Hoard',   blurb: '4× gold payout' },
    xp:      { glyph: '📗', label: 'XP Trove',     blurb: '4× XP payout' },
    dust:    { glyph: '✨', label: 'Dust Lode',    blurb: 'Huge Gear Dust haul' },
    gear:    { glyph: '⚔️', label: 'Armory',       blurb: 'Guaranteed Epic+ gear' },
    scrolls: { glyph: '📜', label: 'Scroll Cache', blurb: 'Guaranteed Summon Scroll' },
    item:    { glyph: '🌀', label: 'RELIC RAID',   blurb: 'Named relic every clear — AETHER chance' },
  },
  reward(dg, maxStage) {
    const se = this.stageEq(maxStage, dg);
    const base = DATA.stageClearRewards(se);
    const rw = { gold: Math.round(base.gold * 0.8), xp: Math.round(base.xp * 0.8), diamonds: Math.round(20 * 1.75) };
    switch (dg.focus) {
      case 'xp':      rw.xp = Math.round(base.xp * 4); break;
      case 'gold':    rw.gold = Math.round(base.gold * 4); break;
      case 'dust':    rw.dust = Math.round(30 + se * 2.2); break;
      case 'gear':    rw.gearRarities = ['epic', 'epic', 'mythic']; break;
      case 'scrolls': rw.scrolls = 1; break;
      case 'item':    rw.itemRoll = true; rw.dust = Math.round(20 + se * 1.2); break;
    }
    return rw;
  },
  /* Rift relic odds per clear (Conquest Tier 0 baseline — see DATA.CONQUEST.itemRoll) */
  ITEM_ROLL: [ { tier: 'epic', w: 44 }, { tier: 'mystic', w: 24 }, { tier: 'ultimate', w: 14 }, { tier: 'legendary', w: 12 }, { tier: 'aether', w: 6 } ],
};
DATA.DUNGEON_BY_ID = {};
DATA.DUNGEONS.list.forEach(dg => { DATA.DUNGEON_BY_ID[dg.id] = dg; });

/* ============================================================
   WARLORD CONQUEST — the raid-reset engine.
   Burn all of a dungeon's daily raids and its AREA WARLORD
   emerges. Slay the Warlord: that dungeon's raids RESET on the
   spot and its Conquest Tier rises permanently (max 5).
   Higher tiers = stronger forces, richer payouts, and named
   relics dropping from ANY dungeon — rarer tiers the deeper
   the conquest. Warlord retries are FREE, like all raids.
   ============================================================ */
DATA.CONQUEST = {
  maxTier: 5,
  // Warlord fights punch ABOVE your campaign wall — this is the boss of the area
  warlordStageEq(maxStage, dg, tier) {
    return Math.max(4, Math.round(Math.min(maxStage, DATA.MAX_STAGE) * (0.95 + tier * 0.06)) + (dg.offset || 0) + 4);
  },
  warlordMult: tier => 1.75 + tier * 0.2,
  raidStageBonus: tier => tier * 3,            // dungeon enemies climb per tier
  lootMult: tier => 1 + tier * 0.25,           // gold/xp/dust payout per tier
  // chance for a named relic on ANY dungeon clear (the Rift always rolls)
  itemChance: tier => [0, 0.10, 0.16, 0.22, 0.30, 0.40][Math.min(tier, 5)],
  // relic tier odds sharpen with conquest — "much rarer items"
  itemRoll(tier) {
    return [
      { tier: 'epic',      w: Math.max(8, 44 - tier * 7) },
      { tier: 'mystic',    w: 24 },
      { tier: 'ultimate',  w: 14 + tier * 3 },
      { tier: 'legendary', w: 12 + tier * 3 },
      { tier: 'aether',    w: 6 + tier * 2 },
    ];
  },
  // Warlord kill loot (on top of the Warlord Chest + relic)
  warlordReward(stageEq, tier) {
    const base = DATA.stageClearRewards(Math.min(stageEq, DATA.MAX_STAGE));
    return {
      gold: Math.round(base.gold * 2),
      xp: Math.round(base.xp * 2),
      dust: Math.round(40 + stageEq * 1.6),
      diamonds: Math.round((150 + tier * 50) * 1.75),
    };
  },
  // one-time trophy the first time each dungeon reaches each tier
  trophy: tier => ({ diamonds: Math.round((120 + tier * 80) * 1.75), scrolls: tier >= 3 ? 2 : 1, dust: 60 + tier * 40 }),
};

/* ============================================================
   DEPTHS OF AGDAO — Expeditions: the dungeon-crawler layer.
   Every region hides an endless DELVE beneath its dungeons.
   Each floor is a winding path of CHECKPOINTS — skirmishes,
   elites, treasure, mysteries — with forks where the raider
   chooses the way, capped by a FLOOR BOSS. Deeper floors hit
   harder and are the ONLY source of ASCENSION gear (Lv 100).
   ============================================================ */
DATA.EXPEDITION = {
  steps: 7,                        // checkpoints per floor — the last is the FLOOR BOSS
  // enemy scaling: starts under your wall, then climbs +3 stages per floor —
  // an endless difficulty ramp on the shared curve, like the Tower/Abyss
  stageEq(maxStage, floor) {
    return Math.max(2, Math.round(Math.min(maxStage, DATA.MAX_STAGE) * 0.75) + (floor - 1) * 3);
  },
  NODE_INFO: {
    battle:   { glyph: '⚔️', name: 'Skirmish',       desc: 'A war-party holds this checkpoint. Cut through.' },
    elite:    { glyph: '💀', name: 'Elite Pack',      desc: 'Veterans of the deep — harder fight, richer spoils, relic chance.' },
    treasure: { glyph: '💰', name: 'Treasure Trove',  desc: 'An unguarded hoard. Loot it and move on.' },
    cache:    { glyph: '🎁', name: 'Radiant Cache',   desc: 'A sealed strongbox humming with power. Gear inside — sometimes far more.' },
    mystery:  { glyph: '❓', name: 'The Unknown',     desc: 'Something stirs in the dark… fortune, or ambush.' },
    boss:     { glyph: '👑', name: 'FLOOR BOSS',      desc: 'The master of this floor. Slay it to delve deeper.' },
  },
  // node type weights for layout generation (boss excluded — always last)
  TYPE_WEIGHTS: [
    { type: 'battle',   w: 38 },
    { type: 'treasure', w: 18 },
    { type: 'mystery',  w: 16 },
    { type: 'elite',    w: 18 },
    { type: 'cache',    w: 10 },
  ],
  forkChance: 0.55,               // chance a step splits into a chosen-path fork
  /* ASCENSION drop odds — the whole reason to go deep */
  bossAscensionChance(floor, rift) { return Math.min(0.40, (0.05 + (floor - 1) * 0.025) * (rift ? 1.5 : 1)); },
  cacheAscensionChance(floor) { return floor >= 4 ? Math.min(0.15, 0.02 + (floor - 4) * 0.012) : 0; },
  eliteRelicChance: 0.20,          // named relic (non-Ascension) on elite kills
  /* rewards ride the shared curve via stage-equivalent */
  nodeReward(stageEq, type, floor) {
    const base = DATA.stageClearRewards(stageEq);
    switch (type) {
      case 'battle':   return { gold: Math.round(base.gold * 0.6), xp: Math.round(base.xp * 0.6), dust: Math.round(8 + stageEq * 0.5) };
      case 'elite':    return { gold: Math.round(base.gold * 1.1), xp: Math.round(base.xp * 1.1), dust: Math.round(16 + stageEq * 0.9), diamonds: Math.round(25 * 1.75) };
      case 'treasure': return { gold: Math.round(base.gold * 1.6), xp: Math.round(base.xp * 0.5), dust: Math.round(20 + stageEq * 1.1) };
      case 'cache':    return { dust: Math.round(30 + stageEq * 0.8), gold: Math.round(base.gold * 0.5) };
      case 'boss':     return { gold: Math.round(base.gold * 2.4), xp: Math.round(base.xp * 2.4), dust: Math.round(35 + stageEq * 1.4), diamonds: Math.round((90 + floor * 15) * 1.75) };
      default:         return { gold: Math.round(base.gold * 0.5) };
    }
  },
  /* mystery outcomes — one is rolled when the node is entered */
  MYSTERY_OUTCOMES: [
    { id: 'gold',     w: 26, glyph: '💰', text: 'A collapsed vault spills its savings at your feet!' },
    { id: 'dust',     w: 24, glyph: '✨', text: 'A vein of raw gear dust glitters in the wall!' },
    { id: 'diamonds', w: 16, glyph: '💎', text: 'A pouch of diamonds, dropped by a less lucky raider!' },
    { id: 'scroll',   w: 10, glyph: '📜', text: 'A summoning scroll, still sealed, still potent!' },
    { id: 'ambush',   w: 24, glyph: '💀', text: 'AMBUSH! An elite pack erupts from the shadows!' },
  ],
};

/* ---------------- Rift Surge — daily rotating raid events ----------------
   Two dungeons SURGE each day: +1 raid attempt and DOUBLE payout. */
DATA.SURGE = {
  count: 2, extraAttempts: 1, lootMult: 2,
  dungeonsOfDay(dayKey) {
    let h = 0;
    String(dayKey).split('').forEach(c => { h = (h * 131 + c.charCodeAt(0)) >>> 0; });
    const list = DATA.DUNGEONS.list;
    const a = h % list.length;
    const b = (a + 1 + ((h >>> 3) % (list.length - 1))) % list.length;
    return [list[a].id, list[b].id];
  },
};

/* ---------------- Golden Loot Wisp ----------------
   A rare glowing freeloader sneaks into dungeon waves. Win the
   raid while it's on the field and it bursts into bonus treasure. */
DATA.WISP = {
  chance: 0.12,          // per raid
  itemChance: 0.25,      // wisp bonus can carry a named relic
  reward(maxStage) {
    const se = Math.round(Math.min(maxStage, DATA.MAX_STAGE) * 0.8);
    const base = DATA.stageClearRewards(Math.max(1, se));
    return { gold: Math.round(base.gold * 1.5), dust: Math.round(30 + se * 1.2), diamonds: Math.round(120 * 1.75) };
  },
};
DATA.WISP_UNIT = {
  id: 'golden_wisp', name: 'Golden Loot Wisp', role: 'support',
  base: { hp: 700, atk: 20, def: 10, spd: 130 }, crit: 0,
  model: { body: 'slim', bulk: 0.7, height: 0.75, weapon: 'orb', headgear: 'halo',
    palette: { primary: '#f5c542', secondary: '#ffd94d', accent: '#fff6d8', skin: '#ffe9a0' } },
  skill: { name: 'Glitter Scatter', cd: 9, spec: { type: 'heal', target: 'lowestAlly', mult: 0.5 } },
};

/* ---------------- Realm Happenings — daily global events ---------------- */
DATA.REALM_EVENTS = [
  { id: 'goldrush',  name: 'Gold Rush',      glyph: '💰', desc: '+50% Gold from campaign stages and dungeon raids today', gold: 1.5 },
  { id: 'scholars',  name: "Scholars' Day",  glyph: '📗', desc: '+50% XP from campaign stages and dungeon raids today', xp: 1.5 },
  { id: 'stormfront',name: 'Stormfront',     glyph: '🌩️', desc: '+1 raid attempt on EVERY dungeon today', extraRaids: 1 },
  { id: 'relicfever',name: 'Relic Fever',    glyph: '🌀', desc: 'Named-relic drop chances DOUBLED in dungeon raids today', relicLuck: 2 },
  { id: 'dustdevils',name: 'Dust Devils',    glyph: '✨', desc: '+75% Gear Dust from dungeon raids today', dust: 1.75 },
  { id: 'bountyboom',name: 'Bounty Boom',    glyph: '🎯', desc: 'Bounty Hunt rewards +50% today', bounty: 1.5 },
];
DATA.eventOfDay = function (dayKey) {
  let h = 0;
  String(dayKey).split('').forEach(c => { h = (h * 33 + c.charCodeAt(0)) >>> 0; });
  return DATA.REALM_EVENTS[h % DATA.REALM_EVENTS.length];
};

/* ---------------- Bounty Hunts — daily marks on conquered ground ----------
   Three stages you've already beaten go rogue each day. Put them
   back down for doubled spoils, guaranteed gear and a relic shot. */
DATA.BOUNTY = {
  perDay: 3,
  itemChance: 0.15,
  gearRarities: ['rare', 'epic', 'mythic'],
  reward(stage, evtMult) {
    const base = DATA.stageClearRewards(stage);
    const m = 2 * (evtMult || 1);
    return {
      gold: Math.round(base.gold * m),
      xp: Math.round(base.xp * m),
      dust: Math.round(20 + stage * 1.2),
      diamonds: Math.round(80 * 1.75),
    };
  },
};

/* ---------------- Relic Fusion — 3 relics forge 1 of the next tier ------- */
DATA.FUSION = {
  need: 3,
  goldCost: tier => ({ epic: 20000, mystic: 60000, ultimate: 150000, legendary: 400000 }[tier] || 20000),
};

/* ---------------- Battlefield Salvage — bonus drops on normal clears -----
   Every NON-boss campaign clear has a 30% chance (45% on elite
   stages) to shake loose a bonus Common–Rare drop. */
DATA.BONUS_DROP = {
  chance: 0.30,
  eliteChance: 0.45,
  rarities: ['common', 'common', 'fine', 'fine', 'rare'],
};

/* ============================================================
   CHESTS — 5 core kinds + Special Chests + Boss Chest.
   Opened with an animated reveal; loot rides the shared curve
   via idle-rate math so rewards stay relevant at any stage.
   ============================================================ */
DATA.CHESTS = [
  {
    id: 'wooden', name: 'Wooden Chest', glyph: '🪤', tier: 'core', costD: 90, color: '#b08050',
    desc: 'Traveler\'s cache. Gold, XP and a pinch of dust.',
    rolls: 2,
    table: [
      { kind: 'gold', idleMin: 45, w: 34 },
      { kind: 'xp', idleMin: 45, w: 30 },
      { kind: 'dust', amt: [20, 45], w: 26 },
      { kind: 'gear', rarities: ['common', 'fine'], w: 10 },
    ],
  },
  {
    id: 'iron', name: 'Iron Chest', glyph: '🛢️', tier: 'core', costD: 240, color: '#c0c8d8',
    desc: 'Soldier\'s strongbox. Solid odds of Rare gear.',
    rolls: 3,
    table: [
      { kind: 'gold', idleMin: 70, w: 26 },
      { kind: 'xp', idleMin: 70, w: 22 },
      { kind: 'dust', amt: [40, 90], w: 24 },
      { kind: 'gear', rarities: ['fine', 'rare'], w: 22 },
      { kind: 'scrolls', amt: [1, 1], w: 6 },
    ],
  },
  {
    id: 'golden', name: 'Golden Chest', glyph: '🏆', tier: 'core', costD: 560, color: '#f5c542',
    desc: 'Noble\'s vault. Guaranteed Rare+ gear inside.',
    rolls: 3, guaranteed: { kind: 'gear', rarities: ['rare', 'epic'] },
    table: [
      { kind: 'gold', idleMin: 120, w: 26 },
      { kind: 'dust', amt: [80, 160], w: 24 },
      { kind: 'scrolls', amt: [1, 2], w: 20 },
      { kind: 'gear', rarities: ['rare', 'epic'], w: 20 },
      { kind: 'diamonds', amt: [350, 875], w: 10 },
    ],
  },
  {
    id: 'mystic', name: 'Mystic Chest', glyph: '🔮', tier: 'core', costD: 1200, color: '#00e5ff',
    desc: 'Sealed by the Accord. Epic gear and a guaranteed scroll.',
    rolls: 4, guaranteed: { kind: 'scrolls', amt: [1, 1] },
    table: [
      { kind: 'gear', rarities: ['epic', 'epic', 'mythic'], w: 30 },
      { kind: 'dust', amt: [140, 260], w: 22 },
      { kind: 'gold', idleMin: 180, w: 18 },
      { kind: 'scrolls', amt: [1, 2], w: 16 },
      { kind: 'champcopy', rarities: ['rare', 'elite'], w: 10 },
      { kind: 'diamonds', amt: [525, 1400], w: 4 },
    ],
  },
  {
    id: 'celestial', name: 'Celestial Chest', glyph: '🌠', tier: 'core', costD: 2700, color: '#ff9de0',
    desc: 'A star, gift-wrapped. Mythic gear or better — always.',
    rolls: 5, guaranteed: { kind: 'gear', rarities: ['mythic'] },
    table: [
      { kind: 'gear', rarities: ['epic', 'mythic'], w: 24 },
      { kind: 'scrolls', amt: [2, 4], w: 22 },
      { kind: 'dust', amt: [260, 480], w: 18 },
      { kind: 'champcopy', rarities: ['elite', 'epic'], w: 16 },
      { kind: 'diamonds', amt: [1400, 3850], w: 12 },
      { kind: 'gear', exclusive: true, w: 8 },
    ],
  },
  {
    id: 'faction', name: 'Faction Chest', glyph: '🎴', tier: 'special', costD: 750, color: '#b45cff',
    desc: 'SPECIAL — a guaranteed Champion copy from a random faction, plus faction spoils.',
    rolls: 2, guaranteed: { kind: 'champcopy', rarities: ['uncommon', 'rare', 'elite', 'epic'] },
    table: [
      { kind: 'dust', amt: [90, 170], w: 40 },
      { kind: 'gold', idleMin: 100, w: 30 },
      { kind: 'gear', rarities: ['rare', 'epic'], w: 30 },
    ],
  },
  {
    id: 'creators', name: "Creator's Chest", glyph: '👑', tier: 'special', costD: 3000, color: '#ffd94d',
    desc: "SPECIAL — Aljay's private reserve. High-roller odds on everything, including Exclusive gear.",
    rolls: 4, guaranteed: { kind: 'scrolls', amt: [2, 2] },
    table: [
      { kind: 'diamonds', amt: [875, 3150], w: 24 },
      { kind: 'gear', rarities: ['mythic'], w: 22 },
      { kind: 'gear', exclusive: true, w: 12 },
      { kind: 'champcopy', rarities: ['elite', 'epic', 'mystic'], w: 18 },
      { kind: 'dust', amt: [220, 420], w: 14 },
      { kind: 'scrolls', amt: [2, 3], w: 10 },
    ],
  },
  {
    id: 'boss', name: 'Boss Chest', glyph: '💀', tier: 'boss', costD: 1050, color: '#ff5e7e',
    desc: 'BOSS LOOT — earned by clearing Boss Rush. Trophy gear of the fallen tyrants.',
    rolls: 4, guaranteed: { kind: 'gear', rarities: ['epic', 'mythic'] },
    table: [
      { kind: 'dust', amt: [180, 320], w: 26 },
      { kind: 'gold', idleMin: 150, w: 20 },
      { kind: 'gear', rarities: ['epic', 'mythic'], w: 22 },
      { kind: 'gear', exclusive: true, w: 10 },
      { kind: 'scrolls', amt: [1, 3], w: 14 },
      { kind: 'diamonds', amt: [525, 1575], w: 8 },
    ],
  },
  {
    id: 'warlord', name: 'Warlord Chest', glyph: '⚔️', tier: 'boss', costD: 1600, color: '#ff9100',
    desc: 'CONQUEST LOOT — torn from a fallen Area Warlord. Guaranteed Mystic+ named relic inside.',
    rolls: 4, guaranteed: { kind: 'item', tiers: ['mystic', 'mystic', 'ultimate'] },
    table: [
      { kind: 'item', tiers: ['epic', 'mystic'], w: 20 },
      { kind: 'item', tiers: ['ultimate'], w: 10 },
      { kind: 'item', tiers: ['legendary'], w: 6 },
      { kind: 'dust', amt: [200, 380], w: 22 },
      { kind: 'gold', idleMin: 160, w: 14 },
      { kind: 'gear', rarities: ['epic', 'mythic'], w: 18 },
      { kind: 'diamonds', amt: [700, 1750], w: 10 },
    ],
  },

  /* ---- CHESTS OF AGDAO — 5 themed chests, 2500→7500 💎.
     The only Store source of NAMED relics (Epic/Legendary/AETHER). ---- */
  {
    id: 'jeehva_reliquary', name: 'Verdant Reliquary', glyph: '🌿', tier: 'themed', costD: 2500, color: '#52c97a',
    region: 'Jeehva',
    desc: 'JEEHVA — grown, not built. A guaranteed Epic named relic, wrapped in living wood.',
    rolls: 3, guaranteed: { kind: 'item', tiers: ['epic'] },
    table: [
      { kind: 'dust', amt: [140, 260], w: 26 },
      { kind: 'gold', idleMin: 140, w: 22 },
      { kind: 'xp', idleMin: 140, w: 20 },
      { kind: 'gear', rarities: ['epic', 'mythic'], w: 20 },
      { kind: 'item', tiers: ['epic'], w: 12 },
    ],
  },
  {
    id: 'salmon_trove', name: "Tidecaller's Trove", glyph: '🐚', tier: 'themed', costD: 3750, color: '#38b6ff',
    region: 'New Salmon',
    desc: 'NEW SALMON — hauled from the Salmonrun deeps. Named relic guaranteed; the tide sometimes brings Legendary.',
    rolls: 3, guaranteed: { kind: 'item', tiers: ['epic', 'mystic', 'legendary'] },
    table: [
      { kind: 'dust', amt: [180, 320], w: 24 },
      { kind: 'scrolls', amt: [1, 2], w: 20 },
      { kind: 'gear', rarities: ['epic', 'mythic'], w: 20 },
      { kind: 'item', tiers: ['epic', 'mystic', 'legendary'], w: 18 },
      { kind: 'diamonds', amt: [700, 1750], w: 18 },
    ],
  },
  {
    id: 'aespo_vault', name: 'Stormforged Vault', glyph: '⚡', tier: 'themed', costD: 5000, color: '#ffe86a',
    region: 'Great Aespo',
    desc: 'GREAT AESPO — sealed by lightning, opened by the worthy. Even odds of a Legendary relic inside.',
    rolls: 4, guaranteed: { kind: 'item', tiers: ['mystic', 'ultimate', 'legendary'] },
    table: [
      { kind: 'item', tiers: ['mystic', 'ultimate', 'legendary'], w: 24 },
      { kind: 'dust', amt: [240, 420], w: 20 },
      { kind: 'scrolls', amt: [2, 3], w: 18 },
      { kind: 'gear', rarities: ['mythic'], w: 18 },
      { kind: 'diamonds', amt: [875, 2450], w: 14 },
      { kind: 'champcopy', rarities: ['elite', 'epic'], w: 6 },
    ],
  },
  {
    id: 'astorvia_ark', name: 'Sunfire Ark', glyph: '☀️', tier: 'themed', costD: 6250, color: '#f5c542',
    region: 'Astorvia',
    desc: 'ASTORVIA — the Dawnspire\'s war-tithe. A GUARANTEED Legendary named relic, blessed at first light.',
    rolls: 4, guaranteed: { kind: 'item', tiers: ['legendary'] },
    table: [
      { kind: 'item', tiers: ['ultimate', 'legendary'], w: 26 },
      { kind: 'scrolls', amt: [2, 4], w: 20 },
      { kind: 'champcopy', rarities: ['elite', 'epic', 'mystic'], w: 16 },
      { kind: 'dust', amt: [300, 520], w: 16 },
      { kind: 'diamonds', amt: [1050, 2800], w: 14 },
      { kind: 'item', tiers: ['aether'], w: 8 },
    ],
  },
  {
    id: 'rift_casket', name: 'Riftborne Casket', glyph: '🌀', tier: 'themed', costD: 7500, color: '#7cf5ff',
    region: 'Rift of Leodones',
    desc: 'THE RIFT — it pulses. It glows. Best AETHER odds in the realm, and every relic inside is named.',
    rolls: 4, guaranteed: { kind: 'item', tiers: ['legendary', 'legendary', 'aether'] },
    table: [
      { kind: 'item', tiers: ['legendary'], w: 26 },
      { kind: 'item', tiers: ['aether'], w: 14 },
      { kind: 'item', tiers: ['ultimate', 'legendary'], w: 16 },
      { kind: 'diamonds', amt: [1400, 3500], w: 16 },
      { kind: 'scrolls', amt: [2, 4], w: 16 },
      { kind: 'dust', amt: [360, 620], w: 12 },
    ],
  },
];
DATA.CHEST_BY_ID = {};
DATA.CHESTS.forEach(c => { DATA.CHEST_BY_ID[c.id] = c; });

/* ---------------- Daily Quests (100-point system) ---------------- */
DATA.DAILY_QUESTS = [
  { id: 'login',        name: 'Report for Duty', desc: 'Log in to AZ Champions', points: 10, goal: 1 },
  { id: 'collectIdle',  name: 'Spoils of Patience', desc: 'Collect idle rewards 2 times', points: 20, goal: 2 },
  { id: 'campaign3',    name: 'Push the Front', desc: 'Fight 3 campaign battles', points: 20, goal: 3 },
  { id: 'summon1',      name: 'Call for Aid', desc: 'Summon 1 Champion', points: 20, goal: 1 },
  { id: 'enhance1',     name: 'Whetstone Ritual', desc: 'Enhance any gear 1 time', points: 10, goal: 1 },
  { id: 'level3',       name: 'Drill Instructor', desc: 'Level up Champions 3 times', points: 10, goal: 3 },
  { id: 'arena1',       name: 'Prove Your Worth', desc: 'Fight in the Arena', points: 20, goal: 1 },
  { id: 'tower1',       name: 'One More Floor', desc: 'Attempt the Tower of Trials', points: 20, goal: 1 },
  { id: 'mode1',        name: 'Beyond the Campaign', desc: 'Fight in a Dungeon, Boss Rush, Trials, Abyss or the Tournament', points: 20, goal: 1 },
  { id: 'chest1',       name: 'Treasure Hunter', desc: 'Open any chest from the Store', points: 10, goal: 1 },
];
DATA.QUEST_CHESTS = [
  { at: 20,  reward: { gold: 1500, xp: Math.round(800 * 1.75) } },
  { at: 40,  reward: { diamonds: Math.round(50 * 1.75) } },
  { at: 60,  reward: { dust: 40, gold: 2500 } },
  { at: 80,  reward: { diamonds: Math.round(100 * 1.75) } },
  { at: 100, reward: { scrolls: 1, diamonds: Math.round(100 * 1.75) } },
];

/* ---------------- Store ---------------- */
DATA.STORE = {
  paypalEmail: 'lemonquake@gmail.com',
  paypalCurrency: 'USD',
  diamondPacks: [
    { id: 'dp1', name: 'Handful of Diamonds',  diamonds: 1000,  bonus: 0,     price: 0.99,  glyph: '💎' },
    { id: 'dp2', name: 'Pouch of Diamonds',    diamonds: 5200,  bonus: 400,   price: 4.99,  glyph: '👝' },
    { id: 'dp3', name: 'Chest of Diamonds',    diamonds: 10800, bonus: 1200,  price: 9.99,  glyph: '🧰', tag: 'MOST POPULAR' },
    { id: 'dp4', name: 'Crate of Diamonds',    diamonds: 23000, bonus: 3000,  price: 19.99, glyph: '📦' },
    { id: 'dp5', name: 'Vault of Diamonds',    diamonds: 60000, bonus: 10000, price: 49.99, glyph: '🏦' },
    { id: 'dp6', name: 'Dragon\'s Hoard',      diamonds: 130000, bonus: 30000, price: 99.99, glyph: '🐲', tag: 'BEST VALUE' },
  ],
  championPacks: [
    { id: 'buy_ivcan', champ: 'ivcan', name: 'Ivcan — The Voidforged', price: 9.99,
      includes: 'Champion Ivcan + 1000 Diamonds + Voidforged emblem' , bonusDiamonds: 1000 },
    { id: 'buy_lemonquake', champ: 'lemonquake', name: 'Lemon Quake — The Seismic Sovereign', price: 14.99,
      includes: 'Champion Lemon Quake + 2000 Diamonds + Seismic emblem', bonusDiamonds: 2000 },
    { id: 'buy_aljay', champ: 'aljay', name: 'Aljay — The Legendary Creator', price: 99.99,
      includes: 'Champion Aljay + 20000 Diamonds + Creator emblem', bonusDiamonds: 20000 },
  ],
  gearPacks: [
    { id: 'gx_void', gear: 'voidforged_edge', name: 'Voidforged Edge (Weapon)', price: 4.99 },
    { id: 'gx_crown', gear: 'seismic_crown', name: 'The Seismic Crown (Talisman)', price: 7.99 },
    { id: 'gx_dawn', gear: 'dawnplate', name: 'Dawnplate of the First Light (Armor)', price: 4.99 },
    { id: 'gx_tide', gear: 'tidewalkers', name: 'Leviathan Tidewalkers (Boots)', price: 4.99 },
  ],
  specials: [
    { id: 'founder', name: 'Beta Founder\'s Pack', price: 4.99, glyph: '🏅',
      includes: '4,000 Diamonds + 5 Summon Scrolls + permanent FOUNDER badge', diamonds: 4000, scrolls: 5, badge: 'FOUNDER' },
  ],
  // diamond-priced in-game items — the Market. Bulk sizes always SAVE.
  diamondShop: [
    { id: 'ds_scroll',   name: 'Summon Scroll',          costD: 280,  gives: { scrolls: 1 },   glyph: '📜' },
    { id: 'ds_scroll5',  name: '5× Summon Scrolls',      costD: 1330, gives: { scrolls: 5 },   glyph: '📜', tag: 'SAVE 5%' },
    { id: 'ds_scroll10', name: '10× Summon Scrolls',     costD: 2520, gives: { scrolls: 10 },  glyph: '🗞️', tag: 'SAVE 10%' },
    { id: 'ds_scroll25', name: '25× Summon Scrolls',     costD: 5600, gives: { scrolls: 25 },  glyph: '📦', tag: 'SAVE 20%' },
    { id: 'ds_gold',     name: 'Gold Cache (1h)',        costD: 150,  gives: { goldByStage: 60 },  glyph: '💰' }, // 60 min of idle gold
    { id: 'ds_gold3',    name: 'Gold Hoard (3h)',        costD: 400,  gives: { goldByStage: 180 }, glyph: '🪙', tag: 'SAVE 11%' },
    { id: 'ds_gold10',   name: 'Gold Vault (10h)',       costD: 1200, gives: { goldByStage: 600 }, glyph: '🏦', tag: 'SAVE 20%' },
    { id: 'ds_xp',       name: 'XP Cache (1h)',          costD: 150,  gives: { xpByStage: 60 },    glyph: '📗' },
    { id: 'ds_xp3',      name: 'XP Tome Stack (3h)',     costD: 400,  gives: { xpByStage: 180 },   glyph: '📚', tag: 'SAVE 11%' },
    { id: 'ds_xp10',     name: 'XP Archive (10h)',       costD: 1200, gives: { xpByStage: 600 },   glyph: '🏛️', tag: 'SAVE 20%' },
    { id: 'ds_dust',     name: 'Gear Dust Cache',        costD: 200,  gives: { dust: 120 },  glyph: '✨' },
    { id: 'ds_dust3',    name: 'Gear Dust Barrel',       costD: 500,  gives: { dust: 330 },  glyph: '🛢️', tag: 'SAVE 10%' },
    { id: 'ds_dust10',   name: 'Gear Dust Silo',         costD: 1400, gives: { dust: 1050 }, glyph: '⚗️', tag: 'SAVE 25%' },
  ],

  /* ---- PROMO BUNDLES — multi-resource value packs, priced in 💎.
     value = what the contents cost bought separately in the Market;
     save = the discount %. onceEver bundles are once per account. ---- */
  promos: [
    { id: 'pb_raider', name: "Raider's Kickstart", glyph: '🎒', costD: 500, onceEver: true,
      gives: { scrolls: 2, goldByStage: 120, dust: 200 }, value: 1360, save: 63,
      blurb: '2× Summon Scrolls · 2h of Gold · 200 Gear Dust' },
    { id: 'pb_forge', name: "Smith's Warchest", glyph: '⚒️', costD: 980,
      gives: { dust: 550, goldByStage: 120 }, value: 1400, save: 30,
      blurb: '550 Gear Dust · 2h of Gold — everything an enhancer needs' },
    { id: 'pb_summoner', name: "Summoner's Rite", glyph: '🔮', costD: 1980,
      gives: { scrolls: 7, dust: 150, diamonds: 200 }, value: 2860, save: 31,
      blurb: '7× Summon Scrolls · 150 Dust · +200 💎 BONUS BACK' },
    { id: 'pb_war', name: 'War Council Bundle', glyph: '⚜️', costD: 3300,
      gives: { scrolls: 10, goldByStage: 360, xpByStage: 360, dust: 300 }, value: 5100, save: 35,
      blurb: '10× Scrolls · 6h Gold · 6h XP · 300 Dust' },
    { id: 'pb_ascend', name: 'Ascendancy Trove', glyph: '🌟', costD: 5900,
      gives: { scrolls: 12, goldByStage: 600, xpByStage: 600, dust: 800, diamonds: 500 }, value: 9430, save: 37,
      blurb: '12× Scrolls · 10h Gold · 10h XP · 800 Dust · +500 💎 BONUS BACK' },
    { id: 'pb_dragon', name: "Warlord's Ransom", glyph: '🐲', costD: 9800, onceEver: true,
      gives: { scrolls: 25, goldByStage: 1200, xpByStage: 1200, dust: 1500, diamonds: 1500, chest: 'celestial' }, value: 19725, save: 50,
      blurb: '25× Scrolls · 20h Gold · 20h XP · 1500 Dust · +1500 💎 BACK · Celestial Chest' },
  ],

  /* ---- DAILY DEALS — 3 rotate in each day, one purchase each.
     Flash-sale pricing: 35–50% off Market value. ---- */
  DEALS_POOL: [
    { id: 'dd_scrolls', name: 'Scroll Flash Sale', glyph: '📜', costD: 500,  gives: { scrolls: 3 },      value: 840,  save: 40 },
    { id: 'dd_dust',    name: 'Dust Rush',         glyph: '✨', costD: 360,  gives: { dust: 360 },       value: 600,  save: 40 },
    { id: 'dd_gold',    name: 'Gold Fever',        glyph: '💰', costD: 260,  gives: { goldByStage: 160 },value: 400,  save: 35 },
    { id: 'dd_xp',      name: 'Scholar Surge',     glyph: '📗', costD: 260,  gives: { xpByStage: 160 },  value: 400,  save: 35 },
    { id: 'dd_golden',  name: 'Golden Chest Deal', glyph: '🏆', costD: 340,  gives: { chest: 'golden' }, value: 560,  save: 39 },
    { id: 'dd_mystic',  name: 'Mystic Chest Deal', glyph: '🔮', costD: 660,  gives: { chest: 'mystic' }, value: 1200, save: 45 },
    { id: 'dd_bigdust', name: 'Dust Avalanche',    glyph: '⛏️', costD: 900,  gives: { dust: 900 },       value: 1500, save: 40 },
    { id: 'dd_warkit',  name: 'War Kit',           glyph: '🛡️', costD: 800,  gives: { scrolls: 2, dust: 200, goldByStage: 60 }, value: 1443, save: 45 },
    { id: 'dd_jackpot', name: 'Diamond Jackpot',   glyph: '💎', costD: 1000, gives: { diamonds: 1300 },  value: 1300, save: 23 },
  ],
  dealsPerDay: 3,
  dealsOfDay(dayKey) {
    let h = 0;
    String(dayKey + 'deals').split('').forEach(c => { h = (h * 131 + c.charCodeAt(0)) >>> 0; });
    const pool = this.DEALS_POOL.slice();
    const out = [];
    while (out.length < this.dealsPerDay && pool.length) {
      h = (h * 1103515245 + 12345) >>> 0;
      out.push(pool.splice(h % pool.length, 1)[0]);
    }
    return out;
  },

  /* ---- FREE DAILY GIFT — the Store always pays you to visit ---- */
  freeGift: { id: 'free_gift', name: "Merchant's Favor", glyph: '🎗️', gives: { diamonds: 60, dust: 30, goldByStage: 30 },
    blurb: 'A free thank-you from the Grand Bazaar — every day.' },
};

/* ============================================================
   GEAR LORE & SET BONUSES — every item tells a story, and a
   fully-geared champion earns real stat bonuses (shown in the
   Inventory tooltip and applied in State.champStats).
   ============================================================ */
DATA.GEAR_LORE = {
  weapon: {
    common: 'Standard militia issue. It has seen one war and would prefer not to see another.',
    fine: 'Forged by a guild smith on a good day. The edge hums when it is proud of you.',
    rare: 'Quenched in stormwater under a waning moon. It remembers every duel it has won.',
    epic: 'A named blade from the old wars. Collectors have killed for it; it approves.',
    mythic: 'One of the Worldsmith\'s prototypes. Reality parts around the edge out of respect.',
    legendary: 'A blade with its own chapter in every region\'s history. The chapters disagree on everything except the ending.',
    exclusive: 'There is exactly one of these. The realm arranged itself so you would find it.',
    aether: 'It exists slightly more than everything around it. The Rift remembers who carried it last, and approves of you.',
  },
  armor: {
    common: 'Boiled leather and stubbornness. Mostly stubbornness.',
    fine: 'Riveted by a smith who charged double and was worth triple.',
    rare: 'Each plate is etched with the name of a battle it survived. There is little room left.',
    epic: 'Worn by three heroes in three ages. All three died of old age — take the hint.',
    mythic: 'Forged from a dragon\'s refusal to die. It still growls at arrows.',
    legendary: 'Five sieges, three ages, one dent — and the dent was diplomatic.',
    exclusive: 'Armor of legend. Museums have standing offers; the armor has standing refusals.',
    aether: 'Light passes through it politely, asking nothing. Blades receive no such courtesy.',
  },
  boots: {
    common: 'They fit. In this economy, that is enough.',
    fine: 'Scout-grade striders, broken in across two hundred leagues of bad roads.',
    rare: 'The cobbler wove wind-sigils into the soles. Puddles no longer feel entitled to you.',
    epic: 'Stitched from sky-serpent hide. The ground has started taking it personally.',
    mythic: 'The left boot has walked through time once. The right one is still jealous.',
    legendary: 'They have outrun avalanches, verdicts, and one particularly motivated wedding.',
    exclusive: 'Footwear of the chosen. The path ahead smooths itself out of professional courtesy.',
    aether: 'Your footprints arrive before you do. They wait patiently.',
  },
  talisman: {
    common: 'A river clay charm. Luck sold separately, but it tries.',
    fine: 'Blessed at a roadside shrine by a priest who really meant it.',
    rare: 'It grows warm before danger and smug after victories.',
    epic: 'Contains a sliver of a fallen star that refuses to stop falling.',
    mythic: 'An oracle\'s eye, closed forever, seeing everything. It likes you.',
    legendary: 'Kings have started wars for it. It has ended more of them than the kings did.',
    exclusive: 'A relic of the realm\'s founding. Fate consults it before making plans.',
    aether: 'A heartbeat of the Rift, set in silver. It pulses in time with something that has no heart.',
  },
};
/* Set bonuses: real stat boosts applied in State.champStats */
DATA.SET_BONUSES = [
  { id: 'full', name: 'Battle-Ready', desc: 'All 4 gear slots equipped', atk: 0.06, hp: 0.06,
    check: pieces => pieces.length === 4 },
  { id: 'master', name: 'Master-Forged', desc: 'All 4 slots Epic quality or better', atk: 0.08, hp: 0.08,
    check: pieces => pieces.length === 4 && pieces.every(g => ['epic', 'mythic', 'legendary', 'exclusive', 'aether'].includes(g.rarity)) },
  { id: 'aether', name: 'Aetherbound', desc: 'Any AETHER relic equipped', atk: 0.05, hp: 0.05,
    check: pieces => pieces.some(g => g.rarity === 'aether') },
];

/* ============================================================
   CLASS BEHAVIORS & DEBUFF SCALING — Healer AI + high-tier
   debuff amplification (consumed by combat.js).
   ============================================================ */
DATA.HEALER_AI = {
  openingShieldMult: 1.0,    // shield on all allies at battle start (×ATK, 8s)
  openingAtkUp: { power: 8, dur: 10 },          // party attack boost at battle start
  openingBlind: { power: 18, dur: 6 },          // blind on enemy front row (miss chance %)
  openingAtkDown: { power: 12, dur: 8 },        // attack cut on enemy front row
  emergencyHpPct: 0.30,      // party aggregate HP threshold
  emergencyHealMult: 3.0,    // massive AoE heal (×ATK), once per battle per healer
};
/* Elite & Legendary units land harder debuffs (power multiplier) */
DATA.DEBUFF_AMP = { elite: 0.10, epic: 0.15, mystic: 0.20, ultimate: 0.25, legendary: 0.30 };

/* ============================================================
   ACHIEVEMENTS — lifetime feats with diamond rewards; the big
   ones grant permanent title badges shown by your name.
   ============================================================ */
DATA.ACHIEVEMENTS = [
  { id: 'st10',   name: 'First Blood',        desc: 'Clear Chapter 1 (stage 1-10)', stat: 'maxStage', goal: 11,  reward: { diamonds: 300 } },
  { id: 'st30',   name: 'Realm Strider',      desc: 'Clear Chapter 3 (stage 3-10)', stat: 'maxStage', goal: 31,  reward: { diamonds: 700 } },
  { id: 'st60',   name: 'Warfront Legend',    desc: 'Clear Chapter 6 (stage 6-10)', stat: 'maxStage', goal: 61,  reward: { diamonds: 1500 }, badge: 'WARLORD' },
  { id: 'st100',  name: 'Realm Savior',       desc: 'Clear the entire campaign',    stat: 'maxStage', goal: 101, reward: { diamonds: 5000 }, badge: 'SAVIOR' },
  { id: 'sum10',  name: 'Gatecaller',         desc: 'Summon 10 Champions',          stat: 'summons',  goal: 10,  reward: { diamonds: 200 } },
  { id: 'sum50',  name: 'Voice of the Gate',  desc: 'Summon 50 Champions',          stat: 'summons',  goal: 50,  reward: { diamonds: 600 } },
  { id: 'sum200', name: 'Gatebreaker',        desc: 'Summon 200 Champions',         stat: 'summons',  goal: 200, reward: { diamonds: 2000 }, badge: 'GATEBREAKER' },
  { id: 'bat50',  name: 'Blooded',            desc: 'Fight 50 battles',             stat: 'battles',  goal: 50,  reward: { diamonds: 250 } },
  { id: 'bat250', name: 'Veteran',            desc: 'Fight 250 battles',            stat: 'battles',  goal: 250, reward: { diamonds: 800 } },
  { id: 'bat1k',  name: 'Warborn',            desc: 'Fight 1,000 battles',          stat: 'battles',  goal: 1000, reward: { diamonds: 2500 }, badge: 'WARBORN' },
  { id: 'twr10',  name: 'Tower Tourist',      desc: 'Reach Tower floor 10',         stat: 'towerFloor', goal: 10, reward: { diamonds: 300 } },
  { id: 'twr30',  name: 'Spire Conqueror',    desc: 'Reach Tower floor 30',         stat: 'towerFloor', goal: 30, reward: { diamonds: 1000 }, badge: 'ASCENDANT' },
  { id: 'arn10',  name: 'Gladiator',          desc: 'Win 10 Arena fights',          stat: 'arenaWins', goal: 10,  reward: { diamonds: 300 } },
  { id: 'arn50',  name: 'Crowd Favorite',     desc: 'Win 50 Arena fights',          stat: 'arenaWins', goal: 50,  reward: { diamonds: 1200 }, badge: 'CHAMPION' },
  { id: 'asc5',   name: 'Star Shaper',        desc: 'Ascend Champions 5 times',     stat: 'ascends',   goal: 5,   reward: { diamonds: 400 } },
  { id: 'asc20',  name: 'Constellation',      desc: 'Ascend Champions 20 times',    stat: 'ascends',   goal: 20,  reward: { diamonds: 1500 }, badge: 'STARFORGER' },
  { id: 'cst10',  name: 'Treasure Hunter',    desc: 'Open 10 chests',               stat: 'chestsOpened', goal: 10, reward: { diamonds: 250 } },
  { id: 'cst50',  name: 'Vault Emperor',      desc: 'Open 50 chests',               stat: 'chestsOpened', goal: 50, reward: { diamonds: 1000 }, badge: 'MIDAS' },
  { id: 'ros10',  name: 'Recruiter',          desc: 'Own 10 different Champions',   stat: 'rosterSize', goal: 10, reward: { diamonds: 300 } },
  { id: 'ros20',  name: 'Master Collector',   desc: 'Own 20 different Champions',   stat: 'rosterSize', goal: 20, reward: { diamonds: 1200 }, badge: 'COLLECTOR' },
  { id: 'frg5',   name: 'Apprentice Smith',   desc: 'Forge 5 items at the Relic Forge', stat: 'crafts', goal: 5,  reward: { diamonds: 300 } },
  { id: 'frg20',  name: 'Worldsmith',         desc: 'Forge 20 items at the Relic Forge', stat: 'crafts', goal: 20, reward: { diamonds: 1200 }, badge: 'WORLDSMITH' },
];

/* ============================================================
   DAILY LOGIN STREAK — 7-day rolling calendar, escalating.
   Day 7 pays a Golden Chest; the cycle then repeats.
   ============================================================ */
DATA.LOGIN_STREAK = [
  { day: 1, glyph: '💰', label: 'Gold',            reward: { gold: 2500 } },
  { day: 2, glyph: '✨', label: 'Gear Dust',       reward: { dust: 80 } },
  { day: 3, glyph: '💎', label: 'Diamonds',        reward: { diamonds: 300 } },
  { day: 4, glyph: '📜', label: 'Summon Scroll',   reward: { scrolls: 1 } },
  { day: 5, glyph: '📗', label: 'XP Tomes',        reward: { xp: 4000 } },
  { day: 6, glyph: '💎', label: 'Diamonds',        reward: { diamonds: 600 } },
  { day: 7, glyph: '🏆', label: 'Golden Chest',    reward: { chest: 'golden', scrolls: 2 } },
];

/* ============================================================
   STAGE SWEEP — instantly raid stages you have already cleared.
   ============================================================ */
DATA.SWEEP = {
  perDay: 5,
  // sweeps pay full stage rewards but roll gear at half chance
  gearChanceFactor: 0.5,
};

/* ============================================================
   RELIC FORGE — turn Gear Dust into targeted equipment.
   Every 8th craft is guaranteed Mythic (pity).
   ============================================================ */
DATA.FORGE = {
  pityEvery: 8,
  options: [
    { rarity: 'rare',   cost: { dust: 120, gold: 4000 } },
    { rarity: 'epic',   cost: { dust: 320, gold: 12000 } },
    { rarity: 'mythic', cost: { dust: 750, gold: 32000 } },
  ],
};

/* ---------------- Player bootstrap ---------------- */
DATA.STARTING_ROSTER = ['azrin', 'raphael', 'yoonsul'];   // day-one team
DATA.EARLY_UNLOCKS = { 'ezekiel': 3, 'azrael': 8 };       // stage → free champion
DATA.STARTING_RESOURCES = { gold: 2000, xp: 3700, diamonds: 5000, scrolls: 20, dust: 30 };

DATA.SERVER_NAMES = ['Dawnspire', 'Veilmarch', 'Citrine Fault', 'Drowned Coast', 'Elderroot'];

/* ---------------- Environments (battle arenas) ----------------
   16 themed battle areas. Every theme carries a `boss` variant —
   its dedicated Boss Arena design (darker skies, hotter accents;
   battle3d.js adds flame obelisks + rune ring on top). */
DATA.ENVIRONMENTS = {
  /* --- original six --- */
  plains:  { ground: 0x4a5a38, fog: 0xbcc8a8, sky: 0x9fb8d8, accent: 0x7a9a4a, props: 'rocks',
    boss: { sky: 0x4a3820, fog: 0x6a5838, accent: 0xffb03a } },
  crypt:   { ground: 0x3a3f4d, fog: 0x2a2f3d, sky: 0x1a1f2d, accent: 0x8a92a8, props: 'pillars',
    boss: { sky: 0x0d0a18, fog: 0x181328, accent: 0x9adf6a } },
  volcano: { ground: 0x4a2a1e, fog: 0x3a1a10, sky: 0x2a0f08, accent: 0xff5e2a, props: 'rocks',
    boss: { sky: 0x180502, fog: 0x2a0c04, accent: 0xffdf3a } },
  abyss:   { ground: 0x123240, fog: 0x0a2230, sky: 0x061824, accent: 0x2a9ac8, props: 'coral',
    boss: { sky: 0x020a14, fog: 0x04121e, accent: 0x5ae8d8 } },
  foundry: { ground: 0x3a3226, fog: 0x2a2418, sky: 0x1c180e, accent: 0xe8c84a, props: 'pillars',
    boss: { sky: 0x120c04, fog: 0x1e1408, accent: 0xff7a2a } },
  void:    { ground: 0x1a1030, fog: 0x120a24, sky: 0x0a0618, accent: 0x8a4af8, props: 'crystals',
    boss: { sky: 0x04020c, fog: 0x0a0518, accent: 0xff4af8 } },

  /* --- ten new themed areas --- */
  glacier:    { ground: 0x9dc4d8, fog: 0xcfe8f5, sky: 0xa8d8f0, accent: 0x5ad8ff, props: 'icicles',
    boss: { sky: 0x1a3448, fog: 0x2a4458, accent: 0x9df0ff } },
  stormspire: { ground: 0x3a4048, fog: 0x2a3038, sky: 0x1a2028, accent: 0xffe86a, props: 'obelisks',
    boss: { sky: 0x0c0e14, fog: 0x161a20, accent: 0xfff29a } },
  desert:     { ground: 0xc8a058, fog: 0xe8d0a0, sky: 0xf0c880, accent: 0xff9d3a, props: 'dunes',
    boss: { sky: 0x6a3010, fog: 0x8a5028, accent: 0xffd97a } },
  jungle:     { ground: 0x2f4a26, fog: 0x3a5a38, sky: 0x4a7a58, accent: 0x8adf5a, props: 'mushrooms',
    boss: { sky: 0x14260e, fog: 0x1e3a18, accent: 0xd8ff5a } },
  ruins:      { ground: 0x6a6252, fog: 0x8a8272, sky: 0xa8a090, accent: 0xd8c8a0, props: 'statues',
    boss: { sky: 0x3a3428, fog: 0x4e4636, accent: 0xffe8a0 } },
  bloodmoon:  { ground: 0x3a2028, fog: 0x4a1a28, sky: 0x2a0a18, accent: 0xff3a5a, props: 'bones',
    boss: { sky: 0x180208, fog: 0x280812, accent: 0xff6a8a } },
  faewild:    { ground: 0x2a4a3a, fog: 0x3a5a58, sky: 0x1a3a48, accent: 0xff9de0, props: 'lanterns',
    boss: { sky: 0x0e1e2a, fog: 0x1a2e3a, accent: 0xffbdf0 } },
  shadowkeep: { ground: 0x262030, fog: 0x1a1524, sky: 0x100c18, accent: 0x6a5af8, props: 'banners',
    boss: { sky: 0x080512, fog: 0x100a1e, accent: 0xa88aff } },
  celestial:  { ground: 0x484068, fog: 0x8a80b8, sky: 0x6858a8, accent: 0xff9de0, props: 'clouds',
    boss: { sky: 0x2a1a48, fog: 0x3a2a58, accent: 0xffd6f0 } },
  sanctum:    { ground: 0xd8ccb0, fog: 0xf0e8d0, sky: 0xffe8c0, accent: 0xf5c542, props: 'pillars',
    boss: { sky: 0x6a4818, fog: 0x8a6838, accent: 0xfff0a0 } },

  /* --- pvp arena --- */
  arena:   { ground: 0x4a4438, fog: 0xb8ae98, sky: 0x8fa8c8, accent: 0xd8c8a0, props: 'pillars',
    boss: { sky: 0x3a3048, fog: 0x584e68, accent: 0xffd97a } },
};

/* Faction → home battlefield (used by Faction Trials) */
DATA.FACTION_ENVS = {
  fire: 'volcano', nature: 'jungle', rock: 'desert', electric: 'stormspire', water: 'abyss',
  holy: 'sanctum', dark: 'shadowkeep', cosmic: 'celestial', aether: 'faewild', wind: 'plains',
};
