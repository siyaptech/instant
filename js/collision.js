/* =====================================================================
   Collision & line-of-sight helpers
   ===================================================================== */
import * as THREE from 'three';
import { colliders, obstacleMeshes } from './arena.js';
import { ARENA } from './config.js';
import { clamp } from './utils.js';

const HALF = ARENA.half;

/** Push a circle of radius r at p out of any block and keep it inside the arena. */
export function resolveCircle(p, r) {
  for (const o of colliders) {
    const cx = clamp(p.x, o.minX, o.maxX), cz = clamp(p.z, o.minZ, o.maxZ);
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        p.x = cx + dx / d * r; p.z = cz + dz / d * r;
      } else {
        const l = p.x - o.minX, rr = o.maxX - p.x, t = p.z - o.minZ, b = o.maxZ - p.z, m = Math.min(l, rr, t, b);
        if (m === l) p.x = o.minX - r; else if (m === rr) p.x = o.maxX + r;
        else if (m === t) p.z = o.minZ - r; else p.z = o.maxZ + r;
      }
    }
  }
  const lim = HALF - r;
  p.x = clamp(p.x, -lim, lim); p.z = clamp(p.z, -lim, lim);
}

/** True if a circle of radius r at (x, z) would overlap something. */
export function blocked(x, z, r) {
  if (Math.abs(x) > HALF - r || Math.abs(z) > HALF - r) return true;
  for (const o of colliders)
    if (x > o.minX - r && x < o.maxX + r && z > o.minZ - r && z < o.maxZ + r) return true;
  return false;
}

/** True if a 3D point is inside a block, below the floor or outside the arena. */
export function pointInSolid(p) {
  if (p.y <= 0 || Math.abs(p.x) > HALF || Math.abs(p.z) > HALF) return true;
  for (const o of colliders)
    if (p.x > o.minX && p.x < o.maxX && p.z > o.minZ && p.z < o.maxZ && p.y < o.h) return true;
  return false;
}

export const ray = new THREE.Raycaster();
const _dir = new THREE.Vector3();

/** True if nothing blocks the straight line from a to b. */
export function hasLOS(a, b) {
  _dir.subVectors(b, a);
  const dist = _dir.length(); _dir.divideScalar(dist);
  ray.set(a, _dir); ray.near = 0; ray.far = dist;
  return ray.intersectObjects(obstacleMeshes, false).length === 0;
}
