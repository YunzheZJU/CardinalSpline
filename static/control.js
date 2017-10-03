/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
let $canvas_spline = $('#splinecanvas');
let canvas_spline = $canvas_spline[0];
let $grain = $("#grain");
let grainhandle = $("#grainhandle");
let $grainslider = $("#grainslider");
let $tension = $("#tension");
let tensionhandle = $("#tensionhandle");
let $tensionslider = $("#tensionslider");
let $dotsizeslider = $("#dotsizeslider");
let $linewidthslider = $("#linewidthslider");
let $showpoints = $('#showpoints');
let move = false;
let alt = false;
let dots = [];
let points = [];
let spline_points = [];
let line = null;
let spline = null;
let grain = 20;
let tension = 0.5;
let current_scale = 1;
let dot_size = 8;
let line_width = 3;
let status = "DRAW";
let offsetX = 0;
let offsetY = 0;
const GRAIN_MIN = 1;
const GRAIN_MAX = 50;
const TENSION_MIN = 0;
const TENSION_MAX = 1;
const colors = ['red', 'blue', 'yellow', 'orange', 'purple', 'green'];
let current_width = canvas_spline.width = window.innerWidth - 30;
const current_height = canvas_spline.height;
let zeroX = current_width / 2;
const zeroY = current_height / 2;
$canvas_spline.translateCanvas({
    translateX: zeroX,
    translateY: zeroY
});
$canvas_spline.drawImage({
    layer: true,
    source: 'static/image.jpg'
});
resizeFnBox.push(function () {
    current_width = canvas_spline.width = window.innerWidth - 30;
    zeroX = current_width / 2;
    $canvas_spline.translateCanvas({
        translateX: zeroX,
        translateY: zeroY
    }).scaleCanvas({
        scale: current_scale
    }).translateCanvas({
        translateX: -offsetX,
        translateY: -offsetY
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
        scaleCanvas(e.wheelDelta > 0 ? 1.1 : 0.9, e.offsetX, e.offsetY);
    }
    else if (e.type === 'mousedown') {
        move = true;
    }
    else if (e.type === 'mousemove') {
        if (move && alt) {
            $canvas_spline.translateCanvas({
                translateX: e.movementX / current_scale,
                translateY: e.movementY / current_scale
            }).drawLayers();
            offsetX -= e.movementX / current_scale;
            offsetY -= e.movementY / current_scale;
        }
    }
    else if (e.type === 'mouseup') {
        move = false;
        if (!alt) {
            let dot = new Dot(new Point((e.offsetX - zeroX) / current_scale + offsetX, (e.offsetY - zeroY) / current_scale + offsetY),
                dot_size, colors[parseInt(Math.random() * 6)], 'ControlPoint_' + (dots.length), 'ControlPoints');
            dots.push(dot);
            if (dots.length === 1) {
                line = new Line('rgba(100, 100, 150, 0.2)', 3, [dot.getLocation()], 'line');
            }
            else {
                line.addPoint(dot.getLocation());
            }
            autoDraw();
        }
    }
}
function keyboardEvent(e) {
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
            if (spline) {
                spline.removePoints(grain);
            }
        }
    }
}
function scaleCanvas(scale, eX, eY) {
    // console.log("---------------");
    // console.log("current_scale: " + current_scale);
    // console.log("eX: " + eX);
    // console.log("eY: " + eY);
    // console.log("offsetX: " + offsetX);
    // console.log("offsetY: " + offsetY);
    let transX = (eX - zeroX) / current_scale + offsetX;
    // console.log("transX: " + transX);
    let transY = (eY - zeroY) / current_scale + offsetY;
    // console.log("transY: " + transY);
    $canvas_spline.translateCanvas({
        translateX: transX,
        translateY: transY
    }).scaleCanvas({
        scale: scale
    });
    $canvas_spline.translateCanvas({
        translateX: -transX,
        translateY: -transY
    }).drawLayers();
    current_scale *= scale;
    // console.log("current_scale: " + current_scale);
    offsetX = transX - (eX - zeroX) / current_scale;
    // console.log("offsetX: " + offsetX);
    offsetY = transY - (eY - zeroY) / current_scale;
    // console.log("offsetY: " + offsetY);
    // console.log("---------------");

}

