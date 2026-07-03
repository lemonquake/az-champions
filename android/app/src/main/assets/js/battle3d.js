/* ============================================================
   AZ CHAMPIONS — 3D Battle Renderer (Three.js r128)
   Procedural low-poly champions, VFX, camera, HTML overlays.
   ============================================================ */
'use strict';

const Battle3D = (() => {

  let renderer, scene, camera, canvas, overlay;
  let unitViews = {};          // uid -> view
  let projectiles = [];
  let delayedEffects = [];
  let particles = [];
  let rings = [];
  let castingRunes = [];
  let slowMoTime = 0;
  let envGroup = null, unitGroup = null, fxGroup = null;
  let shake = 0, shakeDecay = 4;
  let camBase = new THREE.Vector3(0, 8.6, 11.2);
  let camTarget = new THREE.Vector3(0, 0.8, -0.4);
  let running = false;
  let reducedFx = false;

  /* ---------- procedural texture generator ---------- */
  const TextureGenerator = {
    cache: {},
    
    getGrass(colorHex) {
      const key = 'grass_' + colorHex;
      if (this.cache[key]) return this.cache[key];
      
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 256);
      
      const c = new THREE.Color(colorHex);
      const light = '#' + c.clone().offsetHSL(0.02, 0.05, 0.08).getHexString();
      const dark = '#' + c.clone().offsetHSL(-0.02, -0.05, -0.08).getHexString();
      
      ctx.fillStyle = light;
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const w = 2 + Math.random() * 2;
        const h = 4 + Math.random() * 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w / 2, y - h, x + w, y);
        ctx.fill();
      }
      
      ctx.fillStyle = dark;
      for (let i = 0; i < 120; i++) {
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 2, 2 + Math.random() * 2);
      }
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.cache[key] = tex;
      return tex;
    },
    
    getDirt(colorHex) {
      const key = 'dirt_' + colorHex;
      if (this.cache[key]) return this.cache[key];
      
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 256);
      
      const c = new THREE.Color(colorHex);
      const light = '#' + c.clone().offsetHSL(0.01, 0.03, 0.05).getHexString();
      const dark = '#' + c.clone().offsetHSL(-0.01, -0.03, -0.06).getHexString();
      
      for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? light : dark;
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 0.5 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.cache[key] = tex;
      return tex;
    },
    
    getStone(colorHex) {
      const key = 'stone_' + colorHex;
      if (this.cache[key]) return this.cache[key];
      
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 256, 256);
      
      const c = new THREE.Color(colorHex);
      const dark = '#' + c.clone().offsetHSL(0, 0, -0.15).getHexString();
      const light = '#' + c.clone().offsetHSL(0, 0, 0.08).getHexString();
      
      ctx.strokeStyle = dark;
      ctx.lineWidth = 2.0;
      for (let i = 0; i <= 4; i++) {
        const y = i * 64;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
        for (let j = 0; j <= 4; j++) {
          const x = j * 64 + (i % 2 === 0 ? 0 : 32);
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke();
        }
      }
      
      ctx.strokeStyle = dark;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        let x = Math.random() * 256, y = Math.random() * 256;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 3; j++) {
          x += (Math.random() - 0.5) * 12;
          y += Math.random() * 12;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.cache[key] = tex;
      return tex;
    },
    
    getBark(colorHex) {
      const key = 'bark_' + colorHex;
      if (this.cache[key]) return this.cache[key];
      
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorHex;
      ctx.fillRect(0, 0, 128, 256);
      
      const c = new THREE.Color(colorHex);
      const dark = '#' + c.clone().offsetHSL(0, 0, -0.16).getHexString();
      
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3.0;
      for (let i = 0; i < 10; i++) {
        let x = Math.random() * 128;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        for (let y = 0; y <= 256; y += 32) {
          x += (Math.random() - 0.5) * 6;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.cache[key] = tex;
      return tex;
    }
  };

  /* ---------- positions ---------- */
  function isNarrow() { return camera && camera.aspect < 0.8; }

  function slotPos(sideName, slot) {
    // Narrow (phone portrait) screens get a tighter formation so the whole
    // squad fits inside the smaller horizontal FOV.
    const narrow = isNarrow();
    const front = slot < 2;
    const xF = narrow ? [-1.25, 1.25] : [-1.5, 1.5];
    const xB = narrow ? [-2.15, 0, 2.15] : [-2.6, 0, 2.6];
    const x = front ? xF[slot] : xB[slot - 2];
    const z = front ? 2.0 : (narrow ? 3.9 : 4.1);
    return new THREE.Vector3(x, 0, sideName === 'ally' ? z : -z);
  }

  /* ---------- init ---------- */
  function init(canvasEl, overlayEl) {
    canvas = canvasEl; overlay = overlayEl;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch (e) {
      // WebGL unavailable (some phones/WebViews): run in 2D fallback mode.
      renderer = null;
      console.warn('WebGL context creation failed — 3D disabled.', e);
      return;
    }
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    camera.position.copy(camBase);
    camera.lookAt(camTarget);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 0.85);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2dd, 0.95);
    sun.position.set(6, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    scene.add(sun);

    envGroup = new THREE.Group(); scene.add(envGroup);
    unitGroup = new THREE.Group(); scene.add(unitGroup);
    fxGroup = new THREE.Group(); scene.add(fxGroup);

    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas || !renderer) return;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (camMode === 'battle') {
      fitBattleCamera();
      rehomeUnits();
    } else {
      fitShowcaseCamera(camMode === 'showcase-solo', camMode === 'showcase-menu');
    }
  }

  /* Fit the battle camera so both full squads are always on screen.
     Solves the camera distance analytically from the horizontal FOV, so a
     5-champion back row fits on any aspect ratio (phones included). */
  let camMode = 'battle';
  const CAM_DIR = new THREE.Vector3(0, 7.8, 11.6).normalize(); // target -> camera
  function fitBattleCamera() {
    if (!camera) return;
    const narrow = isNarrow();
    camera.fov = narrow ? 50 : 46;
    camera.updateProjectionMatrix();
    const isPc = document.body.classList.contains('view-mode-pc');
    const xOffset = (isPc && !narrow) ? -0.95 : 0;
    camTarget.set(xOffset, 0.8, -0.4);

    // Widest content: the ally back row (nearest to camera) + body/VFX margin.
    const rowX = (narrow ? 2.15 : 2.6) + 0.8;
    const rowZ = (narrow ? 3.9 : 4.1) + 0.5;
    // Depth of that row along the view axis is (d - along); require
    // rowX <= depth * tan(hFov/2) with a safety margin, solve for d.
    const along = (0 - 0.8) * CAM_DIR.y + (rowZ + 0.4) * CAM_DIR.z;
    const halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * 0.94;
    const dNeeded = along + rowX / halfW;
    const d = Math.max(14.0, dNeeded);
    camBase.copy(camTarget).addScaledVector(CAM_DIR, d);
  }

  /* Re-seat living units on their (possibly re-spaced) slot positions after
     an aspect change, so formations stay centered mid-battle. */
  function rehomeUnits() {
    Object.values(unitViews).forEach(v => {
      const u = v.unit;
      if (!u || u.slot === undefined || !u.side || v.dead) return;
      const pos = slotPos(u.side, u.slot);
      v.home.copy(pos);
      if (!v.anim) v.char.group.position.copy(pos);
    });
  }

  /* ---------- environment ---------- */
  function setEnvironment(envKey, noProps, bossMode) {
    if (!renderer) return;
    while (envGroup.children.length) envGroup.remove(envGroup.children[0]);
    let env = DATA.ENVIRONMENTS[envKey] || DATA.ENVIRONMENTS.plains;
    // Boss arenas: every theme has a dedicated boss variant (darker skies,
    // hotter accents, extra set-dressing) defined in DATA.ENVIRONMENTS[key].boss
    if (bossMode && env.boss) env = Object.assign({}, env, env.boss);
    scene.background = new THREE.Color(env.sky);
    scene.fog = new THREE.Fog(env.fog, bossMode ? 15 : 18, bossMode ? 42 : 46);

    const groundColor = env.ground;
    const grassFloors = ['plains', 'jungle', 'faewild'];
    const stoneFloors = ['crypt', 'foundry', 'ruins', 'sanctum', 'stormspire', 'shadowkeep', 'celestial'];

    let groundTex;
    if (grassFloors.includes(envKey)) {
      groundTex = TextureGenerator.getGrass(groundColor);
      groundTex.repeat.set(12, 12);
    } else if (stoneFloors.includes(envKey)) {
      groundTex = TextureGenerator.getStone(groundColor);
      groundTex.repeat.set(8, 8);
    } else {
      groundTex = TextureGenerator.getDirt(groundColor);
      groundTex.repeat.set(10, 10);
    }

    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(11, 12.5, 0.8, 36),
      new THREE.MeshLambertMaterial({ color: groundColor, map: groundTex })
    );
    ground.position.y = -0.4;
    ground.receiveShadow = true;
    envGroup.add(ground);

    const terraTex = groundTex.clone();
    terraTex.repeat.set(45, 45);
    const terra = new THREE.Mesh(
      new THREE.CircleGeometry(60, 24),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(env.ground).offsetHSL(0, 0, -0.045), map: terraTex })
    );
    terra.rotation.x = -Math.PI / 2;
    terra.position.y = -0.82;
    envGroup.add(terra);

    // arena ring accent
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(8.4, 0.08, 8, 48),
      new THREE.MeshBasicMaterial({ color: env.accent, transparent: true, opacity: 0.55 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.03;
    envGroup.add(ring);

    // center line
    const line = new THREE.Mesh(new THREE.BoxGeometry(16, 0.02, 0.12), new THREE.MeshBasicMaterial({ color: env.accent, transparent: true, opacity: 0.3 }));
    line.position.y = 0.02;
    envGroup.add(line);

    // boss arena set-dressing: 4 flame obelisks + inner rune ring
    if (bossMode) {
      const torchMat = new THREE.MeshLambertMaterial({ color: 0x1a1520 });
      [[-5.6, -5.6], [5.6, -5.6], [-5.6, 5.6], [5.6, 5.6]].forEach(([tx, tz]) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 3.2, 6), torchMat);
        pillar.position.set(tx, 1.6, tz);
        pillar.castShadow = true;
        envGroup.add(pillar);
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.3, 0.9, 6),
          new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 1.0 })
        );
        flame.position.set(tx, 3.6, tz);
        envGroup.add(flame);
      });
      const rune = new THREE.Mesh(
        new THREE.RingGeometry(5.4, 5.8, 48),
        new THREE.MeshBasicMaterial({ color: env.accent, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
      );
      rune.rotation.x = -Math.PI / 2;
      rune.position.y = 0.04;
      envGroup.add(rune);
    }

    // props
    if (noProps) return;
    const rnd = mulberry(envKey.length * 77 + 13);
    for (let i = 0; i < 14; i++) {
      const ang = rnd() * Math.PI * 2, dist = 10.5 + rnd() * 9;
      const x = Math.cos(ang) * dist, z = Math.sin(ang) * dist;
      let mesh;
      const c = new THREE.Color(env.ground).offsetHSL(0, 0, 0.06 + rnd() * 0.1);
      const baseY = dist > 10.5 ? -0.82 : 0; // outer props sit on lower terrain

      if (env.props === 'pillars') {
        const pillarTex = TextureGenerator.getStone('#' + c.getHexString());
        pillarTex.repeat.set(1, 4);
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4 + rnd() * 0.3, 0.5 + rnd() * 0.35, 2 + rnd() * 4, 6),
          new THREE.MeshLambertMaterial({ color: c, map: pillarTex })
        );
        mesh.position.set(x, baseY + mesh.geometry.parameters.height / 2 - 0.4, z);
      } else if (env.props === 'crystals') {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(0.5 + rnd() * 0.4, 1.6 + rnd() * 3, 5), new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 0.35 }));
        mesh.position.set(x, baseY + 0.4, z);
        mesh.rotation.z = (rnd() - 0.5) * 0.5;
      } else if (env.props === 'coral') {
        const coralTex = TextureGenerator.getDirt('#' + c.getHexString());
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.6 + rnd() * 0.7, 6, 5),
          new THREE.MeshLambertMaterial({ color: c.offsetHSL(0.05, 0.1, 0), map: coralTex })
        );
        mesh.position.set(x, baseY + 0.1, z);
        mesh.scale.y = 1.4 + rnd();
      } else if (env.props === 'icicles') {
        // frost spires: pale translucent cones in clusters
        mesh = new THREE.Group();
        const n = 2 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) {
          const h = 1.2 + rnd() * 3.2;
          const ice = new THREE.Mesh(
            new THREE.ConeGeometry(0.22 + rnd() * 0.3, h, 5),
            new THREE.MeshLambertMaterial({ color: 0xcfeaff, emissive: env.accent, emissiveIntensity: 0.18, transparent: true, opacity: 0.92 })
          );
          ice.position.set((rnd() - 0.5) * 1.2, h / 2, (rnd() - 0.5) * 1.2);
          ice.rotation.z = (rnd() - 0.5) * 0.3;
          mesh.add(ice);
        }
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'mushrooms') {
        // giant glowcap mushrooms
        mesh = new THREE.Group();
        const stemH = 0.8 + rnd() * 1.6;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.2, stemH, 6),
          new THREE.MeshLambertMaterial({ color: 0xd8cfc0 })
        );
        stem.position.y = stemH / 2;
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.45 + rnd() * 0.5, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
          new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 0.45 })
        );
        cap.position.y = stemH;
        mesh.add(stem, cap);
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'obelisks') {
        // rune-carved obelisks with glowing tips
        mesh = new THREE.Group();
        const h = 2.2 + rnd() * 2.6;
        const stoneTex = TextureGenerator.getStone('#' + c.getHexString());
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.5 + rnd() * 0.25, h, 0.5 + rnd() * 0.25),
          new THREE.MeshLambertMaterial({ color: c, map: stoneTex })
        );
        body.position.y = h / 2;
        const tip = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 0.5, 4),
          new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 0.7 })
        );
        tip.position.y = h + 0.25;
        mesh.add(body, tip);
        mesh.rotation.y = rnd() * Math.PI;
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'dunes') {
        // wind-carved dunes + the odd sun-bleached cactus
        if (i % 3 === 0) {
          mesh = new THREE.Group();
          const h = 1.2 + rnd() * 1.4;
          const cactusMat = new THREE.MeshLambertMaterial({ color: 0x5a7a3a });
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, h, 6), cactusMat);
          trunk.position.y = h / 2;
          const armH = h * 0.45;
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, armH, 6), cactusMat);
          arm.position.set(0.3, h * 0.55, 0);
          arm.rotation.z = -0.5;
          mesh.add(trunk, arm);
          mesh.position.set(x, baseY, z);
        } else {
          const duneTex = TextureGenerator.getDirt('#' + c.getHexString());
          mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.9 + rnd() * 1.4, 8, 6),
            new THREE.MeshLambertMaterial({ color: c.offsetHSL(0.02, 0.08, 0.05), map: duneTex })
          );
          mesh.scale.y = 0.28;
          mesh.position.set(x, baseY + 0.05, z);
        }
      } else if (env.props === 'statues') {
        // weathered warrior statues on plinths
        mesh = new THREE.Group();
        const stoneTex = TextureGenerator.getStone('#' + c.getHexString());
        const statMat = new THREE.MeshLambertMaterial({ color: c, map: stoneTex });
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), statMat);
        plinth.position.y = 0.25;
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.0, 0.3), statMat);
        torso.position.y = 1.0;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), statMat);
        head.position.y = 1.68;
        mesh.add(plinth, torso, head);
        mesh.rotation.y = rnd() * Math.PI * 2;
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'banners') {
        // war banners on lances
        mesh = new THREE.Group();
        const h = 2.6 + rnd() * 1.2;
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, h, 5),
          new THREE.MeshLambertMaterial({ color: 0x3a3f4a })
        );
        pole.position.y = h / 2;
        const cloth = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.9, 0.03),
          new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 0.25 })
        );
        cloth.position.set(0.3, h - 0.55, 0);
        mesh.add(pole, cloth);
        mesh.rotation.y = rnd() * Math.PI * 2;
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'lanterns') {
        // floating spirit lanterns
        const h = 1.6 + rnd() * 2.4;
        mesh = new THREE.Group();
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.34, 0.5, 0.34),
          new THREE.MeshLambertMaterial({ color: env.accent, emissive: env.accent, emissiveIntensity: 0.85, transparent: true, opacity: 0.95 })
        );
        box.position.y = h;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 4), new THREE.MeshLambertMaterial({ color: 0x2a2430 }));
        cap.position.y = h + 0.35;
        mesh.add(box, cap);
        mesh.position.set(x, baseY, z);
      } else if (env.props === 'bones') {
        // colossal ribcages breaching the ground
        mesh = new THREE.Group();
        const boneMat = new THREE.MeshLambertMaterial({ color: 0xd8d0c0 });
        const n = 2 + Math.floor(rnd() * 2);
        for (let k = 0; k < n; k++) {
          const rib = new THREE.Mesh(new THREE.TorusGeometry(0.8 + rnd() * 0.8, 0.07, 6, 12, Math.PI), boneMat);
          rib.position.set((rnd() - 0.5) * 1.2, 0, k * 0.5 - n * 0.25);
          rib.rotation.z = (rnd() - 0.5) * 0.4;
          mesh.add(rib);
        }
        mesh.rotation.y = rnd() * Math.PI * 2;
        mesh.position.set(x, baseY + 0.05, z);
      } else if (env.props === 'clouds') {
        // drifting cloudbanks below a sky arena
        mesh = new THREE.Group();
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xf5f8ff, transparent: true, opacity: 0.85 });
        const n = 3 + Math.floor(rnd() * 3);
        for (let k = 0; k < n; k++) {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(0.5 + rnd() * 0.7, 7, 5), cloudMat);
          puff.position.set((rnd() - 0.5) * 2.2, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 1.4);
          puff.scale.y = 0.6;
          mesh.add(puff);
        }
        mesh.position.set(x, baseY - 0.2 + rnd() * 1.2, z);
      } else { // rocks or trees
        if (envKey === 'plains' && i % 2 === 0) {
          // 3D Tree
          const trunkH = 1.6 + rnd() * 0.8;
          const trunkW = 0.16 + rnd() * 0.08;
          const barkColor = '#5c4033';
          const barkTex = TextureGenerator.getBark(barkColor);
          barkTex.repeat.set(1, 2);
          
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(trunkW * 0.7, trunkW, trunkH, 6),
            new THREE.MeshLambertMaterial({ color: barkColor, map: barkTex })
          );
          trunk.position.y = trunkH / 2;
          
          const leafR = 0.65 + rnd() * 0.45;
          const leafColor = '#3b6e35';
          const leafTex = TextureGenerator.getGrass(leafColor);
          const leaves = new THREE.Mesh(
            new THREE.DodecahedronGeometry(leafR, 1),
            new THREE.MeshLambertMaterial({ color: leafColor, map: leafTex })
          );
          leaves.position.y = trunkH + leafR * 0.65;
          
          mesh = new THREE.Group();
          mesh.add(trunk, leaves);
          mesh.position.set(x, baseY, z);
        } else {
          // Textured Rock
          const rockTex = TextureGenerator.getStone('#' + c.getHexString());
          mesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.5 + rnd() * 0.9, 0),
            new THREE.MeshLambertMaterial({ color: c, map: rockTex })
          );
          mesh.position.set(x, baseY + 0.2, z);
        }
      }
      mesh.castShadow = true;
      envGroup.add(mesh);
    }
  }

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- character builder ---------- */
  function mat(color, emissive, ei) {
    const m = new THREE.MeshLambertMaterial({ color });
    if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = ei || 0.4; }
    m._baseEI = emissive ? (ei || 0.4) : 0;
    m._baseEmissive = m.emissive.getHex();
    return m;
  }

  /* Pulsing emissive materials (signature heroes, legendary weapons).
     Registered at build time, animated in update(), cleared with the scene. */
  let pulseMats = [];
  let pulseEnabled = true;
  function pulse(m, speed, amp) {
    if (pulseEnabled) pulseMats.push({ mat: m, base: m.emissiveIntensity, speed: speed || 3.0, amp: amp || 0.35, phase: Math.random() * Math.PI * 2 });
    return m;
  }

  /* 10 new body archetypes — each reshapes the base rig and adds its own
     signature geometry. (slim / std / brute / crouch remain the classics.) */
  const BODY_STYLES = {
    colossus:   { bulkMul: 1.25, legMul: 1.05, torsoMul: 1.3,  shoulderMul: 1.7, heavy: true, plates: true },
    juggernaut: { bulkMul: 1.3,  legMul: 0.7,  torsoMul: 1.5,  shoulderMul: 2.0, heavy: true, lowHead: true },
    sentinel:   { bulkMul: 1.1,  torsoMul: 1.18, shoulderMul: 1.45, heavy: true, boxy: true },
    golem:      { bulkMul: 1.2,  torsoMul: 1.28, shoulderMul: 1.55, heavy: true, rocky: true },
    stalker:    { bulkMul: 0.85, legMul: 1.12, armMul: 1.3, hunch: 0.3 },
    valkyrie:   { bulkMul: 0.95, legMul: 1.08, cape: true },
    wraith:     { robe: true, float: 0.28 },
    djinn:      { smoke: true, float: 0.42, torsoMul: 1.12, shoulderMul: 1.35 },
    serpent:    { tail: true, torsoMul: 1.05 },
    sprite:     { scaleMul: 0.72, float: 0.26, wisps: true },
  };

  /* New base feet designs — attach to each standard leg. */
  function addFeet(g, kind, sx, legW, bulk, S, p, trimMat, accentMat) {
    if (!kind) return;
    const x = sx * 0.16 * bulk;
    switch (kind) {
      case 'sabatons': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(legW * 1.6, 0.1 * S, legW * 2.1), trimMat);
        b.position.set(x, 0.05 * S, 0.03);
        g.add(b);
        break;
      }
      case 'hooves': {
        const h = new THREE.Mesh(new THREE.ConeGeometry(legW * 0.95, 0.16 * S, 5), mat('#2a2024'));
        h.position.set(x, 0.08 * S, 0);
        h.rotation.x = Math.PI;
        g.add(h);
        break;
      }
      case 'talons': {
        for (let i = -1; i <= 1; i++) {
          const t = new THREE.Mesh(new THREE.ConeGeometry(0.022 * S, 0.12 * S, 4), accentMat);
          t.position.set(x + i * legW * 0.45, 0.04 * S, legW * 1.1);
          t.rotation.x = 1.25;
          g.add(t);
        }
        break;
      }
      case 'windgreaves': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(legW * 1.3, 0.16 * S, legW * 1.6), trimMat);
        b.position.set(x, 0.09 * S, 0.02);
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12 * S, legW * 1.3), accentMat);
        fin.position.set(x + sx * legW * 0.75, 0.14 * S, -0.02);
        fin.rotation.z = sx * 0.35;
        g.add(b, fin);
        break;
      }
      case 'voidsteps': {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(legW * 1.1, legW * 1.3, 0.035, 8), mat(p.accent, p.accent, 0.85));
        pad.position.set(x, 0.02, 0.02);
        g.add(pad);
        pulse(pad.material, 2.8, 0.4);
        break;
      }
      case 'magmaboots': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(legW * 1.5, 0.12 * S, legW * 1.9), mat('#33241a'));
        b.position.set(x, 0.06 * S, 0.03);
        const seam = new THREE.Mesh(new THREE.BoxGeometry(legW * 1.55, 0.02, legW * 1.95), mat('#ff8c3a', '#ff8c3a', 0.9));
        seam.position.set(x, 0.1 * S, 0.03);
        g.add(b, seam);
        pulse(seam.material, 3.4, 0.4);
        break;
      }
    }
  }

  /* New base hand designs — attach to the arm so they follow cast poses. */
  function addHands(arm, kind, armH, bulk, S, p) {
    if (!kind) return;
    switch (kind) {
      case 'gauntlets': {
        const fist = new THREE.Mesh(new THREE.BoxGeometry(0.15 * bulk, 0.15 * bulk, 0.15 * bulk), mat(p.secondary));
        fist.position.y = -armH * 0.95;
        arm.add(fist);
        break;
      }
      case 'clawtips': {
        for (let i = -1; i <= 1; i++) {
          const c = new THREE.Mesh(new THREE.ConeGeometry(0.016 * S, 0.14 * S, 4), mat('#cfd6e0'));
          c.position.set(i * 0.035 * bulk, -armH * 1.05, 0.02);
          c.rotation.x = Math.PI;
          arm.add(c);
        }
        break;
      }
      case 'fistwraps': {
        const wrap = new THREE.Mesh(new THREE.BoxGeometry(0.13 * bulk, 0.1 * bulk, 0.13 * bulk), mat(p.accent));
        wrap.position.y = -armH * 0.9;
        arm.add(wrap);
        break;
      }
      case 'stonefists': {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 * bulk, 0), mat('#6a5a48'));
        rock.position.y = -armH * 0.98;
        arm.add(rock);
        break;
      }
      case 'voidgrips': {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.075 * bulk, 7, 6), mat(p.accent, p.accent, 0.9));
        orb.position.y = -armH * 0.96;
        arm.add(orb);
        pulse(orb.material, 3.2, 0.45);
        break;
      }
      case 'runebands': {
        for (let i = 0; i < 2; i++) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(0.075 * bulk, 0.016, 5, 12), mat(p.accent, p.accent, 0.8));
          band.position.y = -armH * (0.45 + i * 0.32);
          band.rotation.x = Math.PI / 2;
          arm.add(band);
          pulse(band.material, 2.4 + i, 0.4);
        }
        break;
      }
    }
  }

  function buildCharacter(model, isEnemy, isBoss) {
    const g = new THREE.Group();
    const p = model.palette;
    const style = BODY_STYLES[model.body] || {};
    const bulk = (model.bulk || 1) * (style.bulkMul || 1);
    const height = model.height || 1;
    const crouch = model.body === 'crouch';
    const brute = model.body === 'brute' || !!style.heavy;
    const S = (isBoss ? 1.3 : 1.0) * height * (style.scaleMul || 1);
    const floatY = (style.float || 0) * S;

    const bodyMat = mat(p.primary);
    const trimMat = mat(p.secondary);
    const accentMat = mat(p.accent, p.accent, 0.25);
    const skinMat = mat(p.skin);

    // ----- lower body -----
    let legH = (crouch ? 0.34 : 0.52 * (style.legMul || 1)) * S;
    if (style.robe) {
      // wraith: hovering robe cone instead of legs
      legH = 0.42 * S;
      const robe = new THREE.Mesh(new THREE.ConeGeometry(0.34 * bulk, legH * 2.1, 8), bodyMat);
      robe.position.y = legH * 0.52;
      robe.castShadow = true;
      g.add(robe);
    } else if (style.smoke) {
      // djinn: dissolving smoke plume
      legH = 0.46 * S;
      for (let i = 0; i < 3; i++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry((0.27 - i * 0.07) * bulk, 7, 5),
          mat(p.primary, p.secondary, 0.25)
        );
        puff.material.transparent = true;
        puff.material.opacity = 0.85 - i * 0.24;
        puff.position.y = legH * (0.62 - i * 0.27);
        g.add(puff);
      }
    } else if (style.tail) {
      // serpent: coiled tail base
      legH = 0.4 * S;
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.3 * bulk, 0.13 * bulk, 6, 14), trimMat);
      coil.rotation.x = Math.PI / 2;
      coil.position.y = 0.13 * S;
      const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.09 * bulk, 0.5 * S, 6), trimMat);
      tailTip.position.set(0.28 * bulk, 0.22 * S, -0.3 * bulk);
      tailTip.rotation.x = -1.1;
      coil.castShadow = tailTip.castShadow = true;
      g.add(coil, tailTip);
    } else {
      const legW = (brute ? 0.15 : 0.13) * bulk;
      [-1, 1].forEach(sx => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), bodyMat);
        leg.position.set(sx * 0.16 * bulk, legH / 2, 0);
        leg.castShadow = true;
        g.add(leg);
        addFeet(g, model.feet, sx, legW, bulk, S, p, trimMat, accentMat);
      });
    }

    // torso
    const torsoH = (crouch ? 0.42 : 0.55) * S;
    const torsoW = (brute ? 0.62 : 0.44) * bulk * (style.torsoMul || 1);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(torsoW, torsoH, 0.30 * bulk), trimMat);
    torso.position.y = legH + torsoH / 2;
    if (crouch) torso.rotation.x = 0.5;
    if (style.hunch) torso.rotation.x = style.hunch;
    torso.castShadow = true;
    g.add(torso);

    // chest plate accent
    const chest = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.82, torsoH * 0.5, 0.06), accentMat);
    chest.position.set(0, legH + torsoH * 0.62, 0.16 * bulk);
    if (crouch) chest.rotation.x = 0.5;
    g.add(chest);

    // ----- archetype torso details -----
    if (style.plates) { // colossus: stacked armour slabs
      for (let i = 0; i < 3; i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.04 - i * 0.14), torsoH * 0.2, 0.34 * bulk), bodyMat);
        slab.position.y = legH + torsoH * (0.22 + i * 0.28);
        g.add(slab);
      }
    }
    if (style.boxy) { // sentinel: fortress waist-guard
      const waist = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 1.15, torsoH * 0.22, 0.36 * bulk), bodyMat);
      waist.position.y = legH + torsoH * 0.1;
      g.add(waist);
    }
    if (style.rocky) { // golem: stone chunks fused to the frame
      for (let i = 0; i < 4; i++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 * bulk * (1 + (i % 2) * 0.5), 0), bodyMat);
        rock.position.set((i % 2 ? 1 : -1) * torsoW * 0.44, legH + torsoH * (0.25 + i * 0.18), (i > 1 ? -1 : 1) * 0.12 * bulk);
        g.add(rock);
      }
    }
    if (style.cape) { // valkyrie: war cape
      const cape = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.92, torsoH * 1.2, 0.03), bodyMat);
      cape.position.set(0, legH + torsoH * 0.32, -0.19 * bulk);
      cape.rotation.x = 0.12;
      g.add(cape);
    }
    if (style.wisps) { // sprite: hovering glow motes
      for (let i = 0; i < 3; i++) {
        const mote = new THREE.Mesh(new THREE.SphereGeometry(0.045 * S, 6, 5), mat(p.accent, p.accent, 0.9));
        const a = i / 3 * Math.PI * 2;
        mote.position.set(Math.cos(a) * 0.38 * bulk, legH + torsoH * (0.5 + 0.25 * Math.sin(a)), Math.sin(a) * 0.38 * bulk);
        g.add(mote);
        pulse(mote.material, 2.5 + i, 0.5);
      }
    }

    // shoulders
    const shW = (brute ? 0.2 : 0.13) * (style.shoulderMul ? style.shoulderMul / (brute ? 1.4 : 1) : 1);
    [-1, 1].forEach(sx => {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(shW * bulk, 8, 6), trimMat);
      sh.position.set(sx * (torsoW / 2 + 0.05), legH + torsoH * 0.86, 0);
      g.add(sh);
    });

    // arms
    const armH = 0.42 * S * (style.armMul || 1);
    const arms = {};
    [-1, 1].forEach(sx => {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1 * bulk, armH, 0.1 * bulk), bodyMat);
      arm.geometry.translate(0, -armH / 2, 0);
      arm.position.set(sx * (torsoW / 2 + 0.08), legH + torsoH * 0.82, 0);
      arm.castShadow = true;
      g.add(arm);
      arms[sx] = arm;
      addHands(arm, model.hands, armH, bulk, S, p);
    });

    // head
    const headR = (brute ? 0.21 : 0.185) * S;
    const headY = legH + torsoH + (style.lowHead ? headR * 0.55 : headR + 0.04);
    const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 10, 8), skinMat);
    head.position.y = headY;
    head.castShadow = true;
    g.add(head);

    // hair
    if (model.hair && !['helm', 'hood', 'mask', 'skullhelm', 'oni', 'frosthelm', 'tricorn', 'jesterhat', 'veil'].includes(model.headgear)) {
      const hair = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.06, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(model.hair));
      hair.position.y = headY + headR * 0.1;
      g.add(hair);
    }

    // headgear
    switch (model.headgear) {
      case 'helm': {
        const helm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.15, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.62), trimMat);
        helm.position.y = headY + headR * 0.08;
        g.add(helm);
        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.04, headR * 0.9, headR * 1.4), accentMat);
        crest.position.y = headY + headR * 0.9;
        g.add(crest);
        break;
      }
      case 'hood': {
        const hood = new THREE.Mesh(new THREE.ConeGeometry(headR * 1.35, headR * 2.4, 8), bodyMat);
        hood.position.y = headY + headR * 0.5;
        g.add(hood);
        break;
      }
      case 'halo': {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(headR * 1.1, 0.03, 6, 24), mat(p.secondary, p.secondary, 1.0));
        halo.position.y = headY + headR * 1.7;
        halo.rotation.x = Math.PI / 2;
        g.add(halo);
        break;
      }
      case 'horns': {
        [-1, 1].forEach(sx => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05 * S, 0.28 * S, 5), accentMat);
          horn.position.set(sx * headR * 0.75, headY + headR * 0.75, 0);
          horn.rotation.z = -sx * 0.5;
          g.add(horn);
        });
        break;
      }
      case 'crown': {
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(headR * 0.92, headR * 1.0, 0.14 * S, 8), mat('#ffd94d', '#ffd94d', 0.5));
        crown.position.y = headY + headR * 0.85;
        g.add(crown);
        for (let i = 0; i < 4; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.035 * S, 0.12 * S, 4), mat('#ffd94d', '#ffd94d', 0.5));
          const a = i / 4 * Math.PI * 2;
          spike.position.set(Math.cos(a) * headR * 0.9, headY + headR * 1.05, Math.sin(a) * headR * 0.9);
          g.add(spike);
        }
        break;
      }
      case 'circlet': {
        const c = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.95, 0.022, 6, 20), accentMat);
        c.position.y = headY + headR * 0.42;
        c.rotation.x = Math.PI / 2;
        g.add(c);
        break;
      }
      case 'mask': {
        const m = new THREE.Mesh(new THREE.BoxGeometry(headR * 1.7, headR * 0.8, 0.05), trimMat);
        m.position.set(0, headY, headR * 0.85);
        g.add(m);
        break;
      }
      case 'wings': {
        [-1, 1].forEach(sx => {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(0.5 * S, 0.7 * S, 0.03), mat(p.accent, p.accent, 0.45));
          wing.position.set(sx * (torsoW / 2 + 0.24), legH + torsoH * 0.75, -0.18 * bulk);
          wing.rotation.y = sx * 0.55;
          wing.rotation.z = sx * 0.3;
          g.add(wing);
        });
        break;
      }
      case 'antlers': {
        [-1, 1].forEach(sx => {
          const main = new THREE.Mesh(new THREE.ConeGeometry(0.035 * S, 0.4 * S, 5), accentMat);
          main.position.set(sx * headR * 0.6, headY + headR * 1.0, 0);
          main.rotation.z = -sx * 0.35;
          const tine = new THREE.Mesh(new THREE.ConeGeometry(0.025 * S, 0.2 * S, 4), accentMat);
          tine.position.set(sx * headR * 0.95, headY + headR * 1.0, 0);
          tine.rotation.z = -sx * 0.9;
          g.add(main, tine);
        });
        break;
      }
      case 'visor': {
        const band = new THREE.Mesh(new THREE.BoxGeometry(headR * 2.0, headR * 0.5, 0.04), mat(p.accent, p.accent, 0.9));
        band.position.set(0, headY + headR * 0.1, headR * 0.8);
        g.add(band);
        break;
      }
      case 'plume': {
        const helm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.12, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), trimMat);
        helm.position.y = headY + headR * 0.08;
        const plume = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.35, headR * 1.6, 6), accentMat);
        plume.position.y = headY + headR * 1.6;
        plume.rotation.z = 0.25;
        g.add(helm, plume);
        break;
      }
      case 'flame': {
        const fire = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.6, headR * 1.3, 6), mat(p.secondary, p.secondary, 1.0));
        fire.position.y = headY + headR * 1.25;
        const fire2 = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.32, headR * 0.8, 5), mat(p.accent, p.accent, 1.0));
        fire2.position.y = headY + headR * 1.55;
        g.add(fire, fire2);
        break;
      }
      case 'kabuto': {
        const helm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.14, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), trimMat);
        helm.position.y = headY + headR * 0.08;
        const crest = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.7, 0.02, 5, 12, Math.PI), mat('#ffd94d', '#ffd94d', 0.6));
        crest.position.set(0, headY + headR * 0.7, headR * 0.4);
        crest.rotation.x = -0.5;
        g.add(helm, crest);
        break;
      }
      /* ----- new base head designs ----- */
      case 'oni': { // horned demon mask
        const maskM = new THREE.Mesh(new THREE.BoxGeometry(headR * 1.8, headR * 1.5, 0.06), trimMat);
        maskM.position.set(0, headY, headR * 0.82);
        [-1, 1].forEach(sx => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.045 * S, 0.24 * S, 5), mat('#f0e8d8'));
          horn.position.set(sx * headR * 0.6, headY + headR * 0.95, headR * 0.5);
          horn.rotation.z = -sx * 0.35;
          g.add(horn);
        });
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.025 * S, 0.08 * S, 4), mat('#ffffff'));
        fang.position.set(0, headY - headR * 0.55, headR * 0.9);
        g.add(maskM, fang);
        break;
      }
      case 'skullhelm': { // bleached skull worn as a helm
        const skull = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.18, 8, 6), mat('#e8e0d0'));
        skull.position.y = headY + headR * 0.05;
        skull.scale.z = 1.15;
        [-1, 1].forEach(sx => {
          const socket = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.22, 6, 5), mat('#12080a', p.accent, 0.8));
          socket.position.set(sx * headR * 0.4, headY + headR * 0.1, headR * 0.95);
          g.add(socket);
        });
        g.add(skull);
        break;
      }
      case 'tricorn': { // corsair's tricorn hat
        const brim = new THREE.Mesh(new THREE.CylinderGeometry(headR * 1.5, headR * 1.5, 0.03, 3), trimMat);
        brim.position.y = headY + headR * 0.75;
        brim.rotation.y = Math.PI / 6;
        const dome = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.8, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.5), trimMat);
        dome.position.y = headY + headR * 0.78;
        const feather = new THREE.Mesh(new THREE.ConeGeometry(0.03 * S, 0.26 * S, 4), accentMat);
        feather.position.set(headR * 0.8, headY + headR * 1.15, 0);
        feather.rotation.z = -0.6;
        g.add(brim, dome, feather);
        break;
      }
      case 'veil': { // mourning veil over the face
        const veil = new THREE.Mesh(new THREE.ConeGeometry(headR * 1.25, headR * 2.6, 8, 1, true), bodyMat);
        veil.material.transparent = true; veil.material.opacity = 0.88;
        veil.position.y = headY + headR * 0.35;
        const pin = new THREE.Mesh(new THREE.OctahedronGeometry(headR * 0.18, 0), accentMat);
        pin.position.y = headY + headR * 1.55;
        g.add(veil, pin);
        break;
      }
      case 'crescent': { // floating crescent moon sigil
        const cres = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.85, 0.035, 6, 16, Math.PI * 1.2), mat(p.accent, p.accent, 0.9));
        cres.position.y = headY + headR * 1.55;
        cres.rotation.z = Math.PI * 0.9;
        g.add(cres);
        pulse(cres.material, 2.2, 0.35);
        break;
      }
      case 'topknot': { // warrior's bound topknot
        const knot = new THREE.Mesh(new THREE.CylinderGeometry(headR * 0.22, headR * 0.3, headR * 0.55, 6), mat(model.hair || '#2b2b33'));
        knot.position.y = headY + headR * 1.15;
        const tie = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.24, 0.02, 5, 10), accentMat);
        tie.position.y = headY + headR * 0.95;
        tie.rotation.x = Math.PI / 2;
        g.add(knot, tie);
        break;
      }
      case 'mohawk': { // battle crest of stiffened hair
        for (let i = 0; i < 4; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.16, headR * (0.7 - i * 0.1), 4), mat(model.hair || p.accent));
          spike.position.set(0, headY + headR * (0.85 - i * 0.12), headR * (0.45 - i * 0.35));
          spike.rotation.x = -0.25 + i * 0.22;
          g.add(spike);
        }
        break;
      }
      case 'jesterhat': { // twin-belled trickster hood
        [-1, 1].forEach(sx => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.35, headR * 1.3, 6), trimMat);
          horn.position.set(sx * headR * 0.55, headY + headR * 0.85, 0);
          horn.rotation.z = -sx * 0.85;
          const bell = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.16, 6, 5), accentMat);
          bell.position.set(sx * headR * 1.15, headY + headR * 1.1, 0);
          g.add(horn, bell);
        });
        break;
      }
      case 'diadem': { // gemmed royal diadem
        const band = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.95, 0.028, 6, 20), mat('#ffd94d', '#ffd94d', 0.4));
        band.position.y = headY + headR * 0.5;
        band.rotation.x = Math.PI / 2;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(headR * 0.2, 0), mat(p.accent, p.accent, 0.9));
        gem.position.set(0, headY + headR * 0.55, headR * 0.95);
        g.add(band, gem);
        pulse(gem.material, 2.6, 0.35);
        break;
      }
      case 'frosthelm': { // glacial helm crowned with ice shards
        const helm = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.15, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.62), mat('#cfeaff'));
        helm.position.y = headY + headR * 0.08;
        for (let i = 0; i < 3; i++) {
          const shard = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.14, headR * (0.6 + i * 0.25), 5), mat('#e8f7ff', '#7cd5ff', 0.4));
          shard.position.set((i - 1) * headR * 0.45, headY + headR * (0.95 + (i === 1 ? 0.25 : 0)), 0);
          g.add(shard);
        }
        g.add(helm);
        break;
      }
      case 'sunhalo': { // twin rotating halos
        for (let i = 0; i < 2; i++) {
          const halo = new THREE.Mesh(new THREE.TorusGeometry(headR * (1.0 + i * 0.35), 0.022, 6, 24), mat(p.secondary, p.secondary, 1.0));
          halo.position.y = headY + headR * 1.6;
          halo.rotation.x = Math.PI / 2 + (i ? 0.5 : -0.2);
          g.add(halo);
          pulse(halo.material, 1.8 + i, 0.35);
        }
        break;
      }
      case 'runecrown': { // floating rune-stones circling the brow
        for (let i = 0; i < 4; i++) {
          const rune = new THREE.Mesh(new THREE.BoxGeometry(headR * 0.22, headR * 0.34, 0.03), mat(p.accent, p.accent, 0.85));
          const a = i / 4 * Math.PI * 2;
          rune.position.set(Math.cos(a) * headR * 1.25, headY + headR * 0.85, Math.sin(a) * headR * 1.25);
          rune.rotation.y = -a;
          g.add(rune);
          pulse(rune.material, 2.0 + i * 0.4, 0.4);
        }
        break;
      }
      case 'foxears': { // spirit-fox ears
        [-1, 1].forEach(sx => {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.32, headR * 0.8, 4), mat(model.hair || p.secondary));
          ear.position.set(sx * headR * 0.55, headY + headR * 1.05, 0);
          ear.rotation.z = -sx * 0.2;
          const inner = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.16, headR * 0.45, 4), accentMat);
          inner.position.set(sx * headR * 0.55, headY + headR * 1.0, headR * 0.08);
          g.add(ear, inner);
        });
        break;
      }
      case 'tentacles': { // deep-one crown of curling tendrils
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const tent = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.14, headR * 0.9, 5), trimMat);
          tent.position.set(Math.cos(a) * headR * 0.6, headY + headR * 0.8, Math.sin(a) * headR * 0.6);
          tent.rotation.z = Math.cos(a) * 0.7;
          tent.rotation.x = Math.sin(a) * 0.7;
          g.add(tent);
        }
        break;
      }
    }

    // weapon on right arm
    const w = buildWeapon(model.weapon, p, S);
    if (w) {
      w.position.y = -armH;
      arms[1].add(w);
    }

    // bespoke signature treatments (Aljay / Ivcan / Lemon Quake)
    if (model.signature) addSignature(g, model, { S, bulk, legH, torsoH, torsoW, headY, headR, p });

    // hovering archetypes float above the ground
    if (floatY) g.children.forEach(ch => { ch.position.y += floatY; });

    // scale & orient
    const sMul = (isBoss ? 1.25 : 1);
    g.scale.setScalar(sMul);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return { group: g, arms, head, torsoTop: legH + torsoH, height: (headY + headR + floatY) * sMul };
  }

  /* One-of-a-kind hero treatments — nothing here is shared with any other
     champion, so the three signature heroes read as unmistakable. */
  function addSignature(g, model, d) {
    const S = d.S, bulk = d.bulk, legH = d.legH, torsoH = d.torsoH,
          torsoW = d.torsoW, headY = d.headY, headR = d.headR;
    if (model.signature === 'aljay') {
      // Crimson blood armour: layered blood-steel plates over pulsing veins
      const plateMat = mat('#3a060e');
      const veinMat = mat('#ff1e3c', '#ff1e3c', 0.9);
      pulse(veinMat, 4.2, 0.55);
      for (let i = 0; i < 3; i++) {
        const plate = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.08 - i * 0.13), torsoH * 0.24, 0.36 * bulk), plateMat);
        plate.position.y = legH + torsoH * (0.2 + i * 0.3);
        const vein = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.1 - i * 0.13), 0.022, 0.37 * bulk), veinMat);
        vein.position.y = legH + torsoH * (0.32 + i * 0.3);
        g.add(plate, vein);
      }
      // spiked blood pauldrons
      [-1, 1].forEach(sx => {
        const pd = new THREE.Mesh(new THREE.SphereGeometry(0.17 * bulk, 8, 6), plateMat);
        pd.position.set(sx * (torsoW / 2 + 0.08), legH + torsoH * 0.9, 0);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045 * S, 0.3 * S, 5), veinMat);
        spike.position.set(sx * (torsoW / 2 + 0.12), legH + torsoH * 1.12, 0);
        spike.rotation.z = -sx * 0.5;
        g.add(pd, spike);
      });
      // torn crimson war-cape
      const cape = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 1.05, torsoH * 1.5, 0.028), mat('#25040a'));
      cape.position.set(0, legH + torsoH * 0.35, -0.2 * bulk);
      cape.rotation.x = 0.14;
      g.add(cape);
      // burning eyes
      [-1, 1].forEach(sx => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.14, 6, 5), mat('#ff2244', '#ff2244', 1.4));
        eye.position.set(sx * headR * 0.35, headY + headR * 0.08, headR * 0.86);
        g.add(eye);
        pulse(eye.material, 5.0, 0.5);
      });
      // orbiting blood-rune shards
      for (let i = 0; i < 3; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.055 * S, 0), veinMat);
        const a = i / 3 * Math.PI * 2;
        shard.position.set(Math.cos(a) * 0.55 * bulk, legH + torsoH * (0.75 + 0.18 * Math.sin(a)), Math.sin(a) * 0.4 * bulk);
        g.add(shard);
      }
    } else if (model.signature === 'ivcan') {
      // Voidforged obsidian plate + event-horizon ring at his back
      const obsMat = mat('#0b0714');
      const seamMat = mat('#8b5cf6', '#8b5cf6', 0.8);
      pulse(seamMat, 2.6, 0.45);
      for (let i = 0; i < 2; i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.1 - i * 0.18), torsoH * 0.3, 0.38 * bulk), obsMat);
        slab.position.y = legH + torsoH * (0.28 + i * 0.42);
        g.add(slab);
      }
      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.03, torsoH * 0.9, 0.39 * bulk), seamMat);
      seam.position.y = legH + torsoH * 0.5;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62 * S, 0.035, 6, 32), seamMat);
      ring.position.set(0, legH + torsoH * 0.72, -0.3 * bulk);
      g.add(seam, ring);
      // gravity-caught debris orbiting the horizon
      for (let i = 0; i < 4; i++) {
        const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.05 * S, 0), obsMat);
        const a = i / 4 * Math.PI * 2 + 0.5;
        shard.position.set(Math.cos(a) * 0.58 * S, legH + torsoH * 0.72 + Math.sin(a) * 0.5 * S, -0.3 * bulk);
        g.add(shard);
      }
      [-1, 1].forEach(sx => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.13, 6, 5), mat('#b98cff', '#b98cff', 1.3));
        eye.position.set(sx * headR * 0.33, headY + headR * 0.06, headR * 0.88);
        g.add(eye);
        pulse(eye.material, 3.4, 0.5);
      });
    } else if (model.signature === 'lemonquake') {
      // Seismic sovereign: fault-cracked stone plate bleeding magma light
      const stoneMat = mat('#4a3b28');
      const magmaMat = mat('#ff8c3a', '#ff8c3a', 0.95);
      pulse(magmaMat, 3.0, 0.5);
      for (let i = 0; i < 3; i++) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.12 - i * 0.14), torsoH * 0.26, 0.4 * bulk), stoneMat);
        slab.position.y = legH + torsoH * (0.22 + i * 0.3);
        slab.rotation.y = (i % 2 ? -1 : 1) * 0.06;
        const crack = new THREE.Mesh(new THREE.BoxGeometry(torsoW * (1.14 - i * 0.14), 0.02, 0.41 * bulk), magmaMat);
        crack.position.y = legH + torsoH * (0.35 + i * 0.3);
        g.add(slab, crack);
      }
      // floating fault-rocks with ember cores
      [-1, 1].forEach(sx => {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11 * S, 0), stoneMat);
        rock.position.set(sx * (torsoW / 2 + 0.3), legH + torsoH * 1.1, 0);
        const ember = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 5, 4), magmaMat);
        ember.position.set(sx * (torsoW / 2 + 0.3), legH + torsoH * 0.92, 0.05);
        g.add(rock, ember);
      });
      [-1, 1].forEach(sx => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.13, 6, 5), mat('#ffd94d', '#ffd94d', 1.2));
        eye.position.set(sx * headR * 0.34, headY + headR * 0.07, headR * 0.87);
        g.add(eye);
        pulse(eye.material, 4.4, 0.45);
      });
    }
  }

  function buildWeapon(kind, p, S) {
    const g = new THREE.Group();
    const metal = mat('#cfd6e0');
    const gold = mat(p.secondary, p.secondary, 0.35);
    const dark = mat('#3a3f4a');
    switch (kind) {
      case 'sword': {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.68 * S, 0.11), metal);
        blade.position.y = 0.4 * S;
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.14), gold);
        guard.position.y = 0.06;
        g.add(blade, guard);
        break;
      }
      case 'greatsword': {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95 * S, 0.17), metal);
        blade.position.y = 0.55 * S;
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.2), gold);
        guard.position.y = 0.08;
        g.add(blade, guard);
        break;
      }
      case 'scythe': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1 * S, 6), dark);
        pole.position.y = 0.45 * S;
        const bladeCurve = new THREE.Mesh(new THREE.TorusGeometry(0.24 * S, 0.035, 6, 12, Math.PI * 1.1), metal);
        bladeCurve.position.y = 1.0 * S;
        bladeCurve.rotation.z = Math.PI * 0.9;
        g.add(pole, bladeCurve);
        break;
      }
      case 'staff': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.05 * S, 6), dark);
        pole.position.y = 0.42 * S;
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.09 * S, 8, 6), mat(p.secondary, p.secondary, 0.9));
        orb.position.y = 0.98 * S;
        g.add(pole, orb);
        break;
      }
      case 'bow': {
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.32 * S, 0.025, 6, 14, Math.PI), gold);
        bow.rotation.z = Math.PI / 2;
        bow.position.y = 0.2 * S;
        g.add(bow);
        break;
      }
      case 'hammer': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8 * S, 6), dark);
        pole.position.y = 0.34 * S;
        const headM = new THREE.Mesh(new THREE.BoxGeometry(0.34 * S, 0.2 * S, 0.2 * S), metal);
        headM.position.y = 0.72 * S;
        g.add(pole, headM);
        break;
      }
      case 'daggers': {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.34 * S, 0.07), metal);
        b.position.y = 0.2 * S;
        g.add(b);
        break;
      }
      case 'shield': {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * S, 0.26 * S, 0.05, 10), gold);
        sh.rotation.x = Math.PI / 2;
        sh.position.y = 0.1;
        const mace = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4 * S, 0.05), metal);
        mace.position.y = 0.25 * S;
        g.add(sh, mace);
        break;
      }
      case 'orb': {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.1 * S, 10, 8), mat(p.secondary, p.secondary, 1.0));
        orb.position.y = 0.12 * S;
        g.add(orb);
        break;
      }
      case 'spear': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.25 * S, 6), dark);
        pole.position.y = 0.5 * S;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28 * S, 4), metal);
        tip.position.y = 1.2 * S;
        const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14 * S, 5), gold);
        tassel.position.y = 1.0 * S;
        tassel.rotation.x = Math.PI;
        g.add(pole, tip, tassel);
        break;
      }
      case 'katana': {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.8 * S, 0.07), metal);
        blade.position.y = 0.44 * S;
        blade.rotation.z = 0.08;
        const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 8), gold);
        guard.position.y = 0.07;
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18 * S, 6), dark);
        hilt.position.y = -0.04;
        g.add(blade, guard, hilt);
        break;
      }
      case 'axe': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.9 * S, 6), dark);
        pole.position.y = 0.38 * S;
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * S, 0.24 * S, 0.05, 3), metal);
        head.rotation.x = Math.PI / 2;
        head.position.set(0.1, 0.72 * S, 0);
        g.add(pole, head);
        break;
      }
      case 'chakram': {
        const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.18 * S, 0.03, 6, 18), mat(p.secondary, p.secondary, 0.6));
        ringM.position.y = 0.16 * S;
        const spikes = new THREE.Mesh(new THREE.TorusGeometry(0.22 * S, 0.012, 4, 8), metal);
        spikes.position.y = 0.16 * S;
        g.add(ringM, spikes);
        break;
      }
      case 'lance': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 1.35 * S, 6), gold);
        pole.position.y = 0.55 * S;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4 * S, 6), metal);
        tip.position.y = 1.35 * S;
        const guard = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.16 * S, 8), dark);
        guard.position.y = 0.2 * S;
        g.add(pole, tip, guard);
        break;
      }
      case 'cannon': {
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * S, 0.12 * S, 0.6 * S, 8), dark);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.18 * S, 0.2 * S);
        const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.1 * S, 0.025, 6, 12), mat(p.secondary, p.secondary, 0.8));
        muzzle.position.set(0, 0.18 * S, 0.5 * S);
        g.add(barrel, muzzle);
        break;
      }
      case 'harp': {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.22 * S, 0.03, 6, 14, Math.PI * 1.3), gold);
        frame.position.y = 0.24 * S;
        frame.rotation.z = -0.4;
        for (let i = 0; i < 4; i++) {
          const str = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.3 * S - i * 0.05, 0.008), mat(p.accent, p.accent, 0.9));
          str.position.set(-0.05 + i * 0.06, 0.22 * S, 0);
          g.add(str);
        }
        g.add(frame);
        break;
      }
      case 'claws': {
        for (let i = 0; i < 3; i++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.3 * S, 4), metal);
          claw.position.set(-0.05 + i * 0.05, 0.16 * S, 0.03);
          claw.rotation.x = 0.35;
          g.add(claw);
        }
        break;
      }
      case 'twinblades': {
        [-1, 1].forEach(s => {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.44 * S, 0.08), metal);
          blade.position.y = s * 0.3 * S;
          if (s < 0) blade.rotation.z = Math.PI;
          g.add(blade);
        });
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16 * S, 6), gold);
        g.add(grip);
        break;
      }
      case 'banner': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.3 * S, 6), dark);
        pole.position.y = 0.52 * S;
        const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.4 * S, 0.5 * S, 0.02), mat(p.secondary, p.secondary, 0.35));
        cloth.position.set(0.22 * S, 0.95 * S, 0);
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.05 * S, 6, 5), gold);
        finial.position.y = 1.2 * S;
        g.add(pole, cloth, finial);
        break;
      }
      case 'scepter': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.7 * S, 6), gold);
        pole.position.y = 0.28 * S;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1 * S, 0), mat(p.accent, p.accent, 1.0));
        gem.position.y = 0.7 * S;
        const cradle = new THREE.Mesh(new THREE.TorusGeometry(0.08 * S, 0.015, 5, 10), metal);
        cradle.position.y = 0.62 * S;
        cradle.rotation.x = Math.PI / 2;
        g.add(pole, gem, cradle);
        break;
      }
      case 'crossbow': {
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.5 * S), dark);
        stock.position.set(0, 0.14 * S, 0.1 * S);
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.22 * S, 0.02, 5, 12, Math.PI), gold);
        bow.position.set(0, 0.14 * S, 0.34 * S);
        bow.rotation.x = Math.PI / 2;
        g.add(stock, bow);
        break;
      }
      /* ===== 30 new base weapon designs ===== */
      case 'elderstaff': { // Aljay — gnarled Elder staff with a pulsing blood heart
        const wood = mat('#241016');
        const bloodMat = mat('#ff1e3c', '#ff1e3c', 1.1);
        pulse(bloodMat, 4.0, 0.6);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.052, 1.25 * S, 6), wood);
        pole.position.y = 0.5 * S;
        pole.rotation.z = 0.05;
        const knot = new THREE.Mesh(new THREE.TorusGeometry(0.06 * S, 0.02, 5, 10), wood);
        knot.position.y = 0.75 * S;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 * S, 0), bloodMat);
        gem.position.y = 1.22 * S;
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.17 * S, 0.014, 5, 16), bloodMat);
        halo.position.y = 1.22 * S;
        for (let i = 0; i < 3; i++) { // claw cradle gripping the heart
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.18 * S, 4), wood);
          const a = i / 3 * Math.PI * 2;
          claw.position.set(Math.cos(a) * 0.08 * S, 1.08 * S, Math.sin(a) * 0.08 * S);
          claw.rotation.z = Math.cos(a) * -0.5;
          claw.rotation.x = Math.sin(a) * 0.5;
          g.add(claw);
        }
        g.add(pole, knot, gem, halo);
        break;
      }
      case 'voidreaver': { // Ivcan — obsidian slab blade with a pulsing void edge
        const obs = mat('#0b0714');
        const edge = mat('#8b5cf6', '#8b5cf6', 0.9);
        pulse(edge, 2.8, 0.5);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0 * S, 0.2), obs);
        blade.position.y = 0.58 * S;
        const glow = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.02 * S, 0.22), edge);
        glow.position.y = 0.58 * S;
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.22), obs);
        guard.position.y = 0.08;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.05 * S, 0), edge);
        gem.position.y = 0.02;
        g.add(blade, glow, guard, gem);
        break;
      }
      case 'tectonicmaul': { // Lemon Quake — quarry-stone maul veined with magma
        const stone = mat('#4a3b28');
        const magma = mat('#ff8c3a', '#ff8c3a', 1.0);
        pulse(magma, 3.2, 0.5);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.9 * S, 6), mat('#2a2018'));
        pole.position.y = 0.36 * S;
        const headM = new THREE.Mesh(new THREE.BoxGeometry(0.44 * S, 0.26 * S, 0.26 * S), stone);
        headM.position.y = 0.78 * S;
        const vein = new THREE.Mesh(new THREE.BoxGeometry(0.46 * S, 0.03, 0.27 * S), magma);
        vein.position.y = 0.78 * S;
        const vein2 = new THREE.Mesh(new THREE.BoxGeometry(0.45 * S, 0.26 * S, 0.03), magma);
        vein2.position.y = 0.78 * S;
        g.add(pole, headM, vein, vein2);
        break;
      }
      case 'stormglaive': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2 * S, 6), dark);
        pole.position.y = 0.48 * S;
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.09 * S, 0.5 * S, 4), metal);
        blade.position.y = 1.22 * S;
        blade.scale.z = 0.35;
        const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34 * S, 0.02), mat('#ffeb3b', '#ffeb3b', 1.0));
        bolt.position.set(0.05, 1.05 * S, 0);
        bolt.rotation.z = 0.5;
        g.add(pole, blade, bolt);
        pulse(bolt.material, 5.5, 0.5);
        break;
      }
      case 'phoenixbow': {
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.36 * S, 0.028, 6, 16, Math.PI), mat('#ff7043', '#ff7043', 0.6));
        bow.rotation.z = Math.PI / 2;
        bow.position.y = 0.22 * S;
        [-1, 1].forEach(s => {
          const wing = new THREE.Mesh(new THREE.ConeGeometry(0.05 * S, 0.2 * S, 4), mat('#ffd166', '#ffd166', 0.8));
          wing.position.set(0, 0.22 * S + s * 0.38 * S, 0);
          wing.rotation.z = s > 0 ? 0 : Math.PI;
          g.add(wing);
        });
        g.add(bow);
        pulse(bow.material, 3.6, 0.4);
        break;
      }
      case 'soulscythe': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 1.2 * S, 6), mat('#1a1024'));
        pole.position.y = 0.48 * S;
        const blade = new THREE.Mesh(new THREE.TorusGeometry(0.26 * S, 0.04, 6, 12, Math.PI * 1.2), mat('#b8f5e8', '#66ffd8', 0.7));
        blade.position.y = 1.08 * S;
        blade.rotation.z = Math.PI * 0.85;
        const skullO = new THREE.Mesh(new THREE.SphereGeometry(0.06 * S, 6, 5), mat('#e8e0d0'));
        skullO.position.y = 1.02 * S;
        g.add(pole, blade, skullO);
        pulse(blade.material, 2.4, 0.4);
        break;
      }
      case 'runehammer': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.85 * S, 6), dark);
        pole.position.y = 0.35 * S;
        const headM = new THREE.Mesh(new THREE.BoxGeometry(0.38 * S, 0.22 * S, 0.22 * S), metal);
        headM.position.y = 0.75 * S;
        for (let i = 0; i < 2; i++) {
          const rune = new THREE.Mesh(new THREE.BoxGeometry(0.05 * S, 0.1 * S, 0.01), mat(p.accent, p.accent, 1.0));
          rune.position.set(-0.08 * S + i * 0.16 * S, 0.75 * S, 0.115 * S);
          g.add(rune);
          pulse(rune.material, 2.0 + i, 0.5);
        }
        g.add(pole, headM);
        break;
      }
      case 'celestorb': {
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.11 * S, 10, 8), mat(p.secondary, p.secondary, 1.1));
        orb.position.y = 0.14 * S;
        for (let i = 0; i < 2; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17 * S, 0.012, 5, 18), mat(p.accent, p.accent, 0.8));
          ring.position.y = 0.14 * S;
          ring.rotation.x = i ? 1.2 : 0.4;
          ring.rotation.y = i * 0.8;
          g.add(ring);
          pulse(ring.material, 2.2 + i, 0.4);
        }
        g.add(orb);
        pulse(orb.material, 3.0, 0.45);
        break;
      }
      case 'wyrmlance': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.06, 1.4 * S, 6), mat('#6a2a1a'));
        pole.position.y = 0.56 * S;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42 * S, 5), gold);
        tip.position.y = 1.42 * S;
        const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.1 * S, 0.2 * S, 5), mat('#ff6b35', '#ff6b35', 0.5));
        jaw.position.y = 1.1 * S;
        jaw.rotation.x = Math.PI;
        g.add(pole, tip, jaw);
        pulse(jaw.material, 3.0, 0.35);
        break;
      }
      case 'eclipseblades': { // twin curved blades, sun & moon
        [-1, 1].forEach(s => {
          const arc = new THREE.Mesh(
            new THREE.TorusGeometry(0.2 * S, 0.03, 5, 10, Math.PI * 0.9),
            s > 0 ? mat('#ffd166', '#ffd166', 0.6) : mat('#b39ddb', '#b39ddb', 0.6)
          );
          arc.position.y = s * 0.26 * S + 0.1 * S;
          arc.rotation.z = s > 0 ? -0.4 : Math.PI + 0.4;
          g.add(arc);
          pulse(arc.material, 2.6, 0.35);
        });
        break;
      }
      case 'trident': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.25 * S, 6), gold);
        pole.position.y = 0.5 * S;
        for (let i = -1; i <= 1; i++) {
          const prong = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.3 * S, 4), metal);
          prong.position.set(i * 0.09 * S, 1.22 * S, 0);
          if (i !== 0) prong.rotation.z = -i * 0.18;
          g.add(prong);
        }
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.22 * S, 0.03, 0.05), metal);
        cross.position.y = 1.05 * S;
        g.add(pole, cross);
        break;
      }
      case 'flail': {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.5 * S, 6), dark);
        handle.position.y = 0.2 * S;
        for (let i = 0; i < 3; i++) {
          const link = new THREE.Mesh(new THREE.SphereGeometry(0.025 * S, 5, 4), metal);
          link.position.set(0.05 + i * 0.05, 0.48 * S + i * 0.07 * S, 0);
          g.add(link);
        }
        const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 * S, 0), metal);
        ball.position.set(0.22, 0.72 * S, 0);
        g.add(handle, ball);
        break;
      }
      case 'warfan': {
        for (let i = 0; i < 5; i++) {
          const rib = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.36 * S, 0.012), gold);
          const a = -0.7 + i * 0.35;
          rib.position.set(Math.sin(a) * 0.16 * S, 0.2 * S + Math.cos(a) * 0.16 * S, 0);
          rib.rotation.z = -a;
          g.add(rib);
        }
        const pin = new THREE.Mesh(new THREE.SphereGeometry(0.035 * S, 6, 5), metal);
        pin.position.y = 0.06 * S;
        g.add(pin);
        break;
      }
      case 'kusarigama': {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45 * S, 6), dark);
        handle.position.y = 0.18 * S;
        const sickle = new THREE.Mesh(new THREE.TorusGeometry(0.14 * S, 0.028, 5, 10, Math.PI * 0.9), metal);
        sickle.position.y = 0.45 * S;
        sickle.rotation.z = Math.PI * 0.75;
        for (let i = 0; i < 4; i++) {
          const link = new THREE.Mesh(new THREE.TorusGeometry(0.02 * S, 0.008, 4, 6), metal);
          link.position.set(0.06 + i * 0.045, 0.02 * S - i * 0.03 * S, 0);
          g.add(link);
        }
        g.add(handle, sickle);
        break;
      }
      case 'greatbow': {
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.5 * S, 0.03, 6, 18, Math.PI), gold);
        bow.rotation.z = Math.PI / 2;
        bow.position.y = 0.24 * S;
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.16 * S, 6), dark);
        grip.position.y = 0.24 * S;
        g.add(bow, grip);
        break;
      }
      case 'twinaxes': {
        [-1, 1].forEach(s => {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.5 * S, 6), dark);
          pole.position.y = s * 0.22 * S + 0.15 * S;
          const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * S, 0.14 * S, 0.04, 3), metal);
          blade.rotation.x = Math.PI / 2;
          blade.position.set(0.07, s * 0.34 * S + 0.15 * S, 0);
          g.add(pole, blade);
        });
        break;
      }
      case 'morningstar': {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7 * S, 6), dark);
        handle.position.y = 0.28 * S;
        const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13 * S, 0), metal);
        ball.position.y = 0.72 * S;
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * Math.PI * 2;
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.1 * S, 4), metal);
          spike.position.set(Math.cos(a) * 0.15 * S, 0.72 * S, Math.sin(a) * 0.15 * S);
          spike.rotation.z = -Math.cos(a) * 1.4;
          spike.rotation.x = Math.sin(a) * 1.4;
          g.add(spike);
        }
        g.add(handle, ball);
        break;
      }
      case 'whip': {
        let px = 0, py = 0.15 * S;
        for (let i = 0; i < 6; i++) {
          const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.022 - i * 0.002, 0.022 - i * 0.002, 0.14 * S, 5), mat('#6a3a1a'));
          seg.position.set(px, py, 0);
          seg.rotation.z = 0.5 + i * 0.28;
          g.add(seg);
          px += Math.sin(0.5 + i * 0.28) * 0.12 * S;
          py += Math.cos(0.5 + i * 0.28) * 0.1 * S;
        }
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08 * S, 4), gold);
        tip.position.set(px, py, 0);
        g.add(tip);
        break;
      }
      case 'tome': {
        const cover = new THREE.Mesh(new THREE.BoxGeometry(0.22 * S, 0.3 * S, 0.06), mat(p.secondary));
        cover.position.y = 0.22 * S;
        cover.rotation.y = 0.4;
        const pages = new THREE.Mesh(new THREE.BoxGeometry(0.19 * S, 0.27 * S, 0.04), mat('#f0e8d0'));
        pages.position.set(0.005, 0.22 * S, 0.012);
        pages.rotation.y = 0.4;
        const sigil = new THREE.Mesh(new THREE.TorusGeometry(0.05 * S, 0.012, 5, 10), mat(p.accent, p.accent, 0.9));
        sigil.position.set(0, 0.22 * S, 0.05);
        sigil.rotation.y = 0.4;
        g.add(cover, pages, sigil);
        pulse(sigil.material, 2.8, 0.4);
        break;
      }
      case 'lantern': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55 * S, 6), dark);
        pole.position.y = 0.22 * S;
        pole.rotation.z = 0.5;
        const cage = new THREE.Mesh(new THREE.BoxGeometry(0.13 * S, 0.17 * S, 0.13 * S), dark);
        cage.position.set(0.24 * S, 0.38 * S, 0);
        const flame = new THREE.Mesh(new THREE.SphereGeometry(0.05 * S, 6, 5), mat(p.accent, p.accent, 1.2));
        flame.position.set(0.24 * S, 0.38 * S, 0);
        g.add(pole, cage, flame);
        pulse(flame.material, 4.5, 0.6);
        break;
      }
      case 'boomerang': {
        [-0.5, 0.5].forEach(a => {
          const armB = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3 * S, 0.03), gold);
          armB.position.set(Math.sin(a) * 0.1 * S, 0.2 * S + Math.cos(a) * 0.08 * S, 0);
          armB.rotation.z = a;
          g.add(armB);
        });
        break;
      }
      case 'scimitar': {
        const blade = new THREE.Mesh(new THREE.TorusGeometry(0.3 * S, 0.032, 5, 10, Math.PI * 0.55), metal);
        blade.position.y = 0.16 * S;
        blade.rotation.z = -0.5;
        const guard = new THREE.Mesh(new THREE.SphereGeometry(0.05 * S, 6, 5), gold);
        guard.position.y = 0.08;
        g.add(blade, guard);
        break;
      }
      case 'bonestaff': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 1.05 * S, 6), mat('#d8d0c0'));
        pole.position.y = 0.42 * S;
        const skullT = new THREE.Mesh(new THREE.SphereGeometry(0.09 * S, 7, 6), mat('#e8e0d0'));
        skullT.position.y = 0.98 * S;
        skullT.scale.z = 1.15;
        [-1, 1].forEach(sx => {
          const rib = new THREE.Mesh(new THREE.TorusGeometry(0.06 * S, 0.012, 4, 8, Math.PI), mat('#d8d0c0'));
          rib.position.set(sx * 0.04 * S, 0.8 * S, 0);
          rib.rotation.z = sx * 0.6;
          g.add(rib);
        });
        g.add(pole, skullT);
        break;
      }
      case 'crystalwand': {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.03, 0.4 * S, 6), dark);
        handle.position.y = 0.16 * S;
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.08 * S, 0), mat(p.accent, p.accent, 1.0));
        crystal.position.y = 0.46 * S;
        crystal.scale.y = 1.7;
        g.add(handle, crystal);
        pulse(crystal.material, 3.4, 0.5);
        break;
      }
      case 'chainblade': {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3 * S, 6), dark);
        handle.position.y = 0.12 * S;
        for (let i = 0; i < 4; i++) {
          const seg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12 * S, 0.028), metal);
          seg.position.set(Math.sin(i * 0.35) * 0.08 * S, 0.32 * S + i * 0.11 * S, 0);
          seg.rotation.z = i * 0.35;
          g.add(seg);
        }
        g.add(handle);
        break;
      }
      case 'warhorn': {
        const horn = new THREE.Mesh(new THREE.TorusGeometry(0.16 * S, 0.05 * S, 6, 12, Math.PI * 1.3), gold);
        horn.position.y = 0.22 * S;
        horn.rotation.z = -0.6;
        const mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * S, 0.06 * S, 0.06, 8), metal);
        mouth.position.set(0.14 * S, 0.38 * S, 0);
        mouth.rotation.z = 1.2;
        g.add(horn, mouth);
        break;
      }
      case 'sickles': {
        [-1, 1].forEach(s => {
          const blade = new THREE.Mesh(new THREE.TorusGeometry(0.13 * S, 0.024, 5, 8, Math.PI), metal);
          blade.position.y = 0.18 * S + s * 0.06 * S;
          blade.rotation.z = s > 0 ? 0.4 : Math.PI - 0.4;
          g.add(blade);
        });
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.2 * S, 6), dark);
        grip.position.y = 0.1 * S;
        g.add(grip);
        break;
      }
      case 'javelin': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.0 * S, 6), gold);
        pole.position.y = 0.4 * S;
        pole.rotation.x = -0.4;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2 * S, 4), metal);
        tip.position.set(0, 0.86 * S, 0.19 * S);
        tip.rotation.x = -0.4;
        g.add(pole, tip);
        break;
      }
      case 'shuriken': {
        for (let i = 0; i < 4; i++) {
          const a = i / 4 * Math.PI * 2;
          const point = new THREE.Mesh(new THREE.ConeGeometry(0.035 * S, 0.14 * S, 4), metal);
          point.position.set(Math.cos(a) * 0.08 * S, 0.18 * S + Math.sin(a) * 0.08 * S, 0);
          point.rotation.z = -a - Math.PI / 2;
          g.add(point);
        }
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035 * S, 0.035 * S, 0.02, 8), gold);
        hub.rotation.x = Math.PI / 2;
        hub.position.y = 0.18 * S;
        g.add(hub);
        break;
      }
      case 'warpick': {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.8 * S, 6), dark);
        pole.position.y = 0.32 * S;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05 * S, 0.34 * S, 5), metal);
        spike.position.set(0.16 * S, 0.7 * S, 0);
        spike.rotation.z = 1.35;
        const counter = new THREE.Mesh(new THREE.BoxGeometry(0.1 * S, 0.08 * S, 0.08 * S), metal);
        counter.position.set(-0.07 * S, 0.7 * S, 0);
        g.add(pole, spike, counter);
        break;
      }
      case 'fists': return null;
    }
    return g;
  }

  /* ---------- overlay elements (HP bars, damage numbers) ---------- */
  function makeHpBar(view, isEnemy, isBoss) {
    const el = document.createElement('div');
    el.className = 'hpbar' + (isEnemy ? ' enemy' : '') + (isBoss ? ' boss' : '');
    el.innerHTML = '<div class="hpfill"></div><div class="shieldfill"></div><div class="energyfill"></div>';
    overlay.appendChild(el);
    view.hpEl = el;
    view.hpFill = el.querySelector('.hpfill');
    view.shieldFill = el.querySelector('.shieldfill');
    view.energyFill = el.querySelector('.energyfill');
  }

  function floatText(worldPos, text, cls) {
    if (!overlay || !camera) return;
    const el = document.createElement('div');
    el.className = 'dmgnum ' + cls;
    el.textContent = text;
    const sp = toScreen(worldPos);
    el.style.left = sp.x + 'px';
    el.style.top = sp.y + 'px';
    el.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  const _v = new THREE.Vector3();
  function toScreen(pos) {
    _v.copy(pos).project(camera);
    return {
      x: (_v.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (-_v.y * 0.5 + 0.5) * canvas.clientHeight,
    };
  }

  /* ---------- battle setup ---------- */
  function loadBattle(battle, envKey, bossMode) {
    if (!renderer) return; // fallback mode: sim still runs, no 3D scene
    clearAll();
    resetCamera();
    setEnvironment(envKey, false, bossMode);
    reducedFx = State.data && State.data.settings.reducedFx;
    battle.units.forEach(u => {
      const isEnemy = u.side === 'enemy';
      const c = buildCharacter(u.model, isEnemy, u.isBoss);
      const pos = slotPos(u.side, u.slot);
      c.group.position.copy(pos);
      c.group.rotation.y = isEnemy ? 0 : Math.PI;
      unitGroup.add(c.group);
      const view = {
        uid: u.uid, unit: u, char: c, home: pos.clone(),
        anim: null, bobPhase: Math.random() * Math.PI * 2,
        flash: 0, dead: false,
        visualHp: u.hp, targetHp: u.hp
      };
      unitViews[u.uid] = view;
      makeHpBar(view, isEnemy, u.isBoss);
    });
    running = true;
  }

  function clearAll() {
    Object.values(unitViews).forEach(v => { if (v.hpEl) v.hpEl.remove(); });
    unitViews = {};
    if (!renderer) return;
    projectiles.forEach(p => fxGroup.remove(p.mesh));
    projectiles = [];
    delayedEffects = [];
    particles.forEach(p => fxGroup.remove(p.points));
    particles = [];
    rings.forEach(r => fxGroup.remove(r.mesh));
    rings = [];
    castingRunes.forEach(cr => fxGroup.remove(cr.mesh));
    castingRunes = [];
    pulseMats = [];
    while (unitGroup.children.length) unitGroup.remove(unitGroup.children[0]);
    while (fxGroup.children.length) fxGroup.remove(fxGroup.children[0]);
    if (overlay) overlay.querySelectorAll('.dmgnum').forEach(e => e.remove());
  }

  function stop() { running = false; clearAll(); }

  /* ---------- VFX ---------- */
  function burst(pos, color, count, speed, up) {
    if (reducedFx) count = Math.floor(count / 2);
    const geo = new THREE.BufferGeometry();
    const n = count;
    const positions = new Float32Array(n * 3);
    const vels = [];
    for (let i = 0; i < n; i++) {
      positions[i * 3] = pos.x; positions[i * 3 + 1] = pos.y; positions[i * 3 + 2] = pos.z;
      vels.push(new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        Math.random() * speed * (up || 0.9),
        (Math.random() - 0.5) * speed
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({ color, size: 0.14, transparent: true, opacity: 0.95 });
    const points = new THREE.Points(geo, m);
    fxGroup.add(points);
    particles.push({ points, vels, life: 0.8, maxLife: 0.8 });
  }

  function groundRing(pos, color, maxR) {
    const mesh = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.25, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, 0.05, pos.z);
    fxGroup.add(mesh);
    rings.push({ mesh, life: 0.6, maxLife: 0.6, maxR: maxR || 3 });
  }

  function spawnProjectile(fromV, toV, color, arc, fromUnit) {
    let mesh;
    const role = fromUnit && fromUnit.role ? fromUnit.role.toLowerCase() : '';
    const faction = fromUnit && fromUnit.faction ? fromUnit.faction.toLowerCase() : '';

    if (role === 'ranger' || role === 'marksman') {
      // 3D Arrow Model
      const arrowGroup = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8),
        new THREE.MeshBasicMaterial({ color: '#8b5a2b' })
      );
      shaft.rotation.x = Math.PI / 2;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.12, 8),
        new THREE.MeshBasicMaterial({ color: color })
      );
      tip.position.z = 0.25;
      tip.rotation.x = Math.PI / 2;
      arrowGroup.add(shaft);
      arrowGroup.add(tip);
      mesh = arrowGroup;
    } else {
      // Elemental Magic Bolts
      if (faction === 'fire') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.15, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#ff4500' })
        );
      } else if (faction === 'water' || faction === 'aether' || faction === 'cosmic') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#00e5ff', transparent: true, opacity: 0.8 })
        );
      } else if (faction === 'nature' || faction === 'wind') {
        mesh = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.24, 6),
          new THREE.MeshBasicMaterial({ color: '#32cd32' })
        );
      } else if (faction === 'electric') {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.04, 0.25, 6),
          new THREE.MeshBasicMaterial({ color: '#ffff00' })
        );
        mesh.rotation.x = Math.PI / 2;
      } else if (faction === 'rock') {
        mesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.12),
          new THREE.MeshBasicMaterial({ color: '#8b8589' })
        );
      } else if (faction === 'holy') {
        mesh = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.12),
          new THREE.MeshBasicMaterial({ color: '#f5c542' })
        );
      } else if (faction === 'dark') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 8, 8),
          new THREE.MeshBasicMaterial({ color: '#8a2be2' })
        );
      } else {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 6, 5),
          new THREE.MeshBasicMaterial({ color })
        );
      }
    }

    const from = fromV.clone(); from.y = 1.1;
    const to = toV.clone(); to.y = 1.0;
    mesh.position.copy(from);
    fxGroup.add(mesh);
    projectiles.push({ mesh, from, to, t: 0, dur: 0.28, arc: arc || 0.8, color, lastPos: null });
  }

  function slashEffect(pos, color) {
    if (reducedFx) return;
    const geo = new THREE.BufferGeometry();
    const count = 12;
    const positions = new Float32Array(count * 3);
    const vels = [];
    const angle = Math.random() * Math.PI * 2;
    const slashLength = 1.0;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1)) - 0.5;
      positions[i * 3] = pos.x + Math.cos(angle) * t * slashLength;
      positions[i * 3 + 1] = pos.y + Math.sin(angle) * t * slashLength;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.1;
      
      vels.push(new THREE.Vector3(
        Math.cos(angle + Math.PI/2) * (Math.random() * 0.8 + 0.4) * (Math.random() < 0.5 ? 1 : -1),
        (Math.random() - 0.2) * 0.5,
        Math.sin(angle + Math.PI/2) * (Math.random() * 0.8 + 0.4) * (Math.random() < 0.5 ? 1 : -1)
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({ color, size: 0.16, transparent: true, opacity: 0.95 });
    const points = new THREE.Points(geo, m);
    fxGroup.add(points);
    particles.push({ points, vels, life: 0.45, maxLife: 0.45 });
  }

  function addShake(amount) { shake = Math.min(1.2, shake + amount); }

  /* ---------- event processing ---------- */
  function unitCenter(view) {
    return view.char.group.position.clone().add(new THREE.Vector3(0, view.char.height * 0.6, 0));
  }

  function processEvents(events, hooks) {
    hooks = hooks || {};
    // Fallback mode (no WebGL): still drive game-critical hooks so battles
    // resolve normally — just skip the 3D visuals.
    if (!renderer) {
      for (const e of events) {
        if (e.t === 'end' && hooks.end) hooks.end(e.victory);
        else if (e.t === 'ult' && hooks.sfx) hooks.sfx('ult');
        else if (e.t === 'basic' && hooks.sfx) hooks.sfx('attack');
        else if (e.t === 'dmg' && hooks.sfx && !e.dot) hooks.sfx(e.crit ? 'crit' : 'hit');
        else if (e.t === 'die' && hooks.sfx) hooks.sfx('die');
      }
      return;
    }

    const handledEvents = new Set();

    const scheduleEvent = (delayTime, evt) => {
      handledEvents.add(evt);
      delayedEffects.push({
        delay: delayTime,
        run: () => {
          processSingleEvent(evt, hooks);
        }
      });
    };

    function processSingleEvent(e, hooks) {
      const fromV = e.from && unitViews[e.from];
      const toV = e.to && unitViews[e.to];
      const uV = e.unit && unitViews[e.unit];
      switch (e.t) {
        case 'dmg':
          if (toV) {
            toV.flash = 0.22;
            const c = unitCenter(toV);
            const cls = e.crit ? 'crit' : (e.dot ? 'dot ' + e.kind : (e.kind === 'reflect' ? 'reflect' : ''));
            floatText(c, formatNum(e.amount), cls);
            
            const fromUnit = e.from && unitViews[e.from] && unitViews[e.from].unit;
            if (fromUnit && fromUnit.pos === 'front' && !e.dot) {
              slashEffect(c, fromUnit.model.palette.secondary || '#ff6b6b');
            } else if (!e.dot) {
              burst(c, e.crit ? '#ffd94d' : '#ff6b6b', e.crit ? 12 : 5, e.crit ? 2.4 : 1.4);
            }

            if (e.crit) {
              addShake(0.24);
              const flashEl = document.getElementById('crit-flash');
              if (flashEl) {
                flashEl.classList.remove('flash-active');
                void flashEl.offsetWidth;
                flashEl.classList.add('flash-active');
              }
              const radialEl = document.getElementById('radial-blur');
              if (radialEl) {
                radialEl.classList.add('active');
                setTimeout(() => radialEl.classList.remove('active'), 220);
              }
              slowMoTime = 0.24;
            }
            if (e.kind === 'ult') addShake(0.12);
            if (hooks.sfx && !e.dot) hooks.sfx(e.crit ? 'crit' : 'hit');
            
            if (toV.targetHp !== undefined) {
              toV.targetHp = Math.max(0, toV.targetHp - e.amount);
            }
          }
          break;
        case 'heal':
          if (toV) {
            floatText(unitCenter(toV), '+' + formatNum(e.amount), 'heal');
            burst(unitCenter(toV), '#7dffa8', 8, 1.2, 1.4);
            if (toV.targetHp !== undefined) {
              const u = toV.unit;
              toV.targetHp = Math.min(u.maxHp, toV.targetHp + e.amount);
            }
          }
          break;
        case 'shield':
          if (toV) {
            floatText(unitCenter(toV), '🛡', 'shieldtxt');
            burst(unitCenter(toV), '#8fdcff', 6, 1.0, 1.2);
          }
          break;
        case 'dodge':
          if (toV) floatText(unitCenter(toV), 'DODGE', 'dodge');
          break;
        case 'detonate':
          if (toV) { burst(unitCenter(toV), '#ff8c3a', 20, 2.8, 1.4); addShake(0.3); }
          break;
        case 'die':
          if (uV) {
            uV.dead = true;
            uV.anim = { type: 'death', t: 0, dur: 0.9 };
            burst(unitCenter(uV), '#d8d8e8', 16, 2.0, 1.2);
            if (uV.hpEl) { uV.hpEl.style.opacity = '0'; }
            if (hooks.sfx) hooks.sfx('die');
          }
          break;
        case 'status':
          break;
      }
    }

    // 1st Pass: Detect attack triggers and schedule their child damage/heal/die events
    for (const e of events) {
      const fromV = e.from && unitViews[e.from];
      const toV = e.to && unitViews[e.to];
      const uV = e.unit && unitViews[e.unit];

      if (e.t === 'basic') {
        const isMelee = e.melee;
        const delay = isMelee ? 0.22 : 0.28;

        events.forEach(evt => {
          if (handledEvents.has(evt)) return;
          if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.from && evt.to === e.to) {
            scheduleEvent(delay, evt);
          }
          if (evt.t === 'die' && evt.unit === e.to) {
            scheduleEvent(delay, evt);
          }
        });
      } else if (e.t === 'skill') {
        const casterV = uV;
        const isMelee = casterV && casterV.unit.pos === 'front';
        const castDelay = 0.42;

        let skillTargetUid = null;
        events.forEach(evt => {
          if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
            skillTargetUid = evt.to;
          }
        });

        if (isMelee) {
          events.forEach(evt => {
            if (handledEvents.has(evt)) return;
            if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
              scheduleEvent(0.34, evt);
            }
            if (evt.t === 'die' && skillTargetUid && evt.unit === skillTargetUid) {
              scheduleEvent(0.34, evt);
            }
          });
        } else {
          delayedEffects.push({
            delay: castDelay,
            run: () => {
              const targetV = skillTargetUid && unitViews[skillTargetUid];
              if (casterV && targetV) {
                spawnProjectile(unitCenter(casterV), unitCenter(targetV), casterV.unit.model.palette.secondary || '#7cf5ff', 0.8, casterV.unit);
              }
            }
          });

          events.forEach(evt => {
            if (handledEvents.has(evt)) return;
            if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
              scheduleEvent(0.70, evt);
            }
            if (evt.t === 'die' && skillTargetUid && evt.unit === skillTargetUid) {
              scheduleEvent(0.70, evt);
            }
          });
        }
      } else if (e.t === 'ult') {
        const casterV = uV;
        const isMelee = casterV && casterV.unit.pos === 'front';
        const castDelay = 0.65;

        let ultTargetUid = null;
        events.forEach(evt => {
          if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
            ultTargetUid = evt.to;
          }
        });

        if (isMelee) {
          events.forEach(evt => {
            if (handledEvents.has(evt)) return;
            if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
              scheduleEvent(0.65, evt);
            }
            if (evt.t === 'die' && ultTargetUid && evt.unit === ultTargetUid) {
              scheduleEvent(0.65, evt);
            }
          });
        } else {
          delayedEffects.push({
            delay: castDelay,
            run: () => {
              const targetV = ultTargetUid && unitViews[ultTargetUid];
              if (casterV && targetV) {
                spawnProjectile(unitCenter(casterV), unitCenter(targetV), casterV.unit.model.palette.secondary || '#ffffff', 1.0, casterV.unit);
              }
            }
          });

          events.forEach(evt => {
            if (handledEvents.has(evt)) return;
            if ((evt.t === 'dmg' || evt.t === 'heal') && evt.from === e.unit) {
              scheduleEvent(0.93, evt);
            }
            if (evt.t === 'die' && ultTargetUid && evt.unit === ultTargetUid) {
              scheduleEvent(0.93, evt);
            }
          });
        }
      }
    }

    // 2nd Pass: Process instant and unhandled events immediately
    for (const e of events) {
      if (handledEvents.has(e)) continue;

      const fromV = e.from && unitViews[e.from];
      const toV = e.to && unitViews[e.to];
      const uV = e.unit && unitViews[e.unit];
      switch (e.t) {
        case 'basic':
          if (fromV && toV) {
            if (e.melee) {
              fromV.anim = { type: 'lunge', t: 0, dur: 0.34, target: unitViews[e.to].char.group.position.clone() };
            } else {
              fromV.anim = { type: 'cast', t: 0, dur: 0.3 };
              spawnProjectile(unitCenter(fromV), unitCenter(toV), fromV.unit.model.palette.secondary, 0.8, fromV.unit);
            }
          }
          if (hooks.sfx) hooks.sfx('attack');
          break;
        case 'chain':
          if (fromV && toV) spawnProjectile(unitCenter(fromV), unitCenter(toV), '#8fdcff', 1.4, fromV.unit);
          break;
        case 'dash':
          if (uV && toV) uV.anim = { type: 'lunge', t: 0, dur: 0.3, target: toV.char.group.position.clone() };
          break;
        case 'skill':
          if (uV) {
            uV.anim = { type: 'cast', t: 0, dur: 0.42 };
            burst(unitCenter(uV), uV.unit.model.palette.secondary, 10, 1.6);
            floatText(unitCenter(uV), e.name.toUpperCase() + '!', 'shout');
            if (hooks.skill) hooks.skill(uV.unit, e.name);
            if (hooks.sfx) hooks.sfx('skill');
          }
          break;
        case 'ult':
          if (uV) {
            uV.anim = { type: 'ultpose', t: 0, dur: 0.7 };
            const aura = uV.unit.model.aura || '#ffffff';
            burst(unitCenter(uV), aura, 26, 3.2, 1.6);
            groundRing(uV.char.group.position, aura, 3.4);
            addShake(0.5);

            try {
              const runeGeo = new THREE.RingGeometry(0.15, 0.85, 32);
              const runeMat = new THREE.MeshBasicMaterial({ color: aura, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
              const runeMesh = new THREE.Mesh(runeGeo, runeMat);
              runeMesh.rotation.x = -Math.PI / 2;
              runeMesh.position.copy(uV.char.group.position);
              runeMesh.position.y = 0.05;
              fxGroup.add(runeMesh);
              castingRunes.push({ mesh: runeMesh, unitUid: uV.uid, life: 0.7, maxLife: 0.7 });
            } catch (eR) { console.warn('Rune render failed', eR); }

            floatText(unitCenter(uV), e.name.toUpperCase() + '!', 'shout ult-shout');
            if (hooks.ult) hooks.ult(uV.unit, e.name, e.side);
            if (hooks.sfx) hooks.sfx('ult');
          }
          break;
        case 'dmg':
        case 'heal':
        case 'die':
        case 'shield':
        case 'dodge':
        case 'detonate':
          processSingleEvent(e, hooks);
          break;
        case 'quake':
          groundRing(new THREE.Vector3(0, 0, -2.5), '#ffd94d', 6 + e.step * 1.2);
          addShake(0.35 + e.step * 0.1);
          if (hooks.sfx) hooks.sfx('quake');
          break;
        case 'passive':
          if (uV) {
            floatText(unitCenter(uV), e.name.toUpperCase() + '!', 'shout');
            if (hooks.skill) hooks.skill(uV.unit, e.name);
          }
          break;
        case 'end':
          if (hooks.end) hooks.end(e.victory);
          break;
      }
    }
  }

  function formatNum(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
    return '' + Math.round(n);
  }

  /* ---------- frame update ---------- */
  function update(dt) {
    if (!renderer) return;

    // slow-mo time update (decreased in real time)
    if (slowMoTime > 0) {
      slowMoTime = Math.max(0, slowMoTime - dt);
    }

    // unit animation
    Object.values(unitViews).forEach(v => {
      const g = v.char.group;
      v.bobPhase += dt * 2.2;

      if (v.anim) {
        const a = v.anim;
        a.t += dt;
        const k = Math.min(1, a.t / a.dur);
        if (a.type === 'lunge') {
          const dir = a.target.clone().sub(v.home).multiplyScalar(0.42);
          const amt = k < 0.5 ? k * 2 : (1 - k) * 2;
          g.position.copy(v.home).addScaledVector(dir, easeOut(amt));
        } else if (a.type === 'cast') {
          g.position.copy(v.home);
          v.char.arms[1].rotation.x = -easeOut(k < 0.5 ? k * 2 : (1 - k) * 2) * 2.4;
        } else if (a.type === 'ultpose') {
          g.position.copy(v.home).add(new THREE.Vector3(0, Math.sin(k * Math.PI) * 0.5, 0));
          v.char.arms[1].rotation.x = -Math.sin(k * Math.PI) * 2.8;
          v.char.arms[-1].rotation.x = -Math.sin(k * Math.PI) * 2.8;
        } else if (a.type === 'death') {
          g.rotation.x = (v.unit.side === 'ally' ? -1 : 1) * easeOut(k) * Math.PI / 2 * 0.9;
          g.position.y = -easeOut(k) * 0.25;
          g.traverse(o => {
            if (o.isMesh && o.material) { o.material.transparent = true; o.material.opacity = 1 - k * 0.85; }
          });
        }
        if (a.t >= a.dur && a.type !== 'death') { v.anim = null; g.position.copy(v.home); v.char.arms[1].rotation.x = 0; v.char.arms[-1].rotation.x = 0; }
      } else if (!v.dead) {
        // idle bob
        g.position.y = Math.sin(v.bobPhase) * 0.035;
        g.scale.y = (v.unit.isBoss ? 1.25 : 1) * (1 + Math.sin(v.bobPhase * 1.3) * 0.012);
      }

      // hit flash
      if (v.flash > 0) {
        v.flash -= dt;
        const on = Math.floor(v.flash * 24) % 2 === 0;
        g.traverse(o => {
          if (!o.isMesh || !o.material || o.material.emissive === undefined) return;
          if (on && v.flash > 0) { o.material.emissive.setHex(0xff6655); o.material.emissiveIntensity = 0.85; }
          else { o.material.emissive.setHex(o.material._baseEmissive || 0); o.material.emissiveIntensity = o.material._baseEI || 0; }
        });
      }

      // status element particle effects
      if (v.unit && v.unit.statuses && !reducedFx && !v.dead) {
        v.unit.statuses.forEach(st => {
          if (Math.random() < 0.07) {
            let pColor = null;
            if (st.kind === 'burn') pColor = '#ff6b35';
            else if (st.kind === 'poison') pColor = '#a56bff';
            else if (st.kind === 'bleed') pColor = '#ff3b30';
            else if (st.kind === 'vampiric') pColor = '#ff1e5e';
            else if (st.kind === 'blind') pColor = '#c8c8d8';
            else if (st.kind === 'invuln') pColor = '#ffe9a0';
            
            if (pColor) {
              const pos = unitCenter(v);
              pos.x += (Math.random() - 0.5) * 0.55;
              pos.z += (Math.random() - 0.5) * 0.55;
              burst(pos, pColor, 1, 0.6, 1.2);
            }
          }
        });
      }

      // hp bar
      if (v.hpEl && !v.dead) {
        const u = v.unit;
        const p = unitCenter(v);
        p.y = v.char.height + 0.32;
        const sp = toScreen(p);
        v.hpEl.style.transform = `translate(${Math.round(sp.x)}px, ${Math.round(sp.y)}px) translateX(-50%)`;
        if (v.visualHp === undefined) v.visualHp = u.hp;
        if (v.targetHp === undefined) v.targetHp = u.hp;
        if (v.visualHp !== v.targetHp) {
          const diff = v.targetHp - v.visualHp;
          if (Math.abs(diff) < 1) v.visualHp = v.targetHp;
          else v.visualHp += diff * 12 * dt;
        }
        v.hpFill.style.width = Math.max(0, v.visualHp / u.maxHp * 100) + '%';
        const sh = u.shields.reduce((t, s) => t + s.amount, 0);
        v.shieldFill.style.width = Math.min(100, sh / u.maxHp * 100) + '%';
        v.energyFill.style.width = Math.min(100, u.energy / 10) + '%';
      }
    });

    // delayed effects
    for (let i = delayedEffects.length - 1; i >= 0; i--) {
      const fx = delayedEffects[i];
      fx.delay -= dt;
      if (fx.delay <= 0) {
        try {
          fx.run();
        } catch (eFx) { console.error('Delayed effect run failed', eFx); }
        delayedEffects.splice(i, 1);
      }
    }

    // projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      p.mesh.position.lerpVectors(p.from, p.to, k);
      p.mesh.position.y += Math.sin(k * Math.PI) * p.arc;

      // Projectile orientation
      const curPos = p.mesh.position.clone();
      if (p.lastPos) {
        const direction = new THREE.Vector3().subVectors(curPos, p.lastPos);
        if (direction.lengthSq() > 0.0001) {
          direction.normalize();
          p.mesh.lookAt(curPos.clone().add(direction));
        }
      }
      p.lastPos = curPos;

      // Projectile light sparkles trail
      if (Math.random() < 0.75 && !reducedFx) {
        burst(p.mesh.position, p.color, 1, 0.5, 0.15);
      }

      if (k >= 1) {
        burst(p.mesh.position, p.color, 5, 1.2);
        fxGroup.remove(p.mesh);
        projectiles.splice(i, 1);
      }
    }

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      const pos = pt.points.geometry.attributes.position;
      for (let j = 0; j < pt.vels.length; j++) {
        pt.vels[j].y -= 4.5 * dt;
        pos.array[j * 3] += pt.vels[j].x * dt;
        pos.array[j * 3 + 1] = Math.max(0.02, pos.array[j * 3 + 1] + pt.vels[j].y * dt);
        pos.array[j * 3 + 2] += pt.vels[j].z * dt;
      }
      pos.needsUpdate = true;
      pt.points.material.opacity = Math.max(0, pt.life / pt.maxLife);
      if (pt.life <= 0) { fxGroup.remove(pt.points); particles.splice(i, 1); }
    }

    // rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      const k = 1 - r.life / r.maxLife;
      r.mesh.scale.setScalar(1 + k * r.maxR * 3);
      r.mesh.material.opacity = Math.max(0, 0.85 * (1 - k));
      if (r.life <= 0) { fxGroup.remove(r.mesh); rings.splice(i, 1); }
    }

    // casting runes
    for (let i = castingRunes.length - 1; i >= 0; i--) {
      const cr = castingRunes[i];
      cr.life -= dt;
      cr.mesh.rotation.z += dt * 3.5;
      
      const uv = unitViews[cr.unitUid];
      if (uv && uv.char) {
        cr.mesh.position.copy(uv.char.group.position);
        cr.mesh.position.y = 0.05;
      }
      
      cr.mesh.material.opacity = Math.max(0, 0.8 * (cr.life / cr.maxLife));
      if (cr.life <= 0) {
        fxGroup.remove(cr.mesh);
        castingRunes.splice(i, 1);
      }
    }

    // camera: drift + shake
    if (shake > 0) shake = Math.max(0, shake - shakeDecay * dt * shake - dt * 0.3);
    const t = performance.now() / 1000;

    // pulsing signature materials (Elder staff, blood armour, void seams…)
    for (let i = 0; i < pulseMats.length; i++) {
      const pm = pulseMats[i];
      pm.mat.emissiveIntensity = Math.max(0.05, pm.base + Math.sin(t * pm.speed + pm.phase) * pm.amp * pm.base);
    }
    camera.position.set(
      camBase.x + Math.sin(t * 0.23) * 0.35 + (Math.random() - 0.5) * shake * 0.5,
      camBase.y + Math.sin(t * 0.31) * 0.15 + (Math.random() - 0.5) * shake * 0.4,
      camBase.z + (Math.random() - 0.5) * shake * 0.3
    );
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
  }

  function easeOut(k) { return 1 - Math.pow(1 - k, 3); }

  function isActive() { return running; }

  /* ---------- showcase (home camp / hero viewer) ---------- */
  function loadShowcase(entries, mode, envKey) {
    if (!renderer) return;
    clearAll();
    const solo = mode === 'solo';
    const menu = mode === 'menu';
    setEnvironment(envKey || 'arena', solo);
    camMode = solo ? 'showcase-solo' : (menu ? 'showcase-menu' : 'showcase-squad');
    fitShowcaseCamera(solo, menu);
    entries.forEach((e, i) => {
      const c = buildCharacter(e.model, false, false);
      let pos;
      if (solo) pos = new THREE.Vector3(0, 0, 0);
      else {
        const n = entries.length;
        const x = (i - (n - 1) / 2) * 1.7;
        pos = new THREE.Vector3(x, 0, Math.abs(i - (n - 1) / 2) * 0.5);
      }
      c.group.position.copy(pos);
      c.group.rotation.y = solo ? Math.PI + 0.4 : Math.PI;
      unitGroup.add(c.group);
      unitViews['show' + i] = {
        uid: 'show' + i, unit: { isBoss: false, side: 'ally', model: e.model, hp: 1, maxHp: 1, energy: 0, shields: [] },
        char: c, home: pos.clone(), anim: null, bobPhase: Math.random() * Math.PI * 2, flash: 0, dead: false,
      };
    });
    running = true;
  }

  function fitShowcaseCamera(solo, menu) {
    if (!camera) return;
    camera.fov = 46;
    camera.updateProjectionMatrix();
    const isPc = document.body.classList.contains('view-mode-pc');
    const xOffset = (isPc && !solo) ? -0.95 : 0;
    if (solo) { camBase.set(xOffset, 1.7, 5.2); camTarget.set(xOffset, -0.7, 0); }
    else if (menu) {
      // Main Menu: squad vertically centered, between the logo (top)
      // and the action buttons (bottom thumb zone).
      const narrow = camera.aspect < 0.8;
      camBase.set(xOffset, 2.4, narrow ? 11.8 : 10.0);
      camTarget.set(xOffset, narrow ? 1.15 : 0.9, 0);
    }
    else {
      const narrow = camera.aspect < 0.8;
      // aim low so the squad sits in the upper third of the screen (diorama gap)
      camBase.set(xOffset, narrow ? 3.0 : 2.7, narrow ? 11.0 : 9.4);
      camTarget.set(xOffset, narrow ? -2.3 : -1.4, 0);
    }
  }

  function resetCamera() {
    if (!camera) return;
    camMode = 'battle';
    fitBattleCamera();
  }

  /* ---------- portrait rendering (roster cards) ---------- */
  let portraitCache = {};
  let pRenderer = null, pScene = null, pCam = null, pFailed = false;
  function renderPortrait(model, bgColor) {
    const key = JSON.stringify([model.palette, model.weapon, model.headgear, model.body, model.hands, model.feet, model.signature, bgColor]);
    if (portraitCache[key]) return portraitCache[key];
    if (!pFailed) {
      try {
        if (!pRenderer) {
          pRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
          pRenderer.setPixelRatio(window.devicePixelRatio);
          pRenderer.setSize(220, 260);
          pScene = new THREE.Scene();
          pCam = new THREE.PerspectiveCamera(36, 220 / 260, 0.1, 30);
          const hemi = new THREE.HemisphereLight(0xffffff, 0x334455, 1.0);
          pScene.add(hemi);
          const key2 = new THREE.DirectionalLight(0xfff2dd, 1.0);
          key2.position.set(2, 3, 3);
          pScene.add(key2);
        }
        while (pScene.children.length > 2) pScene.remove(pScene.children[2]);
        pulseEnabled = false; // portraits are static — don't register pulses
        const c = buildCharacter(model, false, false);
        pulseEnabled = true;
        c.group.rotation.y = Math.PI + 0.45;
        pScene.add(c.group);
        const h = c.height;
        pCam.position.set(0.3, h * 0.86, 2.9);
        pCam.lookAt(0, h * 0.5, 0);
        pRenderer.setClearColor(0x000000, 0);
        pRenderer.render(pScene, pCam);
        const url = pRenderer.domElement.toDataURL('image/png');
        portraitCache[key] = url;
        return url;
      } catch (e) {
        console.warn('WebGL portraits unavailable — using 2D fallback.', e);
        pFailed = true;
      }
    }
    const url = renderPortrait2D(model);
    portraitCache[key] = url;
    return url;
  }

  /* 2D canvas fallback portrait — stylized bust from the palette, so the
     game remains fully playable on devices without WebGL. */
  function renderPortrait2D(model) {
    const w = 220, h = 260;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const p = model.palette;

    // backdrop glow
    const bgGrad = ctx.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.45, w * 0.75);
    bgGrad.addColorStop(0, p.secondary + '');
    bgGrad.addColorStop(0.35, shade(p.primary, -0.1));
    bgGrad.addColorStop(1, '#0d0f1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // torso
    ctx.fillStyle = p.secondary;
    ctx.beginPath();
    ctx.moveTo(w * 0.22, h);
    ctx.quadraticCurveTo(w * 0.28, h * 0.62, w * 0.5, h * 0.58);
    ctx.quadraticCurveTo(w * 0.72, h * 0.62, w * 0.78, h);
    ctx.closePath();
    ctx.fill();
    // chest accent
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.72);
    ctx.lineTo(w * 0.5, h * 0.64);
    ctx.lineTo(w * 0.6, h * 0.72);
    ctx.lineTo(w * 0.5, h * 0.86);
    ctx.closePath();
    ctx.fill();

    // head
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.38, w * 0.16, 0, Math.PI * 2);
    ctx.fill();
    // hair / headgear hint
    ctx.fillStyle = model.hair || p.primary;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.33, w * 0.165, Math.PI, Math.PI * 2);
    ctx.fill();
    if (model.headgear === 'crown') {
      ctx.fillStyle = '#ffd94d';
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.24);
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(w * (0.36 + 0.07 + i * 0.093), h * 0.16);
        ctx.lineTo(w * (0.36 + 0.093 * (i + 1)), h * 0.24);
      }
      ctx.closePath();
      ctx.fill();
    } else if (model.headgear === 'halo') {
      ctx.strokeStyle = p.secondary;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.17, w * 0.14, w * 0.045, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (model.headgear === 'horns' || model.headgear === 'antlers') {
      ctx.fillStyle = p.accent;
      [-1, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(w * (0.5 + s * 0.13), h * 0.28);
        ctx.lineTo(w * (0.5 + s * 0.22), h * 0.14);
        ctx.lineTo(w * (0.5 + s * 0.16), h * 0.29);
        ctx.closePath();
        ctx.fill();
      });
    }

    // aura sparkles
    ctx.fillStyle = (model.aura || p.accent);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = w * 0.32 + (i % 3) * 9;
      ctx.globalAlpha = 0.25 + (i % 4) * 0.12;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * r, h * 0.42 + Math.sin(a) * r * 0.8, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return cv.toDataURL('image/png');
  }

  function shade(hex, amt) {
    try {
      const c = new THREE.Color(hex);
      c.offsetHSL(0, 0, amt);
      return '#' + c.getHexString();
    } catch (e) { return hex; }
  }

  function getSlowMo() {
    return slowMoTime > 0 ? 0.15 : 1.0;
  }

  return { init, resize, loadBattle, stop, processEvents, update, setEnvironment, isActive, addShake, loadShowcase, resetCamera, renderPortrait, getSlowMo };
})();
