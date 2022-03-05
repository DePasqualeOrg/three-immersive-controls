import ObjectInteractionManager from './ObjectInteractionManager.js';
interface ImmersiveUIButtonOptions {
    displayText: string;
    type: string;
    meshName: string;
    selectable: boolean;
    showActive: boolean;
    objectInteractionManager: ObjectInteractionManager;
}
interface ImmersiveUIButton {
    displayText: string;
    type: string;
    meshName: string;
    selectable: boolean;
    showActive: boolean;
    created: Promise<void>;
    objectInteractionManager: ObjectInteractionManager;
    width: number;
    height: number;
    mesh: THREE.Mesh;
}
declare class ImmersiveUIButton {
    constructor({ displayText, type, meshName, selectable, showActive, objectInteractionManager, }: ImmersiveUIButtonOptions);
    create(): Promise<void>;
}
export default ImmersiveUIButton;
