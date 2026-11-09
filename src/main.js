import * as THREE from 'three';
import './style.css';
import { createBattleSystem } from './battle.js';

const wrap = document.querySelector('#canvas-wrap');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9ec8c1');
scene.fog = new THREE.Fog('#9ec8c1', 20, 48);

const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
camera.position.set(9, 12, 13);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
wrap.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#e9fff2', '#536d47', 2.15));
const sun = new THREE.DirectionalLight('#fff1c7', 3.1);
sun.position.set(-8, 15, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -18;
sun.shadow.camera.right = 18;
sun.shadow.camera.top = 18;
sun.shadow.camera.bottom = -18;
scene.add(sun);

const materials = {
  grass: new THREE.MeshStandardMaterial({ color: '#80a96a', roughness: 1 }),
  grassAlt: new THREE.MeshStandardMaterial({ color: '#88b271', roughness: 1 }),
  path: new THREE.MeshStandardMaterial({ color: '#d5b981', roughness: 1 }),
  pathAlt: new THREE.MeshStandardMaterial({ color: '#c9aa72', roughness: 1 }),
  water: new THREE.MeshStandardMaterial({ color: '#68aeb0', roughness: 0.35, metalness: 0.05 }),
  trunk: new THREE.MeshStandardMaterial({ color: '#76543b', roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: '#3e7958', roughness: 1 }),
  leafLight: new THREE.MeshStandardMaterial({ color: '#60966a', roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: '#9a9d83', roughness: 1 }),
};

const tileGroup = new THREE.Group();
scene.add(tileGroup);
const map = [
  'GGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGG',
  'GGGGGGGGGGGGGGG',
  'GGGGGGPPPGGGGGG',
  'GGGGGGPPPGGGGGG',
  'GGGGGGPPPGGGGGG',
  'GGGGGGPPPPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
  'GGGGGGGGGPPPGGG',
];
const tileSize = 1;
const mapOffset = { x: -7, z: -7 };

for (let z = 0; z < map.length; z += 1) {
  for (let x = 0; x < map[z].length; x += 1) {
    const isPath = map[z][x] === 'P';
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(tileSize, 0.18, tileSize),
      isPath ? ((x + z) % 4 === 0 ? materials.pathAlt : materials.path) : ((x + z) % 3 === 0 ? materials.grassAlt : materials.grass),
    );
    tile.position.set(mapOffset.x + x, -0.09, mapOffset.z + z);
    tile.receiveShadow = true;
    tileGroup.add(tile);
  }
}

function addTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.8, 6), materials.trunk);
  trunk.position.y = 0.4;
  trunk.castShadow = true;
  tree.add(trunk);
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58, 0), materials.leaf);
  crown.position.y = 1.12;
  crown.scale.set(1.05, 1.05, 0.92);
  crown.castShadow = true;
  tree.add(crown);
  const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), materials.leafLight);
  crown2.position.set(0.28, 1.42, 0.04);
  crown2.castShadow = true;
  tree.add(crown2);
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  scene.add(tree);
}

[
  [-6.2, -5.7, 1.05], [-4.7, -6.2, 0.82], [-2.4, -5.9, 1.1], [0.4, -6.1, 0.95], [2.2, -5.9, 1.15],
  [-6.3, -2.5, 0.92], [-5.2, 0.3, 1.15], [-5.9, 3.7, 1], [-3.8, 5.6, 1.1], [-1.8, 5.8, 0.95],
  [1.2, 5.9, 1.1], [3.5, 5.9, 0.85], [5.8, 5.1, 1.05], [5.8, 2.8, 0.9], [5.8, -0.6, 1.1],
  [4.5, -3.7, 0.95], [2.8, -4.5, 0.9], [-1.3, -2.2, 0.76], [3.9, 1.3, 0.78],
].forEach(([x, z, scale]) => addTree(x, z, scale));

function addFlower(x, z, color) {
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 5), materials.leaf);
  stem.position.set(x, 0.12, z);
  scene.add(stem);
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.095, 7, 5), new THREE.MeshStandardMaterial({ color, roughness: 0.65 }));
  bloom.position.set(x, 0.26, z);
  bloom.scale.y = 0.7;
  scene.add(bloom);
}
addFlower(-3.3, -4.4, '#f5d274');
addFlower(-2.8, -4.8, '#f2eee0');
addFlower(-4.1, -1.9, '#e9959a');
addFlower(4.5, 4.4, '#f2eee0');

// A small wooden route sign gives the map a recognizable landmark.
const sign = new THREE.Group();
const post = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.95, 0.13), materials.trunk);
post.position.y = 0.48;
const board = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.38, 0.12), new THREE.MeshStandardMaterial({ color: '#e8d3a1', roughness: 0.9 }));
board.position.set(0.28, 0.79, 0);
sign.add(post, board);
sign.position.set(1.4, 0, 3.2);
scene.add(sign);

function makePixelSprite(path, width, height) {
  const texture = new THREE.TextureLoader().load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.08, depthWrite: false }));
  sprite.scale.set(width, height, 1);
  return sprite;
}

const player = new THREE.Group();
const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.34, 16), new THREE.MeshBasicMaterial({ color: '#28362b', transparent: true, opacity: 0.22 }));
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = 0.015;
player.add(shadow);
const heroSprite = makePixelSprite(`${import.meta.env.BASE_URL}sprites/hero.png`, 0.7, 1.86);
heroSprite.position.y = 0.94;
player.add(heroSprite);
player.position.set(0, 0, 5.8);
scene.add(player);

