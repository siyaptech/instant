/* =====================================================================
   Keyboard & button input
   ===================================================================== */
import { game, keys, player } from './state.js';
import { startGame, togglePause } from './match.js';
import { startReload } from './player.js';
import { $ } from './utils.js';

/** Keys whose default browser action (scrolling) should be blocked */
const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

const releaseAll = () => { for (const k in keys) keys[k] = false; };

export function bindInput() {
  // buttons
  $('startBtn').addEventListener('click', e => { e.target.blur(); startGame(); });
  $('againBtn').addEventListener('click', e => { e.target.blur(); startGame(); });
  $('resumeBtn').addEventListener('click', e => { e.target.blur(); togglePause(); });

  // keyboard
  addEventListener('keydown', e => {
    if (GAME_KEYS.includes(e.code)) e.preventDefault();
    keys[e.code] = true;
    const { phase } = game;
    if (e.code === 'Enter' && (phase === 'menu' || phase === 'over')) startGame();
    if ((e.code === 'KeyP' || e.code === 'Escape') && (phase === 'playing' || phase === 'paused')) togglePause();
    if (e.code === 'KeyR' && phase === 'playing' && player.alive) startReload();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });

  // auto-pause when the window loses focus
  addEventListener('blur', () => {
    releaseAll();
    if (game.phase === 'playing') togglePause();
  });
}
