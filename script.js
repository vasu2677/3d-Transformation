/* ════════════════════════════════════════════
   FORMA · script.js
   Three.js scene + all UI interactions
   ════════════════════════════════════════════ */

// ─── Wait for DOM ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════
     1. LOADER
  ══════════════════════════════════════════ */
  const loader = document.getElementById('loader');
  // Hide loader after 2 s (bar animation duration)
  setTimeout(() => {
    loader.classList.add('hidden');
    triggerHeroReveal();
  }, 2000);

  /* ══════════════════════════════════════════
     2. CUSTOM CURSOR
  ══════════════════════════════════════════ */
  const ring = document.getElementById('cursor-ring');
  const dot  = document.getElementById('cursor-dot');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Lerp the ring for a soft-follow effect
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Grow cursor on hover
  document.querySelectorAll('a, button, input').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  /* ══════════════════════════════════════════
     3. NAV — scroll spy + scrolled state
  ══════════════════════════════════════════ */
  const nav        = document.getElementById('nav');
  const navLinks   = document.querySelectorAll('.nav-links a');
  const sections   = document.querySelectorAll('.section');

  window.addEventListener('scroll', () => {
    // Solid nav after 80 px
    nav.classList.toggle('scrolled', window.scrollY > 80);

    // Active link
    let current = 0;
    sections.forEach((sec, i) => {
      if (window.scrollY >= sec.offsetTop - 200) current = i;
    });
    navLinks.forEach((a, i) => a.classList.toggle('active', i === current));
  });

  /* ══════════════════════════════════════════
     4. SCROLL-REVEAL (IntersectionObserver)
  ══════════════════════════════════════════ */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.animate-in').forEach(el => revealObs.observe(el));

  /* ══════════════════════════════════════════
     5. HERO REVEAL
  ══════════════════════════════════════════ */
  function triggerHeroReveal() {
    document.querySelectorAll('.reveal-up').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }
  // Start paused then play after loader
  document.querySelectorAll('.reveal-up').forEach(el => {
    el.style.animationPlayState = 'paused';
  });

  /* ══════════════════════════════════════════
     6. HERO BACKGROUND — floating particles
  ══════════════════════════════════════════ */
  const heroBgEl = document.getElementById('heroBg');
  const bgRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  bgRenderer.setSize(heroBgEl.offsetWidth || window.innerWidth, heroBgEl.offsetHeight || window.innerHeight);
  heroBgEl.appendChild(bgRenderer.domElement);

  const bgScene  = new THREE.Scene();
  const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  bgCamera.position.z = 5;

  // Particle field
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pmat = new THREE.PointsMaterial({ color: 0x00f5c4, size: 0.05, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(pgeo, pmat);
  bgScene.add(particles);

  function animateBg() {
    requestAnimationFrame(animateBg);
    particles.rotation.y += 0.0004;
    particles.rotation.x += 0.0002;
    bgRenderer.render(bgScene, bgCamera);
  }
  animateBg();

  /* ══════════════════════════════════════════
     7. MAIN THREE.JS SCENE
  ══════════════════════════════════════════ */
  const canvas = document.getElementById('mainCanvas');

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(3, 2, 5);

  // Orbit Controls
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance   = 1.5;
  controls.maxDistance   = 12;

  /* ── Lighting ── */
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Accent rim light (teal)
  const rimLight = new THREE.PointLight(0x00f5c4, 1.5, 15);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);

  // Second accent (pink)
  const rimLight2 = new THREE.PointLight(0xff3d6b, 1.0, 15);
  rimLight2.position.set(4, -2, -3);
  scene.add(rimLight2);

  /* ── Axes Helper ── */
  const axesHelper = new THREE.AxesHelper(2.5);
  scene.add(axesHelper);

  /* ── Grid ── */
  const gridHelper = new THREE.GridHelper(8, 16, 0x222233, 0x161625);
  gridHelper.position.y = -1.8;
  scene.add(gridHelper);

  /* ── Material ── */
  let currentColor = '#00f5c4';
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(currentColor),
    roughness: 0.3,
    metalness: 0.6,
    wireframe: false,
  });

  /* ── Geometry definitions ── */
  const geometries = {
    cube:         () => new THREE.BoxGeometry(1.4, 1.4, 1.4),
    sphere:       () => new THREE.SphereGeometry(0.9, 48, 48),
    torus:        () => new THREE.TorusGeometry(0.8, 0.32, 24, 100),
    cone:         () => new THREE.ConeGeometry(0.8, 1.6, 32),
    dodecahedron: () => new THREE.DodecahedronGeometry(1.0, 0),
    cylinder:     () => new THREE.CylinderGeometry(0.6, 0.6, 1.6, 32),
  };

  const shapeDescriptions = {
    cube:         'BoxGeometry(1.4,1.4,1.4) — 6 faces, 8 vertices, 12 triangles.',
    sphere:       'SphereGeometry(0.9, 48, 48) — 2304 triangles, smooth normals.',
    torus:        'TorusGeometry(0.8, 0.32, 24, 100) — donut shape, 4800 triangles.',
    cone:         'ConeGeometry(0.8, 1.6, 32) — pointed solid, 32-sided base polygon.',
    dodecahedron: 'DodecahedronGeometry(1.0) — 12 pentagonal faces, 20 vertices.',
    cylinder:     'CylinderGeometry(0.6, 0.6, 1.6, 32) — 32-sided prism, 2 caps.',
  };

  /* ── Active mesh ── */
  let currentMesh = null;
  let currentShape = 'cube';

  function createMesh(shapeName) {
    // Remove old mesh
    if (currentMesh) {
      scene.remove(currentMesh);
      currentMesh.geometry.dispose();
    }
    const geo = geometries[shapeName]();
    currentMesh = new THREE.Mesh(geo, material);
    currentMesh.castShadow = true;
    scene.add(currentMesh);

    // Apply current slider values
    applyTransforms();

    // Update label
    document.getElementById('canvasShapeLabel').textContent = shapeName.toUpperCase();
    document.getElementById('shapeDesc').textContent = shapeDescriptions[shapeName];
    currentShape = shapeName;
  }

  createMesh('cube');

  /* ── Shape buttons ── */
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      createMesh(btn.dataset.shape);
    });
  });

  /* ── Transforms ── */
  function applyTransforms() {
    if (!currentMesh) return;
    currentMesh.position.set(
      parseFloat(document.getElementById('tx').value),
      parseFloat(document.getElementById('ty').value),
      parseFloat(document.getElementById('tz').value)
    );
    currentMesh.rotation.set(
      THREE.MathUtils.degToRad(parseFloat(document.getElementById('rx').value)),
      THREE.MathUtils.degToRad(parseFloat(document.getElementById('ry').value)),
      THREE.MathUtils.degToRad(parseFloat(document.getElementById('rz').value))
    );
    currentMesh.scale.set(
      parseFloat(document.getElementById('sx').value),
      parseFloat(document.getElementById('sy').value),
      parseFloat(document.getElementById('sz').value)
    );
  }

  /* ── Slider helpers ── */
  function bindSlider(id, valId, suffix, cb) {
    const input = document.getElementById(id);
    const val   = document.getElementById(valId);
    input.addEventListener('input', () => {
      const n = parseFloat(input.value);
      val.textContent = suffix === '°' ? n + '°' : n.toFixed(2);
      cb && cb();
      applyTransforms();
    });
  }

  bindSlider('tx', 'txVal', 'f');
  bindSlider('ty', 'tyVal', 'f');
  bindSlider('tz', 'tzVal', 'f');
  bindSlider('rx', 'rxVal', '°');
  bindSlider('ry', 'ryVal', '°');
  bindSlider('rz', 'rzVal', '°');
  bindSlider('sx', 'sxVal', 'f');
  bindSlider('sy', 'syVal', 'f');
  bindSlider('sz', 'szVal', 'f');

  /* ── Reset button ── */
  document.getElementById('resetBtn').addEventListener('click', () => {
    ['tx','ty','tz'].forEach(id => { document.getElementById(id).value = 0; });
    ['rx','ry','rz'].forEach(id => { document.getElementById(id).value = 0; });
    ['sx','sy','sz'].forEach(id => { document.getElementById(id).value = 1; });
    document.getElementById('txVal').textContent = '0.00';
    document.getElementById('tyVal').textContent = '0.00';
    document.getElementById('tzVal').textContent = '0.00';
    document.getElementById('rxVal').textContent = '0°';
    document.getElementById('ryVal').textContent = '0°';
    document.getElementById('rzVal').textContent = '0°';
    document.getElementById('sxVal').textContent = '1.00';
    document.getElementById('syVal').textContent = '1.00';
    document.getElementById('szVal').textContent = '1.00';
    applyTransforms();
  });

  /* ── Wireframe toggle ── */
  document.getElementById('btnSolid').addEventListener('click', () => {
    material.wireframe = false;
    document.getElementById('btnSolid').classList.add('active');
    document.getElementById('btnWire').classList.remove('active');
  });
  document.getElementById('btnWire').addEventListener('click', () => {
    material.wireframe = true;
    document.getElementById('btnWire').classList.add('active');
    document.getElementById('btnSolid').classList.remove('active');
  });

  /* ── Colour picker ── */
  document.getElementById('colorPicker').addEventListener('input', e => {
    material.color.set(e.target.value);
  });

  /* ── Mirror canvas into controls section ── */
  // We clone the canvas into the controls mirror div
  const mirror = document.getElementById('controlsMirror');
  mirror.appendChild(canvas);   // physically move the canvas; Three.js renders to it wherever it lives

  /* ── Resize handling ── */
  function resizeRenderer() {
    // The canvas parent decides size
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight || w;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // Hero bg
    bgRenderer.setSize(heroBgEl.offsetWidth, heroBgEl.offsetHeight);
    bgCamera.aspect = heroBgEl.offsetWidth / heroBgEl.offsetHeight;
    bgCamera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();

  /* ── Canvas visibility — move back to shapes section when scrolling up ── */
  // We use a single canvas and move it between the two placeholder divs
  const shapesWrap   = document.querySelector('.shapes-canvas-wrap');
  const controlsWrap = document.getElementById('controlsMirror');

  function repositionCanvas() {
    const shapesTop    = shapesWrap.getBoundingClientRect().top;
    const controlsTop  = controlsWrap.getBoundingClientRect().top;
    const vh           = window.innerHeight;

    // Whichever section is more visible gets the canvas
    const shapesVisible    = shapesTop < vh * 0.8 && shapesTop > -shapesWrap.offsetHeight * 0.5;
    const controlsVisible  = controlsTop < vh * 0.8 && controlsTop > -controlsWrap.offsetHeight * 0.5;

    if (controlsVisible && canvas.parentElement !== controlsWrap) {
      controlsWrap.appendChild(canvas);
      resizeRenderer();
    } else if (!controlsVisible && shapesVisible && canvas.parentElement !== shapesWrap) {
      shapesWrap.appendChild(canvas);
      resizeRenderer();
    }
  }
  window.addEventListener('scroll', repositionCanvas, { passive: true });
  repositionCanvas();

  /* ── Auto-rotate idle ── */
  let userInteracting = false;
  controls.addEventListener('start', () => userInteracting = true);
  controls.addEventListener('end',   () => {
    setTimeout(() => userInteracting = false, 2000);
  });

  /* ── Render loop ── */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Gentle idle rotation when user isn't dragging
    if (!userInteracting && currentMesh) {
      currentMesh.rotation.y += 0.004;
      // Add a tiny float
      currentMesh.position.y += Math.sin(t * 0.8) * 0.001;
    }

    // Rim light pulse
    rimLight.intensity  = 1.2 + Math.sin(t * 1.2) * 0.3;
    rimLight2.intensity = 0.8 + Math.cos(t * 0.8) * 0.2;

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  /* ══════════════════════════════════════════
     8. PARALLAX on mouse (hero section only)
  ══════════════════════════════════════════ */
  const heroSection = document.getElementById('hero');
  document.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;

    // Subtle parallax on hero text
    const hc = heroSection.querySelector('.hero-content');
    if (hc) {
      hc.style.transform = `translate(${cx * 8}px, ${cy * 4}px)`;
    }
  });

  /* ══════════════════════════════════════════
     9. SMOOTH ANCHOR SCROLL
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

}); // end DOMContentLoaded
