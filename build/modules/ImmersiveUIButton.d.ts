import Interaction from './Interaction.js';
interface ImmersiveUIButtonOptions {
    displayText: string;
    type: string;
    meshName: string;
    selectable: boolean;
    showActive: boolean;
    interaction: Interaction;
}
interface ImmersiveUIButton {
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
declare class ImmersiveUIButton {
    constructor({ displayText, type, meshName, selectable, showActive, interaction, }: ImmersiveUIButtonOptions);
    create(): Promise<void>;
}
export default ImmersiveUIButton;
