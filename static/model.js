/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class CdnSpline {
    constructor(control_points, grain, tension) {
        // The array where results lies
        this.points = [];
        this.control_points = control_points;
        this.grain = grain;
        this.tension = tension;
    }

    makeCdnMatrix() {
        let t = this.tension;
        let m = new Array(16);
        m[0] = -t;      m[1] = 2 - t;   m[2] = t - 2;       m[3] = t;
        m[4] = 2 * t;   m[5] = t - 3;   m[6] = 3 - 2 * t;   m[7] = -t;
        m[8] = -t;      m[9] = 0;       m[10] = t;          m[11] = 0;
        m[12] = 0;      m[13] = 1;      m[14] = 0;          m[15] = 0;
        this.m = m;
    }

    makeCdnSpline() {
        let alpha = [];
        for (let i = 0;i < this.grain;i++) {
            alpha.push(i / this.grain);
        }
        for (let i = 1;i < this.control_points.length - 2;i++) {
            for (let j = 0;j < this.grain;j++) {
                let x = this.makeCdnSegment(this.m, [this.control_points[i - 1].x, this.control_points[i].x,
                    this.control_points[i + 1].x, this.control_points[i + 2].x], alpha[j]);
                let y = this.makeCdnSegment(this.m, [this.control_points[i - 1].y, this.control_points[i].y,
                    this.control_points[i + 1].y, this.control_points[i + 2].y], alpha[j]);
                this.points.push(new Point(x, y));
            }
        }
    }

    static makeCdnSegment(m, n, u) {
        let c = new Array(4);
        for (let i = 0;i < 4;i++) {
            c[i] = CdnSpline.multiply(m, n, i * 4);
        }
        return c[3] + u * (c[2] + u * (c[1] + u * c[0]));
    }

    calculate() {
        // Duplicate the last point
        this.control_points.push(this.control_points[this.control_points.length]);
        // Duplicate the first point
        this.control_points.unshift(this.control_points[0]);
        // Calculate the matrix Mc with tension
        this.makeCdnMatrix();
        // Calculate the segments and parametrize the whole spline.
        this.makeCdnSpline();
        return this.points;
    }

    static multiply(M, n, order) {
        let sum = 0;
        for (let i = 0;i < 4;i++) {
            sum += M[order + i] * n[i];
        }
        return sum;
    }
}