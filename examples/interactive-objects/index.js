/*!
Interactive objects example adapted from https://threejs.org/examples/webxr_vr_dragging.html
*/

import * as THREE from 'three';
console.debug(`World using Three.js revision ${THREE.REVISION}`);
import Wizard from '@depasquale/three-wizard';

const wizard = new Wizard({
  controls: 'ImmersiveControls',
  showFps: true,
});
const { scene, renderer, camera, controls } = wizard;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

scene.background = new THREE.Color(0x00002e);

// Floor
const floorGeometry = new THREE.PlaneGeometry(4, 4);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xeeeeee,
  roughness: 1.0,
  metalness: 0.0,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Lights
const hemispherelLight = new THREE.HemisphereLight(0x808080, 0x606060, 1);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 6, 0);
directionalLight.castShadow = true;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.mapSize.set(4096, 4096);
scene.add(hemispherelLight, directionalLight);

// Objects

const objects = new THREE.Group();
scene.add(objects);

const geometries = [
  new THREE.BoxGeometry(0.2, 0.2, 0.2),
  new THREE.ConeGeometry(0.2, 0.2, 64),
  new THREE.CylinderGeometry(0.2, 0.2, 0.2, 64),
  new THREE.IcosahedronGeometry(0.2, 8),
  new THREE.TorusGeometry(0.2, 0.04, 64, 32),
];

let objectAttachedToMouse;
let distanceToIntersection;
let offset; // Difference between object position and intersection with mouse position

const handleSelectStart = (object, controller) => {
  object.material.emissive.setScalar(0.1);
  if (controls.vrControls?.inVr) {
    // VR controller
    if (controller) {
      controller.attach(object);
      controller.userData.selected = object;
    }
  } else {
    // Mouse
    objectAttachedToMouse = object;
  }
};

const handleSelectEnd = (object, controller) => {
  object.material.emissive.setScalar(0);
  objects.attach(object);
  if (controls.vrControls?.inVr) {
    // VR controller
    if (controller) {
      controller.userData.selected = undefined;
    }
  } else {
    // Mouse
    objectAttachedToMouse = undefined;
    distanceToIntersection = undefined;
    offset = undefined;
  }
};

for (let i = 0; i < 50; i++) {
  const geometry = geometries[Math.floor(Math.random() * geometries.length)];
  const material = new THREE.MeshStandardMaterial({
    color: Math.random() * 0xffffff,
    roughness: 0.7,
    metalness: 0.0,
  });
  const object = new THREE.Mesh(geometry, material);
  object.position.x = Math.random() * 4 - 2;
  object.position.y = Math.random() * 2;
  object.position.z = Math.random() * 4 - 2;
  object.rotation.x = Math.random() * 2 * Math.PI;
  object.rotation.y = Math.random() * 2 * Math.PI;
  object.rotation.z = Math.random() * 2 * Math.PI;
  object.scale.setScalar(Math.random() + 0.5);
  object.castShadow = true;
  object.receiveShadow = true;
  objects.add(object);
  // Configure handlers for selectable objects
  const type = 'selectableShape';
  object.userData.type = type;
  controls.interaction.selectStartHandlers[type] = handleSelectStart;
  controls.interaction.selectEndHandlers[type] = handleSelectEnd;
  controls.interaction.selectableObjects.push(object);
}

const render = () => {
  if (objectAttachedToMouse) {
    if (!offset) {
      offset = new THREE.Vector3().subVectors(objectAttachedToMouse.position, controls.mouseControls.intersections[0].point);
    }
    if (!distanceToIntersection) {
      distanceToIntersection = new THREE.Vector3().subVectors(controls.cameraData.worldPosition, controls.mouseControls.intersections[0].point).length();
    }
    const vector = new THREE.Vector3();
    vector.set(controls.mouseControls.mousePosition.x, controls.mouseControls.mousePosition.y, 1);
    vector.unproject(camera);
    vector.sub(controls.cameraData.worldPosition).normalize();
    objectAttachedToMouse.position.copy(controls.cameraData.worldPosition).add(vector.multiplyScalar(distanceToIntersection)).add(offset);
  }
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
