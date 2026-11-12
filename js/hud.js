/* =====================================================================
   HUD: scores, bars, messages, hit marker, damage indicator, minimap
   ===================================================================== */
import { ARENA, COLORS, PLAYER, WEAPON, BOT } from './config.js';
import { game, player, enemy } from './state.js';
import { colliders } from './arena.js';
import { packs } from './pickups.js';
import { $, clamp } from './utils.js';

let msgTimer = 0, hitmTimer = 0, dmgTimer = 0, flashAmt = 0;

/** Big centred message, e.g. "FIGHT!" */
export function showMsg(text, color = COLORS.ink, dur = 1.6) {
  const m = $('msg');
  m.textContent = text; m.style.color = color; m.style.opacity = 1;
  msgTimer = dur;
}

export function hitMarker(kill) {
  const h = $('hitm');
  h.classList.toggle('kill', !!kill); h.style.opacity = 1;
  hitmTimer = kill ? .35 : .12;
}

/** Red screen flash + arrow pointing toward the attacker (angle relative to view) */
export function showDamage(relAngle) {
  flashAmt = .7;
  $('dmgInd').style.transform = `rotate(${-relAngle}rad)`;
  dmgTimer = 1;
}

const pct = (hp, max) => Math.max(0, hp) / max * 100 + '%';

export function updateHud(dt) {
  $('sP').textContent = game.score.p;
  $('sE').textContent = game.score.e;
  $('hpFill').style.width = pct(player.hp, PLAYER.maxHp);
  $('hpNum').textContent = Math.max(0, Math.ceil(player.hp));
  $('ehpFill').style.width = pct(enemy.hp, BOT.maxHp);
  $('ammo').textContent = player.ammo;
  $('ammo').style.color = player.ammo <= WEAPON.lowAmmoWarn ? COLORS.warn : '';
  $('reload').style.opacity = player.reloading > 0 ? 1 : 0;
  $('lowhp').style.opacity = player.alive && player.hp <= PLAYER.lowHpWarn ? .6 + Math.sin(game.elapsed * 6) * .3 : 0;

  if (msgTimer > 0) { msgTimer -= dt; if (msgTimer <= 0) $('msg').style.opacity = 0; }
  if (hitmTimer > 0) { hitmTimer -= dt; if (hitmTimer <= 0) $('hitm').style.opacity = 0; }
  if (dmgTimer > 0) { dmgTimer -= dt; $('dmgInd').style.opacity = clamp(dmgTimer / .6, 0, 1); }
  flashAmt = Math.max(0, flashAmt - dt * 2.5);
  $('flash').style.opacity = player.alive ? flashAmt : .85;
  drawMinimap();
}

/* ---------- Minimap ---------- */
const mini = $('mini'), mctx = mini.getContext('2d');
const HALF = ARENA.half;

function drawMinimap() {
  const S = mini.width, s = (S - 10) / (HALF * 2), c = S / 2;
  const mx = x => c + x * s, mz = z => c + z * s;
  mctx.clearRect(0, 0, S, S);
  mctx.fillStyle = 'rgba(0,229,255,.05)'; mctx.fillRect(5, 5, S - 10, S - 10);
  mctx.fillStyle = 'rgba(140,170,210,.55)';
  for (const o of colliders) {
    if (o.maxX - o.minX > HALF || o.maxZ - o.minZ > HALF) continue; // skip perimeter walls
    mctx.fillRect(mx(o.minX), mz(o.minZ), (o.maxX - o.minX) * s, (o.maxZ - o.minZ) * s);
  }
  mctx.strokeStyle = 'rgba(0,229,255,.5)'; mctx.strokeRect(5, 5, S - 10, S - 10);
  for (const p of packs) if (p.active) {
    mctx.fillStyle = COLORS.green;
    mctx.fillRect(mx(p.x) - 3, mz(p.z) - 1, 6, 2); mctx.fillRect(mx(p.x) - 1, mz(p.z) - 3, 2, 6);
  }
  if (enemy.alive && enemy.radar > 0) {
    mctx.globalAlpha = Math.min(1, enemy.radar);
    mctx.fillStyle = COLORS.red;
    mctx.beginPath(); mctx.arc(mx(enemy.pos.x), mz(enemy.pos.z), 4.5, 0, Math.PI * 2); mctx.fill();
    mctx.globalAlpha = 1;
  }
  if (player.alive) {
    const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw), a = Math.atan2(fz, fx);
    const x = mx(player.pos.x), y = mz(player.pos.z);
    mctx.save(); mctx.translate(x, y); mctx.rotate(a);
    mctx.fillStyle = 'rgba(0,229,255,.18)';
    mctx.beginPath(); mctx.moveTo(0, 0); mctx.arc(0, 0, 26, -.5, .5); mctx.fill();
    mctx.fillStyle = COLORS.cyan;
    mctx.beginPath(); mctx.moveTo(7, 0); mctx.lineTo(-5, 4.5); mctx.lineTo(-2, 0); mctx.lineTo(-5, -4.5); mctx.closePath(); mctx.fill();
    mctx.restore();
  }
}
