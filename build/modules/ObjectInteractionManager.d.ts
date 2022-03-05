import * as THREE from 'three';
interface ObjectInteractionManager {
    intersectedObjects: Array<THREE.Object3D>;
    selectableObjects: Array<THREE.Object3D>;
    intersectedObjectEmissiveVal: number;
    selectedObjectHandlers: {
        [key: string]: Function;
    };
    intersectedObjectHandlers: {
        [key: string]: Function;
    };
}
declare class ObjectInteractionManager {
    constructor();
    handleSelectedObject(object: THREE.Object3D): void;
    cleanIntersected(): void;
    static handleButtonMaterialMaps(object: THREE.Mesh, intersected?: boolean): void;
    handleIntersectedObject(object: THREE.Mesh): void;
}
export default ObjectInteractionManager;
