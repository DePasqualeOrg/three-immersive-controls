/*! Copyright 2022, Anthony DePasquale, anthony@depasquale.org */
import * as THREE from 'three';
class MouseControls {
    constructor(controls) {
        this.controls = controls;
        this.mousePosition = new THREE.Vector2();
        this.controls.renderer.domElement.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        // !! Still need to account for case in which a visible element is behind a non-visible element
        // Object selection with mouse
        // Select start
        this.controls.renderer.domElement.addEventListener('mousedown', () => {
            if (this.controls.interaction.intersectedObjects.length > 0 && this.controls.interaction.intersectedObjects[0].visible === true) {
                this.controls.interaction.handleSelectStart(this.controls.interaction.intersectedObjects[0]);
            }
        });
        // Select end
        this.controls.renderer.domElement.addEventListener('click', () => {
            if (this.controls.interaction.intersectedObjects.length > 0 && this.controls.interaction.intersectedObjects[0].visible === true) {
                this.controls.interaction.handleSelectEnd(this.controls.interaction.intersectedObjects[0]);
            }
        });
    }
    update() {
        // Don't get intersctions from camera when in VR
        if (!this.controls.vrControls?.inVr) {
            this.controls.raycaster.setFromCamera(this.mousePosition, this.controls.camera);
            const intersections = this.controls.raycaster.intersectObjects(this.controls.interaction.selectableObjects);
            if (intersections.length > 0 && intersections[0].object.visible === true && intersections[0].object instanceof THREE.Mesh) {
                this.controls.interaction.handleIntersection(intersections[0].object);
            }
        }
    }
}
export default MouseControls;
