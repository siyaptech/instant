/* =====================================================================
   Player weapon view model (attached to the camera)
   ===================================================================== */
import * as THREE from 'three';
import { camera, glowMaterial } from './scene.js';
import { COLORS } from './config.js';

export const gun = new THREE.Group();
{
  const gm = new THREE.MeshStandardMaterial({ color: 0x2a303d, metalness: .7, roughness: .35 });
  const accent = new THREE.MeshStandardMaterial({ color: COLORS.cyan, emissive: COLORS.cyan, emissiveIntensity: 2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.12, .14, .55), gm);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.028, .032, .36, 12), gm);
  barrel.rotation.x = Math.PI / 2; barrel.position.set(0, .02, -.42);
  const grip = new THREE.Mesh(new THREE.BoxGeometry(.08, .2, .1), gm);
  grip.position.set(0, -.14, .12); grip.rotation.x = .3;
  const mag = new THREE.Mesh(new THREE.BoxGeometry(.07, .18, .09), gm);
  mag.position.set(0, -.13, -.1);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(.125, .02, .38), accent);
  strip.position.set(0, .06, -.05);
  const sight = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .08), accent);
  sight.position.set(0, .1, .05);
  gun.add(body, barrel, grip, mag, strip, sight);
}

export const muzzle = new THREE.Object3D();
muzzle.position.set(0, .02, -.62);
gun.add(muzzle);

export const muzzleFlash = new THREE.Sprite(glowMaterial(0xffd27a));
muzzleFlash.scale.set(.45, .45, .45);
muzzleFlash.visible = false;
muzzle.add(muzzleFlash);

export const muzzleLight = new THREE.PointLight(0xffc870, 0, 10, 2);
muzzle.add(muzzleLight);

export const GUN_BASE = new THREE.Vector3(.26, -.24, -.45);
gun.position.copy(GUN_BASE);
camera.add(gun);
