/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
const colors = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
const GRAIN_DEFAULT = 20;
const GRAIN_MIN = 1;
const GRAIN_MAX = 50;
const TENSION_DEFAULT = 0.5;
const TENSION_MIN = 0;
const TENSION_MAX = 1;
const DOT_SIZE_DEFAULT = 3;
const LINE_WIDTH_DEFAULT = 3;
const NORMALIZATION_FACTOR = 100;
const STEP = 0.1;
const SHOW_DOTS = true;
const AUTO_DRAW = true;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class SplineDots {
    constructor(points, draw) {
        SplineDots.removeAll();
        this.dots = points.map(function (point) {
            return new Dot(point, DOT_SIZE_DEFAULT, "rgba(50, 200, 50, 0.8)",
                "SplinePoint_" + points.indexOf(point), 'SplinePoints', false, draw);
        }, this);
    }

    drawSplineDots() {
        msg("Drawing SplinePoints...");
        for (let dot of this.dots) {
            dot.draw();
        }
    }

    static removeAll() {
        msg("Removing SplinePoints...");
        $canvas_spline.removeLayerGroup("SplinePoints").drawLayers();
    }
}

class SplinePoints {
    constructor(points, show_dots) {
        // Array consists of class Point
        this.points = points;
        // Array consist of class SplineDots
        msg("Drawing dots...");
        this.spline_dots = new SplineDots(points, show_dots);
        // class Line
        msg("Drawing spline...");
        this.spline_points_line = new Line('rgba(255, 50, 50, 0.6)', LINE_WIDTH_DEFAULT, this.points,
            'SplinePointsLine');
    }

    removePoints() {
        this.points = [];
        this.spline_points_line.remove();
        SplineDots.removeAll();
    }

    drawDots() {
        SplineDots.removeAll();
        this.spline_dots.drawSplineDots();
    }
}

class Rocket {
    constructor() {

    }

    remove() {

    }
}

class CdnSpline {
    constructor(control_points, grain, tension, show) {
        // class SplinePoints
        this.spline_points = null;
        // Array consists of class Point
        this.normalized_spline_points = null;
        // class Rocket
        this.rocket = new Rocket();

        this.length_list = [];
        this.length = 0;
        this.points = control_points.map(function (x) {
            return x;
        });
        this.grain = grain;
        this.tension = tension;
        this.show_dots = show;
        this.calculateSpline();
    }

    combineSegments() {
        msg("Combining segments...");
        // TODO: Rename alpha
        let alpha = [];
        let result = [];
        for (let i = 0;i < this.grain;i++) {
            alpha.push(i / this.grain);
        }
        for (let i = 1; i < this.points.length - 2; i++) {
            for (let j = 0;j < this.grain;j++) {
                let x = CdnSpline.makeSegment(this.m, [this.points[i - 1].x, this.points[i].x,
                    this.points[i + 1].x, this.points[i + 2].x], alpha[j]);
                let y = CdnSpline.makeSegment(this.m, [this.points[i - 1].y, this.points[i].y,
                    this.points[i + 1].y, this.points[i + 2].y], alpha[j]);
                result.push(new Point(x, y));
            }
        }
        // Push the last control point into spline_points[].
        result.push(this.points[this.points.length - 1]);
        if (this.normalized_spline_points !== null) {
            msg("Unreachable.");
            msg("Cleaning...");
            this.normalized_spline_points.removePoints();
            this.normalized_spline_points = null;
        }
        msg("Generating result...");
        this.points = result;
    }

    makeMatrix() {
        msg("Making Matrix...");
        let t = this.tension;
        let m = new Array(16);
        m[0] = -t;      m[1] = 2 - t;   m[2] = t - 2;       m[3] = t;
        m[4] = 2 * t;   m[5] = t - 3;   m[6] = 3 - 2 * t;   m[7] = -t;
        m[8] = -t;      m[9] = 0;       m[10] = t;          m[11] = 0;
        m[12] = 0;      m[13] = 1;      m[14] = 0;          m[15] = 0;
        this.m = m;
    }

    calculateSpline() {
        // Duplicate the last point
        this.points.push(this.points[this.points.length - 1]);
        // Duplicate the first point
        this.points.unshift(this.points[0]);
        // Calculate the matrix Mc with tension
        this.makeMatrix();
        // Combine the segments
        this.combineSegments();
        // Draw the result
        this.spline_points = new SplinePoints(this.points, this.show_dots);
    }

