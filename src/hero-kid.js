import * as THREE from 'three';

// Hero "little one": a toddler with a small afro,
// built from the same kind of primitives and matte clay materials as the toys
// in hero-toys.js. No images, no models. It waddles from toy to toy, reaches
// out, the toy pops and spins, a "hehe!" bubble appears, and it moves on.
// Created only when <html data-kid="1">; hero-toys.js loads this file lazily.
//
// Still poses: ?kidpose=front|side|reach freezes the child.
// Reduced motion: the child stands still beside the toys, smiling.

const SKIN = 0x75482A;
const SKIN_LIGHT = 0x7F4F30;
const HAIR = 0x2A1D15;
const HAIR_HIGHLIGHT = 0x38271D;
const FOREST = 0x3B5E1A;
const MARIGOLD = 0xF2B33D;
const OCHRE = 0xB78B4F;
const INK = 0x23261F;
const CHEEK = 0x9C553C;

const mat = (color, roughness = 0.78) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });

const ARM_LEN = 0.46; // shoulder to fingertip, in character units
const SHOULDER = { x: 0.31, y: 1.08 };
const TORSO_HEIGHT = 0.40;
const HEIGHT = 2.2; // feet to top of the afro
const FACE = { x: 0.46, y: 0.49, z: 0.46 };
const Z_FRONT = 1.4; // the child stands in front of every toy
const CAM_Z = 10;
const PERSPECTIVE = (CAM_Z - Z_FRONT) / CAM_Z; // keeps plane units equal to the toys' units

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

