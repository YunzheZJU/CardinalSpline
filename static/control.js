/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
let $canvas_spline = $('#splinecanvas');
let canvas_spline = $canvas_spline[0];
let $tension = $("#tension");
let $grain = $("#grain");
let move = false;
let alt = false;
let dots = [];
let points = [];
let line;
let spline;
let scale = 1;
let status = "DRAW";
const MAX_SCALE = 2;
const MIN_SCALE = 0.5;
const colors = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
canvas_spline.width = window.innerWidth - 35;
resizeFnBox.push(function () {
    canvas_spline.width = window.innerWidth - 35;
    $canvas_spline.drawLayers();
});
canvas_spline.addEventListener("wheel", mouseEvent, true);
canvas_spline.addEventListener("mousedown", mouseEvent, true);
canvas_spline.addEventListener("mousemove", mouseEvent, true);
canvas_spline.addEventListener("mouseup", mouseEvent, true);
document.addEventListener("keydown", keyboardEvent, true);
document.addEventListener("keyup", keyboardEvent, true);
function mouseEvent(e) {
    e.preventDefault();
    alt = e.altKey === true;
    if (e.type === 'wheel') {
        if (status === "Draw") {
            return;
        }
        if (e.wheelDelta > 0 && scale < MAX_SCALE) {
            console.log("Zoom in");
            $canvas_spline.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale: 1.1
            });
            scale *= 1.1;
        }
        else if (e.wheelDelta < 0 && scale > MIN_SCALE) {
            console.log("Zoom out");
            $canvas_spline.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale: 0.9
            });
            scale *= 0.9
        }
        $canvas_spline.drawLayers();
    }
    else if (e.type === 'mousedown') {
        move = true;
    }
    else if (e.type === 'mousemove') {
        if (move && alt) {
            $canvas_spline.translateCanvas({
                translateX: e.movementX,
                translateY: e.movementY
            });
            $canvas_spline.drawLayers();
        }
    }
    else if (e.type === 'mouseup') {
        move = false;
        if (!alt) {
            let dot = new Dot(new Point(e.layerX, e.layerY), 8, colors[parseInt(Math.random() * 6)],
                'ControlPoint_' + (dots.length));
            dots.push(dot);
            dot.draw();
            if (dots.length === 1) {
                line = new Line('rgba(100, 100, 150, 0.2)', 3, [dot.getLocation()], 'line');
            }
            else {
                line.addPoint(dot.location);
            }
        }
    }
}
function keyboardEvent(e) {
    // console.log(e);
    if (e.type === 'keydown') {
        if (e.keyCode === 18) {
            // Alt down
            alt = true;
        }
    }
    else if (e.type === 'keyup') {
        if (e.keyCode === 18) {
            // Alt up
            alt = false;
        }
        else if (e.keyCode === 80) {
            // P up. Pop the last point
            if (dots.length > 0) {
                line.removePoint();
                dots[dots.length - 1].remove();
                dots.pop();
            }
        }
    }
}

$("#submit").click(function (e) {
    e.preventDefault();
    if ($tension[0].value && $grain[0].value && dots.length > 0) {
        let tension = parseFloat($tension[0].value);
        let grain = parseFloat($grain[0].value);
        let control_points;
        control_points= dots.map(function (dot) {
            return dot.getLocation();
        });
        let cdnspline = new CdnSpline(control_points, grain, tension);
        points = cdnspline.calculate();
        spline = new Line('rgba(255, 50, 50, 0.6)', 3, points, 'spline');
        status = "VIEW";
    }
    else {
        console.log('Wrong input');
    }
});