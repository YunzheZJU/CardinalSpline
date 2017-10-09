/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
const COLORS = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
const ROCKET_SRC_1 = 'static/images/rocket_1.png';
const ROCKET_SRC_2 = 'static/images/rocket_2.png';
const NORMALIZE_METHOD_TYPE_1 = 1;
const NORMALIZE_METHOD_TYPE_2 = 2;
const NORMALIZE_METHOD_TYPE_3 = 3;
const NORMALIZE_METHOD_TYPE_4 = 4;
const GRAIN_DEFAULT = 20;
const GRAIN_MIN = 1;
const GRAIN_MAX = 50;
const TENSION_DEFAULT = 0.5;
const TENSION_MIN = 0;
const TENSION_MAX = 1;
const DOT_SIZE_DEFAULT = 3;
const LINE_WIDTH_DEFAULT = 3;
const CONTROL_POINT_SIZE_DEFAULT = 8;
const FRAMES_DENSITY_DEFAULT = 48;
const STEP = 0.1;
const ANIMATION_FPS = 24;
const ANIMATION_TIME_INTERVAL = 1000 / ANIMATION_FPS;
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
        SplineDots.removeSplineDots();
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

    removeAll() {
        msg("Removing SplinePoints...Count: " + this.dots.length);
        SplineDots.removeSplineDots();
    }

    static removeSplineDots() {
        $canvas_spline.removeLayerGroup("SplinePoints").drawLayers();
    }
}

class SplinePoints {
    constructor(points, show_dots, line_width) {
        // Array consists of class Point
        this.points = points;
        // Array consist of class SplineDots
        msg("Drawing dots...");
        this.spline_dots = new SplineDots(points, show_dots);
        // class Line
        msg("Drawing spline...");
        this.spline_points_line = new Line('rgba(255, 50, 50, 0.6)', line_width, this.points,
            'SplinePointsLine');
    }

    removePoints() {
        // this.points = [];
        this.spline_points_line.remove();
        this.spline_dots.removeAll();
    }

    drawDots() {
        this.spline_dots.removeAll();
        this.spline_dots.drawSplineDots();
    }

    removeDots() {
        this.spline_dots.removeAll();
    }

    getPoint(num) {
        return this.points[num];
    }

    getPoints() {
        return this.points;
    }

    getLength() {
        return this.points.length;
    }

    setLineWidth(line_width) {
        this.spline_points_line.setWidth(line_width);
    }
}

class Rocket {
    constructor(src, x, y, width, height, rotate, opacity) {
        this.image = new Image("Rocket", src, x, y, width, height, rotate, opacity);
    }

    show() {
        this.image.draw();
    }

    remove() {
        this.image.remove();
    }

    updateFrame(location, rotate) {
        this.image.setLocationAndRotate(location, rotate);
    }

    setImage(src) {
        this.image.setImage(src);
    }
}

class CdnSpline {
    constructor(control_points, grain, tension, show, line_width) {
        // class SplinePoints
        this.spline_points = null;
        // Array consists of class Point
        this.normalized_spline_points = null;
        // class Rocket
        this.rocket = null;

        this.length_list = [];
        this.length = 0;
        this.points = control_points.map(function (x) {
            return x;
        });
        this.grain = grain;
        this.tension = tension;
        this.show_dots = show;
        this.line_width = line_width;
        this.normalize_method = null;
        this.frame = 0;
        this.frameId = null;
        this.angle_list = [];
        this.calculateSpline();
    }