function buildKid() {
  const skin = mat(SKIN);
  const skinLight = mat(SKIN_LIGHT);
  const green = mat(FOREST, 0.82);
  const ink = mat(INK, 0.6);
  const hairMat = mat(HAIR, 0.92);
  const lighterCurl = mat(HAIR_HIGHLIGHT, 0.92);
  const cheekMat = mat(CHEEK, 0.9);
  const shoeMat = mat(OCHRE, 0.8);
  const gold = mat(MARIGOLD, 0.7);
  const mouthMat = mat(0x1E0E07, 0.7);
  const tongueMat = mat(0xB36956, 0.8);
  const white = mat(0xF5EADB, 0.65);
  const glintMat = mat(0xFFF7E8, 0.45);
  const irisMat = mat(0x69422B, 0.68);

  const sphere = new THREE.SphereGeometry(1, 28, 20);
  const hairSphere = new THREE.SphereGeometry(1, 16, 12);
  const ball = (m, sx, sy, sz, geo = sphere) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.scale.set(sx, sy, sz);
    return mesh;
  };
  const curvedLine = (m, start, mid, end, radius) => {
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const line = new THREE.Group();
    line.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 8), m));
    for (const point of [start, end]) {
      const tip = ball(m, radius, radius, radius, hairSphere);
      tip.position.copy(point);
      line.add(tip);
    }
    return line;
  };

  const root = new THREE.Group(); // feet at y = 0
  const body = new THREE.Group(); // sways and bounces
  root.add(body);

  // The green romper tapers into the shorts, with two marigold buttons.
  const torso = ball(green, 0.34, TORSO_HEIGHT, 0.29);
  torso.position.y = 0.84;
  body.add(torso);
  [-0.105, 0.105].forEach((x) => {
    const b = ball(gold, 0.029, 0.029, 0.017);
    b.position.set(x, 1.055, 0.239);
    b.rotation.set(-0.42, Math.sign(x) * 0.23, 0);
    body.add(b);
  });

  // Legs: green shorts, short skin shins, ochre shoes. Pivot at the hip.
  const legs = [-1, 1].map((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.145, 0.52, 0);
    const shorts = new THREE.Mesh(new THREE.CapsuleGeometry(0.117, 0.13, 6, 14), green);
    shorts.position.y = -0.1;
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.13, 6, 12), skin);
    shin.position.y = -0.28;
    const shoe = ball(shoeMat, 0.109, 0.073, 0.16);
    shoe.position.set(0, -0.45, 0.04);
    leg.add(shorts, shin, shoe);
    body.add(leg);
    return leg;
  });

  // Arms: short green sleeve, skin arm, round hand. Pivot at the shoulder.
  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * SHOULDER.x, SHOULDER.y, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.093, 0.06, 6, 12), green);
    sleeve.position.y = -0.06;
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.063, 0.15, 6, 12), skin);
    upper.position.y = -0.225;
    const hand = ball(skin, 0.079, 0.086, 0.075);
    hand.position.y = -0.374;
    arm.add(sleeve, upper, hand);
    body.add(arm);
    return arm;
  });

  // A slightly oval face keeps the soft, oversized toy proportions.
  const head = new THREE.Group();
  head.position.y = 1.55;
  body.add(head);
  head.add(ball(skin, FACE.x, FACE.y, FACE.z));

  // Put a flat feature on the face, facing outward.
  const zAxis = new THREE.Vector3(0, 0, 1);
  const onFace = (obj, x, y, lift = 0) => {
    const z = FACE.z * Math.sqrt(1 - (x / FACE.x) ** 2 - (y / FACE.y) ** 2);
    const normal = new THREE.Vector3(x / FACE.x ** 2, y / FACE.y ** 2, z / FACE.z ** 2).normalize();
    obj.position.set(x, y, z).addScaledVector(normal, lift);
    obj.quaternion.setFromUnitVectors(zAxis, normal);
    head.add(obj);
    return obj;
  };

  const eyes = [-1, 1].map((side) => {
    const eye = new THREE.Group();
    eye.add(ball(white, 0.102, 0.089, 0.020));
    const iris = ball(irisMat, 0.078, 0.078, 0.022);
    iris.position.set(0.014, 0.002, 0.014);
    const pupil = ball(ink, 0.059, 0.064, 0.019);
    pupil.position.set(0.016, 0.003, 0.025);
    const glint = ball(glintMat, 0.019, 0.019, 0.008);
    glint.position.set(0.037, 0.029, 0.042);
    eye.add(iris, pupil, glint);
    return onFace(eye, side * 0.166, 0.078);
  });
  for (const side of [-1, 1]) {
    const brow = curvedLine(hairMat,
      new THREE.Vector3(-0.066, -0.006, -0.004),
      new THREE.Vector3(-0.004, 0.038, 0),
      new THREE.Vector3(0.064, -0.008, -0.004), 0.014);
    onFace(brow, side * 0.168, 0.204);
    brow.rotateZ(side * -0.09);
    onFace(ball(cheekMat, 0.064, 0.033, 0.009), side * 0.255, -0.085, -0.003);
  }
  onFace(ball(skinLight, 0.05, 0.036, 0.035), 0, -0.044);

  const mouth = new THREE.Group();
  const smile = curvedLine(mouthMat,
    new THREE.Vector3(-0.109, 0.025, -0.007),
    new THREE.Vector3(0, -0.105, 0.003),
    new THREE.Vector3(0.109, 0.025, -0.007), 0.017);
  mouth.add(smile);
  const laughShape = new THREE.Shape();
  laughShape.moveTo(-0.117, 0.026);
  laughShape.quadraticCurveTo(0, -0.012, 0.117, 0.026);
  laughShape.bezierCurveTo(0.128, -0.077, -0.128, -0.077, -0.117, 0.026);
  const open = new THREE.Group();
  open.add(new THREE.Mesh(new THREE.ShapeGeometry(laughShape, 14), mouthMat));
  const tongue = ball(tongueMat, 0.042, 0.014, 0.004);
  tongue.position.set(0, -0.036, 0.005);
  open.add(tongue);
  open.visible = false;
  mouth.add(open);
  onFace(mouth, 0, -0.177, 0.005);

  // Ears, then an afro of clustered spheres around the top, back and sides.
  [-1, 1].forEach((side) => {
    const ear = ball(skin, 0.068, 0.091, 0.052);
    ear.position.set(side * 0.447, -0.025, 0.04);
    head.add(ear);
  });
  const hair = new THREE.Group();
  head.add(hair);
  const N = 88;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i + 0.5) * (2 / N);
    const r = Math.sqrt(1 - y * y);
    const th = i * golden;
    const d = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    const frontFace = d.z > 0.24 && d.y < 0.71; // leave the eyebrows and temples clear
    const earZone = Math.abs(d.x) > 0.77 && d.y < 0.25 && d.z > -0.33;
    if (frontFace || earZone || d.y < -0.27) continue;
    const size = 0.124 + ((i * 37) % 9) * 0.006;
    const puff = ball(i % 4 === 0 ? lighterCurl : hairMat, size, size * 0.94, size, hairSphere);
    puff.position.set(d.x * 0.418, d.y * 0.45 + 0.02, d.z * 0.42 - 0.018);
    hair.add(puff);
  }
  const base = ball(hairMat, 0.452, 0.42, 0.386, hairSphere);
  base.position.set(0, 0.142, -0.115);
  hair.add(base);

  return { root, body, torso, head, legs, arms, eyes, smile, open };
}

