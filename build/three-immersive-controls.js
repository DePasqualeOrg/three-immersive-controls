// build/ImmersiveControls.js
import * as THREE7 from "three";
import StatsMesh from "@depasquale/three-stats-mesh";

// build/modules/controls/VRControls.js
import * as THREE2 from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

// build/modules/rounded-rectangle.js
CanvasRenderingContext2D.prototype.roundedRectangle = function(x, y, width, height, rounded) {
  const halfRadians = 2 * Math.PI / 2;
  const quarterRadians = 2 * Math.PI / 4;
  this.arc(rounded + x, rounded + y, rounded, -quarterRadians, halfRadians, true);
  this.lineTo(x, y + height - rounded);
  this.arc(rounded + x, height - rounded + y, rounded, halfRadians, quarterRadians, true);
  this.lineTo(x + width - rounded, y + height);
  this.arc(x + width - rounded, y + height - rounded, rounded, quarterRadians, 0, true);
  this.lineTo(x + width, y + rounded);
  this.arc(x + width - rounded, y + rounded, rounded, 0, -quarterRadians, true);
  this.lineTo(x + rounded, y);
};

// build/modules/overlays.js
import * as THREE from "three";
var getLines = (ctx, text, maxWidth) => {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(`${currentLine} ${word}`).width;
    if (width < maxWidth) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};
var pixelsPerMeter = 1024;
var makeCanvasCtx = (canvas, nominalWidth, nominalHeight) => {
  const scaleFactor = window.devicePixelRatio;
  canvas.width = nominalWidth * scaleFactor;
  canvas.height = nominalHeight * scaleFactor;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(scaleFactor, scaleFactor);
    return ctx;
  }
  throw new Error("Could not find canvas");
};
var createTextProperties = ({ fontSize = 48, lineHeightRel = 1.15, margin = 20, fontColor = "white", font = "BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif" } = {}) => {
  const textProperties = {
    fontSize,
    font: `${fontSize}px ${font}`,
    lineHeightRel,
    lineHeight: fontSize * lineHeightRel,
    margin,
    fontColor
  };
  return textProperties;
};
var getFinalNominalHeight = ({ text = "", overlayWidth = 0.75, textProperties = createTextProperties() }) => {
  const overlayHeight = 1;
  const nominalWidth = pixelsPerMeter * overlayWidth;
  const nominalHeight = pixelsPerMeter * overlayHeight;
  const canvas = document.createElement("canvas");
  const ctx = makeCanvasCtx(canvas, nominalWidth, nominalHeight);
  if (ctx) {
    ctx.font = textProperties.font;
    const lines = getLines(ctx, text, nominalWidth - textProperties.margin * 2);
    const finalNominalHeight = lines.length * textProperties.lineHeight + textProperties.margin * 2 - (textProperties.lineHeight - textProperties.fontSize) + textProperties.fontSize * 0.3;
    return finalNominalHeight;
  }
  throw new Error("Could not make canvas context");
};
var createImage = ({ text = "", nominalWidth = pixelsPerMeter * 0.75, textProperties = createTextProperties(), finalNominalHeight = getFinalNominalHeight({ text, overlayWidth: nominalWidth, textProperties }), backgroundColor = "rgba(0, 0, 0, 0.6)", fitWidth = true }) => {
  let canvas = document.createElement("canvas");
  let ctx = makeCanvasCtx(canvas, nominalWidth, finalNominalHeight);
  if (ctx) {
    ctx.fillStyle = backgroundColor;
    ctx.roundedRectangle(0, 0, nominalWidth, finalNominalHeight, 20);
    ctx.fill();
    ctx.font = textProperties.font;
    ctx.fillStyle = textProperties.fontColor;
    const lines = getLines(ctx, text, nominalWidth - textProperties.margin * 2);
    let fitNominalWidth;
    if (fitWidth === true && lines.length === 1) {
      fitNominalWidth = ctx.measureText(lines[0]).width + textProperties.margin * 2;
      canvas = document.createElement("canvas");
      ctx = makeCanvasCtx(canvas, fitNominalWidth, finalNominalHeight);
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.roundedRectangle(0, 0, fitNominalWidth, finalNominalHeight, 20);
        ctx.fill();
        ctx.font = textProperties.font;
        ctx.fillStyle = textProperties.fontColor;
      } else {
        console.error("No canvas context was provided");
      }
    }
    if (ctx) {
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], textProperties.margin, textProperties.margin + textProperties.fontSize + i * textProperties.lineHeight);
      }
    } else {
      console.error("No canvas context was provided");
    }
    return { imageData: canvas.toDataURL("image/png"), width: fitNominalWidth || nominalWidth };
  }
  throw new Error("Could not make canvas context");
};
var createOverlay = async ({ text = "", selectable = false, showActive = false, overlayWidth = 0.75, fitWidth = true, textProperties = createTextProperties() }) => {
  const finalNominalHeight = getFinalNominalHeight({ text, overlayWidth, textProperties });
  if (finalNominalHeight) {
    const overlayHeight = finalNominalHeight / pixelsPerMeter;
    const loader = new THREE.TextureLoader();
    const standardImg = createImage({
      text,
      nominalWidth: pixelsPerMeter * overlayWidth,
      finalNominalHeight,
      textProperties: createTextProperties(),
      fitWidth,
      backgroundColor: void 0
    });
    let standardTextureLoaded;
    let intersectedTextureLoaded;
    let activeStandardTextureLoaded;
    let activeIntersectedTextureLoaded;
    if (standardImg) {
      standardTextureLoaded = new Promise((resolveStandardTextureLoaded) => {
        loader.load(standardImg.imageData, (texture) => {
          texture.minFilter = THREE.LinearFilter;
          resolveStandardTextureLoaded(texture);
        });
      });
    } else {
      throw new Error("standardImg was not created");
    }
    if (selectable === true) {
      const intersectedImg = createImage({
        backgroundColor: "rgba(76, 76, 76, 0.6)",
        text,
        nominalWidth: pixelsPerMeter * overlayWidth,
        finalNominalHeight,
        textProperties: createTextProperties(),
        fitWidth
      });
      if (intersectedImg) {
        intersectedTextureLoaded = new Promise((resolveIntersectedTextureLoaded) => {
          loader.load(intersectedImg.imageData, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            resolveIntersectedTextureLoaded(texture);
          });
        });
      } else {
        throw new Error("intersectedImg was not created");
      }
      if (showActive === true) {
        const activeStandardImg = createImage({
          backgroundColor: "rgba(255, 0, 0, 0.6)",
          text,
          nominalWidth: pixelsPerMeter * overlayWidth,
          finalNominalHeight,
          textProperties: createTextProperties(),
          fitWidth
        });
        if (activeStandardImg) {
          activeStandardTextureLoaded = new Promise((resolveActiveStandardTextureLoaded) => {
            loader.load(activeStandardImg.imageData, (texture) => {
              texture.minFilter = THREE.LinearFilter;
              resolveActiveStandardTextureLoaded(texture);
            });
          });
        } else {
          throw new Error("activeStandardImg was not created");
        }
        const activeIntersectedImg = createImage({
          backgroundColor: "rgba(255, 76, 76, 0.6)",
          text,
          nominalWidth: pixelsPerMeter * overlayWidth,
          finalNominalHeight,
          textProperties: createTextProperties(),
          fitWidth
        });
        if (activeIntersectedImg) {
          activeIntersectedTextureLoaded = new Promise((resolveActiveIntersectedTextureLoaded) => {
            loader.load(activeIntersectedImg.imageData, (texture) => {
              texture.minFilter = THREE.LinearFilter;
              resolveActiveIntersectedTextureLoaded(texture);
            });
          });
        } else {
          throw new Error("activeIntersectedImg was not created");
        }
      }
    }
    if (standardImg) {
      const overlayGeometry = new THREE.PlaneGeometry(standardImg.width / pixelsPerMeter, overlayHeight);
      const overlayMaterial = new THREE.MeshBasicMaterial({
        map: await standardTextureLoaded,
        transparent: true
      });
      const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
      if (selectable === true) {
        overlayMesh.userData.textures = { standard: await standardTextureLoaded, intersected: await intersectedTextureLoaded };
        if (showActive === true) {
          overlayMesh.userData.textures.activeStandard = await activeStandardTextureLoaded;
          overlayMesh.userData.textures.activeIntersected = await activeIntersectedTextureLoaded;
          overlayMesh.userData.active = false;
        }
      }
      return overlayMesh;
    }
    throw new Error("standardImg was not loaded");
  } else {
    throw new Error("Could not calculate finalNominalHeight");
  }
};

