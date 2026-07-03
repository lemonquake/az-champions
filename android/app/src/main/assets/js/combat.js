/* ============================================================
   AZ CHAMPIONS — Combat Engine
   Real-time auto-battle simulation. Emits events consumed by
   the 3D renderer (battle3d.js) and battle UI.
   ============================================================ */
'use strict';

const Combat = (() => {

  const BASIC_ENERGY = 100, SKILL_ENERGY = 80, HIT_ENERGY = 45, ULT_COST = 1000;
  const CRIT_MULT = 1.75, TIME_LIMIT = 90;

  let uidSeq = 1;

  /* ---------- unit factory ---------- */
  function makeUnit(side, slot, cfg) {
    // cfg: { def, stats:{hp,atk,def,spd,crit}, level, kit, model, isBoss, name, faction }
    return {
      uid: 'u' + (uidSeq++),
      side, slot,
      name: cfg.name,
      defId: cfg.def.id,
      faction: cfg.faction || null,
      role: cfg.role || 'melee',
      rarity: (cfg.def && cfg.def.rarity) || null,
      isBoss: !!cfg.isBoss,
      level: cfg.level,
      kit: cfg.kit || {},
      model: cfg.model,
      base: cfg.stats,
      hp: cfg.stats.hp, maxHp: cfg.stats.hp,
      energy: 0, alive: true,
      atkTimer: 0.4 + Math.random() * 0.9,
      skillCd: (cfg.kit && cfg.kit.skill) ? (cfg.kit.skill.cd * (0.45 + Math.random() * 0.3)) : Infinity,
      basicCount: 0,
      itemFx: cfg.itemFx || [],   // named-relic combat effects (allies only)
      phaseCharges: 0,            // AETHER Phase: attacks that will auto-miss
      hasAngel: false, angelUsed: false,   // AETHER Guardian Angel
      stasis: false,              // AETHER Stasis: stun/silence immunity
      fxRegenTimer: 0, starTimer: 0, chronoTimer: 0, chronoBonus: 0,
      statuses: [],           // {kind, power, dur, src, tick}
      shields: [],            // {amount, dur, thornsBurn?}
      killStacks: 0,
      below50Fired: false,
      rageFired: false, standFired: false, frenzyStacks: 0,   // relic low-HP / on-kill triggers
      regenTimer: 0,
      resUsed: false,          // Divine Resurrection (once per battle)
      emergencyUsed: false,    // Healer emergency all-heal (once per battle)
      dead: false,
    };
  }

  const isHealer = u => /support/i.test(u.role || '');

  function isMeleeWeapon(w) { return ['sword', 'greatsword', 'scythe', 'hammer', 'daggers', 'fists', 'shield', 'spear', 'katana', 'axe', 'lance', 'claws', 'twinblades', 'banner'].includes(w); }

  /* ---------- battle ---------- */
  function createBattle(allies, enemies, opts) {
    const B = {
      units: [],
      time: 0,
      speed: opts.speed || 1,
      autoUlt: opts.autoUlt !== false,
      events: [],
      over: false, victory: null,
      opts,
    };
    allies.forEach((cfg, i) => B.units.push(makeUnit('ally', cfg.slot != null ? cfg.slot : i, cfg)));
    enemies.forEach((cfg, i) => B.units.push(makeUnit('enemy', cfg.slot != null ? cfg.slot : i, cfg)));
    // battle-start passives
    B.units.forEach(u => firePassive(B, u, 'battleStart'));
    // named-relic battle-start effects (shields, energy, phase, overcharge…)
    B.units.forEach(u => applyItemStartFx(B, u));
    // Healer class AI: proactive opening — party shield + attack boost,
    // blind + attack-cut on the enemy front line.
    B.units.filter(u => isHealer(u)).forEach(u => healerOpening(B, u));
    return B;
  }

  /* ---------- Healer class behaviors ---------- */
  function healerOpening(B, u) {
    const cfg = DATA.HEALER_AI;
    const atk = getStat(B, u, 'atk');
    ev(B, { t: 'passive', unit: u.uid, name: 'Guardian Instinct' });
    mates(B, u).forEach(m => {
      addShield(B, m, atk * cfg.openingShieldMult, 8);
      addStatus(B, m, { kind: 'atkUp', power: cfg.openingAtkUp.power, dur: cfg.openingAtkUp.dur, chance: 100 }, u);
    });
    const front = foes(B, u).filter(x => x.slot < 2);
    (front.length ? front : foes(B, u).slice(0, 2)).forEach(f => {
      addStatus(B, f, { kind: 'blind', power: cfg.openingBlind.power, dur: cfg.openingBlind.dur, chance: 100 }, u);
      addStatus(B, f, { kind: 'atkDown', power: cfg.openingAtkDown.power, dur: cfg.openingAtkDown.dur, chance: 100 }, u);
    });
  }

  function checkEmergencyHeal(B) {
    ['ally', 'enemy'].forEach(sd => {
      const team = side(B, sd);
      if (!team.length) return;
      const agg = team.reduce((t, x) => t + x.hp, 0) / team.reduce((t, x) => t + x.maxHp, 0);
      if (agg >= DATA.HEALER_AI.emergencyHpPct) return;
      team.filter(x => isHealer(x) && !x.emergencyUsed && !hasStatus(x, 'stun')).forEach(h => {
        h.emergencyUsed = true;
        ev(B, { t: 'skill', unit: h.uid, name: 'EMERGENCY AID' });
        ev(B, { t: 'passive', unit: h.uid, name: 'Emergency Aid' });
        const atk = getStat(B, h, 'atk');
        mates(B, h).forEach(m => {
          healUnit(B, h, m, atk * DATA.HEALER_AI.emergencyHealMult);
          m.statuses = m.statuses.filter(s => !['burn', 'poison', 'bleed', 'vampiric'].includes(s.kind));
        });
      });
    });
  }

  const side = (B, s) => B.units.filter(u => u.side === s && u.alive);
  const foes = (B, u) => side(B, u.side === 'ally' ? 'enemy' : 'ally');
  const mates = (B, u) => side(B, u.side);

  function ev(B, e) { B.events.push(e); }

  /* ---------- named-item effect helpers ----------
     itemFx entries come from State.champItemEffects: the fx spec of
     every equipped named relic. AETHER kinds exist on no other tier. */
  const fxAll = (u, kind) => (u.itemFx || []).filter(f => f.kind === kind);
  const fxSum = (u, kind) => fxAll(u, kind).reduce((t, f) => t + (f.power || 0), 0);
  const fxHas = (u, kind) => fxAll(u, kind).length > 0;

  function applyItemStartFx(B, u) {
    if (!u.itemFx || !u.itemFx.length) return;
    u.itemFx.forEach(f => {
      switch (f.kind) {
        case 'energyStart': gainEnergy(B, u, f.power); break;
        case 'overcharge':  u.energy = ULT_COST; ev(B, { t: 'passive', unit: u.uid, name: 'OVERCHARGE' }); break;
        case 'shieldStart': addShield(B, u, getStat(B, u, 'atk') * f.power, 10); break;
        case 'firstStrike': addStatus(B, u, { kind: 'atkUp', power: f.power, dur: f.dur, chance: 100 }, u); break;
        case 'haste':       addStatus(B, u, { kind: 'haste', power: f.power, dur: 9999, chance: 100 }, u); break;
        case 'defUp':       addStatus(B, u, { kind: 'defUp', power: f.power, dur: 9999, chance: 100 }, u); break;
        case 'dodge':       addStatus(B, u, { kind: 'dodge', power: f.power, dur: 9999, chance: 100 }, u); break;
        case 'critUp':      addStatus(B, u, { kind: 'critUp', power: f.power, dur: 9999, chance: 100 }, u); break;
        case 'phaseShift':  u.phaseCharges += (f.charges || 0); break;
        case 'vitality': {
          const bonus = Math.round(u.maxHp * f.power / 100);
          u.maxHp += bonus; u.hp += bonus;
          break;
        }
        case 'might':       addStatus(B, u, { kind: 'atkUp', power: f.power, dur: 9999, chance: 100 }, u); break;
        case 'rally':
          ev(B, { t: 'passive', unit: u.uid, name: 'RALLY' });
          mates(B, u).forEach(m => addStatus(B, m, { kind: 'atkUp', power: f.power, dur: f.dur || 10, chance: 100 }, u));
          break;
        case 'wardAura':
          ev(B, { t: 'passive', unit: u.uid, name: 'WARD' });
          mates(B, u).forEach(m => addShield(B, m, getStat(B, u, 'atk') * f.power, 10));
          break;
      }
    });
    if (fxHas(u, 'guardianAngel')) u.hasAngel = true;
    if (fxHas(u, 'stasis')) u.stasis = true;
  }

  /* ---------- status helpers ---------- */
  const DEBUFF_KINDS = ['burn', 'poison', 'bleed', 'vampiric', 'atkDown', 'defDown', 'slow', 'blind'];

  function addStatus(B, target, st, src) {
    if (!target.alive) return;
    if (st.chance != null && Math.random() * 100 >= st.chance) return;
    // AETHER Stasis: immune to stun & silence
    if (target.stasis && (st.kind === 'stun' || st.kind === 'silence')) return;
    // silence blocks energy; stun blocks action. Refresh same-kind from same source.
    const existing = target.statuses.find(x => x.kind === st.kind && x.srcUid === (src && src.uid));
    let power = st.power || 0;
    // Elite & Legendary champions land amplified debuffs on enemies
    if (src && src.rarity && target.side !== src.side && DEBUFF_KINDS.includes(st.kind)) {
      power *= 1 + (DATA.DEBUFF_AMP[src.rarity] || 0);
    }
    if (existing && st.kind !== 'atkUp') { // atkUp from onKill stacks
      existing.dur = Math.max(existing.dur, st.dur);
      existing.power = Math.max(existing.power, power);
    } else {
      target.statuses.push({ kind: st.kind, power, dur: st.dur, srcUid: src && src.uid, srcAtk: src ? getStat(B, src, 'atk') : 0, tick: 0 });
    }
    ev(B, { t: 'status', to: target.uid, kind: st.kind });
  }

  function hasStatus(u, kind) { return u.statuses.some(s => s.kind === kind); }
  function statusSum(u, kind) { return u.statuses.reduce((t, s) => t + (s.kind === kind ? s.power : 0), 0); }

  function getStat(B, u, key) {
    let v = u.base[key];
    if (key === 'atk') v *= 1 + (statusSum(u, 'atkUp') - statusSum(u, 'atkDown')) / 100;
    if (key === 'def') v *= 1 + (statusSum(u, 'defUp') - statusSum(u, 'defDown')) / 100;
    if (key === 'spd') v *= 1 + (statusSum(u, 'haste') - statusSum(u, 'slow') + (u.chronoBonus || 0)) / 100;
    if (key === 'crit') v += statusSum(u, 'critUp');
    return Math.max(1, v);
  }

  function gainEnergy(B, u, amount) {
    if (!u.alive || hasStatus(u, 'silence')) return;
    u.energy = Math.min(ULT_COST, u.energy + amount);
  }

  function totalShield(u) { return u.shields.reduce((t, s) => t + s.amount, 0); }

  /* ---------- targeting ---------- */
  function defaultTarget(B, u) {
    const f = foes(B, u);
    if (!f.length) return null;
    const taunter = f.find(x => hasStatus(x, 'taunt'));
    if (taunter) return taunter;
    return f.slice().sort((a, b) => a.slot - b.slot)[0];
  }

  function pickTargets(B, u, sel, ctx) {
    const f = foes(B, u), m = mates(B, u);
    const byHp = arr => arr.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
    switch (sel) {
      case 'current': { const t = ctx.current || defaultTarget(B, u); return t ? [t] : []; }
      case 'lowestHp': { const t = byHp(f)[0]; return t ? [t] : []; }
      case 'highestAtk': { const t = f.slice().sort((a, b) => getStat(B, b, 'atk') - getStat(B, a, 'atk'))[0]; return t ? [t] : []; }
      case 'strongest2': return f.slice().sort((a, b) => getStat(B, b, 'atk') - getStat(B, a, 'atk')).slice(0, 2);
      case 'all': return f.slice();
      case 'frontRow': { const fr = f.filter(x => x.slot < 2); return fr.length ? fr : f.slice(); }
      case 'backRow': { const br = f.filter(x => x.slot >= 2); return br.length ? br : f.slice(); }
      case 'backmost': { const s = f.slice().sort((a, b) => b.slot - a.slot)[0]; return s ? [s] : []; }
      case 'random3': { const sh = f.slice().sort(() => Math.random() - 0.5); return sh.slice(0, 3); }
      case 'randomEach': { const t = f[Math.floor(Math.random() * f.length)]; return t ? [t] : []; }
      case 'column': {
        const t = ctx.current || defaultTarget(B, u);
        if (!t) return [];
        const out = [t];
        if (t.slot < 2) {
          const behind = f.filter(x => x.slot >= 2);
          if (behind.length) out.push(behind[Math.floor(Math.random() * behind.length)]);
        }
        return out;
      }
      case 'self': return [u];
      case 'allAllies': return m.slice();
      case 'lowestAlly': { const t = byHp(m)[0]; return t ? [t] : []; }
      case 'weakest2Allies': return byHp(m).slice(0, 2);
      default: { const t = defaultTarget(B, u); return t ? [t] : []; }
    }
  }

  /* ---------- damage ---------- */
  function auraOf(B, u, key) {
    const p = u.kit.passive && u.kit.passive.spec;
    if (p && p.trigger === 'aura' && p[key] != null) return p[key];
    return null;
  }

  function dealDamage(B, src, target, mult, tags) {
    tags = tags || {};
    if (!target || !target.alive || !src.alive) return 0;

    // invulnerability (Divine Resurrection grace) — no damage can land
    if (hasStatus(target, 'invuln')) {
      ev(B, { t: 'dodge', to: target.uid });
      return 0;
    }
    // AETHER Phase: the first few attacks pass straight through
    if (target.phaseCharges > 0 && !tags.isReflect) {
      target.phaseCharges--;
      ev(B, { t: 'dodge', to: target.uid });
      return 0;
    }
    // blinded attackers miss
    const blind = statusSum(src, 'blind');
    if (blind > 0 && Math.random() * 100 < blind) {
      ev(B, { t: 'dodge', to: target.uid });
      return 0;
    }
    // dodge
    if (Math.random() * 100 < statusSum(target, 'dodge')) {
      ev(B, { t: 'dodge', to: target.uid });
      return 0;
    }

    let atk = getStat(B, src, 'atk');
    let raw = atk * mult * (0.95 + Math.random() * 0.1);

    // faction advantage
    let critChance = getStat(B, src, 'crit');
    if (src.faction && target.faction && DATA.factionBeats(src.faction, target.faction)) {
      raw *= 1 + DATA.FACTION_DMG_BONUS;
      critChance += DATA.FACTION_CRIT_BONUS;
    }
    // passive damage amps
    const exec = auraOf(B, src, 'executeBonus');
    if (exec && target.hp / target.maxHp < 0.5) raw *= 1 + exec;
    const vsBurn = auraOf(B, src, 'bonusVsBurning');
    if (vsBurn && hasStatus(target, 'burn')) raw *= 1 + vsBurn;
    if (tags.executeBelow && target.hp / target.maxHp < tags.executeBelow.hpPct) raw *= tags.executeBelow.factor;
    // named-relic execute bonus
    const execFx = fxSum(src, 'executeBonus');
    if (execFx && target.hp / target.maxHp < 0.5) raw *= 1 + execFx / 100;

    // crit (named relics can raise crit DAMAGE)
    let crit = false;
    if (!tags.noCrit && Math.random() * 100 < critChance) { raw *= CRIT_MULT + fxSum(src, 'critDmg') / 100; crit = true; }

    // mitigation
    const defense = getStat(B, target, 'def');
    const k = 190 + 24 * src.level;
    raw *= 1 - defense / (defense + k);

    // back-row protection aura (Bram)
    if (target.slot >= 2) {
      mates(B, target).forEach(m => {
        const dr = auraOf(B, m, 'backRowDR');
        if (dr && m.uid !== target.uid) raw *= 1 - dr;
      });
    }

    let dmg = Math.max(1, Math.round(raw));

    // shields absorb
    let absorbed = 0;
    for (const sh of target.shields) {
      if (dmg <= 0) break;
      const take = Math.min(sh.amount, dmg);
      sh.amount -= take; dmg -= take; absorbed += take;
      if (sh.thornsBurn) addStatus(B, src, { kind: 'burn', power: sh.thornsBurn.power, dur: sh.thornsBurn.dur, chance: 100 }, target);
    }
    target.shields = target.shields.filter(s => s.amount > 0.5);

    target.hp -= dmg;
    ev(B, { t: 'dmg', from: src.uid, to: target.uid, amount: dmg + absorbed, crit, kind: tags.kind || 'hit' });

    // on-hit-taken passives & energy
    if (target.alive) {
      gainEnergy(B, target, HIT_ENERGY);
      const p = target.kit.passive && target.kit.passive.spec;
      if (p && p.trigger === 'onHitTaken') {
        if (p.energy) gainEnergy(B, target, p.energy);
        if (p.attackerStatus) p.attackerStatus.forEach(st => addStatus(B, src, st, target));
        if (p.attackerEnergyDrain) src.energy = Math.max(0, src.energy - p.attackerEnergyDrain);
      }
      // reflect: passive pct + status pct + named-relic thorns
      let reflPct = statusSum(target, 'reflect') / 100;
      if (p && p.trigger === 'onHitTaken' && p.reflect) reflPct += p.reflect;
      reflPct += fxSum(target, 'thorns') / 100;
      if (reflPct > 0 && !tags.isReflect) {
        const rd = Math.max(1, Math.round((dmg + absorbed) * reflPct));
        src.hp -= rd;
        ev(B, { t: 'dmg', from: target.uid, to: src.uid, amount: rd, crit: false, kind: 'reflect' });
        checkDeath(B, src, target);
      }
      // below-50 trigger
      if (p && target.kit.passive.spec.trigger === 'below50' && !target.below50Fired && target.hp / target.maxHp < 0.5) {
        target.below50Fired = true;
        (p.status || []).forEach(st => addStatus(B, target, st, target));
        ev(B, { t: 'passive', unit: target.uid, name: target.kit.passive.name });
      }
      // named-relic low-HP triggers
      if (!target.rageFired && target.hp / target.maxHp < 0.5 && fxHas(target, 'berserkRage')) {
        target.rageFired = true;
        addStatus(B, target, { kind: 'atkUp', power: fxSum(target, 'berserkRage'), dur: 9999, chance: 100 }, target);
        ev(B, { t: 'passive', unit: target.uid, name: 'BERSERK RAGE' });
      }
      if (!target.standFired && target.hp / target.maxHp < 0.3 && fxHas(target, 'lastStand')) {
        target.standFired = true;
        addShield(B, target, getStat(B, target, 'atk') * fxSum(target, 'lastStand') / 100, 8);
        ev(B, { t: 'passive', unit: target.uid, name: 'LAST STAND' });
      }
    }

    // crit passives on source
    if (crit) {
      const sp = src.kit.passive && src.kit.passive.spec;
      if (sp && sp.trigger === 'onCrit' && sp.energy) gainEnergy(B, src, sp.energy);
    }
    // lifesteal (status + named-relic)
    const ls = statusSum(src, 'lifesteal') + fxSum(src, 'lifesteal');
    if (ls > 0) healUnit(B, src, src, (dmg) * ls / 100, true);
    if (tags.selfHealPct) healUnit(B, src, src, dmg * tags.selfHealPct, true);

    checkDeath(B, target, src);
    return dmg;
  }

  function checkDeath(B, u, killer) {
    if (u.alive && u.hp <= 0) {
      // Divine Resurrection: cheat death once per battle, grant the
      // whole party a short invulnerability window.
      const pr = u.kit.passive && u.kit.passive.spec;
      if (pr && pr.trigger === 'onFatal' && !u.resUsed) {
        u.resUsed = true;
        u.hp = Math.max(1, Math.round(u.maxHp * (pr.revivePct || 0.5)));
        ev(B, { t: 'passive', unit: u.uid, name: u.kit.passive.name });
        ev(B, { t: 'heal', from: u.uid, to: u.uid, amount: u.hp });
        const invulnDur = pr.partyInvuln || 3;
        mates(B, u).forEach(m => {
          m.statuses.push({ kind: 'invuln', power: 0, dur: invulnDur, srcUid: u.uid, srcAtk: 0, tick: 0 });
          ev(B, { t: 'status', to: m.uid, kind: 'invuln' });
          ev(B, { t: 'shield', to: m.uid, amount: 0 });
        });
        return false;
      }
      // AETHER Guardian Angel: the first fatal blow leaves you standing
      if (u.hasAngel && !u.angelUsed) {
        u.angelUsed = true;
        const best = fxAll(u, 'guardianAngel').sort((a, b) => (b.revivePct || 0) - (a.revivePct || 0))[0];
        u.hp = Math.max(1, Math.round(u.maxHp * ((best && best.revivePct) || 20) / 100));
        ev(B, { t: 'passive', unit: u.uid, name: 'GUARDIAN ANGEL' });
        ev(B, { t: 'heal', from: u.uid, to: u.uid, amount: u.hp });
        return false;
      }
      u.hp = 0; u.alive = false;
      ev(B, { t: 'die', unit: u.uid });
      if (killer && killer.alive) {
        const p = killer.kit.passive && killer.kit.passive.spec;
        if (p && p.trigger === 'onKill' && p.status) {
          if (killer.killStacks < (p.maxStacks || 99)) {
            killer.killStacks++;
            p.status.forEach(st => addStatus(B, killer, Object.assign({}, st, { chance: 100 }), killer));
            ev(B, { t: 'passive', unit: killer.uid, name: killer.kit.passive.name });
          }
        }
        // AETHER Soul Harvest: kills restore HP & Energy
        fxAll(killer, 'soulHarvest').forEach(f => {
          healUnit(B, killer, killer, killer.maxHp * (f.hpPct || 0) / 100);
          gainEnergy(B, killer, f.energy || 0);
        });
        // named-relic Frenzy: kills stack Speed (refresh takes max power,
        // so pass the growing total)
        fxAll(killer, 'frenzyKill').forEach(f => {
          if (killer.frenzyStacks < (f.max || 5)) {
            killer.frenzyStacks++;
            addStatus(B, killer, { kind: 'haste', power: f.power * killer.frenzyStacks, dur: 9999, chance: 100 }, killer);
            ev(B, { t: 'passive', unit: killer.uid, name: 'FRENZY ×' + killer.frenzyStacks });
          }
        });
      }
      // named-relic Avenger: surviving allies rage at a fallen comrade
      mates(B, u).forEach(m => {
        const av = fxSum(m, 'avenger');
        if (av > 0) {
          addStatus(B, m, { kind: 'atkUp', power: av, dur: 9999, chance: 100 }, m);
          ev(B, { t: 'passive', unit: m.uid, name: 'AVENGER' });
        }
      });
      return true;
    }
    return false;
  }

  function healUnit(B, src, target, amount, quiet) {
    if (!target.alive) return;
    const a = Math.max(1, Math.round(amount));
    target.hp = Math.min(target.maxHp, target.hp + a);
    if (!quiet) ev(B, { t: 'heal', from: src.uid, to: target.uid, amount: a });
    // Marina passive: heals grant shield
    if (!quiet) {
      const hs = auraOf(B, src, 'healShieldPct');
      if (hs) addShield(B, target, a * hs, 6);
    }
  }

  function addShield(B, target, amount, dur, thornsBurn) {
    if (!target.alive) return;
    target.shields.push({ amount: Math.round(amount), dur, thornsBurn });
    ev(B, { t: 'shield', to: target.uid, amount: Math.round(amount) });
  }

  /* ---------- passives ---------- */
  function firePassive(B, u, trigger) {
    const p = u.kit.passive && u.kit.passive.spec;
    if (!p || p.trigger !== trigger) return;
    if (trigger === 'battleStart') {
      if (p.energy) gainEnergy(B, u, p.energy);
      (p.status || []).forEach(st => addStatus(B, u, st, u));
      if (p.enemyStatus) foes(B, u).forEach(f => p.enemyStatus.forEach(st => addStatus(B, f, st, u)));
    }
  }

  /* ---------- spec execution ---------- */
  function dotAmpFor(B, u) {
    const amp = auraOf(B, u, 'dotAmp');
    return (amp ? 1 + amp : 1) * (1 + fxSum(u, 'dotAmp') / 100);
  }

  function applyOnHit(B, src, target, list) {
    if (!list) return;
    const amp = dotAmpFor(B, src);
    list.forEach(st => {
      const s2 = Object.assign({}, st);
      if (['burn', 'poison', 'bleed'].includes(st.kind)) s2.power = st.power * amp;
      addStatus(B, target, s2, src);
    });
  }

  function execSpec(B, u, spec, ctx, meta) {
    ctx = ctx || {};
    meta = meta || {};
    switch (spec.type) {
      case 'composite':
        spec.actions.forEach(a => execSpec(B, u, a, ctx, meta));
        return;

      case 'damage': {
        const hits = spec.hits || 1;
        let bonusHits = 0;
        const hitOnce = (n) => {
          const targets = pickTargets(B, u, spec.target, ctx);
          targets.forEach(t => {
            let mult = spec.mult;
            if (spec.ramp) mult *= 1 + spec.ramp * n;
            const critBefore = B.events.length;
            dealDamage(B, u, t, mult, { kind: meta.kind || 'skill', executeBelow: spec.executeBelow, selfHealPct: spec.selfHealPct });
            const didCrit = B.events.slice(critBefore).some(e => e.t === 'dmg' && e.to === t.uid && e.crit);
            // extras
            applyOnHit(B, u, t, spec.onHit);
            if (spec.bonusHitOnCrit && didCrit && (hits + bonusHits) < (spec.maxHits || hits)) bonusHits++;
            if (spec.bleedOnRepeat) {
              meta.hitCount = meta.hitCount || {};
              meta.hitCount[t.uid] = (meta.hitCount[t.uid] || 0) + 1;
              if (meta.hitCount[t.uid] > 1) addStatus(B, t, { kind: 'bleed', power: spec.bleedOnRepeat.power, dur: spec.bleedOnRepeat.dur, chance: 100 }, u);
            }
            if (spec.detonateBurn && hasStatus(t, 'burn')) {
              t.statuses = t.statuses.filter(s => s.kind !== 'burn');
              dealDamage(B, u, t, spec.detonateBurn, { kind: 'ult', noCrit: false });
              ev(B, { t: 'detonate', to: t.uid });
            }
            if (spec.chainOnKill && !t.alive) {
              gainEnergy(B, u, spec.chainOnKill.energyRefund || 0);
              const nxt = pickTargets(B, u, 'lowestHp', ctx)[0];
              if (nxt) dealDamage(B, u, nxt, spec.chainOnKill.mult, { kind: 'ult' });
            }
            if (spec.splash) {
              const others = foes(B, u).filter(x => x.uid !== t.uid).sort(() => Math.random() - 0.5).slice(0, spec.splash.count);
              others.forEach(o => { dealDamage(B, u, o, spec.splash.mult, { kind: 'splash' }); applyOnHit(B, u, o, spec.onHit); });
            }
          });
          if (spec.dash && targets[0]) ev(B, { t: 'dash', unit: u.uid, to: targets[0].uid });
        };
        for (let n = 0; n < hits; n++) hitOnce(n);
        for (let n = 0; n < bonusHits; n++) hitOnce(hits + n);
        if (spec.extra) {
          const ext = pickTargets(B, u, spec.extra.target, ctx);
          ext.forEach(t => applyOnHit(B, u, t, spec.extra.status));
        }
        if (spec.selfShield) addShield(B, u, getStat(B, u, 'atk') * spec.selfShield.mult, spec.selfShield.dur || 8);
        return;
      }

      case 'quakeSeries': {
        // staged multi-quake; executes instantly in sim, renderer staggers visuals
        spec.mults.forEach((m, i) => {
          const targets = pickTargets(B, u, spec.target, ctx);
          const last = i === spec.mults.length - 1;
          targets.forEach(t => {
            dealDamage(B, u, t, m, { kind: 'ult' });
            if (last && spec.finalStun) addStatus(B, t, { kind: 'stun', power: 0, dur: spec.finalStun, chance: 100 }, u);
          });
          ev(B, { t: 'quake', step: i, of: spec.mults.length });
        });
        return;
      }

      case 'heal': {
        const targets = pickTargets(B, u, spec.target, ctx);
        const atk = getStat(B, u, 'atk');
        targets.forEach(t => {
          healUnit(B, u, t, atk * spec.mult);
          if (spec.cleanse) t.statuses = t.statuses.filter(s => !['burn', 'poison', 'bleed'].includes(s.kind));
          applyOnHit(B, u, t, spec.onHit);
        });
        return;
      }

      case 'shield': {
        const targets = pickTargets(B, u, spec.target, ctx);
        const atk = getStat(B, u, 'atk');
        targets.forEach(t => addShield(B, t, atk * spec.mult, spec.dur || 6, spec.thornsBurn));
        return;
      }

      case 'selfBuff': {
        if (spec.taunt) addStatus(B, u, { kind: 'taunt', power: 0, dur: spec.taunt, chance: 100 }, u);
        if (spec.shield) addShield(B, u, getStat(B, u, 'atk') * spec.shield.mult, spec.shield.dur || 6);
        (spec.status || []).forEach(st => addStatus(B, u, st, u));
        return;
      }

      case 'debuff': {
        const targets = pickTargets(B, u, spec.target, ctx);
        targets.forEach(t => {
          applyOnHit(B, u, t, spec.status);
          if (spec.energyDrain) t.energy = Math.max(0, t.energy - spec.energyDrain);
        });
        return;
      }
    }
  }

  /* ---------- actions ---------- */
  function doBasic(B, u) {
    const t = defaultTarget(B, u);
    if (!t) return;
    u.basicCount++;
    const melee = isMeleeWeapon(u.model.weapon);
    ev(B, { t: 'basic', from: u.uid, to: t.uid, melee });
    dealDamage(B, u, t, 1.0, { kind: 'basic' });
    gainEnergy(B, u, BASIC_ENERGY);

    const p = u.kit.passive && u.kit.passive.spec;
    if (p) {
      if (p.trigger === 'onBasic' && Math.random() * 100 < (p.chance || 100)) {
        if (p.chain) {
          const others = foes(B, u).filter(x => x.uid !== t.uid);
          if (others.length) {
            const o = others[Math.floor(Math.random() * others.length)];
            ev(B, { t: 'chain', from: u.uid, to: o.uid });
            dealDamage(B, u, o, p.chain.mult, { kind: 'chain' });
          }
        }
        if (p.status && t.alive) applyOnHit(B, u, t, p.status);
        if (p.energy) gainEnergy(B, u, p.energy);
      }
      if (p.trigger === 'everyNBasics' && u.basicCount % p.n === 0) {
        ev(B, { t: 'passive', unit: u.uid, name: u.kit.passive.name });
        if (p.dmg) execSpec(B, u, { type: 'damage', target: p.dmg.target, mult: p.dmg.mult }, {}, { kind: 'passive' });
        if (p.heal) execSpec(B, u, { type: 'heal', target: p.heal.target, mult: p.heal.mult }, {});
      }
    }

    // named-relic on-basic effects
    if (u.itemFx && u.itemFx.length) {
      const eOB = fxSum(u, 'energyOnBasic');
      if (eOB) gainEnergy(B, u, eOB);
      if (t.alive) {
        fxAll(u, 'burnOnHit').forEach(f => addStatus(B, t, { kind: 'burn', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'poisonOnHit').forEach(f => addStatus(B, t, { kind: 'poison', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'bleedOnHit').forEach(f => addStatus(B, t, { kind: 'bleed', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'vampiricOnHit').forEach(f => addStatus(B, t, { kind: 'vampiric', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'stunOnHit').forEach(f => addStatus(B, t, { kind: 'stun', power: 0, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'slowOnHit').forEach(f => addStatus(B, t, { kind: 'slow', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'defShredOnHit').forEach(f => addStatus(B, t, { kind: 'defDown', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'blindOnHit').forEach(f => addStatus(B, t, { kind: 'blind', power: f.power, dur: f.dur, chance: f.chance }, u));
        fxAll(u, 'energyDrainOnHit').forEach(f => {
          if (Math.random() * 100 < (f.chance == null ? 100 : f.chance)) t.energy = Math.max(0, t.energy - f.power);
        });
      }
      // AETHER Echo: the basic attack strikes a second time
      const echo = fxSum(u, 'echoStrike');
      if (echo > 0 && t.alive) {
        ev(B, { t: 'chain', from: u.uid, to: t.uid });
        dealDamage(B, u, t, echo, { kind: 'chain' });
      }
      // every-Nth-basic AoE (Warcry of the Five Regions)
      fxAll(u, 'aoeBasic').forEach(f => {
        if (f.n && u.basicCount % f.n === 0) {
          ev(B, { t: 'passive', unit: u.uid, name: 'Warcry' });
          foes(B, u).forEach(x => dealDamage(B, u, x, f.power, { kind: 'splash' }));
        }
      });
    }
  }

  function doSkill(B, u) {
    const t = defaultTarget(B, u);
    ev(B, { t: 'skill', unit: u.uid, name: u.kit.skill.name });
    execSpec(B, u, u.kit.skill.spec, { current: t }, { kind: 'skill' });
    gainEnergy(B, u, SKILL_ENERGY);
    // named-relic Skill Vamp: casting your skill heals you
    const sv = fxSum(u, 'skillVamp');
    if (sv > 0) healUnit(B, u, u, getStat(B, u, 'atk') * sv / 100);
    u.skillCd = u.kit.skill.cd;
  }

  function castUlt(B, u) {
    if (!u.alive || u.energy < ULT_COST || !u.kit.ult) return false;
    if (hasStatus(u, 'stun')) return false;
    u.energy = 0;
    const t = defaultTarget(B, u);
    ev(B, { t: 'ult', unit: u.uid, name: u.kit.ult.name, side: u.side });
    execSpec(B, u, u.kit.ult.spec, { current: t }, { kind: 'ult' });
    return true;
  }

  /* ---------- tick ---------- */
  function tickStatuses(B, u, dt) {
    // DoTs tick per second
    u.statuses.forEach(s => {
      s.dur -= dt;
      if (['burn', 'poison', 'bleed', 'vampiric'].includes(s.kind)) {
        s.tick += dt;
        while (s.tick >= 1) {
          s.tick -= 1;
          if (hasStatus(u, 'invuln')) continue;
          const dmg = Math.max(1, Math.round(s.srcAtk * s.power * (1 - getStat(B, u, 'def') / (getStat(B, u, 'def') + 400))));
          u.hp -= dmg;
          ev(B, { t: 'dmg', to: u.uid, amount: dmg, crit: false, kind: s.kind, dot: true });
          // Vampiric Curse: every point drained heals the caster's
          // lowest-HP living ally for the same amount.
          if (s.kind === 'vampiric') {
            const caster = B.units.find(x => x.uid === s.srcUid);
            if (caster) {
              const allies = side(B, caster.side);
              const weakest = allies.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
              if (weakest) healUnit(B, caster.alive ? caster : weakest, weakest, dmg);
            }
          }
          if (u.hp <= 0) { checkDeath(B, u, null); }
        }
      }
    });
    u.statuses = u.statuses.filter(s => s.dur > 0);
    u.shields.forEach(s => s.dur -= dt);
    u.shields = u.shields.filter(s => s.dur > 0 && s.amount > 0.5);

    // regen aura (Thornwick)
    const regen = auraOf(B, u, 'regenPct');
    if (regen) {
      u.regenTimer += dt;
      const every = (u.kit.passive.spec.every || 3);
      if (u.regenTimer >= every) {
        u.regenTimer -= every;
        healUnit(B, u, u, u.maxHp * regen);
      }
    }

    // named-relic sustained effects
    if (u.itemFx && u.itemFx.length) {
      const rg = fxSum(u, 'regen');
      if (rg) {
        u.fxRegenTimer += dt;
        if (u.fxRegenTimer >= 3) { u.fxRegenTimer -= 3; healUnit(B, u, u, u.maxHp * rg / 100); }
      }
      // AETHER Starfall: periodic star-strike on a random enemy
      const stars = fxAll(u, 'starfall');
      if (stars.length) {
        const f = stars[0];
        u.starTimer += dt;
        if (u.starTimer >= (f.every || 5)) {
          u.starTimer -= (f.every || 5);
          const f2 = foes(B, u);
          if (f2.length) {
            const t = f2[Math.floor(Math.random() * f2.length)];
            ev(B, { t: 'passive', unit: u.uid, name: 'STARFALL' });
            dealDamage(B, u, t, f.power, { kind: 'skill' });
          }
        }
      }
      // AETHER Chronoshift: speed ramps up over the battle
      const cs = fxAll(u, 'chronoShift');
      if (cs.length) {
        const f = cs[0];
        u.chronoTimer += dt;
        if (u.chronoTimer >= (f.every || 5) && u.chronoBonus < (f.max || 40)) {
          u.chronoTimer -= (f.every || 5);
          u.chronoBonus = Math.min(f.max || 40, u.chronoBonus + (f.power || 3));
        }
      }
    }
  }

  function tick(B, dt) {
    if (B.over) return;
    B.time += dt;

    // Healer emergency all-heal fires the moment a party drops below
    // the aggregate HP threshold (once per battle per healer).
    checkEmergencyHeal(B);

    for (const u of B.units) {
      if (!u.alive) continue;
      tickStatuses(B, u, dt);
      if (!u.alive) continue;
      if (hasStatus(u, 'stun')) continue;

      // skill cooldown (AETHER Time Warp recovers it faster)
      if (u.kit.skill) u.skillCd -= dt * (1 + fxSum(u, 'timeWarp') / 100);

      // auto-ult
      if (u.energy >= ULT_COST && u.kit.ult) {
        const auto = u.side === 'enemy' || B.autoUlt;
        if (auto) { castUlt(B, u); continue; }
      }

      // attack cadence from speed
      const interval = 2.3 / (getStat(B, u, 'spd') / 100);
      u.atkTimer -= dt;
      if (u.atkTimer <= 0) {
        u.atkTimer = interval;
        if (u.kit.skill && u.skillCd <= 0) doSkill(B, u);
        else doBasic(B, u);
      }
    }

    const a = side(B, 'ally').length, e = side(B, 'enemy').length;
    if (!a || !e || B.time >= TIME_LIMIT) {
      B.over = true;
      B.victory = e === 0 && a > 0;
      ev(B, { t: 'end', victory: B.victory });
    }
  }

  function drainEvents(B) { const out = B.events; B.events = []; return out; }

  /* ---------- team builders ---------- */
  function buildAllyUnits(champIds) {
    return champIds.filter(id => State.data.roster[id]).map((id, i) => {
      const def = DATA.CHAMP_BY_ID[id];
      const rc = State.data.roster[id];
      return {
        def, name: def.name, faction: def.faction, role: def.role,
        stats: State.champStats(id), level: rc.level,
        kit: def.kit, model: def.model, slot: i,
        itemFx: State.champItemEffects(id),
      };
    });
  }

  // Enemy wave composition for a campaign stage
  function buildEnemyWave(stage) {
    const info = State.stageInfo(stage);
    const fam = DATA.ENEMY_FAMILIES[info.chapter.family];
    const lvl = DATA.enemyLevelForStage(stage);
    const scale = DATA.enemyScaleForStage(stage);
    const units = Object.values(fam.units);
    const melee = units.filter(x => x.role === 'melee' || x.role === 'tank');
    const ranged = units.filter(x => x.role === 'ranged' || x.role === 'support');

    const mk = (udef, slot, mult, isBoss) => ({
      def: udef, name: udef.name, faction: null, role: udef.role, isBoss,
      stats: {
        hp: Math.round(udef.base.hp * scale * mult),
        atk: Math.round(udef.base.atk * scale * mult),
        def: Math.round(udef.base.def * scale * mult * 0.9),
        spd: udef.base.spd,
        crit: udef.crit,
      },
      level: lvl,
      kit: { skill: udef.skill, ult: udef.ult },
      model: udef.model, slot,
    });

    const wave = [];
    if (info.isBoss) {
      wave.push(mk(fam.boss, 0, 2.0, true));
      wave.push(mk(melee[0] || units[0], 1, 0.85));
      wave.push(mk(ranged[0] || units[0], 2, 0.85));
      wave.push(mk(ranged[Math.min(1, ranged.length - 1)] || units[0], 3, 0.85));
      if (info.chapter.id >= 3) wave.push(mk(melee[Math.min(1, melee.length - 1)] || units[0], 4, 0.85));
    } else if (info.isElite) {
      wave.push(mk(melee[Math.min(1, melee.length - 1)] || melee[0], 0, 1.5, true));
      wave.push(mk(melee[0], 1, 1.0));
      wave.push(mk(ranged[0], 2, 1.0));
      wave.push(mk(ranged[Math.min(1, ranged.length - 1)], 3, 1.0));
    } else {
      const count = Math.min(5, 3 + Math.floor(info.inChapter / 4));
      const picks = [melee[0], melee[Math.min(1, melee.length - 1)], ranged[0], ranged[Math.min(1, ranged.length - 1)], melee[0]];
      for (let i = 0; i < count; i++) wave.push(mk(picks[i % picks.length], i, 1.0));
    }
    return wave;
  }

  function buildTowerWave(floor) {
    const famKeys = Object.keys(DATA.ENEMY_FAMILIES);
    const fam = DATA.ENEMY_FAMILIES[famKeys[(floor - 1) % famKeys.length]];
    const lvl = DATA.towerEnemyLevel(floor);
    const scale = DATA.towerScale(floor);
    const units = Object.values(fam.units);
    const boss = floor % 5 === 0;
    const wave = [];
    const mk = (udef, slot, mult, isBoss) => ({
      def: udef, name: udef.name, faction: null, role: udef.role, isBoss,
      stats: { hp: Math.round(udef.base.hp * scale * mult), atk: Math.round(udef.base.atk * scale * mult), def: Math.round(udef.base.def * scale * mult * 0.9), spd: udef.base.spd, crit: udef.crit },
      level: lvl, kit: { skill: udef.skill, ult: udef.ult }, model: udef.model, slot,
    });
    if (boss) {
      wave.push(mk(fam.boss, 0, 1.8, true));
      for (let i = 1; i < 4; i++) wave.push(mk(units[i % units.length], i, 0.8));
    } else {
      for (let i = 0; i < Math.min(5, 3 + Math.floor(floor / 8)); i++) wave.push(mk(units[i % units.length], i, 1.0));
    }
    return wave;
  }

  // Arena: AI team built from champions near player's power
  function buildArenaTeam(playerPower) {
    const all = DATA.CHAMPIONS.filter(c => ['elite', 'epic', 'mystic'].includes(c.rarity) && !c.paid);
    const picks = all.slice().sort(() => Math.random() - 0.5).slice(0, 5);
    const perChamp = playerPower / 5;
    return picks.map((def, i) => {
      // find level/tier that approximates perChamp power
      let level = 1, tier = 0;
      let best = { level: 1, tier: 0, diff: Infinity };
      for (tier = 0; tier < DATA.TIERS.length; tier++) {
        for (level = 1; level <= DATA.TIERS[tier].cap; level += 3) {
          const m = DATA.TIERS[tier].mult;
          const s = {
            hp: DATA.statAtLevel(def.base.hp, level) * m,
            atk: DATA.statAtLevel(def.base.atk, level) * m,
            def: DATA.statAtLevel(def.base.def, level) * m,
            spd: def.base.spd + level * 0.15, crit: def.crit,
          };
          const pw = s.atk * 4.2 + s.hp * 0.55 + s.def * 5.5 + s.spd * 12 + s.crit * 30;
          const diff = Math.abs(pw - perChamp * (0.92 + Math.random() * 0.16));
          if (diff < best.diff) best = { level, tier, diff };
        }
      }
      const m = DATA.TIERS[best.tier].mult;
      return {
        def, name: def.name, faction: def.faction, role: def.role,
        stats: {
          hp: Math.round(DATA.statAtLevel(def.base.hp, best.level) * m),
          atk: Math.round(DATA.statAtLevel(def.base.atk, best.level) * m),
          def: Math.round(DATA.statAtLevel(def.base.def, best.level) * m),
          spd: def.base.spd + best.level * 0.15, crit: def.crit,
        },
        level: best.level, kit: def.kit, model: def.model, slot: i,
      };
    });
  }

  /* ---------- new game-mode wave builders ---------- */

  // shared: one enemy unit config from a family unit def at a stage-equivalent
  function mkModeUnit(udef, slot, stageEq, mult, isBoss, mods) {
    const lvl = DATA.enemyLevelForStage(stageEq);
    const scale = DATA.enemyScaleForStage(stageEq);
    mods = mods || {};
    return {
      def: udef, name: udef.name, faction: null, role: udef.role, isBoss: !!isBoss,
      stats: {
        hp: Math.round(udef.base.hp * scale * mult * (mods.enemyHp || 1)),
        atk: Math.round(udef.base.atk * scale * mult * (mods.enemyAtk || 1)),
        def: Math.round(udef.base.def * scale * mult * 0.9),
        spd: Math.round(udef.base.spd * (mods.enemySpd || 1)),
        crit: udef.crit + (mods.enemyCrit || 0),
      },
      level: lvl,
      kit: { skill: udef.skill, ult: udef.ult },
      model: udef.model, slot,
    };
  }

  // Boss Rush: a tyrant + honor guard per round; family rotates daily
  function buildBossRushWave(round) {
    const famKeys = Object.keys(DATA.ENEMY_FAMILIES);
    const daySeed = new Date().getDate();
    const fam = DATA.ENEMY_FAMILIES[famKeys[(daySeed + round - 1) % famKeys.length]];
    const stageEq = DATA.BOSSRUSH.stageEq(State.data.campaign.maxStage, round);
    const units = Object.values(fam.units);
    const wave = [mkModeUnit(fam.boss, 0, stageEq, 1.6 + round * 0.15, true)];
    wave.push(mkModeUnit(units[0], 1, stageEq, 0.8));
    wave.push(mkModeUnit(units[Math.min(1, units.length - 1)], 2, stageEq, 0.8));
    return { wave, fam, env: fam.env };
  }

  // Faction Trials: the day's faction defends its home battlefield
  function buildTrialsWave(tier, dayKey) {
    const faction = DATA.TRIALS.factionOfDay(dayKey);
    const famKeys = Object.keys(DATA.ENEMY_FAMILIES);
    let h = 0;
    String(dayKey + faction).split('').forEach(c => { h = (h * 33 + c.charCodeAt(0)) >>> 0; });
    const fam = DATA.ENEMY_FAMILIES[famKeys[h % famKeys.length]];
    const stageEq = DATA.TRIALS.stageEq(State.data.campaign.maxStage, tier);
    const units = Object.values(fam.units);
    const wave = [];
    const isBossTier = tier >= 5;
    if (isBossTier) wave.push(mkModeUnit(fam.boss, 0, stageEq, 1.3, true));
    const count = isBossTier ? 3 : Math.min(5, 3 + Math.floor(tier / 2));
    for (let i = 0; i < count; i++) {
      wave.push(mkModeUnit(units[i % units.length], wave.length, stageEq, 1.0));
    }
    // trials enemies fight under their faction's banner (advantage matters!)
    wave.forEach(u => { u.faction = faction; });
    return { wave, faction, env: DATA.FACTION_ENVS[faction] || 'arena' };
  }

  // Endless Abyss: mixed horrors + corruption modifiers, scaling forever
  function buildAbyssWave(depth) {
    const famKeys = Object.keys(DATA.ENEMY_FAMILIES);
    const stageEq = DATA.ABYSS.stageEq(depth);
    const mods = {};
    DATA.ABYSS.modifiersAt(depth).forEach(m => Object.assign(mods, m));
    const rng = (n) => { let a = depth * 2654435761 + n * 40503; a = (a ^ (a >>> 13)) >>> 0; return a; };
    const wave = [];
    const count = Math.min(5, 3 + Math.floor(depth / 6));
    for (let i = 0; i < count; i++) {
      const fam = DATA.ENEMY_FAMILIES[famKeys[rng(i) % famKeys.length]];
      const units = Object.values(fam.units);
      wave.push(mkModeUnit(units[rng(i + 7) % units.length], i, stageEq, 1.0, false, mods));
    }
    if (depth % 5 === 0) {
      const fam = DATA.ENEMY_FAMILIES[famKeys[rng(99) % famKeys.length]];
      wave[0] = mkModeUnit(fam.boss, 0, stageEq, 1.5, true, mods);
    }
    return { wave, mods: DATA.ABYSS.modifiersAt(depth) };
  }

  // Grand Tournament: rival gladiator teams near your power
  function buildTournamentTeam(playerPower, roundIdx) {
    const mult = DATA.TOURNAMENT.rounds[roundIdx].mult;
    return buildArenaTeam(Math.max(1000, playerPower) * mult);
  }

  // Dungeons (Map of Agdao): themed family boss + escort at ~80% of the
  // player's campaign wall — always beatable, always worth farming.
  // Conquest Tiers raise the stakes; a Golden Loot Wisp may sneak in.
  function buildDungeonWave(dgId) {
    const dg = DATA.DUNGEON_BY_ID[dgId];
    const fam = DATA.ENEMY_FAMILIES[dg.family];
    const tier = (State.data.dungeons.conquest && State.data.dungeons.conquest[dgId]) || 0;
    const stageEq = DATA.DUNGEONS.stageEq(State.data.campaign.maxStage, dg) + DATA.CONQUEST.raidStageBonus(tier);
    const units = Object.values(fam.units);
    const wave = [mkModeUnit(fam.boss, 0, stageEq, 1.25 + tier * 0.06, true)];
    for (let i = 0; i < 3; i++) wave.push(mkModeUnit(units[i % units.length], i + 1, stageEq, 0.85 + tier * 0.04));
    let wisp = false;
    if (Math.random() < DATA.WISP.chance) {
      wisp = true;
      wave.push(mkModeUnit(DATA.WISP_UNIT, 4, stageEq, 0.4));
    }
    return { wave, dg, env: dg.env, stageEq, tier, wisp };
  }

  // Area Warlord: the boss of a raided-out dungeon, fielding its honor
  // guard at FULL strength — beat it to reset raids & raise Conquest Tier.
  function buildWarlordWave(dgId) {
    const dg = DATA.DUNGEON_BY_ID[dgId];
    const fam = DATA.ENEMY_FAMILIES[dg.family];
    const tier = (State.data.dungeons.conquest && State.data.dungeons.conquest[dgId]) || 0;
    const stageEq = DATA.CONQUEST.warlordStageEq(State.data.campaign.maxStage, dg, tier);
    const units = Object.values(fam.units);
    const wave = [mkModeUnit(fam.boss, 0, stageEq, DATA.CONQUEST.warlordMult(tier), true)];
    wave[0].name = 'WARLORD ' + fam.boss.name;
    for (let i = 0; i < 4; i++) wave.push(mkModeUnit(units[i % units.length], i + 1, stageEq, 1.0));
    return { wave, dg, env: dg.env, stageEq, tier };
  }

  return { createBattle, tick, drainEvents, castUlt, buildAllyUnits, buildEnemyWave, buildTowerWave, buildArenaTeam,
    buildBossRushWave, buildTrialsWave, buildAbyssWave, buildTournamentTeam, buildDungeonWave, buildWarlordWave, ULT_COST };
})();
