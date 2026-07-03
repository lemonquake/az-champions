/* ============================================================
   AZ CHAMPIONS — Audio (WebAudio synthesized, no assets)
   ============================================================ */
'use strict';

const GameAudio = (() => {
  let ctx = null, master = null, musicGain = null, musicTimer = null, musicOn = false;

  function ensure() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
      return true;
    } catch (e) { return false; }
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function tone(freq, dur, type, vol, slide, delay) {
    if (!ensure()) return;
    const t0 = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
    g.gain.setValueAtTime(vol || 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, freq, delay) {
    if (!ensure()) return;
    const t0 = ctx.currentTime + (delay || 0);
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1200;
    const g = ctx.createGain(); g.gain.value = vol || 0.25;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  const SFX = {
    tap:     () => tone(660, 0.06, 'sine', 0.12),
    open:    () => { tone(520, 0.08, 'sine', 0.1); tone(780, 0.1, 'sine', 0.1, null, 0.06); },
    attack:  () => noise(0.08, 0.10, 2400),
    hit:     () => { noise(0.1, 0.16, 1000); tone(180, 0.08, 'square', 0.06, 0.6); },
    crit:    () => { noise(0.14, 0.2, 1600); tone(120, 0.16, 'sawtooth', 0.12, 0.4); },
    skill:   () => { tone(440, 0.14, 'triangle', 0.12, 1.6); },
    ult:     () => { tone(90, 0.5, 'sawtooth', 0.2, 3.2); noise(0.4, 0.22, 800); tone(660, 0.3, 'triangle', 0.1, 1.5, 0.1); },
    quake:   () => { tone(55, 0.6, 'sawtooth', 0.28, 0.7); noise(0.5, 0.3, 400); },
    die:     () => tone(300, 0.3, 'triangle', 0.12, 0.35),
    heal:    () => { tone(620, 0.12, 'sine', 0.1); tone(830, 0.14, 'sine', 0.08, null, 0.08); },
    coin:    () => { tone(920, 0.07, 'square', 0.07); tone(1240, 0.1, 'square', 0.06, null, 0.06); },
    summon:  () => { tone(220, 0.5, 'sine', 0.14, 3.6); noise(0.35, 0.1, 2000, 0.2); },
    elite:   () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.14, null, i * 0.1)); },
    victory: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.35, 'triangle', 0.14, null, i * 0.12)); },
    defeat:  () => { [392, 349, 311, 262].forEach((f, i) => tone(f, 0.4, 'triangle', 0.12, null, i * 0.16)); },
    levelup: () => { [440, 554, 659].forEach((f, i) => tone(f, 0.2, 'square', 0.08, null, i * 0.07)); },
    buy:     () => { [660, 880, 1100].forEach((f, i) => tone(f, 0.15, 'sine', 0.12, null, i * 0.08)); },
    error:   () => tone(200, 0.2, 'square', 0.1, 0.7),
  };

  function sfx(name) {
    if (!State.data || !State.data.settings.sfx) return;
    ensure(); resume();
    if (SFX[name]) SFX[name]();
  }

  /* ambient music: slow generative arpeggio */
  const SCALE = [220, 261.6, 293.7, 329.6, 392, 440, 523.3];
  let step = 0;
  function musicTick() {
    if (!musicOn || !ctx) return;
    const t0 = ctx.currentTime;
    const root = SCALE[[0, 3, 4, 2][Math.floor(step / 8) % 4]];
    const note = SCALE[Math.floor(Math.random() * SCALE.length)];
    // pad
    if (step % 8 === 0) {
      [root, root * 1.5].forEach(f => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f / 2;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.05, t0 + 0.8);
        g.gain.linearRampToValueAtTime(0.0001, t0 + 3.6);
        o.connect(g); g.connect(musicGain);
        o.start(t0); o.stop(t0 + 3.8);
      });
    }
    // sparkle
    if (Math.random() < 0.65) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = note * 2;
      g.gain.setValueAtTime(0.03, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
      o.connect(g); g.connect(musicGain);
      o.start(t0); o.stop(t0 + 1);
    }
    step++;
    musicTimer = setTimeout(musicTick, 460);
  }

  function setMusic(on) {
    musicOn = on && ensure();
    clearTimeout(musicTimer);
    if (musicOn) { resume(); musicTick(); }
  }

  function unlock() { ensure(); resume(); if (State.data && State.data.settings.music && !musicOn) setMusic(true); }

  function shout(champName, abilityName) {
    // Disabled per user request
  }

  return { sfx, setMusic, unlock, shout };
})();
