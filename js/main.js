/* ============================================================
   AZ CHAMPIONS — Boot & Main Loop
   ============================================================ */
'use strict';

(function () {

  /* ---------- boot error guard ----------
     The REAL first line of defense lives inline in index.html <head>
     (window.__bootShowError), registered before any game script so
     even a parse error in data.js/ui.js shows a readable overlay.
     This wrapper is kept for runtime errors after boot. */
  function showBootError(msg) {
    if (window.__bootShowError) { window.__bootShowError(msg); return; }
    try { alert('AZ Champions failed to start: ' + msg); } catch (e) {}
  }
  window.addEventListener('error', e => showBootError(e.message || 'Unknown error'));
  window.addEventListener('unhandledrejection', e => showBootError((e.reason && e.reason.message) || 'Unknown error'));

  /* ---------- boot splash dismissal ----------
     The splash markup lives in index.html (paints before any script
     loads — no more black screen while JS downloads/parses). It is a
     pure loading indicator: NO intro, NO tap-to-start. The moment the
     game is ready it fades out and the Main Menu is already there. */
  function hideBootSplash() {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    const bar = document.getElementById('bs-bar');
    const status = document.getElementById('bs-status');
    if (bar) bar.style.width = '100%';
    if (status) status.textContent = 'READY!';
    splash.classList.add('bs-out');
    setTimeout(() => splash.remove(), 550);
  }

  function boot() {
    // 1) 3D engine is OPTIONAL: if WebGL is unavailable (some phones /
    //    WebViews), the game still boots — portraits fall back to 2D.
    try {
      Battle3D.init(document.getElementById('battle-canvas'), document.getElementById('fx-overlay'));
    } catch (e) {
      console.warn('3D renderer unavailable — running in fallback mode.', e);
    }

    UI.startGameFlow = function(isNew, quiet) {
      State.ensureQuestDay();
      State.questProgress('login', 1);

      UI.applyViewMode();
      UI.refreshTopbar();
      UI.show('home');

      if (quiet) {
        // Direct boot: no intro, no popups. The streak reward is still
        // granted (ensureLoginStreak applies it), just without the modal.
        if (isNew || !State.data.seenIntro) UI.showIntro();
        State.ensureLoginStreak();
        return;
      }

      if (isNew || !State.data.seenIntro) {
        UI.showIntro();
      }

      // Daily login streak: first session of the day shows the calendar
      // (reward already granted); otherwise fall through to welcome-back.
      const streak = State.ensureLoginStreak();
      if (streak) {
        UI.showStreakModal(streak);
      } else if (!isNew && State.data.seenIntro) {
        UI.welcomeBack();
      }
    };

    // Detect mobile device or Android App environment
    const isAndroidApp = window.location.href.startsWith('file:///android_asset/');
    const isMobileDevice = isAndroidApp || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileDevice) {
      document.body.classList.add('device-mobile');
    }

    // Mobile-first Android build: one portrait layout, always. This also
    // scrubs any stale 'pc' mode an old install may have left behind —
    // that value used to render a desktop sidebar menu on phones.
    safeStorage.setItem('az_champions_boot_view_mode', 'mobile');

    UI.applyViewMode();

    // STRAIGHT INTO THE GAME (Aljay, 2026-07-03): no title intro, no
    // main menu. Continue the freshest save — or on a first run, create
    // one silently. The first thing on screen IS the game.
    UI.bootDirect();

    // audio unlock and visual feedback on interaction
    const handlePointerDown = (e) => {
      GameAudio.unlock();
      if (typeof UI !== 'undefined' && UI.spawnClickParticles && e.clientX != null) {
        UI.spawnClickParticles(e.clientX, e.clientY);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);

    // NOTE: the old "double tap + hold" drag gesture used to live here.
    // It translated #game-frame on any two taps under 300ms apart, the
    // shift accumulated forever, and the frame ended up fully off-screen
    // — the "black screen but touch still works" bug on phones. Removed;
    // screens scroll natively and UI.show() now re-anchors the frame.

    // autosave
    setInterval(() => {
      if (State.getActiveSlot() && State.data) State.save();
    }, 15000);
    document.addEventListener('visibilitychange', () => { if (document.hidden && State.getActiveSlot() && State.data) State.save(); });
    window.addEventListener('beforeunload', () => { if (State.getActiveSlot() && State.data) State.save(); });

    // main loop
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (UI.battle) UI.tickBattle(dt);
      if (document.body.classList.contains('canvas-show') && Battle3D.isActive()) {
        Battle3D.update(dt);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- black-screen watchdog ----------
     "Black screen but touch works" has bitten this game twice (stale
     cache; an off-screen #game-frame). Instead of trusting that it can
     never happen again, verify AFTER boot that the current screen is
     actually visible inside the viewport. If it isn't: self-heal once
     (reset scrolls/transforms), and if it's STILL invisible, replace
     the silent black screen with a diagnostic overlay a player can
     screenshot. */
  function uiIsVisible() {
    const el = document.querySelector('#screens .screen');
    if (!el || !el.firstElementChild) return false;
    const probe = el.firstElementChild;
    const r = probe.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const onScreen = r.width > 0 && r.height > 0 &&
      r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
    if (!onScreen) return false;
    const cs = getComputedStyle(probe);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01;
  }

  function watchdogReport() {
    const r = el => {
      if (!el) return 'missing';
      const b = el.getBoundingClientRect();
      return Math.round(b.left) + ',' + Math.round(b.top) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height);
    };
    return 'SCREEN NOT VISIBLE — build ' + (window.AZ_BUILD || '?') +
      ' | viewport ' + window.innerWidth + 'x' + window.innerHeight +
      ' | app ' + r(document.getElementById('app')) +
      ' | frame ' + r(document.getElementById('game-frame')) +
      ' | screen ' + r(document.querySelector('#screens .screen')) +
      ' | scroll ' + Math.round(window.scrollX) + ',' + Math.round(window.scrollY) +
      ' — screenshot this and send it to the developer.';
  }

  function armBlackScreenWatchdog() {
    setTimeout(() => {
      try {
        if (uiIsVisible()) return;
        // self-heal pass: undo anything that can strand the layout
        try {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const app = document.getElementById('app');
          if (app) { app.scrollTop = 0; app.scrollLeft = 0; }
          const frame = document.getElementById('game-frame');
          if (frame) {
            frame.style.transform = '';
            frame.style.left = '';
            frame.style.top = '';
            frame.scrollTop = 0; frame.scrollLeft = 0;
          }
        } catch (e) {}
        // give layout one frame to settle, then verdict
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              if (!uiIsVisible()) window.__bootShowError(watchdogReport());
            } catch (e) {}
          }, 100);
        });
      } catch (e) {}
    }, 3000);
  }
  // re-armable from the console / remote inspector for diagnosis
  window.__azArmWatchdog = armBlackScreenWatchdog;

  function start() {
    if (typeof THREE === 'undefined') {
      showBootError('js/lib/three.min.js is missing or blocked. Re-download the game files and try again.');
      return;
    }
    try { boot(); window.__bootReady = true; }
    catch (e) { console.error(e); showBootError(e.message || e); return; }
    // Boot succeeded — re-arm the one-shot auto-retry used by __bootFail
    // (index.html) so a future stale-cache/server-blip start can self-heal.
    try { sessionStorage.removeItem('az_boot_retry'); } catch (e) {}
    hideBootSplash();
    armBlackScreenWatchdog();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
