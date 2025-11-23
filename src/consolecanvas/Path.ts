import earcut from 'earcut';
import { vec2, mat2d } from 'gl-matrix';
import { triangle } from './primitives';
import bresenham from "bresenham";

export type PathVertex = {
    point: vec2,
    stroke: boolean;
};

export class Path {
    private vertices: PathVertex[] = [];

    constructor() {
        this.vertices = [];
    }


    beginPath(): Path {
        this.vertices = [];
        return this;
    };

    closePath(): Path {
        this.vertices.push({
            point: this.vertices[0].point,
            stroke: true
        });
        return this;
    };

    moveTo(x: number, y: number): Path {
        this.vertices.push({
            point: [x, y],
            stroke: false
        });
        return this;
    };

    lineTo(x: number, y: number): Path {
        this.vertices.push({
            point: [x, y],
            stroke: true
        });
        return this;
    }

    rect(x: number, y: number, w: number, h: number): Path {
        this.moveTo(x, y);
        this.lineTo(x + w, y);
        this.lineTo(x + w, y + h);
        this.lineTo(x, y + h);
        this.closePath();
        return this;
    }

    fill(setPixel: (x: number, y: number) => void, clipRect: [number, number, number, number]) {
        if (this.vertices[this.vertices.length - 1].point !== this.vertices[0].point) {
            this.closePath();
        }

        // Flatten vertices for use in earcut
        var vertices: number[] = [];
        this.vertices.forEach(function (pt: PathVertex) {
            vertices.push(pt.point[0], pt.point[1]);
        });

        var triangleIndices = earcut(vertices);

        // Render triangles
        var p1, p2, p3;
        for (var i = 0; i < triangleIndices.length; i = i + 3) {
            p1 = vec2.fromValues(vertices[triangleIndices[i] * 2], vertices[triangleIndices[i] * 2 + 1]);
            p2 = vec2.fromValues(vertices[triangleIndices[i + 1] * 2], vertices[triangleIndices[i + 1] * 2 + 1]);
            p3 = vec2.fromValues(vertices[triangleIndices[i + 2] * 2], vertices[triangleIndices[i + 2] * 2 + 1]);
            triangle(p1, p2, p3, setPixel, clipRect);
        }
        return this;
    };

    stroke(setPixel: (x: number, y: number) => void) {
        for (var i = 0; i < this.vertices.length - 1; i++) {
            var cur = this.vertices[i];
            var nex = this.vertices[i + 1];
            if (nex.stroke) {
                bresenham(cur.point[0], cur.point[1], nex.point[0], nex.point[1], setPixel);
            }
        }
        return this;
    }

    transform(matrix: mat2d): Path {
        const transformedPath = new Path();
        this.vertices.forEach((vertex) => {
            const transformedPoint = vec2.transformMat2d(vec2.create(), vertex.point, matrix);
            transformedPath.vertices.push({
                point: transformedPoint,
                stroke: vertex.stroke
            });
        });
        return transformedPath;
    }
}
