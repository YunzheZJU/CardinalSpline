/**
 * Created by Yunzhe on 2017/10/1.
 */

'use strict';
class Dots extends Array{
    echo() {
        msg("Hi");
    }
}
let dot_size = 8;
let line_width = 3;
let status = "DRAW";

$draw.click(function (e) {
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
                        updateSpline();
                        return;
                    }
                }
            }
        }
    }
    msg("Wrong input.");
}
function updateSpline() {
    msg(dots);
    cdn_spline = new CdnSpline(dots.map(function (dot) {
        return dot.getLocation();
    }), grain, tension);
    points = cdn_spline.calculateSpline();
    spline = new Line('rgba(255, 50, 50, 0.6)', line_width, points, 'spline');
    if (spline_points) {
        $canvas_spline.removeLayerGroup('SplinePoints').drawLayers();
    }
    spline_points = points.map(function (point) {
        return new Dot(point, 3, "rgba(50, 200, 50, 0.8)", "SplinePoint_" + points.indexOf(point),
            'SplinePoints', false);
    });
    showPoints();
    status = "VIEW";
}

let fps = 30;
let now;
let then = Date.now();
let interval = 1000 / fps;
let delta;
let frame = 0;
let animeId;
$grain.bind('input', function () {
    let t_grain = parseInt($grain[0].value);
    if (t_grain) {
        if (t_grain >= GRAIN_MIN && t_grain <= GRAIN_MAX) {
            grain = t_grain;
            $grainslider.slider('value', [t_grain]);
            $grainhandle.text(t_grain);
        }
        else if(t_grain < GRAIN_MIN) {
            $grainslider.slider('value', [GRAIN_MIN]);
            $grainhandle.text(GRAIN_MIN);
        }
        else if(t_grain > GRAIN_MAX) {
            $grainslider.slider('value', [GRAIN_MAX]);
            $grainhandle.text(GRAIN_MAX);
        }
    }
});
$grainslider.slider({
    range: "min",
    min: 1,
    max: 50,
    value: 20,
    create: function() {
        $grainhandle.text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        $grainhandle.text(ui.value);
        grain = parseInt(ui.value);
        $grain[0].value = "" + grain;
        autoDraw();
    }
});
$tension.bind('input', function () {
    let t_tension = parseFloat($tension[0].value);
    if (t_tension) {
        if (t_tension >= TENSION_MIN && t_tension <= TENSION_MAX) {
            tension = t_tension;
            $tensionslider.slider('value', [t_tension]);
            $tensionhandle.text(t_tension);
        }
        else if(t_tension < TENSION_MIN) {
            $tensionslider.slider('value', [TENSION_MIN]);
            $tensionhandle.text(TENSION_MIN);
        }
        else if(t_tension > TENSION_MAX) {
            $tensionslider.slider('value', [TENSION_MAX]);
            $tensionhandle.text(TENSION_MAX);
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
        $tensionhandle.text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        $tensionhandle.text(ui.value);
        tension = parseFloat(ui.value);
        $tension[0].value = "" + tension;
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
dots.echo();