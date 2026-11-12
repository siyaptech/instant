/* =====================================================================
   All user-facing text. Edit wording here — not in index.html.

   - In HTML, put  data-label="path.to.key"  on an element and its text
     is filled in automatically by applyLabels().
   - In JS, use  t('path.to.key')  or  t('path.to.key', { name: value }).
   - {placeholders} are replaced with values (see DEFAULT_VARS below).
   - [KEY] renders as a keyboard key, e.g. "[ENTER]" -> <kbd>ENTER</kbd>.
   ===================================================================== */
import { MATCH, WEAPON, PICKUP } from './config.js';

/* Reusable key bindings (used by the menu and the in-game hint) */
const KEY = {
  move:    '[↑][↓]',
  turn:    '[←][→]',
  shoot:   '[SPACE]',
  reload:  '[R]',
  pause:   '[P]',
  confirm: '[ENTER]',
};
const GAP = '  '; // non-breaking spacing for the HUD hint

export const LABELS = {
  pageTitle: 'Arena Duel Game - Beta Version V1',
  title: 'ARENA DUEL',
  tagline: 'One arena. One bot. First to {winScore} eliminations wins.',

  hud: {
    you: 'YOU',
    bot: 'BOT',
    goal: 'FIRST\nTO {winScore}',
    health: 'HEALTH',
    ammo: 'AMMO',
    ammoMax: ' / {magSize}',
    reloading: 'RELOADING',
    keysHint: `${KEY.move} move ${GAP}${KEY.turn} turn ${GAP}${KEY.shoot} shoot ${GAP}${KEY.pause} pause`,
  },

  controls: {
    moveKeys: KEY.move,         move: 'Move forward / back',
    turnKeys: KEY.turn,         turn: 'Turn left / right',
    shootKeys: KEY.shoot,       shoot: 'Shoot (hold for auto-fire)',
    miscKeys: `${KEY.reload} ${KEY.pause}`, misc: 'Reload · Pause',
  },

  difficulty: {
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
  },

  menu: {
    start: 'START MATCH',
    note: `Press ${KEY.confirm} to start · Health packs spawn behind the side walls · Keyboard required`,
  },

  pause: {
    title: 'PAUSED',
    hint: `Press ${KEY.pause} to resume`,
    resume: 'RESUME',
  },

  over: {
    win: 'VICTORY',
    lose: 'DEFEAT',
    winSub: 'You out-gunned the {difficulty} bot.',
    loseSub: 'The {difficulty} bot took this one. Run it back?',
    score: 'SCORE',
    accuracy: 'ACCURACY',
    damage: 'DAMAGE',
    again: 'PLAY AGAIN',
    note: `Press ${KEY.confirm} to play again`,
  },

  msg: {
    fight: 'FIGHT!',
    go: 'GO!',
    eliminated: 'ELIMINATED',
    botEliminated: 'BOT ELIMINATED',
    heal: '+{heal} HEALTH',
  },
};

/* Values available to every label's {placeholders} */
const DEFAULT_VARS = {
  winScore: MATCH.winScore,
  magSize: WEAPON.magSize,
  heal: PICKUP.heal,
};

/** Look up a label by dotted path and fill in {placeholders}. */
export function t(path, vars = {}) {
  const raw = path.split('.').reduce((obj, key) => obj?.[key], LABELS);
  if (typeof raw !== 'string') {
    console.warn(`Missing label: "${path}"`);
    return path;
  }
  const all = { ...DEFAULT_VARS, ...vars };
  return raw.replace(/\{(\w+)\}/g, (match, key) => (key in all ? all[key] : match));
}

/** Write text into an element, turning [KEY] tokens into <kbd> elements. */
export function renderLabel(el, text) {
  el.replaceChildren();
  for (const part of text.split(/(\[[^\]]+\])/)) {
    if (!part) continue;
    const key = part.match(/^\[(.+)\]$/);
    if (key) {
      const kbd = document.createElement('kbd');
      kbd.textContent = key[1];
      el.append(kbd);
    } else {
      el.append(part);
    }
  }
}

/** Fill every [data-label] element under root and set the page title. */
export function applyLabels(root = document) {
  document.title = t('pageTitle');
  root.querySelectorAll('[data-label]').forEach(el => renderLabel(el, t(el.dataset.label)));
}
