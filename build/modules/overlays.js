import './rounded-rectangle.js';
import * as THREE from 'three';
// External (not bundled)
// import * as THREE from '../lib/threejs/build/three.module.js';
// !! Maybe a better solution: https://threejs.org/examples/?q=sprite#webgl_sprites
// Text wrap: https://stackoverflow.com/a/16599668/9346232
function getLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(`${currentLine} ${word}`).width;
        if (width < maxWidth) {
            currentLine += ` ${word}`;
        }
        else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}
const pixelsPerMeter = 1024;
const makeCanvasCtx = (canvas, nominalWidth, nominalHeight) => {
    const scaleFactor = window.devicePixelRatio;
    canvas.width = nominalWidth * scaleFactor;
    canvas.height = nominalHeight * scaleFactor;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
        return ctx;
    }
    throw new Error('Could not find canvas');
};
const createTextProperties = ({ fontSize = 48, lineHeightRel = 1.15, margin = 20, fontColor = 'white', font = 'BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Helvetica, Arial, sans-serif', } = {}) => {
    const textProperties = {
        fontSize,
        font: `${fontSize}px ${font}`,
        lineHeightRel,
        lineHeight: fontSize * lineHeightRel,
        margin,
        fontColor,
    };
    // textProperties.font = textProperties.fontSize + 'px ' + textProperties.font;
    // textProperties.lineHeight = textProperties.fontSize * textProperties.lineHeightRel;
    return textProperties;
};
const getFinalNominalHeight = ({ text = '', overlayWidth = 0.75, textProperties = createTextProperties() }) => {
    const overlayHeight = 1; // Any arbitrary number will do
    const nominalWidth = pixelsPerMeter * overlayWidth;
    const nominalHeight = pixelsPerMeter * overlayHeight;
    const canvas = document.createElement('canvas');
    const ctx = makeCanvasCtx(canvas, nominalWidth, nominalHeight);
    if (ctx) {
        // Draw
        ctx.font = textProperties.font;
        const lines = getLines(ctx, text, (nominalWidth - (textProperties.margin * 2)));
        const finalNominalHeight = (lines.length * textProperties.lineHeight) + (textProperties.margin * 2) - (textProperties.lineHeight - textProperties.fontSize) + (textProperties.fontSize * 0.3);
        return finalNominalHeight;
    }
    throw new Error('Could not make canvas context');
};
const createImage = ({ text = '', nominalWidth = pixelsPerMeter * 0.75, textProperties = createTextProperties(), finalNominalHeight = getFinalNominalHeight({ text, overlayWidth: nominalWidth, textProperties }), backgroundColor = 'rgba(0, 0, 0, 0.6)', fitWidth = true, }) => {
    let canvas = document.createElement('canvas');
    let ctx = makeCanvasCtx(canvas, nominalWidth, finalNominalHeight);
    if (ctx) {
        // Draw
        ctx.fillStyle = backgroundColor;
        ctx.roundedRectangle(0, 0, nominalWidth, finalNominalHeight, 20); // https://newfivefour.com/javascript-canvas-rounded-rectangle.html
        ctx.fill();
        ctx.font = textProperties.font;
        ctx.fillStyle = textProperties.fontColor;
        const lines = getLines(ctx, text, (nominalWidth - (textProperties.margin * 2)));
        let fitNominalWidth;
        if (fitWidth === true && lines.length === 1) {
            fitNominalWidth = ctx.measureText(lines[0]).width + (textProperties.margin * 2);
            canvas = document.createElement('canvas');
            ctx = makeCanvasCtx(canvas, fitNominalWidth, finalNominalHeight);
            if (ctx) {
                ctx.fillStyle = backgroundColor;
                ctx.roundedRectangle(0, 0, fitNominalWidth, finalNominalHeight, 20); // https://newfivefour.com/javascript-canvas-rounded-rectangle.html
                ctx.fill();
                ctx.font = textProperties.font;
                ctx.fillStyle = textProperties.fontColor;
            }
            else {
                console.error('No canvas context was provided');
            }
        }
        if (ctx) {
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], textProperties.margin, textProperties.margin + textProperties.fontSize + (i * textProperties.lineHeight));
            }
        }
        else {
            console.error('No canvas context was provided');
        }
        return { imageData: canvas.toDataURL('image/png'), width: fitNominalWidth || nominalWidth };
    }
    throw new Error('Could not make canvas context');
};
const createOverlay = async ({ text = '', selectable = false, showActive = false, overlayWidth = 0.75, fitWidth = true, textProperties = createTextProperties(), }) => {
    const finalNominalHeight = getFinalNominalHeight({ text, overlayWidth, textProperties });
    if (finalNominalHeight) {
        const overlayHeight = finalNominalHeight / pixelsPerMeter;
        const loader = new THREE.TextureLoader();
        const standardImg = createImage({
            text, nominalWidth: pixelsPerMeter * overlayWidth, finalNominalHeight, textProperties: createTextProperties(), fitWidth, backgroundColor: undefined,
        });
        let standardTextureLoaded;
        let intersectedTextureLoaded;
        let activeStandardTextureLoaded;
        let activeIntersectedTextureLoaded;
        if (standardImg) {
            standardTextureLoaded = new Promise((resolveStandardTextureLoaded) => {
                loader.load(standardImg.imageData, (texture) => {
                    texture.minFilter = THREE.LinearFilter; // Prevents resizing to power of two, improves antialiasing
                    resolveStandardTextureLoaded(texture);
                });
            });
        }
        else {
            throw new Error('standardImg was not created');
        }
        if (selectable === true) {
            const intersectedImg = createImage({
                backgroundColor: 'rgba(76, 76, 76, 0.6)', text, nominalWidth: pixelsPerMeter * overlayWidth, finalNominalHeight, textProperties: createTextProperties(), fitWidth,
            });
            if (intersectedImg) {
                intersectedTextureLoaded = new Promise((resolveIntersectedTextureLoaded) => {
                    loader.load(intersectedImg.imageData, (texture) => {
                        texture.minFilter = THREE.LinearFilter; // Prevents resizing to power of two, improves antialiasing
                        resolveIntersectedTextureLoaded(texture);
                    });
                });
            }
            else {
                throw new Error('intersectedImg was not created');
            }
            if (showActive === true) {
                const activeStandardImg = createImage({
                    backgroundColor: 'rgba(255, 0, 0, 0.6)', text, nominalWidth: pixelsPerMeter * overlayWidth, finalNominalHeight, textProperties: createTextProperties(), fitWidth,
                });
                if (activeStandardImg) {
                    activeStandardTextureLoaded = new Promise((resolveActiveStandardTextureLoaded) => {
                        loader.load(activeStandardImg.imageData, (texture) => {
                            texture.minFilter = THREE.LinearFilter; // Prevents resizing to power of two, improves antialiasing
                            resolveActiveStandardTextureLoaded(texture);
                        });
                    });
                }
                else {
                    throw new Error('activeStandardImg was not created');
                }
                const activeIntersectedImg = createImage({
                    backgroundColor: 'rgba(255, 76, 76, 0.6)', text, nominalWidth: pixelsPerMeter * overlayWidth, finalNominalHeight, textProperties: createTextProperties(), fitWidth,
                });
                if (activeIntersectedImg) {
                    activeIntersectedTextureLoaded = new Promise((resolveActiveIntersectedTextureLoaded) => {
                        loader.load(activeIntersectedImg.imageData, (texture) => {
                            texture.minFilter = THREE.LinearFilter; // Prevents resizing to power of two, improves antialiasing
                            resolveActiveIntersectedTextureLoaded(texture);
                        });
                    });
                }
                else {
                    throw new Error('activeIntersectedImg was not created');
                }
            }
        }
        if (standardImg) {
            const overlayGeometry = new THREE.PlaneGeometry(standardImg.width / pixelsPerMeter, overlayHeight);
            const overlayMaterial = new THREE.MeshBasicMaterial({
                map: await standardTextureLoaded,
                transparent: true,
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
        throw new Error('standardImg was not loaded');
    }
    else {
        throw new Error('Could not calculate finalNominalHeight');
    }
};
export { createOverlay, createImage, createTextProperties };
