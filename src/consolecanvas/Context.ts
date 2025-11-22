import { Canvas } from "./Canvas";
import bresenham from "bresenham";
import * as glMatrix from "gl-matrix";
import { vec2 as Point, mat2d as TransformMatrix } from 'gl-matrix';
import earcut from 'earcut';
import { triangle, quad } from "./shapes";
import { Color } from "./Color";
import webColors from "./webColors";

const mat2d = glMatrix.mat2d;
const vec2 = glMatrix.vec2;

type PathVertex = {
    point: Point,
    stroke: boolean;
};

type ImageData = {
    data: string;
    width: number;
    height: number;
};

function clamp(value: number, min: number, max: number) {
    return Math.round(Math.min(Math.max(value, min), max));
};

export const DRAWMODE_BACKGROUND = "bg";
export const DRAWMODE_FOREGROUND = "fg";
export const DRAWMODE_BOTH = "bg fg";
export const DRAWMODE_FILLBG_STROKEFG = "fill(bg) stroke(fg)";

class Context {
    private _canvas: Canvas;
    private _matrix: TransformMatrix;
    private _stack: TransformMatrix[] = [];
    private _currentPath: PathVertex[] = [];
    private _strokeColor: Color | undefined = [255, 255, 255];
    private _fillColor: Color | undefined = [100, 100, 100];

    private _drawMode: string = "";
    private _strokePixel = (x: number, y: number) => { };
    private _fillPixel = (x: number, y: number) => { };
    private debugString = "";

    public textAlign = "left";

    constructor(canvas: Canvas) {
        this._canvas = canvas;
        this._matrix = mat2d.create();
        this.drawMode = DRAWMODE_FOREGROUND;
    }

    get canvas() {
        return this._canvas;
    }

    get aspectRatio() {
        // Assuming a character's height is twice the width
        return this._canvas.blockSize.x / this._canvas.blockSize.y * 2;
    }
    set drawMode(mode: string) {
        this._drawMode = mode;
        if (this._drawMode == DRAWMODE_FOREGROUND) {
            this._fillPixel = (x, y) => {
                this._canvas.setPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setPixel(x, y, this._strokeColor);
            };
        }
        if (this._drawMode == DRAWMODE_BACKGROUND) {
            this._fillPixel = (x, y) => {
                this._canvas.setBgPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setBgPixel(x, y, this._strokeColor);
            };
        }
        if (this._drawMode == DRAWMODE_BOTH) {
            this._fillPixel = (x, y) => {
                this._canvas.setPixel(x, y, this._fillColor);
                this._canvas.setBgPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setPixel(x, y, this._strokeColor);
                this._canvas.setBgPixel(x, y, this._strokeColor);
            };
        }
        if (this._drawMode == DRAWMODE_FILLBG_STROKEFG) {
            this._fillPixel = (x, y) => {
                this._canvas.setPixel(x, y, undefined);
                this._canvas.setBgPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setPixel(x, y, this._strokeColor);
                //this._canvas.setBgPixel(x, y, this._strokeColor);
            };
        }

    }

    set fillStyle(style: string) {
        this._fillColor = this.parseColor(style);
    }
    set strokeStyle(style: string) {
        this._strokeColor = this.parseColor(style);
    }

    private parseColor(style: string | Color): Color | undefined {
        if (Array.isArray(style)) {
            return <Color>style;
        }
        if (typeof style === "string") {
            if (style.startsWith("rgb(")) {
                const rgb = style.substring(4, style.length - 1);
                const color: Color = <Color>(rgb.split(",").map((s) => +s));
                return color;
            }
            if (style.startsWith("rgba(")) {
                const rgb = style.substring(5, style.length - 1);
                const color: Color = <Color>(rgb.split(",").map((s) => +s));
                return color;
            }
            if (style.startsWith("#")) {
                const r = style.substring(1, 3);
                const g = style.substring(3, 5);
                const b = style.substring(5, 7);
                return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
            }
            if (webColors[style.toUpperCase()]) {
                return webColors[style.toUpperCase()];
            }
        }
        return undefined;
    }


    set width(width) {
        this._canvas.width = width;
    }

    get width() {
        return this._canvas.width;
    }

    set height(height) {
        this._canvas.height = height;
    }

    get height() {
        return this._canvas.height;
    }

