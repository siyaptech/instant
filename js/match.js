/* =====================================================================
   Match flow: start, end, pause, difficulty selection
   ===================================================================== */
import { DIFFICULTY, COLORS, MATCH } from './config.js';
import { game, keys } from './state.js';
import { clock } from './scene.js';
import { initAudio } from './audio.js';
import { clearBolts } from './projectiles.js';
import { resetPacks } from './pickups.js';
import { spawnPlayer, spawnEnemy } from './spawn.js';
import { showMsg } from './hud.js';
import { t } from './labels.js';
import { $ } from './utils.js';

const OVERLAYS = ['menu', 'pause', 'over'];

export function startGame() {
  initAudio();
  Object.assign(game.score, { p: 0, e: 0 });
  Object.assign(game.stats, { shots: 0, hits: 0, dmg: 0 });
  clearBolts();
  resetPacks();
  spawnPlayer(true); spawnEnemy(true);
  for (const k in keys) keys[k] = false;
  OVERLAYS.forEach(id => $(id).classList.remove('on'));
  $('hud').classList.add('on');
  game.phase = 'playing';
  showMsg(t('msg.fight'), COLORS.cyan, 1.2);
}

export function endMatch(won) {
  game.phase = 'ending';
  setTimeout(() => {
    game.phase = 'over';
    const { score, stats, difficulty } = game;
    const title = $('overTitle');
    title.textContent = t(won ? 'over.win' : 'over.lose');
    title.className = won ? 'win' : 'lose';
    $('overSub').textContent = t(won ? 'over.winSub' : 'over.loseSub', { difficulty });
    $('stScore').textContent = `${score.p} - ${score.e}`;
    $('stAcc').textContent = (stats.shots ? Math.round(stats.hits / stats.shots * 100) : 0) + '%';
    $('stDmg').textContent = stats.dmg;
    syncDifficultyButtons();
    $('hud').classList.remove('on');
    $('over').classList.add('on');
  }, MATCH.endDelay * 1000);
}

export function togglePause() {
  if (game.phase === 'playing') {
    game.phase = 'paused'; $('pause').classList.add('on');
  } else if (game.phase === 'paused') {
    game.phase = 'playing'; $('pause').classList.remove('on');
    clock.getDelta(); // discard the time spent paused
  }
}

/* ---------- Difficulty picker ---------- */
function syncDifficultyButtons() {
  document.querySelectorAll('[data-difficulty-picker] button')
    .forEach(b => b.classList.toggle('sel', b.dataset.d === game.difficulty));
}

export function setDifficulty(d) {
  game.difficulty = d;
  syncDifficultyButtons();
}

/** Build a button per DIFFICULTY preset inside every [data-difficulty-picker]. */
export function buildDifficultyPickers() {
  document.querySelectorAll('[data-difficulty-picker]').forEach(box => {
    box.replaceChildren(...Object.keys(DIFFICULTY).map(d => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.d = d;
      b.textContent = t(`difficulty.${d}`);
      b.addEventListener('click', () => { setDifficulty(d); b.blur(); });
      return b;
    }));
  });
  syncDifficultyButtons();
}
