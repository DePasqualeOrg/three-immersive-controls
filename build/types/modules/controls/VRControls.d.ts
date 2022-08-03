/// <reference types="webxr" />
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import type ThreeImmersiveControls from '../../ImmersiveControls.js';
interface Controller extends THREE.Group {
    side: 'left' | 'right';
    gamepad: Gamepad;
}
interface VRControlsOptions {
    showControllerModel?: boolean;
    showEnterVRButton?: boolean;
    showExitVRButton?: boolean;
}
interface VRControls {
    controls: ThreeImmersiveControls;
    currentVrSession: null | XRSession;
    firstEnteredVr: boolean;
    cameraHeightInitialized: boolean;
    inVr: boolean;
    lastFrameLeftThumbstickWas0: boolean;
    lastFrameRightThumbstickWas0: boolean;
    leftThumbstickInertia: {
        val: number;
    };
    rightThumbstickInertia: {
        val: number;
    };
    leftThumbstickMomentum: {
        val: number;
    };
    rightThumbstickXMomentum: {
        val: number;
    };
    rightThumbstickYMomentum: {
        val: number;
    };
    thumbstickMax: number;
    controllerModelFactory: XRControllerModelFactory;
    leftControllerWorldData?: {
        position: THREE.Vector3;
        rotation: THREE.Quaternion;
        scale: THREE.Vector3;
    };
    rightControllerWorldData?: {
        position: THREE.Vector3;
        rotation: THREE.Quaternion;
        scale: THREE.Vector3;
    };
    cameraHeight?: number;
    initialCameraHeight: number;
    leftThumbstickTween?: TWEEN.Tween<{
        val: number;
    }>;
    rightThumbstickTween?: TWEEN.Tween<{
        val: number;
    }>;
    userButtons: THREE.Group;
    controllers: {
        [key: string]: undefined | Controller;
    };
    controllerGrips: {
        left: undefined | THREE.Group;
        right: undefined | THREE.Group;
    };
    buttons: {
        [key in 'left' | 'right']: {
            [key: string]: {
                previousFrame: undefined | boolean;
                thisFrame: undefined | boolean;
                buttonUp: undefined | boolean;
                buttonDown: undefined | boolean;
            };
        };
    };
    firstControllerReady: Promise<void>;
    secondControllerReady: Promise<void>;
    showControllerModel: boolean;
    showEnterVRButton: boolean;
    showExitVRButton: boolean;
    userButtonRepositionTimer: ReturnType<typeof setTimeout>;
}
declare class VRControls {
    constructor(controls: ThreeImmersiveControls, { showControllerModel, showEnterVRButton, showExitVRButton, }?: VRControlsOptions);
    enterVR(): void;
    exitVR(): void;
    resetUserButtonRepositionTimer(): void;
    repositionUserButtons(): void;
    getScale(thumbstickVal: number): number;
    showUserButtons(): void;
    hideUserButtons(): void;
    update(): void;
    getControllerIntersections(controller: THREE.Group, objects: Array<THREE.Object3D>): Array<THREE.Intersection>;
    handleControllerIntersections(controller: Controller): void;
    getController(i: number): Promise<void>;
    controllersReady(cb: () => void): void;
}
export default VRControls;
export { Controller };
