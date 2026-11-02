import * as THREE from 'three';

// 02 · Hero "toy box": clay-like toys, one per thing that sets EP apart.
// Built procedurally (no model downloads). Toys float, drift away from the
// cursor, bounce when tapped and scatter upward as the hero scrolls away.
const C = {
  paper: 0xF6F2EA, cream: 0xEFE6D2, ink: 0x23261F, forest: 0x3B5E1A, olive: 0x6E7157,
  sage: 0xA9AE93, ochre: 0xB8894C, clay: 0x744A26, marigold: 0xF2B33D, tan: 0xBDAF90,
};

const TOYS = [
  { key: 'golf', name: 'Golf', line: 'Weekly coaching for focus, patience and honesty.' },
  { key: 'mic', name: 'Podcasting', line: 'Children interview, record and publish their own podcast.' },
  { key: 'plane', name: 'Academic excellence', line: 'From farms to flight decks, at each child’s pace.' },
  { key: 'key', name: 'Humane tech', line: 'From the typewriter to the podcast studio.' },
  { key: 'coin', name: 'Real-life entrepreneurship', line: 'Children make, price and sell real products.' },
  { key: 'guitar', name: 'Arts and humanities', line: 'Music, choir, theater and art, fully engaged.' },
  { key: 'leaf', name: 'Childhood play', line: 'Free play every day, and real work outdoors.' },
  { key: 'globe', name: 'Cultural immersion', line: 'French, ASL, many faiths and world cuisines.' },
];

const clay = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0, ...extra });

