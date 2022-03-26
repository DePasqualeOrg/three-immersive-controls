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
interface CreateOverlayOptions {
    text: string;
    selectable?: boolean;
    showActive?: boolean;
    overlayWidth?: number;
    fitWidth?: boolean;
    textProperties?: TextProperties;
}
export declare const createOverlay: ({ text, selectable, showActive, overlayWidth, fitWidth, textProperties, }: CreateOverlayOptions) => Promise<THREE.Mesh>;
export {};
