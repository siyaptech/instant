/* =====================================================================
   Entry point: wires everything together and runs the main loop.

   File map
     config.js      all tunable numbers + colours
     labels.js      all on-screen text (+ t() / applyLabels helpers)
     state.js       shared game / player / enemy state
     scene.js       renderer, camera, lights, textures
     arena.js       floor, walls, cover
     collision.js   collision & line-of-sight
     weapon.js      player gun model      botModel.js  bot model
     player.js      player logic          enemy.js     bot AI
     combat.js      damage & kills        projectiles.js  bot bolts
     pickups.js     health packs          fx.js        tracers & sparks
     hud.js         HUD & minimap         audio.js     sound effects
     spawn.js       (re)spawning          match.js     start / end / pause
     input.js       keyboard & buttons
   ===================================================================== */
import { renderer, scene, camera, clock } from './scene.js';
import { game } from './state.js';
import { applyLabels } from './labels.js';
import { gun } from './weapon.js';
import { bot } from './botModel.js';
import { updatePlayer } from './player.js';
import { updateEnemy } from './enemy.js';
import { updateBolts } from './projectiles.js';
import { updatePacks, animatePacks } from './pickups.js';
import { updateFx } from './fx.js';
import { updateHud } from './hud.js';
import { spawnEnemy } from './spawn.js';
import { buildDifficultyPickers } from './match.js';
import { bindInput } from './input.js';
import './arena.js';

applyLabels();
buildDifficultyPickers();
bindInput();
spawnEnemy(true);

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05);
  const { phase } = game;
  if (phase !== 'paused') game.elapsed += dt;

  if (phase === 'playing' || phase === 'ending') {
    updatePlayer(dt);
    updateEnemy(dt);
    updateBolts(dt);
    updatePacks(dt);
    updateHud(dt);
  } else if (phase === 'menu' || phase === 'over') {
    // attract-mode camera orbit
    const a = game.elapsed * .12;
    camera.position.set(Math.sin(a) * 38, 16, Math.cos(a) * 38);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    gun.visible = false;
    bot.group.rotation.y += dt * .5;
  }
  if (phase !== 'paused') {
    updateFx(dt);
    animatePacks(dt);
  }
  renderer.render(scene, camera);
}
loop();
