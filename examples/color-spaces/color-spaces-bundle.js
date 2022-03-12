// color-spaces.js
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";

// ../../modules/alea.js
function Alea() {
  return function(args) {
    let s0 = 0;
    let s1 = 0;
    let s2 = 0;
    let c = 1;
    if (args.length === 0) {
      args = [+new Date()];
    }
    let mash = Mash();
    s0 = mash(" ");
    s1 = mash(" ");
    s2 = mash(" ");
    for (let i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;
    const random = function() {
      const t = 2091639 * s0 + c * 23283064365386963e-26;
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
    random.uint32 = function() {
      return random() * 4294967296;
    };
    random.fract53 = function() {
      return random() + (random() * 2097152 | 0) * 11102230246251565e-32;
    };
    random.version = "Alea 0.9";
    random.args = args;
    random.exportState = function() {
      return [s0, s1, s2, c];
    };
    random.importState = function(i) {
      s0 = +i[0] || 0;
      s1 = +i[1] || 0;
      s2 = +i[2] || 0;
      c = +i[3] || 0;
    };
    return random;
  }(Array.prototype.slice.call(arguments));
}
function Mash() {
  let n = 4022871197;
  const mash = function(data) {
    data = data.toString();
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 4294967296;
    }
    return (n >>> 0) * 23283064365386963e-26;
  };
  mash.version = "Mash 0.9";
  return mash;
}

// ../../modules/color-conversion.js
var loop = (value, left, right) => {
  if (right === void 0) {
    right = left;
    left = 0;
  }
  if (left > right) {
    const tmp = right;
    right = left;
    left = tmp;
  }
  const frame = right - left;
  value = (value + left) % frame - left;
  if (value < left)
    value += frame;
  if (value > right)
    value -= frame;
  return value;
};
var clamp = (a, min, max) => max > min ? Math.max(Math.min(a, max), min) : Math.max(Math.min(a, min), max);
var convertColor = {
  rgb: {
    hsl([r, g, b]) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h;
      let s;
      const l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    },
    lab(rgb) {
      let r = rgb[0] / 255;
      let g = rgb[1] / 255;
      let b = rgb[2] / 255;
      let x;
      let y;
      let z;
      r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
      g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
      b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
      x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
      y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1;
      z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
      x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
      return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
    },
    hsi(rgb) {
      if (rgb[0] === rgb[1] && rgb[1] === rgb[2] && rgb[0] <= 255) {
        rgb[2] += 0.01;
        rgb[1] += 0.01;
      }
      if (rgb[0] === rgb[1] && rgb[1] === rgb[2] && rgb[0] >= 255) {
        rgb[2] -= 0.01;
        rgb[1] -= 0.01;
      }
      const sum = rgb[0] + rgb[1] + rgb[2];
      const r = rgb[0] / sum;
      const g = rgb[1] / sum;
      const b = rgb[2] / sum;
      let h = Math.acos(0.5 * (r - g + (r - b)) / Math.sqrt((r - g) * (r - g) + (r - b) * (g - b)));
      if (b > g) {
        h = 2 * Math.PI - h;
      }
      const s = 1 - 3 * Math.min(r, g, b);
      const i = sum / 3;
      return [h * 180 / Math.PI, s * 100, i];
    },
    hex([r, g, b]) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
      function decToHex(d) {
        const hex = d.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      }
      return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
    }
  },
  hsl: {
    rgb([h, s, l]) {
      h /= 360, s /= 100, l /= 100;
      let r;
      let g;
      let b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = function hue2rgb2(p2, q2, t) {
          if (t < 0)
            t += 1;
          if (t > 1)
            t -= 1;
          if (t < 1 / 6)
            return p2 + (q2 - p2) * 6 * t;
          if (t < 1 / 2)
            return q2;
          if (t < 2 / 3)
            return p2 + (q2 - p2) * (2 / 3 - t) * 6;
          return p2;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    },
    rgba(hsl, a) {
      const rgb = convertColor.hsl.rgb(hsl);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
    },
    hex: ([h, s, l]) => convertColor.rgb.hex(convertColor.hsl.rgb([h, s, l]))
  },
  lab: {
    rgb(lab) {
      let y = (lab[0] + 16) / 116;
      let x = lab[1] / 500 + y;
      let z = y - lab[2] / 200;
      let r;
      let g;
      let b;
      x = 0.95047 * (x * x * x > 8856e-6 ? x * x * x : (x - 16 / 116) / 7.787);
      y = 1 * (y * y * y > 8856e-6 ? y * y * y : (y - 16 / 116) / 7.787);
      z = 1.08883 * (z * z * z > 8856e-6 ? z * z * z : (z - 16 / 116) / 7.787);
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : 12.92 * r;
      g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : 12.92 * g;
      b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : 12.92 * b;
      return [Math.round(Math.max(0, Math.min(1, r)) * 255), Math.round(Math.max(0, Math.min(1, g)) * 255), Math.round(Math.max(0, Math.min(1, b)) * 255)];
    },
    hex: ([l, a, b]) => convertColor.rgb.hex(convertColor.lab.rgb([l, a, b]))
  },
  hsi: {
    rgb(hsi) {
      let h = loop(hsi[0], 0, 360) * Math.PI / 180;
      const s = clamp(hsi[1], 0, 100) / 100;
      const i = clamp(hsi[2], 0, 255) / 255;
      const pi3 = Math.PI / 3;
      let r;
      let g;
      let b;
      if (h < 2 * pi3) {
        b = i * (1 - s);
        r = i * (1 + s * Math.cos(h) / Math.cos(pi3 - h));
        g = i * (1 + s * (1 - Math.cos(h) / Math.cos(pi3 - h)));
      } else if (h < 4 * pi3) {
        h -= 2 * pi3;
        r = i * (1 - s);
        g = i * (1 + s * Math.cos(h) / Math.cos(pi3 - h));
        b = i * (1 + s * (1 - Math.cos(h) / Math.cos(pi3 - h)));
      } else {
        h -= 4 * pi3;
        g = i * (1 - s);
        b = i * (1 + s * Math.cos(h) / Math.cos(pi3 - h));
        r = i * (1 + s * (1 - Math.cos(h) / Math.cos(pi3 - h)));
      }
      return [r * 255, g * 255, b * 255];
    }
  },
  hex: {
    rgb(hex) {
      hex = hex.substring(1);
      const dec = parseInt(hex, 16);
      const r = dec >> 16 & 255;
      const g = dec >> 8 & 255;
      const b = dec & 255;
      return [r, g, b];
    },
    rgba(hex, a) {
      const rgb = convertColor.hex.rgb(hex);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
    },
    hsl: (hex) => convertColor.rgb.hsl(convertColor.hex.rgb(hex)),
    lab: (hex) => convertColor.rgb.lab(convertColor.hex.rgb(hex))
  }
};
var color_conversion_default = convertColor;