$("#draw").click(function (e) {
    e.preventDefault();
    drawSpline();
});
function drawSpline() {
    if ($tension[0].value && $grain[0].value && dots.length > 0) {
        let t_grain = parseInt($grain[0].value);
        if (t_grain) {
            if (t_grain >= GRAIN_MIN && t_grain <= GRAIN_MAX) {
                grain = t_grain;
                console.log(grain);
                let t_tension = parseFloat($tension[0].value);
                console.log(t_tension);
                if (t_tension) {
                    if (t_tension >= TENSION_MIN && t_tension <= TENSION_MAX) {
                        tension = t_tension;
                        points = (new CdnSpline(dots.map(function (dot) {
                            return dot.getLocation();
                        }), grain, tension)).calculate();
                        spline = new Line('rgba(255, 50, 50, 0.6)', line_width, points, 'spline');
                        if (spline_points) {
                            $canvas_spline.removeLayerGroup('SplinePoints').drawLayers();
                        }
                        spline_points = points.map(function (point) {
                            return new Dot(point, 3, "rgba(50, 200, 50, 0.8)", "SplinePoint_" + points.indexOf(point),
                                'SplinePoints');
                        });
                        showPoints();
                        status = "VIEW";
                        return;
                    }
                }
            }
        }
    }
    console.log('Wrong input');
}
$('#clear').click(function (e) {
    e.preventDefault();
    if (spline) {
        spline.remove();
        spline = null;
    }
    if (line) {
        line.remove();
        line = null;
    }
    while (dots.length > 0) {
        dots.pop();
    }
    while (points.length > 0) {
        points.pop();
    }
    $canvas_spline.removeLayerGroup('ControlPoints');
    $canvas_spline.removeLayerGroup('SplinePoints');
    console.log("clear.");
    status = "DRAW";
});
function autoDraw() {
    if ($('#autodraw')[0].checked) {
        drawSpline();
    }
}

$showpoints.change(function () {
    showPoints();
});
function showPoints() {
    if ($showpoints[0].checked) {
        if (spline_points) {
            $canvas_spline.removeLayerGroup('SplinePoints');
            for (let i in spline_points) {
                spline_points[i].draw();
            }
        }
    }
    else {
        $canvas_spline.removeLayerGroup('SplinePoints');
    }
    $canvas_spline.drawLayers();
}
$grain.bind('input', function () {
    let t_grain = parseInt($grain[0].value);
    if (t_grain) {
        if (t_grain >= GRAIN_MIN && t_grain <= GRAIN_MAX) {
            grain = t_grain;
            $grainslider.slider('value', [t_grain]);
            grainhandle.text(t_grain);
        }
        else if(t_grain < GRAIN_MIN) {
            $grainslider.slider('value', [GRAIN_MIN]);
            grainhandle.text(GRAIN_MIN);
        }
        else if(t_grain > GRAIN_MAX) {
            $grainslider.slider('value', [GRAIN_MAX]);
            grainhandle.text(GRAIN_MAX);
        }
    }
});
$grainslider.slider({
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
        autoDraw();
    }
});
$tension.bind('input', function () {
    let t_tension = parseFloat($tension[0].value);
    if (t_tension) {
        if (t_tension >= TENSION_MIN && t_tension <= TENSION_MAX) {
            tension = t_tension;
            $tensionslider.slider('value', [t_tension]);
            tensionhandle.text(t_grain);
        }
        else if(t_tension < TENSION_MIN) {
            $tensionslider.slider('value', [TENSION_MIN]);
            tensionhandle.text(TENSION_MIN);
        }
        else if(t_tension > TENSION_MAX) {
            $tensionslider.slider('value', [TENSION_MAX]);
            tensionhandle.text(TENSION_MAX);
        }
    }
});
$tensionslider.slider({
    range: "min",
    min: 0,
    max: 1,
    value: 0.5,
    step: 0.01,
    create: function() {
        tensionhandle.text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        tensionhandle.text(ui.value);
        tension = parseFloat(ui.value);
        $('#tension')[0].value = "" + tension;
        autoDraw();
    }
});
$dotsizeslider.slider({
    value: dot_size,
    range: "min",
    min: 3,
    max: 20,
    step: 1,
    animate: true,
    orientation: "vertical",
    slide: function (event, ui) {
        dot_size = parseInt(ui.value);
        for (let i = 0;i < dots.length;i++) {
            dots[i].setRadius(dot_size);
        }
    }
});
$linewidthslider.slider({
    value: line_width,
    range: "min",
    min: 3,
    max: 20,
    step: 1,
    animate: true,
    orientation: "vertical",
    slide: function (event, ui) {
        line_width = parseInt(ui.value);
        if (spline) {
            spline.setWidth(line_width);
        }
    }
});