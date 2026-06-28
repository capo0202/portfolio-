// ── WOVEN LIGHT PARTICLE BACKGROUND (Workflow section) ────────────────────────
// Vanilla Three.js, adapted from the "Woven Light Hero" reference (21st.dev),
// scoped to #workflow instead of the full viewport, gold-toned to match the
// portfolio theme, paused via ScrollTrigger when out of view.
(function () {
  const container = document.getElementById('wfWeaveBg');
  if (!container || typeof THREE === 'undefined') return;

  const PARTICLE_COUNT = 8000;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 100);
  camera.position.z = 8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const torusKnot = new THREE.TorusKnotGeometry(3.2, 1.1, 220, 32);
  const knotPositions = torusKnot.attributes.position;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  const color = new THREE.Color();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const vi = i % knotPositions.count;
    const x = knotPositions.getX(vi);
    const y = knotPositions.getY(vi);
    const z = knotPositions.getZ(vi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    originalPositions[i * 3] = x;
    originalPositions[i * 3 + 1] = y;
    originalPositions[i * 3 + 2] = z;

    // Warm gold hue range (~35–50°), varied lightness for a shimmering thread look
    const hue = (0.085 + Math.random() * 0.045);
    color.setHSL(hue, 0.75, 0.45 + Math.random() * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.032,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const mouse = new THREE.Vector2(-10, -10);
  const mouseWorld = new THREE.Vector3();
  const clock = new THREE.Clock();

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  function resize() {
    const rect = container.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();

  let ro;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(resize);
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }

  let running = true;
  let rafId = null;

  const tmpCurrent = new THREE.Vector3();
  const tmpOriginal = new THREE.Vector3();
  const tmpVelocity = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();
  const tmpReturn = new THREE.Vector3();

  function animate() {
    if (!running) return;
    rafId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    mouseWorld.set(mouse.x * 5.5, mouse.y * 5.5, 0);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

      tmpCurrent.set(positions[ix], positions[iy], positions[iz]);
      tmpOriginal.set(originalPositions[ix], originalPositions[iy], originalPositions[iz]);
      tmpVelocity.set(velocities[ix], velocities[iy], velocities[iz]);

      const dist = tmpCurrent.distanceTo(mouseWorld);
      if (dist < 2.6) {
        const force = (2.6 - dist) * 0.012;
        tmpDir.subVectors(tmpCurrent, mouseWorld).normalize();
        tmpVelocity.addScaledVector(tmpDir, force);
      }

      tmpReturn.subVectors(tmpOriginal, tmpCurrent).multiplyScalar(0.0012);
      tmpVelocity.add(tmpReturn);
      tmpVelocity.multiplyScalar(0.95);

      positions[ix] += tmpVelocity.x;
      positions[iy] += tmpVelocity.y;
      positions[iz] += tmpVelocity.z;

      velocities[ix] = tmpVelocity.x;
      velocities[iy] = tmpVelocity.y;
      velocities[iz] = tmpVelocity.z;
    }
    geometry.attributes.position.needsUpdate = true;

    points.rotation.y = elapsed * 0.04;
    points.rotation.x = Math.sin(elapsed * 0.02) * 0.1;

    renderer.render(scene, camera);
  }

  function start() {
    if (rafId !== null) return;
    running = true;
    animate();
  }
  function stop() {
    running = false;
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  if (window.innerWidth <= 768) {
    // Mobile: skip entirely (matches .wf-weave-bg { display:none } breakpoint)
    return;
  }

  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '#workflow',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: start,
      onEnterBack: start,
      onLeave: stop,
      onLeaveBack: stop,
    });
  } else {
    start();
  }
}());