// ../../modules/TimedRandomNumbers.js
var TimedRandomNumbers = class {
  constructor({
    intervalLength,
    intervalsInCycle,
    startTime = 0,
    seed = 42,
    cycleDuration = 60 * 60 * 1e3
  }) {
    this.startTime = startTime;
    this.seed = seed;
    this.cycleDuration = cycleDuration;
    if (typeof intervalLength !== "undefined") {
      this.intervalLength = intervalLength;
      this.intervalsInCycle = this.cycleDuration / this.intervalLength;
    } else if (typeof intervalsInCycle !== "undefined") {
      this.intervalsInCycle = intervalsInCycle;
      this.intervalLength = this.cycleDuration / this.intervalsInCycle;
    } else {
      throw new Error("Must specify either intervalLength or intervalsInCycle");
    }
    this.prng = new Alea(this.seed);
    this.randomNumbers = [];
    for (let i = 0; i < this.intervalsInCycle; i++) {
      this.randomNumbers.push(this.prng());
    }
    this.latestRandomNumber = this.previousRandomNumber();
  }
  indexInCurrentCycle() {
    const timeSinceStartTime = Date.now() - this.startTime;
    const cyclesSinceStartTime = timeSinceStartTime / this.cycleDuration;
    const currentCycleElapsed = cyclesSinceStartTime - Math.floor(cyclesSinceStartTime);
    return Math.floor(this.intervalsInCycle * currentCycleElapsed);
  }
  currentRandomNumber() {
    return this.randomNumbers[this.indexInCurrentCycle()];
  }
  previousRandomNumber() {
    let index = this.indexInCurrentCycle() - 1;
    if (index < 0) {
      index = this.randomNumbers.length - 1;
    }
    return this.randomNumbers[index];
  }
  update() {
    const currentRandomNumber = this.currentRandomNumber();
    if (currentRandomNumber === this.latestRandomNumber) {
      return false;
    }
    this.latestRandomNumber = currentRandomNumber;
    return currentRandomNumber;
  }
  timer(callback, checkInterval = 100) {
    return setInterval(() => {
      const randomNumber = this.update();
      if (typeof randomNumber === "number") {
        callback(randomNumber);
      }
    }, checkInterval);
  }
};
var TimedRandomNumbers_default = TimedRandomNumbers;

