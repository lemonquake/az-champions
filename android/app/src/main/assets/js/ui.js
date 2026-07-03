/* ============================================================
   AZ CHAMPIONS — UI Layer (screens, modals, battle HUD)
   ============================================================ */
'use strict';

const UI = (() => {

  let currentScreen = 'home';
  let idleTicker = null;
  let pendingOrder = null;
  let battle = null;           // { sim, type, param, speed, ultBtns }
  let heroDetailId = null;
  let formationReturn = null;  // what battle to start after formation confirm
  let rosterSortOrder = 'desc'; // 'desc' = rarest to commonest, 'asc' = commonest to rarest
  let activeRarityFilter = 'all';
  let activeElementFilter = 'all';
  let activeClassFilter = 'all';

  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  /* ---------------- helpers ---------------- */
  function fmt(n) {
    n = Math.floor(n);
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function factionChip(fid) {
    const f = DATA.FACTIONS[fid] || DATA.FACTIONS.fire || DATA.FACTIONS.ember || { color: '#ff6b35', glyph: '🔥', name: 'Fire' };
    return `<span class="chip" style="--c:${f.color}">${f.glyph} ${f.name.split(' ')[0]}</span>`;
  }
  function starsHtml(tier, rarity) {
    const t = DATA.getTierInfo(rarity || 'elite', tier);
    return `<span class="stars" style="color:${t.color}">${'★'.repeat(t.stars)}</span>`;
  }
  function portrait(champId) {
    const def = DATA.CHAMP_BY_ID[champId];
    return Battle3D.renderPortrait(def.model);
  }

  const RARITY_VALUES = {
    common: 1,
    uncommon: 2,
    rare: 3,
    elite: 4,
    epic: 5,
    mystic: 6,
    ultimate: 7,
    legendary: 8
  };

  function rosterSortCompare(aId, bId) {
    const defA = DATA.CHAMP_BY_ID[aId];
    const defB = DATA.CHAMP_BY_ID[bId];
    const valA = RARITY_VALUES[defA.rarity] || 0;
    const valB = RARITY_VALUES[defB.rarity] || 0;
    if (valA !== valB) {
      return rosterSortOrder === 'desc' ? valB - valA : valA - valB;
    }
    const powerA = State.champPower(aId);
    const powerB = State.champPower(bId);
    if (powerA !== powerB) {
      return rosterSortOrder === 'desc' ? powerB - powerA : powerA - powerB;
    }
    const nameCmp = defA.name.localeCompare(defB.name);
    return rosterSortOrder === 'desc' ? nameCmp : -nameCmp;
  }

  /* Active-lineup pinning: the current 5-champion team is ALWAYS locked
     to the top of any roster grid, in formation order, overriding every
     other sort (rarity, power, name). */
  function rosterSortPinned(aId, bId) {
    const f = State.data.formation;
    const ai = f.indexOf(aId), bi = f.indexOf(bId);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return rosterSortCompare(aId, bId);
  }

  function toggleRosterSort() {
    rosterSortOrder = rosterSortOrder === 'desc' ? 'asc' : 'desc';
    show('heroes');
  }

  function toast(msg, cls) {
    const t = document.createElement('div');
    t.className = 'toast ' + (cls || '');
    t.innerHTML = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  function modal(html, opts) {
    opts = opts || {};
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-back ${opts.cls || ''}"><div class="modal">${html}</div></div>`;
    root.style.display = 'block';
    if (!opts.sticky) {
      root.querySelector('.modal-back').addEventListener('click', e => {
        if (e.target.classList.contains('modal-back')) closeModal();
      });
    }
    GameAudio.sfx('open');
  }
  function closeModal() {
    const r = $('#modal-root');
    r.innerHTML = '';
    r.style.display = 'none';
  }


  /* ---------------- topbar ---------------- */
  function refreshTopbar() {
    if (!State.data) {
      $('#topbar').innerHTML = '';
      return;
    }
    const r = State.data.res;
    $('#topbar').innerHTML = `
      <div class="res"><span class="res-ico">💰</span>${fmt(r.gold)}</div>
      <div class="res"><span class="res-ico">📗</span>${fmt(r.xp)}</div>
      <div class="res"><span class="res-ico">💎</span>${fmt(r.diamonds)}</div>
      <div class="res"><span class="res-ico">📜</span>${fmt(r.scrolls)}</div>
      <div class="res dim"><span class="res-ico">✨</span>${fmt(r.dust)}</div>
      <button class="iconbtn" id="settings-btn" onclick="UI.show('settings')">⚙️</button>`;
  }

  /* ---------------- navigation ---------------- */
  const NAV = [
    { id: 'home', label: 'Battle', ico: '⚔️' },
    { id: 'heroes', label: 'Champions', ico: '🛡️' },
    { id: 'summon', label: 'Summon', ico: '✨' },
    { id: 'quests', label: 'Quests', ico: '📜' },
    { id: 'store', label: 'Store', ico: '🛒' },
  ];
  function renderNav() {
    if (!State.data) {
      $('#bottomnav').innerHTML = '';
      return;
    }
    const tabsHtml = NAV.map(n => {
      const badge = navBadge(n.id);
      return `<button class="nav-tab ${currentScreen === n.id ? 'active' : ''}" onclick="UI.show('${n.id}')">
        <span class="nav-ico">${n.ico}${badge ? '<span class="nbadge"></span>' : ''}</span><span class="nav-label">${n.label}</span></button>`;
    }).join('');

    const navEl = $('#bottomnav');
    if (!navEl) return;
    navEl.innerHTML = tabsHtml;
  }

  function navBadge(id) {
    if (id === 'quests') {
      State.ensureQuestDay();
      const claimable = DATA.DAILY_QUESTS.some(q => { const s = State.questState(q); return s.done && !s.claimed; })
        || DATA.QUEST_CHESTS.some(c => State.data.quests.points >= c.at && !State.data.quests.chestsClaimed.includes(c.at));
      return claimable;
    }
    if (id === 'heroes') return State.ownedChampions().some(id2 => State.canAscend(id2));
    if (id === 'store') {
      State.ensureStoreDay();
      return Object.values(State.data.chests || {}).some(n => n > 0) || !State.data.storeState.giftClaimed;
    }
    return false;
  }

  function show(id, param) {
    GameAudio.sfx('tap');
    GameAudio.unlock();
    if (battle && id !== 'battle') endBattleCleanup();
    currentScreen = id;
    clearInterval(idleTicker);

    // Self-healing layout guard: nothing is ever allowed to strand the
    // game frame off-screen (transforms/offsets/scrolls always reset here).
    const frame = document.getElementById('game-frame');
    if (frame) {
      frame.style.transform = '';
      frame.style.left = '';
      frame.style.top = '';
      frame.scrollTop = 0; frame.scrollLeft = 0;
    }
    // A programmatic scroll (input focus, scrollIntoView) can shove the
    // whole page out of view on phones even with body overflow:hidden.
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const app = document.getElementById('app');
      if (app) { app.scrollTop = 0; app.scrollLeft = 0; }
    } catch (e) {}

    document.body.classList.toggle('canvas-show', ['home', 'battle', 'herodetail', 'mainmenu'].includes(id));
    document.body.classList.toggle('in-battle', id === 'battle');

    // Toggle mainmenu-active class on body to hide Topbar/Bottomnav on Main Menu
    document.body.classList.toggle('mainmenu-active', id === 'mainmenu');

    const S = SCREENS[id];
    $('#screens').innerHTML = `<div class="screen screen-${id}">${S.render(param)}</div>`;
    if (S.mount) S.mount(param);
    renderNav();
    refreshTopbar();

    if (['home', 'battle', 'herodetail'].includes(id)) {
      // Force resize immediately after showing screen and mounting diorama
      setTimeout(() => {
        Battle3D.resize();
      }, 0);
    }
  }

  /* ============================================================
     SCREENS
  ============================================================ */
  const SCREENS = {};

  /* ---------------- MAIN MENU (mobile-first, Android build) ----------------
     One portrait-first layout for every device. Big thumb-zone buttons:
     CONTINUE (latest save), NEW GAME (first empty slot), LOAD GAME
     (slide-up sheet with all 6 save files). The 3D champion showcase
     renders behind the menu; without WebGL the gradient still reads fine. */
  let slotsPanelOpen = false;

  function latestSaveSlot() {
    let slot = 0, latest = 0;
    for (let i = 1; i <= 6; i++) {
      const m = State.getSlotMeta(i);
      if (m.exist && m.lastSaved >= latest) { latest = m.lastSaved; slot = i; }
    }
    return slot;
  }

  function mmSlotHtml(i, meta) {
    if (!meta.exist) {
      return `
        <div class="mm-slot empty" onclick="UI.newSlotGame(${i})">
          <div class="mm-slot-num">${i}</div>
          <div class="mm-slot-body">
            <span class="mm-slot-name empty">Empty Slot</span>
            <span class="mm-slot-meta">Tap to start a new game here</span>
          </div>
          <span class="mm-slot-plus">＋</span>
        </div>`;
    }
    const saved = new Date(meta.lastSaved).toLocaleDateString();
    return `
      <div class="mm-slot filled" onclick="UI.loadSlot(${i})">
        <div class="mm-slot-num gold">${i}</div>
        <div class="mm-slot-body">
          <span class="mm-slot-name">${esc(meta.name)}</span>
          <span class="mm-slot-meta">Stage ${esc(State.stageInfo(meta.maxStage).label)} · ⚡ ${fmt(meta.power)} · 💎 ${fmt(meta.diamonds)}</span>
          <span class="mm-slot-date">Saved ${saved}</span>
        </div>
        <div class="mm-slot-btns">
          <button class="mm-slot-play" onclick="event.stopPropagation();UI.loadSlot(${i})">PLAY</button>
          <div class="mm-slot-icons">
            <button class="mm-slot-ico" aria-label="Duplicate" onclick="event.stopPropagation();UI.promptDuplicate(${i})">📋</button>
            <button class="mm-slot-ico danger" aria-label="Delete" onclick="event.stopPropagation();UI.promptDelete(${i})">🗑️</button>
          </div>
        </div>
      </div>`;
  }

  SCREENS.mainmenu = {
    render() {
      const slots = [];
      for (let i = 1; i <= 6; i++) slots.push(State.getSlotMeta(i));
      const filledCount = slots.filter(m => m.exist).length;
      const lastSlot = latestSaveSlot();
      const last = lastSlot ? slots[lastSlot - 1] : null;

      return `
        <div class="mm-root">
          <div class="mm-head">
            <div class="mm-presents">ALJAY L GAMES</div>
            <div class="mm-logo">AZ <span>CHAMPIONS</span></div>
          </div>
          <div class="mm-spacer"></div>
          <div class="mm-actions">
            ${last ? `
            <button class="mm-btn primary" onclick="UI.continueGame()">
              <span class="mm-btn-label">▶ CONTINUE</span>
              <span class="mm-btn-sub">${esc(last.name)} · Stage ${esc(State.stageInfo(last.maxStage).label)}</span>
            </button>` : ''}
            <button class="mm-btn ${last ? '' : 'primary'}" onclick="UI.newGameQuick()">
              <span class="mm-btn-label">⚔️ NEW GAME</span>
              ${last ? '' : '<span class="mm-btn-sub">Begin your adventure</span>'}
            </button>
            <button class="mm-btn" onclick="UI.openSlotsPanel()">
              <span class="mm-btn-label">📂 LOAD GAME</span>
              <span class="mm-btn-count">${filledCount}/6</span>
            </button>
          </div>
          <div class="mm-footer">v1.0.0 (build ${window.AZ_BUILD || '?'}) · © Aljay Leodones</div>

          <div class="mm-sheet" id="mm-sheet">
            <div class="mm-sheet-backdrop" onclick="UI.closeSlotsPanel()"></div>
            <div class="mm-sheet-panel">
              <div class="mm-sheet-head">
                <span class="mm-sheet-title">SAVE FILES</span>
                <button class="mm-sheet-close" aria-label="Close" onclick="UI.closeSlotsPanel()">✕</button>
              </div>
              <div class="mm-slot-list">
                ${slots.map((m, i) => mmSlotHtml(i + 1, m)).join('')}
              </div>
            </div>
          </div>
        </div>`;
    },
    mount() {
      try {
        const defaultIds = ['azrin', 'raphael', 'yoonsul', 'ezekiel', 'azrael'];
        const entries = defaultIds.map(id => ({ model: DATA.CHAMP_BY_ID[id].model }));
        Battle3D.loadShowcase(entries, 'menu', 'plains');
      } catch (e) { /* 3D showcase is optional */ }
      // Re-open the save sheet (no animation) after delete/duplicate re-renders
      if (slotsPanelOpen) {
        const sheet = document.getElementById('mm-sheet');
        if (sheet) sheet.classList.add('open', 'instant');
      }
    }
  };

  /* Direct boot (Aljay, 2026-07-03): the game opens INSIDE the game.
     Newest save wins; a first run silently creates a save in slot 1;
     a corrupted save falls back to a fresh one instead of a dead end.
     The main menu screen still exists (Settings → Main Menu). */
  function bootDirect() {
    let slot = latestSaveSlot();
    const isNew = !slot;
    if (isNew) slot = 1;
    State.setActiveSlot(slot);
    if (isNew || !State.load()) {
      State.newGame();
      State.data.seenIntro = true;
      State.save();
    }
    UI.startGameFlow(isNew, true);
  }

  function continueGame() {
    const slot = latestSaveSlot();
    if (slot) loadSlot(slot);
    else toast('No saved game found', 'bad');
  }

  function newGameQuick() {
    for (let i = 1; i <= 6; i++) {
      if (!State.getSlotMeta(i).exist) { newSlotGame(i); return; }
    }
    openSlotsPanel();
    toast('All 6 slots are full — delete one to start a new game', 'bad');
  }

  function openSlotsPanel() {
    slotsPanelOpen = true;
    const sheet = document.getElementById('mm-sheet');
    if (sheet) { sheet.classList.remove('instant'); sheet.classList.add('open'); }
    GameAudio.sfx('open');
  }

  function closeSlotsPanel() {
    slotsPanelOpen = false;
    const sheet = document.getElementById('mm-sheet');
    if (sheet) sheet.classList.remove('open', 'instant');
  }

  function loadSlot(slot) {
    slotsPanelOpen = false;
    State.setActiveSlot(slot);
    if (State.load()) {
      UI.startGameFlow(false);
    } else {
      toast('Failed to load save file', 'bad');
    }
  }

  function newSlotGame(slot) {
    slotsPanelOpen = false;
    State.setActiveSlot(slot);
    State.newGame();
    UI.startGameFlow(true);
  }

  function promptDelete(slot) {
    modal(`
      <h3>⚠️ Delete Slot ${slot}?</h3>
      <p class="center" style="margin: 10px 0;">This will permanently delete this save file and all its progress.</p>
      <div class="modal-btns">
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
        <button class="btn danger" onclick="UI.confirmDeleteSlot(${slot})">DELETE</button>
      </div>
    `, { sticky: true });
  }

  function confirmDeleteSlot(slot) {
    State.deleteSlot(slot);
    closeModal();
    toast(`Slot ${slot} deleted`, 'good');
    show('mainmenu');
  }

  function promptDuplicate(slot) {
    let listHtml = '';
    for (let i = 1; i <= 6; i++) {
      if (i === slot) continue;
      const targetMeta = State.getSlotMeta(i);
      const label = targetMeta.exist 
        ? `Slot ${i} (${esc(targetMeta.name)} - Stage ${esc(State.stageInfo(targetMeta.maxStage).label)}) <span class="danger-text" style="color: var(--danger); font-weight: bold; margin-left: 5px;">⚠️ OVERWRITE</span>` 
        : `Slot ${i} (Empty)`;
      listHtml += `
        <button class="btn pack" style="width:100%; text-align:left; padding: 12px; margin-bottom: 8px; flex-direction: row; justify-content: flex-start;" onclick="UI.confirmDuplicateSlot(${slot}, ${i})">
          ${label}
        </button>
      `;
    }
    modal(`
      <h3>Duplicate Slot ${slot} to:</h3>
      <p class="center dim" style="margin-bottom: 12px;">Choose a target slot to duplicate your progress.</p>
      <div class="duplicate-list" style="max-height: 250px; overflow-y: auto;">
        ${listHtml}
      </div>
      <div class="modal-btns" style="margin-top: 10px;">
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
      </div>
    `, { sticky: true });
  }

  function confirmDuplicateSlot(src, dest) {
    if (State.duplicateSlot(src, dest)) {
      closeModal();
      toast(`Slot ${src} duplicated to Slot ${dest} ✓`, 'good');
      show('mainmenu');
    } else {
      closeModal();
      toast('Failed to duplicate save', 'bad');
    }
  }

  function backToMainMenu() {
    State.save();
    Battle3D.stop();
    clearInterval(idleTicker);
    State.setActiveSlot(null);
    State.data = null;
    show('mainmenu');
  }

  /* ---------------- HOME ---------------- */
  SCREENS.home = {
    render() {
      const d = State.data;
      const stage = State.currentStage();
      const done = d.campaign.maxStage > DATA.MAX_STAGE;
      const info = State.stageInfo(Math.min(stage, DATA.MAX_STAGE));
      const power = State.teamPower(d.formation);
      return `
        <div class="home-top">
          <div class="home-title">
            <div class="logo">AZ<span>CHAMPIONS</span></div>
            <div class="server">🌐 ${esc(d.player.server)} ${d.player.badges.map(b => `<span class="badge-founder">${b}</span>`).join('')}</div>
          </div>
          <div class="diorama-spacer"></div>
          <div class="team-power">TEAM POWER <b>${fmt(power)}</b></div>
          <button class="btn-edit-team" onclick="UI.openFormation()">⚔ EDIT TEAM</button>
        </div>

        <div class="hud-quick">
          <button class="hq-btn" onclick="UI.openChestManager()">🎁<span>Chests</span>${Object.values(d.chests || {}).some(n => n > 0) ? '<i class="nbadge"></i>' : ''}</button>
          <button class="hq-btn" onclick="UI.show('inventory')">🎒<span>Items</span></button>
          <button class="hq-btn" onclick="UI.show('achievements')">🏅<span>Feats</span>${State.claimableAchievements() > 0 ? '<i class="nbadge"></i>' : ''}</button>
        </div>

        ${(() => { const evt = DATA.eventOfDay(State.dayKey()); return `<div class="event-banner home-event" onclick="UI.show('agdao')">${evt.glyph} <b>REALM EVENT — ${esc(evt.name)}</b><span>${esc(evt.desc)}</span></div>`; })()}

        <div class="home-cards">
          <div class="idle-chest" id="idle-chest" onclick="UI.collectIdle()">
            <div class="chest-ico">🧰</div>
            <div class="chest-info">
              <div class="chest-title">Idle Rewards <span id="idle-cap"></span></div>
              <div class="chest-rates" id="idle-amounts"></div>
              <div class="chest-bar"><div id="idle-bar"></div></div>
            </div>
            <div class="chest-btn">COLLECT</div>
          </div>

          <div class="stage-card">
            <div class="stage-env" style="--env:${(DATA.FACTIONS.fire || DATA.FACTIONS.ember || {color: '#ff6b35'}).color}">
              <div class="stage-ch">${done ? 'CAMPAIGN CLEAR!' : 'CHAPTER ' + info.chapter.id}</div>
              <div class="stage-name">${done ? 'The realm is saved… for now.' : esc(info.chapter.name)}</div>
              <div class="stage-num">${done ? '★' : 'Stage ' + info.label}${info.isBoss && !done ? ' — <b class="bosstag">BOSS</b>' : ''}${info.isElite && !done ? ' — <b class="elitetag">ELITE</b>' : ''}</div>
            </div>
            ${done ? `<button class="btn big gold" onclick="UI.show('tower')">CLIMB THE TOWER</button>`
          : `<button class="btn big gold" onclick="UI.beginBattle('campaign', ${stage})">⚔️ BATTLE</button>`}
            <button class="btn big agdao-btn" onclick="UI.show('agdao')">🗺️ MAP OF AGDAO <small>Choose your battlefield — raid Dungeons</small></button>
            ${State.canSweep() ? `<button class="btn sweep-btn" onclick="UI.doSweep()">⚡ SWEEP STAGE ${esc(State.stageInfo(Math.min(d.campaign.maxStage - 1, DATA.MAX_STAGE)).label)} <small>${State.sweepsLeft()} left today</small></button>` : ''}
          </div>

          <div class="mode-grid">
            <div class="mode-card m-agdao" onclick="UI.show('agdao')">
              <div class="mode-ico">🗺️</div><div class="mode-name">Map of Agdao</div>
              <div class="mode-sub">11 Dungeons across 5 regions + the Rift</div>
            </div>
            <div class="mode-card m-tower" onclick="UI.show('tower')">
              <div class="mode-ico">🗼</div><div class="mode-name">Tower of Trials</div>
              <div class="mode-sub">Floor ${d.tower.floor}</div>
            </div>
            <div class="mode-card m-arena" onclick="UI.show('arena')">
              <div class="mode-ico">🏟️</div><div class="mode-name">Arena</div>
              <div class="mode-sub">${Math.max(0, DATA.ARENA_FREE_FIGHTS - d.arena.fightsToday)} fights left</div>
            </div>
            <div class="mode-card m-bossrush" onclick="UI.show('bossrush')">
              <div class="mode-ico">💀</div><div class="mode-name">Boss Rush</div>
              <div class="mode-sub">${Math.max(0, DATA.BOSSRUSH.attemptsPerDay - d.modes.bossrush.attemptsToday)} runs left</div>
            </div>
            <div class="mode-card m-trials" onclick="UI.show('trials')">
              <div class="mode-ico">${(DATA.FACTIONS[DATA.TRIALS.factionOfDay(State.dayKey())] || {}).glyph || '🎯'}</div><div class="mode-name">Faction Trials</div>
              <div class="mode-sub">Tier ${d.modes.trials.clearedTier}/${DATA.TRIALS.tiers} today</div>
            </div>
            <div class="mode-card m-abyss" onclick="UI.show('abyss')">
              <div class="mode-ico">🕳️</div><div class="mode-name">Endless Abyss</div>
              <div class="mode-sub">Depth ${d.modes.abyss.depth}</div>
            </div>
            <div class="mode-card m-tournament" onclick="UI.show('tournament')">
              <div class="mode-ico">🏆</div><div class="mode-name">Tournament</div>
              <div class="mode-sub">${d.modes.tournament.active ? DATA.TOURNAMENT.rounds[d.modes.tournament.round].name : (d.modes.tournament.entriesToday < DATA.TOURNAMENT.entriesPerDay ? 'Enter today\'s bracket!' : 'Bracket complete')}</div>
            </div>
          </div>
        </div>`;
    },
    mount() {
      // 3D camp diorama with current formation
      const entries = State.data.formation.filter(id => State.data.roster[id])
        .map(id => ({ model: DATA.CHAMP_BY_ID[id].model }));
      if (entries.length) Battle3D.loadShowcase(entries, 'camp', 'plains');
      updateIdleChest();
      idleTicker = setInterval(updateIdleChest, 1000);
    },
  };

  function updateIdleChest() {
    const p = State.idlePending();
    const a = $('#idle-amounts'), b = $('#idle-bar'), c = $('#idle-cap');
    if (!a) return;
    a.innerHTML = `💰 ${fmt(p.gold)} &nbsp; 📗 ${fmt(p.xp)} &nbsp; ✨ ${fmt(p.dust)}`;
    b.style.width = Math.min(100, p.minutes / (DATA.IDLE_CAP_HOURS * 60) * 100) + '%';
    c.innerHTML = p.capped ? '<span class="fullcap">FULL — collect now!</span>' : '';
    const chest = $('#idle-chest');
    if (chest) chest.classList.toggle('full-pulse', p.capped);
  }

  function collectIdle() {
    const p = State.collectIdle();
    GameAudio.sfx('coin');
    toast(`Collected 💰 ${fmt(p.gold)} · 📗 ${fmt(p.xp)} · ✨ ${fmt(p.dust)}`, 'good');
    refreshTopbar(); updateIdleChest(); renderNav();
  }

  /* ---------------- FORMATION ---------------- */
  function openFormation(nextBattle) {
    formationReturn = nextBattle || null;
    show('formation');
  }
  SCREENS.formation = {
    render() {
      const d = State.data;
      const owned = State.ownedChampions().sort(rosterSortPinned);
      const slots = d.formation;
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>Formation</h2></div>
        <div class="formation-layout">
          <div class="formation-left">
            <div class="form-slots">
              ${[0, 1, 2, 3, 4].map(i => {
                const id = slots[i];
                if (!id) return `<div class="fslot empty">${i < 2 ? 'FRONT' : 'BACK'}</div>`;
                const def = DATA.CHAMP_BY_ID[id];
                return `<div class="fslot ${def.rarity}" onclick="UI.toggleFormation('${id}')">
                  <img src="${portrait(id)}" alt="">
                  <div class="hc-rarity-badge">${def.rarity.toUpperCase()}</div>
                  <div class="fslot-name">${esc(def.name)}</div>
                  <div class="fslot-row">${i < 2 ? 'FRONT' : 'BACK'}</div>
                  ${def.rarity === 'legendary' ? '<div class="legendary-sparkles"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : ''}
                </div>`;
              }).join('')}
            </div>
             <div class="hint">Slots 1–2 hold the front row. Tap a Champion to add or remove. Faction advantage: 🔥→🌿→🪨→⚡→🌊→🔥 and ☀️→🌙→🌌→✨→💨→☀️ (+30% damage).</div>
            <div class="preset-bar">
              ${[0, 1, 2].map(i => `<div class="preset-chip ${d.presets && d.presets[i] ? 'saved' : ''}">
                <span>P${i + 1}</span>
                <button class="mini" onclick="UI.presetLoad(${i})">LOAD</button>
                <button class="mini gold" onclick="UI.presetSave(${i})">SAVE</button>
              </div>`).join('')}
              <button class="mini optimize-btn" onclick="UI.doOptimize()">🧠 AUTO-BUILD</button>
            </div>
            <div class="team-power center">TEAM POWER <b>${fmt(State.teamPower(slots))}</b></div>
            ${formationReturn ? `<button class="btn big gold sticky-cta" onclick="UI.confirmFormation()">START BATTLE</button>` : ''}
          </div>
          <div class="formation-right">
            <div class="roster-grid">
              ${owned.map(id => {
                const def = DATA.CHAMP_BY_ID[id];
                const inTeam = slots.includes(id);
                const rc = State.data.roster[id];
                return `<div class="hero-card small ${def.rarity} ${inTeam ? 'selected' : ''}" onclick="UI.toggleFormation('${id}')">
                  <img src="${portrait(id)}" alt="">
                  <div class="hc-copies">x${rc.copies}</div>
                  <div class="hc-power">${fmt(State.champPower(id))}</div>
                  <div class="hc-rarity-badge">${def.rarity.toUpperCase()}</div>
                  <div class="hc-name">${esc(def.name)}</div>
                  ${inTeam ? '<div class="hc-check">✓</div>' : ''}
                  ${def.rarity === 'legendary' ? '<div class="legendary-sparkles"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : ''}
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
    },
  };
  function toggleFormation(id) {
    const f = State.data.formation;
    const idx = f.indexOf(id);
    if (idx >= 0) f.splice(idx, 1);
    else { if (f.length >= 5) { toast('Team is full (5 max)', 'bad'); return; } f.push(id); }
    State.save();
    show('formation');
  }
  function confirmFormation() {
    if (!State.data.formation.length) { toast('Add at least one Champion!', 'bad'); return; }
    const fb = formationReturn; formationReturn = null;
    beginBattle(fb.type, fb.param);
  }

  /* ---------------- BATTLE ---------------- */
  function beginBattle(type, param) {
    const d = State.data;
    if (!d.formation.filter(id => d.roster[id]).length) { openFormation({ type, param }); return; }
    if (type === 'arena') {
      if (d.arena.fightsToday >= DATA.ARENA_FREE_FIGHTS) { toast('No Arena fights left today', 'bad'); return; }
    }

    const allies = Combat.buildAllyUnits(d.formation);
    let enemies, envKey, label, bossArena = false, vs = null, wisp = false;

    if (type === 'campaign') {
      enemies = Combat.buildEnemyWave(param);
      const info = State.stageInfo(param);
      envKey = info.chapter.env;
      bossArena = info.isBoss;
      label = `Stage ${info.label} — ${info.chapter.name}`;
    } else if (type === 'tower') {
      enemies = Combat.buildTowerWave(param);
      envKey = ['crypt', 'volcano', 'abyss', 'foundry', 'void', 'glacier', 'stormspire', 'desert', 'jungle', 'shadowkeep'][(param - 1) % 10];
      bossArena = param % 5 === 0;
      label = `Tower Floor ${param}`;
    } else if (type === 'arena') {
      enemies = param.team;
      envKey = 'arena';
      label = `Arena vs ${param.name}`;
      vs = { rightName: param.name, rightTeam: param.team, rightPower: param.power, sub: 'ARENA DUEL' };
    } else if (type === 'bossrush') {
      const br = Combat.buildBossRushWave(param);
      enemies = br.wave;
      envKey = br.env;
      bossArena = true;
      label = `Boss Rush ${param}/${DATA.BOSSRUSH.rounds} — ${br.fam.boss.name}`;
      State.questProgress('mode1', 1);
    } else if (type === 'trials') {
      const tr = Combat.buildTrialsWave(param, State.dayKey());
      enemies = tr.wave;
      envKey = tr.env;
      bossArena = param >= 5;
      const f = DATA.FACTIONS[tr.faction];
      label = `${f ? f.glyph + ' ' : ''}Faction Trials — Tier ${param}`;
      State.questProgress('mode1', 1);
    } else if (type === 'abyss') {
      const ab = Combat.buildAbyssWave(param);
      enemies = ab.wave;
      envKey = DATA.ABYSS.envAt(param);
      bossArena = param % 5 === 0;
      label = `Endless Abyss — Depth ${param}`;
      State.questProgress('mode1', 1);
    } else if (type === 'dungeon') {
      const dw = Combat.buildDungeonWave(param);
      enemies = dw.wave;
      envKey = dw.env;
      bossArena = true;
      wisp = dw.wisp;
      const region = DATA.AGDAO_REGION_BY_ID[dw.dg.region];
      const tierTag = dw.tier ? ` ★${dw.tier}` : '';
      label = `${dw.dg.glyph} ${dw.dg.name}${tierTag} — ${region ? region.name : 'Agdao'}`;
      if (wisp) setTimeout(() => toast('✨ A GOLDEN LOOT WISP joined the enemy ranks — win to claim its treasure!', 'good'), 900);
      State.questProgress('mode1', 1);
    } else if (type === 'warlord') {
      const ww = Combat.buildWarlordWave(param);
      enemies = ww.wave;
      envKey = ww.env;
      bossArena = true;
      label = `⚔️ AREA WARLORD — ${ww.dg.glyph} ${ww.dg.name}`;
      State.questProgress('mode1', 1);
    } else if (type === 'expedition') {
      const ex = State.expeditionState(param.regionId);
      const ew = Combat.buildExpeditionWave(param.regionId, ex.floor, param.nodeType);
      enemies = ew.wave;
      envKey = ew.env;
      bossArena = param.nodeType === 'boss';
      const rg = DATA.AGDAO_REGION_BY_ID[param.regionId];
      const ni = DATA.EXPEDITION.NODE_INFO[param.nodeType];
      label = `🕳️ Depths of ${rg.name} F${ex.floor} — ${ni.glyph} ${ni.name}`;
      State.questProgress('mode1', 1);
    } else if (type === 'bounty') {
      enemies = Combat.buildEnemyWave(param);
      const binfo = State.stageInfo(param);
      envKey = binfo.chapter.env;
      bossArena = binfo.isBoss;
      label = `🎯 Bounty Hunt — Stage ${binfo.label}`;
    } else if (type === 'tournament') {
      const t = d.modes.tournament;
      const roundIdx = t.round;
      const team = Combat.buildTournamentTeam(State.teamPower(d.formation), roundIdx);
      const rival = (t.rivals && t.rivals[roundIdx]) || (DATA.ARENA_NAMES[Math.floor(Math.random() * DATA.ARENA_NAMES.length)] + '#' + (100 + Math.floor(Math.random() * 900)));
      enemies = team;
      envKey = 'arena';
      bossArena = roundIdx === DATA.TOURNAMENT.rounds.length - 1;
      label = `${DATA.TOURNAMENT.rounds[roundIdx].name} vs ${rival}`;
      param = { roundIdx, rival, team };
      const power = Math.round(team.reduce((tp, u) => tp + u.stats.atk * 4.2 + u.stats.hp * 0.55 + u.stats.def * 5.5 + u.stats.spd * 12 + u.stats.crit * 30, 0));
      vs = { rightName: rival, rightTeam: team, rightPower: power, sub: DATA.TOURNAMENT.rounds[roundIdx].name };
      State.questProgress('mode1', 1);
    }

    const sim = Combat.createBattle(allies, enemies, { autoUlt: d.settings.autoUlt, speed: d.settings.speed });
    battle = { sim, type, param, label, speed: d.settings.speed || 1, resultShown: false, wisp };
    const start = () => {
      show('battle');
      Battle3D.loadBattle(sim, envKey, bossArena);
    };
    if (vs) showVsScreen(vs, start); else start();
  }

  /* ---------------- SPLIT-SCREEN VS INTRO ----------------
     Panels slide in from left/right, divider flashes, VS slams in.
     Used for Arena duels and Tournament matches. Tap to skip. */
  function showVsScreen(cfg, onDone) {
    const d = State.data;
    const el = $('#vs-screen');
    if (!el) { onDone(); return; }
    const myTeam = d.formation.filter(id => d.roster[id]);
    const myPower = State.teamPower(d.formation);
    const leftPortraits = myTeam.map(id => `<img src="${portrait(id)}" alt="">`).join('');
    const rightPortraits = (cfg.rightTeam || []).map(u => `<img src="${Battle3D.renderPortrait(u.model)}" alt="">`).join('');
    el.innerHTML = `
      <div class="vs-panel vs-left">
        <div class="vs-sub">${esc(cfg.sub || 'VERSUS')}</div>
        <div class="vs-name">${esc(d.player.name || 'You')}</div>
        <div class="vs-team">${leftPortraits}</div>
        <div class="vs-power">⚔ ${fmt(myPower)}</div>
      </div>
      <div class="vs-panel vs-right">
        <div class="vs-sub">CHALLENGER</div>
        <div class="vs-name">${esc(cfg.rightName)}</div>
        <div class="vs-team">${rightPortraits}</div>
        <div class="vs-power">⚔ ${fmt(cfg.rightPower || 0)}</div>
      </div>
      <div class="vs-divider"></div>
      <div class="vs-burst">VS</div>
      <div class="vs-skip">TAP TO SKIP</div>`;
    el.classList.add('show');
    GameAudio.sfx('ult');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.remove('show');
      el.classList.add('hide');
      setTimeout(() => { el.className = ''; el.innerHTML = ''; onDone(); }, 300);
    };
    el.onpointerdown = finish;
    setTimeout(finish, 2600);
  }

  SCREENS.battle = {
    render() {
      const d = State.data;
      const allies = battle.sim.units.filter(u => u.side === 'ally');
      return `
        <div class="battle-top">
          <button class="backbtn modern-back" onclick="UI.giveUp()"><span class="arrow">←</span> RETREAT</button>
          <div class="battle-label">${esc(battle.label)}</div>
          <div class="battle-timer" id="battle-timer">90</div>
          <button class="pill ${battle.speed === 2 ? 'on' : ''}" id="speed-btn" onclick="UI.toggleSpeed()">${battle.speed}×</button>
          <button class="pill ${d.settings.autoUlt ? 'on' : ''}" id="auto-btn" onclick="UI.toggleAuto()">AUTO</button>
        </div>
        <div class="ult-banner" id="ult-banner"></div>
        <div class="ult-bar" id="ult-bar">
          ${allies.map(u => `
            <button class="ult-btn" id="ult-${u.uid}" onclick="UI.tryUlt('${u.uid}')">
              <img src="${Battle3D.renderPortrait(u.model)}" alt="">
              <div class="ult-fill" id="ultfill-${u.uid}"></div>
              <div class="ult-ready" id="ultready-${u.uid}">ULT</div>
            </button>`).join('')}
        </div>`;
    },
  };

  function tryUlt(uid) {
    if (!battle) return;
    const u = battle.sim.units.find(x => x.uid === uid);
    if (u && Combat.castUlt(battle.sim, u)) GameAudio.sfx('ult');
  }
  function toggleSpeed() {
    if (!battle) return;
    battle.speed = battle.speed === 1 ? 2 : 1;
    State.data.settings.speed = battle.speed; State.save();
    $('#speed-btn').textContent = battle.speed + '×';
    $('#speed-btn').classList.toggle('on', battle.speed === 2);
  }
  function toggleAuto() {
    if (!battle) return;
    const s = State.data.settings;
    s.autoUlt = !s.autoUlt; State.save();
    battle.sim.autoUlt = s.autoUlt;
    $('#auto-btn').classList.toggle('on', s.autoUlt);
  }
  function giveUp() {
    if (!battle) return;
    finishBattle(false, true);
  }

  const battleHooks = {
    sfx: name => GameAudio.sfx(name),
    ult: (unit, name, sideName) => {
      const b = $('#ult-banner');
      if (!b) return;
      b.innerHTML = `<div class="ub-inner ${sideName}"><b>${esc(unit.name)}</b><span>${esc(name)}</span></div>`;
      b.classList.remove('play'); void b.offsetWidth; b.classList.add('play');
    },
    skill: (unit, name) => {},
    end: victory => { if (battle && !battle.resultShown) finishBattle(victory, false); },
  };

  function tickBattle(dt) {
    if (!battle) return;
    const sim = battle.sim;
    const slowMo = (typeof Battle3D !== 'undefined' && Battle3D.getSlowMo) ? Battle3D.getSlowMo() : 1.0;
    if (!sim.over) Combat.tick(sim, Math.min(dt, 0.05) * battle.speed * slowMo);
    Battle3D.processEvents(Combat.drainEvents(sim), battleHooks);
    // HUD updates
    const timer = $('#battle-timer');
    if (timer) timer.textContent = Math.max(0, Math.ceil(90 - sim.time));
    sim.units.filter(u => u.side === 'ally').forEach(u => {
      const fill = $('#ultfill-' + u.uid), btn = $('#ult-' + u.uid), rd = $('#ultready-' + u.uid);
      if (!fill) return;
      const pct = Math.min(100, u.energy / Combat.ULT_COST * 100);
      fill.style.height = (100 - pct) + '%';
      btn.classList.toggle('ready', u.alive && pct >= 100);
      btn.classList.toggle('dead', !u.alive);
      rd.style.display = (u.alive && pct >= 100) ? 'block' : 'none';
    });
  }

  function finishBattle(victory, surrendered) {
    if (!battle || battle.resultShown) return;
    battle.resultShown = true;
    const d = State.data;
    d.stats.battles++;
    if (victory) d.stats.wins++;
    GameAudio.sfx(victory ? 'victory' : 'defeat');

    let html = '';
    if (battle.type === 'campaign') {
      State.questProgress('campaign3', 1);
      if (victory) {
        const stage = battle.param;
        const { rw, gear, bonusGear } = State.winCampaignStage(stage);
        html = resultHtml(true, `Stage ${State.stageInfo(stage).label} cleared!`, rw, gear);
        if (bonusGear) {
          const br = State.gearRarity(bonusGear);
          html += `<div class="gear-drop bonus-drop" style="--c:${br.color}">🎁 <b>BONUS DROP</b> — ${DATA.GEAR_SLOT_INFO[bonusGear.slot].glyph} <b>${esc(State.gearName(bonusGear))}</b> <span class="raritytag">${br.name}</span></div>`;
        }
        if (rw.unlockedChamp) {
          const c = DATA.CHAMP_BY_ID[rw.unlockedChamp];
          html += `<div class="unlock-banner">🎉 New Champion joined: <b>${esc(c.name)}</b> — ${esc(c.epithet)}!</div>`;
        }
      } else {
        html = resultHtml(false, surrendered ? 'Retreat successful. Regroup and return!' : 'Your team was defeated.');
      }
    } else if (battle.type === 'tower') {
      State.questProgress('tower1', 1);
      if (victory) {
        const rw = State.winTowerFloor(battle.param);
        html = resultHtml(true, `Floor ${battle.param} conquered!`, rw);
      } else html = resultHtml(false, 'The Tower holds… for now.');
    } else if (battle.type === 'arena') {
      State.questProgress('arena1', 1);
      d.arena.fightsToday++;
      const rw = DATA.arenaReward(victory);
      if (victory) { d.arena.wins++; d.arena.rating += 22; } else { d.arena.losses++; d.arena.rating = Math.max(800, d.arena.rating - 15); }
      State.grant(rw);
      html = resultHtml(victory, victory ? `You defeated ${esc(battle.param.name)}! (+22 rating)` : `${esc(battle.param.name)} bested you. (-15 rating)`, rw);
    } else if (battle.type === 'bossrush') {
      const round = battle.param;
      if (victory) {
        const { rw, chest } = State.winBossRushRound(round);
        html = resultHtml(true, `Boss ${round}/${DATA.BOSSRUSH.rounds} slain!`, rw);
        if (chest) {
          const cdef = DATA.CHEST_BY_ID[chest];
          html += `<div class="unlock-banner">🎁 BOSS RUSH CLEARED — you earned a <b style="color:${cdef.color}">${cdef.glyph} ${esc(cdef.name)}</b>! Open it in the Store.</div>`;
        }
      } else {
        d.modes.bossrush.active = false;
        html = resultHtml(false, `The tyrant holds. Your run ends at round ${round - 1 >= 1 ? round - 1 : 0}/${DATA.BOSSRUSH.rounds}.`);
      }
    } else if (battle.type === 'trials') {
      const tier = battle.param;
      if (victory) {
        const rw = State.winTrialsTier(tier);
        html = resultHtml(true, `Trial Tier ${tier} conquered!`, rw);
        if (rw.chest) {
          const cdef = DATA.CHEST_BY_ID[rw.chest];
          html += `<div class="unlock-banner">🎁 ALL TRIALS COMPLETE — <b style="color:${cdef.color}">${cdef.glyph} ${esc(cdef.name)}</b> awarded! Open it in the Store.</div>`;
        }
      } else html = resultHtml(false, 'The faction holds its ground. Counter their element and return!');
    } else if (battle.type === 'abyss') {
      const depth = battle.param;
      if (victory) {
        const rw = State.winAbyssDepth(depth);
        html = resultHtml(true, `Depth ${depth} cleansed!`, rw);
        if (rw.chest) {
          const cdef = DATA.CHEST_BY_ID[rw.chest];
          html += `<div class="unlock-banner">🎁 Milestone loot: <b style="color:${cdef.color}">${cdef.glyph} ${esc(cdef.name)}</b>! Open it in the Store.</div>`;
        }
      } else html = resultHtml(false, 'The Abyss swallows the unprepared. It will be waiting.');
    } else if (battle.type === 'dungeon') {
      const dg = DATA.DUNGEON_BY_ID[battle.param];
      if (victory) {
        const res = State.winDungeon(battle.param);
        const extras = [];
        if (res.tier) extras.push(`⭐ Conquest T${res.tier}`);
        if (res.surge) extras.push('🔥 SURGE ×2');
        if (res.streak > 1) extras.push(`⚡ Momentum ×${res.streak} (+${Math.min(res.streak - 1, 10) * 5}%)`);
        html = resultHtml(true, `${esc(dg.name)} raided!${extras.length ? ' <small class="raid-extras">' + extras.join(' · ') + '</small>' : ''}`, res.rw, res.gear);
        if (res.item) html += relicBannerHtml(res.item, 'RELIC RECOVERED');
        if (battle.wisp) {
          const wb = State.claimWispBonus();
          html += `<div class="unlock-banner wisp-banner">✨ <b>GOLDEN LOOT WISP BURSTS!</b> +💰${fmt(wb.rw.gold)} +✨${fmt(wb.rw.dust)} +💎${fmt(wb.rw.diamonds)}</div>`;
          if (wb.item) html += relicBannerHtml(wb.item, 'WISP TREASURE');
        }
      } else {
        State.breakRaidStreak();
        html = resultHtml(false, 'The dungeon holds — but dungeon retries are FREE. Regroup and raid again!');
      }
    } else if (battle.type === 'warlord') {
      const dg = DATA.DUNGEON_BY_ID[battle.param];
      if (victory) {
        const res = State.winWarlord(battle.param);
        html = resultHtml(true, `The AREA WARLORD of ${esc(dg.name)} falls!`, res.rw);
        html += `<div class="unlock-banner conquest-banner">🏴 <b>CONQUEST TIER ${res.tier}${res.tierUp ? ' REACHED' : ''}</b> — ${esc(dg.name)}'s raids have <b>RESET</b>! Its forces return stronger, carrying rarer spoils.</div>`;
        const cdef = DATA.CHEST_BY_ID['warlord'];
        html += `<div class="unlock-banner">🎁 War spoils: <b style="color:${cdef.color}">${cdef.glyph} ${esc(cdef.name)}</b>! Open it in the Store.</div>`;
        if (res.item) html += relicBannerHtml(res.item, 'WARLORD RELIC');
        if (res.trophy) html += `<div class="unlock-banner trophy-banner">🏆 <b>FIRST CONQUEST TROPHY</b> — +💎${fmt(res.trophy.diamonds)} +📜${res.trophy.scrolls} +✨${fmt(res.trophy.dust)}</div>`;
      } else {
        State.breakRaidStreak();
        html = resultHtml(false, 'The Warlord holds the field — but Warlord challenges are FREE. Regroup and strike again!');
      }
    } else if (battle.type === 'expedition') {
      const { regionId, choiceIdx, nodeType } = battle.param;
      const rg = DATA.AGDAO_REGION_BY_ID[regionId];
      if (victory) {
        const res = State.winExpeditionNode(regionId, choiceIdx, nodeType);
        const ni = DATA.EXPEDITION.NODE_INFO[res.type];
        html = resultHtml(true, `${ni.glyph} ${ni.name} cleared — Depths of ${esc(rg.name)}, Floor ${res.floor}!`, res.rw);
        if (res.item) html += relicBannerHtml(res.item, 'DEPTHS RELIC');
        if (res.ascension) html += ascensionBannerHtml(res.ascension);
        if (res.floorCleared) html += `<div class="unlock-banner conquest-banner">🕳️ <b>FLOOR ${res.floor} CONQUERED!</b> The stairway to <b>FLOOR ${res.floor + 1}</b> grinds open below — deeper foes, better 🌟 ASCENSION odds.</div>`;
      } else {
        html = resultHtml(false, 'The Depths hold — but expedition retries are FREE. Regroup and delve again!');
      }
    } else if (battle.type === 'bounty') {
      const bstage = battle.param;
      if (victory) {
        const res = State.winBounty(bstage);
        if (res) {
          html = resultHtml(true, `🎯 Bounty collected — Stage ${State.stageInfo(bstage).label} pacified!`, res.rw, res.gear);
          if (res.item) html += relicBannerHtml(res.item, 'BOUNTY RELIC');
        } else {
          html = resultHtml(true, 'This bounty was already collected today.');
        }
      } else {
        html = resultHtml(false, 'The mark escapes… the bounty stays open. Try again — attempts are FREE.');
      }
    } else if (battle.type === 'tournament') {
      const { roundIdx, rival } = battle.param;
      if (victory) {
        const { rw, champion } = State.winTournamentRound(roundIdx);
        html = resultHtml(true, `You defeated ${esc(rival)} in the ${DATA.TOURNAMENT.rounds[roundIdx].name}!`, rw);
        if (rw.chest) {
          const cdef = DATA.CHEST_BY_ID[rw.chest];
          html += `<div class="unlock-banner">🎁 Prize chest: <b style="color:${cdef.color}">${cdef.glyph} ${esc(cdef.name)}</b>! Open it in the Store.</div>`;
        }
        if (champion) {
          html += `<div class="unlock-banner">👑 <b>GRAND CHAMPION!</b> The crowd chants your name — GLADIATOR badge earned!</div>`;
        }
      } else {
        d.modes.tournament.active = false;
        html = resultHtml(false, `${esc(rival)} eliminates you from the bracket. Tomorrow, the crown.`);
      }
    }
    State.save();

    const returnScreen = battle.type === 'campaign' ? 'home' : (['dungeon', 'warlord', 'bounty'].includes(battle.type) ? 'agdao' : battle.type);
    const brNext = victory && battle.type === 'bossrush' && battle.param < DATA.BOSSRUSH.rounds;
    const trNext = victory && battle.type === 'trials' && battle.param < DATA.TRIALS.tiers;
    const tourNext = victory && battle.type === 'tournament' && State.data.modes.tournament.active;
    const dgNext = ['dungeon', 'warlord'].includes(battle.type) && State.dungeonRunsLeft(battle.param) > 0;
    const wlNow = battle.type === 'dungeon' && State.dungeonRunsLeft(battle.param) === 0;
    const wlRetry = battle.type === 'warlord' && !victory;
    modal(`
      <div class="result ${victory ? 'win' : 'lose'}">
        <div class="result-title">${victory ? 'VICTORY' : 'DEFEAT'}</div>
        ${html}
        ${!victory && battle.type === 'campaign' ? `<div class="tips">💡 Stuck on this wall? Open the <b>🗺️ Map of Agdao</b> and raid Dungeons — they scale EASIER than your wall and pay out XP, gold, gear and named relics. Power up, then break through!</div>` : ''}
        <div class="modal-btns">
          ${victory && battle.type === 'campaign' && State.data.campaign.maxStage <= DATA.MAX_STAGE ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('campaign', ${State.data.campaign.maxStage})">NEXT STAGE ▶</button>` : ''}
          ${!victory && battle.type === 'campaign' ? `<button class="btn gold" onclick="UI.closeModal();UI.show('agdao')">🗺️ RAID DUNGEONS</button>` : ''}
          ${victory && battle.type === 'tower' ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('tower', ${State.data.tower.floor})">NEXT FLOOR ▶</button>` : ''}
          ${victory && battle.type === 'abyss' ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('abyss', ${State.data.modes.abyss.depth})">DESCEND ▶</button>` : ''}
          ${brNext ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('bossrush', ${battle.param + 1})">NEXT BOSS ▶</button>` : ''}
          ${trNext ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('trials', ${battle.param + 1})">TIER ${battle.param + 1} ▶</button>` : ''}
          ${tourNext ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('tournament')">NEXT MATCH ▶</button>` : ''}
          ${victory && battle.type === 'expedition' ? `<button class="btn gold" onclick="UI.closeModal();UI.show('expedition','${battle.param.regionId}')">🕳️ DELVE ON ▶</button>` : ''}
          ${!victory && battle.type === 'expedition' ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('expedition',{regionId:'${battle.param.regionId}',choiceIdx:${battle.param.choiceIdx || 0},nodeType:'${battle.param.nodeType}'})">⚔️ RETRY — FREE ▶</button>` : ''}
          ${dgNext ? `<button class="btn gold" onclick="UI.closeModal();UI.beginBattle('dungeon','${battle.param}')">⚔️ RAID AGAIN ▶</button>` : ''}
          ${wlNow ? `<button class="btn gold warlord-btn" onclick="UI.closeModal();UI.fightWarlord('${battle.param}')">🏴 CHALLENGE THE AREA WARLORD ▶</button>` : ''}
          ${wlRetry ? `<button class="btn gold warlord-btn" onclick="UI.closeModal();UI.beginBattle('warlord','${battle.param}')">🏴 CHALLENGE AGAIN ▶</button>` : ''}
          <button class="btn" onclick="UI.closeModal();UI.handlePostBattleContinuation('${returnScreen}')">CONTINUE</button>
        </div>
      </div>`, { sticky: true });
  }

  function handlePostBattleContinuation(screen) {
    show(screen);
    const d = State.data;
    if (!d) return;

    d.battlesSinceRemind = (d.battlesSinceRemind || 0) + 1;
    if (!d.nextRemindBattles) {
      d.nextRemindBattles = Math.floor(Math.random() * 5) + 4; // 4 to 8 battles
    }

    if (d.battlesSinceRemind >= d.nextRemindBattles) {
      d.battlesSinceRemind = 0;
      d.nextRemindBattles = Math.floor(Math.random() * 5) + 4;
      State.save();
      setTimeout(() => {
        showEncouragementModal();
      }, 300);
    } else {
      State.save();
    }
  }

  function showEncouragementModal() {
    modal(`
      <div class="reminder-modal">
        <h3 class="center" style="font-size: 18px; margin-bottom: 8px;">🔔 Summoner's Council</h3>
        <p class="center dim" style="margin-bottom: 20px; font-size: 13px;">Great battles demand great preparation! What is your next move?</p>
        
        <div class="reminder-options" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
          <div class="reminder-option-card" onclick="UI.closeModal();UI.show('summon')" style="background: var(--panel2); border: 1px solid var(--edge); border-radius: var(--radius); padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background .15s;">
            <div class="rem-ico" style="font-size: 24px; background: #262b47; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">✨</div>
            <div class="rem-text" style="flex: 1; text-align: left;">
              <b style="font-size: 14px; color: var(--text);">Summon Champions</b>
              <p style="font-size: 11px; color: var(--dim); margin-top: 2px;">Call new elites or get ascension copies at the Gate.</p>
            </div>
            <button class="mini gold" style="pointer-events: none;">SUMMON</button>
          </div>
          
          <div class="reminder-option-card" onclick="UI.closeModal();UI.show('quests')" style="background: var(--panel2); border: 1px solid var(--edge); border-radius: var(--radius); padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background .15s;">
            <div class="rem-ico" style="font-size: 24px; background: #262b47; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">📜</div>
            <div class="rem-text" style="flex: 1; text-align: left;">
              <b style="font-size: 14px; color: var(--text);">Claim Quest Rewards</b>
              <p style="font-size: 11px; color: var(--dim); margin-top: 2px;">Claim daily mission rewards and grab bonus chests.</p>
            </div>
            <button class="mini gold" style="pointer-events: none;">QUESTS</button>
          </div>
          
          <div class="reminder-option-card" onclick="UI.closeModal();UI.show('store')" style="background: var(--panel2); border: 1px solid var(--edge); border-radius: var(--radius); padding: 12px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background .15s;">
            <div class="rem-ico" style="font-size: 24px; background: #262b47; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px;">🛒</div>
            <div class="rem-text" style="flex: 1; text-align: left;">
              <b style="font-size: 14px; color: var(--text);">Visit the Store</b>
              <p style="font-size: 11px; color: var(--dim); margin-top: 2px;">Unlock exclusive hero packs, gear, and diamond deals.</p>
            </div>
            <button class="mini gold" style="pointer-events: none;">STORE</button>
          </div>
        </div>
        
        <div class="modal-btns">
          <button class="btn" style="width: 100%" onclick="UI.closeModal()">MAYBE LATER</button>
        </div>
      </div>
    `, { sticky: true });
  }

  /* banner for a dropped NAMED relic (dungeons, warlords, bounties, wisps) */
  function relicBannerHtml(gRec, headline) {
    const it = DATA.ITEM_BY_ID[gRec.itemId];
    if (!it) return '';
    const ti = DATA.ITEM_TIER_INFO[it.tier];
    return `<div class="unlock-banner relic-banner ${it.tier === 'aether' ? 'aetherfx' : ''}" style="border-color:${ti.color}">
      🌀 <b style="color:${ti.color}">${headline || 'RELIC RECOVERED'} — ${esc(it.name)}</b> <span class="raritytag ${it.tier}" style="color:${ti.color}">${ti.name}</span>
      <br><small>${esc(it.fxDesc)}</small></div>`;
  }

  function resultHtml(victory, msg, rw, gear) {
    let h = `<div class="result-msg">${msg}</div>`;
    if (victory && rw) {
      h += `<div class="reward-row">` +
        (rw.gold ? `<span>💰 ${fmt(rw.gold)}</span>` : '') +
        (rw.xp ? `<span>📗 ${fmt(rw.xp)}</span>` : '') +
        (rw.diamonds ? `<span>💎 ${fmt(rw.diamonds)}</span>` : '') +
        (rw.scrolls ? `<span>📜 ${rw.scrolls}</span>` : '') +
        (rw.dust ? `<span>✨ ${fmt(rw.dust)}</span>` : '') + `</div>`;
      if (gear) {
        const r = State.gearRarity(gear);
        h += `<div class="gear-drop" style="--c:${r.color}">${DATA.GEAR_SLOT_INFO[gear.slot].glyph} <b>${esc(State.gearName(gear))}</b> <span class="raritytag">${r.name}</span></div>`;
      }
      if (rw.bossChestDropped) {
        h += `<div class="unlock-banner" style="background:rgba(255,94,126,0.15); border-color:#ff5e7e; color:#ffb3c1; margin-top:12px;">💀 <b>BOSS SLAIN</b> — you earned a <b>Boss Chest</b>! Open it in the Store.</div>`;
      }
    }
    return h;
  }

  function endBattleCleanup() {
    battle = null;
    Battle3D.stop();
  }

  /* ---------------- HEROES ---------------- */
  SCREENS.heroes = {
    render() {
      const owned = State.ownedChampions().sort(rosterSortPinned);
      
      const sortNotOwnedFn = (defA, defB) => {
        const valA = RARITY_VALUES[defA.rarity] || 0;
        const valB = RARITY_VALUES[defB.rarity] || 0;
        if (valA !== valB) {
          return rosterSortOrder === 'desc' ? valB - valA : valA - valB;
        }
        return defA.name.localeCompare(defB.name);
      };
      const notOwned = DATA.CHAMPIONS.filter(c => !State.data.roster[c.id]).sort(sortNotOwnedFn);
      
      // Filter logic
      const filterFn = (champIdOrDef) => {
        const def = typeof champIdOrDef === 'string' ? DATA.CHAMP_BY_ID[champIdOrDef] : champIdOrDef;
        if (activeRarityFilter !== 'all' && def.rarity !== activeRarityFilter) return false;
        if (activeElementFilter !== 'all' && def.faction !== activeElementFilter) return false;
        if (activeClassFilter !== 'all' && def.role !== activeClassFilter) return false;
        return true;
      };
      
      const filteredOwned = owned.filter(filterFn);
      const filteredNotOwned = notOwned.filter(filterFn);

      const rarities = ['all', 'legendary', 'ultimate', 'mystic', 'epic', 'elite', 'rare', 'uncommon', 'common'];
      const elements = ['all', 'fire', 'nature', 'rock', 'electric', 'water', 'holy', 'dark', 'cosmic', 'aether', 'wind'];
      const classes = ['all', 'Warrior', 'Mage', 'Ranger', 'Tank', 'Support', 'Assassin'];

      const getElementPill = (el) => {
        if (el === 'all') return 'All';
        const f = DATA.FACTIONS[el];
        return f ? `${f.glyph} ${f.name}` : el;
      };

      const getClassPill = (c) => {
        if (c === 'all') return 'All';
        const icons = { Warrior: '⚔️', Mage: '🔮', Ranger: '🏹', Tank: '🛡️', Support: '💚', Assassin: '👣' };
        return `${icons[c] || ''} ${c === 'Ranger' ? 'Marksman' : c}`;
      };

      const rarityRow = `<div class="filter-row">
        <div class="filter-label">Rarity</div>
        <div class="filter-pills">
          ${rarities.map(r => `<div class="filter-pill ${activeRarityFilter === r ? 'active' : ''}" onclick="UI.setHeroFilter('rarity', '${r}')">${r.toUpperCase()}</div>`).join('')}
        </div>
      </div>`;

      const elementRow = `<div class="filter-row">
        <div class="filter-label">Element</div>
        <div class="filter-pills">
          ${elements.map(el => `<div class="filter-pill ${activeElementFilter === el ? 'active' : ''}" onclick="UI.setHeroFilter('element', '${el}')">${getElementPill(el)}</div>`).join('')}
        </div>
      </div>`;

      const classRow = `<div class="filter-row">
        <div class="filter-label">Class</div>
        <div class="filter-pills">
          ${classes.map(c => `<div class="filter-pill ${activeClassFilter === c ? 'active' : ''}" onclick="UI.setHeroFilter('class', '${c}')">${getClassPill(c)}</div>`).join('')}
        </div>
      </div>`;
      
      return `
        <div class="pagehead">
          <h2>Champions <span class="count">${filteredOwned.length}/${DATA.CHAMPIONS.length}</span></h2>
          <button class="mini gold" onclick="UI.toggleRosterSort()">
            Sort: ${rosterSortOrder === 'desc' ? 'Rarest ➔ Commonest ⬇️' : 'Commonest ➔ Rarest ⬆️'}
          </button>
        </div>
        <div class="hero-filter-tabs">
          ${rarityRow}
          ${elementRow}
          ${classRow}
        </div>
        <div class="rarity-legend">
          <div class="legend-item common"><span class="legend-dot"></span> Common</div>
          <div class="legend-item uncommon"><span class="legend-dot"></span> Uncommon</div>
          <div class="legend-item rare"><span class="legend-dot"></span> Rare</div>
          <div class="legend-item elite"><span class="legend-dot"></span> Elite</div>
          <div class="legend-item epic"><span class="legend-dot"></span> Epic</div>
          <div class="legend-item mystic"><span class="legend-dot"></span> Mystic</div>
          <div class="legend-item ultimate"><span class="legend-dot"></span> Ultimate</div>
          <div class="legend-item legendary"><span class="legend-dot"></span> Legendary</div>
        </div>
        <div class="roster-grid">
          ${filteredOwned.map(id => {
            const def = DATA.CHAMP_BY_ID[id];
            const rc = State.data.roster[id];
            const inTeam = State.data.formation.includes(id);
            return `<div class="hero-card ${def.rarity} ${inTeam ? 'selected' : ''}" onclick="UI.show('herodetail','${id}')">
              <img src="${portrait(id)}" alt="">
              <div class="hc-copies">x${rc.copies}</div>
              ${State.canAscend(id) ? '<div class="asc-dot">▲</div>' : ''}
              <div class="hc-stars">${starsHtml(rc.tier, def.rarity)}</div>
              <div class="hc-power">${fmt(State.champPower(id))}</div>
              <div class="hc-rarity-badge">${def.rarity.toUpperCase()}</div>
              <div class="hc-name">${esc(def.name)}</div>
              <div class="hc-lv">Lv ${rc.level}</div>
              <div class="hc-faction" style="--c:${(DATA.FACTIONS[def.faction] || DATA.FACTIONS.fire || DATA.FACTIONS.ember || {color: '#ff6b35'}).color}">${(DATA.FACTIONS[def.faction] || DATA.FACTIONS.fire || DATA.FACTIONS.ember || {glyph: '🔥'}).glyph}</div>
              ${inTeam ? '<div class="hc-check">✓</div><div class="hc-team-ribbon">ACTIVE</div>' : ''}
              ${def.rarity === 'legendary' ? '<div class="legendary-sparkles"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : ''}
            </div>`;
          }).join('')}
          ${filteredNotOwned.map(def => `
            <div class="hero-card locked ${def.rarity}" onclick="UI.lockedInfo('${def.id}')">
              <img src="${portrait(def.id)}" alt="">
              <div class="hc-rarity-badge">${def.rarity.toUpperCase()}</div>
              <div class="hc-name">${esc(def.name)}</div>
              <div class="hc-lock">${def.paid ? '🛒 Store' : '🔒'}</div>
              ${def.rarity === 'legendary' ? '<div class="legendary-sparkles"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : ''}
            </div>`).join('')}
        </div>`;
    },
  };
  function setHeroFilter(group, value) {
    if (group === 'rarity') activeRarityFilter = value;
    else if (group === 'element') activeElementFilter = value;
    else if (group === 'class') activeClassFilter = value;
    show('heroes');
  }

  function lockedInfo(id) {
    const def = DATA.CHAMP_BY_ID[id];
    if (def.paid) { show('store'); toast(`${def.name} is an exclusive Champion — find them in the Store!`); }
    else toast(`${def.name} can be recruited via Summoning ✨`);
  }

  /* ---------------- HERO DETAIL ---------------- */
  SCREENS.herodetail = {
    render(id) {
      heroDetailId = id;
      const def = DATA.CHAMP_BY_ID[id];
      const rc = State.data.roster[id];
      const s = State.champStats(id);
      const cost = DATA.levelUpCost(rc.level);
      const cap = State.champLevelCap(id);
      const atCap = rc.level >= cap;
      const tierCap = State.champTierCap(id);
      const canAsc = State.canAscend(id);
      const ascCost = rc.tier < tierCap ? DATA.ASCEND_COST[rc.tier] : null;
      return `
        <div class="pagehead over3d"><button class="backbtn modern-back" onclick="UI.show('heroes')"><span class="arrow">←</span> BACK</button>
          <h2>${esc(def.name)} <small>${esc(def.epithet)}</small></h2></div>
        <div class="hero-3d-spacer"></div>
        <div class="hero-panel">
          <div class="hero-meta">
            ${factionChip(def.faction)} <span class="chip">${def.role}</span> ${starsHtml(rc.tier, def.rarity)}
            <span class="chip dim" style="background:${DATA.getTierInfo(def.rarity, rc.tier).color}33;color:${DATA.getTierInfo(def.rarity, rc.tier).color}">${DATA.getTierInfo(def.rarity, rc.tier).name}</span>
          </div>
          ${statBarsHtml(id, s)}

          <div class="lvl-row">
            <div class="lvl-label">Level <b>${rc.level}</b> / ${cap}</div>
            ${atCap
              ? `<div class="capnote">${rc.tier < tierCap ? 'Ascend to raise the level cap' : 'Maximum level reached'}</div>`
              : `<button class="btn ${State.canAfford(cost) ? 'gold' : 'disabled'}" onclick="UI.doLevelUp('${id}',1)">LEVEL UP<small>💰${fmt(cost.gold)} 📗${fmt(cost.xp)}</small></button>
                 <button class="btn ${State.canAfford(cost) ? '' : 'disabled'}" onclick="UI.doLevelUp('${id}',10)">×10</button>`}
          </div>

          <div class="asc-row">
            <div>Ascension: <b style="color:${DATA.getTierInfo(def.rarity, rc.tier).color}">${DATA.getTierInfo(def.rarity, rc.tier).name}</b>
              ${ascCost !== null ? `<span class="dim">· copies ${rc.copies}/${ascCost}</span>` : '<span class="dim">· MAX</span>'}</div>
            ${ascCost !== null ? `<button class="btn ${canAsc ? 'gold' : 'disabled'}" onclick="UI.doAscend('${id}')">ASCEND ▲</button>` : ''}
          </div>

          <h3>Gear</h3>
          <div class="gear-slots">
            ${DATA.GEAR_SLOTS.map(slot => {
              const gid = rc.gear[slot];
              const info = DATA.GEAR_SLOT_INFO[slot];
              if (!gid || !State.data.gear[gid]) return `<div class="gslot empty" onclick="UI.openGearPicker('${id}','${slot}')">
                <div class="g-ico">${info.glyph}</div><div class="g-name dim">${info.name}</div><div class="g-plus">＋</div></div>`;
              const g = State.data.gear[gid];
              const r = State.gearRarity(g);
              return `<div class="gslot" style="--c:${r.color}" onclick="UI.openGearPicker('${id}','${slot}')">
                <div class="g-ico">${info.glyph}</div>
                <div class="g-name">${esc(State.gearName(g))} <b>+${g.level}</b></div>
                <div class="g-stat">+${State.gearStatValue(g)} ${info.main.toUpperCase()}</div></div>`;
            }).join('')}
          </div>

          <h3>Abilities</h3>
          <div class="skill-list">
            <div class="skill"><div class="sk-type pass">PASSIVE</div><b>${esc(def.kit.passive.name)}</b><p>${esc(def.kit.passive.desc)}</p></div>
            <div class="skill"><div class="sk-type">SKILL · ${def.kit.skill.cd}s</div><b>${esc(def.kit.skill.name)}</b><p>${esc(def.kit.skill.desc)}</p></div>
            <div class="skill"><div class="sk-type ult">ULTIMATE</div><b>${esc(def.kit.ult.name)}</b><p>${esc(def.kit.ult.desc)}</p></div>
          </div>

          <h3>Lore</h3>
          <p class="lore">${esc(def.lore)}</p>
        </div>`;
    },
    mount(id) {
      const def = DATA.CHAMP_BY_ID[id];
      Battle3D.loadShowcase([{ model: def.model }], 'solo', 'arena');
      animateStatBars();
    },
  };

  /* ---------------- ANIMATED STAT BARS ----------------
     Bars fill and numbers count up, staggered — every champion's
     sheet feels like a title reveal. Scaled against your roster's best. */
  function statBarsHtml(id, s) {
    const maxima = rosterStatMaxima();
    const rows = [
      { key: 'power', label: 'POWER', value: State.champPower(id), max: maxima.power, color: '#f5c542', fmt: v => fmt(v) },
      { key: 'hp',    label: 'HP',    value: s.hp,   max: maxima.hp,   color: '#52c97a', fmt: v => fmt(v) },
      { key: 'atk',   label: 'ATK',   value: s.atk,  max: maxima.atk,  color: '#ff6b6b', fmt: v => fmt(v) },
      { key: 'def',   label: 'DEF',   value: s.def,  max: maxima.def,  color: '#38b6ff', fmt: v => fmt(v) },
      { key: 'spd',   label: 'SPD',   value: s.spd,  max: maxima.spd,  color: '#b45cff', fmt: v => (Math.round(v * 10) / 10) },
      { key: 'crit',  label: 'CRIT',  value: s.crit, max: Math.max(maxima.crit, 40), color: '#ff9d2e', fmt: v => (Math.round(v * 10) / 10) + '%' },
    ];
    return `<div class="stat-bars">
      ${rows.map((r, i) => {
        const pct = Math.max(4, Math.min(100, r.value / Math.max(1, r.max) * 100));
        return `<div class="sbar" style="--sc:${r.color};--sd:${i * 0.09}s">
          <div class="sbar-top"><span class="sbar-label">${r.label}</span>
            <b class="sbar-num" data-val="${r.value}" data-kind="${r.key}">0</b></div>
          <div class="sbar-track"><div class="sbar-fill" data-pct="${pct}"></div></div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function rosterStatMaxima() {
    const m = { power: 1, hp: 1, atk: 1, def: 1, spd: 1, crit: 1 };
    State.ownedChampions().forEach(cid => {
      const st = State.champStats(cid);
      m.power = Math.max(m.power, State.champPower(cid));
      m.hp = Math.max(m.hp, st.hp);
      m.atk = Math.max(m.atk, st.atk);
      m.def = Math.max(m.def, st.def);
      m.spd = Math.max(m.spd, st.spd);
      m.crit = Math.max(m.crit, st.crit);
    });
    return m;
  }

  function animateStatBars() {
    const fills = $$('.sbar-fill');
    const nums = $$('.sbar-num');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fills.forEach(f => { f.style.width = f.dataset.pct + '%'; });
    }));
    const t0 = performance.now();
    const dur = 950;
    function step(now) {
      if (!document.body.contains(nums[0])) return;
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      nums.forEach(n => {
        const target = parseFloat(n.dataset.val);
        const v = target * e;
        if (n.dataset.kind === 'crit') n.textContent = (Math.round(v * 10) / 10) + '%';
        else if (n.dataset.kind === 'spd') n.textContent = String(Math.round(v * 10) / 10);
        else n.textContent = fmt(v);
      });
      if (k < 1) requestAnimationFrame(step);
    }
    if (nums.length) requestAnimationFrame(step);
  }
  function doLevelUp(id, times) {
    const done = State.levelUp(id, times);
    if (done > 0) { GameAudio.sfx('levelup'); toast(`+${done} level${done > 1 ? 's' : ''}!`, 'good'); }
    else GameAudio.sfx('error');
    show('herodetail', id);
  }
  function doAscend(id) {
    if (State.ascend(id)) {
      GameAudio.sfx('elite');
      const rc = State.data.roster[id];
      const def = DATA.CHAMP_BY_ID[id];
      const tInfo = DATA.getTierInfo(def.rarity, rc.tier);
      modal(`<div class="result win"><div class="result-title" style="color:${tInfo.color}">ASCENDED!</div>
        <div class="result-msg"><b>${esc(def.name)}</b> is now <b style="color:${tInfo.color}">${tInfo.name}</b>!<br>Level cap raised to ${DATA.TIERS[rc.tier].cap}.</div>
        <div class="modal-btns"><button class="btn gold" onclick="UI.closeModal();UI.show('herodetail','${id}')">EXCELLENT</button></div></div>`, { sticky: true });
    }
  }

  /* ---------------- GEAR PICKER ---------------- */
  function openGearPicker(champId, slot) {
    const rc = State.data.roster[champId];
    const equippedId = rc.gear[slot];
    const info = DATA.GEAR_SLOT_INFO[slot];
    const list = Object.values(State.data.gear)
      .filter(g => g.slot === slot)
      .filter(g => {
        const holder = State.gearEquippedBy(g.id);
        return !holder || holder === champId;
      })
      .sort((a, b) => State.gearStatValue(b) - State.gearStatValue(a));
    modal(`
      <h3>${info.glyph} ${info.name}</h3>
      <div class="gear-list">
        ${list.length ? list.map(g => {
          const r = State.gearRarity(g);
          const holder = State.gearEquippedBy(g.id);
          const isMine = g.id === equippedId;
          const enh = DATA.gearEnhanceCost(g.level);
          const itemDef = g.itemId && DATA.ITEM_BY_ID[g.itemId];
          const canEq = State.canEquipGear(champId, g.id);
          const reqChips = itemDef && (itemDef.levelReq || itemDef.classReq)
            ? `<div class="gi-reqs">${itemDef.levelReq ? `<span class="req-chip ${State.data.roster[champId].level >= itemDef.levelReq ? 'met' : 'unmet'}">🌟 Lv ${itemDef.levelReq}</span>` : ''}${itemDef.classReq ? `<span class="req-chip ${DATA.roleMatches(DATA.CHAMP_BY_ID[champId].role, itemDef.classReq) ? 'met' : 'unmet'}">${DATA.ROLE_INFO[itemDef.classReq].glyph} ${DATA.ROLE_INFO[itemDef.classReq].name} only</span>` : ''}</div>`
            : '';
          return `<div class="gear-item ${isMine ? 'mine' : ''} ${g.rarity === 'aether' ? 'aetherfx' : ''} ${g.rarity === 'ascension' ? 'ascendfx' : ''}" style="--c:${r.color}">
            <div class="gi-main">
              <b>${esc(State.gearName(g))} +${g.level}</b>
              <span class="raritytag ${g.rarity}" style="color:${r.color}">${r.name}</span>
              ${isMine ? '<span class="equipped-tag">✓ EQUIPPED</span>' : ''}
              <div class="gi-stat">+${State.gearStatValue(g)} ${info.main.toUpperCase()}${holder && !isMine ? ` · <i>on ${esc(DATA.CHAMP_BY_ID[holder].name)}</i>` : ''}</div>
              ${itemDef ? `<div class="gi-fx">✦ ${esc(itemDef.fxDesc)}</div>` : ''}
              ${reqChips}
            </div>
            <div class="gi-btns">
              ${isMine
                ? `<button class="mini" onclick="UI.gearUnequip('${champId}','${slot}')">UNEQUIP</button>`
                : canEq.ok
                  ? `<button class="mini gold" onclick="UI.gearEquip('${champId}','${g.id}')">EQUIP</button>`
                  : `<button class="mini locked" onclick="UI.gearEquipBlocked('${g.id}','${champId}')">🔒 EQUIP</button>`}
              ${g.level < DATA.GEAR_MAX_LEVEL ? `<button class="mini ${State.canAfford(enh) ? '' : 'disabled'}" onclick="UI.gearEnhance('${champId}','${slot}','${g.id}')">+1 <small>💰${fmt(enh.gold)} ✨${enh.dust}</small></button>` : '<span class="dim">MAX</span>'}
              ${!holder && !g.exclusiveId ? `<button class="mini danger" onclick="UI.gearSalvage('${champId}','${slot}','${g.id}')">♻</button>` : ''}
            </div>
          </div>`;
        }).join('') : `<div class="dim center pad">No ${info.name.toLowerCase()} yet — gear drops from campaign stages (guaranteed on elite/boss stages).</div>`}
      </div>
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">CLOSE</button></div>`);
  }
  /* NOTE: the screen behind is re-rendered AND the picker modal is
     re-opened — without the re-open, the freshly equipped item kept
     showing a stale "EQUIP" button instead of "✓ EQUIPPED". */
  function gearEquip(champId, gearId) {
    const g = State.data.gear[gearId];
    if (!State.equipGear(champId, gearId)) {
      const chk = State.canEquipGear(champId, gearId);
      GameAudio.sfx('error'); toast(chk.reason || 'Cannot equip', 'bad'); return;
    }
    GameAudio.sfx('coin');
    toast('✓ Equipped!', 'good');
    show('herodetail', champId);
    openGearPicker(champId, g.slot);
  }
  function gearUnequip(champId, slot) {
    State.unequipGear(champId, slot);
    show('herodetail', champId);
    openGearPicker(champId, slot);
  }
  function gearEquipBlocked(gearId, champId) {
    const chk = State.canEquipGear(champId, gearId);
    GameAudio.sfx('error');
    toast(chk.reason || 'Cannot equip', 'bad');
  }
  function gearEnhance(champId, slot, gearId) {
    if (State.enhanceGear(gearId)) { GameAudio.sfx('levelup'); openGearPicker(champId, slot); refreshTopbar(); }
    else GameAudio.sfx('error');
  }
  function gearSalvage(champId, slot, gearId) {
    if (State.salvageGear(gearId)) { GameAudio.sfx('coin'); toast('Salvaged for dust & gold', 'good'); openGearPicker(champId, slot); refreshTopbar(); }
  }

  /* ---------------- SUMMON ---------------- */
  SCREENS.summon = {
    render() {
      const d = State.data;
      const pityLeft = DATA.SUMMON.pity - d.pity;
      return `
        <div class="pagehead"><h2>Summon</h2></div>
        <div class="summon-layout">
          <div class="banner">
            <div class="banner-art">
              <div class="banner-glow"></div>
              <div class="banner-title">GATE OF CHAMPIONS</div>
              <div class="banner-sub">Elite/Legendary rate: <b>${DATA.SUMMON.eliteRate}%</b> · Guaranteed Elite/Legendary within <b>${DATA.SUMMON.pity}</b> pulls</div>
              <div class="pity">Pity: <b>${d.pity}</b>/${DATA.SUMMON.pity} <span class="dim">(${pityLeft} until guaranteed Elite/Legendary)</span></div>
            </div>
            <div class="summon-btns">
              <button class="btn big ${d.res.scrolls >= 1 ? 'gold' : 'disabled'}" onclick="UI.doSummon(1)">SUMMON ×1<small>📜 1</small></button>
              <button class="btn big ${d.res.scrolls >= 10 ? 'gold' : 'disabled'}" onclick="UI.doSummon(10)">SUMMON ×10<small>📜 10</small></button>
            </div>
            <div class="hint center">Need scrolls? 💎${DATA.SUMMON.scrollCostDiamonds} each in the <a onclick="UI.show('store')">Store</a>.
            Duplicates become <b>copies</b> used to Ascend Champions to higher star tiers.</div>
          </div>
          <div class="rates-note">
            <h3>Drop rates</h3>
            <p>Legendary Champion 0.7% · Elite Champion 3.9% · Rare Champion ${(100 - DATA.SUMMON.eliteRate).toFixed(1)}%.
            Every pull advances pity; pulling an Elite or Legendary resets it. Exclusive Champions (Ivcan, Lemon Quake, Aljay) are not in the summon pool — they are Store exclusives.</p>
          </div>
        </div>`;
    },
  };
  const HIGH_RARITIES = ['elite', 'epic', 'mystic', 'ultimate', 'legendary'];

  function doSummon(count) {
    const d = State.data;
    if (d.res.scrolls < count) { GameAudio.sfx('error'); toast('Not enough Summon Scrolls', 'bad'); return; }
    GameAudio.sfx('summon');
    const results = [];
    for (let i = 0; i < count; i++) {
      const r = State.summonOne();
      if (!r) break;
      results.push(r);
    }
    refreshTopbar();
    playSummonCinematic(results, count);
  }

  /* ---------------- SUMMON CINEMATIC ----------------
     Epic skippable gate sequence: rune portal charges up, cards fly
     out one by one and flip; high rarities flare. Tap SKIP anytime. */
  function playSummonCinematic(results, count) {
    const el = $('#summon-cinema');
    if (!el || !results.length) { summonResultsModal(results, count); return; }
    const best = results.reduce((b, r) => Math.max(b, RARITY_VALUES[r.rarity] || 0), 0);
    const bestDef = { 4: '#f5c542', 5: '#b45cff', 6: '#00e5ff', 7: '#ff9100', 8: '#ff3355' }[best] || '#7cf5ff';
    el.innerHTML = `
      <div class="sc-stage ${best >= 8 ? 'legendary-gate' : best >= 7 ? 'ultimate-gate' : ''}" style="--pc:${bestDef}">
        <div class="sc-portal">
          <div class="sc-ring r1"></div>
          <div class="sc-ring r2"></div>
          <div class="sc-ring r3"></div>
          <div class="sc-core"></div>
          ${Array.from({ length: 14 }, (_, i) => `<span class="sc-spark" style="--i:${i}"></span>`).join('')}
        </div>
        <div class="sc-title">THE GATE ANSWERS…</div>
        <div class="sc-cards n${results.length}"></div>
        <button class="sc-skip">SKIP ⏭</button>
      </div>`;
    el.classList.add('show');

    let finished = false;
    const timers = [];
    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      el.classList.remove('show');
      el.innerHTML = '';
      summonResultsModal(results, count);
    };
    el.querySelector('.sc-skip').addEventListener('pointerdown', e => { e.stopPropagation(); finish(); });

    const host = el.querySelector('.sc-cards');
    const stagger = results.length > 1 ? 380 : 650;
    results.forEach((r, i) => {
      timers.push(setTimeout(() => {
        if (finished || !host) return;
        const def = DATA.CHAMP_BY_ID[r.id];
        const high = HIGH_RARITIES.includes(r.rarity);
        const card = document.createElement('div');
        card.className = `sc-card ${r.rarity} ${high ? 'high' : ''}`;
        card.innerHTML = `
          <div class="scc-inner">
            <div class="scc-back">AZ</div>
            <div class="scc-front">
              <img src="${portrait(r.id)}" alt="">
              <div class="scc-name">${esc(def.name)}</div>
              <div class="scc-rar">${r.rarity.toUpperCase()}${r.result === 'dupe' ? ' +1' : ' · NEW'}</div>
            </div>
          </div>
          ${high ? '<div class="scc-burst"></div>' : ''}`;
        host.appendChild(card);
        GameAudio.sfx(high ? 'elite' : 'open');
        if (RARITY_VALUES[r.rarity] >= 7) {
          const stage = el.querySelector('.sc-stage');
          if (stage) { stage.classList.remove('flash'); void stage.offsetWidth; stage.classList.add('flash'); }
        }
      }, 1250 + i * stagger));
    });
    timers.push(setTimeout(finish, 1250 + results.length * stagger + 1500));
  }

  function summonResultsModal(results, count) {
    const d = State.data;
    const anyElite = results.some(r => HIGH_RARITIES.includes(r.rarity));
    if (anyElite) GameAudio.sfx('elite');
    modal(`
      <h3 class="center">✨ Summoning Results</h3>
      <div class="summon-grid n${results.length}">
        ${results.map((r, i) => {
          const def = DATA.CHAMP_BY_ID[r.id];
          return `<div class="scard ${r.rarity}" style="animation-delay:${i * 0.12}s">
            <div class="scard-inner">
              <div class="scard-back">AZ</div>
              <div class="scard-front">
                <img src="${portrait(r.id)}" alt="">
                <div class="hc-rarity-badge">${def.rarity.toUpperCase()}</div>
                <div class="sc-name">${esc(def.name)}</div>
                <div class="sc-tag">${r.rarity.toUpperCase()}${r.result === 'dupe' ? ' · +1 copy' : ' · NEW!'}</div>
                ${r.rarity === 'legendary' ? '<div class="legendary-sparkles"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>' : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="modal-btns">
        <button class="btn" onclick="UI.closeModal();UI.show('summon')">DONE</button>
        ${d.res.scrolls >= count ? `<button class="btn gold" onclick="UI.closeModal();UI.doSummon(${count})">AGAIN ×${count}</button>` : ''}
      </div>`, { sticky: true });
  }

  /* ---------------- QUESTS ---------------- */
  SCREENS.quests = {
    render() {
      State.ensureQuestDay();
      const q = State.data.quests;
      return `
        <div class="pagehead"><h2>Daily Quests</h2><div class="qpoints">⭐ ${q.points}/100</div></div>
        <div class="chest-track">
          ${DATA.QUEST_CHESTS.map(c => {
            const claimed = q.chestsClaimed.includes(c.at);
            const ready = q.points >= c.at && !claimed;
            return `<div class="qchest ${claimed ? 'claimed' : ''} ${ready ? 'ready' : ''}" onclick="UI.claimChest(${c.at})">
              <div class="qc-ico">${claimed ? '✅' : '🎁'}</div><div class="qc-at">${c.at}</div></div>`;
          }).join('')}
          <div class="track-bar"><div style="width:${q.points}%"></div></div>
        </div>
        <div class="quest-list">
          ${DATA.DAILY_QUESTS.map(qd => {
            const s = State.questState(qd);
            return `<div class="quest ${s.claimed ? 'claimed' : ''}">
              <div class="q-info"><b>${esc(qd.name)}</b><p>${esc(qd.desc)} <span class="dim">(${s.prog}/${qd.goal})</span></p></div>
              <div class="q-pts">⭐${qd.points}</div>
              ${s.claimed ? '<div class="q-done">✓</div>'
                : s.done ? `<button class="btn mini gold" onclick="UI.claimQuest('${qd.id}')">CLAIM</button>`
                : `<div class="q-bar"><div style="width:${s.prog / qd.goal * 100}%"></div></div>`}
            </div>`;
          }).join('')}
        </div>
        <div class="hint center">Quests reset daily. Earn ⭐ to open all five chests!</div>`;
    },
  };
  function claimQuest(qid) {
    if (State.claimQuest(qid)) { GameAudio.sfx('coin'); show('quests'); }
  }
  function claimChest(at) {
    const rw = State.claimChest(at);
    if (rw) {
      GameAudio.sfx('buy');
      toast('Chest opened! ' + Object.keys(rw).map(k => `${{ gold: '💰', xp: '📗', diamonds: '💎', scrolls: '📜', dust: '✨' }[k]} ${fmt(rw[k])}`).join(' '), 'good');
      show('quests');
    }
  }

  /* ============================================================
     MAP OF AGDAO — the realm map. Five painted regions + the
     pulsing Rift of Leodones. Tap a region, pick a dungeon, RAID.
     This is the anti-stuck valve: dungeons scale at ~80% of your
     campaign wall and pay focused loot (XP/gold/dust/gear/relics).
  ============================================================ */
  let agdaoSel = null;

  function agdaoDefaultRegion() {
    const ms = State.data.campaign.maxStage;
    const unlocked = DATA.AGDAO.regions.filter(r => ms >= r.unlockStage);
    return unlocked.length ? unlocked[unlocked.length - 1].id : DATA.AGDAO.regions[0].id;
  }

  /* hand-painted SVG geography: [cx, cy, rx, ry] per region + detail dots */
  const AGDAO_GEO = {
    newsalmon: { cx: 200, cy: 398, rx: 108, ry: 74, deco: ['🐟', '⛵'] },
    palandine: { cx: 188, cy: 208, rx: 104, ry: 80, deco: ['🌋', '⚒️'] },
    astorvia:  { cx: 408, cy: 240, rx: 112, ry: 86, deco: ['🏰', '🌾'] },
    aespo:     { cx: 596, cy: 156, rx: 106, ry: 74, deco: ['⛰️', '🌩️'] },
    jeehva:    { cx: 592, cy: 372, rx: 106, ry: 82, deco: ['🌴', '🍄'] },
    rift:      { cx: 404, cy: 474, rx: 74,  ry: 46, deco: [] },
  };

  SCREENS.agdao = {
    render() {
      const ms = State.data.campaign.maxStage;
      if (!agdaoSel) agdaoSel = agdaoDefaultRegion();
      const selR = DATA.AGDAO_REGION_BY_ID[agdaoSel] || DATA.AGDAO.regions[0];

      const regionSvg = DATA.AGDAO.regions.map(r => {
        const g = AGDAO_GEO[r.id];
        const locked = ms < r.unlockStage;
        const sel = r.id === agdaoSel;
        const dgs = DATA.DUNGEONS.list.filter(d => d.region === r.id);
        if (r.rift) {
          return `
          <g class="ag-region ag-rift ${sel ? 'sel' : ''} ${locked ? 'locked' : ''}" onclick="UI.selectRegion('${r.id}')">
            <ellipse class="rift-outer" cx="${g.cx}" cy="${g.cy}" rx="${g.rx}" ry="${g.ry}" fill="url(#agRift)"/>
            <ellipse class="rift-ring" cx="${g.cx}" cy="${g.cy}" rx="${g.rx * 0.72}" ry="${g.ry * 0.72}" fill="none" stroke="#7cf5ff" stroke-width="1.6" stroke-dasharray="10 8"/>
            <ellipse class="rift-core" cx="${g.cx}" cy="${g.cy}" rx="${g.rx * 0.34}" ry="${g.ry * 0.34}" fill="#eafcff"/>
            <text class="ag-glyph" x="${g.cx}" y="${g.cy - g.ry - 12}" text-anchor="middle">${r.glyph}</text>
            <text class="ag-name rift-name" x="${g.cx}" y="${g.cy + g.ry + 22}" text-anchor="middle">${esc(r.name.toUpperCase())}</text>
            ${locked ? `<text class="ag-lock" x="${g.cx}" y="${g.cy + 5}" text-anchor="middle">🔒 Stage ${State.stageInfo(r.unlockStage).label}</text>` : ''}
          </g>`;
        }
        return `
        <g class="ag-region ${sel ? 'sel' : ''} ${locked ? 'locked' : ''}" onclick="UI.selectRegion('${r.id}')">
          <ellipse cx="${g.cx}" cy="${g.cy}" rx="${g.rx}" ry="${g.ry}" fill="url(#ag_${r.id})" stroke="${r.color}" stroke-opacity="${sel ? 0.95 : 0.35}" stroke-width="${sel ? 3 : 1.5}"/>
          ${g.deco.map((dc, i) => `<text class="ag-deco" x="${g.cx + (i ? 34 : -52)}" y="${g.cy + (i ? 26 : -18)}">${dc}</text>`).join('')}
          <text class="ag-glyph" x="${g.cx}" y="${g.cy - 6}" text-anchor="middle">${r.glyph}</text>
          <text class="ag-name" x="${g.cx}" y="${g.cy + 26}" text-anchor="middle" fill="${locked ? '#8b90ad' : '#fff'}">${esc(r.name.toUpperCase())}</text>
          ${locked
            ? `<text class="ag-lock" x="${g.cx}" y="${g.cy + 46}" text-anchor="middle">🔒 Stage ${State.stageInfo(r.unlockStage).label}</text>`
            : `<text class="ag-dgcount" x="${g.cx}" y="${g.cy + 46}" text-anchor="middle" fill="${r.color}">⚔ ${dgs.length} dungeon${dgs.length > 1 ? 's' : ''}</text>`}
        </g>`;
      }).join('');

      const locked = ms < selR.unlockStage;
      const dgs = DATA.DUNGEONS.list.filter(d => d.region === selR.id);
      const evt = DATA.eventOfDay(State.dayKey());
      const streak = (State.data.dungeons && State.data.dungeons.streak) || 0;
      const panel = `
        <div class="ag-panel ${selR.rift ? 'aetherfx' : ''}" style="--rc:${selR.color}">
          <div class="ag-panel-head">
            <span class="ag-panel-glyph">${selR.glyph}</span>
            <div class="ag-panel-titles"><b>${esc(selR.name)}</b><span class="ag-title">${esc(selR.title)}</span></div>
          </div>
          <p class="ag-desc">${esc(selR.desc)}</p>
          ${locked
            ? `<div class="ag-locked">🔒 Clear <b>Stage ${State.stageInfo(selR.unlockStage).label}</b> of the campaign to unlock ${esc(selR.name)}.</div>`
            : (() => {
                const ex = State.expeditionState(selR.id);
                const node = State.expeditionNode(selR.id, 0);
                const ni = node ? DATA.EXPEDITION.NODE_INFO[node.type] : null;
                return `
                <div class="dg-card exp-card ascendfx" style="--rc:${selR.color}" onclick="UI.openExpedition('${selR.id}')">
                  <div class="dg-glyph">🕳️</div>
                  <div class="dg-info">
                    <b>Depths of ${esc(selR.name)}</b> <span class="dg-focus asc-focus">🌟 ASCENSION GEAR</span>
                    <p>Delve the dungeon-crawl beneath ${esc(selR.name)} — checkpoint by checkpoint, fork by fork, boss by boss. The ONLY source of Lv-100 ASCENSION gear.</p>
                    <div class="dg-meta"><b class="conq-text">FLOOR ${ex.floor}</b> · checkpoint ${ex.step + 1}/${ex.layout.length}${ni ? ` · next: ${ni.glyph} ${ni.name}` : ''} · Enemy Lv ~${DATA.enemyLevelForStage(DATA.EXPEDITION.stageEq(ms, ex.floor))}</div>
                  </div>
                  <button class="btn gold">🕳️ DELVE</button>
                </div>`;
              })() + dgs.map(dg => {
                const tier = State.conquestTier(dg.id);
                const surge = State.isSurging(dg.id);
                const fi = DATA.DUNGEONS.FOCUS_INFO[dg.focus];
                const se = DATA.DUNGEONS.stageEq(ms, dg) + DATA.CONQUEST.raidStageBonus(tier);
                const cap = State.dungeonAttemptCap(dg.id);
                const left = State.dungeonRunsLeft(dg.id);
                const warlord = left === 0;
                return `
                <div class="dg-card ${dg.focus === 'item' ? 'aetherfx' : ''} ${surge ? 'surging' : ''}" style="--rc:${selR.color}">
                  <div class="dg-glyph">${dg.glyph}</div>
                  <div class="dg-info">
                    <b>${esc(dg.name)}</b> <span class="dg-focus">${fi.glyph} ${fi.label}</span>
                    ${surge ? '<span class="surge-tag">🔥 SURGE ×2</span>' : ''}
                    ${tier ? `<span class="conq-tag" title="Conquest Tier">${'⭐'.repeat(tier)} T${tier}</span>` : ''}
                    <p>${esc(dg.desc)}</p>
                    <div class="dg-meta">Enemy Lv ~${DATA.enemyLevelForStage(se)} · ${esc(fi.blurb)}${tier ? ` · <b class="conq-text">+${tier * 25}% loot</b>` : ''} · <b class="${left ? 'good-text' : 'dim'}">${left}/${cap} raids left today</b></div>
                  </div>
                  ${warlord
                    ? `<button class="btn gold warlord-btn" onclick="UI.fightWarlord('${dg.id}')">🏴 WARLORD<small>beat to RESET raids</small></button>`
                    : `<button class="btn gold" onclick="UI.raidDungeon('${dg.id}')">⚔️ RAID</button>`}
                </div>`;
              }).join('')}
        </div>`;

      /* daily Bounty Hunts — marks on stages you've already conquered */
      const marks = State.bountyMarks();
      const bountyPanel = marks.length ? `
        <div class="ag-panel bounty-panel">
          <div class="ag-panel-head"><span class="ag-panel-glyph">🎯</span>
            <div class="ag-panel-titles"><b>Bounty Hunts</b><span class="ag-title">Three marks resurface each day on conquered ground — collect for doubled spoils${evt.bounty ? ' <b class="good-text">(+50% today!)</b>' : ''}</span></div>
          </div>
          <div class="bounty-row">
            ${marks.map(s => {
              const done = State.bountyDone(s);
              const bi = State.stageInfo(s);
              return `<div class="bounty-card ${done ? 'done' : ''}">
                <b>Stage ${bi.label}</b><small>${esc(bi.chapter.name)}</small>
                ${done ? '<span class="bounty-claimed">✔ COLLECTED</span>' : `<button class="btn gold" onclick="UI.fightBounty(${s})">🎯 HUNT</button>`}
              </div>`;
            }).join('')}
          </div>
        </div>` : '';

      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>Map of Agdao</h2></div>
        <div class="agdao-layout">
          <div class="event-banner">${evt.glyph} <b>REALM EVENT — ${esc(evt.name)}</b><span>${esc(evt.desc)}</span>${streak > 1 ? `<span class="streak-chip">⚡ MOMENTUM ×${streak} <small>+${Math.min(streak - 1, 10) * 5}% raid loot</small></span>` : ''}</div>
          <div class="agdao-map">
            <svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="agSea" cx="50%" cy="42%" r="75%">
                  <stop offset="0%" stop-color="#123a5c"/><stop offset="55%" stop-color="#0c2947"/><stop offset="100%" stop-color="#071a30"/>
                </radialGradient>
                <radialGradient id="agLand" cx="50%" cy="45%" r="70%">
                  <stop offset="0%" stop-color="#3d4a34"/><stop offset="100%" stop-color="#2a331f"/>
                </radialGradient>
                <radialGradient id="ag_newsalmon" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#2e7ab8" stop-opacity="0.85"/><stop offset="100%" stop-color="#123a5c" stop-opacity="0.55"/></radialGradient>
                <radialGradient id="ag_palandine" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#b8502a" stop-opacity="0.85"/><stop offset="100%" stop-color="#5c2412" stop-opacity="0.55"/></radialGradient>
                <radialGradient id="ag_astorvia" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#c9a03a" stop-opacity="0.85"/><stop offset="100%" stop-color="#6a4d14" stop-opacity="0.55"/></radialGradient>
                <radialGradient id="ag_aespo" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#8a8a4a" stop-opacity="0.85"/><stop offset="100%" stop-color="#3d3d24" stop-opacity="0.6"/></radialGradient>
                <radialGradient id="ag_jeehva" cx="50%" cy="40%" r="75%"><stop offset="0%" stop-color="#2f7a44" stop-opacity="0.85"/><stop offset="100%" stop-color="#143a1e" stop-opacity="0.55"/></radialGradient>
                <radialGradient id="agRift" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stop-color="#b48cff" stop-opacity="0.9"/><stop offset="55%" stop-color="#7cf5ff" stop-opacity="0.5"/><stop offset="100%" stop-color="#7cf5ff" stop-opacity="0.05"/>
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="800" height="560" fill="url(#agSea)"/>
              <g class="ag-waves" opacity="0.35">
                <text x="60" y="80">〜</text><text x="720" y="60">〜</text><text x="40" y="500">〜</text>
                <text x="740" y="480">〜</text><text x="380" y="40">〜</text><text x="90" y="300">〜</text><text x="730" y="280">〜</text>
              </g>
              <path fill="url(#agLand)" stroke="#4a5a38" stroke-width="3" stroke-opacity="0.6" d="M 120,300 C 90,220 140,140 230,120 C 300,100 340,140 400,120 C 450,100 520,80 600,110 C 690,140 720,220 690,300 C 720,360 660,430 580,440 C 520,470 470,430 410,450 C 350,470 280,470 220,430 C 150,400 140,360 120,300 Z"/>
              ${regionSvg}
              <text class="ag-map-title" x="400" y="530" text-anchor="middle">— THE REALM OF AGDAO —</text>
            </svg>
          </div>
          ${panel}
          ${bountyPanel}
          <div class="hint center">Dungeon enemies scale to ~80% of your campaign wall — when a Boss stops you, farm here, power up, and break through. Attempts only count on VICTORY.<br>Raided everything? The <b>🏴 AREA WARLORD</b> emerges — slay it to RESET the dungeon's raids and raise its <b>Conquest Tier</b>: stronger forces, rarer relics, richer loot.</div>
        </div>`;
    },
  };
  function selectRegion(id) {
    agdaoSel = id;
    GameAudio.sfx('tap');
    show('agdao');
  }
  function raidDungeon(dgId) {
    const dg = DATA.DUNGEON_BY_ID[dgId];
    if (!dg) return;
    const r = DATA.AGDAO_REGION_BY_ID[dg.region];
    if (State.data.campaign.maxStage < r.unlockStage) { GameAudio.sfx('error'); toast(`Reach Stage ${State.stageInfo(r.unlockStage).label} to unlock ${r.name}`, 'bad'); return; }
    if (State.dungeonRunsLeft(dgId) < 1) { GameAudio.sfx('error'); toast('Raids exhausted — challenge the 🏴 AREA WARLORD to reset them!', 'bad'); return; }
    beginBattle('dungeon', dgId);
  }
  function fightWarlord(dgId) {
    const dg = DATA.DUNGEON_BY_ID[dgId];
    if (!dg) return;
    const r = DATA.AGDAO_REGION_BY_ID[dg.region];
    if (State.data.campaign.maxStage < r.unlockStage) { GameAudio.sfx('error'); toast(`Reach Stage ${State.stageInfo(r.unlockStage).label} to unlock ${r.name}`, 'bad'); return; }
    if (!State.warlordAvailable(dgId)) { GameAudio.sfx('error'); toast('The Warlord only emerges once the dungeon is raided out', 'bad'); return; }
    const tier = State.conquestTier(dgId);
    modal(`
      <h3 class="center">🏴 AREA WARLORD — ${esc(dg.name)}</h3>
      <p class="center">The dungeon is raided out… and its <b>WARLORD</b> has taken the field with a full honor guard, stronger than anything inside.</p>
      <p class="center dim">Victory: raids <b>RESET instantly</b> · Conquest rises to <b>Tier ${Math.min(DATA.CONQUEST.maxTier, tier + 1)}</b> · Warlord Chest + guaranteed named relic${tier < DATA.CONQUEST.maxTier ? ' · First-conquest trophy' : ''}.<br>Defeat costs nothing — Warlord challenges are FREE.</p>
      <div class="modal-btns">
        <button class="btn gold warlord-btn" onclick="UI.closeModal();UI.beginBattle('warlord','${dgId}')">⚔️ TO BATTLE</button>
        <button class="btn" onclick="UI.closeModal()">Not yet</button>
      </div>`);
  }
  function fightBounty(stage) {
    if (State.bountyDone(stage)) { GameAudio.sfx('error'); toast('Bounty already collected today', 'bad'); return; }
    beginBattle('bounty', stage);
  }

  /* ============================================================
     DEPTHS OF AGDAO — EXPEDITIONS. A dungeon-crawler under every
     region: your champion's marker walks a winding path of
     checkpoints, the traveled line extends behind it, forks let
     you pick the way, and the FLOOR BOSS guards the stairs down.
     Deep floors drop ASCENSION gear (Lv 100 exclusives).
  ============================================================ */
  let expedSel = null;

  function openExpedition(regionId) {
    expedSel = regionId;
    show('expedition', regionId);
  }

  SCREENS.expedition = {
    render(regionId) {
      regionId = regionId || expedSel || DATA.AGDAO.regions[0].id;
      expedSel = regionId;
      const r = DATA.AGDAO_REGION_BY_ID[regionId];
      const ex = State.expeditionState(regionId);
      const E = DATA.EXPEDITION;
      const ms = State.data.campaign.maxStage;
      const se = E.stageEq(ms, ex.floor);
      const leaderId = State.data.formation.find(id => State.data.roster[id]) || State.ownedChampions()[0];

      /* --- geometry: entrance at the bottom, boss at the top --- */
      const stepY = i => 520 - i * (460 / (ex.layout.length - 1));
      const nodeX = (step, idx) => step.length === 1
        ? 180 + (step[idx].jx || 0)
        : (idx === 0 ? 105 : 255) + (step[idx].jx || 0);
      const posOf = (i, ci) => ({ x: nodeX(ex.layout[i], Math.min(ci, ex.layout[i].length - 1)), y: stepY(i) });
      const entrance = { x: 180, y: 566 };

      /* traveled path — the line that extends behind the raider */
      const traveled = [entrance];
      for (let i = 0; i < ex.step; i++) traveled.push(posOf(i, ex.chosen[i] || 0));
      const cur = traveled[traveled.length - 1];

      let svg = '';
      /* faint web of the ways ahead — the "random ways" */
      for (let i = ex.step; i < ex.layout.length - 1; i++) {
        const froms = i === ex.step ? [cur] : ex.layout[i].map((n, ci) => posOf(i, ci));
        const tos = ex.layout[i + 1].map((n, ci) => posOf(i + 1, ci));
        froms.forEach(f => tos.forEach(t => {
          svg += `<line class="exp-way" x1="${f.x}" y1="${f.y}" x2="${t.x}" y2="${t.y}"/>`;
        }));
      }
      /* choice lines from the marker to the current checkpoint options */
      if (ex.step < ex.layout.length) {
        ex.layout[ex.step].forEach((n, ci) => {
          const p = posOf(ex.step, ci);
          svg += `<line class="exp-choice" x1="${cur.x}" y1="${cur.y}" x2="${p.x}" y2="${p.y}"/>`;
        });
      }
      /* the traveled line */
      if (traveled.length > 1) {
        const pts = traveled.map(p => `${p.x},${p.y}`).join(' ');
        svg += `<polyline class="exp-path-done" points="${pts}"/>`;
        const a = traveled[traveled.length - 2], b = traveled[traveled.length - 1];
        svg += `<line class="exp-path-new" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
      }
      /* checkpoint nodes */
      ex.layout.forEach((step, i) => {
        step.forEach((n, ci) => {
          const p = posOf(i, ci);
          const ni = E.NODE_INFO[n.type];
          const visited = i < ex.step;
          const chosen = visited && (ex.chosen[i] || 0) === ci;
          const isCurrent = i === ex.step;
          const isNext = i === ex.step + 1;
          const fogged = i > ex.step + 1 && n.type !== 'boss';
          const glyph = fogged ? '❔' : ni.glyph;
          const cls = ['exp-node',
            visited ? (chosen ? 'done' : 'skipped') : '',
            isCurrent ? 'current' : '',
            isNext ? 'next' : '',
            fogged ? 'fog' : '',
            n.type === 'boss' ? 'boss' : ''].join(' ');
          const tap = isCurrent ? ` onclick="UI.expeditionTapNode(${ci})"` : '';
          svg += `<g class="${cls}"${tap}>
            ${isCurrent ? `<circle class="exp-pulse" cx="${p.x}" cy="${p.y}" r="26"/>` : ''}
            <circle class="exp-ring" cx="${p.x}" cy="${p.y}" r="${n.type === 'boss' ? 24 : 19}"/>
            <text class="exp-glyph" x="${p.x}" y="${p.y + (n.type === 'boss' ? 8 : 6)}" text-anchor="middle">${visited && chosen ? '✓' : glyph}</text>
          </g>`;
        });
      });
      /* entrance marker + the raider (leader portrait) */
      svg += `<text class="exp-entrance" x="${entrance.x}" y="${entrance.y + 24}" text-anchor="middle">⛩ ENTRANCE</text>`;
      svg += `
        <g class="exp-raider" transform="translate(${cur.x},${cur.y})">
          <circle class="exp-raider-ring" r="17"/>
          ${leaderId ? `<image href="${portrait(leaderId)}" x="-14" y="-14" width="28" height="28" clip-path="circle(14px)"/>` : '<text y="6" text-anchor="middle">🚩</text>'}
        </g>`;

      /* --- the checkpoint panel: what's next, choose your way --- */
      const stepNodes = ex.layout[ex.step] || [];
      const ascPct = Math.round(E.bossAscensionChance(ex.floor, regionId === 'rift') * 100);
      const panel = `
        <div class="ag-panel exp-panel" style="--rc:${r.color}">
          <div class="ag-panel-head">
            <span class="ag-panel-glyph">🕳️</span>
            <div class="ag-panel-titles"><b>Depths of ${esc(r.name)} — FLOOR ${ex.floor}</b>
            <span class="ag-title">Checkpoint ${ex.step + 1}/${ex.layout.length} · Enemy Lv ~${DATA.enemyLevelForStage(se)} · 👑 Boss ASCENSION odds: <b class="asc-text">${ascPct}%</b></span></div>
          </div>
          ${stepNodes.length > 1 ? '<p class="exp-fork-label">⑂ THE PATH FORKS — choose your way:</p>' : ''}
          <div class="exp-choices">
            ${stepNodes.map((n, ci) => {
              const ni = E.NODE_INFO[n.type];
              return `<div class="exp-choice-card ${n.type}" onclick="UI.expeditionTapNode(${ci})">
                <div class="ecc-glyph">${ni.glyph}</div>
                <div class="ecc-info"><b>${ni.name}</b><p>${ni.desc}</p></div>
                <button class="btn gold mini-btn">${['battle', 'elite', 'boss'].includes(n.type) ? '⚔️ FIGHT' : '➤ ENTER'}</button>
              </div>`;
            }).join('')}
          </div>
          <div class="hint center">Defeats cost NOTHING — retry any checkpoint freely. Clear the 👑 FLOOR BOSS to delve to Floor ${ex.floor + 1}: tougher enemies, better odds at 🌟 <b>ASCENSION gear</b> (requires Lv 100 champions${regionId === 'rift' ? ' · Rift depths roll +50% ASCENSION luck' : ''}).</div>
        </div>`;

      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('agdao')"><span class="arrow">←</span> MAP</button>
          <h2>🕳️ Depths of ${esc(r.name)}</h2></div>
        <div class="exped-layout">
          <div class="exp-map-wrap" style="--rc:${r.color}">
            <div class="exp-floor-badge">FLOOR ${ex.floor}</div>
            <svg viewBox="0 0 360 600" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="expBg" cx="50%" cy="30%" r="80%">
                  <stop offset="0%" stop-color="${r.color}" stop-opacity="0.16"/>
                  <stop offset="60%" stop-color="#0a0c17" stop-opacity="0.9"/>
                  <stop offset="100%" stop-color="#06070d"/>
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="360" height="600" rx="18" fill="url(#expBg)"/>
              ${svg}
            </svg>
          </div>
          ${panel}
        </div>`;
    },
  };

  function expeditionTapNode(choiceIdx) {
    const regionId = expedSel;
    if (!regionId) return;
    const node = State.expeditionNode(regionId, choiceIdx);
    if (!node) return;
    if (['battle', 'elite', 'boss'].includes(node.type)) {
      beginBattle('expedition', { regionId, choiceIdx, nodeType: node.type });
      return;
    }
    const res = State.resolveExpeditionNode(regionId, choiceIdx);
    if (!res) return;
    if (res.ambush) {
      GameAudio.sfx('error');
      modal(`
        <h3 class="center">💀 AMBUSH!</h3>
        <p class="center">${esc(res.outcome.text)}</p>
        <p class="center dim">The "mystery" was bait — an elite pack blocks the path. Defeat it to advance (retries are FREE).</p>
        <div class="modal-btns">
          <button class="btn gold" onclick="UI.closeModal();UI.beginBattle('expedition',{regionId:'${regionId}',choiceIdx:${choiceIdx},nodeType:'elite'})">⚔️ FIGHT</button>
        </div>`, { sticky: true });
      return;
    }
    GameAudio.sfx('coin');
    const ni = DATA.EXPEDITION.NODE_INFO[res.type] || {};
    const title = res.outcome ? `${res.outcome.glyph} ${esc(res.outcome.text)}` : `${ni.glyph} ${ni.name} claimed!`;
    let extra = '';
    if (res.gear) {
      const gr = State.gearRarity(res.gear);
      extra += `<div class="gear-drop" style="--c:${gr.color}">${DATA.GEAR_SLOT_INFO[res.gear.slot].glyph} <b>${esc(State.gearName(res.gear))}</b> <span class="raritytag">${gr.name}</span></div>`;
    }
    if (res.item) extra += relicBannerHtml(res.item, 'CACHE RELIC');
    if (res.ascension) extra += ascensionBannerHtml(res.ascension);
    modal(`
      <div class="result win">
        <div class="result-title">${res.type === 'mystery' ? 'FORTUNE!' : 'LOOTED!'}</div>
        ${resultHtml(true, title, res.rw)}${extra}
        <div class="modal-btns">
          <button class="btn gold" onclick="UI.closeModal();UI.show('expedition','${regionId}')">DELVE ON ▶</button>
        </div>
      </div>`, { sticky: true });
    refreshTopbar();
  }

  /* banner for a dropped ASCENSION item — the realm's rarest loot */
  function ascensionBannerHtml(gRec) {
    const it = DATA.ITEM_BY_ID[gRec.itemId];
    if (!it) return '';
    return `<div class="unlock-banner ascension-banner ascendfx">
      🌟 <b>ASCENSION DROP — ${esc(it.name)}</b> <span class="raritytag ascension">ASCENSION</span>
      <br><small>${esc(it.fxDesc)}</small>
      <br><small class="dim">Requires a Lv 100 champion${it.classReq ? ` · ${DATA.ROLE_INFO[it.classReq].glyph} ${DATA.ROLE_INFO[it.classReq].name} EXCLUSIVE` : ''}</small></div>`;
  }

  /* ---------------- STORE ---------------- */
  SCREENS.store = {
    render(tab) {
      tab = tab || 'featured';
      const S = DATA.STORE;
      let body = '';
      if (tab === 'featured') {
        body = `
          ${S.specials.map(p => State.hasPurchased(p.id) ? '' : `
            <div class="pack special" onclick="UI.buyPack('${p.id}')">
              <div class="pk-ico">${p.glyph}</div>
              <div class="pk-info"><b>${esc(p.name)}</b><p>${esc(p.includes)}</p></div>
              <div class="pk-price">$${p.price}</div>
            </div>`).join('')}
          <h3>Exclusive Champions</h3>
          ${S.championPacks.map(p => {
            const owned = State.data.roster[p.champ];
            const def = DATA.CHAMP_BY_ID[p.champ];
            return `<div class="pack champ ${owned ? 'owned' : ''}" onclick="${owned ? `UI.show('herodetail','${p.champ}')` : `UI.buyPack('${p.id}')`}">
              <img class="pk-portrait" src="${portrait(p.champ)}" alt="">
              <div class="pk-info"><b>${esc(def.name)}</b><span class="dim">${esc(def.epithet)}</span><p>${esc(p.includes)}</p>
              ${factionChip(def.faction)} <span class="chip">${def.role}</span></div>
              <div class="pk-price">${owned ? 'OWNED ✓' : '$' + p.price}</div>
            </div>`;
          }).join('')}
          <h3>Exclusive Gear</h3>
          ${S.gearPacks.map(p => {
            const owned = State.hasPurchased(p.id);
            const gdef = DATA.EXCLUSIVE_GEAR.find(g => g.id === p.gear);
            return `<div class="pack gear ${owned ? 'owned' : ''}" onclick="${owned ? '' : `UI.buyPack('${p.id}')`}">
              <div class="pk-ico">${DATA.GEAR_SLOT_INFO[gdef.slot].glyph}</div>
              <div class="pk-info"><b>${esc(p.name)}</b><p>${esc(gdef.flavor)}</p></div>
              <div class="pk-price">${owned ? 'OWNED ✓' : '$' + p.price}</div>
            </div>`;
          }).join('')}`;
      } else if (tab === 'chests') {
        const owned = id => State.chestCount(id);
        const chestCard = c => `
          <div class="chest-card ${c.tier} ${c.id === 'rift_casket' ? 'aetherfx' : ''}" style="--cc:${c.color}">
            ${owned(c.id) ? `<div class="chest-owned">×${owned(c.id)}</div>` : ''}
            ${c.region ? `<div class="chest-region" style="color:${c.color}">🗺️ ${esc(c.region)}</div>` : ''}
            <div class="chest-glyph">${c.glyph}</div>
            <div class="chest-name" style="color:${c.color}">${esc(c.name)}</div>
            <p class="chest-desc">${esc(c.desc)}</p>
            <div class="chest-btns">
              ${owned(c.id) ? `<button class="btn gold" onclick="UI.openChestFlow('${c.id}')">🔓 OPEN</button>` : ''}
              <button class="btn ${State.data.res.diamonds >= c.costD ? '' : 'disabled'}" onclick="UI.buyChest('${c.id}')">💎 ${fmt(c.costD)}</button>
            </div>
          </div>`;
        const core = DATA.CHESTS.filter(c => c.tier === 'core');
        const special = DATA.CHESTS.filter(c => c.tier === 'special');
        const boss = DATA.CHESTS.filter(c => c.tier === 'boss');
        const themed = DATA.CHESTS.filter(c => c.tier === 'themed');
        body = `
          <h3>🎁 Treasure Chests</h3>
          <div class="chest-grid">${core.map(chestCard).join('')}</div>
          <h3>🗺️ Chests of Agdao <span class="chip aether-chip">NAMED RELICS INSIDE</span></h3>
          <div class="chest-grid">${themed.map(chestCard).join('')}</div>
          <h3>🌟 Special Chests</h3>
          <div class="chest-grid">${special.map(chestCard).join('')}</div>
          <h3>💀 Boss Chests</h3>
          <div class="chest-grid">${boss.map(chestCard).join('')}</div>
          <div class="hint center">Boss Chests drop from clearing Boss Rush. Trials and the Abyss award chests too — earned chests stack here until you open them. Chests of Agdao are the only Store source of named Epic, Legendary and AETHER relics.</div>`;
      } else if (tab === 'deals') {
        State.ensureStoreDay();
        const ss = State.data.storeState;
        const deals = S.dealsOfDay(State.dayKey());
        const gift = S.freeGift;
        body = `
          <div class="free-gift-card ${ss.giftClaimed ? 'claimed' : ''}" onclick="${ss.giftClaimed ? '' : 'UI.claimFreeGift()'}">
            <div class="fg-glyph">${gift.glyph}</div>
            <div class="fg-info">
              <b>${esc(gift.name)} <span class="freetag">FREE</span></b>
              <p>${esc(gift.blurb)}</p>
              <div class="fg-contents">💎 ${gift.gives.diamonds} · ✨ ${gift.gives.dust} · 💰 ${gift.gives.goldByStage}min of Gold</div>
            </div>
            ${ss.giftClaimed ? '<div class="fg-claimed">✔ CLAIMED<br><small>back tomorrow</small></div>' : '<button class="btn gold">🎁 CLAIM</button>'}
          </div>

          <h3>⚡ Today's Flash Deals <span class="chip deal-chip">RESET DAILY · 1 EACH</span></h3>
          <div class="deal-grid">
            ${deals.map(dd => {
              const bought = ss.dealsBought.includes(dd.id);
              return `<div class="deal-card ${bought ? 'bought' : ''}" onclick="${bought ? '' : `UI.buyDeal('${dd.id}')`}">
                <div class="save-ribbon">-${dd.save}%</div>
                <div class="deal-glyph">${dd.glyph}</div>
                <div class="deal-name">${esc(dd.name)}</div>
                <div class="deal-gives">${storeGivesHtml(dd.gives)}</div>
                <div class="deal-price">${bought ? '<span class="deal-done">✔ CLAIMED</span>' : `<span class="was">💎 ${fmt(dd.value)}</span><b>💎 ${fmt(dd.costD)}</b>`}</div>
              </div>`;
            }).join('')}
          </div>

          <h3>🌟 Promo Bundles <span class="chip deal-chip gold-chip">STACKED VALUE</span></h3>
          <div class="promo-list">
            ${S.promos.map(p => {
              const soldOut = p.onceEver && ss.promosBought.includes(p.id);
              return `<div class="promo-card ${soldOut ? 'bought' : ''}" onclick="${soldOut ? '' : `UI.buyPromo('${p.id}')`}">
                <div class="save-ribbon big">SAVE ${p.save}%</div>
                <div class="promo-glyph">${p.glyph}</div>
                <div class="promo-info">
                  <b>${esc(p.name)}</b> ${p.onceEver ? '<span class="oncetag">ONCE PER ACCOUNT</span>' : ''}
                  <p>${esc(p.blurb)}</p>
                  <div class="promo-value">Worth <s>💎 ${fmt(p.value)}</s> in the Market</div>
                </div>
                <div class="promo-buy">${soldOut ? '<span class="deal-done">✔ CLAIMED</span>' : `<button class="btn gold">💎 ${fmt(p.costD)}</button>`}</div>
              </div>`;
            }).join('')}
          </div>
          <div class="hint center">Flash Deals rotate every day — Promo Bundles bundle Diamonds, Gold, XP, Summon Scrolls and Gear Dust at a deep discount over Market prices.</div>`;
      } else if (tab === 'diamonds') {
        body = `<div class="dp-grid">
          ${S.diamondPacks.map(p => `
            <div class="pack dpack ${p.tag ? 'tagged' : ''}" onclick="UI.buyPack('${p.id}')">
              ${p.tag ? `<div class="value-ribbon">${p.tag}</div>` : ''}
              <div class="pk-ico">${p.glyph}</div>
              <b>${fmt(p.diamonds)} 💎</b>
              ${p.bonus ? `<div class="dp-bonus">+${fmt(p.bonus)} BONUS (+${Math.round(p.bonus / p.diamonds * 100)}%)</div>` : '<div class="dp-bonus dim">—</div>'}
              <div class="pk-price">$${p.price}</div>
            </div>`).join('')}
        </div>
        <div class="hint center">Payments are processed securely by PayPal.</div>`;
      } else {
        body = `
        <h3>📜 Summon Scrolls</h3>
        <div class="market-list">${S.diamondShop.filter(i => i.gives.scrolls).map(marketItemHtml).join('')}</div>
        <h3>💰 Gold & 📗 XP <span class="chip deal-chip">SCALES WITH YOUR STAGE</span></h3>
        <div class="market-list">${S.diamondShop.filter(i => i.gives.goldByStage || i.gives.xpByStage).map(marketItemHtml).join('')}</div>
        <h3>✨ Gear Dust <span class="chip deal-chip">FUEL FOR ENHANCING</span></h3>
        <div class="market-list">${S.diamondShop.filter(i => i.gives.dust).map(marketItemHtml).join('')}</div>
        <div class="hint center">Bigger caches always cost fewer 💎 per unit — the SAVE tag shows exactly how much.</div>`;
      }
      const dealsLeft = (() => { State.ensureStoreDay(); const ss = State.data.storeState; return (!ss.giftClaimed ? 1 : 0) + Math.max(0, S.dealsOfDay(State.dayKey()).length - ss.dealsBought.length); })();
      return `
        <div class="pagehead"><h2>Store</h2></div>
        <div class="tabs">
          <button class="tab ${tab === 'featured' ? 'on' : ''}" onclick="UI.show('store','featured')">⭐ Featured</button>
          <button class="tab ${tab === 'deals' ? 'on' : ''}" onclick="UI.show('store','deals')">🔥 Deals${dealsLeft ? '<span class="nbadge tab-badge"></span>' : ''}</button>
          <button class="tab ${tab === 'chests' ? 'on' : ''}" onclick="UI.show('store','chests')">🎁 Chests${Object.values(State.data.chests || {}).some(n => n > 0) ? '<span class="nbadge tab-badge"></span>' : ''}</button>
          <button class="tab ${tab === 'diamonds' ? 'on' : ''}" onclick="UI.show('store','diamonds')">💎 Diamonds</button>
          <button class="tab ${tab === 'market' ? 'on' : ''}" onclick="UI.show('store','market')">🏪 Market</button>
        </div>
        <div class="store-body">${body}</div>`;
    },
  };

  /* human-readable contents line for deals/promos */
  function storeGivesHtml(g) {
    const bits = [];
    if (g.scrolls) bits.push(`📜 ×${g.scrolls}`);
    if (g.diamonds) bits.push(`💎 ${fmt(g.diamonds)}`);
    if (g.dust) bits.push(`✨ ${fmt(g.dust)}`);
    if (g.goldByStage) bits.push(`💰 ${g.goldByStage}min`);
    if (g.xpByStage) bits.push(`📗 ${g.xpByStage}min`);
    if (g.chest) { const c = DATA.CHEST_BY_ID[g.chest]; bits.push(`${c.glyph} ${c.name}`); }
    return bits.join(' · ');
  }
  function marketItemHtml(i) {
    return `<div class="pack market" onclick="UI.buyDiamondItem('${i.id}')">
      <div class="pk-ico">${i.glyph}</div>
      <div class="pk-info"><b>${esc(i.name)}</b>${i.tag ? `<span class="savetag">${i.tag}</span>` : ''}</div>
      <div class="pk-price">💎 ${fmt(i.costD)}</div>
    </div>`;
  }

  /* purchase result modal shared by deals / promos / gift */
  function storeLootModal(title, glyph, grant, chestId, save) {
    const bits = Object.keys(grant).map(k => ({
      gold: { g: '💰', l: 'Gold' }, xp: { g: '📗', l: 'XP' }, diamonds: { g: '💎', l: 'Diamonds' },
      scrolls: { g: '📜', l: 'Scrolls' }, dust: { g: '✨', l: 'Gear Dust' },
    }[k] ? { glyph: { gold: '💰', xp: '📗', diamonds: '💎', scrolls: '📜', dust: '✨' }[k], label: k.toUpperCase(), amt: grant[k] } : null)).filter(Boolean);
    modal(`
      <div class="chest-reveal" style="--cc:#f5c542">
        <div class="cr-chest">${glyph}</div>
        <h3 class="center" style="color:#f5c542">${esc(title)}${save ? ` — SAVED ${save}%!` : ''}</h3>
        <div class="cr-loot">
          ${bits.map((b, i) => `<div class="cr-item" style="--d:${0.2 + i * 0.14}s"><div class="cri-glyph">${b.glyph}</div><div class="cri-label">${b.label}</div><div class="cri-amt">×${fmt(b.amt)}</div></div>`).join('')}
          ${chestId ? (() => { const c = DATA.CHEST_BY_ID[chestId]; return `<div class="cr-item jackpot" style="--d:${0.2 + bits.length * 0.14}s"><div class="cri-glyph">${c.glyph}</div><div class="cri-label">${esc(c.name)}</div><div class="cri-amt">OPEN IN CHESTS TAB</div></div>`; })() : ''}
        </div>
        <div class="modal-btns"><button class="btn gold" onclick="UI.closeModal();UI.show('store','deals')">EXCELLENT</button></div>
      </div>`, { sticky: true });
  }
  function buyPromo(promoId) {
    const p = DATA.STORE.promos.find(x => x.id === promoId);
    if (!p) return;
    const r = Store.buyPromo(promoId);
    if (!r.ok) { GameAudio.sfx('error'); toast(r.reason, 'bad'); return; }
    GameAudio.sfx('buy'); refreshTopbar();
    storeLootModal(p.name, p.glyph, r.grant, r.chest, p.save);
  }
  function buyDeal(dealId) {
    const dd = DATA.STORE.dealsOfDay(State.dayKey()).find(x => x.id === dealId);
    if (!dd) return;
    const r = Store.buyDeal(dealId);
    if (!r.ok) { GameAudio.sfx('error'); toast(r.reason, 'bad'); return; }
    GameAudio.sfx('buy'); refreshTopbar();
    storeLootModal(dd.name, dd.glyph, r.grant, r.chest, dd.save);
  }
  function claimFreeGift() {
    const r = Store.claimFreeGift();
    if (!r.ok) { GameAudio.sfx('error'); toast(r.reason, 'bad'); return; }
    GameAudio.sfx('buy'); refreshTopbar();
    storeLootModal("Merchant's Favor — FREE", DATA.STORE.freeGift.glyph, r.grant, null, null);
  }

  /* ---------------- CHEST BUY / OPEN ---------------- */
  function buyChest(chestId) {
    const c = DATA.CHEST_BY_ID[chestId];
    if (!c) return;
    modal(`
      <h3>${c.glyph} ${esc(c.name)}</h3>
      <p class="center dim">${esc(c.desc)}</p>
      <p class="center">Buy & open for <b>💎 ${fmt(c.costD)}</b>?</p>
      <div class="modal-btns">
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
        <button class="btn gold" onclick="UI.confirmBuyChest('${chestId}')">BUY & OPEN</button>
      </div>`);
  }
  function confirmBuyChest(chestId) {
    const c = DATA.CHEST_BY_ID[chestId];
    if (!State.spend({ diamonds: c.costD })) {
      closeModal(); GameAudio.sfx('error'); toast('Not enough Diamonds', 'bad'); return;
    }
    State.grantChest(chestId, 1);
    closeModal();
    openChestFlow(chestId);
  }
  function openChestFlow(chestId) {
    const c = DATA.CHEST_BY_ID[chestId];
    const loot = State.openChest(chestId);
    if (!loot) { GameAudio.sfx('error'); toast('No chest to open', 'bad'); return; }
    GameAudio.sfx('buy');
    refreshTopbar();
    const anyJackpot = loot.some(l => l.jackpot);
    setTimeout(() => { GameAudio.sfx(anyJackpot ? 'elite' : 'coin'); }, 900);
    modal(`
      <div class="chest-reveal ${anyJackpot ? 'jackpot' : ''}" style="--cc:${c.color}">
        <div class="cr-chest">${c.glyph}</div>
        <div class="cr-burst"></div>
        <h3 class="center" style="color:${c.color}">${esc(c.name)} OPENED!</h3>
        <div class="cr-loot">
          ${loot.map((l, i) => `
            <div class="cr-item ${l.jackpot ? 'jackpot' : ''} ${l.rarity || ''} ${l.rarity === 'aether' ? 'aetherfx' : ''}" style="--d:${0.9 + i * 0.18}s">
              <div class="cri-glyph">${l.glyph}</div>
              <div class="cri-label">${esc(l.label)}</div>
              <div class="cri-amt">${l.amt ? '×' + fmt(l.amt) : (l.rarity ? l.rarity.toUpperCase() : '')}${l.isNew ? ' · NEW!' : ''}</div>
              ${l.fx ? `<div class="cri-fx">✦ ${esc(l.fx)}</div>` : ''}
            </div>`).join('')}
        </div>
        <div class="modal-btns">
          ${State.chestCount(chestId) > 0 ? `<button class="btn gold" onclick="UI.closeModal();UI.openChestFlow('${chestId}')">OPEN ANOTHER (×${State.chestCount(chestId)})</button>` : ''}
          <button class="btn" onclick="UI.closeModal();UI.show('store','chests')">DONE</button>
        </div>
      </div>`, { sticky: true });
  }

  function buyDiamondItem(itemId) {
    const item = DATA.STORE.diamondShop.find(i => i.id === itemId);
    modal(`
      <h3>${item.glyph} ${esc(item.name)}</h3>
      <p class="center">Buy for <b>💎 ${fmt(item.costD)}</b>?</p>
      <div class="modal-btns">
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
        <button class="btn gold" onclick="UI.confirmDiamondItem('${itemId}')">BUY</button>
      </div>`);
  }
  function confirmDiamondItem(itemId) {
    const r = Store.buyDiamondItem(itemId);
    closeModal();
    if (r.ok) {
      GameAudio.sfx('buy');
      toast('Purchased! ' + Object.keys(r.grant).map(k => `${{ gold: '💰', xp: '📗', scrolls: '📜', dust: '✨', diamonds: '💎' }[k]} ${fmt(r.grant[k])}`).join(' '), 'good');
      refreshTopbar();
    } else { GameAudio.sfx('error'); toast(r.reason, 'bad'); }
  }

  function buyPack(packId) {
    const p = Store.findPack(packId);
    if (!p) return;
    modal(`
      <h3>🛒 ${esc(p.name)}</h3>
      ${p.includes ? `<p class="center dim">${esc(p.includes)}</p>` : ''}
      <div class="price-line">$${p.price.toFixed(2)} USD</div>
      <button class="btn big paypal" onclick="UI.startPaypal('${packId}')">
        Pay with <b>Pay</b><i>Pal</i></button>
      <p class="finehint">You'll complete payment in a PayPal tab, then return here to confirm.</p>
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
  }
  function startPaypal(packId) {
    const p = Store.findPack(packId);
    const orderId = Store.beginCheckout(p.name, p.price, packId);
    pendingOrder = { packId, price: p.price, orderId };
    modal(`
      <h3>🕓 Complete your payment</h3>
      <p class="center">A PayPal checkout tab has opened for <b>${esc(p.name)}</b> ($${p.price.toFixed(2)}).<br><br>
      Order ID: <code>${orderId}</code></p>
      <p class="center">When you've finished, paste your <b>PayPal Transaction ID</b> below:</p>
      <input class="input" id="txn-input" placeholder="e.g. 8AB12345CD678901E" maxlength="40">
      <div class="modal-btns">
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
        <button class="btn gold" onclick="UI.confirmPaypal()">CONFIRM PURCHASE</button>
      </div>
      <p class="finehint">Beta build: purchases are granted on confirmation and logged with your transaction ID for manual verification. Keep your PayPal receipt.</p>`, { sticky: true });
  }
  async function confirmPaypal() {
    if (!pendingOrder) return;
    const txn = ($('#txn-input').value || '').trim();
    if (txn.length < 8) { GameAudio.sfx('error'); toast('Please enter the Transaction ID from your PayPal receipt', 'bad'); return; }
    const res = await Store.confirmPayment(pendingOrder.packId, pendingOrder.price, txn);
    if (!res.ok) { GameAudio.sfx('error'); toast(res.reason, 'bad'); return; }
    pendingOrder = null;
    GameAudio.sfx('buy');
    modal(`
      <div class="result win"><div class="result-title">THANK YOU! 🎉</div>
      <div class="result-msg">Your purchase was recorded:<br><b>${esc(res.granted)}</b></div>
      <div class="modal-btns"><button class="btn gold" onclick="UI.closeModal();UI.show('store')">AWESOME</button></div></div>`, { sticky: true });
    refreshTopbar();
  }

  /* ---------------- TOWER (overhauled) ---------------- */
  SCREENS.tower = {
    render() {
      const f = State.data.tower.floor;
      const rw = DATA.towerRewards(f);
      const nextBoss = Math.ceil(f / 5) * 5;
      const floors = [];
      for (let i = 6; i >= -1; i--) floors.push(f + i);
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>Tower of Trials</h2></div>
        <div class="tower-layout">
          <div class="tower-left">
            <div class="tower-hero">
              <div class="tower-sky"><div class="tower-stars"></div></div>
              <div class="tower-hero-inner">
                <div class="th-glyph">🗼</div>
                <div class="th-title">THE ENDLESS ASCENT</div>
                <div class="th-floor">FLOOR <b>${f}</b></div>
                <div class="th-boss-note">${f % 5 === 0 ? '<span class="bosstag">⚠ BOSS FLOOR — a tyrant guards this landing</span>' : `Next boss at floor ${nextBoss}`}</div>
              </div>
            </div>
            <div class="tower-stats-row">
              <div><label>CURRENT</label><b>${f}</b></div>
              <div><label>NEXT BOSS</label><b class="bosstag">${nextBoss}</b></div>
              <div><label>SCROLLS AT</label><b>📜 ${nextBoss}</b></div>
            </div>
            <div class="stage-card tower-cta">
              <div class="reward-row tower-rewards">
                <span>💎 ${rw.diamonds}</span><span>💰 ${fmt(rw.gold)}</span><span>✨ ${rw.dust}</span>${rw.scrolls ? `<span>📜 ${rw.scrolls}</span>` : ''}
              </div>
              <button class="btn big gold" onclick="UI.beginBattle('tower', ${f})">⚔️ CHALLENGE FLOOR ${f}</button>
            </div>
            <div class="hint center">The Tower never scales down — bring your strongest team. Every 5th floor holds a boss and bonus scrolls.</div>
          </div>
          <div class="tower-right">
            <div class="tower-shaft">
              ${floors.map(fl => {
                if (fl < 1) return '';
                const state = fl < f ? 'cleared' : fl === f ? 'current' : 'future';
                const boss = fl % 5 === 0;
                const top = fl === f + 6;
                return `<div class="tfloor ${state} ${boss ? 'boss' : ''}">
                  <span class="tf-num">${top ? '☁️ ???' : 'Floor ' + fl}</span>
                  ${boss && !top ? '<b class="bosstag">☠ BOSS</b>' : ''}
                  ${fl < f ? '<span class="tf-check">✓</span>' : ''}
                  ${fl === f ? '<span class="tf-you">YOU ▶</span>' : ''}
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
    },
  };

  /* ---------------- ARENA (overhauled) ---------------- */
  let arenaOpponents = null;
  SCREENS.arena = {
    render() {
      const d = State.data;
      const left = Math.max(0, DATA.ARENA_FREE_FIGHTS - d.arena.fightsToday);
      const rank = DATA.arenaRank(d.arena.rating);
      const rankIdx = DATA.ARENA_RANKS.findIndex(r => r.id === rank.id);
      const nextRank = DATA.ARENA_RANKS[rankIdx + 1];
      const pct = nextRank ? Math.min(100, Math.round((d.arena.rating - rank.min) / (nextRank.min - rank.min) * 100)) : 100;
      if (!arenaOpponents) {
        const myPower = Math.max(1000, State.teamPower(d.formation));
        arenaOpponents = [0.82, 1.0, 1.22].map((m, i) => {
          const team = Combat.buildArenaTeam(myPower * m);
          return {
            name: DATA.ARENA_NAMES[Math.floor(Math.random() * DATA.ARENA_NAMES.length)] + '#' + (100 + Math.floor(Math.random() * 900)),
            team, power: Math.round(team.reduce((t, u) => t + u.stats.atk * 4.2 + u.stats.hp * 0.55 + u.stats.def * 5.5 + u.stats.spd * 12 + u.stats.crit * 30, 0)),
            diff: ['Easy', 'Fair', 'Hard'][i],
          };
        });
      }
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>Arena</h2></div>
        <div class="arena-layout">
          <div class="arena-left">
            <div class="rank-card" style="--rc:${rank.color}">
              <div class="rank-medal">${rank.glyph}</div>
              <div class="rank-info">
                <div class="rank-name" style="color:${rank.color}">${rank.name.toUpperCase()} LEAGUE</div>
                <div class="rank-rating">${d.arena.rating} <span class="dim">rating</span></div>
                <div class="rank-bar"><div style="width:${pct}%;background:${rank.color}"></div></div>
                <div class="rank-next dim">${nextRank ? `${nextRank.min - d.arena.rating} to ${nextRank.glyph} ${nextRank.name}` : 'Highest league — defend the crown!'}</div>
              </div>
            </div>
            <div class="arena-stats">
              <div><label>RECORD</label><b>${d.arena.wins}W – ${d.arena.losses}L</b></div>
              <div><label>WIN RATE</label><b>${d.arena.wins + d.arena.losses ? Math.round(d.arena.wins / (d.arena.wins + d.arena.losses) * 100) : 0}%</b></div>
              <div><label>FIGHTS LEFT</label><b>${left}</b></div>
            </div>
            <button class="btn center-block" onclick="UI.rerollArena()">🔄 New opponents</button>
            <div class="hint center">Win +22 rating & 💎60 · Lose −15 rating & 💎15. ${DATA.ARENA_FREE_FIGHTS} free fights daily. Every duel opens with a face-off — size up your rival!</div>
          </div>
          <div class="arena-right">
            <div class="opponent-list">
              ${arenaOpponents.map((o, i) => `
                <div class="opponent diff-${o.diff.toLowerCase()}">
                  <div class="op-info"><b>${esc(o.name)}</b> <span class="op-diff">${o.diff.toUpperCase()}</span>
                    <div class="op-team">${o.team.map(u => `<img src="${Battle3D.renderPortrait(u.model)}" alt="">`).join('')}</div>
                    <span class="dim">Power ${fmt(o.power)}</span></div>
                  <button class="btn ${left ? 'gold' : 'disabled'}" onclick="UI.fightArena(${i})">⚔ VS</button>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
    },
  };
  function fightArena(i) {
    const o = arenaOpponents[i];
    beginBattle('arena', o);
  }
  function rerollArena() { arenaOpponents = null; show('arena'); }

  /* ---------------- BOSS RUSH ---------------- */
  SCREENS.bossrush = {
    render() {
      const d = State.data;
      const m = d.modes.bossrush;
      const attemptsLeft = Math.max(0, DATA.BOSSRUSH.attemptsPerDay - m.attemptsToday);
      const nextRound = m.active ? m.round + 1 : 1;
      const canFight = m.active || attemptsLeft > 0;
      const skulls = [];
      for (let r = 1; r <= DATA.BOSSRUSH.rounds; r++) {
        const cls = m.active && r <= m.round ? 'done' : (m.active && r === nextRound ? 'next' : '');
        skulls.push(`<div class="br-skull ${cls}">${m.active && r <= m.round ? '✅' : '💀'}<span>R${r}</span></div>`);
      }
      const rw = DATA.BOSSRUSH.roundReward(d.campaign.maxStage, nextRound);
      const chest = DATA.CHEST_BY_ID[DATA.BOSSRUSH.finalChest];
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>💀 Boss Rush</h2></div>
        <div class="mode-hero br-hero">
          <div class="mh-title">GAUNTLET OF TYRANTS</div>
          <div class="mh-sub">Five bosses. No mercy. One legendary chest.</div>
          <div class="br-track">${skulls.join('<div class="br-link"></div>')}</div>
        </div>
        <div class="arena-stats">
          <div><label>RUNS LEFT</label><b>${attemptsLeft}${m.active ? ' (run live!)' : ''}</b></div>
          <div><label>BEST ROUND</label><b>${m.bestRound}/${DATA.BOSSRUSH.rounds}</b></div>
          <div><label>FULL CLEARS</label><b>${m.clears}</b></div>
        </div>
        <div class="stage-card">
          <div class="reward-row"><span>💎 ${rw.diamonds}</span><span>💰 ${fmt(rw.gold)}</span><span>✨ ${rw.dust}</span></div>
          <div class="dim center">Clear all ${DATA.BOSSRUSH.rounds} rounds → <b style="color:${chest.color}">${chest.glyph} ${chest.name}</b></div>
          <button class="btn big ${canFight ? 'gold' : 'disabled'}" onclick="UI.fightBossRush()">
            ${m.active ? `⚔️ ROUND ${nextRound} — FIGHT THE NEXT TYRANT` : attemptsLeft ? '💀 BEGIN THE GAUNTLET' : 'NO RUNS LEFT TODAY'}
          </button>
        </div>
        <div class="hint center">Bosses scale with your campaign progress and grow stronger each round. A defeat ends the run — ${DATA.BOSSRUSH.attemptsPerDay} runs per day.</div>`;
    },
  };
  function fightBossRush() {
    const m = State.data.modes.bossrush;
    if (!m.active) {
      if (m.attemptsToday >= DATA.BOSSRUSH.attemptsPerDay) { toast('No Boss Rush runs left today', 'bad'); return; }
      m.active = true;
      m.round = 0;
      m.attemptsToday += 1;
      State.save();
    }
    beginBattle('bossrush', m.round + 1);
  }

  /* ---------------- FACTION TRIALS ---------------- */
  SCREENS.trials = {
    render() {
      const d = State.data;
      const m = d.modes.trials;
      const dayFaction = DATA.TRIALS.factionOfDay(State.dayKey());
      const f = DATA.FACTIONS[dayFaction];
      // the faction that BEATS today's defenders gets +30% damage
      let counter = null;
      Object.keys(DATA.FACTIONS).forEach(k => { if (DATA.factionBeats(k, dayFaction)) counter = DATA.FACTIONS[k]; });
      const tiers = [];
      for (let t = 1; t <= DATA.TRIALS.tiers; t++) {
        const rw = DATA.TRIALS.tierReward(t);
        const state = t <= m.clearedTier ? 'cleared' : (t === m.clearedTier + 1 ? 'next' : 'locked');
        tiers.push(`
          <div class="trial-tier ${state} ${t >= 5 ? 'boss' : ''}" style="--fc:${f.color}">
            <div class="tt-num">${state === 'cleared' ? '✅' : t >= 5 ? '☠' : '⚔'} TIER ${t}</div>
            <div class="tt-rw dim">✨${rw.dust} 💎${rw.diamonds}${rw.scrolls ? ' 📜' + rw.scrolls : ''}${rw.chest ? ' 🎁' : ''}</div>
            ${state === 'next' ? `<button class="mini gold" onclick="UI.beginBattle('trials', ${t})">FIGHT</button>`
              : state === 'cleared' ? '<span class="dim">CLEARED</span>' : '<span class="dim">🔒</span>'}
          </div>`);
      }
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>${f.glyph} Faction Trials</h2></div>
        <div class="mode-hero trials-hero" style="--fc:${f.color}">
          <div class="mh-title" style="color:${f.color}">${f.glyph} ${f.name.toUpperCase()} TRIALS</div>
          <div class="mh-sub">${esc(f.desc)}</div>
          ${counter ? `<div class="trials-counter">💡 <b style="color:${counter.color}">${counter.glyph} ${counter.name}</b> Champions deal <b>+30% damage</b> here today!</div>` : ''}
        </div>
        <div class="trial-tiers">${tiers.join('')}</div>
        <div class="hint center">A new faction defends its trials every day. Tiers reset daily — clear all ${DATA.TRIALS.tiers} for a Mystic Chest. Tier 5+ fields a boss.</div>`;
    },
  };

  /* ---------------- ENDLESS ABYSS ---------------- */
  SCREENS.abyss = {
    render() {
      const d = State.data;
      const m = d.modes.abyss;
      const depth = m.depth;
      const mods = DATA.ABYSS.modifiersAt(depth);
      const rw = DATA.ABYSS.depthReward(depth);
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>🕳️ Endless Abyss</h2></div>
        <div class="mode-hero abyss-hero">
          <div class="abyss-rings"><span></span><span></span><span></span></div>
          <div class="mh-title">THE HUNGER BELOW</div>
          <div class="mh-sub">Every depth is deadlier. There is no bottom. There is only your record.</div>
          <div class="abyss-depth">DEPTH <b>${depth}</b></div>
        </div>
        <div class="arena-stats">
          <div><label>NEXT DEPTH</label><b>${depth}</b></div>
          <div><label>DEEPEST DIVE</label><b>${m.best}</b></div>
          <div><label>MILESTONE</label><b>🎁 ${Math.ceil(depth / 5) * 5}</b></div>
        </div>
        ${mods.length ? `<div class="abyss-mods">
          ${mods.map(mo => `<div class="abyss-mod"><span>${mo.glyph}</span><div><b>${mo.name}</b><p>${mo.desc}</p></div></div>`).join('')}
        </div>` : '<div class="hint center">The first depths are calm. The corruption begins at depth 3…</div>'}
        <div class="stage-card">
          <div class="reward-row"><span>💰 ${fmt(rw.gold)}</span><span>✨ ${fmt(rw.dust)}</span><span>💎 ${rw.diamonds}</span>${rw.chest ? `<span>🎁 ${DATA.CHEST_BY_ID[rw.chest].name}</span>` : ''}</div>
          <button class="btn big gold" onclick="UI.beginBattle('abyss', ${depth})">🕳️ DESCEND TO DEPTH ${depth}</button>
        </div>
        <div class="hint center">Enemies from every family, warped by corruption modifiers. Every 5th depth is a boss with a chest. Progress never resets.</div>`;
    },
  };

  /* ---------------- GRAND TOURNAMENT ---------------- */
  SCREENS.tournament = {
    render() {
      const d = State.data;
      const m = d.modes.tournament;
      const entriesLeft = Math.max(0, DATA.TOURNAMENT.entriesPerDay - m.entriesToday);
      let body = '';
      if (m.active) {
        const bracket = DATA.TOURNAMENT.rounds.map((r, i) => {
          const state = i < m.round ? 'won' : (i === m.round ? 'next' : 'future');
          const rival = (m.rivals && m.rivals[i]) || '???';
          return `<div class="tour-round ${state}">
            <div class="tr-name">${r.name}</div>
            <div class="tr-vs">${state === 'won' ? `✅ defeated ${esc(rival)}` : state === 'next' ? `⚔ vs <b>${esc(rival)}</b>` : `vs ${esc(rival)}`}</div>
            <div class="tr-rw dim">💰${fmt(r.reward.gold)} 💎${r.reward.diamonds}${r.reward.scrolls ? ' 📜' + r.reward.scrolls : ''}${r.reward.chest ? ' 🎁' : ''}</div>
          </div>`;
        }).join('<div class="tour-link">▼</div>');
        body = `
          <div class="tour-bracket">${bracket}</div>
          <div class="stage-card">
            <button class="btn big gold" onclick="UI.beginBattle('tournament')">🏆 FIGHT THE ${DATA.TOURNAMENT.rounds[m.round].name}</button>
          </div>`;
      } else if (entriesLeft > 0) {
        body = `
          <div class="stage-card">
            <div class="dim center">Three rounds — Quarterfinal, Semifinal, Grand Final. Rivals grow stronger each round. Lose once and you're out. Champions win a Golden Chest and the GLADIATOR badge.</div>
            <button class="btn big gold" onclick="UI.enterTournament()">🏆 ENTER TODAY'S BRACKET</button>
          </div>`;
      } else {
        body = `
          <div class="stage-card">
            <div class="dim center">Today's bracket is over. The arena gates reopen tomorrow.</div>
            <button class="btn big disabled">COME BACK TOMORROW</button>
          </div>`;
      }
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>🏆 Grand Tournament</h2></div>
        <div class="mode-hero tour-hero">
          <div class="mh-title">THE GRAND TOURNAMENT</div>
          <div class="mh-sub">Every match opens with a stadium face-off. The crowd remembers champions.</div>
          <div class="tour-titles">${m.titles > 0 ? `👑 Grand Champion × ${m.titles}` : 'No titles yet — change that.'}</div>
        </div>
        ${body}
        <div class="hint center">${DATA.TOURNAMENT.entriesPerDay} entry per day. Every match begins with a split-screen showdown intro.</div>`;
    },
  };
  function enterTournament() {
    const m = State.data.modes.tournament;
    if (m.entriesToday >= DATA.TOURNAMENT.entriesPerDay) { toast('No entries left today', 'bad'); return; }
    m.active = true;
    m.round = 0;
    m.entriesToday += 1;
    m.rivals = DATA.TOURNAMENT.rounds.map(() =>
      DATA.ARENA_NAMES[Math.floor(Math.random() * DATA.ARENA_NAMES.length)] + '#' + (100 + Math.floor(Math.random() * 900)));
    State.save();
    GameAudio.sfx('elite');
    show('tournament');
  }

  /* ---------------- SETTINGS ---------------- */
  SCREENS.settings = {
    render() {
      const s = State.data.settings;
      const d = State.data;
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button><h2>Settings</h2></div>
        <div class="settings-list">
          <div class="setting"><span>🔊 Sound effects</span><button class="switch ${s.sfx ? 'on' : ''}" onclick="UI.toggleSetting('sfx')"></button></div>
          <div class="setting"><span>🎵 Music</span><button class="switch ${s.music ? 'on' : ''}" onclick="UI.toggleSetting('music')"></button></div>
          <div class="setting"><span>⚡ Auto-cast ultimates</span><button class="switch ${s.autoUlt ? 'on' : ''}" onclick="UI.toggleSetting('autoUlt')"></button></div>
          <div class="setting"><span>🪫 Reduced effects (battery)</span><button class="switch ${s.reducedFx ? 'on' : ''}" onclick="UI.toggleSetting('reducedFx')"></button></div>
        </div>
        <h3>Main Menu</h3>
        <div class="settings-list">
          <div class="setting"><span>Return to Save Selection</span><button class="mini" onclick="UI.backToMainMenu()">EXIT GAME</button></div>
        </div>
        <h3>Save data</h3>
        <div class="settings-list">
          <div class="setting"><span>Export save</span><button class="mini" onclick="UI.exportSave()">COPY</button></div>
          <div class="setting"><span>Import save</span><button class="mini" onclick="UI.importSave()">PASTE</button></div>
          <div class="setting danger"><span>Reset all progress</span><button class="mini danger" onclick="UI.confirmReset()">RESET</button></div>
        </div>
        <h3>Purchases</h3>
        <div class="settings-list">
          ${d.purchases.length ? d.purchases.map(p => `<div class="setting"><span>${esc(p.packId)} — $${p.price}</span><span class="dim">${p.txn === 'BETA' ? 'beta' : esc(p.txn.slice(0, 10) + '…')}</span></div>`).join('') : '<div class="setting dim"><span>No purchases yet</span></div>'}
        </div>
        <h3>Secrets</h3>
        <div class="settings-list">
          <div class="setting" style="display: flex; gap: 8px; align-items: center;">
            <input type="text" id="cheat-code-input" class="input-text" placeholder="Enter secret code..." style="flex: 1; background: #000a; border: 1px solid var(--edge); color: #fff; padding: 6px 12px; border-radius: var(--radius); font-size: 13px;" onkeydown="if(event.key==='Enter') UI.applyCheatCode()">
            <button class="mini gold" onclick="UI.applyCheatCode()">SUBMIT</button>
          </div>
        </div>
        <div class="credits">
          <div class="logo small">AZ<span>CHAMPIONS</span></div>
          <p>Created by <b>Aljay Leodones</b> · Beta ${new Date().getFullYear()}<br>
          Player since ${new Date(d.created).toLocaleDateString()} · ${d.stats.battles} battles fought · ${d.stats.summons} summons</p>
        </div>`;
    },
  };
  function toggleSetting(key) {
    const s = State.data.settings;
    s[key] = !s[key]; State.save();
    if (key === 'music') GameAudio.setMusic(s.music);
    show('settings');
  }
  function exportSave() {
    const s = State.exportSave();
    navigator.clipboard.writeText(s).then(
      () => toast('Save copied to clipboard ✓', 'good'),
      () => { modal(`<h3>Export save</h3><textarea class="input" rows="6" onclick="this.select()">${s}</textarea><div class="modal-btns"><button class="btn" onclick="UI.closeModal()">CLOSE</button></div>`); }
    );
  }
  function importSave() {
    modal(`<h3>Import save</h3><textarea class="input" id="import-area" rows="6" placeholder="Paste your exported save here"></textarea>
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">Cancel</button>
      <button class="btn gold" onclick="UI.doImport()">IMPORT</button></div>`, { sticky: true });
  }
  function doImport() {
    const v = $('#import-area').value;
    if (State.importSave(v)) { closeModal(); toast('Save imported ✓', 'good'); show('home'); }
    else { GameAudio.sfx('error'); toast('Invalid save data', 'bad'); }
  }
  function confirmReset() {
    modal(`<h3>⚠️ Reset progress?</h3><p class="center">This permanently deletes your save — Champions, gear, and purchase records. This cannot be undone.</p>
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">Keep my save</button>
      <button class="btn danger" onclick="UI.doReset()">DELETE EVERYTHING</button></div>`, { sticky: true });
  }
  function doReset() { State.reset(); closeModal(); show('home'); showIntro(); }

  function applyCheatCode() {
    const input = $('#cheat-code-input');
    if (!input) return;
    const code = input.value.trim().toLowerCase();
    if (!code) return;
    if (code === 'az') {
      for (let i = 0; i < 10; i++) {
        State.addChampion('azrin');
        State.addChampion('ashkarr');
        State.addChampion('solmaris');
        State.addChampion('thalassia');
        State.addChampion('aljay');
      }
      State.save();
      toast('Cheat code activated! Received 10x Azrin, Ashkarr, Solmaris, Thalassia, & Aljay! ⚔️', 'good');
      input.value = '';
    } else if (code === '+') {
      State.data.res.gold = (State.data.res.gold || 0) + 2000000;
      State.data.res.xp = (State.data.res.xp || 0) + 2000000;
      State.data.res.dust = (State.data.res.dust || 0) + 2000000;
      State.data.res.diamonds = (State.data.res.diamonds || 0) + 10000;
      State.save();
      toast('Cheat code activated! Received 2M Gold, 2M XP, 2M Dust & 10,000 Diamonds! 💎', 'good');
      refreshTopbar();
      input.value = '';
    } else if (code === 'quakelemon') {
      State.data.res.scrolls = (State.data.res.scrolls || 0) + 30;
      State.data.res.xp = (State.data.res.xp || 0) + 5000;
      State.data.res.diamonds = (State.data.res.diamonds || 0) + 5000;
      State.save();
      toast('Cheat code activated! Received 30 Scrolls, 5000 XP & 5000 Diamonds! 💎', 'good');
      refreshTopbar();
      input.value = '';
    } else if (code === 'quakelord') {
      const added = State.addChampion('aljay');
      if (added === 'new' || added === 'dupe') {
        State.save();
        toast('Cheat code activated! Received Legendary Creator Aljay 👑', 'good');
        input.value = '';
      } else {
        toast('Could not add Aljay!', 'bad');
      }
    } else if (code === 'cc') {
      const pool = State.summonPool();
      const allIds = [];
      Object.keys(pool).forEach(rarity => {
        allIds.push(...pool[rarity]);
      });
      if (allIds.length > 0) {
        const addedChamps = [];
        for (let i = 0; i < 10; i++) {
          const randId = allIds[Math.floor(Math.random() * allIds.length)];
          State.addChampion(randId);
          const champInfo = DATA.CHAMPIONS.find(c => c.id === randId);
          if (champInfo) {
            addedChamps.push(champInfo.name);
          }
        }
        State.save();
        toast('Cheat code activated! Added 10 random cards to your roster! 🃏', 'good');
        input.value = '';
      } else {
        toast('No cards available to add!', 'bad');
      }
    } else if (code === 'exp') {
      State.data.res.xp = (State.data.res.xp || 0) + 10000;
      State.save();
      toast('Cheat code activated! Received 10,000 XP! 📗', 'good');
      refreshTopbar();
      input.value = '';
    } else {
      toast('Invalid secret code!', 'bad');
    }
  }

  /* ---------------- INTRO / WELCOME BACK ---------------- */
  function showIntro() {
    if (State.data) {
      State.data.seenIntro = true;
      State.save();
    }
  }

  function welcomeBack() {
    const p = State.idlePending();
    if (p.minutes < 10) return;
    modal(`
      <h3 class="center">🌙 Welcome back, Summoner</h3>
      <p class="center">Your Champions fought while you were away${p.capped ? ' — the chest is <b>FULL</b>!' : ''}:</p>
      <div class="reward-row"><span>💰 ${fmt(p.gold)}</span><span>📗 ${fmt(p.xp)}</span><span>✨ ${fmt(p.dust)}</span></div>
      <div class="modal-btns"><button class="btn gold" onclick="UI.collectIdleFromModal()">COLLECT</button></div>`, { sticky: true });
  }
  function collectIdleFromModal() { closeModal(); collectIdle(); }

  /* ---------------- VIEW MODE (mobile-only build) ----------------
     AZ Champions is a portrait Android game — there is exactly one
     layout. This only keeps the body class + renderer resize. */
  function applyViewMode() {
    document.body.classList.remove('view-mode-pc');
    document.body.classList.add('view-mode-mobile');
    Battle3D.resize();
    setTimeout(() => { Battle3D.resize(); }, 50);
  }

  function spawnClickParticles(x, y) {
    const ring = document.createElement('div');
    ring.className = 'click-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 400);

    const count = 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'click-particle';
      p.style.left = (x - 3) + 'px';
      p.style.top = (y - 3) + 'px';
      
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 18 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  /* ============================================================
     GRAND OVERHAUL — Chest Manager · Inventory · Relic Forge ·
     Achievements · Login Streak · Stage Sweep · Presets
     ============================================================ */

  /* ---------------- CHEST MANAGER ---------------- */
  function openChestManager() {
    const total = DATA.CHESTS.reduce((t, c) => t + State.chestCount(c.id), 0);
    modal(`
      <h3 class="center">🎁 Chest Manager</h3>
      <p class="center dim" style="margin-bottom:12px;">Every chest you own, in one place.</p>
      <div class="chestman-list">
        ${DATA.CHESTS.map(c => {
          const n = State.chestCount(c.id);
          return `<div class="chestman-row ${n ? '' : 'empty'}" style="--cc:${c.color}">
            <div class="cm-glyph">${c.glyph}</div>
            <div class="cm-info">
              <b style="color:${c.color}">${esc(c.name)}</b>
              <span class="cm-tier">${c.tier.toUpperCase()}</span>
            </div>
            <div class="cm-count ${n ? 'has' : ''}">×${n}</div>
            ${n ? `<button class="mini gold" onclick="UI.closeModal();UI.openChestFlow('${c.id}')">OPEN</button>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${total > 0
        ? `<button class="btn big openall-btn" onclick="UI.openAllChests()">🎉 OPEN ALL (${total})</button>`
        : `<p class="center dim" style="margin-top:10px;">No chests right now — bosses, quests, Boss Rush, Trials and the Abyss all drop them.</p>`}
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">CLOSE</button></div>`);
  }

  function openAllChests(chestId) {
    const res = State.openAllChests(chestId || null);
    if (!res) { GameAudio.sfx('error'); toast('No chests to open', 'bad'); return; }
    GameAudio.sfx('buy');
    refreshTopbar(); renderNav();
    // aggregate stackable loot; keep gear & champions as individual lines
    const agg = {};
    const items = [];
    res.loot.forEach(l => {
      if (['gold', 'xp', 'dust', 'scrolls', 'diamonds'].includes(l.kind)) {
        if (!agg[l.kind]) agg[l.kind] = { kind: l.kind, glyph: l.glyph, label: l.label, amt: 0, jackpot: l.jackpot };
        agg[l.kind].amt += l.amt;
      } else items.push(l);
    });
    const rows = Object.values(agg).concat(items);
    const anyJackpot = res.loot.some(l => l.jackpot);
    setTimeout(() => { GameAudio.sfx(anyJackpot ? 'elite' : 'coin'); }, 800);
    const rain = Array.from({ length: 26 }, (_, i) =>
      `<span class="br-drop" style="--x:${(i * 37) % 100}%;--d:${(i % 9) * 0.16}s;--s:${0.8 + (i % 5) * 0.18}">${['💰', '💎', '✨', '📜', '🎁', '⚔️'][i % 6]}</span>`).join('');
    modal(`
      <div class="bulk-reveal ${anyJackpot ? 'jackpot' : ''}">
        <div class="br-rain">${rain}</div>
        <div class="br-chest">🎉</div>
        <h3 class="center">${res.opened} CHEST${res.opened > 1 ? 'S' : ''} OPENED!</h3>
        <div class="cr-loot">
          ${rows.map((l, i) => `
            <div class="cr-item ${l.jackpot ? 'jackpot' : ''} ${l.rarity || ''} ${l.rarity === 'aether' ? 'aetherfx' : ''}" style="--d:${0.35 + i * 0.13}s">
              <div class="cri-glyph">${l.glyph}</div>
              <div class="cri-label">${esc(l.label)}</div>
              <div class="cri-amt">${l.amt ? '×' + fmt(l.amt) : (l.rarity ? l.rarity.toUpperCase() : '')}${l.isNew ? ' · NEW!' : ''}</div>
              ${l.fx ? `<div class="cri-fx">✦ ${esc(l.fx)}</div>` : ''}
            </div>`).join('')}
        </div>
        <div class="modal-btns">
          <button class="btn gold" onclick="UI.closeModal();UI.openChestManager()">BACK TO CHESTS</button>
          <button class="btn" onclick="UI.closeModal()">DONE</button>
        </div>
      </div>`, { sticky: true });
  }

  /* ---------------- INVENTORY & RELIC FORGE ---------------- */
  let invSlotFilter = 'all';
  SCREENS.inventory = {
    render() {
      const gear = Object.values(State.data.gear)
        .filter(g => invSlotFilter === 'all' || g.slot === invSlotFilter)
        .sort((a, b) => {
          const ra = DATA.GEAR_RARITIES.findIndex(r => r.id === a.rarity);
          const rb = DATA.GEAR_RARITIES.findIndex(r => r.id === b.rarity);
          if (ra !== rb) return rb - ra;
          return State.gearStatValue(b) - State.gearStatValue(a);
        });
      const slots = ['all'].concat(DATA.GEAR_SLOTS);
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button>
          <h2>Inventory <span class="count">${Object.keys(State.data.gear).length} items</span></h2></div>

        <div class="forge-panel">
          <div class="forge-head">🔥 <b>Relic Forge</b>
            <span class="forge-pity">Guaranteed Mythic in <b>${State.craftsUntilPity()}</b> craft${State.craftsUntilPity() > 1 ? 's' : ''}</span></div>
          <div class="forge-grid">
            ${DATA.FORGE.options.map(o => {
              const r = DATA.GEAR_RARITIES.find(x => x.id === o.rarity);
              const ok = State.canAfford(o.cost);
              return `<button class="forge-opt ${ok ? '' : 'disabled'}" style="--fc:${r.color}" onclick="UI.openForgeSlotPick('${o.rarity}')">
                <b style="color:${r.color}">${r.name}</b>
                <small>✨${fmt(o.cost.dust)} 💰${fmt(o.cost.gold)}</small>
              </button>`;
            }).join('')}
          </div>
        </div>

        <div class="forge-panel fusion-panel">
          <div class="forge-head">🌀 <b>Relic Fusion</b>
            <span class="forge-pity">Sacrifice <b>3</b> unequipped named relics of a tier → <b>1 relic of the NEXT tier</b></span></div>
          <div class="forge-grid">
            ${DATA.ITEM_TIER_ORDER.slice(0, -1).map(t => {
              const ti = DATA.ITEM_TIER_INFO[t];
              const next = DATA.ITEM_TIER_INFO[DATA.ITEM_TIER_ORDER[DATA.ITEM_TIER_ORDER.indexOf(t) + 1]];
              const have = State.fusableRelics(t).length;
              const ok = have >= DATA.FUSION.need && State.canAfford({ gold: DATA.FUSION.goldCost(t) });
              return `<button class="forge-opt ${ok ? '' : 'disabled'}" style="--fc:${ti.color}" onclick="UI.openFusion('${t}')">
                <b style="color:${ti.color}">${ti.name} ▶ <span style="color:${next.color}">${next.name}</span></b>
                <small>${have}/${DATA.FUSION.need} owned · 💰${fmt(DATA.FUSION.goldCost(t))}</small>
              </button>`;
            }).join('')}
          </div>
        </div>

        <div class="filter-row" style="margin-bottom:10px;">
          <div class="filter-pills">
            ${slots.map(s => `<div class="filter-pill ${invSlotFilter === s ? 'active' : ''}" onclick="UI.setInvFilter('${s}')">${s === 'all' ? 'All' : DATA.GEAR_SLOT_INFO[s].glyph + ' ' + DATA.GEAR_SLOT_INFO[s].name}</div>`).join('')}
          </div>
        </div>

        <div class="inv-grid">
          ${gear.length ? gear.map(g => {
            const r = State.gearRarity(g);
            const info = DATA.GEAR_SLOT_INFO[g.slot];
            const holder = State.gearEquippedBy(g.id);
            const itemDef = g.itemId && DATA.ITEM_BY_ID[g.itemId];
            return `<div class="inv-item ${g.rarity === 'aether' ? 'aetherfx' : ''} ${g.rarity === 'ascension' ? 'ascendfx' : ''} ${g.rarity === 'legendary' ? 'legendfx' : ''}" style="--c:${r.color}" onclick="UI.gearDetail('${g.id}')">
              <div class="ii-glyph">${info.glyph}</div>
              <div class="ii-name">${esc(State.gearName(g))}${g.level ? ` <b>+${g.level}</b>` : ''}</div>
              <div class="ii-stat">+${State.gearStatValue(g)} ${info.main.toUpperCase()}</div>
              <div class="ii-rarity ${g.rarity === 'aether' ? 'aether-text' : ''} ${g.rarity === 'ascension' ? 'asc-text' : ''}" style="color:${r.color}">${r.name.toUpperCase()}</div>
              ${itemDef ? `<div class="ii-fx">✦ ${esc(itemDef.fxDesc)}</div>` : ''}
              ${itemDef && (itemDef.levelReq || itemDef.classReq) ? `<div class="ii-req">🌟 Lv ${itemDef.levelReq}${itemDef.classReq ? ` · ${DATA.ROLE_INFO[itemDef.classReq].glyph} ${DATA.ROLE_INFO[itemDef.classReq].name} only` : ''}</div>` : ''}
              ${holder ? `<div class="ii-holder"><img src="${portrait(holder)}" alt=""><span>${esc(DATA.CHAMP_BY_ID[holder].name)}</span></div>` : ''}
            </div>`;
          }).join('') : '<div class="dim center pad" style="grid-column:1/-1;">No gear yet — clear campaign stages or craft at the Relic Forge above.</div>'}
        </div>`;
    },
  };
  function setInvFilter(s) { invSlotFilter = s; show('inventory'); }

  function openForgeSlotPick(rarity) {
    const opt = DATA.FORGE.options.find(o => o.rarity === rarity);
    const r = DATA.GEAR_RARITIES.find(x => x.id === rarity);
    if (!State.canAfford(opt.cost)) { GameAudio.sfx('error'); toast('Not enough resources', 'bad'); return; }
    modal(`
      <h3 class="center">🔥 Forge <span style="color:${r.color}">${r.name}</span> gear</h3>
      <p class="center dim">Pick the equipment slot to forge (✨${fmt(opt.cost.dust)} 💰${fmt(opt.cost.gold)}):</p>
      <div class="forge-slot-grid">
        ${DATA.GEAR_SLOTS.map(s => `<button class="forge-slot-btn" onclick="UI.doCraft('${s}','${rarity}')">
          <span>${DATA.GEAR_SLOT_INFO[s].glyph}</span>${DATA.GEAR_SLOT_INFO[s].name}</button>`).join('')}
      </div>
      <div class="modal-btns"><button class="btn" onclick="UI.closeModal()">Cancel</button></div>`);
  }
  function doCraft(slot, rarity) {
    const res = State.craftGear(slot, rarity);
    closeModal();
    if (!res) { GameAudio.sfx('error'); toast('Not enough resources', 'bad'); return; }
    GameAudio.sfx(res.pity || rarity === 'mythic' ? 'elite' : 'levelup');
    refreshTopbar();
    const g = res.gear;
    const r = State.gearRarity(g);
    modal(`
      <div class="chest-reveal ${res.pity ? 'jackpot' : ''}" style="--cc:${r.color}">
        <div class="cr-chest">🔥</div>
        <h3 class="center" style="color:${r.color}">${res.pity ? '⭐ PITY BLESSING — MYTHIC!' : 'FORGED!'}</h3>
        <div class="cr-loot">
          <div class="cr-item ${res.pity ? 'jackpot' : ''}" style="--d:.3s">
            <div class="cri-glyph">${DATA.GEAR_SLOT_INFO[g.slot].glyph}</div>
            <div class="cri-label">${esc(State.gearName(g))}</div>
            <div class="cri-amt">${r.name.toUpperCase()} · +${State.gearStatValue(g)} ${DATA.GEAR_SLOT_INFO[g.slot].main.toUpperCase()}</div>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn gold" onclick="UI.closeModal();UI.gearDetail('${g.id}')">INSPECT</button>
          <button class="btn" onclick="UI.closeModal();UI.show('inventory')">DONE</button>
        </div>
      </div>`, { sticky: true });
  }

  /* ---------- Relic Fusion ---------- */
  function openFusion(tier) {
    const ti = DATA.ITEM_TIER_INFO[tier];
    const nextT = DATA.ITEM_TIER_ORDER[DATA.ITEM_TIER_ORDER.indexOf(tier) + 1];
    if (!nextT) return;
    const nti = DATA.ITEM_TIER_INFO[nextT];
    const pool = State.fusableRelics(tier);
    if (pool.length < DATA.FUSION.need) { GameAudio.sfx('error'); toast(`Need ${DATA.FUSION.need} unequipped ${ti.name} relics`, 'bad'); return; }
    const cost = DATA.FUSION.goldCost(tier);
    if (!State.canAfford({ gold: cost })) { GameAudio.sfx('error'); toast('Not enough gold', 'bad'); return; }
    const feed = pool.slice(0, DATA.FUSION.need);
    modal(`
      <h3 class="center">🌀 Fuse <span style="color:${ti.color}">${ti.name}</span> → <span style="color:${nti.color}">${nti.name}</span></h3>
      <p class="center dim">These 3 relics will be consumed (lowest-enhanced first) for 💰${fmt(cost)}:</p>
      ${feed.map(g => `<div class="gear-drop" style="--c:${ti.color}">${DATA.GEAR_SLOT_INFO[g.slot].glyph} <b>${esc(State.gearName(g))}</b>${g.level ? ` +${g.level}` : ''}</div>`).join('')}
      <div class="modal-btns">
        <button class="btn gold" onclick="UI.doFusion('${tier}')">🌀 FUSE</button>
        <button class="btn" onclick="UI.closeModal()">Cancel</button>
      </div>`);
  }
  function doFusion(tier) {
    const res = State.fuseRelics(tier);
    closeModal();
    if (!res) { GameAudio.sfx('error'); toast('Fusion failed — relics or gold missing', 'bad'); return; }
    GameAudio.sfx('elite');
    refreshTopbar();
    const ti = DATA.ITEM_TIER_INFO[res.item.tier];
    modal(`
      <div class="chest-reveal jackpot" style="--cc:${ti.color}">
        <div class="cr-chest">🌀</div>
        <h3 class="center" style="color:${ti.color}">FUSION COMPLETE — ${ti.name.toUpperCase()}!</h3>
        <div class="cr-loot">
          <div class="cr-item jackpot" style="--d:.3s">
            <div class="cri-glyph">${DATA.GEAR_SLOT_INFO[res.gear.slot].glyph}</div>
            <div class="cri-label">${esc(res.item.name)}</div>
            <div class="cri-amt">${esc(res.item.fxDesc)}</div>
          </div>
        </div>
        <div class="modal-btns">
          <button class="btn gold" onclick="UI.closeModal();UI.gearDetail('${res.gear.id}')">INSPECT</button>
          <button class="btn" onclick="UI.closeModal();UI.show('inventory')">DONE</button>
        </div>
      </div>`, { sticky: true });
  }

  /* Comprehensive item tooltip: stat breakdown, set bonuses, lore. */
  function gearDetail(gearId) {
    const g = State.data.gear[gearId];
    if (!g) return;
    const r = State.gearRarity(g);
    const info = DATA.GEAR_SLOT_INFO[g.slot];
    const holder = State.gearEquippedBy(g.id);
    const base = g.exclusiveId
      ? DATA.gearMainStat(g.slot, 'exclusive', g.stage)
      : DATA.gearMainStat(g.slot, g.rarity, g.stage);
    const total = State.gearStatValue(g);
    const enhBonus = +(total - base).toFixed(1);
    const itemDef = g.itemId && DATA.ITEM_BY_ID[g.itemId];
    const lore = itemDef
      ? itemDef.lore
      : g.exclusiveId
        ? (DATA.EXCLUSIVE_GEAR.find(x => x.id === g.exclusiveId) || {}).flavor
        : (DATA.GEAR_LORE[g.slot] || {})[g.rarity] || '';
    const enh = DATA.gearEnhanceCost(g.level);
    const activeSets = holder ? State.gearSetBonuses(holder) : [];
    return modal(`
      <div class="gear-tooltip ${g.rarity === 'aether' ? 'aetherfx' : ''} ${g.rarity === 'ascension' ? 'ascendfx' : ''}" style="--c:${r.color}">
        <div class="gt-head">
          <div class="gt-glyph">${info.glyph}</div>
          <div>
            <b class="gt-name">${esc(State.gearName(g))}${g.level ? ` +${g.level}` : ''}</b>
            <div><span class="raritytag ${g.rarity}" style="color:${r.color}">${r.name}</span> <span class="dim">· ${info.name}${g.exclusiveId ? ' · EXCLUSIVE' : ''}${itemDef ? (itemDef.tier === 'ascension' ? ' · ASCENSION GEAR' : ' · NAMED RELIC') : ''}</span></div>
          </div>
        </div>
        ${itemDef ? `<div class="gt-fx ${itemDef.tier}"><b>✦ ${itemDef.tier === 'aether' ? 'AETHER EFFECT' : itemDef.tier === 'ascension' ? 'ASCENSION EFFECT' : 'RELIC EFFECT'}</b><p>${esc(itemDef.fxDesc)}</p></div>` : ''}
        ${itemDef && (itemDef.levelReq || itemDef.classReq) ? `<div class="gt-req">🌟 Requires <b>Level ${itemDef.levelReq}</b> champion${itemDef.classReq ? ` · <b>${DATA.ROLE_INFO[itemDef.classReq].glyph} ${DATA.ROLE_INFO[itemDef.classReq].name} EXCLUSIVE</b>` : ''}</div>` : ''}
        ${holder ? `<div class="gt-holder"><img src="${portrait(holder)}" alt=""> Equipped by <b>${esc(DATA.CHAMP_BY_ID[holder].name)}</b></div>`
                 : '<div class="gt-holder dim">Not equipped</div>'}
        <div class="gt-stats">
          <div class="gt-row"><span>Base ${info.main.toUpperCase()}</span><b>+${base}</b></div>
          <div class="gt-row"><span>Enhancement (+${g.level})</span><b class="good-text">+${enhBonus}</b></div>
          <div class="gt-row total"><span>Total ${info.main.toUpperCase()}</span><b style="color:${r.color}">+${total}</b></div>
          ${g.slot === 'boots' ? '<div class="gt-note">Boots also grant +12 HP per point of SPD.</div>' : ''}
          ${g.slot === 'talisman' ? '<div class="gt-note">Talismans also grant +3 ATK per point of CRIT.</div>' : ''}
        </div>
        <div class="gt-sets">
          <b>Set bonuses</b>
          ${DATA.SET_BONUSES.map(b => {
            const active = activeSets.some(x => x.id === b.id);
            return `<div class="gt-set ${active ? 'active' : ''}">${active ? '✦' : '·'} <b>${b.name}</b> — ${b.desc}: +${Math.round(b.atk * 100)}% ATK & +${Math.round(b.hp * 100)}% HP</div>`;
          }).join('')}
        </div>
        ${lore ? `<p class="gt-lore">"${esc(lore)}"</p>` : ''}
        <div class="modal-btns">
          ${g.level < DATA.GEAR_MAX_LEVEL ? `<button class="btn ${State.canAfford(enh) ? 'gold' : 'disabled'}" onclick="UI.gearDetailEnhance('${g.id}')">ENHANCE <small>💰${fmt(enh.gold)} ✨${enh.dust}</small></button>` : ''}
          ${!holder && !g.exclusiveId ? `<button class="btn danger" onclick="UI.gearDetailSalvage('${g.id}')">♻ SALVAGE</button>` : ''}
          <button class="btn" onclick="UI.closeModal()">CLOSE</button>
        </div>
      </div>`);
  }
  function gearDetailEnhance(gearId) {
    if (State.enhanceGear(gearId)) { GameAudio.sfx('levelup'); refreshTopbar(); gearDetail(gearId); }
    else GameAudio.sfx('error');
  }
  function gearDetailSalvage(gearId) {
    if (State.salvageGear(gearId)) { GameAudio.sfx('coin'); toast('Salvaged for dust & gold', 'good'); closeModal(); refreshTopbar(); show('inventory'); }
  }

  /* ---------------- ACHIEVEMENTS ---------------- */
  SCREENS.achievements = {
    render() {
      const claimable = State.claimableAchievements();
      const claimed = State.data.achievementsClaimed.length;
      return `
        <div class="pagehead"><button class="backbtn modern-back" onclick="UI.show('home')"><span class="arrow">←</span> BACK</button>
          <h2>Achievements <span class="count">${claimed}/${DATA.ACHIEVEMENTS.length}</span></h2>
          ${claimable ? `<div class="qpoints">🏅 ${claimable} ready</div>` : ''}</div>
        <div class="quest-list">
          ${DATA.ACHIEVEMENTS.map(a => {
            const s = State.achievementState(a);
            return `<div class="quest achievement ${s.claimed ? 'claimed' : ''}">
              <div class="q-info"><b>${esc(a.name)}</b>${a.badge ? ` <span class="badge-founder">${a.badge}</span>` : ''}
                <p>${esc(a.desc)} <span class="dim">(${fmt(s.prog)}/${fmt(a.goal)})</span></p></div>
              <div class="q-pts">💎${fmt(a.reward.diamonds)}</div>
              ${s.claimed ? '<div class="q-done">✓</div>'
                : s.done ? `<button class="btn mini gold" onclick="UI.claimAchievement('${a.id}')">CLAIM</button>`
                : `<div class="q-bar"><div style="width:${s.prog / a.goal * 100}%"></div></div>`}
            </div>`;
          }).join('')}
        </div>
        <div class="hint center">Achievements are lifetime feats — the greatest grant permanent title badges beside your name.</div>`;
    },
  };
  function claimAchievement(id) {
    const a = State.claimAchievement(id);
    if (!a) return;
    GameAudio.sfx('elite');
    toast(`🏅 ${a.name} — +💎${fmt(a.reward.diamonds)}${a.badge ? ' · Title: ' + a.badge : ''}`, 'good');
    refreshTopbar();
    show('achievements');
  }

  /* ---------------- DAILY LOGIN STREAK ---------------- */
  function showStreakModal(streak) {
    const days = DATA.LOGIN_STREAK;
    modal(`
      <div class="streak-modal">
        <h3 class="center">🗓️ Day ${((streak.count - 1) % days.length) + 1} Login Reward</h3>
        <p class="center dim">Streak: <b class="gold-text">${streak.count} day${streak.count > 1 ? 's' : ''}</b> — come back tomorrow to keep it alive!</p>
        <div class="streak-track">
          ${days.map((d, i) => {
            const state = i < streak.dayIdx ? 'past' : i === streak.dayIdx ? 'today' : 'future';
            return `<div class="streak-day ${state}">
              <div class="sd-glyph">${d.glyph}</div>
              <div class="sd-label">${i === streak.dayIdx ? '<b>TODAY</b>' : 'Day ' + d.day}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="streak-reward">
          <div class="sr-glyph">${streak.entry.glyph}</div>
          <div><b>${esc(streak.entry.label)}</b> claimed!<br>
          <span class="dim">${Object.keys(streak.entry.reward).map(k => ({ gold: '💰', xp: '📗', diamonds: '💎', scrolls: '📜', dust: '✨', chest: '🏆' }[k] || '') + ' ' + (k === 'chest' ? DATA.CHEST_BY_ID[streak.entry.reward[k]].name : fmt(streak.entry.reward[k]))).join(' · ')}</span></div>
        </div>
        <div class="modal-btns"><button class="btn gold" onclick="UI.closeStreakModal()">COLLECT</button></div>
      </div>`, { sticky: true });
  }
  function closeStreakModal() {
    closeModal();
    refreshTopbar(); renderNav();
    welcomeBack();
  }

  /* ---------------- STAGE SWEEP ---------------- */
  function doSweep() {
    const res = State.sweepStage();
    if (!res) { GameAudio.sfx('error'); toast('No sweeps left today', 'bad'); return; }
    GameAudio.sfx('coin');
    let msg = `⚡ Swept stage ${State.stageInfo(res.stage).label}! ` +
      (res.rw.gold ? `💰${fmt(res.rw.gold)} ` : '') +
      (res.rw.xp ? `📗${fmt(res.rw.xp)} ` : '') +
      (res.rw.diamonds ? `💎${fmt(res.rw.diamonds)} ` : '') +
      (res.rw.dust ? `✨${fmt(res.rw.dust)}` : '');
    if (res.gear) msg += ` · ${DATA.GEAR_SLOT_INFO[res.gear.slot].glyph} ${esc(State.gearName(res.gear))}!`;
    toast(msg, 'good');
    refreshTopbar();
    show('home');
  }

  /* ---------------- FORMATION PRESETS ---------------- */
  function presetSave(idx) {
    if (State.savePreset(idx)) { GameAudio.sfx('coin'); toast(`Team saved to preset P${idx + 1} ✓`, 'good'); show('formation'); }
    else { GameAudio.sfx('error'); toast('Add champions to your team first', 'bad'); }
  }
  function presetLoad(idx) {
    if (State.loadPreset(idx)) { GameAudio.sfx('open'); toast(`Preset P${idx + 1} loaded`, 'good'); show('formation'); }
    else { GameAudio.sfx('error'); toast(`Preset P${idx + 1} is empty — press SAVE to store your current team`, 'bad'); }
  }
  function doOptimize() {
    if (State.optimizeFormation()) { GameAudio.sfx('elite'); toast('🧠 Strongest team assembled!', 'good'); show('formation'); }
  }



  /* ---------------- public API ---------------- */
  return {
    show, toast, modal, closeModal, refreshTopbar, renderNav,
    collectIdle, collectIdleFromModal,
    openFormation, toggleFormation, confirmFormation,
    beginBattle, tickBattle, tryUlt, toggleSpeed, toggleAuto, giveUp,
    doLevelUp, doAscend, lockedInfo,
    openGearPicker, gearEquip, gearUnequip, gearEquipBlocked, gearEnhance, gearSalvage,
    doSummon, claimQuest, claimChest,
    buyPack, startPaypal, confirmPaypal, buyDiamondItem, confirmDiamondItem,
    fightArena, rerollArena,
    fightBossRush, enterTournament,
    buyChest, confirmBuyChest, openChestFlow,
    toggleSetting, exportSave, importSave, doImport, confirmReset, doReset, applyCheatCode,
    toggleRosterSort, setHeroFilter,
    showIntro, welcomeBack,
    applyViewMode,
    spawnClickParticles,
    bootDirect, loadSlot, newSlotGame, promptDelete, confirmDeleteSlot, promptDuplicate, confirmDuplicateSlot, backToMainMenu,
    continueGame, newGameQuick, openSlotsPanel, closeSlotsPanel,
    handlePostBattleContinuation, showEncouragementModal,
    openChestManager, openAllChests,
    setInvFilter, openForgeSlotPick, doCraft, gearDetail, gearDetailEnhance, gearDetailSalvage,
    claimAchievement, showStreakModal, closeStreakModal,
    doSweep, presetSave, presetLoad, doOptimize,
    selectRegion, raidDungeon, fightWarlord, fightBounty, openFusion, doFusion,
    openExpedition, expeditionTapNode, buyPromo, buyDeal, claimFreeGift,
    get battle() { return battle; },
  };
})();
