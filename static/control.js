/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
let $canvas_spline = $('#splinecanvas');
let canvas_spline = $canvas_spline[0];
let move = false;
let alt = false;
let control_points = [];
let colors = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
let dots = [];
let line;
canvas_spline.width = window.innerWidth - 35;
window.onresize = function () {
    canvas_spline.width = window.innerWidth - 35;
    $canvas_spline.drawLayers();
};
canvas_spline.addEventListener("wheel", mouseEvent, true);
canvas_spline.addEventListener("mousedown", mouseEvent, true);
canvas_spline.addEventListener("mousemove", mouseEvent, true);
canvas_spline.addEventListener("mouseup", mouseEvent, true);
document.addEventListener("keydown", keyboardEvent, true);
document.addEventListener("keyup", keyboardEvent, true);
function mouseEvent(e) {
    // console.log(e);
    e.preventDefault();
    alt = e.altKey === true;
    if (e.type === 'wheel') {
        if (e.wheelDelta > 0) {
            $canvas_spline.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale:1.1
            });
        }
        else {
            $canvas_spline.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale:0.9
            });
        }
        $canvas_spline.drawLayers();
    }
    else if (e.type === 'mousedown') {
        move = true;
    }
    else if (e.type === 'mousemove') {

    }
    else if (e.type === 'mouseup') {
        move = false;
        console.log(e.layerX, e.layerY);
        control_points.push(new Point(e.layerX, e.layerY));
        console.log(control_points);
        let dot = new Dot(control_points[control_points.length - 1], 8, colors[parseInt(Math.random() * 6)],
            'ControlPoint_' + (control_points.length - 1));
        dots.push(dot);
        dot.draw();
        console.log(dot);
        if (control_points.length >= 2) {
            if (control_points.length === 2) {
                line = new Line('rgba(100, 100, 150, 0.2)', 3, control_points);
            }
            else {
                line.addPoint(control_points[control_points.length - 1]);
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
            dots[control_points.length - 1].remove();
            line.removePoint();
            control_points.pop();
            dots.pop();
        }
    }
}