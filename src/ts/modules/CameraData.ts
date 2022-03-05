import * as THREE from 'three';

interface CameraData {
  camera: THREE.Camera,
  worldPosition: THREE.Vector3,
  worldRotation: THREE.Quaternion,
  worldScale: THREE.Vector3,
}

class CameraData {
  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.worldPosition = new THREE.Vector3();
    this.worldRotation = new THREE.Quaternion();
    this.worldScale = new THREE.Vector3();
    this.update();
  }
  update() {
    // This works on the camera used for rendering the scene
    this.camera.matrixWorld.decompose(this.worldPosition, this.worldRotation, this.worldScale);
  }
}

export default CameraData;