// build/modules/ImmersiveButton.js
var ImmersiveButton = class {
  constructor({ displayText, type, meshName, selectable = true, showActive = false, interaction }) {
    this.displayText = displayText;
    this.type = type;
    this.meshName = meshName;
    this.selectable = selectable;
    this.showActive = showActive;
    this.created = this.create();
    this.interaction = interaction;
  }
  async create() {
    const button = await createOverlay({ text: this.displayText, selectable: this.selectable, showActive: this.showActive });
    button.name = this.meshName;
    button.userData.type = this.type;
    if (this.selectable === true) {
      this.interaction.selectableObjects.push(button);
    }
    button.geometry.computeBoundingBox();
    if (button.geometry.boundingBox) {
      this.width = button.geometry.boundingBox.max.x - button.geometry.boundingBox.min.x;
      this.height = button.geometry.boundingBox.max.y - button.geometry.boundingBox.min.y;
    } else {
      console.error(`No bounding box available for ${this.meshName}`);
    }
    this.mesh = button;
  }
};
var ImmersiveButton_default = ImmersiveButton;

// build/modules/controls/VRControls.js
var xAxis = new THREE2.Vector3(1, 0, 0);
var yAxis = new THREE2.Vector3(0, 1, 0);
var VRControls = class {
  constructor(controls, { showControllerModel = false, showEnterVRButton = true, showExitVRButton = true } = {}) {
    this.controls = controls;
    this.currentVrSession = null;
    this.controls.renderer.xr.enabled = true;
    this.showControllerModel = showControllerModel;
    this.showEnterVRButton = showEnterVRButton;
    this.showExitVRButton = showExitVRButton;
    this.firstEnteredVr = false;
    this.cameraHeightInitialized = false;
    this.inVr = this.controls.renderer.xr.isPresenting === true || false;
    this.controllers = { left: void 0, right: void 0 };
    this.controllerGrips = { left: void 0, right: void 0 };
    this.lastFrameLeftThumbstickWas0 = true;
    this.lastFrameRightThumbstickWas0 = true;
    this.leftThumbstickInertia = { val: 1 };
    this.rightThumbstickInertia = { val: 1 };
    this.leftThumbstickMomentum = { val: 0 };
    this.rightThumbstickXMomentum = { val: 0 };
    this.rightThumbstickYMomentum = { val: 0 };
    this.thumbstickMax = 1;
    this.buttons = {
      right: {
        a: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 },
        b: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 },
        trigger: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 }
      },
      left: {
        a: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 },
        b: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 },
        trigger: { previousFrame: void 0, thisFrame: void 0, buttonUp: void 0, buttonDown: void 0 }
      }
    };
    this.controllerModelFactory = new XRControllerModelFactory();
    this.firstControllerReady = this.getController(0);
    this.secondControllerReady = this.getController(1);
    if (this.showEnterVRButton === true) {
      let buttonsContainer = document.getElementById("buttonsContainer");
      if (!buttonsContainer) {
        buttonsContainer = document.createElement("div");
        buttonsContainer.id = "buttonsContainer";
        document.body.append(buttonsContainer);
      }
      const enterVRButton = document.createElement("button");
      enterVRButton.id = "enterVRButton";
      enterVRButton.classList.add("button");
      enterVRButton.append("Enter VR");
      enterVRButton.addEventListener("click", () => {
        this.enterVR();
      });
      buttonsContainer?.prepend(enterVRButton);
    }
    this.userButtons = new THREE2.Group();
    this.hideUserButtons();
    this.repositionUserButtons();
    this.controls.player.add(this.userButtons);
    if (this.showExitVRButton === true) {
      const exitVRButton = new ImmersiveButton_default({
        displayText: "Exit VR",
        type: "exitVRButton",
        meshName: "Exit VR button",
        selectable: true,
        showActive: false,
        interaction: this.controls.interaction
      });
      exitVRButton.created.then(() => {
        this.userButtons.add(exitVRButton.mesh);
      });
      if (!("exitVRButton" in this.controls.interaction.selectEndHandlers)) {
        this.controls.interaction.selectEndHandlers.exitVRButton = this.exitVR.bind(this);
      } else {
        console.error("Attempting to set selection handler for object of type `exitVRButton`, but a handler for this object type has already been set.");
      }
      if (!("exitVRButton" in this.controls.interaction.intersectionHandlers)) {
        this.controls.interaction.intersectionHandlers.exitVRButton = this.resetUserButtonRepositionTimer.bind(this);
      } else {
        console.error("Attempting to set selection handler for object of type `exitVRButton`, but a handler for this object type has already been set.");
      }
    }
  }
  enterVR() {
    const sessionInit = { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking", "layers"] };
    navigator.xr.requestSession("immersive-vr", sessionInit).then(async (session) => {
      console.debug("Entered VR");
      await this.controls.renderer.xr.setSession(session);
      session.addEventListener("end", () => {
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
    console.debug("Exited VR mode");
    console.debug(`cameraHeight: ${this.cameraHeight}`);
    this.hideUserButtons();
    this.inVr = false;
  }
  resetUserButtonRepositionTimer() {
    clearInterval(this.userButtonRepositionTimer);
    this.userButtonRepositionTimer = setInterval(() => {
      this.repositionUserButtons();
    }, 15e3);
  }
  repositionUserButtons() {
    this.resetUserButtonRepositionTimer();
    const gazeVector = new THREE2.Vector3(0, 0, -1).applyQuaternion(this.controls.camera.quaternion);
    gazeVector.setY(0);
    gazeVector.normalize();
    const gazeVectorRotated = gazeVector.applyAxisAngle(yAxis, Math.PI / 5);
    this.userButtons.position.copy(new THREE2.Vector3().addVectors(this.controls.camera.position, gazeVectorRotated));
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
    this.userButtons.children.forEach((child) => {
      child.visible = true;
    });
  }
  hideUserButtons() {
    this.userButtons.visible = false;
    this.userButtons.children.forEach((child) => {
      child.visible = false;
    });
  }
  update() {
    TWEEN.update();
    if (this.inVr === true) {
      if (this.controllers.left) {
        this.handleControllerIntersections(this.controllers.left);
      }
      if (this.controllers.right) {
        this.handleControllerIntersections(this.controllers.right);
      }
    }
    const sides = ["left", "right"];
    const buttons = { trigger: 0, a: 4, b: 5 };
    sides.forEach((side) => {
      Object.keys(buttons).forEach((buttonName) => {
        const buttonIndex = buttons[buttonName];
        if (this.controllers[side]?.gamepad.buttons[buttonIndex]) {
          this.buttons[side][buttonName].previousFrame = this.buttons[side][buttonName].thisFrame;
          this.buttons[side][buttonName].thisFrame = this.controllers[side]?.gamepad.buttons[buttonIndex].pressed;
          if (this.buttons[side][buttonName].previousFrame === true && this.buttons[side][buttonName].thisFrame === false) {
            this.buttons[side][buttonName].buttonUp = true;
          } else {
            this.buttons[side][buttonName].buttonUp = false;
          }
          if (this.buttons[side][buttonName].previousFrame === false && this.buttons[side][buttonName].thisFrame === true) {
            this.buttons[side][buttonName].buttonDown = true;
          } else {
            this.buttons[side][buttonName].buttonDown = false;
          }
        } else {
          this.buttons[side][buttonName].previousFrame = void 0;
          this.buttons[side][buttonName].thisFrame = void 0;
        }
      });
    });
    if (this.inVr === true && (this.buttons.left.b.buttonUp === true || this.buttons.right.b.buttonUp === true)) {
      if (this.userButtons.visible === true) {
        this.hideUserButtons();
      } else {
        this.showUserButtons();
        this.repositionUserButtons();
      }
    }
    this.cameraHeight = this.controls.cameraData.worldPosition.y - this.controls.player.position.y;
    if (this.controls.renderer.xr.isPresenting === true) {
      if (this.firstEnteredVr === true && this.cameraHeightInitialized === false) {
        if (this.cameraHeight !== 0) {
          this.cameraHeightInitialized = true;
          this.initialCameraHeight = this.cameraHeight;
          console.debug("Camera height initialized after entering VR");
          console.debug(`cameraHeight: ${this.cameraHeight}`);
          console.debug(`Player height before adjusting: ${this.controls.player.position.y}`);
          this.controls.player.position.y -= this.cameraHeight;
          console.debug(`Player height after adjusting: ${this.controls.player.position.y}`);
          this.controls.cameraData.worldPosition.y -= this.cameraHeight;
          this.showUserButtons();
          this.repositionUserButtons();
        }
      }
      if (this.firstEnteredVr === false) {
        this.firstEnteredVr = true;
      }
    }
    if (this.controllerGrips.left && this.controls.renderer.xr.isPresenting === true) {
      const leftControllerWorldPosition = new THREE2.Vector3();
      const leftControllerWorldRotation = new THREE2.Quaternion();
      const leftControllerWorldScale = new THREE2.Vector3();
      this.controllerGrips.left.matrixWorld.decompose(leftControllerWorldPosition, leftControllerWorldRotation, leftControllerWorldScale);
      this.leftControllerWorldData = { position: leftControllerWorldPosition, rotation: leftControllerWorldRotation, scale: leftControllerWorldScale };
    } else {
      this.leftControllerWorldData = void 0;
    }
    if (this.controllerGrips.right && this.controls.renderer.xr.isPresenting === true) {
      const rightControllerWorldPosition = new THREE2.Vector3();
      const rightControllerWorldRotation = new THREE2.Quaternion();
      const rightControllerWorldScale = new THREE2.Vector3();
      this.controllerGrips.right.matrixWorld.decompose(rightControllerWorldPosition, rightControllerWorldRotation, rightControllerWorldScale);
      this.rightControllerWorldData = { position: rightControllerWorldPosition, rotation: rightControllerWorldRotation, scale: rightControllerWorldScale };
    } else {
      this.rightControllerWorldData = void 0;
    }
    const moveSpeedPerMillisecond = this.controls.moveSpeed.vr / 1e3;
    const rotateSpeedPerMillisecond = this.controls.rotateSpeed / 1e3;
    if (this.controllers.left && this.controllers.left.gamepad) {
      let thumbstickX = this.controllers.left.gamepad.axes[2];
      let thumbstickY = this.controllers.left.gamepad.axes[3];
      thumbstickX *= this.getScale(thumbstickX);
      thumbstickY *= this.getScale(thumbstickY);
      thumbstickX **= 2;
      thumbstickY **= 2;
      if (this.controllers.left.gamepad.axes[2] < 0) {
        thumbstickX *= -1;
      }
      if (this.controllers.left.gamepad.axes[3] < 0) {
        thumbstickY *= -1;
      }
      if (this.lastFrameLeftThumbstickWas0 === true && (thumbstickY !== 0 || thumbstickX !== 0)) {
        this.leftThumbstickTween = new TWEEN.Tween(this.leftThumbstickInertia).to({ val: 0 }, 1e3).easing(TWEEN.Easing.Quadratic.Out).start();
      }
      const inertiaCoefficient = 1 - this.leftThumbstickInertia.val;
      const movementValZ = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickY * inertiaCoefficient;
      const movementValX = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickX * inertiaCoefficient;
      this.leftThumbstickMomentum.val = thumbstickY;
      const move = new THREE2.Vector3(movementValX, 0, movementValZ).applyQuaternion(this.controls.cameraData.worldRotation);
      if (typeof this.controls.floor === "number" && move.y !== 0) {
        const minPlayerY = this.controls.floor + this.controls.eyeLevel - this.initialCameraHeight;
        const moveYResult = this.controls.player.position.y + move.y;
        if (this.controls.gravity === true || moveYResult < minPlayerY) {
          const diff = moveYResult - minPlayerY;
          move.y -= diff;
        }
      }
      this.controls.player.position.add(move);
      if (thumbstickY !== 0) {
        this.lastFrameLeftThumbstickWas0 = false;
      } else {
        this.lastFrameLeftThumbstickWas0 = true;
        if (this.leftThumbstickTween) {
          this.leftThumbstickTween.stop();
        }
        this.leftThumbstickInertia.val = 1;
      }
    }
    if (this.controllers.right?.gamepad) {
      let thumbstickX = this.controllers.right.gamepad.axes[2];
      let thumbstickY = this.controllers.right.gamepad.axes[3];
      thumbstickX *= this.getScale(thumbstickX);
      thumbstickY *= this.getScale(thumbstickY);
      if (this.lastFrameRightThumbstickWas0 && (thumbstickX !== 0 || thumbstickY !== 0)) {
        this.rightThumbstickTween = new TWEEN.Tween(this.rightThumbstickInertia).to({ val: 0 }, 750).easing(TWEEN.Easing.Quadratic.Out).start();
      }
      const inertiaCoefficient = 1 - this.rightThumbstickInertia.val;
      if (thumbstickX !== 0 || thumbstickY !== 0 && this.controls.tumble === true) {
        const yRotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickX * inertiaCoefficient;
        const diff = new THREE2.Vector3().subVectors(this.controls.cameraData.worldPosition, this.controls.player.position);
        this.controls.player.position.add(diff);
        this.controls.player.rotateOnAxis(yAxis, -yRotationAmount);
        let xRotationAmount;
        if (thumbstickY !== 0 && this.controls.tumble === true) {
          xRotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * thumbstickY * inertiaCoefficient;
          this.controls.player.rotateOnAxis(xAxis, xRotationAmount);
        }
        const rotatedDiff = diff.applyEuler(new THREE2.Euler(xRotationAmount || 0, -yRotationAmount, 0));
        this.controls.player.position.sub(rotatedDiff);
      }
      if (thumbstickX !== 0 || thumbstickY !== 0) {
        this.lastFrameRightThumbstickWas0 = false;
      } else {
        this.lastFrameRightThumbstickWas0 = true;
        if (this.rightThumbstickTween) {
          this.rightThumbstickTween.stop();
        }
        this.rightThumbstickInertia.val = 1;
      }
    }
  }
  getControllerIntersections(controller, objects) {
    this.controls.tempMatrix.identity().extractRotation(controller.matrixWorld);
    this.controls.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.controls.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.controls.tempMatrix);
    return this.controls.raycaster.intersectObjects(objects, true).filter((intersection) => intersection.object.visible === true);
  }
  handleControllerIntersections(controller) {
    const controllerLine = controller.getObjectByName("line");
    if (controllerLine) {
      const intersections = this.getControllerIntersections(controller, this.controls.interaction.selectableObjects);
      if (intersections.length > 0) {
        const intersection = intersections[0];
        const object = intersection.object;
        if (object instanceof THREE2.Mesh) {
          this.controls.interaction.handleIntersection(object);
        }
        controllerLine.scale.z = intersection.distance;
        let buttonSide;
        if (controller.side === "right") {
          buttonSide = this.buttons.right;
        } else if (controller.side === "left") {
          buttonSide = this.buttons.left;
        }
        if ((buttonSide?.a.buttonDown === true || buttonSide?.trigger.buttonDown === true) && object.visible === true) {
          this.controls.interaction.handleSelectStart(object, controller);
        }
        if ((buttonSide?.a.buttonUp === true || buttonSide?.trigger.buttonUp === true) && object.visible === true) {
          this.controls.interaction.handleSelectEnd(object, controller);
        }
      } else {
        controllerLine.scale.z = 5;
      }
    } else {
      console.error("Object `line` could not be found on controller");
    }
  }
  getController(i) {
    const lineGeometry = new THREE2.BufferGeometry().setFromPoints([new THREE2.Vector3(0, 0, 0), new THREE2.Vector3(0, 0, -1)]);
    const lineMaterial = new THREE2.LineBasicMaterial({
      color: 16777215,
      transparent: true,
      opacity: 0.1
    });
    const line = new THREE2.Line(lineGeometry, lineMaterial);
    line.name = "line";
    line.scale.z = 5;
    return new Promise((resolve) => {
      const controller = this.controls.renderer.xr.getController(i);
      controller.addEventListener("connected", (e) => {
        const controllerGrip = this.controls.renderer.xr.getControllerGrip(i);
        if (this.showControllerModel === true) {
          controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip));
        }
        const session = this.controls.renderer.xr.getSession();
        if (session) {
          if (session.inputSources[i]?.handedness === "right") {
            controller.side = "right";
            this.controllers.right = controller;
            this.controllerGrips.right = controllerGrip;
            this.controllers.right.add(line.clone());
          } else if (session.inputSources[i]?.handedness === "left") {
            controller.side = "left";
            this.controllers.left = controller;
            this.controllerGrips.left = controllerGrip;
            this.controllers.left.add(line.clone());
          } else {
            console.error("Error assigning controller to right or left hand");
          }
          this.controls.player.add(controllerGrip, controller);
          controller.gamepad = e.data.gamepad;
        } else {
          console.error("No XR session found");
        }
        resolve();
      });
      controller.addEventListener("disconnected", () => {
        console.debug(`Controller ${i} disconnected`);
      });
    });
  }
  controllersReady(cb) {
    this.firstControllerReady.then(cb);
    this.secondControllerReady.then(cb);
  }
};
var VRControls_default = VRControls;

// build/modules/controls/KeyboardControls.js
import * as THREE3 from "three";
import * as TWEEN2 from "@tweenjs/tween.js";
var inertiaTweenDuration = 350;
var xAxis2 = new THREE3.Vector3(1, 0, 0);
var yAxis2 = new THREE3.Vector3(0, 1, 0);
var KeyboardControls = class {
  constructor(controls) {
    this.controls = controls;
    this.keysPressed = [];
    this.keysToIgnore = [];
    this.activeKeys = [];
    this.lastFrameMovementWas0 = true;
    this.lastFrameRotationWas0 = true;
    this.movementInertia = { val: 1 };
    this.rotationInertia = { val: 1 };
    this.veticalRotationThreshold = 0.95;
    this.xRotation = 0;
    this.yRotation = 0;
    this.hotKeys = ["KeyW", "KeyS", "KeyA", "KeyD", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    this.opposites = {
      KeyW: "KeyS",
      KeyS: "KeyW",
      KeyA: "KeyD",
      KeyD: "KeyA",
      ArrowLeft: "ArrowRight",
      ArrowRight: "ArrowLeft",
      ArrowUp: "ArrowDown",
      ArrowDown: "ArrowUp"
    };
    window.addEventListener("keydown", (e) => {
      const key = (e.code ? e.code : e.which).toString();
      if (this.hotKeys.includes(key) && !this.keysPressed.includes(key)) {
        this.keysPressed.push(key);
        if (this.keysPressed.includes(this.opposites[key]) && !this.keysToIgnore.includes(this.opposites[key])) {
          this.keysToIgnore.push(this.opposites[key]);
        }
      }
      this.selectActiveKeys();
    });
    window.addEventListener("keyup", (e) => {
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
    });
  }
  selectActiveKeys() {
    this.activeKeys = [];
    this.keysPressed.forEach((key) => {
      if (!this.keysToIgnore.includes(key)) {
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
    let vector = new THREE3.Vector3(0, 0, -1);
    vector.applyAxisAngle(xAxis2, this.xRotation);
    vector.applyAxisAngle(yAxis2, this.yRotation);
    vector = vector.negate();
    const lookAtPoint = new THREE3.Vector3().addVectors(this.controls.player.position, vector);
    this.controls.player.lookAt(lookAtPoint);
  }
  rotateLeft(rotationAmount) {
    this.yRotation += rotationAmount;
  }
  rotateRight(rotationAmount) {
    this.yRotation -= rotationAmount;
  }
  rotateUp(rotationAmount) {
    if (this.xRotation + rotationAmount < Math.PI / 2 * this.veticalRotationThreshold) {
      this.xRotation += rotationAmount;
    }
  }
  rotateDown(rotationAmount) {
    if (this.xRotation - rotationAmount > -Math.PI / 2 * this.veticalRotationThreshold) {
      this.xRotation -= rotationAmount;
    }
  }
  update() {
    TWEEN2.update();
    const moveSpeedPerMillisecond = this.controls.moveSpeed.keyboard / 1e3;
    const rotateSpeedPerMillisecond = this.controls.rotateSpeed / 1e3;
    let movementKeyActive = false;
    if (this.activeKeys.includes("KeyW") || this.activeKeys.includes("KeyS") || this.activeKeys.includes("KeyA") || this.activeKeys.includes("KeyD")) {
      movementKeyActive = true;
    }
    if (this.lastFrameMovementWas0 === true && movementKeyActive === true) {
      this.movementTween = new TWEEN2.Tween(this.movementInertia).to({ val: 0 }, inertiaTweenDuration).easing(TWEEN2.Easing.Quadratic.Out).start();
    }
    const movementInertiaCoefficient = 1 - this.movementInertia.val;
    const movementAmount = moveSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * movementInertiaCoefficient;
    const move = new THREE3.Vector3(0, 0, 0);
    let rotationKeyActive = false;
    if (this.activeKeys.includes("ArrowUp") || this.activeKeys.includes("ArrowDown") || this.activeKeys.includes("ArrowRight") || this.activeKeys.includes("ArrowLeft")) {
      rotationKeyActive = true;
    }
    if (this.lastFrameRotationWas0 === true && rotationKeyActive === true) {
      this.rotationTween = new TWEEN2.Tween(this.rotationInertia).to({ val: 0 }, inertiaTweenDuration).easing(TWEEN2.Easing.Quadratic.Out).start();
    }
    const rotationInertiaCoefficient = 1 - this.rotationInertia.val;
    const rotationAmount = rotateSpeedPerMillisecond * this.controls.millisecondsSinceLastFrame * rotationInertiaCoefficient;
    let movementFlag = true;
    if (this.activeKeys.includes("KeyW")) {
      move.add(new THREE3.Vector3(0, 0, -movementAmount).applyQuaternion(this.controls.cameraData.worldRotation));
      movementFlag = false;
    } else if (this.activeKeys.includes("KeyS")) {
      move.add(new THREE3.Vector3(0, 0, movementAmount).applyQuaternion(this.controls.cameraData.worldRotation));
      movementFlag = false;
    }
    if (this.activeKeys.includes("KeyA")) {
      move.add(new THREE3.Vector3(-movementAmount, 0, 0).applyQuaternion(this.controls.cameraData.worldRotation));
      movementFlag = false;
    } else if (this.activeKeys.includes("KeyD")) {
      move.add(new THREE3.Vector3(movementAmount, 0, 0).applyQuaternion(this.controls.cameraData.worldRotation));
      movementFlag = false;
    }
    if (movementFlag === true) {
      this.lastFrameMovementWas0 = true;
      this.movementInertia.val = 1;
    } else {
      this.lastFrameMovementWas0 = false;
    }
    if (typeof this.controls.floor === "number" && move.y !== 0) {
      const minPlayerY = this.controls.floor + this.controls.eyeLevel;
      const moveYResult = this.controls.player.position.y + move.y;
      if (this.controls.gravity === true || moveYResult < minPlayerY) {
        const diff = moveYResult - minPlayerY;
        move.y -= diff;
      }
    }
    this.controls.player.position.add(move);
    let needToRotate = false;
    if (this.activeKeys.includes("ArrowLeft")) {
      this.rotateLeft(rotationAmount);
      needToRotate = true;
    } else if (this.activeKeys.includes("ArrowRight")) {
      this.rotateRight(rotationAmount);
      needToRotate = true;
    }
    if (this.activeKeys.includes("ArrowUp")) {
      this.rotateUp(rotationAmount);
      needToRotate = true;
    } else if (this.activeKeys.includes("ArrowDown")) {
      this.rotateDown(rotationAmount);
      needToRotate = true;
    }
    if (needToRotate === true) {
      this.rotate();
      this.lastFrameRotationWas0 = false;
    } else {
      this.lastFrameRotationWas0 = true;
      this.rotationInertia.val = 1;
    }
  }
};
var KeyboardControls_default = KeyboardControls;

// build/modules/controls/MouseControls.js
import * as THREE4 from "three";
var MouseControls = class {
  constructor(controls) {
    this.controls = controls;
    this.mousePosition = new THREE4.Vector2();
    this.controls.renderer.domElement.addEventListener("mousemove", (event) => {
      this.mousePosition.x = event.clientX / window.innerWidth * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    this.controls.renderer.domElement.addEventListener("mousedown", () => {
      if (this.controls.interaction.intersectedObjects.length > 0 && this.controls.interaction.intersectedObjects[0].visible === true) {
        this.controls.interaction.handleSelectStart(this.controls.interaction.intersectedObjects[0]);
      }
    });
    this.controls.renderer.domElement.addEventListener("click", () => {
      if (this.controls.interaction.intersectedObjects.length > 0 && this.controls.interaction.intersectedObjects[0].visible === true) {
        this.controls.interaction.handleSelectEnd(this.controls.interaction.intersectedObjects[0]);
      }
    });
  }
  update() {
    if (!this.controls.vrControls?.inVr) {
      this.controls.raycaster.setFromCamera(this.mousePosition, this.controls.camera);
      this.intersections = this.controls.raycaster.intersectObjects(this.controls.interaction.selectableObjects);
      if (this.intersections.length > 0 && this.intersections[0].object.visible === true && this.intersections[0].object instanceof THREE4.Mesh) {
        this.controls.interaction.handleIntersection(this.intersections[0].object);
      }
    }
  }
};
var MouseControls_default = MouseControls;

// build/modules/Interaction.js
import * as THREE5 from "three";
var Interaction = class {
  constructor() {
    this.intersectedObjects = [];
    this.selectableObjects = [];
    this.intersectedObjectEmissiveVal = 0.3;
    this.intersectionHandlers = {};
    this.selectStartHandlers = {};
    this.selectEndHandlers = {};
  }
  handleSelectStart(object, controller) {
    console.debug(`Select start occurred on ${object.name || object.userData.type}`);
    if (object.userData.type in this.selectStartHandlers) {
      this.selectStartHandlers[object.userData.type](object, controller);
    } else {
      console.error(`Select start occurred on object of type ${object.userData.type}, but no handler was set for this type.`);
    }
  }
  handleSelectEnd(object, controller) {
    console.debug(`Select end occurred on ${object.name || object.userData.type}`);
    if (object.userData.type in this.selectEndHandlers) {
      this.selectEndHandlers[object.userData.type](object, controller);
    } else {
      console.error(`Select end occurred on object of type ${object.userData.type}, but no handler was set for this type.`);
    }
  }
  cleanIntersected() {
    while (this.intersectedObjects.length) {
      const object = this.intersectedObjects.pop();
      if (object instanceof THREE5.Mesh) {
        object.material.emissive?.setScalar(0);
        Interaction.handleButtonMaterialMaps(object, false);
      }
    }
  }
  static handleButtonMaterialMaps(object, intersected = false) {
    if (object.userData.textures && object.material instanceof THREE5.MeshBasicMaterial) {
      if (object.userData.active === true) {
        object.material.map = intersected ? object.userData.textures.activeIntersected : object.userData.textures.activeStandard;
      } else {
        object.material.map = intersected ? object.userData.textures.intersected : object.userData.textures.standard;
      }
    }
  }
  handleIntersection(object) {
    this.intersectedObjects.push(object);
    Interaction.handleButtonMaterialMaps(object, true);
    if (object.material instanceof THREE5.MeshStandardMaterial) {
      object.material.emissive?.setScalar(this.intersectedObjectEmissiveVal);
    }
    if (object.userData.type in this.intersectionHandlers) {
      this.intersectionHandlers[object.userData.type](object);
    }
  }
};
var Interaction_default = Interaction;

// build/modules/CameraData.js
import * as THREE6 from "three";
var CameraData = class {
  constructor(camera) {
    this.camera = camera;
    this.worldPosition = new THREE6.Vector3();
    this.worldRotation = new THREE6.Quaternion();
    this.worldScale = new THREE6.Vector3();
    this.update();
  }
  update() {
    this.camera.matrixWorld.decompose(this.worldPosition, this.worldRotation, this.worldScale);
  }
};
var CameraData_default = CameraData;

// build/ImmersiveControls.js
var eyeLevel = 1.6;
var ThreeImmersiveControls = class {
  constructor(camera, renderer, scene, {
    initialPosition = new THREE7.Vector3(0, eyeLevel, 4),
    lookAt = new THREE7.Vector3(initialPosition.x, initialPosition.y, initialPosition.z - 1e4),
    floor = 0,
    gravity = true,
    moveSpeed = { vr: 2.5, keyboard: 5 },
    rotateSpeed = 1,
    tumble = false,
    showControllerModel = true,
    showEnterVRButton = true,
    showExitVRButton = true,
    vrControls = true,
    keyboardControls = true,
    mouseControls = true,
    showFps = false
  } = {}) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = new THREE7.Group();
    this.player.position.copy(initialPosition);
    this.scene.add(this.player);
    this.player.add(this.camera);
    this.camera.position.set(0, 0, 0);
    this.floor = floor;
    this.gravity = gravity;
    this.moveSpeed = moveSpeed;
    this.rotateSpeed = rotateSpeed;
    this.tumble = tumble;
    this.eyeLevel = eyeLevel;
    this.interaction = new Interaction_default();
    this.cameraData = new CameraData_default(this.camera);
    this.tempMatrix = new THREE7.Matrix4();
    this.raycaster = new THREE7.Raycaster();
    this.vrSupported = new Promise((resolve) => {
      if ("xr" in navigator) {
        navigator.xr.isSessionSupported("immersive-vr").then((vrSupported) => {
          if (vrSupported === true) {
            console.debug("VR is supported.");
            resolve(true);
          } else {
            console.debug("VR is not supported.");
            resolve(false);
          }
        });
      } else {
        console.debug("VR is not supported.");
        resolve(false);
      }
    });
    if (vrControls === true) {
      this.vrSupported.then((vrSupported) => {
        if (vrSupported === true) {
          this.vrControls = new VRControls_default(this, { showControllerModel, showEnterVRButton, showExitVRButton });
        }
      });
    }
    if (keyboardControls === true) {
      this.keyboardControls = new KeyboardControls_default(this);
    }
    if (mouseControls === true) {
      this.mouseControls = new MouseControls_default(this);
    }
    this.millisecondsSinceLastFrame = 0;
    this.lastUpdate = performance.now();
    this.showFps = showFps;
    if (this.showFps === true) {
      this.statsMesh = new StatsMesh();
      document.body.appendChild(this.statsMesh.stats.dom);
      this.vrSupported.then((vrSupported) => {
        if (vrSupported === true) {
          if (this.vrControls && this.statsMesh) {
            this.statsMesh.object.position.y = -0.25;
            this.vrControls.userButtons.add(this.statsMesh.object);
          } else {
            console.error("vrControls does not exist");
          }
        }
      });
    }
    window.controls = this;
  }
  update() {
    const now = performance.now();
    this.millisecondsSinceLastFrame = now - this.lastUpdate;
    this.lastUpdate = now;
    this.cameraData.update();
    this.interaction.cleanIntersected();
    if (this.showFps === true) {
      this.statsMesh?.stats.update();
    }
    this.vrControls?.update();
    this.keyboardControls?.update();
    this.mouseControls?.update();
  }
};
var ImmersiveControls_default = ThreeImmersiveControls;

// build/index.js
var build_default = ImmersiveControls_default;
export {
  CameraData_default as CameraData,
  ImmersiveButton_default as ImmersiveButton,
  Interaction_default as Interaction,
  createOverlay,
  build_default as default
};
/*!
Three.js Immersive Controls
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
/*!
roundedRectangle by Aaron Newell
https://newfivefour.com/javascript-canvas-rounded-rectangle.html
*/
