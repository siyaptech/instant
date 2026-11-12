/* =====================================================================
   Bot AI: movement, aiming, shooting, animation
   ===================================================================== */
import * as THREE from 'three';
import { BOT, BOLT, PLAYER } from './config.js';
import { game, player, enemy, currentDifficulty } from './state.js';
import { bot } from './botModel.js';
import { packs } from './pickups.js';
import { blocked, hasLOS, resolveCircle } from './collision.js';
import { spawnBolt } from './projectiles.js';
import { spawnEnemy } from './spawn.js';
import { sfx } from './audio.js';
import { clamp, rand, wrapAngle } from './utils.js';

const UP = new THREE.Vector3(0, 1, 0);
const _eye = new THREE.Vector3();

/* ---------- Navigation ---------- */
function clearPath(x, z, a, r) {
  const sx = Math.sin(a), sz = Math.cos(a);
  for (const d of [.8, 1.6, 2.6]) if (blocked(x + sx * d, z + sz * d, r)) return false;
  return true;
}

/** Find the closest open heading to angle a. */
function steer(a) {
  const { x, z } = enemy.pos;
  if (clearPath(x, z, a, .55)) return a;
  for (const o of [.35, .7, 1.05, 1.4, 1.75, 2.1, 2.6]) {
    const a1 = a + o * enemy.side, a2 = a - o * enemy.side;
    if (clearPath(x, z, a1, .55)) return a1;
    if (clearPath(x, z, a2, .55)) return a2;
  }
  return a + Math.PI;
}

