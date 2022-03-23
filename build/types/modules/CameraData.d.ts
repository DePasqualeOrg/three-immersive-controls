import * as THREE from 'three';
interface CameraData {
    camera: THREE.Camera;
    worldPosition: THREE.Vector3;
    worldRotation: THREE.Quaternion;
    worldScale: THREE.Vector3;
}
declare class CameraData {
    constructor(camera: THREE.Camera);
    update(): void;
}
export default CameraData;
