import bresenham from "bresenham";
// import * as glMatrix from "gl-matrix";
import { vec2 as vec2Point, vec4 as Rectangle, mat2d } from 'gl-matrix';

const vec2 = vec2Point;

function br(p1: vec2Point, p2: vec2Point): { x: number, y: number; }[] {
    return bresenham(
        Math.floor(p1[0]),
        Math.floor(p1[1]),
        Math.floor(p2[0]),
        Math.floor(p2[1])
    ) || [];
}

export type PixelFunction = (x: number, y: number) => void;

export function triangle(pa: vec2Point, pb: vec2Point, pc: vec2Point, pixelFunction: PixelFunction, clip: Rectangle) {
    var a = br(pb, pc);
    var b = br(pa, pc);
    var c = br(pa, pb);

    var s = a.concat(b).concat(c)
        //blow away y’s outside of the clipping area
        .filter(function (point) {
            return point.y < clip[3] && point.y > clip[1];
        })
        .sort(function (a, b) {
            if (a.y == b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });

    for (var i = 0; i < s.length - 1; i++) {
        var cur = s[i];
        var nex = s[i + 1];
        //clamp x line by the clip area
        var left = Math.max(clip[0], cur.x);
        var right = Math.min(clip[2], nex.x);
        if (cur.y == nex.y) {
            for (var j = left; j <= right; j++) {
                pixelFunction(j, cur.y);
            }
        } else {
            pixelFunction(cur.x, cur.y);
        }
    }
}


export function quad(m: mat2d, x: number, y: number, w: number, h: number, pixelFunction: PixelFunction, clip: Rectangle) {
    var p1 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y), m);
    var p2 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y), m);
    var p3 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x, y + h), m);
    var p4 = vec2.transformMat2d(vec2.create(), vec2.fromValues(x + w, y + h), m);
    triangle(p1, p2, p3, pixelFunction, clip);
    triangle(p3, p2, p4, pixelFunction, clip);
}
