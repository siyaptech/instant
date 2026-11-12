/* =====================================================================
   Damage & eliminations
   ===================================================================== */
import { COLORS, MATCH } from './config.js';
import { game, player, enemy, currentDifficulty } from './state.js';
import { gun } from './weapon.js';
import { sfx } from './audio.js';
import { showMsg, hitMarker, showDamage } from './hud.js';
import { endMatch } from './match.js';
import { t } from './labels.js';
import { wrapAngle } from './utils.js';

export function damagePlayer(n, from) {
  if (!player.alive) return;
  player.hp -= n; sfx('hurt');
  const a = Math.atan2(from.x - player.pos.x, from.z - player.pos.z);
  showDamage(wrapAngle(a - (player.yaw + Math.PI)));
  if (player.hp <= 0) {
    player.hp = 0; player.alive = false; player.respawn = MATCH.respawnDelay; player.deathT = 0;
    gun.visible = false;
    game.score.e++; sfx('die');
    if (game.score.e >= MATCH.winScore) endMatch(false);
    else showMsg(t('msg.eliminated'), COLORS.red, 2.4);
  }
}

export function damageEnemy(n) {
  if (!enemy.alive) return;
  enemy.hp -= n; enemy.flash = 1; game.stats.hits++; game.stats.dmg += n;
  // getting shot reveals you to the bot
  enemy.lastSeen = player.pos.clone();
  enemy.seeTime = Math.max(enemy.seeTime, currentDifficulty().reaction * .6);
  if (Math.random() < .35) enemy.strafeDir *= -1;
  if (enemy.hp <= 0) {
    enemy.hp = 0; enemy.alive = false; enemy.respawn = MATCH.respawnDelay; enemy.deathT = 0;
    game.score.p++; sfx('kill'); hitMarker(true);
    if (game.score.p >= MATCH.winScore) endMatch(true);
    else showMsg(t('msg.botEliminated'), COLORS.cyan, 1.8);
  } else { sfx('hit'); hitMarker(false); }
}
