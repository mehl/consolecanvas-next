import { Canvas } from "./Canvas";
import { mat2d, vec2 } from 'gl-matrix';
import { Color } from "./Color";
import webColors from "./webColors";
import { Path } from "./Path";

type ImageData = {
    data: string;
    width: number;
    height: number;
};

export enum DrawMode {
    BACKGROUND = "BACKGROUND",
    FOREGROUND = "FOREGROUND",
    BOTH = "BOTH",
    FILLBG_STROKEFG = "FILLBG_STROKEFG"
}

class Context {
    private _canvas: Canvas;
    private _matrix: mat2d;
    private _stack: mat2d[] = [];
    private _currentPath: Path = new Path();
    private _strokeColor: Color | undefined = [255, 255, 255];
    private _fillColor: Color | undefined = [100, 100, 100];

    private _drawMode: DrawMode = DrawMode.FOREGROUND;
    private _strokePixel = (x: number, y: number) => { };
    private _fillPixel = (x: number, y: number) => { };
    private debugString = "";

    public textAlign = "left";

    constructor(canvas: Canvas) {
        this._canvas = canvas;
        this._matrix = mat2d.create();
        // Repeat to set the initial code for the draw mode
        this.drawMode = DrawMode.FOREGROUND;
    }

    get canvas() {
        return this._canvas;
    }

    get aspectRatio() {
        // Assuming a character's height is twice the width
        return this._canvas.blockSize.x / this._canvas.blockSize.y * 2;
    }
    set drawMode(mode: DrawMode) {
        this._drawMode = mode;
        if (this._drawMode == DrawMode.FOREGROUND) {
            this._fillPixel = (x, y) => {
                this._canvas.setPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setPixel(x, y, this._strokeColor);
            };
        } else if (this._drawMode == DrawMode.BACKGROUND) {
            this._fillPixel = (x, y) => {
                this._canvas.setBgPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setBgPixel(x, y, this._strokeColor);
            };
        } else if (this._drawMode == DrawMode.BOTH) {
            this._fillPixel = (x, y) => {
                this._canvas.setPixel(x, y, this._fillColor);
                this._canvas.setBgPixel(x, y, this._fillColor);
            };
            this._strokePixel = (x, y) => {
                this._canvas.setPixel(x, y, this._strokeColor);
                this._canvas.setBgPixel(x, y, this._strokeColor);
            };
        } else if (this._drawMode == DrawMode.FILLBG_STROKEFG) {
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

    set fillStyle(style: string | Color) {
        this._fillColor = this.parseColor(style);
    }
    set strokeStyle(style: string | Color) {
        this._strokeColor = this.parseColor(style);
    }

    private parseColor(style: string | Color): Color | undefined {
        if (Array.isArray(style)) {
            return <Color>style;
        }
        if (typeof style === "number") {
            // Assume ANSI color code
            return style;
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

    clear() {
        this._canvas.clear();
    }

    clearRect(x: number, y: number, w: number, h: number) {
        var set = this._canvas.clearPixel.bind(this._canvas);
        const path = new Path();
        path.rect(x, y, w, h).transform(this._matrix).fill(set, [0, 0, this.width, this.height]);
        // quad(this._matrix, x, y, w, h, this._canvas.clearPixel.bind(this._canvas), [0, 0, this.width, this.height]);
    }

    fillRect(x: number, y: number, w: number, h: number) {
        var set = this._fillPixel.bind(this);
        const path = new Path();
        path.rect(x, y, w, h).transform(this._matrix).fill(set, [0, 0, this.width, this.height]);

        // quad(this._matrix, x, y, w, h, this._fillPixel.bind(this), [0, 0, this.width, this.height]);
    }

    strokeRect(x: number, y: number, w: number, h: number) {
        var set = this._strokePixel.bind(this);
        const path = new Path();
        path.rect(x, y, w, h).transform(this._matrix).stroke(set);
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
        mat2d.rotate(this._matrix, this._matrix, a);
    }

    scale(x: number, y: number) {
        mat2d.scale(this._matrix, this._matrix, vec2.fromValues(x, y));
    }

    beginPath() {
        this._currentPath.beginPath();
    }

    closePath() {
        this._currentPath.closePath();
    }

    moveTo(x: number, y: number) {
        this._currentPath.moveTo(x, y);
    };

    lineTo(x: number, y: number) {
        this._currentPath.lineTo(x, y);
    }

    arc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
        var p, x, y;
        var dth = Math.abs(Math.acos(1 / radius) - Math.acos(2 / radius));
        if (anticlockwise) {
            var tempth = endAngle;
            endAngle = startAngle + 2 * Math.PI;
            startAngle = tempth;
        }
        startAngle = startAngle % (2 * Math.PI);
        if (endAngle < startAngle) endAngle = endAngle + 2 * Math.PI;
        for (var th = startAngle; th <= endAngle; th += dth) {
            y = radius * Math.sin(th) + centerY;
            x = radius * Math.cos(th) + centerX;
            this._currentPath.lineTo(x, y);
        }
    }

    stroke() {
        var set = this._strokePixel.bind(this);
        this._currentPath.transform(this._matrix).stroke(set);
    }

    fill() {
        this._currentPath.transform(this._matrix).fill(this._fillPixel.bind(this), [0, 0, this.width, this.height]);
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
