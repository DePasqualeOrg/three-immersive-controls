/*!
Three.js Immersive Controls
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
import * as THREE from 'three';
import StatsMesh from '@depasquale/three-stats-mesh';
import VRControls from './modules/controls/VRControls.js';
import KeyboardControls from './modules/controls/KeyboardControls.js';
import MouseControls from './modules/controls/MouseControls.js';
import ObjectInteractionManager from './modules/ObjectInteractionManager.js';
import CameraData from './modules/CameraData.js';
const eyeLevel = 1.6;
class ThreeImmersiveControls {
    constructor(camera, renderer, scene, { initialPosition = new THREE.Vector3(0, eyeLevel, 4), lookAt = new THREE.Vector3(initialPosition.x, initialPosition.y, initialPosition.z - 10000), 
    // Controls settings
    floorLimit = 0, gravity = true, moveSpeed = { vr: 2.5, keyboard: 5 }, rotateSpeed = 1, tumble = false, 
    // Display options
    showControllerModel = true, showEnterVRButton = true, showExitVRButton = true, 
    // Controls
    vrControls = true, keyboardControls = true, mouseControls = true, 
    // FPS
    showFps = false, } = {}) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;
        // Camera is child of player object so that it can be moved when in VR
        this.player = new THREE.Group();
        this.player.position.copy(initialPosition);
        this.scene.add(this.player);
        this.player.add(this.camera);
        this.camera.position.set(0, 0, 0);
        // Settings used by VR, keyboard and mouse controls
        this.floorLimit = floorLimit;
        this.gravity = gravity;
        this.moveSpeed = moveSpeed;
        this.rotateSpeed = rotateSpeed;
        this.tumble = tumble;
        this.eyeLevel = eyeLevel; // Eye level (camera height) when standing
        this.objectInteractionManager = new ObjectInteractionManager();
        this.cameraData = new CameraData(this.camera);
        // Interactions (controllers, mouse)
        this.tempMatrix = new THREE.Matrix4();
        this.raycaster = new THREE.Raycaster();
        this.vrSupported = new Promise((resolve) => {
            if ('xr' in navigator) {
                navigator.xr.isSessionSupported('immersive-vr').then((vrSupported) => {
                    if (vrSupported === true) {
                        console.debug('VR is supported.');
                        resolve(true);
                    }
                    else {
                        console.debug('VR is not supported.');
                        resolve(false);
                    }
                });
            }
            else {
                console.debug('VR is not supported.');
                resolve(false);
            }
        });
        // Controls
        if (vrControls === true) {
            this.vrSupported.then((vrSupported) => {
                if (vrSupported === true) {
                    this.vrControls = new VRControls(this, { showControllerModel, showEnterVRButton, showExitVRButton });
                }
            });
        }
        if (keyboardControls === true) {
            this.keyboardControls = new KeyboardControls(this);
        }
        if (mouseControls === true) {
            this.mouseControls = new MouseControls(this);
        }
        this.millisecondsSinceLastFrame = 0;
        this.lastUpdate = performance.now();
        this.showFps = showFps;
        if (this.showFps === true) {
            this.statsMesh = new StatsMesh();
            document.body.appendChild(this.statsMesh.stats.dom); // !! Add to #container element instead?
            this.vrSupported.then((vrSupported) => {
                if (vrSupported === true) {
                    if (this.vrControls && this.statsMesh) {
                        this.statsMesh.object.position.y = -0.25;
                        this.vrControls.userButtons.add(this.statsMesh.object);
                    }
                    else {
                        console.error('vrControls does not exist');
                    }
                }
            });
        }
        window.controls = this; // Debugging
    }
    update() {
        // `millisecondsSinceLastFrame` is used by VR, keyboard and mouse controls to scale movement and rotation each frame
        const now = performance.now();
        this.millisecondsSinceLastFrame = now - this.lastUpdate;
        this.lastUpdate = now;
        this.cameraData.update();
        this.objectInteractionManager.cleanIntersected();
        if (this.showFps === true) {
            this.statsMesh?.stats.update();
        }
        this.vrControls?.update();
        this.keyboardControls?.update();
        this.mouseControls?.update();
    }
}
export default ThreeImmersiveControls;