    // setColor(rgb: Color | undefined) {
    //     this._color = rgb;
    // }
    // setBgColor(rgb: Color | undefined) {
    //     this._bgColor = rgb;
    // }

    clear() {
        this._canvas.clear();
    }

    clearRect(x: number, y: number, w: number, h: number) {
        quad(this._matrix, x, y, w, h, this._canvas.clearPixel.bind(this._canvas), [0, 0, this.width, this.height]);
    }

    fillRect(x: number, y: number, w: number, h: number) {
        quad(this._matrix, x, y, w, h, this._fillPixel.bind(this), [0, 0, this.width, this.height]);
    }

    fill() {
        if (this._currentPath[this._currentPath.length - 1].point !== this._currentPath[0].point) {
            this.closePath();
        }

        var vertices: number[] = [];

        this._currentPath.forEach(function (pt: PathVertex) {
            vertices.push(pt.point[0], pt.point[1]);
        });

        var triangleIndices = earcut(vertices);

        var p1, p2, p3;
        for (var i = 0; i < triangleIndices.length; i = i + 3) {
            p1 = vec2.fromValues(vertices[triangleIndices[i] * 2], vertices[triangleIndices[i] * 2 + 1]);
            p2 = vec2.fromValues(vertices[triangleIndices[i + 1] * 2], vertices[triangleIndices[i + 1] * 2 + 1]);
            p3 = vec2.fromValues(vertices[triangleIndices[i + 2] * 2], vertices[triangleIndices[i + 2] * 2 + 1]);
            triangle(p1, p2, p3, this._fillPixel.bind(this), [0, 0, this.width, this.height]);
        }
    }

    strokeRect(x: number, y: number, w: number, h: number) {
        var fromX = clamp(x, 0, this.width),
            fromY = clamp(y, 0, this.height),
            toX = clamp(x + w, 0, this.width),
            toY = clamp(y + h, 0, this.height);

        var set = this._strokePixel.bind(this);

        bresenham(fromX, fromY, toX, fromY, set);
        bresenham(toX, fromY, toX, toY, set);
        bresenham(toX, toY, fromX, toY, set);
        bresenham(fromX, toY, fromX, fromY, set);
    }


    save() {
        this._stack.push(mat2d.clone(this._matrix));
    }

    restore() {
        var top = this._stack.pop();
        if (!top) return;
        this._matrix = top;
    }

    translate(x: number, y: number) {
        mat2d.translate(this._matrix, this._matrix, vec2.fromValues(x, y));
    }

    rotate(a: number) {
        mat2d.rotate(this._matrix, this._matrix, a / 180 * Math.PI);
    }

    scale(x: number, y: number) {
        mat2d.scale(this._matrix, this._matrix, vec2.fromValues(x, y));
    }

    beginPath() {
        this._currentPath = [];
    }

    closePath() {
        this._currentPath.push({
            point: this._currentPath[0].point,
            stroke: true
        });
    }

    stroke() {
        var set = this._strokePixel.bind(this);
        for (var i = 0; i < this._currentPath.length - 1; i++) {
            var cur = this._currentPath[i];
            var nex = this._currentPath[i + 1];
            if (nex.stroke) {
                bresenham(cur.point[0], cur.point[1], nex.point[0], nex.point[1], set);
            }
        }
    }

    moveTo(x: number, y: number) {
        this.addPoint(x, y, false);
    };

    lineTo(x: number, y: number) {
        this.addPoint(x, y, true);
    }

    arc(h: number, k: number, r: number, th1: number, th2: number, anticlockwise: boolean) {
        var x, y;
        var dth = Math.abs(Math.acos(1 / r) - Math.acos(2 / r));
        if (anticlockwise) {
            var tempth = th2;
            th2 = th1 + 2 * Math.PI;
            th1 = tempth;
        }
        th1 = th1 % (2 * Math.PI);
        if (th2 < th1) th2 = th2 + 2 * Math.PI;
        for (var th = th1; th <= th2; th = th + dth) {
            y = clamp(r * Math.sin(th) + k, 0, this.height);
            x = clamp(r * Math.cos(th) + h, 0, this.width);
            this.addPoint(x, y, true);
        }
    }

