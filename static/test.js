/**
 * Created by Yunzhe on 2017/9/25.
 */

'use strict';
// Test canvas
var $canvas = $('#splinecanvas');
var canvas = $canvas[0];
var circle_x = 400;
var circle_y = 300;
var move = false;
var alt = false;
canvas.width = window.innerWidth - 35;
window.onresize = function () {
    canvas.width = window.innerWidth - 35;
    $canvas.drawLayers();
};
canvas.addEventListener("wheel", mouseEvent, true);
canvas.addEventListener("mousedown", mouseEvent, true);
canvas.addEventListener("mousemove", mouseEvent, true);
canvas.addEventListener("mouseup", mouseEvent, true);
document.addEventListener("keydown", keyboardEvent, true);
document.addEventListener("keyup", keyboardEvent, true);
function mouseEvent(e) {
    console.log(e);
    e.preventDefault();
    alt = e.altKey === true;
    if (e.type === 'wheel') {
        if (e.wheelDelta > 0) {
            $canvas.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale:1.1
            });
        }
        else {
            $canvas.scaleCanvas({
                x: e.offsetX,
                y: e.offsetY,
                scale:0.9
            });
        }
        $canvas.drawLayers();
    }
    else if (e.type === 'mousedown') {
        move = true;
    }
    else if (e.type === 'mousemove') {
        if (move && !alt) {
            $canvas.translateCanvas({
                translateX: e.movementX,
                translateY: e.movementY
            });
            $canvas.drawLayers();
        }
    }
    else if (e.type === 'mouseup') {
        move = false;
    }
}
function keyboardEvent(e) {
    console.log(e);
    if (e.type === 'keydown') {
        if (e.keyCode === 18) {
        //    Alt down
            alt = true;
            $canvas.setLayerGroup('shapes', {
                draggable: true
            })
        }
    }
    else if (e.type === 'keyup') {
        if (e.keyCode === 18) {
        //    Alt up
            alt = false;
            $canvas.setLayerGroup('shapes', {
                draggable: false
            });
            console.log($('#circle'));
        }
    }
}
drawShape();
function drawShape() {
    $canvas.drawArc({
        layer: true,
        name: "circle",
        draggable: true,
        groups: ['shapes'],
        dragGroups: ['shapes'],
        strokeStyle: 'red',
        fillStyle: 'yellow',
        x: circle_x,
        y: circle_y,
        radius: 250,
        drag: function (layer) {
            $('canvas').setLayer('text', {
                text: 'x: ' + layer.x + ', y: ' + layer.y
            })
        }
    });
    $canvas.drawArc({
        layer: true,
        name: "circle2",
        draggable: true,
        groups: ['shapes'],
        dragGroups: ['shapes'],
        strokeStyle: 'blue',
        fillStyle: 'green',
        x: 600 ,
        y: 300,
        radius: 150,
        drag: function (layer) {
            $('canvas').setLayer('text', {
                text: 'x: ' + layer.x + ', y: ' + layer.y
            });
        }
    });
    $canvas.drawText({
        layer: true,
        name: 'text',
        fillStyle: '#9cf',
        strokeStyle: '#25a',
        strokeWidth: 2,
        x: 150,
        y: 100,
        fontSize: 20,
        fontFamily: 'Verdana, sans-serif',
        text: 'x: ' + circle_x + ', y: ' + circle_y
    })
}
// This is necessary.
$canvas.setLayerGroup('shapes', {
    draggable: false
});
drawUI();
function drawUI() {
}
