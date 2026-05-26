(function () {
  'use strict';

  function createBotScene(canvas, size, camZ) {
    if (!canvas) return null;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, camZ);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x8899ff, 2.5));
    var key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(3, 5, 4);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0x4466ff, 2);
    fill.position.set(-3, -1, 2);
    scene.add(fill);

    var mixer = null;
    var group = new THREE.Group();
    scene.add(group);

    var loader = new THREE.GLTFLoader();
    loader.load('assets/360_sphere_robot.glb', function (gltf) {
      /* hide fallback SVG once 3D loads */
      var fb = document.getElementById('botFallback');
      if (fb) fb.style.display = 'none';
      var m = gltf.scene;
      var box = new THREE.Box3().setFromObject(m);
      var center = new THREE.Vector3();
      box.getCenter(center);
      var size3 = new THREE.Vector3();
      box.getSize(size3);
      var maxDim = Math.max(size3.x, size3.y, size3.z) || 1;
      var s = 1.6 / maxDim;
      m.scale.setScalar(s);
      m.position.set(-center.x * s, -center.y * s, -center.z * s);
      group.add(m);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(m);
        var clip = gltf.animations[0];
        mixer.clipAction(clip).play();
      }
    }, undefined, function (e) { console.error('cute_bot.glb', e); });

    return { renderer: renderer, scene: scene, camera: camera, group: group, getMixer: function(){ return mixer; } };
  }

  var clock = new THREE.Clock();
  var scenes = [];
  var isHovered = false;

  function init() {
    var floatCanvas  = document.getElementById('botFloatCanvas');
    var headerCanvas = document.getElementById('botHeaderCanvas');

    var s1 = createBotScene(floatCanvas,  130, 3.5);
    var s2 = createBotScene(headerCanvas, 38, 3.5);

    if (s1) scenes.push(s1);
    if (s2) scenes.push(s2);

    var btn = document.getElementById('chatFloatBtn');
    if (btn) {
      btn.addEventListener('mouseenter', function () { isHovered = true; });
      btn.addEventListener('mouseleave', function () { isHovered = false; });
    }

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();

    scenes.forEach(function (s) {
      var mixer = s.getMixer();
      if (mixer) mixer.update(delta);
      if (isHovered) {
        s.group.rotation.y += 0.04;
      } else {
        s.group.rotation.y *= 0.90;
      }
      s.renderer.render(s.scene, s.camera);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
