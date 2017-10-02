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
let grain = 20;
let tension = 0.5;
let scale = 1;
let status = "DRAW";
let offsetX = 0;
let offsetY = 0;
const MAX_SCALE = 2;
const MIN_SCALE = 0.5;
const colors = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
canvas_spline.width = window.innerWidth - 35;
let centerX = canvas_spline.width / 2;
resizeFnBox.push(function () {
    canvas_spline.width = window.innerWidth - 35;
    let alias = (canvas_spline.width / 2 - centerX) / 2;
    offsetX -= alias;
    console.log(offsetX);
    centerX = canvas_spline.width / 2;
    $canvas_spline.translateCanvas({
        translateX: alias,
        translateY: 0
    }).drawLayers();
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

    }
    else if (e.type === 'mousedown') {
        move = true;
    }
    else if (e.type === 'mousemove') {
        if (move && alt) {
            $canvas_spline.translateCanvas({
                translateX: e.movementX,
                translateY: e.movementY
            }).drawLayers();
            offsetX -= e.movementX;
            console.log(offsetX);
            offsetY -= e.movementY;
        }
    }
    else if (e.type === 'mouseup') {
        console.log(e);
        move = false;
        if (!alt) {
            console.log(offsetX);
            let dot = new Dot(new Point(e.layerX + offsetX, e.layerY + offsetY), 8, colors[parseInt(Math.random() * 6)],
                'ControlPoint_' + (dots.length));
            dots.push(dot);
            dot.draw();
            if (dots.length === 1) {
                line = new Line('rgba(100, 100, 150, 0.2)', 3, [dot.getLocation()], 'line');
            }
            else {
                line.addPoint(dot.getLocation());
            }
            autoRedraw();
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

$("#draw").click(function (e) {
    e.preventDefault();
    drawSpline();
});
function drawSpline() {
    if ($tension[0].value && $grain[0].value && dots.length > 0) {
        points = (new CdnSpline(dots.map(function (dot) {
            return dot.getLocation();
        }), grain, tension)).calculate();
        spline = new Line('rgba(255, 50, 50, 0.6)', 3, points, 'spline');
        status = "VIEW";
    }
    else {
        console.log('Wrong input');
    }
}

$('canvas').drawImage({
    layer: true,
    source: 'static/image.jpg',
    x: canvas_spline.width / 2,
    y: canvas_spline.height / 2
});

$('#clear').click(function (e) {
    e.preventDefault();
    if (spline) {
        spline.remove();
    }
    while (dots.length > 0) {
        line.removePoint();
        dots[dots.length - 1].remove();
        dots.pop();
    }
    console.log("clear.");
    status = "DRAW";
});
function autoRedraw() {
    if ($('#checkbox')[0].checked) {
        drawSpline();
    }
}
let grainhandle = $( "#grainhandle" );
$( "#grainslider" ).slider({
    range: "min",
    min: 1,
    max: 50,
    value: 20,
    create: function() {
        grainhandle.text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        grainhandle.text(ui.value);
        grain = parseInt(ui.value);
        $('#grain')[0].value = "" + grain;
        autoRedraw();
    }
});
let tensionhandle = $( "#tensionhandle" );
$( "#tensionslider" ).slider({
    range: "min",
    min: 0,
    max: 1,
    value: 0.5,
    step: 0.05,
    create: function() {
        tensionhandle.text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        tensionhandle.text(ui.value);
        tension = parseFloat(ui.value);
        $('#tension')[0].value = "" + tension;
        autoRedraw();
    }
});