// color-spaces.js
var ColorSpaces = class {
  constructor({
    spheresPerAxis = 9,
    sphereRadius = 0.095,
    plotBy = "hsl",
    colorSelection = { space: "hsl", spacing: "even" },
    alignSelectionAndPlotting = false,
    transformDuration = 1e4,
    pauseDuration = 5e3,
    width = 10,
    onlyEven = true
  } = {}) {
    this.settings = { spheresPerAxis, sphereRadius, plotBy, colorSelection, alignSelectionAndPlotting, transformDuration, pauseDuration, width, onlyEven };
    let spheresAdded = false;
    this.allColorValues = [];
    this.previousCombination = { plotBy: null, colorSelection: { space: null, spacing: null } };
    this.currentCombination = { plotBy: null, colorSelection: { space: null, spacing: null } };
    this.spheres = [];
    this.group = new THREE.Group();
    this.colorSpaces = [
      {
        name: "rgb",
        components: [{ name: "r", min: 0, max: 255 }, { name: "g", min: 0, max: 255 }, { name: "b", min: 0, max: 255 }]
      },
      {
        name: "hsl",
        components: [{ name: "h", min: 0, max: 360 }, { name: "s", min: 0, max: 100 }, { name: "l", min: 0, max: 100 }]
      },
      {
        name: "lab",
        components: [{ name: "ll", min: 0, max: 100 }, { name: "aa", min: -128, max: 127 }, { name: "bb", min: -128, max: 127 }]
      },
      {
        name: "hsi",
        components: [{ name: "h3", min: 0, max: 360 }, { name: "s3", min: 0, max: 100 }, { name: "i3", min: 0, max: 255 }]
      }
    ];
    const trn = new TimedRandomNumbers_default({ intervalLength: this.settings.transformDuration + this.settings.pauseDuration });
    trn.timer((randomNumber) => {
      this.prng = new Alea(randomNumber);
      this.setColorSpaceCombination();
      this.generateColorValues();
      if (spheresAdded === false) {
        this.addSpheres();
        spheresAdded = true;
      }
      this.transformSpheres();
    }, 100);
  }
  generateColorValues() {
    this.allColorValues = [];
    const spacesAdded = [this.settings.colorSelection.space, "rgb"];
    for (let ii = 0; ii < this.settings.spheresPerAxis; ii++) {
      for (let jj = 0; jj < this.settings.spheresPerAxis; jj++) {
        for (let kk = 0; kk < this.settings.spheresPerAxis; kk++) {
          const colorData = {};
          const baseComponents = [];
          for (let i = 0; i < this.colorSpaces.length; i++) {
            if (this.settings.colorSelection.space === this.colorSpaces[i].name) {
              if (this.settings.colorSelection.spacing === "even") {
                colorData[this.colorSpaces[i].components[0].name] = (this.colorSpaces[i].components[0].max - this.colorSpaces[i].components[0].min) / this.settings.spheresPerAxis * ii + this.colorSpaces[i].components[0].min;
                colorData[this.colorSpaces[i].components[1].name] = (this.colorSpaces[i].components[1].max - this.colorSpaces[i].components[1].min) / this.settings.spheresPerAxis * jj + this.colorSpaces[i].components[1].min;
                colorData[this.colorSpaces[i].components[2].name] = (this.colorSpaces[i].components[2].max - this.colorSpaces[i].components[2].min) / this.settings.spheresPerAxis * kk + this.colorSpaces[i].components[2].min;
              } else if (this.settings.colorSelection.spacing === "random") {
                colorData[this.colorSpaces[i].components[0].name] = (this.colorSpaces[i].components[0].max - this.colorSpaces[i].components[0].min) * this.prng() + this.colorSpaces[i].components[0].min;
                colorData[this.colorSpaces[i].components[1].name] = (this.colorSpaces[i].components[1].max - this.colorSpaces[i].components[1].min) * this.prng() + this.colorSpaces[i].components[1].min;
                colorData[this.colorSpaces[i].components[2].name] = (this.colorSpaces[i].components[2].max - this.colorSpaces[i].components[2].min) * this.prng() + this.colorSpaces[i].components[2].min;
              }
              baseComponents[0] = colorData[this.colorSpaces[i].components[0].name];
              baseComponents[1] = colorData[this.colorSpaces[i].components[1].name];
              baseComponents[2] = colorData[this.colorSpaces[i].components[2].name];
            }
          }
          if (this.settings.colorSelection.space !== "rgb") {
            const rgbValues = color_conversion_default[this.settings.colorSelection.space].rgb(baseComponents);
            colorData.r = rgbValues[0];
            colorData.g = rgbValues[1];
            colorData.b = rgbValues[2];
          }
          for (let i = 0; i < this.colorSpaces.length; i++) {
            if (this.colorSpaces[i].name === this.settings.plotBy && !spacesAdded.includes(this.settings.plotBy)) {
              const temp = color_conversion_default.rgb[this.settings.plotBy]([colorData.r, colorData.g, colorData.b]);
              colorData[this.colorSpaces[i].components[0].name] = temp[0];
              colorData[this.colorSpaces[i].components[1].name] = temp[1];
              colorData[this.colorSpaces[i].components[2].name] = temp[2];
            }
          }
          this.allColorValues.push(colorData);
        }
      }
    }
  }
  addSpheres() {
    const shpereGeometry = new THREE.SphereGeometry(this.settings.sphereRadius, 32, 32);
    for (let i = 0; i < this.allColorValues.length; i++) {
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: `rgb(${Math.floor(this.allColorValues[i].r)}, ${Math.floor(this.allColorValues[i].g)}, ${Math.floor(this.allColorValues[i].b)})` });
      this.spheres[i] = new THREE.Mesh(shpereGeometry, sphereMaterial);
      for (let j = 0; j < this.colorSpaces.length; j++) {
        if (this.colorSpaces[j].name === this.settings.plotBy) {
          this.spheres[i].position.x = (this.allColorValues[i][this.colorSpaces[j].components[0].name] - this.colorSpaces[j].components[0].min) / (this.colorSpaces[j].components[0].max - this.colorSpaces[j].components[0].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2;
          this.spheres[i].position.y = (this.allColorValues[i][this.colorSpaces[j].components[1].name] - this.colorSpaces[j].components[1].min) / (this.colorSpaces[j].components[1].max - this.colorSpaces[j].components[1].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2;
          this.spheres[i].position.z = (this.allColorValues[i][this.colorSpaces[j].components[2].name] - this.colorSpaces[j].components[2].min) / (this.colorSpaces[j].components[2].max - this.colorSpaces[j].components[2].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2;
        }
      }
      this.group.add(this.spheres[i]);
    }
  }
  transformSpheres() {
    for (let i = 0; i < this.spheres.length; i++) {
      new TWEEN.Tween(this.spheres[i].material.color).to({ r: this.allColorValues[i].r / 255, g: this.allColorValues[i].g / 255, b: this.allColorValues[i].b / 255 }, this.settings.transformDuration).easing(TWEEN.Easing.Cubic.InOut).start();
      const tween = new TWEEN.Tween(this.spheres[i].position);
      for (let j = 0; j < this.colorSpaces.length; j++) {
        if (this.colorSpaces[j].name === this.settings.plotBy) {
          tween.to(new THREE.Vector3((this.allColorValues[i][this.colorSpaces[j].components[0].name] - this.colorSpaces[j].components[0].min) / (this.colorSpaces[j].components[0].max - this.colorSpaces[j].components[0].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2, (this.allColorValues[i][this.colorSpaces[j].components[1].name] - this.colorSpaces[j].components[1].min) / (this.colorSpaces[j].components[1].max - this.colorSpaces[j].components[1].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2, (this.allColorValues[i][this.colorSpaces[j].components[2].name] - this.colorSpaces[j].components[2].min) / (this.colorSpaces[j].components[2].max - this.colorSpaces[j].components[2].min) * (this.settings.width / ((this.settings.spheresPerAxis - 1) / this.settings.spheresPerAxis)) - this.settings.width / 2), this.settings.transformDuration).easing(TWEEN.Easing.Cubic.InOut).start();
        }
      }
    }
  }
  setColorSpaceCombination() {
    const coordinateOptions = ["rgb", "hsl", "lab", "hsi"];
    const colorDistSpaceOptions = ["rgb", "hsl", "lab", "hsi"];
    const colorDistSpacingOptions = this.settings.onlyEven === false ? ["even", "random"] : ["even"];
    const avoidCombinations = [{ plotBy: "hsl", colorSelectionSpace: "hsi" }, { plotBy: "hsl", colorSelectionSpace: "lab" }, { plotBy: "hsi", colorSelectionSpace: "lab" }];
    const selectNewCombination = () => {
      this.settings.plotBy = coordinateOptions[Math.floor(this.prng() * coordinateOptions.length)];
      this.settings.colorSelection.space = colorDistSpaceOptions[Math.floor(this.prng() * colorDistSpaceOptions.length)];
      this.settings.colorSelection.spacing = colorDistSpacingOptions[Math.floor(this.prng() * colorDistSpacingOptions.length)];
      for (let i = 0; i < avoidCombinations.length; i++) {
        if (this.settings.plotBy === avoidCombinations[i].plotBy && this.settings.colorSelection.space === avoidCombinations[i].colorSelectionSpace) {
          selectNewCombination();
          break;
        }
      }
      if (this.settings.plotBy === this.currentCombination.plotBy && this.settings.colorSelection.space === this.currentCombination.colorSelection.space && this.settings.colorSelection.spacing === this.currentCombination.colorSelection.spacing) {
        selectNewCombination();
      } else if (this.settings.plotBy === this.previousCombination.plotBy && this.settings.colorSelection.space === this.previousCombination.colorSelection.space && this.settings.colorSelection.spacing === this.previousCombination.colorSelection.spacing) {
        selectNewCombination();
      } else if (this.settings.plotBy === this.settings.colorSelection.space && this.currentCombination.plotBy === this.currentCombination.colorSelection.space && this.settings.colorSelection.spacing === "even" && this.currentCombination.colorSelection.spacing === "even") {
        selectNewCombination();
      } else {
        this.previousCombination.plotBy = this.currentCombination.plotBy;
        this.previousCombination.colorSelection.space = this.currentCombination.colorSelection.space;
        this.previousCombination.colorSelection.spacing = this.currentCombination.colorSelection.spacing;
        this.currentCombination.plotBy = this.settings.plotBy;
        this.currentCombination.colorSelection.space = this.settings.colorSelection.space;
        this.currentCombination.colorSelection.spacing = this.settings.colorSelection.spacing;
      }
    };
    selectNewCombination();
  }
  static update() {
    TWEEN.update();
  }
};
export {
  ColorSpaces as default
};
/*!
Alea
Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
https://github.com/coverslide/node-alea
*/
/*!
Color Spaces
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
/*!
Color conversion algorithms from various online sources
*/
/*!
Timed Random Numbers
Copyright 2022, Anthony DePasquale (anthony@depasquale.org)
*/
