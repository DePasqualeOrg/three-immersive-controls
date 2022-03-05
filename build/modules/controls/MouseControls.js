/*! Copyright 2022, Anthony DePasquale, anthony@depasquale.org */
import * as THREE from 'three';
class MouseControls {
    constructor(controls) {
        this.firstPersonControls = controls;
        this.mousePosition = new THREE.Vector2();
        this.firstPersonControls.renderer.domElement.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates (-1 to +1)
            this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        // !! Still need to account for case in which a visible element is behind a non-visible element
        // Object selection with mouse
        this.firstPersonControls.renderer.domElement.addEventListener('click', () => {
            if (this.firstPersonControls.objectInteractionManager.intersectedObjects.length > 0 && this.firstPersonControls.objectInteractionManager.intersectedObjects[0].visible === true) {
                this.firstPersonControls.objectInteractionManager.handleSelectedObject(this.firstPersonControls.objectInteractionManager.intersectedObjects[0]);
            }
        });
    }
    update() {
        // Don't get intersctions from camera when in VR
        if (!this.firstPersonControls.vrControls?.inVr) {
            this.firstPersonControls.raycaster.setFromCamera(this.mousePosition, this.firstPersonControls.camera);
            const intersections = this.firstPersonControls.raycaster.intersectObjects(this.firstPersonControls.objectInteractionManager.selectableObjects);
            if (intersections.length > 0 && intersections[0].object.visible === true && intersections[0].object instanceof THREE.Mesh) {
                this.firstPersonControls.objectInteractionManager.handleIntersectedObject(intersections[0].object);
            }
        }
    }
}
export default MouseControls;
