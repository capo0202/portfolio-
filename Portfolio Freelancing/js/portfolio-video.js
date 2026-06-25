gsap.registerPlugin(ScrollTrigger);

// ── SPARKLE CURSOR ────────────────────────────────────────────────────────────
const ring      = document.getElementById('cRing');
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function createSparkle(x, y) {
  const count = Math.random() > 0.5 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.textContent = '✦';
    const size  = Math.random() * 11 + 5;
    const color = Math.random() > 0.45 ? '#f5f2ee' : '#3a52d4';
    const ox = (Math.random() - 0.5) * 18;
    const oy = (Math.random() - 0.5) * 18;
    el.style.cssText = [
      'position:fixed', `left:${x + ox}px`, `top:${y + oy}px`,
      'pointer-events:none', 'z-index:9997', `font-size:${size}px`,
      `color:${color}`, 'transform:translate(-50%,-50%)',
      'user-select:none', 'line-height:1', 'will-change:transform,opacity'
    ].join(';');
    document.body.appendChild(el);
    gsap.to(el, {
      y: -(Math.random() * 52 + 18), x: (Math.random() - 0.5) * 36,
      opacity: 0, scale: Math.random() * 0.6 + 0.15,
      rotation: (Math.random() - 0.5) * 200,
      duration: 0.55 + Math.random() * 0.45, ease: 'power2.out',
      onComplete: () => el.remove()
    });
  }
}

// Blue glow cloud that follows the mouse
const glowOrb = document.createElement('div');
glowOrb.style.cssText = [
  'position:fixed', 'pointer-events:none', 'z-index:9990',
  'width:520px', 'height:380px',
  'border-radius:60% 40% 55% 45% / 45% 55% 40% 60%',
  'background:radial-gradient(ellipse at 40% 50%, rgba(58,82,212,0.22) 0%, rgba(58,82,212,0.10) 40%, transparent 70%)',
  'filter:blur(28px)',
  'transform:translate(-50%,-50%)',
  'will-change:transform', 'top:0', 'left:0',
  'mix-blend-mode:screen',
].join(';');
document.body.appendChild(glowOrb);

if (isDesktop) {
  let lx = 0, ly = 0;
  document.addEventListener('mousemove', e => {
    gsap.to(ring, { x: e.clientX, y: e.clientY, duration: .55, ease: 'power2.out' });
    gsap.to(glowOrb, { left: e.clientX, top: e.clientY, duration: 1.1, ease: 'power2.out' });
    const dx = e.clientX - lx, dy = e.clientY - ly;
    if (dx * dx + dy * dy > 640) {
      createSparkle(e.clientX, e.clientY);
      lx = e.clientX; ly = e.clientY;
    }
  }, { passive: true });

  const hoverEls = document.querySelectorAll('a, button, .proj-tile');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup',   () => ring.classList.remove('click'));
}

// ── NAV ───────────────────────────────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── MAGNETIC BUTTONS ──────────────────────────────────────────────────────────
if (isDesktop) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * .28;
      const y = (e.clientY - r.top  - r.height / 2) * .28;
      gsap.to(btn, { x, y, duration: .4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.5)' });
    });
  });
}

// ── HERO TITLE HOVER JUMP ─────────────────────────────────────────────────────
if (isDesktop) {
  document.querySelectorAll('.hero-title .lw').forEach(el => {
    el.style.cursor = 'default';
    el.addEventListener('mouseenter', () => gsap.to(el, { y: -10, duration: .28, ease: 'back.out(2.8)' }));
    el.addEventListener('mouseleave', () => gsap.to(el, { y: 0,   duration: .7,  ease: 'elastic.out(1,.4)' }));
  });
}

