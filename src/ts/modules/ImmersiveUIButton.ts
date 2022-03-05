import { createOverlay } from './overlays.js';
import ObjectInteractionManager from './ObjectInteractionManager.js';

interface ImmersiveUIButtonOptions {
  displayText: string,
  type: string,
  meshName: string,
  selectable: boolean,
  showActive: boolean,
  objectInteractionManager: ObjectInteractionManager,
}

interface ImmersiveUIButton {
  displayText: string,
  type: string,
  meshName: string,
  selectable: boolean,
  showActive: boolean,
  created: Promise<void>,
  objectInteractionManager: ObjectInteractionManager,
  width: number,
  height: number,
  mesh: THREE.Mesh,
}

class ImmersiveUIButton {
  constructor({
    displayText, type, meshName, selectable = true, showActive = false, objectInteractionManager,
  }: ImmersiveUIButtonOptions) {
    this.displayText = displayText;
    this.type = type;
    this.meshName = meshName;
    this.selectable = selectable;
    this.showActive = showActive;
    this.created = this.create();
    this.objectInteractionManager = objectInteractionManager;
  }
  async create(): Promise<void> {
    const button = await createOverlay({ text: this.displayText, selectable: this.selectable, showActive: this.showActive });
    button.name = this.meshName;
    button.userData.type = this.type;
    if (this.selectable === true) {
      this.objectInteractionManager.selectableObjects.push(button);
    }
    button.geometry.computeBoundingBox();
    if (button.geometry.boundingBox) {
      this.width = button.geometry.boundingBox.max.x - button.geometry.boundingBox.min.x;
      this.height = button.geometry.boundingBox.max.y - button.geometry.boundingBox.min.y;
    } else {
      console.error(`No bounding box available for ${this.meshName}`);
    }
    this.mesh = button;
  }
}

export default ImmersiveUIButton;
