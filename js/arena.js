/* =====================================================================
   Arena geometry: floor, walls, cover blocks, starfield
   ===================================================================== */
import * as THREE from 'three';
import { scene, gridTexture } from './scene.js';
import { ARENA, COLORS } from './config.js';

const HALF = ARENA.half;

export const colliders = [];      // {minX,maxX,minZ,maxZ,h}
export const obstacleMeshes = []; // for raycasts

/* ---------- Floor ---------- */
const floorTex = gridTexture('#141b2e', '#2b6f8f', COLORS.cyan);
floorTex.repeat.set(HALF / 2, HALF / 2);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(HALF * 2, HALF * 2),
  new THREE.MeshStandardMaterial({ map: floorTex, roughness: .85, metalness: .15 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// outer ground
const outer = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x070b16, roughness: 1 }));
outer.rotation.x = -Math.PI / 2; outer.position.y = -0.02;
scene.add(outer);

/* ---------- Blocks ---------- */
function addBlock(x, z, w, d, h, color, trim) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: .35 });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, h / 2, z);
  m.castShadow = m.receiveShadow = true;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: trim, transparent: true, opacity: .75 }));
  m.add(edges);
  scene.add(m);
  obstacleMeshes.push(m);
  colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, h });
}

// Block body colours
const BLOCK = { wall: 0x1a2238, steel: 0x2a3350, plum: 0x3a2a48, slate: 0x24384a };

// perimeter walls
const WH = ARENA.wallHeight;
addBlock(0, -HALF - .5, HALF * 2 + 2, 1, WH, BLOCK.wall, COLORS.cyan);
addBlock(0,  HALF + .5, HALF * 2 + 2, 1, WH, BLOCK.wall, COLORS.cyan);
addBlock(-HALF - .5, 0, 1, HALF * 2, WH, BLOCK.wall, COLORS.cyan);
addBlock( HALF + .5, 0, 1, HALF * 2, WH, BLOCK.wall, COLORS.cyan);

// cover: [x, z, width, depth, height, body, trim]
[
  [0, 0, 4, 4, 5, BLOCK.plum, COLORS.purple],
  [-12, -12, 3, 3, 2.4, BLOCK.steel, COLORS.cyan], [12, 12, 3, 3, 2.4, BLOCK.steel, COLORS.cyan],
  [-12, 12, 3, 3, 2.4, BLOCK.steel, COLORS.cyan],  [12, -12, 3, 3, 2.4, BLOCK.steel, COLORS.cyan],
  [0, -17, 10, 1.5, 3, BLOCK.slate, COLORS.green], [0, 17, 10, 1.5, 3, BLOCK.slate, COLORS.green],
  [-17, 0, 1.5, 10, 3, BLOCK.slate, COLORS.green], [17, 0, 1.5, 10, 3, BLOCK.slate, COLORS.green],
  [-22, -22, 2, 6, 3, BLOCK.plum, COLORS.pink],    [22, 22, 2, 6, 3, BLOCK.plum, COLORS.pink],
  [-22, 22, 6, 2, 3, BLOCK.plum, COLORS.pink],     [22, -22, 6, 2, 3, BLOCK.plum, COLORS.pink],
  [-7, 7, 2, 2, 1.3, BLOCK.steel, COLORS.warn],    [7, -7, 2, 2, 1.3, BLOCK.steel, COLORS.warn],
].forEach(b => addBlock(...b));

/* ---------- Starfield ---------- */
{
  const pts = [];
  for (let i = 0; i < 900; i++) {
    const t = Math.random() * Math.PI * 2, p = Math.random() * Math.PI * .45;
    pts.push(Math.cos(t) * Math.sin(p) * 180, Math.cos(p) * 180, Math.sin(t) * Math.sin(p) * 180);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xaecbff, size: 0.7, fog: false })));
}
