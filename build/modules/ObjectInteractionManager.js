import * as THREE from 'three';
class ObjectInteractionManager {
    constructor() {
        // Object interaction
        this.intersectedObjects = [];
        this.selectableObjects = [];
        this.intersectedObjectEmissiveVal = 0.3;
        this.selectedObjectHandlers = {
        // objectType: handlerFunction,
        };
        this.intersectedObjectHandlers = {
        // objectType: handlerFunction,
        };
    }
    handleSelectedObject(object) {
        console.debug(`Selected ${object.name}`);
        if (object.userData.type in this.selectedObjectHandlers) {
            this.selectedObjectHandlers[object.userData.type](object);
        }
        else {
            console.error(`Object of type ${object.userData.type} was selected, but no handler was set for this type.`);
        }
    }
    cleanIntersected() {
        while (this.intersectedObjects.length) {
            const object = this.intersectedObjects.pop();
            if (object instanceof THREE.Mesh) {
                object.material.emissive?.setScalar(0);
                ObjectInteractionManager.handleButtonMaterialMaps(object, false);
            }
        }
    }
    static handleButtonMaterialMaps(object, intersected = false) {
        if (object.userData.textures && object.material instanceof THREE.MeshBasicMaterial) {
            if (object.userData.active === true) {
                object.material.map = intersected ? object.userData.textures.activeIntersected : object.userData.textures.activeStandard;
            }
            else {
                object.material.map = intersected ? object.userData.textures.intersected : object.userData.textures.standard;
            }
        }
    }
    handleIntersectedObject(object) {
        this.intersectedObjects.push(object);
        ObjectInteractionManager.handleButtonMaterialMaps(object, true);
        if (object.material instanceof THREE.MeshStandardMaterial) {
            object.material.emissive?.setScalar(this.intersectedObjectEmissiveVal); // Highlight intersected object
        }
        // Optional additional logic that can be set for each object type for custom behavior
        if (object.userData.type in this.intersectedObjectHandlers) {
            this.intersectedObjectHandlers[object.userData.type](object);
        }
    }
}
export default ObjectInteractionManager;
