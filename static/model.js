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
        this.uniform_points = [];
        this.length_list = [];
        this.length = 0;
        this.control_points = control_points;
        this.grain = grain;
        this.tension = tension;
    }

    makeMatrix() {
        let t = this.tension;
        let m = new Array(16);
        m[0] = -t;      m[1] = 2 - t;   m[2] = t - 2;       m[3] = t;
        m[4] = 2 * t;   m[5] = t - 3;   m[6] = 3 - 2 * t;   m[7] = -t;
        m[8] = -t;      m[9] = 0;       m[10] = t;          m[11] = 0;
        m[12] = 0;      m[13] = 1;      m[14] = 0;          m[15] = 0;
        this.m = m;
    }

    combineSegments() {
        // TODO: Rename
        let alpha = [];
        for (let i = 0;i < this.grain;i++) {
            alpha.push(i / this.grain);
        }
        for (let i = 1;i < this.control_points.length - 2;i++) {
            for (let j = 0;j < this.grain;j++) {
                let x = CdnSpline.makeSegment(this.m, [this.control_points[i - 1].x, this.control_points[i].x,
                    this.control_points[i + 1].x, this.control_points[i + 2].x], alpha[j]);
                let y = CdnSpline.makeSegment(this.m, [this.control_points[i - 1].y, this.control_points[i].y,
                    this.control_points[i + 1].y, this.control_points[i + 2].y], alpha[j]);
                this.points.push(new Point(x, y));
            }
        }
        // Push the last control point into points[].
        this.points.push(this.control_points[this.control_points.length - 1]);
    }

    static makeSegment(m, n, u) {
        let c = new Array(4);
        for (let i = 0;i < 4;i++) {
            c[i] = CdnSpline.multiply(m, n, i * 4);
        }
        return c[3] + u * (c[2] + u * (c[1] + u * c[0]));
    }

    // TODO: Rename
    calculate() {
        // Duplicate the last point
        this.control_points.push(this.control_points[this.control_points.length - 1]);
        // Duplicate the first point
        this.control_points.unshift(this.control_points[0]);
        // Calculate the matrix Mc with tension
        this.makeMatrix();
        // Calculate the segments and parametrize the whole spline.
        this.combineSegments();
        return this.points;
    }

    static multiply(M, n, order) {
        let sum = 0;
        for (let i = 0;i < 4;i++) {
            sum += M[order + i] * n[i];
        }
        return sum;
    }

    normalize(n) {
        let step = 1 / n;
        for (let i = 1;i < n;i++) {
            this.uniform_points.push(this.findPointByLength(i * step * this.length));
        }
        this.uniform_points.push(this.points[this.points.length - 1]);
        return this.uniform_points;
    }

    calculateF(u) {
        return Math.sqrt((((this.A * u + this.B) * u + this.C) * u + this.D) * u + this.E);
    }

    calculateCoefficient(m, n) {
        let x = new Array(4);
        let y = new Array(4);
        for (let i = 0;i < 4;i++) {
            x[i] = CdnSpline.multiply(m, n.map(function (point) {
                return point.x;
            }), i * 4);
            y[i] = CdnSpline.multiply(m, n.map(function (point) {
                return point.y;
            }), i * 4);
        }
        this.A = 9 * (x[0] * x[0] + y[0] * y[0]);
        this.B = 12 * (x[0] * x[1] + y[0] * y[1]);
        this.C = 6 * (x[0] * x[2] + y[0] * y[2]) + 4 * (x[1] * x[1] + y[1] * y[1]);
        this.D = 4 * (x[1] * x[2] + y[1] * y[2]);
        this.E = x[2] * x[2] + y[2] * y[2];
        return [x, y];
    }

    calculateSimpsonLength(lower, upper) {
        const ORDER = 10;
        let sum = 0;
        let h = (upper - lower) / ORDER;
        for (let i = 1;i <= ORDER - 1;i++) {
            if (i % 2) {
                sum += 4 * this.calculateF(lower + h * i);
            }
            else {
                sum += 2 * this.calculateF(lower + h * i);
            }
        }
        return h / 3 * (this.calculateF(lower) + sum + this.calculateF(upper));
    }

    makeLengthList() {
        let length = 0;
        this.length_list[0] = 0;
        // Duplicate the last point
        this.points.push(this.points[this.points.length - 1]);
        // Duplicate the first point
        this.points.unshift(this.points[0]);
        for (let i = 0;i < points.length - 3;i++) {
            this.calculateCoefficient(this.m, [points[i], points[i + 1], points[i + 2], points[i + 3]]);
            length += this.calculateSimpsonLength(0, 1);
            this.length_list.push(length);
        }
        this.length = length;
        // console.log(this.length_list);
        // console.log(length);
    }

    findPointByLength(length) {
        let segment_no = 0;
        let u_max = 1;
        let u_min = 0;
        let u_current;
        let current_length;
        let difference_length;
        const STEP = 0.05;
        while (this.length_list[segment_no] < length) {
            segment_no++;
        }
        segment_no -= 1;
        let target_length = length - this.length_list[segment_no];
        let param_list = this.calculateCoefficient(this.m,
            [points[segment_no], points[segment_no + 1], points[segment_no + 2], points[segment_no + 3]]);
        do {
            u_current = (u_max + u_min) / 2;
            current_length = this.calculateSimpsonLength(u_min, u_current);
            difference_length = target_length - current_length;
            if (difference_length > 0) {
                u_min = u_current;
                target_length -= current_length;
            }
            else {
                u_max = u_current;
            }
        } while (Math.abs(difference_length) <= STEP);
        return new Point(CdnSpline.calculatePoint(u_current, param_list[0]),
            CdnSpline.calculatePoint(u_current, param_list[1]))
    }

    static calculatePoint(u, param) {
        return param[0] * u * u * u + param[1] * u * u + param[2] * u + param[3];
    }
}