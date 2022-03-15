import * as THREE from 'three';
import { Controller } from './controls/VRControls';
interface Interaction {
    intersectedObjects: Array<THREE.Object3D>;
    selectableObjects: Array<THREE.Object3D>;
    intersectedObjectEmissiveVal: number;
    selectStartHandlers: {
        [key: string]: Function;
    };
    selectEndHandlers: {
        [key: string]: Function;
    };
    intersectionHandlers: {
        [key: string]: Function;
    };
}
declare class Interaction {
    constructor();
    handleSelectStart(object: THREE.Object3D, controller?: Controller): void;
    handleSelectEnd(object: THREE.Object3D, controller?: Controller): void;
    cleanIntersected(): void;
    static handleButtonMaterialMaps(object: THREE.Mesh, intersected?: boolean): void;
    handleIntersection(object: THREE.Mesh): void;
}
export default Interaction;