    combineSegments() {
        msg("Combining segments...");
        let step = [];
        let result = [];
        for (let i = 0;i < this.grain;i++) {
            step.push(i / this.grain);
        }
        for (let i = 1; i < this.points.length - 2; i++) {
            for (let j = 0;j < this.grain;j++) {
                let x = CdnSpline.makeSegment(this.m, [this.points[i - 1].x, this.points[i].x,
                    this.points[i + 1].x, this.points[i + 2].x], step[j]);
                let y = CdnSpline.makeSegment(this.m, [this.points[i - 1].y, this.points[i].y,
                    this.points[i + 1].y, this.points[i + 2].y], step[j]);
                result.push(new Point(x, y));
            }
        }
        // Push the last control point into spline_points[].
        result.push(this.points[this.points.length - 1]);
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
        this.spline_points = new SplinePoints(this.points, this.show_dots, this.line_width);
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

    normalizeSpline(total_frames, method) {
        if ((this.spline_points === null)) {
            msg("Please make a spline first!");
        }
        else {
            msg("Calculating...");
            if (this.length_list.length === 0) {
                this.makeLengthList();
                msg("Length list has been calculated.");
            }
            let result = [];
            let step = 1 / total_frames;
            if (method === NORMALIZE_METHOD_TYPE_1) {
                for (let i = 1;i < total_frames;i++) {
                    result.push(this.findPointByLength(i * step * this.length));
                }
            }
            else if (method === NORMALIZE_METHOD_TYPE_2) {
                for (let i = 1;i < total_frames;i++) {
                    result.push(this.findPointByLength(Math.pow(i * step, 2) * this.length));
                }
            }
            else if (method === NORMALIZE_METHOD_TYPE_3) {
                for (let i = 1;i < total_frames;i++) {
                    result.push(this.findPointByLength((Math.sin(Math.PI / 2 * (i * step - 1)) + 1) * this.length));
                }
            }
            else if (method === NORMALIZE_METHOD_TYPE_4) {
                for (let i = 1;i < total_frames;i++) {
                    result.push(this.findPointByLength((Math.sin(Math.PI * (i * step - 0.5)) + 1) / 2 * this.length));
                }
            }
            else {
                msg("Unknown method: " + method);
                return;
            }
            result.push(this.points[this.points.length - 1]);
            result.unshift(this.points[0]);
            msg("Generating results...");
            this.normalized_spline_points = new SplinePoints(result, this.show_dots, this.line_width);
            msg("Done. Points have been normalized.");
        }
    }

    removeAll() {
        if (this.rocket) {
            this.rocket.remove();
        }
        if (this.spline_points) {
            this.spline_points.removePoints();
        }
        if (this.normalized_spline_points) {
            this.normalized_spline_points.removePoints();
        }
        hideElement($('#choose-type'))
    }

    showDots() {
        if (this.normalized_spline_points !== null) {
            this.normalized_spline_points.drawDots();
        }
        else if (this.spline_points !== null) {
            this.spline_points.drawDots();
        }
    }

    hideDots() {
        if (this.normalized_spline_points !== null) {
            this.normalized_spline_points.removeDots();
        }
        else if (this.spline_points !== null) {
            this.spline_points.removeDots();
        }
    }

    setShowDots(bool) {
        this.show_dots = bool;
    }

    setLineWidth(line_width) {
        this.line_width = line_width;
        for (let spline_points of [this.spline_points, this.normalized_spline_points]) {
            if (spline_points !== null) {
                spline_points.setLineWidth(line_width);
            }
        }
    }

    startRocket() {
        if (this.normalized_spline_points) {
            this.track_points = this.normalized_spline_points.getPoints();
            this.rocket = new Rocket(ROCKET_SRC_1, this.track_points[0].x, this.track_points[0].y, 50, 50,
                CdnSpline.calculateAngle(this.track_points[0], this.track_points[2]), 1);
            for (let i = 0;i < this.track_points.length - 2;i++) {
                this.angle_list.push(CdnSpline.calculateAngle(this.track_points[i], this.track_points[i + 2]));
            }
            this.rocket.show();

            this.then = Date.now();
            this.playAnimation();
            return true;
        }
        else {
            msg("Please normalize the spline first!");
            return false;
        }
    }

    updateRocket() {
        if (this.frame + 2 < this.track_points.length) {
            this.rocket.updateFrame(this.track_points[this.frame + 1], this.angle_list[this.frame]);
            this.frame++;
        }
        else {
            this.stopAnimation();
            msg("Finished!");
        }
    }

    removeRocket() {
        this.rocket.remove();
        this.frame = 0;
        this.angle_list = [];
    }

    playAnimation() {
        this.frameId = requestAnimationFrame($.proxy(this.playAnimation, this));
        let now = Date.now();
        let delta = now - this.then;
        // this.time_flow += delta;
        // msg("Frame: " + this.frame);
        // msg("Time flow: " + this.time_flow);
        // msg("Fps: " + (this.frame + 1) / (this.time_flow / 1000));
        if (delta > ANIMATION_TIME_INTERVAL) {
            this.then = now - (delta % ANIMATION_TIME_INTERVAL);
            this.updateRocket();
        }
    }

    stopAnimation() {
        this.pauseAnimation();
        this.removeRocket();

        initPanel();
    }

    pauseAnimation() {
        cancelAnimationFrame(this.frameId);
    }

    stepAnimation() {
        this.updateRocket();
    }

    static calculateAngle(previous_point, next_point) {
        let deltaX = next_point.x - previous_point.x;
        let deltaY = next_point.y - previous_point.y;
        return 90 + Math.atan2(deltaY, deltaX) / Math.PI * 180;
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
    constructor(dot_size) {
        this.dot_size = dot_size;
        this.control_dots = [];
    }

    addDot(x, y) {
        this.control_dots.push(new Dot(new Point(x, y), this.dot_size, COLORS[parseInt(Math.random() * 6)],
            'ControlPoint_' + (this.control_dots.length), 'ControlPoints', true, true));
    }

    popDot() {
        this.control_dots[this.control_dots.length - 1].remove();
        this.control_dots.pop();
    }

    setDotPosition(n, x, y) {
        this.control_dots[n].setLocation(x, y)
    }

    setDotSize(dot_size) {
        this.dot_size = dot_size;
        for (let i = 0;i < this.control_dots.length;i++) {
            this.control_dots[i].setRadius(dot_size);
        }
    }

    static remove() {
        $canvas_spline.removeLayerGroup("ControlPoints");
    }
}

class Spline {
    constructor() {
        this.grain = GRAIN_DEFAULT;
        this.tension = TENSION_DEFAULT;
        this.auto_draw = AUTO_DRAW;
        this.show_dots = SHOW_DOTS;
        this.dot_size = CONTROL_POINT_SIZE_DEFAULT;
        this.line_width = LINE_WIDTH_DEFAULT;
        this.frame_density = FRAMES_DENSITY_DEFAULT;

        // Array of class Point
        this.control_points = [];
        // class CdnSpline
        this.cdn_spline = null;
        // class Line
        this.control_points_line = null;
        // Array consists of class Dot
        this.control_dots = new ControlDots(this.dot_size);
    }

    addControlPoint(x, y) {
        let point = new Point(x, y);
        this.control_points.push(point);
        this.control_dots.addDot(x, y);
        if (this.control_points.length > 1){
            // Add a new point and create a new Cardinal spline.
            this.control_points_line.addPoint(point);
            if (this.auto_draw) {
                this.makeSpline();
                enableBtns([btnNormalize]);
                showElement($('#choose-type'));
                disableBtns([btnPlay]);
            }
        }
        else {
            // Initialize control_points_line
            this.control_points_line = new Line('rgba(100, 100, 150, 0.2)', LINE_WIDTH_DEFAULT, [point],
                'ControlPointsLine')
        }
    }

    popControlPoint() {
        if (this.control_points.length > 0) {
            this.control_points.pop();
            this.control_dots.popDot();
            this.control_points_line.popPoint();
            if (this.control_points.length > 1) {
                this.makeSpline();
            }
            else {
                this.cdn_spline.removeAll();
            }
            msg("The last point and everything related has been popped.");
        }
    }

    normalizeSpline(method) {
        this.cdn_spline.normalizeSpline((this.control_points.length - 1) * this.frame_density, method);
    }

    removeAll() {
        this.control_points = [];
        ControlDots.remove();
        this.control_points_line.remove();
        if (this.cdn_spline) {
            this.cdn_spline.removeAll();
        }
        msg("The canvas is clear now.");
    }

    setAutoDraw(bool) {
        this.auto_draw = bool;
        msg("Switch of auto drawing has been set to be "+ bool + ".");
    }

    showDots() {
        if (this.cdn_spline) {
            this.cdn_spline.setShowDots(true);
            // Take effect at once
            this.cdn_spline.showDots();
        }
    }

    hideDots() {
        if (this.cdn_spline) {
            this.cdn_spline.setShowDots(false);
            // Take effect at once
            this.cdn_spline.hideDots();
        }
    }

    setShowDots(bool) {
        this.show_dots = bool;
        if (bool) {
            this.showDots();
        }
        else {
            this.hideDots();
        }
        msg("Switch of showing dots has been set to be "+ bool + ".");
    }

    moveControlPoint(n, x, y) {
        this.control_points[n].x = x;
        this.control_points[n].y = y;
        this.makeSpline();
        this.control_points_line.remove();
        this.control_points_line = new Line('rgba(100, 100, 150, 0.2)', LINE_WIDTH_DEFAULT, this.control_points,
            'ControlPointsLine');
        this.control_dots.setDotPosition(n, x, y);
        msg("A control point has been moved to (" + x + ", " + y + ").")
    }

    makeSpline() {
        if (this.control_points.length > 0) {
            msg('Calculating...');
            this.cdn_spline = new CdnSpline(this.control_points, this.grain, this.tension, this.show_dots, this.line_width);
            msg("You have made a new spline!");
        }
    }

    startAnimation() {
        msg("Rocket Heart!");
        return this.cdn_spline.startRocket();
    }

    pauseAnimation() {
        this.cdn_spline.pauseAnimation();
        msg("You have paused the rocket.");
    }

    restoreAnimation() {
        this.cdn_spline.playAnimation();
        msg("Rocket Heart!");
    }

    stopAnimation() {
        this.cdn_spline.stopAnimation();
        msg("The animation has been stopped.");
    }

    stepAnimation() {
        this.cdn_spline.stepAnimation();
        msg("Press \"步进\" button to check next frame.");
    }

    setGrain(grain) {
        this.grain = grain;
        if (this.auto_draw) {
            this.makeSpline();
        }
        msg("Grain of the Cardinal spline has been set to be "+ grain);
    }

    setTension(tension) {
        this.tension = tension;
        if (this.auto_draw) {
            this.makeSpline();
        }
        msg("Tension of the Cardinal spline has been set to be "+ tension);
    }

    setDotSize(dot_size) {
        this.dot_size = dot_size;
        this.control_dots.setDotSize(dot_size);
        msg("Size of the control points has been set to be "+ dot_size);
    }

    setLineWidth(line_width) {
        this.line_width = line_width;
        if (this.cdn_spline) {
            this.cdn_spline.setLineWidth(line_width);
        }
        msg("Width of the Cardinal spline has been set to be "+ line_width);
    }

    setFrameDensity(frame_density, method) {
        this.frame_density = frame_density;
        if (this.cdn_spline && this.auto_draw) {
            this.cdn_spline.normalizeSpline((this.control_points.length - 1) * this.frame_density, method);
            enableBtns([btnPlay]);
        }
        msg("Density of frames has been set to be "+ frame_density);
    }
}