import { createOverlay } from './overlays.js';
class ImmersiveButton {
    constructor({ displayText, type, meshName, selectable = true, showActive = false, interaction, }) {
        this.displayText = displayText;
        this.type = type;
        this.meshName = meshName;
        this.selectable = selectable;
        this.showActive = showActive;
        this.created = this.create();
        this.interaction = interaction;
    }
    async create() {
        const button = await createOverlay({ text: this.displayText, selectable: this.selectable, showActive: this.showActive });
        button.name = this.meshName;
        button.userData.type = this.type;
        if (this.selectable === true) {
            this.interaction.selectableObjects.push(button);
        }
        button.geometry.computeBoundingBox();
        if (button.geometry.boundingBox) {
            this.width = button.geometry.boundingBox.max.x - button.geometry.boundingBox.min.x;
            this.height = button.geometry.boundingBox.max.y - button.geometry.boundingBox.min.y;
        }
        else {
            console.error(`No bounding box available for ${this.meshName}`);
        }
        this.mesh = button;
    }
}
export default ImmersiveButton;
