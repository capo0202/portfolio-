(function () {

  var canvas = document.getElementById('meteorCanvas');
  if (!canvas) return;

  var W = window.innerWidth, H = window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  lanes.forEach(function (lane, i) {
    loader.load(lane.file, function (gltf) {
      var root = new THREE.Group();
      var m = gltf.scene;

      /* Normalisieren + zentrieren im lokalen Group */
      var box = new THREE.Box3().setFromObject(m);
      var center = new THREE.Vector3();
      box.getCenter(center);
      var size = new THREE.Vector3();
      box.getSize(size);
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var s = lane.scale / maxDim;

      m.scale.setScalar(s);
      /* Verschiebe Mesh so, dass seine Mitte bei (0,0,0) der Group liegt */
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
      /* Startposition: rechts außerhalb */
      root.position.set(lane.xStart, lane.y, lane.z);
      scene.add(root);
      meshes[i] = { root: root, lane: lane };
    }, undefined, function(e){ console.error(lane.file, e); });
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

  function animate() {
    requestAnimationFrame(animate);
    smoothP += (rawP() - smoothP) * 0.15;

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
