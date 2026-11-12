/* =====================================================================
   Spawning / respawning fighters
   ===================================================================== */
import { SPAWN, PLAYER, WEAPON, BOT } from './config.js';
import { player, enemy, currentDifficulty } from './state.js';
import { camera } from './scene.js';
import { gun } from './weapon.js';
import { bot } from './botModel.js';

/** Spawn point farthest from the given position */
function farthestSpawn(from) {
  let best = SPAWN.points[0], bd = -1;
  for (const s of SPAWN.points) {
    const d = (s[0] - from.x) ** 2 + (s[1] - from.z) ** 2;
    if (d > bd) { bd = d; best = s; }
  }
  return best;
}

export function spawnPlayer(initial) {
  const s = initial ? SPAWN.playerStart : farthestSpawn(enemy.pos);
  player.pos.set(s[0], 0, s[1]);
  player.yaw = Math.atan2(s[0], s[1]);
  player.vel.set(0, 0, 0);
  player.hp = PLAYER.maxHp; player.alive = true;
  player.ammo = WEAPON.magSize; player.reloading = 0; player.fireCd = 0;
  camera.rotation.z = 0;
  gun.visible = true;
}

export function spawnEnemy(initial) {
  const s = initial ? SPAWN.botStart : farthestSpawn(player.pos);
  enemy.pos.set(s[0], 0, s[1]);
  enemy.yaw = Math.atan2(-s[0], -s[1]);
  enemy.vel.set(0, 0, 0);
  enemy.hp = BOT.maxHp; enemy.alive = true; enemy.seeTime = 0; enemy.lastSeen = null;
  enemy.fireCd = 1; enemy.burstLeft = currentDifficulty().burst;
  bot.group.rotation.set(0, enemy.yaw, 0);
  bot.group.position.copy(enemy.pos);
  bot.group.visible = true;
}
