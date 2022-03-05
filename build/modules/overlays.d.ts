import './rounded-rectangle.js';
import * as THREE from 'three';
declare global {
    export interface CanvasRenderingContext2D {
        roundedRectangle: (x: number, y: number, width: number, height: number, rounded: number) => void;
    }
}
interface TextProperties {
    fontSize: number;
    font: string;
    lineHeightRel: number;
    lineHeight: number;
    margin: number;
    fontColor: string;
}
interface CreateImageOptions {
    text: string;
    nominalWidth: number;
    textProperties: TextProperties;
    finalNominalHeight: number;
    backgroundColor: undefined | string;
    fitWidth: boolean;
}
interface ImageObject {
    imageData: string;
    width: number;
}
declare const createTextProperties: ({ fontSize, lineHeightRel, margin, fontColor, font, }?: {
    fontSize?: number | undefined;
    lineHeightRel?: number | undefined;
    margin?: number | undefined;
    fontColor?: string | undefined;
    font?: string | undefined;
}) => TextProperties;
declare const createImage: ({ text, nominalWidth, textProperties, finalNominalHeight, backgroundColor, fitWidth, }: CreateImageOptions) => ImageObject | undefined;
interface CreateOverlayOptions {
    text: string;
    selectable?: boolean;
    showActive?: boolean;
    overlayWidth?: number;
    fitWidth?: boolean;
    textProperties?: TextProperties;
}
declare const createOverlay: ({ text, selectable, showActive, overlayWidth, fitWidth, textProperties, }: CreateOverlayOptions) => Promise<THREE.Mesh>;
export { createOverlay, createImage, createTextProperties };
