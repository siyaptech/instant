/* =====================================================================
   Bot 3D model
   ===================================================================== */
import * as THREE from 'three';
import { scene, glowMaterial } from './scene.js';

/** Every mesh of the bot — used as raycast targets for the player's shots */
export const enemyParts = [];

function buildBot() {
  const g = new THREE.Group();
  const armor = new THREE.MeshStandardMaterial({ color: 0xb01e34, metalness: .55, roughness: .4, emissive: 0xffffff, emissiveIntensity: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x22252d, metalness: .6, roughness: .5, emissive: 0xffffff, emissiveIntensity: 0 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xff3344, emissive: 0xff2233, emissiveIntensity: 3 });
  const add = (geo, mat, x, y, z, parent = g) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    m.castShadow = true; m.userData.enemy = true; parent.add(m); enemyParts.push(m); return m;
  };
  const legs = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * .18, .9, 0); g.add(hip);
    add(new THREE.BoxGeometry(.22, .9, .26), dark, 0, -.45, 0, hip);
    legs.push(hip);
  }
  add(new THREE.BoxGeometry(.72, .78, .42), armor, 0, 1.3, 0);   // torso
  add(new THREE.BoxGeometry(.44, .4, .42), armor, 0, 1.92, 0);   // head
  add(new THREE.BoxGeometry(.38, .09, .05), glow, 0, 1.94, .22); // visor
  add(new THREE.BoxGeometry(.18, .18, .04), glow, 0, 1.38, .22); // chest light
  add(new THREE.BoxGeometry(.17, .17, .62), dark, .44, 1.38, .22); // gun arm
  add(new THREE.BoxGeometry(.12, .14, .55), dark, .44, 1.36, .62); // gun barrel
  add(new THREE.BoxGeometry(.17, .58, .17), dark, -.46, 1.2, 0);   // other arm
  const m = new THREE.Object3D(); m.position.set(.44, 1.38, .95); g.add(m);
  const fl = new THREE.Sprite(glowMaterial(0xff6040));
  fl.scale.set(.6, .6, .6); fl.visible = false; m.add(fl);
  const fLight = new THREE.PointLight(0xff4030, 0, 10, 2); m.add(fLight);
  const eyeLight = new THREE.PointLight(0xff2a3a, 6, 5, 2); eyeLight.position.set(0, 1.9, .5); g.add(eyeLight);
  scene.add(g);
  return { group: g, legs, muzzle: m, flash: fl, flashLight: fLight, mats: [armor, dark] };
}

export const bot = buildBot();