function canvasTexture(draw, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function buildToy(key) {
  const g = new THREE.Group();
  switch (key) {
    case 'golf': {
      const bump = canvasTexture((x, s) => {
        x.fillStyle = '#fff'; x.fillRect(0, 0, s, s);
        x.fillStyle = '#9a9a9a';
        for (let i = 0; i < 26; i++) for (let j = 0; j < 13; j++) {
          x.beginPath(); x.arc((i + (j % 2) * 0.5) * (s / 26), j * (s / 13) + 6, 3.2, 0, Math.PI * 2); x.fill();
        }
      });
      bump.colorSpace = THREE.NoColorSpace;
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), clay(0xFBF8F1, { bumpMap: bump, bumpScale: 1.4, roughness: 0.55 })));
      break;
    }
    case 'mic': {
      const grille = canvasTexture((x, s) => {
        x.fillStyle = '#4A4D44'; x.fillRect(0, 0, s, s);
        x.strokeStyle = '#2B2E27'; x.lineWidth = 3;
        for (let i = 0; i < s; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, s); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(s, i); x.stroke(); }
      });
      const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.35, 12, 24), clay(0xffffff, { map: grille }));
      head.position.y = 0.35;
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 32), clay(C.marigold));
      band.position.y = 0.02;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.7, 24), clay(C.ink));
      handle.position.y = -0.38;
      g.add(head, band, handle);
      break;
    }
    case 'plane': {
      const geo = new THREE.BufferGeometry();
      const v = [
        0, 0, 0.9, -0.7, 0, -0.6, 0, 0.05, -0.35,
        0, 0, 0.9, 0, 0.05, -0.35, 0.7, 0, -0.6,
        0, 0, 0.9, 0, 0.05, -0.35, 0, -0.32, -0.45,
      ];
      geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      geo.computeVertexNormals();
      g.add(new THREE.Mesh(geo, clay(C.paper, { side: THREE.DoubleSide, roughness: 0.85 })));
      g.rotation.set(0.3, 0.6, 0.2);
      break;
    }
    case 'key': {
      const top = canvasTexture((x, s) => {
        x.fillStyle = '#23261F'; x.fillRect(0, 0, s, s);
        x.fillStyle = '#F6F2EA'; x.font = `700 ${s * 0.55}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('P', s / 2, s / 2 + 6);
      });
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 40), [clay(C.ochre), clay(0xffffff, { map: top }), clay(C.ochre)]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 12, 40), clay(C.ochre));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.07;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 16), clay(C.ink));
      stem.position.y = -0.26;
      g.add(cap, ring, stem);
      g.rotation.x = 0.7;
      break;
    }
    case 'coin': {
      const face = canvasTexture((x, s) => {
        x.fillStyle = '#C99A55'; x.fillRect(0, 0, s, s);
        x.strokeStyle = '#8C6631'; x.lineWidth = 8; x.beginPath(); x.arc(s / 2, s / 2, s * 0.4, 0, Math.PI * 2); x.stroke();
        x.fillStyle = '#7A5527'; x.font = `700 ${s * 0.5}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('¢', s / 2, s / 2 + 4);
      });
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 48), [clay(C.ochre), clay(0xffffff, { map: face, roughness: 0.45 }), clay(0xffffff, { map: face, roughness: 0.45 })]);
      coin.rotation.x = Math.PI / 2;
      g.add(coin);
      break;
    }
    case 'guitar': {
      const body = new THREE.Shape();
      body.absarc(0, -0.32, 0.36, 0, Math.PI * 2, false);
      const upper = new THREE.Shape();
      upper.absarc(0, 0.12, 0.27, 0, Math.PI * 2, false);
      const settings = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 4, curveSegments: 32 };
      const wood = clay(C.clay);
      const b1 = new THREE.Mesh(new THREE.ExtrudeGeometry(body, settings), wood);
      const b2 = new THREE.Mesh(new THREE.ExtrudeGeometry(upper, settings), wood);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.11, 32), clay(C.ink));
      hole.position.set(0, -0.12, 0.22);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.08), clay(C.ink));
      neck.position.set(0, 0.62, 0.1);
      const headstock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), clay(C.marigold));
      headstock.position.set(0, 1.04, 0.1);
      g.add(b1, b2, hole, neck, headstock);
      g.scale.setScalar(0.75);
      g.rotation.z = -0.4;
      break;
    }
    case 'leaf': {
      const s = new THREE.Shape();
      s.moveTo(0, -0.6);
      s.bezierCurveTo(0.55, -0.3, 0.55, 0.35, 0, 0.7);
      s.bezierCurveTo(-0.55, 0.35, -0.55, -0.3, 0, -0.6);
      const leaf = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 32 }), clay(C.olive));
      const vein = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.1, 8), clay(0x3C4136));
      vein.position.set(0, 0.02, 0.12);
      g.add(leaf, vein);
      g.rotation.z = -0.5;
      break;
    }
    case 'globe': {
      const map = canvasTexture((x, s) => {
        x.fillStyle = '#A9AE93'; x.fillRect(0, 0, s * 2, s);
        x.fillStyle = '#3B5E1A';
        const blobs = [[0.18, 0.35, 0.12], [0.3, 0.6, 0.09], [0.52, 0.3, 0.1], [0.58, 0.55, 0.14], [0.8, 0.4, 0.11], [0.9, 0.7, 0.06]];
        blobs.forEach(([bx, by, r]) => { x.beginPath(); x.ellipse(bx * s, by * s, r * s * 1.3, r * s, 0.3, 0, Math.PI * 2); x.fill(); });
      }, 512);
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.48, 48, 32), clay(0xffffff, { map })));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.025, 8, 64), clay(C.ochre));
      ring.rotation.set(1.2, 0.3, 0);
      g.add(ring);
      break;
    }
    default: break;
  }
  return g;
}

