/* =====================================================================
   Player movement, camera and shooting
   ===================================================================== */
import * as THREE from 'three';
import { COLORS, PLAYER, WEAPON } from './config.js';
import { game, keys, player, enemy } from './state.js';
import { camera } from './scene.js';
import { obstacleMeshes } from './arena.js';
import { enemyParts } from './botModel.js';
import { gun, muzzle, muzzleFlash, muzzleLight, GUN_BASE } from './weapon.js';
import { resolveCircle, ray } from './collision.js';
import { spawnTracer, spawnSparks, SPARK } from './fx.js';
import { damageEnemy } from './combat.js';
import { spawnPlayer } from './spawn.js';
import { showMsg } from './hud.js';
import { sfx } from './audio.js';
import { t } from './labels.js';
import { rand } from './utils.js';

const UP = new THREE.Vector3(0, 1, 0);
const forward = () => new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));

export function startReload() {
  if (player.reloading > 0 || player.ammo === WEAPON.magSize) return;
  player.reloading = WEAPON.reloadTime;
  sfx('reload');
}

function playerShoot() {
  player.ammo--; player.fireCd = WEAPON.fireInterval; player.recoil = 1; game.stats.shots++;
  const spread = player.vel.length() > 1 ? WEAPON.spreadMoving : WEAPON.spreadStill;
  const dir = forward().applyAxisAngle(UP, rand(-spread, spread));
  dir.y = rand(-spread, spread) * .5; dir.normalize();

  ray.set(camera.position, dir); ray.near = 0; ray.far = WEAPON.range;
  const targets = enemy.alive ? obstacleMeshes.concat(enemyParts) : obstacleMeshes;
  const hit = ray.intersectObjects(targets, false)[0];
  const muzzlePos = muzzle.getWorldPosition(new THREE.Vector3());
  let end;
  if (hit) {
    end = hit.point;
    if (hit.object.userData.enemy) {
      damageEnemy(WEAPON.damage);
      spawnSparks(end, SPARK.enemyHit, 8, 4);
    } else {
      spawnSparks(end, SPARK.wall, 6, 4);
    }
  } else {
    end = camera.position.clone().addScaledVector(dir, 120);
  }
  spawnTracer(muzzlePos, end);
  muzzleFlash.visible = true; muzzleFlash.material.rotation = Math.random() * 6;
  muzzleLight.intensity = 30;
  sfx('shot');
  if (player.ammo === 0) startReload();
}

export function updatePlayer(dt) {
  const EYE = PLAYER.eyeHeight;

  // death cam
  if (!player.alive) {
    player.deathT += dt;
    const k = Math.min(1, player.deathT * 2);
    camera.position.set(player.pos.x, EYE - k * 1.15, player.pos.z);
    camera.rotation.set(-k * .25, player.yaw, k * .6);
    player.respawn -= dt;
    if (player.respawn <= 0 && game.phase === 'playing') { spawnPlayer(); showMsg(t('msg.go'), COLORS.cyan, .8); }
    return;
  }

  // movement
  const turn = (keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0);
  player.yaw += turn * PLAYER.turnSpeed * dt;
  const mv = (keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0);
  const f = forward(), sp = mv > 0 ? PLAYER.speed : PLAYER.backSpeed;
  const k = Math.min(1, dt * 12);
  player.vel.x += (f.x * mv * sp - player.vel.x) * k;
  player.vel.z += (f.z * mv * sp - player.vel.z) * k;
  const prevX = player.pos.x, prevZ = player.pos.z;
  player.pos.addScaledVector(player.vel, dt);
  resolveCircle(player.pos, PLAYER.radius);
  player.realVel.set((player.pos.x - prevX) / dt, 0, (player.pos.z - prevZ) / dt);

  // camera bob & gun sway
  const speed = player.realVel.length();
  player.bob += dt * speed * 1.4;
  const bobY = Math.sin(player.bob) * .045 * Math.min(1, speed / PLAYER.speed);
  camera.position.set(player.pos.x, EYE + bobY, player.pos.z);

  player.recoil = Math.max(0, player.recoil - dt * 9);
  camera.rotation.set(player.recoil * .018, player.yaw, 0);
  gun.position.set(GUN_BASE.x + Math.cos(player.bob * .5) * .012, GUN_BASE.y + bobY * .5, GUN_BASE.z + player.recoil * .07);
  gun.rotation.set(player.recoil * .12, turn * .04, turn * .03);

  // reloading & shooting
  player.fireCd -= dt;
  if (player.reloading > 0) {
    player.reloading -= dt;
    const progress = Math.min(1, (WEAPON.reloadTime - player.reloading) / WEAPON.reloadTime);
    gun.rotation.x = -Math.sin(progress * Math.PI) * .5;
    if (player.reloading <= 0) { player.reloading = 0; player.ammo = WEAPON.magSize; }
  }
  if (keys.Space && player.fireCd <= 0 && player.reloading <= 0) {
    if (player.ammo > 0) playerShoot();
    else { startReload(); player.fireCd = WEAPON.dryFireDelay; }
  }
  if (muzzleFlash.visible && player.fireCd < WEAPON.fireInterval - .045) muzzleFlash.visible = false;
  muzzleLight.intensity = Math.max(0, muzzleLight.intensity - dt * 400);
}
