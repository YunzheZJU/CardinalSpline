/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
class Dot{
    constructor(location, r, color, name, groupname, draggable) {
        this.layer = true;
        this.name = name;
        this.x = location.x;
        this.y = location.y;
        this.draggable = draggable;
        this.intangible = !draggable;
        this.groups = [groupname];
        this.radius = r;
        this.fillStyle = color;
        this.dragstart = function (layer) {
            isdragging = true;
            this.dragstartX = layer.x;
            this.dragstartY = layer.y;
            msg("Dragging starts.");
        };
        this.drag = function (layer) {
            msg("----------");
            // msg("Current speed is (" + layer.dx + ", " + layer.dy + ").");
            // msg("You are dragging me to (" + layer.x + ", " + layer.y + ").");
            layer.x = this.dragstartX + (layer.x - this.dragstartX) / current_scale;
            layer.y = this.dragstartY + (layer.y - this.dragstartY) / current_scale;
            // msg("Current scale is " + current_scale);
            // msg("New speed should be (" + layer.dx / current_scale + ", " + layer.dy / current_scale + ").");
            msg("New position should be (" + layer.x + ", " + layer.y + ").");
            msg("----------");
        };
        this.dragstop = function (layer) {
            isdragging = false;
            msg("Dragging is stopped.");
            dots[layer.index - 1].setLocation(layer.x, layer.y);
            autoDraw();
            msg(layer);
        };
        this.draw();
    }

    draw() {
        $canvas_spline.drawArc(this);
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
    }

    getLocation() {
        return {x: this.x, y: this.y};
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    setRadius(r) {
        $canvas_spline.setLayer(this.name, {
            radius: r
        }).drawLayers();
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
        this.intangible = true;
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

    removePoints(n) {
        for (let i = 0;i < n;i++) {
            delete this['x' + this.length];
            delete this['y' + this.length];
            this.length -= 1;
        }
        this.draw();
    }

    draw() {
        this.remove();
        if (this.length > 1) {
            $canvas_spline.drawLine(this);
        }
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
    }

    setWidth(width) {
        $canvas_spline.setLayer(this.name, {
            strokeWidth: width
        }).drawLayers();
    }
}