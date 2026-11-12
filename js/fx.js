/* =====================================================================
   Visual effects: shot tracers and sparks
   ===================================================================== */
import * as THREE from 'three';
import { scene } from './scene.js';
import { rand } from './utils.js';

/** Spark colours for different impacts */
export const SPARK = {
  enemyHit: 0xff4050,
  wall: 0xffd27a,
  boltImpact: 0xff6a40,
};

const TRACER_LIFE = .07;
const tracers = [];
const tracerGeo = new THREE.BoxGeometry(.025, .025, 1);

export function spawnTracer(a, b) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(tracerGeo, new THREE.MeshBasicMaterial({
    color: 0xfff0a0, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  m.position.copy(a).lerp(b, .5); m.scale.z = len; m.lookAt(b);
  scene.add(m);
  tracers.push({ m, life: TRACER_LIFE });
}

const sparks = [];
const sparkGeo = new THREE.BoxGeometry(.06, .06, .06);
const sparkMats = {};

export function spawnSparks(p, color, n = 10, power = 5) {
  const mat = sparkMats[color] || (sparkMats[color] = new THREE.MeshBasicMaterial({ color }));
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(sparkGeo, mat);
    m.position.copy(p);
    scene.add(m);
    sparks.push({ m, v: new THREE.Vector3(rand(-1, 1), rand(0, 1.4), rand(-1, 1)).multiplyScalar(power), life: rand(.25, .5) });
  }
}

export function updateFx(dt) {
  for (let i = tracers.length - 1; i >= 0; i--) {
    const t = tracers[i]; t.life -= dt; t.m.material.opacity = Math.max(0, t.life / TRACER_LIFE) * .9;
    if (t.life <= 0) { scene.remove(t.m); t.m.material.dispose(); tracers.splice(i, 1); }
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i]; s.life -= dt;
    s.v.y -= 14 * dt; s.m.position.addScaledVector(s.v, dt);
    s.m.scale.setScalar(Math.max(.01, s.life * 2.5));
    if (s.life <= 0 || s.m.position.y < 0) { scene.remove(s.m); sparks.splice(i, 1); }
  }
}
