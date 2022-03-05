/*! Copyright 2022, Anthony DePasquale, anthony@depasquale.org */
import type ImmersiveControls from '../../ImmersiveControls.js';
interface KeyboardControls {
    firstPersonControls: ImmersiveControls;
    keysPressed: Array<string>;
    keysToIgnore: Array<string>;
    activeKeys: Array<string>;
    lastFrameMovementWas0: boolean;
    lastFrameRotationWas0: boolean;
    movementInertia: {
        val: number;
    };
    rotationInertia: {
        val: number;
    };
    veticalRotationThreshold: number;
    xRotation: number;
    yRotation: number;
    hotKeys: Array<string>;
    opposites: {
        [key: string]: string;
    };
}
declare class KeyboardControls {
    constructor(controls: ImmersiveControls);
    selectActiveKeys(): void;
    static removeItem(array: Array<string>, item: string): void;
    rotate(): void;
    rotateLeft(rotationAmount: number): void;
    rotateRight(rotationAmount: number): void;
    rotateUp(rotationAmount: number): void;
    rotateDown(rotationAmount: number): void;
    update(): void;
}
export default KeyboardControls;
