import Interaction from './Interaction.js';
interface ImmersiveButtonOptions {
    displayText: string;
    type: string;
    meshName: string;
    selectable: boolean;
    showActive: boolean;
    interaction: Interaction;
}
interface ImmersiveButton {
    displayText: string;
    type: string;
    meshName: string;
    selectable: boolean;
    showActive: boolean;
    created: Promise<void>;
    interaction: Interaction;
    width: number;
    height: number;
    mesh: THREE.Mesh;
}
declare class ImmersiveButton {
    constructor({ displayText, type, meshName, selectable, showActive, interaction, }: ImmersiveButtonOptions);
    create(): Promise<void>;
}
export default ImmersiveButton;
