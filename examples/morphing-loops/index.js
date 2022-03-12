import * as THREE from 'three';
import Wizard from '@depasquale/three-wizard';
import { MorphingLoops, MorphingStrips } from './morphing-loops-bundle.js';

const wizard = new Wizard({
  controls: 'ImmersiveControls',
  showFps: true,
  initialPosition: new THREE.Vector3(0, 1.6, 3),
});

const { scene } = wizard;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
directionalLight.position.set(0, 2, -2);
scene.add(ambientLight, directionalLight);

// Floor
const floorGeometry = new THREE.PlaneBufferGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333,
  metalness: 0.2,
  roughness: 0.4,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Morphing loops
const morphingLoops = new MorphingLoops();
morphingLoops.mesh.position.x = -0.9;
morphingLoops.mesh.position.y = 1.4;
scene.add(morphingLoops.mesh);

// Morphing strips
const mosphingStrips = new MorphingStrips({ interpolatedLoops: morphingLoops.interpolatedLoops });
mosphingStrips.group.position.x = 0.9;
mosphingStrips.group.position.y = 1.4;
scene.add(mosphingStrips.group);

const render = () => {
  morphingLoops.update();
  mosphingStrips.update();
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