function addCharacter(name, file, x, z, width, height) {
  const actor = new THREE.Group();
  const actorShadow = new THREE.Mesh(new THREE.CircleGeometry(width * 0.42, 14), new THREE.MeshBasicMaterial({ color: '#28362b', transparent: true, opacity: 0.2 }));
  actorShadow.rotation.x = -Math.PI / 2;
  actorShadow.position.y = 0.02;
  actor.add(actorShadow);
  const sprite = makePixelSprite(file, width, height);
  sprite.position.y = height / 2;
  actor.add(sprite);
  actor.position.set(x, 0, z);
  scene.add(actor);
  actor.userData.name = name;
  return actor;
}
const guide = addCharacter('Mira', `${import.meta.env.BASE_URL}sprites/guide.png`, 0.15, -1.2, 0.7, 1.82);
const mossbit = addCharacter('Mossbit', `${import.meta.env.BASE_URL}sprites/mossbit.png`, -2.65, -0.5, 1.3, 1.23);

const worldBounds = { minX: -6.45, maxX: 6.45, minZ: -6.45, maxZ: 6.45 };
const blocked = [
  [-6.2,-5.7],[-4.7,-6.2],[-2.4,-5.9],[0.4,-6.1],[2.2,-5.9],[-6.3,-2.5],[-5.2,0.3],[-5.9,3.7],
  [-3.8,5.6],[-1.8,5.8],[1.2,5.9],[3.5,5.9],[5.8,5.1],[5.8,2.8],[5.8,-0.6],[4.5,-3.7],[2.8,-4.5],[-1.3,-2.2],[3.9,1.3],
];
const keys = new Set();
let moving = false;
let facing = 'north';
let toastTimer;

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 1900);
}

const battle = createBattleSystem({ showToast });

function walkable(x, z) {
  if (x < worldBounds.minX || x > worldBounds.maxX || z < worldBounds.minZ || z > worldBounds.maxZ) return false;
  return !blocked.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 0.52);
}

function movePlayer(dt) {
  if (battle.isActive()) { moving = false; return; }
  const xAxis = (keys.has('ArrowRight') || keys.has('d') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('a') ? 1 : 0);
  const zAxis = (keys.has('ArrowDown') || keys.has('s') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('w') ? 1 : 0);
  moving = xAxis !== 0 || zAxis !== 0;
  if (!moving) return;
  const speed = 3.4 * dt;
  const nextX = player.position.x + xAxis * speed;
  const nextZ = player.position.z + zAxis * speed;
  if (xAxis !== 0 && walkable(nextX, player.position.z)) player.position.x = nextX;
  if (zAxis !== 0 && walkable(player.position.x, nextZ)) player.position.z = nextZ;
  if (Math.abs(xAxis) > Math.abs(zAxis)) facing = xAxis > 0 ? 'east' : 'west';
  else if (zAxis !== 0) facing = zAxis > 0 ? 'south' : 'north';
  const direction = { north: 0, east: Math.PI / 2, south: Math.PI, west: -Math.PI / 2 }[facing];
  player.rotation.y = direction;
}

function interact() {
  if (battle.isActive()) return;
  const nearGuide = Math.hypot(guide.position.x - player.position.x, guide.position.z - player.position.z) < 1.35;
  const nearCreature = Math.hypot(mossbit.position.x - player.position.x, mossbit.position.z - player.position.z) < 1.35;
  if (nearGuide) showToast('Mira: A trilha guarda criaturas gentis. Vamos explorar?');
  else if (nearCreature) battle.start();
  else showToast('Não há ninguém por perto para conversar.');
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && battle.isActive()) { document.querySelector('.battle-close')?.click(); return; }
  if (event.key === 'e' || event.key === 'E' || event.key === 'Enter') interact();
});

window.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
  keys.add(key);
});
window.addEventListener('keyup', (event) => keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener('blur', () => keys.clear());

document.querySelector('#bag-button').addEventListener('click', () => showToast('Sua mochila está quase vazia.'));
document.querySelector('#sound-toggle').addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('muted');
  showToast(event.currentTarget.classList.contains('muted') ? 'Som desativado' : 'Som ativado');
});

document.querySelectorAll('[data-move]').forEach((button) => {
  const key = button.dataset.move;
  const down = (event) => { event.preventDefault(); keys.add(key); button.classList.add('pressed'); };
  const up = (event) => { event.preventDefault(); keys.delete(key); button.classList.remove('pressed'); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointercancel', up);
  button.addEventListener('pointerleave', up);
});
document.querySelector('#interact-button').addEventListener('pointerdown', (event) => { event.preventDefault(); interact(); });

const clock = new THREE.Clock();
function resize() {
  const width = wrap.clientWidth;
  const height = wrap.clientHeight;
  const aspect = width / height;
  const viewHeight = 14;
  camera.left = (-viewHeight * aspect) / 2;
  camera.right = (viewHeight * aspect) / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
window.addEventListener('resize', resize);
resize();

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  movePlayer(dt);
  const target = new THREE.Vector3(player.position.x, 0, player.position.z);
  const cameraOffset = new THREE.Vector3(9, 12, 13);
  camera.position.lerp(target.clone().add(cameraOffset), 1 - Math.exp(-dt * 2.4));
  camera.lookAt(target);
  heroSprite.position.y = 0.94 + (moving ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.05 : Math.sin(clock.elapsedTime * 2) * 0.012);
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
