/* =====================================================================
   Synthesized sound effects (Web Audio, no files needed)
   ===================================================================== */
let actx = null, noiseBuf = null, master = null;

export function initAudio() {
  if (actx) { actx.resume(); return; }
  actx = new (window.AudioContext || window.webkitAudioContext)();
  master = actx.createGain(); master.gain.value = .5; master.connect(actx.destination);
  noiseBuf = actx.createBuffer(1, actx.sampleRate * .5, actx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function env(g, t, a, peak, dec) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
}

function tone(type, f0, f1, dur, vol, delay = 0) {
  const t = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  env(g, t, .005, vol, dur); o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
}

function noise(dur, vol, freq, q = 1) {
  const t = actx.currentTime;
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
  const g = actx.createGain(); env(g, t, .003, vol, dur);
  s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + .05);
}

/** Play a named sound effect. */
export function sfx(name, vol = 1) {
  if (!actx) return;
  switch (name) {
    case 'shot': noise(.12, .7 * vol, 1800, .7); tone('square', 180, 60, .09, .25 * vol); break;
    case 'bolt': tone('sawtooth', 1100, 180, .18, .18 * vol); noise(.08, .2 * vol, 3000, 2); break;
    case 'hit': tone('sine', 1500, 1200, .05, .25); break;
    case 'kill': tone('triangle', 520, 520, .12, .3); tone('triangle', 780, 780, .2, .3, .08); break;
    case 'hurt': tone('sawtooth', 220, 90, .18, .35); noise(.1, .3, 500); break;
    case 'die': tone('sawtooth', 300, 40, .8, .4); break;
    case 'reload': noise(.04, .4, 4000, 3); setTimeout(() => actx && noise(.05, .5, 2500, 3), 380); break;
    case 'empty': noise(.03, .3, 5000, 4); break;
    case 'pickup': [523, 659, 784, 1046].forEach((f, i) => tone('sine', f, f, .1, .25, i * .06)); break;
    case 'impact': noise(.05, .25 * vol, 2500, 2); break;
  }
}
