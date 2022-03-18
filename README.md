# Three.js Immersive Controls

- Immersive (VR) functionality
  - Movement and rotation with VR controllers (move with left thumbstick, rotate with right thumbstick)
  - Object selection with VR controllers (`A` button or trigger)
- Browser window functionality
  - Movement and rotation with keyboard (WASD and arrow keys)
  - Object selection with mouse

### Installation

```
npm install @depasquale/three-immersive-controls
```

### Usage

```javascript
import ImmersiveControls from '@depasquale/three-immersive-controls';

// Create the `camera`, `renderer`, and `scene` instances with Three.js
// ...

const controls = new ImmersiveControls(camera, renderer, scene, { /* options */ });
```

Include this in the render loop:

```javascript
controls.update();
```

### Options

- `initialPosition: THREE.Vector3`
  - The player's initial position in the scene. Default is `new THREE.Vector3(0, 1.6, 4)`.
- `lookAt: THREE.Vector3`
  - Point toward which the player is initially oriented. (Not yet implemented.)
- `floor: number | false`
  - `number` (default is `0`): Sets the y position of a floor below which the player cannot pass (simple solution for collision detection instead of navmeshes).
  - `false`: No limit to the player's movement along the y-axis is set.
- `gravity: true | false`
  - `true` (default): The player's movement is restricted to the x- and z-axes, and the y position remains at the `floor` setting.
  - `false`: The player can also move vertically along the y-axis (flight mode).
- `moveSpeed: { keyboard: number, vr: number }`
  - Speed at which the player moves through the scene when input is received from the keyboard or VR controllers. Default is `{ vr: 2.5, keyboard: 5 }`.
- `rotateSpeed: number`
  - Speed at which the player is rotated when input is received from the keyboard or VR controllers. Default is `1`.
- `tumble: true | false`
  - Allow the player to rotate on the x-axis in addition to the y-axis. Default is `false`.
- `showControllerModel: true | false`
  - Show the VR controllers in immersive mode. Default is `true`.
- `showEnterVRButton: true | false`
  - Add a button to the DOM to allow the user to enter immersive mode when this functionality is supported. Default is `true`.
- `showExitVRButton: true | false`
  - Display a button in front of the player in the scene which allows the user to exit immersive mode. Default is `true`.
- `vrControls: true | false`
  - Activate immersive (VR) controls. Default is `true`.
- `keyboardControls: true | false`
  - Activate keyboard controls. Default is `true`.
- `mouseControls: true | false`
  - Activate mouse controls. Default is `true`. (Movement with mouse input has not yet been implemented, but object selection with the mouse works.)
- `showFps: true | false`
  - Display the `Stats` indicator in the DOM and in front of the player in the scene to monitor performance. Default is `false`.

### Examples

Examples are provided in the `examples` directory. To try them locally in your browser, run:

```
npm run examples
```

Or try them [here](https://unpkg.com/@depasquale/three-immersive-controls/examples/index.html).

### Known bugs

- In Three.js r130, a bug was introduced that interferes with the XR Camera's local matrix calculation. This affects the position of the "Exit VR" button and the camera's position after exiting immersive mode. A [fix](https://github.com/mrdoob/three.js/pull/22362) has been approved and will hopefully be merged soon. For now, the examples are using a patched version of Three.js.

### To do

- Add collision detection with navmeshes
- Test with a variety of VR devices (so far only tested with Oculus Quest 2)
- Handle situations when only one VR controller is available
- Add controls for touchscreen devices
- Better repositioning of "Exit VR" button in scene
- Possible additional features
  - Teleportation
  - Blinders during rotation and movement
  - Movement with mouse input
  - Hand tracking