// Returns { layout, update, dispose }.
export function createKid({ scene, stage, toys, compact, reduced }) {
  const parts = buildKid();
  const group = new THREE.Group();
  group.add(parts.root);
  group.scale.setScalar(PERSPECTIVE);
  group.position.z = Z_FRONT;
  scene.add(group);

  // Freeze the character for screenshots: ?kidpose=front|side|reach.
  let pose = null;
  try {
    const p = new URLSearchParams(location.search).get('kidpose');
    if (p === 'front' || p === 'side' || p === 'reach') pose = p;
  } catch { /* no URL access */ }
  if (!pose && reduced) pose = 'front';

  // "hehe!" bubble (not in the tiny phone slot, where it would sit over the title).
  let bubble = null;
  if (!compact) {
    bubble = document.createElement('div');
    bubble.className = 'kid-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.textContent = 'hehe!';
    stage.appendChild(bubble);
  }

  const G = { halfW: 1, halfH: 1, toyScale: 1, s: 1 };
  const S = {
    x: 0, y: 0, face: 0, gait: 0, walk: 0, lift: 0, reachAmt: 0, reachTheta: 1.6, reachDir: 1,
    laugh: 0, blink: 0, nextBlink: 2, clock: 0, bubbleT: 0, scroll: 0,
  };
  let tour = [];
  let step = { mode: 'idle', i: 0, t: 0, dur: 1, from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, fired: false, toy: null, held: 0 };
  const kicks = new Map(); // toy -> { t, dir }
  const shoulder = new THREE.Vector3();

  const visibleToys = () => toys.filter((t) => t.visible);

  // Where to stand so the toy is within arm's reach, on the side nearest the centre.
  function standFor(toy, side) {
    const s = G.s;
    const home = toy.userData.home;
    const dir = side ?? (home.x > 0 ? 1 : -1); // direction from child to toy
    const toyR = 0.55 * G.toyScale;
    const gap = toyR + (ARM_LEN * 0.82 + SHOULDER.x) * s;
    let x = home.x - dir * gap;
    const maxX = G.halfW - 0.6 * s;
    x = compact ? 0 : clamp(x, -maxX, maxX); // phone: always between the two toys
    let y;
    if (compact) y = -G.halfH * 0.93;
    else y = clamp(home.y - (SHOULDER.y + 0.3) * s, -G.halfH * 0.93, G.halfH * 0.97 - HEIGHT * s);
    return { x, y, dir: home.x > x ? 1 : -1 };
  }

  function layout({ halfW, halfH, toyScale, compact: c }) {
    G.halfW = halfW; G.halfH = halfH; G.toyScale = toyScale;
    G.s = toyScale * (c ? 0.68 : 0.88);
    parts.root.scale.setScalar(G.s);
    // Visit the toys in a loop around the ring (sorted by angle around their centre).
    const vis = visibleToys();
    const cx = vis.reduce((a, t) => a + t.userData.home.x, 0) / (vis.length || 1);
    const cy = vis.reduce((a, t) => a + t.userData.home.y, 0) / (vis.length || 1);
    tour = c ? vis.slice(0, 2) : vis.slice().sort((a, b) => (
      Math.atan2(a.userData.home.y - cy, a.userData.home.x - cx) - Math.atan2(b.userData.home.y - cy, b.userData.home.x - cx)
    ));
    if (pose) {
      startFresh(); applyPose(); animate(0); placeBubble(0); // static: draw it once
    } else if (step.mode === 'idle') startFresh();
  }

  function startFresh() {
    if (!tour.length) return;
    if (pose) { placePoseSpot(); return; }
    const first = tour[0];
    const spot = standFor(first);
    // Start inside the stage so the child is visible before the first walk.
    const enterFrom = compact ? spot.x : spot.x * 0.35;
    S.x = enterFrom; S.y = spot.y;
    S.face = Math.sign(spot.x - enterFrom) * 1.0;
    step = { mode: compact ? 'reach' : 'walk', i: 0, t: compact ? -0.8 : -0.5, dur: 2.3, from: { x: enterFrom, y: spot.y }, to: spot, fired: false, toy: first, held: 0 };
    if (compact) { S.x = spot.x; S.y = spot.y; }
  }

  function placePoseSpot() {
    // Beside the toy nearest the middle of the stage.
    const toy = tour.slice().sort((a, b) => Math.hypot(a.userData.home.x, a.userData.home.y) - Math.hypot(b.userData.home.x, b.userData.home.y))[0] || tour[0];
    const spot = standFor(toy);
    S.x = spot.x; S.y = spot.y; S.reachDir = spot.dir;
    step.toy = toy;
  }

  function reachAngle(toy, dir) {
    shoulder.set(S.x + dir * SHOULDER.x * G.s, S.y + SHOULDER.y * G.s, 0);
    const dx = toy.userData.home.x - shoulder.x;
    const dy = toy.userData.home.y - shoulder.y;
    const th = Math.atan2(Math.abs(dx), -dy); // angle away from "hanging down"
    return dir * clamp(th, 0.7, 2.7);
  }

  function pop(toy, dir) {
    toy.userData.bounce = 1;
    kicks.set(toy, { t: 0, dir });
    S.laugh = 1.3;
    S.bubbleT = 1.25;
    if (bubble) bubble.classList.add('on');
  }

  function nextStep() {
    step.i = (step.i + 1) % tour.length;
    const toy = tour[step.i];
    const spot = standFor(toy);
    const dist = Math.hypot(spot.x - S.x, spot.y - S.y);
    step = {
      mode: 'walk', i: step.i, t: 0, dur: clamp(dist / 1.9, 1.4, 2.8),
      from: { x: S.x, y: S.y }, to: spot, fired: false, toy, held: 0,
    };
  }

  function advance(dt) {
    const toy = step.toy;
    if (!toy) return;
    if (step.mode === 'walk') {
      step.t += dt;
      const k = smooth(step.t / step.dur);
      S.x = step.from.x + (step.to.x - step.from.x) * k;
      S.y = step.from.y + (step.to.y - step.from.y) * k;
      const dx = step.to.x - step.from.x;
      S.walk = damp(S.walk, step.t > 0 && step.t < step.dur ? 1 : 0, 10, dt);
      if (Math.abs(dx) > 0.05 && step.t < step.dur * 0.92) S.face = damp(S.face, Math.sign(dx) * 1.0, 7, dt);
      S.reachAmt = damp(S.reachAmt, 0, 8, dt);
      if (step.t >= step.dur) {
        step = { mode: 'reach', i: step.i, t: 0, dur: 1.9, from: step.to, to: step.to, fired: false, toy, held: 0 };
      }
    } else if (step.mode === 'reach') {
      step.t += dt;
      S.walk = damp(S.walk, 0, 10, dt);
      const dir = compact ? (toy.userData.home.x > 0 ? 1 : -1) : (toy.userData.home.x > S.x ? 1 : -1);
      S.reachDir = dir;
      S.reachTheta = reachAngle(toy, dir);
      S.face = damp(S.face, dir * 0.35, 6, dt);
      const raise = step.t < 0.55 ? smooth(step.t / 0.55) : (step.t > step.dur - 0.45 ? 1 - smooth((step.t - (step.dur - 0.45)) / 0.45) : 1);
      S.reachAmt = Math.max(0, raise);
      if (!step.fired && step.t >= 0.5) { step.fired = true; pop(toy, dir); }
      if (step.t >= step.dur) {
        if (compact) {
          // Phone: stay put and tap the other toy.
          step.i = (step.i + 1) % tour.length;
          step.toy = tour[step.i]; step.t = 0; step.fired = false;
        } else nextStep();
      }
    }
  }

  function applyPose() {
    const toy = step.toy || tour[0];
    if (!toy) return;
    S.walk = 0; S.laugh = 0; S.bubbleT = 0;
    if (pose === 'front') { S.face = 0; S.reachAmt = 0; }
    else if (pose === 'side') { S.face = 1.25; S.reachAmt = 0; S.walk = 0.9; S.gait = 0.9; }
    else {
      S.face = S.reachDir * 0.35; S.reachAmt = 1; S.reachTheta = reachAngle(toy, S.reachDir);
      S.laugh = 1;
    }
  }

  function animate(dt) {
    const s = G.s;
    const idle = pose ? 0 : 1;
    S.clock += dt;
    S.gait += dt * 9 * S.walk;
    const sw = Math.sin(S.gait);

    // Scroll scatter, like the toys: rises as the hero leaves.
    const rise = S.scroll * G.halfH * 1.4 * 0.7;
    const bounceY = Math.abs(sw) * 0.07 * S.walk;
    const laughHop = S.laugh > 0 ? Math.abs(Math.sin(S.clock * 16)) * 0.05 * Math.min(1, S.laugh) : 0;
    // Positions are in the toys' plane units; the group's scale undoes the
    // perspective of standing nearer the camera than the toys.
    parts.root.position.set(S.x, S.y + (bounceY + laughHop) * s + rise, 0);

    parts.root.rotation.y = S.face;
    parts.body.rotation.z = sw * 0.11 * S.walk + Math.sin(S.clock * 1.7) * 0.012 * idle;
    parts.body.position.x = sw * 0.03 * S.walk;
    parts.torso.scale.y = TORSO_HEIGHT + Math.sin(S.clock * 2.1) * 0.008 * idle;
    parts.head.rotation.z = -sw * 0.07 * S.walk + (S.laugh > 0 ? Math.sin(S.clock * 17) * 0.06 * Math.min(1, S.laugh) : Math.sin(S.clock * 1.3) * 0.03 * idle);
    parts.head.rotation.x = S.laugh > 0 ? -0.08 : 0;

    const swing = 0.55 * S.walk;
    parts.legs[0].rotation.x = sw * swing;
    parts.legs[1].rotation.x = -sw * swing;
    parts.legs[0].position.y = 0.52 + Math.max(0, -sw) * 0.05 * S.walk;
    parts.legs[1].position.y = 0.52 + Math.max(0, sw) * 0.05 * S.walk;

    // Arms: swing while walking, raise toward the toy while reaching.
    const reachIdx = S.reachDir > 0 ? 1 : 0;
    const flap = Math.sin(S.clock * 15) * 0.1 * S.reachAmt * Math.min(1, S.laugh);
    parts.arms.forEach((arm, i) => {
      const side = i === 1 ? 1 : -1;
      const rest = side * 0.2;
      if (i === reachIdx) {
        arm.rotation.z = rest + (S.reachTheta - rest) * S.reachAmt + flap;
        arm.rotation.x = (i === 0 ? -sw : sw) * 0.5 * S.walk * (1 - S.reachAmt) - 0.25 * S.reachAmt;
      } else {
        // The free arm comes up a little in delight.
        arm.rotation.z = rest + side * 1.0 * S.reachAmt * 0.7 + (S.laugh > 0 ? side * Math.sin(S.clock * 15) * 0.1 : 0);
        arm.rotation.x = (i === 0 ? sw : -sw) * 0.5 * S.walk;
      }
    });

    // Face: blink now and then; switch to the open grin while laughing.
    if (!pose) {
      S.nextBlink -= dt;
      if (S.nextBlink <= 0) { S.blink = 0.13; S.nextBlink = 2.6 + Math.random() * 2.4; }
    }
    S.blink = Math.max(0, S.blink - dt);
    const eyeY = S.blink > 0 ? 0.15 : 1;
    parts.eyes.forEach((e) => { e.scale.y = eyeY; });
    const lau = S.laugh > 0 ? Math.min(1, S.laugh) : 0;
    parts.open.visible = lau > 0.05;
    parts.smile.visible = !parts.open.visible;
    parts.open.scale.setScalar(0.72 + 0.28 * lau);
    if (S.laugh > 0) S.laugh = Math.max(0, S.laugh - dt);

    // Reactions on the toys: one spin and a gentle shove.
    kicks.forEach((k, toy) => {
      k.t += dt;
      const p = clamp(k.t / 1.1, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      toy.userData.mesh.rotation.y += Math.PI * 2 * e;
      toy.position.x += k.dir * 0.32 * G.toyScale * Math.sin(p * Math.PI) * (1 - p * 0.3);
      if (p >= 1) kicks.delete(toy);
    });
  }

  function placeBubble(dt) {
    if (!bubble) return;
    if (S.bubbleT > 0) {
      S.bubbleT -= dt;
      if (S.bubbleT <= 0 && !pose) bubble.classList.remove('on');
    }
    if (pose === 'reach') bubble.classList.add('on');
    if (S.bubbleT <= 0 && pose !== 'reach') return;
    // Above the child's head, in stage pixels (plane units -> pixels).
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const headY = parts.root.position.y + HEIGHT * G.s;
    const px = (S.x / G.halfW / 2 + 0.5) * w;
    const py = (0.5 - headY / G.halfH / 2) * h;
    bubble.style.left = `${clamp(px + S.face * 22, 44, w - 44)}px`;
    bubble.style.top = `${Math.max(34, py)}px`;
  }

  function update(dt, t, scrollP) {
    S.scroll = scrollP;
    if (!tour.length) return;
    if (pose) applyPose(); else advance(dt);
    animate(dt);
    placeBubble(dt);
  }

  function dispose() {
    bubble?.remove();
    scene.remove(group);
    const resources = new Set();
    group.traverse((object) => {
      if (object.isMesh) {
        resources.add(object.geometry);
        resources.add(object.material);
      }
    });
    resources.forEach((resource) => resource.dispose());
  }

  return { layout, update, dispose };
}
