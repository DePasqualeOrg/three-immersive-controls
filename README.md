# Three.js Immersive Controls

This project is still in early development, and contributions and suggestions are welcome.

- Immersive (VR) mode
  - Movement and rotation with VR controllers (move with left thumbstick, rotate with right thumbstick)
  - Object selection with VR controllers (`A` button or trigger)
- Browser window mode
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
- `floorLimit: number | false`
  - If set to a number, sets the y position of a floor below which the player cannot pass (simple solution for collision detection instead of navmeshes). If set to `false`, no limit to the player's movement along the y-axis is set. Default is `0`.
- `gravity: true | false`
  - `true` (default): The player's movement is restricted to the x- and z-axes, and the y position remains at the `floorLimit`.
  - `false`: The player can also move vertically along the y-axis (flight mode).
- `moveSpeed: { keyboard: number, vr: number }`
  - Speed at which the player moves through the scene when input is received from the keyboard or VR controllers. Default is `{ vr: 2.5, keyboard: 5 }`.
- `rotateSpeed: number`
  - Speed at which the player is rotated when input is received from the keyboard or VR controllers. Default is `1`.
- `tumble: true | false`
  - Whether the player can also rotate along the x-axis in addition to the y-axis. Default is `false`.
- `showControllerModel: true | false`
  - Whether the VR controllers are shown in immersive mode. Default is `true`.
- `showEnterVRButton: true | false`
  - Whether a button is added to the DOM to allow the user to enter immersive mode when this functionality is supported. Default is `true`.
- `showExitVRButton: true | false`
  - Whether a button is displayed in the scene which allows the user to exit immersive mode. Default is `true`.
- `vrControls: true | false`
  - Whether immersive (VR) controls are activated. Default is `true`.
- `keyboardControls: true | false`
  - Whether keyboard controls are activated. Default is `true`.
- `mouseControls: true | false`
  - Whether mouse controls are activated. Default is `true`. (Movement with mouse input has not yet been implemented, but object selection with the mouse works.)
- `showFps: true | false`
  - Whether the `Stats` module is displayed in the DOM and as a mesh in the scene to monitor performance. Default is `false`.

### Example

A full example is provided in the `example` directory. To try it locally in your browser, run:

```
npm run example
```

Or try it [here](https://unpkg.com/@depasquale/three-immersive-controls/example/index.html).

### To-do

- Add collision detection with navmeshes
- Test with variety of VR devices (so far only tested with Oculus Quest 2)
- Handle situations when only one VR controller is available
- Possible additional features
  - Teleportation
  - Blinders during rotation and movement
  - Movement with mouse input
  - Hand tracking
