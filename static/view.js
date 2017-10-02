/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
class Dot{
    constructor(location, r, color, name) {
        this.layer = true;
        this.name = name;
        this.location = location;
        this.x = location.x;
        this.y = location.y;
        this.groups = ['ControlPoints'];
        this.radius = r;
        this.fillStyle = color;
    }

    draw() {
        $canvas_spline.drawArc(this);
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
    }

    getLocation() {
        return this.location;
    }
}

class Line {
    constructor(color, width, points, name) {
        this.layer = true;
        this.name = name;
        this.strokeStyle = color;
        this.strokeWidth = width;
        this.groups = ['Lines'];
        this.length = points.length;
        for (let i = 0;i < points.length;i++) {
            this['x' + (i + 1)] = points[i].x;
            this['y' + (i + 1)] = points[i].y;
        }
        this.draw()
    }

    addPoint(point) {
        this.length += 1;
        this['x' + this.length] = point.x;
        this['y' + this.length] = point.y;
        this.draw();
    }

    removePoint() {
        delete this['x' + this.length];
        delete this['y' + this.length];
        this.length -= 1;
        this.draw();
    }

    draw() {
        $canvas_spline.removeLayer(this.name).drawLayers();
        if (this.length > 1) {
            $canvas_spline.drawLine(this);
        }
    }
}