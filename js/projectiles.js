/* =====================================================================
   Bot energy bolts
   ===================================================================== */
import * as THREE from 'three';
import { scene, glowMaterial } from './scene.js';
import { BOLT, PLAYER } from './config.js';
import { player, enemy } from './state.js';
import { pointInSolid } from './collision.js';
import { spawnSparks, SPARK } from './fx.js';
import { damagePlayer } from './combat.js';
import { sfx } from './audio.js';
import { clamp } from './utils.js';

const bolts = [];
const boltMat = glowMaterial(0xff5a3a);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffe0c0 });
const coreGeo = new THREE.SphereGeometry(.07, 8, 8);

export function spawnBolt(origin, dir) {
  const g = new THREE.Group();
  const s = new THREE.Sprite(boltMat); s.scale.set(.7, .7, .7);
  g.add(s, new THREE.Mesh(coreGeo, coreMat));
  g.position.copy(origin);
  scene.add(g);
  bolts.push({ g, vel: dir.clone().multiplyScalar(BOLT.speed), life: BOLT.life });
}

export function updateBolts(dt) {
  const steps = 4, sdt = dt / steps; // sub-steps so fast bolts don't tunnel through things
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i]; b.life -= dt;
    let dead = b.life <= 0;
    for (let s = 0; s < steps && !dead; s++) {
      b.g.position.addScaledVector(b.vel, sdt);
      const p = b.g.position;
      if (player.alive && Math.hypot(p.x - player.pos.x, p.z - player.pos.z) < PLAYER.hitRadius && p.y < PLAYER.hitHeight) {
        damagePlayer(BOLT.damage, enemy.pos);
        dead = true;
      } else if (pointInSolid(p)) {
        spawnSparks(p, SPARK.boltImpact, 7, 3);
        const d = p.distanceTo(player.pos);
        if (d < 25) sfx('impact', clamp(1 - d / 25, .1, 1));
        dead = true;
      }
    }
    if (dead) { scene.remove(b.g); bolts.splice(i, 1); }
  }
}

export function clearBolts() {
  for (const b of bolts) scene.remove(b.g);
  bolts.length = 0;
}
