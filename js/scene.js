/* =====================================================================
   Renderer, scene, camera, lights and shared textures
   ===================================================================== */
import * as THREE from 'three';
import { COLORS } from './config.js';
import { $ } from './utils.js';

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
$('game').appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.bg);
scene.fog = new THREE.Fog(COLORS.bg, 35, 110);

export const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.05, 300);
camera.rotation.order = 'YXZ';
scene.add(camera);

export const clock = new THREE.Clock();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- Lights ---------- */
scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x1a1a2a, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(18, 40, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 100 });
sun.shadow.bias = -0.0005;
scene.add(sun);

[[-26, -26, COLORS.cyan], [26, 26, COLORS.cyan], [-26, 26, COLORS.purple], [26, -26, COLORS.pink]].forEach(([x, z, c]) => {
  const l = new THREE.PointLight(c, 160, 45, 2);
  l.position.set(x, 6, z);
  scene.add(l);
});

/* ---------- Textures ---------- */
export function gridTexture(base, line, glow) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 600; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  g.strokeStyle = line; g.lineWidth = 3; g.shadowColor = glow; g.shadowBlur = 8;
  g.strokeRect(1.5, 1.5, 253, 253);
  g.lineWidth = 1; g.globalAlpha = .35;
  g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(.25, 'rgba(255,255,255,.8)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Soft radial glow used by flashes, halos and bolts */
export const GLOW = glowTexture();

/** Additive glowing sprite material (reused by flashes, halos and bolts) */
export const glowMaterial = (color, extra = {}) => new THREE.SpriteMaterial({
  map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, ...extra,
});
