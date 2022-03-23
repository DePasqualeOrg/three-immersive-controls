/*!
Three.js Immersive Controls
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
import * as THREE from 'three';
import StatsMesh from '@depasquale/three-stats-mesh';
import VRControls from './modules/controls/VRControls.js';
import KeyboardControls from './modules/controls/KeyboardControls.js';
import MouseControls from './modules/controls/MouseControls.js';
import Interaction from './modules/Interaction.js';
import CameraData from './modules/CameraData.js';
interface ThreeImmersiveControlsOptions {
    initialPosition?: THREE.Vector3;
    lookAt?: THREE.Vector3;
    floor?: number | false;
    gravity?: boolean;
    moveSpeed?: {
        keyboard: number;
        vr: number;
    };
    rotateSpeed?: number;
    tumble?: boolean;
    showControllerModel?: boolean;
    showEnterVRButton?: boolean;
    showExitVRButton?: boolean;
    vrControls?: boolean;
    keyboardControls?: boolean;
    mouseControls?: boolean;
    showFps?: boolean;
}
interface ThreeImmersiveControls {
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    player: THREE.Group;
    vrSupported: Promise<boolean>;
    vrControls?: VRControls;
    mouseControls?: MouseControls;
    keyboardControls?: KeyboardControls;
    floor: number | false;
    gravity: boolean;
    moveSpeed: {
        keyboard: number;
        vr: number;
    };
    rotateSpeed: number;
    tumble: boolean;
    eyeLevel: number;
    lastUpdate: number;
    millisecondsSinceLastFrame: number;
    interaction: Interaction;
    tempMatrix: THREE.Matrix4;
    raycaster: THREE.Raycaster;
    cameraData: CameraData;
    showFps: boolean;
    statsMesh?: StatsMesh;
}
declare class ThreeImmersiveControls {
    constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, scene: THREE.Scene, { initialPosition, lookAt, floor, gravity, moveSpeed, rotateSpeed, tumble, showControllerModel, showEnterVRButton, showExitVRButton, vrControls, keyboardControls, mouseControls, showFps, }?: ThreeImmersiveControlsOptions);
    update(): void;
}
declare global {
    export interface Window {
        controls: ThreeImmersiveControls;
    }
}
export default ThreeImmersiveControls;