// compact: the small phone slot beside the hero buttons (two toys only).
export function initToys(stage, { compact = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0xFFF7E8, 0x9AA08A, 1.6));
  const key = new THREE.DirectionalLight(0xFFE8C8, 2.2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xCFE0DF, 0.8);
  rim.position.set(-5, -2, 3);
  scene.add(rim);

  // The phone slot has no tooltip of its own; the toys there are decorative.
  const tip = stage.querySelector('.toy-tip');
  const toys = TOYS.map((t, i) => {
    const holder = new THREE.Group();
    const mesh = buildToy(t.key);
    holder.add(mesh);
    holder.userData = {
      ...t, mesh, home: new THREE.Vector3(), push: new THREE.Vector3(),
      phase: i * 1.7, speed: 2.5 + (i % 4) * 0.5, spin: 0.15 + (i % 3) * 0.08, depth: 0.6 + (i % 3) * 0.35,
      baseRot: mesh.rotation.clone(), bounce: 0,
    };
    scene.add(holder);
    return holder;
  });

  // Positions in a loose ring, normalised to the visible frustum each resize.
  // Desktop keeps the left of the stage clear where the H1 runs long.
  const layoutDesktop = [[0.02, 0.62], [0.55, 0.55], [-0.05, -0.28], [0.68, 0.12], [0.22, -0.05], [-0.42, -0.45], [0.12, -0.58], [0.62, -0.45]];
  // Phone slot: golf ball and microphone, side by side.
  const layoutCompact = [[-0.46, -0.04], [0.5, 0.02]];
  let halfW = 1;
  let halfH = 1;
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    const layout = compact ? layoutCompact : layoutDesktop;
    const scale = compact ? halfH * 1.05 : Math.min(1.55, halfW / 3.2);
    toys.forEach((toy, i) => {
      const spot = layout[i];
      toy.visible = !!spot;
      if (!spot) return;
      toy.userData.home.set(spot[0] * halfW * 0.82, spot[1] * halfH * 0.8, (i % 3) * -0.6);
      toy.scale.setScalar(scale);
    });
  }
  resize();
  new ResizeObserver(resize).observe(stage);

  // Pointer → world position on the z=0 plane.
  const pointer = new THREE.Vector2(9, 9);
  const world = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const toWorld = (e) => {
    const r = stage.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    world.set(pointer.x * halfW, pointer.y * halfH, 0);
  };
  stage.addEventListener('pointermove', toWorld);
  stage.addEventListener('pointerleave', () => { pointer.set(9, 9); world.set(99, 99, 0); });

  let tipTimer;
  stage.addEventListener('click', (e) => {
    toWorld(e);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(toys.filter((t) => t.visible), true)[0];
    if (!hit) return;
    let toy = hit.object;
    while (toy.parent && !toys.includes(toy)) toy = toy.parent;
    toy.userData.bounce = 1;
    if (!tip) return;
    const r = stage.getBoundingClientRect();
    tip.innerHTML = `<strong>${toy.userData.name}</strong>${toy.userData.line}`;
    tip.style.left = `${e.clientX - r.left}px`;
    tip.style.top = `${e.clientY - r.top}px`;
    tip.style.transition = 'opacity .25s';
    tip.style.opacity = '1';
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => { tip.style.opacity = '0'; }, 2600);
  });

  // Scroll scatter: toys rise at different speeds as the hero leaves.
  let scrollP = 0;
  const onScroll = () => {
    const r = stage.getBoundingClientRect();
    scrollP = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Only render while visible and the tab is active.
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(stage);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const t = clock.getElapsedTime();
    toys.forEach((toy) => {
      if (!toy.visible) return;
      const u = toy.userData;
      // Repel from the pointer within ~1.6 world units.
      tmp.copy(toy.position).sub(world);
      tmp.z = 0;
      const dist = tmp.length();
      const force = dist < 1.6 ? (1.6 - dist) * 0.9 : 0;
      if (force > 0) tmp.normalize().multiplyScalar(force); else tmp.set(0, 0, 0);
      u.push.lerp(tmp, 0.08);

      const bob = Math.sin(t * (2 * Math.PI / u.speed) + u.phase) * 0.12;
      toy.position.set(
        u.home.x + u.push.x,
        u.home.y + bob + u.push.y + scrollP * halfH * 1.4 * u.depth,
        u.home.z,
      );
      u.mesh.rotation.y = u.baseRot.y + t * u.spin + u.push.x * 0.6;
      u.mesh.rotation.x = u.baseRot.x + Math.sin(t * 0.5 + u.phase) * 0.15 + u.push.y * 0.4;
      if (u.bounce > 0) {
        u.bounce = Math.max(0, u.bounce - 0.025);
        const k = Math.sin((1 - u.bounce) * Math.PI * 3) * u.bounce * 0.35;
        toy.position.y += k;
        u.mesh.rotation.z = u.baseRot.z + k * 2;
      }
    });
    renderer.render(scene, camera);
  });
}
