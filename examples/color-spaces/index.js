import * as THREE from 'three';
import Wizard from '@depasquale/three-wizard';
import ColorSpaces from './color-spaces-bundle.js';

const colorSpaceWidth = 10;
const floorY = -(colorSpaceWidth / 2) - 2;

const wizard = new Wizard({
  controls: 'ImmersiveControls',
  initialPosition: new THREE.Vector3(0, 0, 18),
  moveSpeed: { vr: 3, keyboard: 6 },
  floor: floorY,
  gravity: false,
  showFps: true,
});

const { scene } = wizard;

// Lights
const ambientLight = new THREE.AmbientLight(0xcccccc, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, colorSpaceWidth, 0).normalize();
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 2, 0).normalize();
pointLight.intensity = 0.3;
pointLight.decay = 0.5;
scene.add(ambientLight, directionalLight, pointLight);

// Floor
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const canvasSize = 1000;
const strokeSize = canvasSize * 0.08;
canvas.width = canvasSize;
canvas.height = canvasSize;
ctx.fillStyle = '#000';
ctx.fillRect(0, 0, canvasSize, canvasSize);
ctx.fillStyle = '#111';
ctx.fillRect(strokeSize / 2, strokeSize / 2, canvasSize - (strokeSize / 2), canvasSize - (strokeSize / 2));
const img = canvas.toDataURL('image/png');
const loader = new THREE.TextureLoader();
loader.load(img, (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(45, 45);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.6,
    metalness: 0,
  });
  const floorSize = 100;
  const floorGeometry = new THREE.PlaneBufferGeometry(floorSize, floorSize);
  const floor = new THREE.Mesh(floorGeometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  scene.add(floor);
});

// Color spaces
const colorSpaces = new ColorSpaces({ width: colorSpaceWidth });
scene.add(colorSpaces.group);

const render = () => {
  ColorSpaces.update();
};

wizard.start(render);

// Show indicator while loading packages with import map
document.onreadystatechange = () => {
  if (document.readyState !== 'complete') {
    document.querySelector('#loadingIndicator').style.visibility = 'visible';
  } else {
    document.querySelector('#loadingIndicator').style.display = 'none';
  }
};
