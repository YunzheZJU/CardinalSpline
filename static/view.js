/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
class Dot{
    constructor(location, r, color, name, groupname, draggable, draw) {
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
            if (alt) {
                msg("Please DO NOT press ALT when dragging!")
            }
            isdragging = true;
            this.dragstartX = layer.x;
            this.dragstartY = layer.y;
            msg("Dragging starts.");
        };
        this.drag = function (layer) {
            layer.x = this.dragstartX + (layer.x - this.dragstartX) / current_scale;
            layer.y = this.dragstartY + (layer.y - this.dragstartY) / current_scale;
        };
        this.dragstop = function (layer) {
            isdragging = false;
            msg("Dragging is stopped.");
            spline.moveControlPoint(layer.index - 1, layer.x, layer.y);
        };
        if (draw === true) {
            this.draw();
        }
    }

    draw() {
        $canvas_spline.drawArc(this);
        return this;
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
        return this;
    }

    update() {
        return this.remove().draw();
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
        this.length = points.length;
        this.intangible = true;
        for (let i = 0;i < points.length;i++) {
            this['x' + (i + 1)] = points[i].x;
            this['y' + (i + 1)] = points[i].y;
        }
        this.update()
    }

    addPoint(point) {
        this.length += 1;
        this['x' + this.length] = point.x;
        this['y' + this.length] = point.y;
        this.update();
    }

    popPoint() {
        delete this['x' + this.length];
        delete this['y' + this.length];
        this.length -= 1;
        this.update();
    }

    popPoints(n) {
        for (let i = 0;i < n;i++) {
            delete this['x' + this.length];
            delete this['y' + this.length];
            this.length -= 1;
        }
        this.update();
    }

    draw() {
        $canvas_spline.drawLine(this);
        return this;
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
        return this;
    }

    update() {
        return this.remove().draw();
    }

    setWidth(width) {
        $canvas_spline.setLayer(this.name, {
            strokeWidth: width
        }).drawLayers();
    }
}

class Image{
    constructor(name, src, x, y, width, height, rotate, opacity) {
        this.layer = true;
        this.name = name;
        this.source = src;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.rotate = rotate;
        this.opacity = opacity;
    }

    draw() {
        $canvas_spline.drawImage(this);
        return this;
    }

    remove() {
        $canvas_spline.removeLayer(this.name).drawLayers();
        return this;
    }

    update() {
        this.remove().draw();
        return this;
    }

    setImage(src) {
        this.source = src;
        this.update();
    }

    setLocationAndRotate(location, rotate) {
        // For speed
        $canvas_spline.setLayer(this.name, {
            x: location.x,
            y: location.y,
            rotate: rotate
        }).drawLayers();
    }

    setHeight(height) {
        $canvas_spline.setLayer(this.name, {
            height: height
        }).drawLayers();
    }
}

class Text{
    constructor() {

    }
}