// ── PRELOADER + HERO ENTRANCE ─────────────────────────────────────────────────
const intro = gsap.timeline({ onComplete: () => document.getElementById('preloader').remove() });
intro
  .to('.pl-top',    { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, .15)
  .to('.pl-bottom', { yPercent:  100, duration: 1.1, ease: 'power4.inOut' }, .15)
  .from('.li',      { yPercent: 112, stagger: .1, duration: 1.05, ease: 'power4.out' }, .6)
  .from('#heroBtns .btn', { opacity: 0, y: 14, stagger: .1, duration: .55, ease: 'power3.out' }, 1.08);

// ── PROJECT REEL ──────────────────────────────────────────────────────────────
(function () {
  const reel    = document.querySelector('.proj-reel');
  const track   = document.querySelector('.proj-track');
  const prevBtn = document.querySelector('.reel-prev');
  const nextBtn = document.querySelector('.reel-next');
  if (!reel || !track) return;

  const AUTO   = -2.2;
  const TILE_W = 260 + 16; // tile width + gap

  // Defer loading until section is visible
  const reelVideos = Array.from(track.querySelectorAll('.proj-video'));
  reelVideos.forEach(v => { v.removeAttribute('autoplay'); v.preload = 'auto'; });

  // DOM-reorder infinite loop: move off-screen tiles to the opposite end
  function reorder() {
    while (x <= -TILE_W) { track.appendChild(track.firstElementChild); x += TILE_W; }
    while (x > 0)        { track.insertBefore(track.lastElementChild, track.firstElementChild); x -= TILE_W; }
  }

  // Only run ticker + videos when #work is visible
  let reelActive = false;
  ScrollTrigger.create({
    trigger: '#work', start: 'top 85%',
    onEnter()     { reelActive = true;  reelVideos.forEach((v, i) => setTimeout(() => { v.load(); v.play().catch(() => {}); }, i * 120)); },
    onLeave()     { reelActive = false; reelVideos.forEach(v => v.pause()); },
    onEnterBack() { reelActive = true;  reelVideos.forEach(v => v.play().catch(() => {})); },
    onLeaveBack() { reelActive = false; reelVideos.forEach(v => v.pause()); },
  });

  let x = 0, velX = AUTO, targetV = AUTO;
  let dragging = false, isPaused = false;
  let ox = 0, ot = 0, prevClientX = 0, dragV = 0, dragDist = 0, dragAdj = 0;

  reel.style.cursor = 'grab';

  // Hover → pause auto-scroll
  reel.addEventListener('mouseover', e => { if (e.target.closest('.proj-tile')) isPaused = true; });
  reel.addEventListener('mouseout',  e => { if (e.target.closest('.proj-tile')) isPaused = false; });

  // Drag
  function onStart(cx) {
    dragging = true; dragDist = 0; dragAdj = 0;
    ox = cx; ot = x; prevClientX = cx; dragV = 0;
    reel.style.cursor = 'grabbing';
  }
  function onMove(cx) {
    if (!dragging) return;
    dragDist += Math.abs(cx - prevClientX);
    dragV = cx - prevClientX; prevClientX = cx;
    x = ot + dragAdj + (cx - ox);
    while (x <= -TILE_W) { track.appendChild(track.firstElementChild);          x += TILE_W; dragAdj += TILE_W; }
    while (x > 0)        { track.insertBefore(track.lastElementChild, track.firstElementChild); x -= TILE_W; dragAdj -= TILE_W; }
    gsap.set(track, { x });
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false; reel.style.cursor = 'grab';
    velX = dragV; targetV = AUTO;
  }

  reel.addEventListener('mousedown',   e => { onStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup',   ()  => onEnd());
  reel.addEventListener('touchstart',  e => onStart(e.touches[0].clientX), { passive: true });
  window.addEventListener('touchmove', e => onMove(e.touches[0].clientX),  { passive: true });
  window.addEventListener('touchend',  ()  => onEnd());

  // Arrow buttons — delta-based so reorder stays in sync
  function jumpBy(px) {
    let applied = 0;
    const obj = { v: 0 };
    gsap.to(obj, { v: 1, duration: 0.55, ease: 'power2.out',
      onUpdate() {
        const delta = px * obj.v - applied; applied = px * obj.v;
        x += delta; reorder(); gsap.set(track, { x });
      }
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => jumpBy( TILE_W * 3));
  if (nextBtn) nextBtn.addEventListener('click', () => jumpBy(-TILE_W * 3));

  // Ticker — skipped entirely when reel is off-screen
  gsap.ticker.add(() => {
    if (!reelActive || dragging || isPaused) return;
    targetV += (AUTO - targetV) * 0.035;
    velX    += (targetV - velX) * 0.18;
    x       += velX;
    reorder();
    gsap.set(track, { x });
  });

  // Modal
  const modal      = document.getElementById('videoModal');
  const modalVideo = modal?.querySelector('.v-modal-video');
  const modalClose = modal?.querySelector('.v-modal-close');
  const modalBg    = modal?.querySelector('.v-modal-bg');

  function openModal(src) {
    if (!modal || !modalVideo) return;
    modalVideo.src = src;
    modalVideo.volume = 1;
    modalVideo.muted = false;
    modalVideo.load();
    // Start muted to satisfy autoplay policy, then immediately unmute
    modalVideo.muted = true;
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        modalVideo.muted = false;
        modalVideo.volume = 1;
      }).catch(() => {});
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalVideo.pause(); modalVideo.src = '';
    document.body.style.overflow = '';
  }

  modalClose?.addEventListener('click', closeModal);
  modalBg?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  reel.addEventListener('click', e => {
    if (dragDist > 6) return;
    const tile = e.target.closest('.proj-tile');
    if (!tile) return;
    const src = tile.querySelector('source')?.src;
    if (src) openModal(src);
  });
}());

// ── SECTION REVEAL ────────────────────────────────────────────────────────────
gsap.utils.toArray('section:not(#hero), .marquee-wrap').forEach(section => {
  gsap.from(section, {
    y: 40, opacity: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: section, start: 'top 92%', once: true }
  });
});

// ── ZOOM PARALLAX (Desktop only) ──────────────────────────────────────────────
if (window.innerWidth > 768) gsap.utils.toArray('section:not(#contact)').forEach(section => {
  const sz = section.querySelector('.sz');
  if (!sz) return;

  gsap.to(sz, {
    scale: 0.88, borderRadius: '18px', ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });
});

// ── SCROLL REVEALS ────────────────────────────────────────────────────────────
gsap.utils.toArray('.gs-r').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 87%', once: true },
    opacity: 0, y: 22, duration: .75, ease: 'power3.out'
  });
});

gsap.utils.toArray('.ti').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    yPercent: 112, duration: .9, ease: 'power4.out'
  });
});