    calculateF(u) {
        return Math.sqrt((((this.A * u + this.B) * u + this.C) * u + this.D) * u + this.E);
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

    findPointByLength(length) {
        let segment_no = 0;
        let u_max = 1;
        let u_min = 0;
        let u_current;
        let current_length;
        let difference_length;
        while (this.length_list[segment_no] < length) {
            segment_no++;
        }
        segment_no -= 1;
        let target_length = length - this.length_list[segment_no];
        let param_list = this.calculateCoefficient(this.m,
            [this.points[segment_no], this.points[segment_no + 1], this.points[segment_no + 2], this.points[segment_no + 3]]);
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
        } while (Math.abs(difference_length) > STEP);
        return new Point(CdnSpline.calculatePoint(u_current, param_list[0]),
            CdnSpline.calculatePoint(u_current, param_list[1]))
    }

    makeLengthList() {
        let length = 0;
        this.length_list[0] = 0;
        // Duplicate the last point
        this.points.push(this.points[this.points.length - 1]);
        // Duplicate the first point
        this.points.unshift(this.points[0]);
        for (let i = 0;i < this.points.length - 3;i++) {
            this.calculateCoefficient(this.m, [this.points[i], this.points[i + 1], this.points[i + 2], this.points[i + 3]]);
            length += this.calculateSimpsonLength(0, 1);
            this.length_list.push(length);
        }
        this.length = length;
    }

    normalizeSpline() {
        if ((this.spline_points === null) && (this.normalized_spline_points === null)) {
            msg("Please make a spline first!");
        }
        else if (this.spline_points !== null) {
            msg("Calculating...");
            // MakeList is OK.
            this.makeLengthList();
            let step = 1 / NORMALIZATION_FACTOR;
            let result = [];
            for (let i = 1;i < NORMALIZATION_FACTOR;i++) {
                result.push(this.findPointByLength(i * step * this.length));
            }
            result.push(this.points[this.points.length - 1]);
            result.unshift(this.points[0]);
            this.spline_points.removePoints();
            this.spline_points = null;
            msg("Generating results...");
            this.normalized_spline_points = new SplinePoints(result, this.show_dots);
            msg("Done. Points have been normalized.");
        }
        else {
            msg("Click once is OK.");
        }
    }

    removeAll() {
        this.rocket.remove();
        if (this.spline_points !== null) {
            this.spline_points.removePoints();
        }
        if (this.normalized_spline_points !== null) {
            this.normalized_spline_points.removePoints();
        }
    }

    showDots() {
        if (this.spline_points !== null) {
            this.spline_points.drawDots();
        }
        else if (this.normalized_spline_points !== null) {
            this.normalized_spline_points.drawDots();
        }
    }

    static makeSegment(m, n, u) {
        let c = new Array(4);
        for (let i = 0;i < 4;i++) {
            c[i] = CdnSpline.multiply(m, n, i * 4);
        }
        return c[3] + u * (c[2] + u * (c[1] + u * c[0]));
    }

    static multiply(M, n, order) {
        let sum = 0;
        for (let i = 0;i < 4;i++) {
            sum += M[order + i] * n[i];
        }
        return sum;
    }

    static calculatePoint(u, param) {
        return param[0] * u * u * u + param[1] * u * u + param[2] * u + param[3];
    }
}

class ControlDots {
    constructor() {
        this.dot_size = 8;
        this.control_dots = [];
    }

    addDot(x, y) {
        this.control_dots.push(new Dot(new Point(x, y), this.dot_size, colors[parseInt(Math.random() * 6)],
            'ControlPoint_' + (this.control_dots.length), 'ControlPoints', true, true));
    }

    popDot() {
        this.control_dots[this.control_dots.length - 1].remove();
        this.control_dots.pop();
    }

    setDotPosition(n, x, y) {
        this.control_dots[n].setLocation(x, y)
    }

    static remove() {
        $canvas_spline.removeLayerGroup("ControlPoints");
    }
}

