(function () {

  /* Auf mobilen Geräten deaktivieren (Performance) */
  if (window.innerWidth <= 768) return;

  var canvas = document.getElementById('meteorCanvas');
  if (!canvas) return;

  var W = window.innerWidth, H = window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', function () {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  });

  scene.add(new THREE.AmbientLight(0x334466, 1.5));
  var sun = new THREE.DirectionalLight(0xfff0cc, 6);
  sun.position.set(4, 6, 5);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x4466bb, 2.5);
  fill.position.set(-4, -2, 3);
  scene.add(fill);

  var lanes = [
    { file: 'assets/meteorit2.glb', scale: 2.6, xStart: 22, xEnd: -22, y:  0.5, z: -10, scrollStart: 0.0,  scrollEnd: 0.3,  rot: [0.003,0.007,0.002] },
    { file: 'assets/meteorit2.glb', scale: 3.2, xStart: 26, xEnd: -26, y: -3.5, z:  -7, scrollStart: 0.16, scrollEnd: 0.46, rot: [0.005,0.003,0.006] },
    { file: 'assets/meteorit2.glb', scale: 2.4, xStart: 28, xEnd: -28, y: -5.5, z:  -6, scrollStart: 0.42, scrollEnd: 0.78, rot: [0.004,0.009,0.003] },
  ];

  var meshes = [];
  var loader = new THREE.GLTFLoader();

  /* GLB nur einmal laden, dann für jede Lane klonen */
  loader.load(lanes[0].file, function (gltf) {
    lanes.forEach(function (lane, i) {
      var root = new THREE.Group();
      var m = gltf.scene.clone(true);

      var box = new THREE.Box3().setFromObject(m);
      var center = new THREE.Vector3();
      box.getCenter(center);
      var size = new THREE.Vector3();
      box.getSize(size);
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var s = lane.scale / maxDim;

      m.scale.setScalar(s);
      m.position.set(-center.x * s, -center.y * s, -center.z * s);

      m.traverse(function (c) {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.roughness = Math.max(c.material.roughness || 0.7, 0.6);
          c.material.metalness = Math.min(c.material.metalness || 0.05, 0.15);
          c.material.needsUpdate = true;
        }
      });

      root.add(m);
      root.position.set(lane.xStart, lane.y, lane.z);
      scene.add(root);
      meshes[i] = { root: root, lane: lane };
    });
  }, undefined, function(e){ console.error(lanes[0].file, e); });

  /* ── Hintergrund-Meteoriten (frei schwebend) ── */
  /* opacity: nah=kräftig, weit=transparent → verstärkt Tiefenwirkung */
  var floaters = [
    { x: -9,  y:  4,   z:  -5, scale: 2.2, opacity: 0.85, rot: [0.002, 0.005, 0.001], floatSpeed: 0.0008, floatAmp: 0.7 }, /* links oben — sehr nah, sehr groß */
    { x:  9,  y:  3,   z: -22, scale: 0.4, opacity: 0.25, rot: [0.003, 0.002, 0.004], floatSpeed: 0.0012, floatAmp: 0.5 }, /* rechts oben — extrem weit, winzig */
    { x: -8,  y: -4,   z:  -8, scale: 1.7, opacity: 0.75, rot: [0.004, 0.003, 0.002], floatSpeed: 0.0006, floatAmp: 0.4 }, /* links unten — nah */
    { x:  7,  y: -5,   z: -25, scale: 0.3, opacity: 0.18, rot: [0.002, 0.004, 0.003], floatSpeed: 0.0010, floatAmp: 0.6 }, /* rechts unten — sehr weit, kaum sichtbar */
    { x:  1,  y:  5,   z: -14, scale: 0.9, opacity: 0.45, rot: [0.001, 0.006, 0.002], floatSpeed: 0.0009, floatAmp: 0.8 }, /* mitte oben — mittlere Tiefe */
    { x: -3,  y:  1,   z: -10, scale: 1.4, opacity: 0.62, rot: [0.003, 0.004, 0.001], floatSpeed: 0.0007, floatAmp: 0.5 }, /* links mitte — etwas nah */
    { x:  6,  y: -1,   z: -18, scale: 0.6, opacity: 0.32, rot: [0.002, 0.003, 0.004], floatSpeed: 0.0011, floatAmp: 0.6 }, /* rechts mitte — weit hinten */
  ];
  var floaterMeshes = [];
  var clock = 0;

  /* Maus-Tracking */
  var mouseX = 0, mouseY = 0, smoothMX = 0, smoothMY = 0;
  window.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  loader.load('assets/meteorit2.glb', function (gltf) {
    floaters.forEach(function (f, i) {
      var root = new THREE.Group();
      var m = gltf.scene.clone(true);

      var box = new THREE.Box3().setFromObject(m);
      var center = new THREE.Vector3();
      box.getCenter(center);
      var size = new THREE.Vector3();
      box.getSize(size);
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var s = f.scale / maxDim;
      m.scale.setScalar(s);
      m.position.set(-center.x * s, -center.y * s, -center.z * s);

      m.traverse(function (c) {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.roughness = 0.7;
          c.material.metalness = 0.1;
          c.material.transparent = true;
          c.material.opacity = f.opacity !== undefined ? f.opacity : 0.55;
        }
      });

      root.add(m);
      root.position.set(f.x, f.y, f.z);
      scene.add(root);
      floaterMeshes[i] = { root: root, f: f, baseX: f.x, baseY: f.y };
    });
  });

  var smoothP = 0;
  function rawP() {
    var hero = document.getElementById('hero');
    var h = hero ? hero.offsetHeight : window.innerHeight;
    return Math.min(Math.max(window.scrollY / h, 0), 1);
  }

  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
  }

  var animActive = true;

  /* Renderer pausieren wenn Hero nicht sichtbar — spart massiv CPU/GPU */
  var hero = document.getElementById('hero');
  if (hero && window.IntersectionObserver) {
    new IntersectionObserver(function(entries) {
      animActive = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }

  /* Tab nicht aktiv → auch pausieren */
  document.addEventListener('visibilitychange', function() {
    animActive = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!animActive) return;
    clock += 1;
    smoothP += (rawP() - smoothP) * 0.15;

    /* Maus smooth */
    smoothMX += (mouseX - smoothMX) * 0.04;
    smoothMY += (mouseY - smoothMY) * 0.04;

    /* Hintergrund-Meteoriten animieren */
    floaterMeshes.forEach(function (item, idx) {
      if (!item) return;
      var f = item.f;

      /* Freie Schwebe-Bewegung */
      var floatX = Math.sin(clock * f.floatSpeed * 1.3 + idx) * 1.4;
      var floatY = Math.sin(clock * f.floatSpeed + idx * 0.7) * f.floatAmp;

      /* Maus-Position in 3D-Raum umrechnen (grob) */
      var mxWorld = smoothMX * 10;
      var myWorld = smoothMY * -6;

      /* Abstand zwischen Maus und Meteorit */
      var dx = mxWorld - item.baseX;
      var dy = myWorld - item.baseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var influence = Math.max(0, 1 - dist / 8); /* Reichweite: 8 Einheiten */

      /* Meteorit bewegt sich zur Maus wenn nah, sonst frei */
      var targetX = item.baseX + floatX + dx * influence * 0.4;
      var targetY = item.baseY + floatY + dy * influence * 0.4;

      item.root.position.x += (targetX - item.root.position.x) * 0.05;
      item.root.position.y += (targetY - item.root.position.y) * 0.05;

      /* Rotation schneller wenn Maus nah */
      var boost = 1 + influence * 3;
      item.root.rotation.x += f.rot[0] * boost;
      item.root.rotation.y += f.rot[1] * boost;
      item.root.rotation.z += f.rot[2] * boost;
    });

    meshes.forEach(function (item) {
      if (!item) return;
      var root = item.root, lane = item.lane;

      var range = lane.scrollEnd - lane.scrollStart;
      var local = Math.min(Math.max((smoothP - lane.scrollStart) / range, 0), 1);
      var e = easeInOut(local);

      /* Bewegung von rechts nach links */
      root.position.x = lane.xStart + (lane.xEnd - lane.xStart) * e;
      root.position.y = lane.y + Math.sin(e * Math.PI) * 0.3;
      root.position.z = lane.z;

      /* Nur links ausblenden */
      var fadeOut = local > 0.88 ? Math.max(1 - (local - 0.88) / 0.12, 0) : 1;
      item.root.traverse(function (c) {
        if (c.isMesh && c.material) {
          c.material.transparent = fadeOut < 0.99;
          c.material.opacity = fadeOut;
        }
      });

      /* Rotation */
      root.rotation.x += lane.rot[0];
      root.rotation.y += lane.rot[1];
      root.rotation.z += lane.rot[2];
    });

    renderer.render(scene, camera);
  }

  animate();
})();