    private addPoint(x: number, y: number, stroke: boolean) {
        const matrix = this._matrix;
        const path = this._currentPath;
        var v = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), matrix);
        path.push({
            point: [Math.floor(v[0]), Math.floor(v[1])],
            stroke: stroke
        });
    }

    fillText(text: string, x: number, y: number) {
        const w = this._canvas.blockSize.x;
        const align = this.textAlign;
        let dist = 0;
        if (align == "right") {
            dist = -text.length * w;
        }
        if (align == "center") {
            dist = -text.length * w / 2;
        }
        for (var i = 0; i < text.length; i++) {
            this._canvas.setCharacter(x + dist + i * w, y, text.charAt(i), this._fillColor, undefined);
        }
    }

    measureText(text: string): TextMetrics {
        return {
            fontBoundingBoxAscent: this._canvas.blockSize.y,
            actualBoundingBoxAscent: this._canvas.blockSize.y,
            emHeightAscent: this._canvas.blockSize.y,
            fontBoundingBoxDescent: 0,
            actualBoundingBoxDescent: 0,
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 0,
            emHeightDescent: 0,
            alphabeticBaseline: this._canvas.blockSize.y,
            hangingBaseline: this._canvas.blockSize.y,
            ideographicBaseline: this._canvas.blockSize.y,
            width: text.length * this._canvas.blockSize.x
        };
    }
    getContext(_str: string) {
        return this;
    }

    toString() {
        const frame = this.debugString + this._canvas.frame("\n");
        this.debugString = "";
        return frame;
    }

    getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
        if (sx == null) sx = 0;
        if (sy == null) sy = 0;
        if (sw == null) sw = this.width;
        if (sh == null) sh = this.height;

        var result = {
            data: "",
            width: sw,
            height: sh
        } as ImageData;

        sx = Math.floor(sx / 2);
        sw = Math.floor(sw / 2);
        sy = Math.floor(sy / 4);
        sh = Math.floor(sh / 4);

        var delimiter = '\n';

        var data: string[] = this.toString().split(delimiter);

        const resultArray: string[] = [];

        for (var i = 0; i < sh; i++) {
            resultArray.push(data[sy + i].slice(sx, sx + sw));
        }

        result.data = resultArray.join(delimiter);

        return result;
    }

    putImageData(imageData: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number) {
        var delimiter = '\n';
        var data = imageData.data.split(delimiter);
        var height = imageData.height;
        var width = imageData.width;
        dirtyX = dirtyX || 0;
        dirtyY = dirtyY || 0;
        dirtyWidth = dirtyWidth !== undefined ? dirtyWidth : width;
        dirtyHeight = dirtyHeight !== undefined ? dirtyHeight : height;

        dirtyX = Math.floor(dirtyX / 2);
        dirtyY = Math.floor(dirtyY / 4);
        width = Math.floor(width / 2);
        height = Math.floor(height / 4);
        dirtyWidth = Math.floor(dirtyWidth / 2);
        dirtyHeight = Math.floor(dirtyHeight / 4);

        var limitBottom = dirtyY + dirtyHeight;
        var limitRight = dirtyX + dirtyWidth;
        for (var y = dirtyY; y < limitBottom; y++) {
            for (var x = dirtyX; x < limitRight; x++) {
                if (data[y][x] !== ' ') {
                    this.fillRect(x + dx, y + dy, 1, 1);
                }
            }
        }
    }

}

var methods = [
    'save', 'restore', 'scale', 'rotate', 'translate', 'transform', 'setTransform', 'resetTransform', 'createLinearGradient', 'createRadialGradient', 'createPattern', 'beginPath', 'fill', 'stroke', 'drawFocusIfNeeded', 'clip', 'isPointInPath', 'isPointInStroke', 'strokeText', 'measureText', 'drawImage', 'createImageData', 'getContextAttributes', 'setLineDash', 'getLineDash', 'setAlpha', 'setCompositeOperation', 'setLineWidth', 'setLineCap', 'setLineJoin', 'setMiterLimit', 'clearShadow', 'setStrokeColor', 'setFillColor', 'drawImageFromRect', 'setShadow', 'closePath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arcTo', 'rect', 'arc', 'ellipse'
];

methods.forEach(function (name) {
    if (!(Context as any).prototype[name]) (Context as any).prototype[name] = function () { };
});

export default Context;
