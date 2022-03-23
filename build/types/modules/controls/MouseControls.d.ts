import * as THREE from 'three';
import type ThreeImmersiveControls from '../../ImmersiveControls.js';
interface MouseControls {
    controls: ThreeImmersiveControls;
    mousePosition: THREE.Vector2;
    intersections: THREE.Intersection<THREE.Object3D<Event>>[];
}
declare class MouseControls {
    constructor(controls: ThreeImmersiveControls);
    update(): void;
}
export default MouseControls;
