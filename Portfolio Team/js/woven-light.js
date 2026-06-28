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

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const originalPositions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);

  // Warm gold hue range (~35–50°), varied lightness for a shimmering sparkle look
  const color = new THREE.Color();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
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
    size: 0.045,
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

  let halfW = 6, halfH = 4;
  const phasesX = new Float32Array(PARTICLE_COUNT);
  const phasesY = new Float32Array(PARTICLE_COUNT);

  function scatter() {
    // Spread particles evenly across the full visible frustum (incl. edges/sides)
    const vFov = camera.fov * Math.PI / 180;
    halfH = Math.tan(vFov / 2) * camera.position.z * 1.1;
    halfW = halfH * camera.aspect * 1.05;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
      const x = (Math.random() * 2 - 1) * halfW;
      const y = (Math.random() * 2 - 1) * halfH;
      const z = (Math.random() * 2 - 1) * 1.5;
      positions[ix] = x; positions[iy] = y; positions[iz] = z;
      originalPositions[ix] = x; originalPositions[iy] = y; originalPositions[iz] = z;
      velocities[ix] = 0; velocities[iy] = 0; velocities[iz] = 0;
      phasesX[i] = Math.random() * Math.PI * 2;
      phasesY[i] = Math.random() * Math.PI * 2;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  // Dim particles only directly over text (headline, labels) — not the whole area
  function updateTextMask() {
    const rect = container.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    const textEls = document.querySelectorAll(
      '#workflow .eyebrow, #workflow .section-title, #workflow .wf-category, #workflow .wf-step-label'
    );
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'blur(14px)';
    textEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const cx = r.left - rect.left + r.width / 2;
      const cy = r.top - rect.top + r.height / 2;
      const rx = r.width / 2 + 14;
      const ry = r.height / 2 + 10;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';

    const dataUrl = canvas.toDataURL();
    container.style.maskImage = `url(${dataUrl})`;
    container.style.webkitMaskImage = `url(${dataUrl})`;
    container.style.maskSize = '100% 100%';
    container.style.webkitMaskSize = '100% 100%';
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    scatter();
    setTimeout(updateTextMask, 50);
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
    mouseWorld.set(mouse.x * halfW, mouse.y * halfH, 0);
    const interactRadius = halfH * 0.55;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

      tmpCurrent.set(positions[ix], positions[iy], positions[iz]);
      const driftX = Math.sin(elapsed * 0.4 + phasesX[i]) * 0.18;
      const driftY = Math.cos(elapsed * 0.33 + phasesY[i]) * 0.18;
      tmpOriginal.set(
        originalPositions[ix] + driftX,
        originalPositions[iy] + driftY,
        originalPositions[iz]
      );
      tmpVelocity.set(velocities[ix], velocities[iy], velocities[iz]);

      const dist = tmpCurrent.distanceTo(mouseWorld);
      if (dist < interactRadius) {
        const force = (interactRadius - dist) * 0.012;
        tmpDir.subVectors(tmpCurrent, mouseWorld).normalize();
        tmpVelocity.addScaledVector(tmpDir, force);
      }

      tmpReturn.subVectors(tmpOriginal, tmpCurrent).multiplyScalar(0.02);
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

    points.rotation.y = Math.sin(elapsed * 0.015) * 0.04;
    points.rotation.x = Math.sin(elapsed * 0.02) * 0.03;

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