class ControlPoints {
    constructor(grain, tension, auto_draw, show_dots) {
        // Array of class Point
        this.points = [];
        // class CdnSpline
        this.cdn_spline = null;
        // class Line
        this.control_points_line = null;
        // Array consists of class Dot
        this.control_dots = new ControlDots();

        this.grain = grain;
        this.tension = tension;
        this.auto_draw = auto_draw;
        this.show_dots = show_dots;
    }

    addControlPoint(x, y) {
        let point = new Point(x, y);
        this.points.push(point);
        this.control_dots.addDot(x, y);
        if (this.points.length > 1){
            // Add a new point and create a new Cardinal spline.
            this.control_points_line.addPoint(point);
            if (this.auto_draw) {
                this.makeSpline();
            }
        }
        else {
            // Initialize control_points_line
            this.control_points_line = new Line('rgba(100, 100, 150, 0.2)', LINE_WIDTH_DEFAULT, [point],
                'ControlPointsLine')
        }
    }

    popPoint() {
        if (this.points.length > 0) {
            this.points.pop();
            this.control_dots.popDot();
            this.control_points_line.popPoint();
            if (this.points.length > 1) {
                this.makeSpline();
            }
            else {
                this.cdn_spline.removeAll();
            }
        }
    }

    normalizeSpline() {
        this.cdn_spline.normalizeSpline();
    }

    removeAll() {
        this.points = [];
        ControlDots.remove();
        this.control_points_line.remove();
        this.cdn_spline.removeAll();
    }

    setAutoDraw(bool) {
        this.auto_draw = bool;
    }

    showDots() {
        // Take effect at once
        this.cdn_spline.showDots();
        // Take effect at next draw
        this.show_dots = true;
    }

    hideDots() {
        // Take effect at once
        SplineDots.removeAll();
        // Take effect at next draw
        this.show_dots = false;
    }

    movePoint(n, x, y) {
        this.points[n].x = x;
        this.points[n].y = y;
        this.makeSpline();
        this.control_points_line.remove();
        this.control_points_line = new Line('rgba(100, 100, 150, 0.2)', LINE_WIDTH_DEFAULT, this.points,
            'ControlPointsLine');
        this.control_dots.setDotPosition(n, x, y);
    }

    makeSpline() {
        msg('Calculating...');
        this.cdn_spline = new CdnSpline(this.points, this.grain, this.tension, this.show_dots);
    }

    setGrain(grain) {
        this.grain = grain;
    }

    setTension(tension) {
        this.tension = tension;
    }
}

class Spline {
    constructor() {
        this.grain = GRAIN_DEFAULT;
        this.tension = TENSION_DEFAULT;
        this.auto_draw = AUTO_DRAW;
        this.show_dots = SHOW_DOTS;
        // class ControlPoints
        this.control_points = new ControlPoints(this.grain, this.tension, this.auto_draw, this.show_dots);
    }

    addControlPoint(x, y) {
        this.control_points.addControlPoint(x, y, this.grain, this.tension);
    }

    popControlPoint() {
        this.control_points.popPoint(this.grain, this.tension);
        msg("The last point and everything related has been popped.");
    }

    normalizeSpline() {
        this.control_points.normalizeSpline();
    }

    removeAll() {
        this.control_points.removeAll();
        this.control_points = new ControlPoints(this.grain, this.tension, this.auto_draw, this.show_dots);
    }

    setAutoDraw(bool) {
        this.auto_draw = bool;
        this.control_points.setAutoDraw(bool);
        msg("Switch of auto drawing has been set to be "+ bool + ".");
    }

    setShowDots(bool) {
        this.show_dots = bool;
        if (bool) {
            this.control_points.showDots();
        }
        else {
            this.control_points.hideDots();
        }
        msg("Switch of showing dots has been set to be "+ bool + ".");
    }

    moveControlPoint(n, x, y) {
        this.control_points.movePoint(n, x, y);
        msg("A control point has been moved to (" + x + ", " + y + ").")
    }

    drawSpline() {
        this.control_points.makeSpline();
        msg("You have made a new spline!");
    }

    setGrain(grain) {
        this.grain = grain;
        this.control_points.setGrain(grain);
        msg("Grain of the Cardinal spline has been set to be "+ grain);
    }

    setTension(tension) {
        this.tension = tension;
        this.control_points.setTension(tension);
        msg("Tension of the Cardinal spline has been set to be "+ tension);
    }
}