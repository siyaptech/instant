/* =====================================================================
   Shared, mutable game state. Modules import these objects and change
   their properties (never reassign the objects themselves).
   ===================================================================== */
import * as THREE from 'three';
import { DEFAULT_DIFFICULTY, DIFFICULTY, PLAYER, WEAPON, BOT } from './config.js';

export const game = {
  phase: 'menu',               // 'menu' | 'playing' | 'paused' | 'ending' | 'over'
  difficulty: DEFAULT_DIFFICULTY,
  score: { p: 0, e: 0 },
  stats: { shots: 0, hits: 0, dmg: 0 },
  elapsed: 0,
};

/** Currently held keys, by KeyboardEvent.code */
export const keys = {};

export const player = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(), realVel: new THREE.Vector3(),
  yaw: 0, hp: PLAYER.maxHp, alive: true, respawn: 0,
  ammo: WEAPON.magSize, reloading: 0, fireCd: 0,
  recoil: 0, bob: 0, deathT: 0,
};

export const enemy = {
  pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: Math.PI, hp: BOT.maxHp, alive: true, respawn: 0,
  fireCd: 1, burstLeft: DIFFICULTY[DEFAULT_DIFFICULTY].burst, seeTime: 0, lastSeen: null,
  strafeDir: 1, strafeT: 0, side: 1,
  stuckT: 0, stuckPos: new THREE.Vector3(), walk: 0, flash: 0, radar: 0, deathT: 0,
};

export const currentDifficulty = () => DIFFICULTY[game.difficulty];
