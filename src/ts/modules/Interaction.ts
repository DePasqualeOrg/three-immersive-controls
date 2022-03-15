import * as THREE from 'three';
import { Controller } from './controls/VRControls';

interface Interaction {
  intersectedObjects: Array<THREE.Object3D>,
  selectableObjects: Array<THREE.Object3D>,
  intersectedObjectEmissiveVal: number,
  selectStartHandlers: { [key: string]: Function },
  selectEndHandlers: { [key: string]: Function },
  intersectionHandlers: { [key: string]: Function },
}

class Interaction {
  constructor() {
    // Object interaction
    this.intersectedObjects = [];
    this.selectableObjects = [];
    this.intersectedObjectEmissiveVal = 0.3;
    this.intersectionHandlers = {
      // objectType: handlerFunction,
    };
    this.selectStartHandlers = {
      // objectType: handlerFunction,
    };
    this.selectEndHandlers = {
      // objectType: handlerFunction,
    };
  }

  handleSelectStart(object: THREE.Object3D, controller?: Controller) {
    console.debug(`Select start occurred on ${object.name || object.userData.type}`);
    if (object.userData.type in this.selectStartHandlers) {
      this.selectStartHandlers[object.userData.type](object, controller);
    } else {
      console.error(`Select start occurred on object of type ${object.userData.type}, but no handler was set for this type.`);
    }
  }

  handleSelectEnd(object: THREE.Object3D, controller?: Controller) {
    console.debug(`Select end occurred on ${object.name || object.userData.type}`);
    if (object.userData.type in this.selectEndHandlers) {
      this.selectEndHandlers[object.userData.type](object, controller);
    } else {
      console.error(`Select end occurred on object of type ${object.userData.type}, but no handler was set for this type.`);
    }
  }

  cleanIntersected() {
    while (this.intersectedObjects.length) {
      const object = this.intersectedObjects.pop();
      if (object instanceof THREE.Mesh) {
        object.material.emissive?.setScalar(0);
        Interaction.handleButtonMaterialMaps(object, false);
      }
    }
  }

  static handleButtonMaterialMaps(object: THREE.Mesh, intersected = false) {
    if (object.userData.textures && object.material instanceof THREE.MeshBasicMaterial) {
      if (object.userData.active === true) {
        object.material.map = intersected ? object.userData.textures.activeIntersected : object.userData.textures.activeStandard;
      } else {
        object.material.map = intersected ? object.userData.textures.intersected : object.userData.textures.standard;
      }
    }
  }

  handleIntersection(object: THREE.Mesh) {
    this.intersectedObjects.push(object);
    Interaction.handleButtonMaterialMaps(object, true);
    if (object.material instanceof THREE.MeshStandardMaterial) {
      object.material.emissive?.setScalar(this.intersectedObjectEmissiveVal); // Highlight intersected object
    }
    // Optional additional logic that can be set for each object type for custom behavior
    if (object.userData.type in this.intersectionHandlers) {
      this.intersectionHandlers[object.userData.type](object);
    }
  }
}

export default Interaction;
