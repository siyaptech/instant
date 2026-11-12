/* =====================================================================
   Health packs
   ===================================================================== */
import * as THREE from 'three';
import { scene, glowMaterial } from './scene.js';
import { COLORS, PICKUP, PLAYER, BOT } from './config.js';
import { game, player, enemy } from './state.js';
import { sfx } from './audio.js';
import { showMsg } from './hud.js';
import { t } from './labels.js';

export const packs = PICKUP.positions.map(([x, z]) => {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.green, emissive: 0x1fd86c, emissiveIntensity: 1.6 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.6, .18, .18), mat));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.18, .6, .18), mat));
  const halo = new THREE.Sprite(glowMaterial(COLORS.green, { opacity: .5 }));
  halo.scale.set(1.6, 1.6, 1.6); g.add(halo);
  g.position.set(x, 1, z);
  scene.add(g);
  return { g, x, z, active: true, timer: 0 };
});

export function resetPacks() {
  packs.forEach(p => { p.active = true; p.g.visible = true; });
}

/** Spin & bob (runs in menus too) */
export function animatePacks(dt) {
  for (const p of packs) {
    p.g.rotation.y += dt * 1.8;
    p.g.position.y = 1 + Math.sin(game.elapsed * 3 + p.x) * .12;
  }
}

function take(p) { p.active = false; p.g.visible = false; p.timer = PICKUP.respawn; }

const near = (pos, p) => Math.hypot(pos.x - p.x, pos.z - p.z) < PICKUP.radius;

/** Respawn timers and pick-up checks for both fighters */
export function updatePacks(dt) {
  for (const p of packs) {
    if (!p.active) {
      p.timer -= dt;
      if (p.timer <= 0) { p.active = true; p.g.visible = true; }
      continue;
    }
    if (player.alive && player.hp < PLAYER.maxHp && near(player.pos, p)) {
      player.hp = Math.min(PLAYER.maxHp, player.hp + PICKUP.heal);
      take(p); sfx('pickup'); showMsg(t('msg.heal'), COLORS.green, .9);
    } else if (enemy.alive && enemy.hp < BOT.maxHp && near(enemy.pos, p)) {
      enemy.hp = Math.min(BOT.maxHp, enemy.hp + PICKUP.heal);
      take(p);
    }
  }
}
