/* =====================================================================
   Game configuration — every tunable number and colour lives here.
   Change a value once and it applies everywhere it's used.
   ===================================================================== */

/* ---------- Colours (read from css/variables.css, with fallbacks) ---------- */
const rootStyle = getComputedStyle(document.documentElement);
const cssVar = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;

export const COLORS = {
  cyan:   cssVar('--cyan',   '#00e5ff'),
  red:    cssVar('--red',    '#ff3048'),
  green:  cssVar('--green',  '#3dff8a'),
  warn:   cssVar('--warn',   '#ffcc55'),
  purple: cssVar('--purple', '#b04bff'),
  pink:   cssVar('--pink',   '#ff3a70'),
  ink:    cssVar('--ink',    '#e8f4ff'),
  bg:     cssVar('--bg',     '#0b1020'),
};

/* ---------- Arena ---------- */
export const ARENA = {
  half: 30,          // arena half size (arena is 2*half square)
  wallHeight: 4,
};

/* ---------- Match rules ---------- */
export const MATCH = {
  winScore: 5,       // eliminations needed to win
  respawnDelay: 2.6, // seconds before a dead fighter respawns
  endDelay: 1.4,     // seconds between final kill and the results screen
};

/* ---------- Player ---------- */
export const PLAYER = {
  maxHp: 100,
  lowHpWarn: 30,     // red vignette pulses at or below this
  speed: 9,
  backSpeed: 6.5,
  turnSpeed: 2.6,
  radius: 0.5,       // collision radius
  eyeHeight: 1.5,
  hitRadius: 0.55,   // how close a bolt must pass to hit
  hitHeight: 1.85,
};

/* ---------- Player weapon ---------- */
export const WEAPON = {
  magSize: 24,
  lowAmmoWarn: 5,    // ammo counter turns yellow at or below this
  damage: 14,
  fireInterval: 0.13,
  reloadTime: 1.3,
  dryFireDelay: 0.3,
  spreadStill: 0.01,
  spreadMoving: 0.022,
  range: 200,
};

/* ---------- Bot projectiles ---------- */
export const BOLT = {
  speed: 40,
  damage: 10,
  life: 3,           // seconds before a missed bolt disappears
};

/* ---------- Bot ---------- */
export const BOT = {
  maxHp: 100,
  radius: 0.5,
  eyeHeight: 1.7,
  aimHeight: 1.15,      // where on the player the bot aims
  seekHealthBelow: 45,  // bot goes for health packs under this hp
  idealRange: 12,       // distance the bot tries to keep while fighting
  maxFireRange: 45,
  burstInterval: 0.14,  // seconds between shots inside a burst
  turnRate: 7,          // radians / second
};

/* ---------- Difficulty presets ---------- */
export const DIFFICULTY = {
  easy:   { spread: .085, reaction: .9,  gap: 1.45, speed: 5.0, lead: .3, burst: 3 },
  normal: { spread: .05,  reaction: .55, gap: 1.0,  speed: 6.0, lead: .6, burst: 3 },
  hard:   { spread: .028, reaction: .3,  gap: .7,   speed: 7.0, lead: .9, burst: 4 },
};
export const DEFAULT_DIFFICULTY = 'normal';

/* ---------- Health packs ---------- */
export const PICKUP = {
  heal: 40,
  respawn: 15,       // seconds before a used pack reappears
  radius: 1.3,
  positions: [[24, 0], [-24, 0]],
};

/* ---------- Spawn points ([x, z]) ---------- */
export const SPAWN = {
  playerStart: [0, 25],
  botStart: [0, -25],
  points: [[0, 25], [0, -25], [25, 6], [-25, -6], [-14, 24], [14, -24]],
};
