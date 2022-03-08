/*! Copyright 2022, Anthony DePasquale, anthony@depasquale.org */
import * as THREE from 'three';
import type ThreeImmersiveControls from '../../ImmersiveControls.js';
interface MouseControls {
    controls: ThreeImmersiveControls;
    mousePosition: THREE.Vector2;
}
declare class MouseControls {
    constructor(controls: ThreeImmersiveControls);
    update(): void;
}
export default MouseControls;
