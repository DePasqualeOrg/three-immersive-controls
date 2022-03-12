// morphing-loops.js
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import SimplexNoise from "simplex-noise";

// ../../modules/math.js
var lerp = (value1, value2, interpolationValue) => value1 - (value1 - value2) * interpolationValue;

// ../../modules/three-geometry.js
var addMergedVerticesMap = (geometry) => {
  geometry.userData.mergedVerticesMap = new Array(geometry.attributes.position.array.length);
  for (let i = 0; i < geometry.index.array.length; i++) {
    for (let j = 0; j < 3; j++) {
      const index = geometry.index.array[i];
      geometry.userData.mergedVerticesMap[index * 3 + j] = i * 3 + j;
    }
  }
};
var updateMergedVertices = (geometry, newVertices) => {
  for (let i = 0; i < geometry.userData.mergedVerticesMap.length; i++) {
    geometry.attributes.position.array[i] = newVertices[geometry.userData.mergedVerticesMap[i]];
  }
  geometry.computeVertexNormals();
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.normal.needsUpdate = true;
};

// morphing-loops.js
var tNow = (cycleLength) => Date.now() % cycleLength / cycleLength;
var Loop = class {
  constructor({
    random = Math.random,
    dimensions = 2,
    pointMaxDistFromCenter = 1,
    controlPointMaxDist = 0.7,
    controlPointAngle1Offset = 0,
    endpointAngle1Offset = 0,
    controlPointAngle2Offset = 0,
    endpointAngle2Offset = 0,
    loops = 100,
    convolutions = 2,
    morphs = 1
  } = {}) {
    this.random = random;
    this.settings = { pointMaxDistFromCenter, controlPointMaxDist, controlPointAngle1Offset, endpointAngle1Offset, controlPointAngle2Offset, endpointAngle2Offset, loops, convolutions, morphs };
    this.dimensions = dimensions;
    this.point1 = {
      x: null,
      y: null,
      angle1Seed: this.random(),
      angle1: null,
      distFromCenterSeed: this.random(),
      distFromCenter: null,
      controlPoint1: {
        x: null,
        y: null,
        angle1Seed: this.random(),
        angle1: null,
        distSeed: this.random(),
        dist: null
      },
      controlPoint2: {
        x: null,
        y: null,
        angle1: null,
        distSeed: this.random(),
        dist: null
      }
    };
    this.point2 = {
      x: null,
      y: null,
      angle1: null,
      distFromCenterSeed: this.random(),
      distFromCenter: null,
      controlPoint1: {
        x: null,
        y: null,
        angle1Seed: this.random(),
        angle1: null,
        distSeed: this.random(),
        dist: null
      },
      controlPoint2: {
        x: null,
        y: null,
        angle1: null,
        distSeed: this.random(),
        dist: null
      }
    };
    if (this.dimensions === 3) {
      this.point1.z = null;
      this.point1.angle2Seed = this.random();
      this.point1.angle2 = null;
      this.point1.controlPoint1.z = null;
      this.point1.controlPoint1.angle2Seed = this.random();
      this.point1.controlPoint1.angle2 = null;
      this.point1.controlPoint2.z = null;
      this.point1.controlPoint2.angle2 = null;
      this.point2.z = null;
      this.point2.angle2 = null;
      this.point2.controlPoint1.z = null;
      this.point2.controlPoint1.angle2Seed = this.random();
      this.point2.controlPoint1.angle2 = null;
      this.point2.controlPoint2.z = null;
      this.point2.controlPoint2.angle2 = null;
    }
  }
  curve1Points() {
    return [
      new THREE.Vector3(this.point1.x, this.point1.y, this.point1.z),
      new THREE.Vector3(this.point1.controlPoint1.x, this.point1.controlPoint1.y, this.point1.controlPoint1.z),
      new THREE.Vector3(this.point2.controlPoint1.x, this.point2.controlPoint1.y, this.point2.controlPoint1.z),
      new THREE.Vector3(this.point2.x, this.point2.y, this.point2.z)
    ];
  }
  curve2Points() {
    return [
      new THREE.Vector3(this.point2.x, this.point2.y, this.point2.z),
      new THREE.Vector3(this.point2.controlPoint2.x, this.point2.controlPoint2.y, this.point2.controlPoint2.z),
      new THREE.Vector3(this.point1.controlPoint2.x, this.point1.controlPoint2.y, this.point1.controlPoint2.z),
      new THREE.Vector3(this.point1.x, this.point1.y, this.point1.z)
    ];
  }
  assignCurves() {
    this.curve1 = new THREE.CubicBezierCurve3(...this.curve1Points());
    this.curve2 = new THREE.CubicBezierCurve3(...this.curve2Points());
    this.curvePath = new THREE.CurvePath();
    this.curvePath.add(this.curve1);
    this.curvePath.add(this.curve2);
  }
  updateCurves() {
    const newPoints1 = this.curve1Points();
    const newPoints2 = this.curve2Points();
    [this.curve1.v0, this.curve1.v1, this.curve1.v2, this.curve1.v3] = [newPoints1[0], newPoints1[1], newPoints1[2], newPoints1[3]];
    [this.curve2.v0, this.curve2.v1, this.curve2.v2, this.curve2.v3] = [newPoints2[0], newPoints2[1], newPoints2[2], newPoints2[3]];
    this.curve1.updateArcLengths();
    this.curve2.updateArcLengths();
    this.curvePath.updateArcLengths();
  }
  calculate() {
    this.point1.angle1 = this.point1.angle1Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.endpointAngle1Offset;
    this.point1.distFromCenter = this.point1.distFromCenterSeed * this.settings.pointMaxDistFromCenter;
    this.point1.controlPoint1.angle1 = this.point1.controlPoint1.angle1Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.controlPointAngle1Offset;
    this.point1.controlPoint1.dist = this.point1.controlPoint1.distSeed * this.settings.controlPointMaxDist;
    this.point1.controlPoint2.angle1 = this.point1.controlPoint1.angle1 + Math.PI;
    this.point1.controlPoint2.dist = this.point1.controlPoint2.distSeed * this.settings.controlPointMaxDist;
    this.point2.angle1 = this.point1.angle1 + Math.PI;
    this.point2.distFromCenter = this.point2.distFromCenterSeed * this.settings.pointMaxDistFromCenter;
    this.point2.controlPoint1.angle1 = this.point2.controlPoint1.angle1Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.controlPointAngle1Offset;
    this.point2.controlPoint1.dist = this.point2.controlPoint1.distSeed * this.settings.controlPointMaxDist;
    this.point2.controlPoint2.angle1 = this.point2.controlPoint1.angle1 + Math.PI;
    this.point2.controlPoint2.dist = this.point2.controlPoint2.distSeed * this.settings.controlPointMaxDist;
    if (this.dimensions === 3) {
      this.point1.angle2 = this.point1.angle2Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.endpointAngle2Offset;
      this.point1.controlPoint1.angle2 = this.point1.controlPoint1.angle2Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.controlPointAngle2Offset;
      this.point1.controlPoint2.angle2 = this.point1.controlPoint1.angle2 + Math.PI;
      this.point2.angle2 = this.point1.angle2 + Math.PI;
      this.point2.controlPoint1.angle2 = this.point2.controlPoint1.angle2Seed * (Math.PI * 2 * this.settings.convolutions) + this.settings.controlPointAngle2Offset;
      this.point2.controlPoint2.angle2 = this.point2.controlPoint1.angle2 + Math.PI;
    }
    this.point1.x = this.point1.distFromCenter * Math.cos(this.point1.angle1);
    this.point1.y = this.point1.distFromCenter * Math.sin(this.point1.angle1);
    this.point2.x = this.point2.distFromCenter * Math.cos(this.point2.angle1);
    this.point2.y = this.point2.distFromCenter * Math.sin(this.point2.angle1);
    this.point1.controlPoint1.x = this.point1.x + this.point1.controlPoint1.dist * Math.cos(this.point1.controlPoint1.angle1);
    this.point1.controlPoint1.y = this.point1.y + this.point1.controlPoint1.dist * Math.sin(this.point1.controlPoint1.angle1);
    this.point1.controlPoint2.x = this.point1.x + this.point1.controlPoint2.dist * Math.cos(this.point1.controlPoint2.angle1);
    this.point1.controlPoint2.y = this.point1.y + this.point1.controlPoint2.dist * Math.sin(this.point1.controlPoint2.angle1);
    this.point2.controlPoint1.x = this.point2.x + this.point2.controlPoint1.dist * Math.cos(this.point2.controlPoint1.angle1);
    this.point2.controlPoint1.y = this.point2.y + this.point2.controlPoint1.dist * Math.sin(this.point2.controlPoint1.angle1);
    this.point2.controlPoint2.x = this.point2.x + this.point2.controlPoint2.dist * Math.cos(this.point2.controlPoint2.angle1);
    this.point2.controlPoint2.y = this.point2.y + this.point2.controlPoint2.dist * Math.sin(this.point2.controlPoint2.angle1);
    if (this.dimensions === 3) {
      this.point1.z = this.point1.distFromCenter * Math.sin(this.point1.angle2);
      this.point1.controlPoint1.z = this.point1.z + this.point1.controlPoint1.dist * Math.sin(this.point1.controlPoint1.angle2);
      this.point1.controlPoint2.z = this.point1.z + this.point1.controlPoint2.dist * Math.sin(this.point1.controlPoint2.angle2);
      this.point2.z = this.point2.distFromCenter * Math.sin(this.point2.angle2);
      this.point2.controlPoint1.z = this.point2.z + this.point2.controlPoint1.dist * Math.sin(this.point2.controlPoint1.angle2);
      this.point2.controlPoint2.z = this.point2.z + this.point2.controlPoint2.dist * Math.sin(this.point2.controlPoint2.angle2);
    }
  }
};
var InterpolatedLoops = class {
  constructor({
    morphSpeed = 4e-5,
    dimensions = 2,
    random = Math.random,
    noiseSeedGenerator = Math.random,
    pointMaxDistFromCenter = 1,
    controlPointMaxDist = 0.7,
    controlPointAngle1Offset = 0,
    endpointAngle1Offset = 0,
    controlPointAngle2Offset = 0,
    endpointAngle2Offset = 0,
    loops = 100,
    convolutions = 2,
    morphs = 1
  }) {
    this.morphSpeed = morphSpeed;
    const settings = { random, dimensions, pointMaxDistFromCenter, controlPointMaxDist, controlPointAngle1Offset, endpointAngle1Offset, controlPointAngle2Offset, endpointAngle2Offset, loops, convolutions, morphs };
    this.loops = [];
    const firstLoop = new Loop(settings);
    firstLoop.totalInterpolationValue = 0;
    this.loops.push(firstLoop);
    const referencePointLoops = [];
    for (let i = 0; i < settings.morphs; i++) {
      const loop = new Loop(settings);
      loop.totalInterpolationValue = (i + 1) / settings.morphs;
      referencePointLoops.push(loop);
    }
    const interpolatedLoopCount = settings.loops - 2;
    const interpolationInterval = 1 / (interpolatedLoopCount + 1);
    const totalLoops = 1 + settings.morphs + settings.morphs * interpolatedLoopCount;
    const totalInterpolationInterval = 1 / (totalLoops - 1);
    for (let i = 0; i < settings.morphs; i++) {
      const firstLoopInMorph = this.loops[this.loops.length - 1];
      const lastLoopInMorph = referencePointLoops[i];
      for (let j = 1; j <= interpolatedLoopCount; j++) {
        const linearInterpolationValue = interpolationInterval * j;
        const interpolatedLoop = new Loop(settings);
        InterpolatedLoops.interpolateLoop(interpolatedLoop, firstLoopInMorph, lastLoopInMorph, linearInterpolationValue);
        interpolatedLoop.totalInterpolationValue = this.loops[this.loops.length - 1].totalInterpolationValue + totalInterpolationInterval;
        this.loops.push(interpolatedLoop);
      }
      this.loops.push(lastLoopInMorph);
    }
    this.update();
    this.noiseGenerators = [];
    for (let i = 0; i < 24; i++) {
      this.noiseGenerators.push(new SimplexNoise(noiseSeedGenerator()));
    }
  }
  static interpolateLoop(interpolatedLoop, firstLoop, lastLoop, t) {
    interpolatedLoop.point1.angle1Seed = lerp(firstLoop.point1.angle1Seed, lastLoop.point1.angle1Seed, t);
    interpolatedLoop.point1.distFromCenterSeed = lerp(firstLoop.point1.distFromCenterSeed, lastLoop.point1.distFromCenterSeed, t);
    interpolatedLoop.point1.controlPoint1.angle1Seed = lerp(firstLoop.point1.controlPoint1.angle1Seed, lastLoop.point1.controlPoint1.angle1Seed, t);
    interpolatedLoop.point1.controlPoint1.distSeed = lerp(firstLoop.point1.controlPoint1.distSeed, lastLoop.point1.controlPoint1.distSeed, t);
    interpolatedLoop.point1.controlPoint2.distSeed = lerp(firstLoop.point1.controlPoint2.distSeed, lastLoop.point1.controlPoint2.distSeed, t);
    interpolatedLoop.point2.distFromCenterSeed = lerp(firstLoop.point2.distFromCenterSeed, lastLoop.point2.distFromCenterSeed, t);
    interpolatedLoop.point2.controlPoint1.angle1Seed = lerp(firstLoop.point2.controlPoint1.angle1Seed, lastLoop.point2.controlPoint1.angle1Seed, t);
    interpolatedLoop.point2.controlPoint1.distSeed = lerp(firstLoop.point2.controlPoint1.distSeed, lastLoop.point2.controlPoint1.distSeed, t);
    interpolatedLoop.point2.controlPoint2.distSeed = lerp(firstLoop.point2.controlPoint2.distSeed, lastLoop.point2.controlPoint2.distSeed, t);
    if (interpolatedLoop.dimensions === 3) {
      interpolatedLoop.point1.angle2Seed = lerp(firstLoop.point1.angle2Seed, lastLoop.point1.angle2Seed, t);
      interpolatedLoop.point1.controlPoint1.angle2Seed = lerp(firstLoop.point1.controlPoint1.angle2Seed, lastLoop.point1.controlPoint1.angle2Seed, t);
      interpolatedLoop.point2.controlPoint1.angle2Seed = lerp(firstLoop.point2.controlPoint1.angle2Seed, lastLoop.point2.controlPoint1.angle2Seed, t);
    }
  }
  update() {
    this.loops.forEach((loop) => {
      loop.calculate();
      if (!loop.curve1 && !loop.curve2) {
        loop.assignCurves();
      }
      loop.updateCurves();
    });
  }
  generateMeshVertices() {
    const loopPointsStacked = [];
    this.loops.forEach((loop) => loopPointsStacked.push([...loop.curve1.getPoints(50), ...loop.curve2.getPoints(50)]));
    const meshVertices = [];
    for (let i = 0; i < loopPointsStacked.length - 1; i++) {
      const firstLoopVertices = loopPointsStacked[i];
      const secondLoopVertices = loopPointsStacked[i + 1];
      for (let j = 0; j < loopPointsStacked[i].length - 1; j++) {
        meshVertices.push(firstLoopVertices[j], secondLoopVertices[j], secondLoopVertices[j + 1], secondLoopVertices[j + 1], firstLoopVertices[j + 1], firstLoopVertices[j]);
      }
    }
    const position = [];
    meshVertices.forEach((point) => position.push(point.x, point.y, point.z));
    return Float32Array.from(position);
  }
  morph() {
    const firstLoop = this.loops[0];
    const lastLoop = this.loops[this.loops.length - 1];
    const time = Date.now() * this.morphSpeed;
    [
      firstLoop.point1.angle1Seed,
      firstLoop.point1.distFromCenterSeed,
      firstLoop.point1.controlPoint1.angle1Seed,
      firstLoop.point1.controlPoint1.distSeed,
      firstLoop.point1.controlPoint2.distSeed,
      firstLoop.point2.distFromCenterSeed,
      firstLoop.point2.controlPoint1.angle1Seed,
      firstLoop.point2.controlPoint1.distSeed,
      firstLoop.point2.controlPoint2.distSeed,
      firstLoop.point1.angle2Seed,
      firstLoop.point1.controlPoint1.angle2Seed,
      firstLoop.point2.controlPoint1.angle2Seed,
      lastLoop.point1.angle1Seed,
      lastLoop.point1.distFromCenterSeed,
      lastLoop.point1.controlPoint1.angle1Seed,
      lastLoop.point1.controlPoint1.distSeed,
      lastLoop.point1.controlPoint2.distSeed,
      lastLoop.point2.distFromCenterSeed,
      lastLoop.point2.controlPoint1.angle1Seed,
      lastLoop.point2.controlPoint1.distSeed,
      lastLoop.point2.controlPoint2.distSeed,
      lastLoop.point1.angle2Seed,
      lastLoop.point1.controlPoint1.angle2Seed,
      lastLoop.point2.controlPoint1.angle2Seed
    ] = this.noiseGenerators.map((ng) => (ng.noise2D(1, time) + 1) / 2);
    const interpolatedLoopCount = this.loops.length - 2;
    const interpolationInterval = 1 / (interpolatedLoopCount + 1);
    for (let i = 1; i <= interpolatedLoopCount; i++) {
      const linearInterpolationValue = interpolationInterval * i;
      const interpolatedLoop = this.loops[i];
      InterpolatedLoops.interpolateLoop(interpolatedLoop, firstLoop, lastLoop, linearInterpolationValue);
    }
  }
};
var MorphingLoops = class {
  constructor({
    material = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    }),
    random = Math.random,
    noiseSeedGenerator = Math.random,
    morphSpeed = 4e-5,
    pointMaxDistFromCenter = 1,
    controlPointMaxDist = 0.7,
    controlPointAngle1Offset = 0,
    endpointAngle1Offset = 0,
    controlPointAngle2Offset = 0,
    endpointAngle2Offset = 0,
    loops = 100,
    convolutions = 2,
    morphs = 1
  } = {}) {
    const loopsSettings = { morphSpeed, pointMaxDistFromCenter, controlPointMaxDist, controlPointAngle1Offset, endpointAngle1Offset, controlPointAngle2Offset, endpointAngle2Offset, loops, convolutions, morphs };
    this.material = material;
    this.interpolatedLoops = new InterpolatedLoops({ dimensions: 3, random, noiseSeedGenerator, ...loopsSettings });
    const meshVertices = this.interpolatedLoops.generateMeshVertices();
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(meshVertices, 3));
    this.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    this.geometry = mergeVertices(this.geometry);
    addMergedVerticesMap(this.geometry);
    this.geometry.computeVertexNormals();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  update() {
    this.interpolatedLoops.morph();
    this.interpolatedLoops.update();
    updateMergedVertices(this.mesh.geometry, this.interpolatedLoops.generateMeshVertices());
  }
};
var Strip = class {
  constructor(firstLoop, secondLoop, {
    random = Math.random,
    stripSpeed = 1e-4,
    stripSpeedVariation = 0.8,
    stripDisplayThreshold = 0,
    stripMinLength = 0.05,
    stripMaxLength = 0.1,
    curvePoints = 150
  } = {}) {
    this.firstLoop = firstLoop;
    this.secondLoop = secondLoop;
    this.speedVariation = stripSpeedVariation * 2 * random() - stripSpeedVariation;
    this.length = (stripMaxLength - stripMinLength) * random() + stripMinLength;
    this.position = random() + tNow(1 / (stripSpeed * (1 + this.speedVariation) * 1e3) * 1e3);
    this.displayThreshold = random();
    this.displayed = this.displayThreshold >= stripDisplayThreshold;
    this.points = Math.round(this.length * curvePoints);
    this.colorSeed = random();
  }
  generateVertices() {
    const topPoints = [];
    const bottomPoints = [];
    const interval = this.length / (this.points - 1);
    for (let i = 0; i < this.points; i++) {
      const t = (i * interval + this.position) % 1;
      topPoints.push(this.firstLoop.curvePath.getPoint(t));
      bottomPoints.push(this.secondLoop.curvePath.getPoint(t));
    }
    const stripVertices = [];
    for (let i = 0; i < topPoints.length - 1; i++) {
      const NW = topPoints[i];
      const SW = bottomPoints[i];
      const SE = bottomPoints[i + 1];
      const NE = topPoints[i + 1];
      stripVertices.push(NW, SW, SE, SE, NE, NW);
    }
    const stripVerticesDecomposed = [];
    stripVertices.forEach((stripVertex) => {
      stripVerticesDecomposed.push(stripVertex.x, stripVertex.y, stripVertex.z);
    });
    return Float32Array.from(stripVerticesDecomposed);
  }
};
var MorphingStrips = class {
  constructor({
    interpolatedLoops,
    material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    random = Math.random,
    stripSpeed = 1e-4,
    stripSpeedVariation = 0.8,
    stripDisplayThreshold = 0,
    stripMinLength = 0.05,
    stripMaxLength = 0.1,
    curvePoints = 150
  } = {}) {
    if (interpolatedLoops) {
      this.interpolatedLoops = interpolatedLoops;
      this.independent = false;
    } else {
      this.interpolatedLoops = new InterpolatedLoops({ dimensions: 3 });
      this.independent = true;
    }
    this.material = material;
    this.stripSettings = { stripSpeed, stripSpeedVariation, stripDisplayThreshold, stripMinLength, stripMaxLength, curvePoints };
    this.strips = [];
    this.meshes = [];
    this.group = new THREE.Group();
    for (let i = 0; i < this.interpolatedLoops.loops.length - 1; i++) {
      this.strips.push(new Strip(this.interpolatedLoops.loops[i], this.interpolatedLoops.loops[i + 1], { random, ...this.stripSettings }));
    }
    this.strips.forEach((strip) => {
      if (strip.displayed === true) {
        let stripGeometry = new THREE.BufferGeometry();
        stripGeometry.setAttribute("position", new THREE.BufferAttribute(strip.generateVertices(), 3));
        stripGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
        stripGeometry = mergeVertices(stripGeometry);
        addMergedVerticesMap(stripGeometry);
        stripGeometry.computeVertexNormals();
        const stripMesh = new THREE.Mesh(stripGeometry, this.material);
        stripMesh.userData.strip = strip;
        this.meshes.push(stripMesh);
        this.group.add(stripMesh);
      }
    });
    this.clock = new THREE.Clock();
  }
  update() {
    if (this.independent === true) {
      this.interpolatedLoops.morph();
      this.interpolatedLoops.update();
    }
    const delta = this.clock.getDelta();
    this.meshes.forEach((stripMesh) => {
      stripMesh.userData.strip.position += delta * 1e3 * this.stripSettings.stripSpeed * (1 + stripMesh.userData.strip.speedVariation);
      const newVertices = stripMesh.userData.strip.generateVertices();
      updateMergedVertices(stripMesh.geometry, newVertices);
      stripMesh.geometry.computeBoundingBox();
      stripMesh.geometry.computeBoundingSphere();
    });
  }
};
export {
  InterpolatedLoops,
  Loop,
  MorphingLoops,
  MorphingStrips,
  Strip
};
/*!
Morphing Loops
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
