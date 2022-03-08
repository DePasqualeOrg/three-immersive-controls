/*! Copyright 2022, Anthony DePasquale, anthony@depasquale.org */
import * as THREE from 'three';
const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
class KeyboardControls {
    constructor(controls) {
        this.controls = controls;
        this.keysPressed = [];
        this.keysToIgnore = [];
        this.activeKeys = [];
        // Inertia and momentum
        this.lastFrameMovementWas0 = true;
        this.lastFrameRotationWas0 = true;
        this.movementInertia = { val: 1 };
        this.rotationInertia = { val: 1 };
        // let movementMomentum = {val: 0};
        // let rotationXMomentum = {val: 0};
        // let rotationYMomentum = {val: 0};
        this.veticalRotationThreshold = 0.95; // Max: 1
        // const rotationAmount = Math.PI / 40;
        // const movementAmount = 0.4;
        this.xRotation = 0;
        this.yRotation = 0;
        this.hotKeys = ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        this.opposites = {
            KeyW: 'KeyS', KeyS: 'KeyW', KeyA: 'KeyD', KeyD: 'KeyA', ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft', ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp',
        };
        window.addEventListener('keydown', (e) => {
            const key = (e.code ? e.code : e.which).toString();
            if (this.hotKeys.includes(key) && !(this.keysPressed.includes(key))) {
                this.keysPressed.push(key);
                if (this.keysPressed.includes(this.opposites[key]) && !(this.keysToIgnore.includes(this.opposites[key]))) {
                    this.keysToIgnore.push(this.opposites[key]);
                }
            }
            this.selectActiveKeys();
            // console.debug(keysPressed, keysToIgnore, activeKeys);
        });
        window.addEventListener('keyup', (e) => {
            const key = (e.code ? e.code : e.which).toString();
            if (this.hotKeys.includes(key)) {
                if (this.keysPressed.includes(key)) {
                    KeyboardControls.removeItem(this.keysPressed, key);
                    if (this.keysToIgnore.includes(this.opposites[key])) {
                        KeyboardControls.removeItem(this.keysToIgnore, this.opposites[key]);
                    }
                }
                if (this.keysToIgnore.includes(key)) {
                    KeyboardControls.removeItem(this.keysToIgnore, key);
                }
            }
            this.selectActiveKeys();
            // console.debug(keysPressed, keysToIgnore, activeKeys);
        });
    }
    selectActiveKeys() {
        this.activeKeys = [];
        this.keysPressed.forEach((key) => {
            if (!(this.keysToIgnore.includes(key))) {
                this.activeKeys.push(key);
            }
        });
    }
    static removeItem(array, item) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                break;
            }
        }
    }
    rotate() {
        // !! Still need to account for situation where player and camera are not in same position (e.g. when exiting VR mode and then using the keyboard)
        let vector = new THREE.Vector3(0, 0, -1);
        vector.applyAxisAngle(xAxis, this.xRotation);
        vector.applyAxisAngle(yAxis, this.yRotation);
        vector = vector.negate(); // !! This is kind of a hack. Need to get camera and player looking at same point (currently inverse)
        const lookAtPoint = new THREE.Vector3().addVectors(this.controls.player.position, vector);
        this.controls.player.lookAt(lookAtPoint);
    }
    rotateLeft(rotationAmount) {
        this.yRotation += rotationAmount;
    }
    rotateRight(rotationAmount) {
        this.yRotation -= rotationAmount;
    }
    rotateUp(rotationAmount) {
        if (this.xRotation + rotationAmount < (Math.PI / 2) * this.veticalRotationThreshold) {
            this.xRotation += rotationAmount;
        }
    }
    rotateDown(rotationAmount) {
        if (this.xRotation - rotationAmount > (-Math.PI / 2) * this.veticalRotationThreshold) {
            this.xRotation -= rotationAmount;
        }
    }
    update() {
        const moveSpeedPerMillisecond = this.controls.moveSpeed.keyboard / 1000;
        const rotateSpeedPerMillisecond = this.controls.rotateSpeed / 1000;
        const movementAmount = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame;
        const rotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame;
        // !! Add inertia
        // const movementAmount = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * inertiaCoefficient;
        // const rotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * inertiaCoefficient;
        const move = new THREE.Vector3(0, 0, 0);
        // Movement
        if (this.activeKeys.includes('KeyW')) {
            // Forward
            move.add(new THREE.Vector3(0, 0, -movementAmount).applyQuaternion(this.controls.cameraData.worldRotation)); // !! Use this.controls.player rotation instead?
        }
        if (this.activeKeys.includes('KeyS')) {
            // Backward
            move.add(new THREE.Vector3(0, 0, movementAmount).applyQuaternion(this.controls.cameraData.worldRotation));
        }
        if (this.activeKeys.includes('KeyA')) {
            // Left
            move.add(new THREE.Vector3(-movementAmount, 0, 0).applyQuaternion(this.controls.cameraData.worldRotation));
        }
        if (this.activeKeys.includes('KeyD')) {
            // Right
            move.add(new THREE.Vector3(movementAmount, 0, 0).applyQuaternion(this.controls.cameraData.worldRotation));
        }
        // Enforce floor limit
        if (typeof this.controls.floor === 'number' && move.y !== 0) {
            const minPlayerY = this.controls.floor + this.controls.eyeLevel;
            const moveYResult = this.controls.player.position.y + move.y; // The player's y position if the move were applied without being corrected for the floor limit or gravity
            if (this.controls.gravity === true || moveYResult < minPlayerY) {
                const diff = moveYResult - minPlayerY;
                move.y -= diff;
            }
        }
        this.controls.player.position.add(move);
        // Rotation
        let needToRotate = false;
        if (this.activeKeys.includes('ArrowLeft')) {
            this.rotateLeft(rotationAmount);
            needToRotate = true;
        }
        if (this.activeKeys.includes('ArrowRight')) {
            this.rotateRight(rotationAmount);
            needToRotate = true;
        }
        if (this.activeKeys.includes('ArrowUp')) {
            this.rotateUp(rotationAmount);
            needToRotate = true;
        }
        if (this.activeKeys.includes('ArrowDown')) {
            this.rotateDown(rotationAmount);
            needToRotate = true;
        }
        if (needToRotate === true) {
            this.rotate();
        }
    }
}
export default KeyboardControls;
