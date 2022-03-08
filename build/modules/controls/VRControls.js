/*!
Three.js Immersive Controls
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'; // https://www.npmjs.com/package/@tweenjs/tween.js, https://github.com/tweenjs/tween.js
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import ImmersiveUIButton from '../ImmersiveUIButton.js';
const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
class VRControls {
    constructor(controls, { showControllerModel = false, showEnterVRButton = true, showExitVRButton = true, } = {}) {
        this.controls = controls;
        this.currentVrSession = null;
        this.controls.renderer.xr.enabled = true;
        this.showControllerModel = showControllerModel;
        this.showEnterVRButton = showEnterVRButton;
        this.showExitVRButton = showExitVRButton;
        this.firstEnteredVr = false;
        this.cameraHeightInitialized = false; // Only updates several frames after entering VR?
        this.inVr = (this.controls.renderer.xr.isPresenting === true) || false;
        this.controllers = { left: undefined, right: undefined };
        this.controllerGrips = { left: undefined, right: undefined };
        // Inertia and momentum
        this.lastFrameLeftThumbstickWas0 = true;
        this.lastFrameRightThumbstickWas0 = true;
        this.leftThumbstickInertia = { val: 1 };
        this.rightThumbstickInertia = { val: 1 };
        this.leftThumbstickMomentum = { val: 0 };
        this.rightThumbstickXMomentum = { val: 0 };
        this.rightThumbstickYMomentum = { val: 0 };
        this.thumbstickMax = 1; // Adjusted by `getScale` method if actual thumbstick value exceeds 1
        this.buttons = {
            right: {
                a: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
                b: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
                trigger: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
            },
            left: {
                a: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
                b: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
                trigger: { previousFrame: undefined, thisFrame: undefined, buttonUp: undefined },
            },
        };
        this.controllerModelFactory = new XRControllerModelFactory();
        this.firstControllerReady = this.getController(0);
        this.secondControllerReady = this.getController(1);
        // Create buttons in DOM
        if (this.showEnterVRButton === true) {
            let buttonsContainer = document.getElementById('buttonsContainer');
            if (!buttonsContainer) {
                buttonsContainer = document.createElement('div');
                buttonsContainer.id = 'buttonsContainer';
                document.body.append(buttonsContainer);
            }
            const enterVRButton = document.createElement('button');
            enterVRButton.id = 'enterVRButton';
            enterVRButton.classList.add('button');
            enterVRButton.append('Enter VR');
            enterVRButton.addEventListener('click', () => {
                this.enterVR();
            });
            buttonsContainer?.prepend(enterVRButton); // `prepend` ensures that the element will be inserted before any other child elements of `buttonsContainer`
        }
        // User buttons in VR
        this.userButtons = new THREE.Group();
        this.hideUserButtons();
        this.repositionUserButtons();
        this.controls.player.add(this.userButtons);
        if (this.showExitVRButton === true) {
            const exitVRButton = new ImmersiveUIButton({
                displayText: 'Exit VR', type: 'exitVRButton', meshName: 'Exit VR button', selectable: true, showActive: false, objectInteractionManager: this.controls.objectInteractionManager,
            });
            exitVRButton.created.then(() => {
                this.userButtons.add(exitVRButton.mesh);
            });
            if (!('exitVRButton' in this.controls.objectInteractionManager.selectedObjectHandlers)) {
                this.controls.objectInteractionManager.selectedObjectHandlers.exitVRButton = this.exitVR.bind(this);
            }
            else {
                console.error('Attempting to set selection handler for object of type `exitVRButton`, but a handler for this object type has already been set.');
            }
            if (!('exitVRButton' in this.controls.objectInteractionManager.intersectedObjectHandlers)) {
                // Don't reposition user buttons while they're intersected
                this.controls.objectInteractionManager.intersectedObjectHandlers.exitVRButton = this.resetUserButtonRepositionTimer.bind(this);
            }
            else {
                console.error('Attempting to set selection handler for object of type `exitVRButton`, but a handler for this object type has already been set.');
            }
        }
    }
    enterVR() {
        const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
        navigator.xr.requestSession('immersive-vr', sessionInit).then(async (session) => {
            console.debug('Entered VR');
            await this.controls.renderer.xr.setSession(session);
            session.addEventListener('end', () => {
                // this.currentVrSession = null;
            });
            this.currentVrSession = session;
            console.debug(`cameraHeight: ${this.cameraHeight}`);
            this.inVr = true;
            this.showUserButtons();
            this.repositionUserButtons();
        });
    }
    exitVR() {
        this.currentVrSession?.end();
        console.debug('Exited VR mode');
        console.debug(`cameraHeight: ${this.cameraHeight}`);
        this.hideUserButtons();
        this.inVr = false;
    }
    resetUserButtonRepositionTimer() {
        clearInterval(this.userButtonRepositionTimer);
        this.userButtonRepositionTimer = setInterval(() => {
            this.repositionUserButtons();
        }, 15000);
    }
    repositionUserButtons() {
        this.resetUserButtonRepositionTimer();
        // Reposition
        const gazeVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.controls.camera.quaternion);
        gazeVector.setY(0);
        gazeVector.normalize();
        const gazeVectorRotated = gazeVector.applyAxisAngle(yAxis, Math.PI / 5); // Rotated to the left
        this.userButtons.position.copy(new THREE.Vector3().addVectors(this.controls.camera.position, gazeVectorRotated));
        this.userButtons.position.y -= 0.75;
        this.userButtons.lookAt(this.controls.cameraData.worldPosition);
    }
    getScale(thumbstickVal) {
        if (Math.abs(thumbstickVal) > this.thumbstickMax) {
            this.thumbstickMax = Math.abs(thumbstickVal);
        }
        return 1 / this.thumbstickMax;
    }
    showUserButtons() {
        this.userButtons.visible = true;
        this.userButtons.children.forEach((child) => { child.visible = true; });
    }
    hideUserButtons() {
        this.userButtons.visible = false;
        this.userButtons.children.forEach((child) => { child.visible = false; });
    }
    update() {
        TWEEN.update();
        // Controller/mouse intersections for object selection
        if (this.inVr === true) {
            if (this.controllers.left) {
                this.handleControllerIntersections(this.controllers.left);
            }
            if (this.controllers.right) {
                this.handleControllerIntersections(this.controllers.right);
            }
        }
        // Track button up event: previous frame pressed, this frame not pressed
        const sides = ['left', 'right'];
        // These are the buttons whose status (pressed, up) is tracked each frame
        const buttons = { trigger: 0, a: 4, b: 5 };
        sides.forEach((side) => {
            Object.keys(buttons).forEach((buttonName) => {
                const buttonIndex = buttons[buttonName];
                if (this.controllers[side]?.gamepad.buttons[buttonIndex]) {
                    this.buttons[side][buttonName].previousFrame = this.buttons[side][buttonName].thisFrame;
                    this.buttons[side][buttonName].thisFrame = this.controllers[side]?.gamepad.buttons[buttonIndex].pressed;
                    if (this.buttons[side][buttonName].previousFrame === true && this.buttons[side][buttonName].thisFrame === false) {
                        this.buttons[side][buttonName].buttonUp = true;
                    }
                    else {
                        this.buttons[side][buttonName].buttonUp = false;
                    }
                }
                else {
                    this.buttons[side][buttonName].previousFrame = undefined;
                    this.buttons[side][buttonName].thisFrame = undefined;
                }
            });
        });
        // Toggle user button visibility when `B` button on controller is pressed
        if (this.inVr === true && (this.buttons.left.b.buttonUp === true || this.buttons.right.b.buttonUp === true)) {
            if (this.userButtons.visible === true) {
                this.hideUserButtons();
            }
            else {
                this.showUserButtons();
                this.repositionUserButtons();
            }
        }
        // Height adjustment when entering VR
        this.cameraHeight = this.controls.cameraData.worldPosition.y - this.controls.player.position.y;
        if (this.controls.renderer.xr.isPresenting === true) {
            if (this.firstEnteredVr === true && this.cameraHeightInitialized === false) {
                if (this.cameraHeight !== 0) {
                    this.cameraHeightInitialized = true; // !! Correct? This is set one frame after entering VR
                    this.initialCameraHeight = this.cameraHeight;
                    console.debug('Camera height initialized after entering VR');
                    console.debug(`cameraHeight: ${this.cameraHeight}`);
                    // Now the player can be moved down
                    console.debug(`Player height before adjusting: ${this.controls.player.position.y}`);
                    this.controls.player.position.y -= this.cameraHeight;
                    console.debug(`Player height after adjusting: ${this.controls.player.position.y}`);
                    this.controls.cameraData.worldPosition.y -= this.cameraHeight; // Change just for this frame so that a consistent value gets sent to other players
                    // Show and reposition user buttons
                    this.showUserButtons();
                    this.repositionUserButtons();
                }
            }
            if (this.firstEnteredVr === false) {
                this.firstEnteredVr = true;
            }
        }
        // Compose data for external use
        if (this.controllerGrips.left && this.controls.renderer.xr.isPresenting === true) {
            const leftControllerWorldPosition = new THREE.Vector3();
            const leftControllerWorldRotation = new THREE.Quaternion();
            const leftControllerWorldScale = new THREE.Vector3();
            // !! Send matrix instead?
            this.controllerGrips.left.matrixWorld.decompose(leftControllerWorldPosition, leftControllerWorldRotation, leftControllerWorldScale); // Saves the controller's position, rotation, and scale in the above objects
            this.leftControllerWorldData = { position: leftControllerWorldPosition, rotation: leftControllerWorldRotation, scale: leftControllerWorldScale };
        }
        else {
            this.leftControllerWorldData = undefined;
        }
        if (this.controllerGrips.right && this.controls.renderer.xr.isPresenting === true) {
            const rightControllerWorldPosition = new THREE.Vector3();
            const rightControllerWorldRotation = new THREE.Quaternion();
            const rightControllerWorldScale = new THREE.Vector3();
            // !! Send matrix instead?
            this.controllerGrips.right.matrixWorld.decompose(rightControllerWorldPosition, rightControllerWorldRotation, rightControllerWorldScale); // Saves the controller's position, rotation, and scale in the above objects
            this.rightControllerWorldData = { position: rightControllerWorldPosition, rotation: rightControllerWorldRotation, scale: rightControllerWorldScale };
        }
        else {
            this.rightControllerWorldData = undefined;
        }
        const moveSpeedPerMillisecond = this.controls.moveSpeed.vr / 1000;
        const rotateSpeedPerMillisecond = this.controls.rotateSpeed / 1000;
        // Movement with left controller
        if (this.controllers.left && this.controllers.left.gamepad) {
            // Thumbstick input
            let thumbstickX = this.controllers.left.gamepad.axes[2];
            let thumbstickY = this.controllers.left.gamepad.axes[3];
            thumbstickX *= this.getScale(thumbstickX);
            thumbstickY *= this.getScale(thumbstickY);
            // Raise X and Y values to power of 2 in order to minimize low values in other axis when moving forward/backward or left/right
            thumbstickX **= 2;
            thumbstickY **= 2;
            if (this.controllers.left.gamepad.axes[2] < 0) {
                thumbstickX *= -1;
            }
            if (this.controllers.left.gamepad.axes[3] < 0) {
                thumbstickY *= -1;
            }
            if (this.lastFrameLeftThumbstickWas0 === true && (thumbstickY !== 0 || thumbstickX !== 0)) {
                // Start tween
                this.leftThumbstickTween = new TWEEN.Tween(this.leftThumbstickInertia)
                    .to({ val: 0 }, 1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    // .onUpdate(() => {})
                    .start();
            }
            const inertiaCoefficient = 1 - this.leftThumbstickInertia.val;
            const movementValZ = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickY * inertiaCoefficient;
            const movementValX = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickX * inertiaCoefficient;
            this.leftThumbstickMomentum.val = thumbstickY; // !! Should actually use highest thumbstickY from previous ___ ms
            const move = new THREE.Vector3(movementValX, 0, movementValZ).applyQuaternion(this.controls.cameraData.worldRotation);
            // Enforce floor limit
            if (typeof this.controls.floor === 'number' && move.y !== 0) {
                // Maintain standing height when moving
                // !! If the headset height diff changes significantly over the session (e.g. when standing up/sitting down), the initialCameraHeight needs to be transitioned. Check here and initiate tween if the difference exceeds some threshold
                const minPlayerY = this.controls.floor + this.controls.eyeLevel - this.initialCameraHeight;
                const moveYResult = this.controls.player.position.y + move.y; // The player's y position if the move were applied without being corrected for the floor limit or gravity
                if (this.controls.gravity === true || moveYResult < minPlayerY) {
                    const diff = moveYResult - minPlayerY;
                    move.y -= diff;
                }
            }
            this.controls.player.position.add(move);
            // End
            if (thumbstickY !== 0) {
                this.lastFrameLeftThumbstickWas0 = false;
            }
            else {
                this.lastFrameLeftThumbstickWas0 = true;
                if (this.leftThumbstickTween) {
                    this.leftThumbstickTween.stop();
                }
                // !! Apply momentum
                //
                this.leftThumbstickInertia.val = 1;
            }
        }
        // Rotation with right controller
        if (this.controllers.right?.gamepad) {
            // Left/right rotation
            let thumbstickX = this.controllers.right.gamepad.axes[2];
            let thumbstickY = this.controllers.right.gamepad.axes[3];
            thumbstickX *= this.getScale(thumbstickX);
            thumbstickY *= this.getScale(thumbstickY);
            if (this.lastFrameRightThumbstickWas0 && (thumbstickX !== 0 || thumbstickY !== 0)) {
                // Start tween
                this.rightThumbstickTween = new TWEEN.Tween(this.rightThumbstickInertia)
                    .to({ val: 0 }, 750)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    // .onUpdate(() => {})
                    .start();
            }
            const inertiaCoefficient = 1 - this.rightThumbstickInertia.val;
            if (thumbstickX !== 0 || (thumbstickY !== 0 && this.controls.tumble === true)) {
                const yRotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickX * inertiaCoefficient;
                // this.rightThumbstickYMomentum = thumbstickX; // !! Should actually use highest thumbstickX from previous ___ ms
                const diff = new THREE.Vector3().subVectors(this.controls.cameraData.worldPosition, this.controls.player.position);
                this.controls.player.position.add(diff);
                this.controls.player.rotateOnAxis(yAxis, -yRotationAmount);
                let xRotationAmount;
                if (thumbstickY !== 0 && this.controls.tumble === true) {
                    xRotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickY * inertiaCoefficient;
                    // this.rightThumbstickXMomentum = thumbstickY; // !! Should actually use highest thumbStickY from previous ___ ms
                    this.controls.player.rotateOnAxis(xAxis, xRotationAmount);
                }
                const rotatedDiff = diff.applyEuler(new THREE.Euler(xRotationAmount || 0, -yRotationAmount, 0));
                this.controls.player.position.sub(rotatedDiff);
            }
            // if (thumbstickY !== 0 && this.controls.tumble === true) {
            //   // Up/down rotation
            //   let xRotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickY * inertiaCoefficient;
            //   this.rightThumbstickXMomentum = thumbstickY; // !! Should actually use highest thumbStickY from previous ___ ms
            //   let diff = new THREE.Vector3().subVectors(this.controls.cameraData.worldPosition, this.controls.player.position);
            //   this.controls.player.position.add(diff);
            //   this.controls.player.rotateOnAxis(xAxis, xRotationAmount);
            //   let rotatedDiff = diff.applyAxisAngle(xAxis, xRotationAmount);
            //   this.controls.player.position.sub(rotatedDiff);
            // }
            // End
            if (thumbstickX !== 0 || thumbstickY !== 0) {
                this.lastFrameRightThumbstickWas0 = false;
            }
            else {
                this.lastFrameRightThumbstickWas0 = true;
                if (this.rightThumbstickTween) {
                    this.rightThumbstickTween.stop();
                }
                // !! Apply momentum
                //
                this.rightThumbstickInertia.val = 1;
            }
        }
    }
    getControllerIntersections(controller, objects) {
        this.controls.tempMatrix.identity().extractRotation(controller.matrixWorld);
        this.controls.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        this.controls.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.controls.tempMatrix);
        return this.controls.raycaster.intersectObjects(objects, true).filter((intersection) => intersection.object.visible === true); // `recursive` set to true
    }
    handleControllerIntersections(controller) {
        // // Do not highlight when already selected
        // if (controller.userData.selected !== undefined) {
        //   return;
        // }
        const controllerLine = controller.getObjectByName('line');
        if (controllerLine) {
            const intersections = this.getControllerIntersections(controller, this.controls.objectInteractionManager.selectableObjects);
            if (intersections.length > 0) {
                const intersection = intersections[0];
                const object = intersection.object;
                if (object instanceof THREE.Mesh) {
                    this.controls.objectInteractionManager.handleIntersectedObject(object);
                }
                controllerLine.scale.z = intersection.distance;
                /*
                GamepadButton {pressed: true, touched: true, value: 1}
                Oculus Quest 2 controller:
                Trigger: controller.gamepad.buttons[0]
                Squeeze: controller.gamepad.buttons[1]
                ????: controller.gamepad.buttons[2]
                Thumbstick button: controller.gamepad.buttons[3]
                A: controller.gamepad.buttons[4]
                B: controller.gamepad.buttons[5]
                Thumb touch sensor: controller.gamepad.buttons[6]
                */
                // If `A` button or trigger is pressed and released
                let buttonSide;
                if (controller.side === 'right') {
                    buttonSide = this.buttons.right;
                }
                else if (controller.side === 'left') {
                    buttonSide = this.buttons.left;
                }
                if ((buttonSide?.a.buttonUp === true || buttonSide?.trigger.buttonUp === true) && object.visible === true) {
                    this.controls.objectInteractionManager.handleSelectedObject(object);
                }
            }
            else {
                controllerLine.scale.z = 5;
            }
        }
        else {
            console.error('Object `line` could not be found on controller');
        }
    }
    getController(i) {
        // Line emenating from controls for object selection
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.name = 'line';
        line.scale.z = 5;
        return new Promise((resolve) => {
            const controller = this.controls.renderer.xr.getController(i); // Surface with buttons, thumbstick
            controller.addEventListener('connected', (e) => {
                const controllerGrip = this.controls.renderer.xr.getControllerGrip(i); // The part held in the hand
                if (this.showControllerModel === true) {
                    controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip));
                }
                // Assign both controllers to avoid switching. !! Is this part correct?
                const session = this.controls.renderer.xr.getSession();
                if (session) {
                    // !! The order of the list of input sources may have changed if the controllers became disconnected
                    if (session.inputSources[i]?.handedness === 'right') {
                        controller.side = 'right';
                        this.controllers.right = controller;
                        this.controllerGrips.right = controllerGrip;
                        this.controllers.right.add(line.clone());
                    }
                    else if (session.inputSources[i]?.handedness === 'left') {
                        controller.side = 'left';
                        this.controllers.left = controller;
                        this.controllerGrips.left = controllerGrip;
                        this.controllers.left.add(line.clone());
                    }
                    else {
                        console.error('Error assigning controller to right or left hand');
                    }
                    this.controls.player.add(controllerGrip, controller);
                    controller.gamepad = e.data.gamepad;
                }
                else {
                    console.error('No XR session found');
                }
                resolve();
            });
            controller.addEventListener('disconnected', () => {
                console.debug(`Controller ${i} disconnected`);
                // !! Need to figure out a solution here (see above)
            });
        });
    }
    controllersReady(cb) {
        this.firstControllerReady.then(cb);
        this.secondControllerReady.then(cb);
    }
}
export default VRControls;