function nearestPack() {
  let best = null, bd = Infinity;
  for (const p of packs) if (p.active) {
    const d = Math.hypot(p.x - enemy.pos.x, p.z - enemy.pos.z);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/* ---------- Shooting ---------- */
function enemyFire() {
  const D = currentDifficulty();
  const origin = bot.muzzle.getWorldPosition(new THREE.Vector3());
  const target = player.pos.clone(); target.y = BOT.aimHeight;
  const dist = origin.distanceTo(target);
  target.addScaledVector(player.realVel, (dist / BOLT.speed) * D.lead);
  const dir = target.sub(origin).normalize();
  dir.applyAxisAngle(UP, rand(-D.spread, D.spread));
  dir.y += rand(-D.spread, D.spread) * .5;
  dir.normalize();
  spawnBolt(origin, dir);
  bot.flash.visible = true; bot.flashLight.intensity = 40;
  setTimeout(() => (bot.flash.visible = false), 50);
  sfx('bolt', clamp(1.4 - dist / 40, .25, 1));
  enemy.radar = 1.2;
}

/* ---------- Per-frame update ---------- */
export function updateEnemy(dt) {
  const D = currentDifficulty();
  bot.flashLight.intensity = Math.max(0, bot.flashLight.intensity - dt * 500);
  enemy.flash = Math.max(0, enemy.flash - dt * 8);
  for (const m of bot.mats) m.emissiveIntensity = enemy.flash * .8;
  enemy.radar = Math.max(0, enemy.radar - dt);

  // death animation
  if (!enemy.alive) {
    enemy.deathT += dt;
    const k = Math.min(1, enemy.deathT * 2.5);
    bot.group.rotation.x = -k * Math.PI / 2;
    bot.group.position.y = -k * .2;
    if (enemy.deathT > 1.6) bot.group.visible = false;
    enemy.respawn -= dt;
    if (enemy.respawn <= 0 && game.phase === 'playing') spawnEnemy();
    return;
  }

  // perception
  const eye = _eye.set(enemy.pos.x, BOT.eyeHeight, enemy.pos.z);
  const pEye = new THREE.Vector3(player.pos.x, PLAYER.eyeHeight, player.pos.z);
  const los = player.alive && hasLOS(eye, pEye);
  const toP = new THREE.Vector3(player.pos.x - enemy.pos.x, 0, player.pos.z - enemy.pos.z);
  const dist = toP.length();
  const toPdir = toP.clone().divideScalar(dist || 1);

  if (los) { enemy.seeTime += dt; enemy.lastSeen = player.pos.clone(); enemy.radar = Math.max(enemy.radar, .4); }
  else enemy.seeTime = Math.max(0, enemy.seeTime - dt * 2);

  enemy.strafeT -= dt;
  if (enemy.strafeT <= 0) {
    enemy.strafeT = rand(.7, 2.2);
    if (Math.random() < .6) enemy.strafeDir *= -1;
  }

  // choose movement goal
  let desired = null, speed = D.speed;
  const pack = enemy.hp < BOT.seekHealthBelow ? nearestPack() : null;
  if (pack) {
    desired = new THREE.Vector3(pack.x - enemy.pos.x, 0, pack.z - enemy.pos.z);
    speed *= 1.1;
  } else if (los) {
    const ideal = BOT.idealRange;
    const radial = dist > ideal + 3 ? 1 : dist < ideal - 4 ? -.8 : 0;
    const perp = new THREE.Vector3(-toPdir.z, 0, toPdir.x).multiplyScalar(enemy.strafeDir);
    desired = toPdir.clone().multiplyScalar(radial).add(perp);
    speed *= .85;
  } else if (enemy.lastSeen) {
    desired = new THREE.Vector3(enemy.lastSeen.x - enemy.pos.x, 0, enemy.lastSeen.z - enemy.pos.z);
    if (desired.length() < 1.5) enemy.lastSeen = null;
  } else if (player.alive) {
    desired = toP.clone(); // hunt
  }

  let tvx = 0, tvz = 0;
  if (desired && desired.lengthSq() > .01) {
    const a = steer(Math.atan2(desired.x, desired.z));
    tvx = Math.sin(a) * speed; tvz = Math.cos(a) * speed;
  }
  const k = Math.min(1, dt * 8);
  enemy.vel.x += (tvx - enemy.vel.x) * k;
  enemy.vel.z += (tvz - enemy.vel.z) * k;
  enemy.pos.addScaledVector(enemy.vel, dt);
  resolveCircle(enemy.pos, BOT.radius);

  // stuck detection
  enemy.stuckT += dt;
  if (enemy.stuckT > .6) {
    if (desired && enemy.pos.distanceTo(enemy.stuckPos) < .5) { enemy.side *= -1; enemy.strafeDir *= -1; }
    enemy.stuckPos.copy(enemy.pos); enemy.stuckT = 0;
  }

  // facing
  const spd = Math.hypot(enemy.vel.x, enemy.vel.z);
  let targetYaw = enemy.yaw;
  if (los) targetYaw = Math.atan2(toP.x, toP.z);
  else if (spd > .5) targetYaw = Math.atan2(enemy.vel.x, enemy.vel.z);
  const diff = wrapAngle(targetYaw - enemy.yaw);
  const maxTurn = BOT.turnRate * dt;
  enemy.yaw += clamp(diff, -maxTurn, maxTurn);

  // walk animation
  enemy.walk += dt * spd * 1.7;
  const swing = Math.sin(enemy.walk) * .55 * Math.min(1, spd / 4);
  bot.legs[0].rotation.x = swing; bot.legs[1].rotation.x = -swing;
  bot.group.position.set(enemy.pos.x, Math.abs(Math.sin(enemy.walk)) * .05, enemy.pos.z);
  bot.group.rotation.set(0, enemy.yaw, 0);

  // shooting (bursts)
  enemy.fireCd -= dt;
  if (los && enemy.seeTime > D.reaction && Math.abs(diff) < .25 && enemy.fireCd <= 0 && dist < BOT.maxFireRange) {
    enemyFire();
    enemy.burstLeft--;
    if (enemy.burstLeft > 0) enemy.fireCd = BOT.burstInterval;
    else { enemy.fireCd = D.gap * rand(.8, 1.25); enemy.burstLeft = D.burst; }
  }
}
