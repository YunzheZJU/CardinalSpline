/**
 * Created by Yunzhe on 2017/10/4.
 * This script file controls the spline app.
 */

'use strict';
let spline = new Spline();
let $canvas_spline = $('#splinecanvas');
let canvas_spline = $canvas_spline[0];
let $showdots = $('#showdots');
let $autodraw = $('#autodraw');
let $message = $('#spline-message');
let $chooseType = $('#choose-type');
let move = false;
let alt = false;
let isdragging = false;
let current_scale = 1;
let current_width = canvas_spline.width = window.innerWidth - 30;
let current_height = canvas_spline.height = window.innerHeight - 150;
let zeroX = current_width / 2;
let zeroY = current_height / 2;
let offsetX = 0;
let offsetY = 0;
function msg(msg) {
    console.log(msg);
    $message.text(msg);
}
$canvas_spline.translateCanvas({
    translateX: zeroX,
    translateY: zeroY
});
let bg_image = new Image('bg', 'static/images/rocket_1.png', 0, 0, 500, 500, 45, 0.5);
bg_image.draw();
resizeFnBox.push(function () {
    current_width = canvas_spline.width = window.innerWidth - 30;
    current_height = canvas_spline.height = window.innerHeight - 150;
    zeroX = current_width / 2;
    zeroY = current_height / 2;
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
function scaleCanvas(scale, eX, eY) {
    let transX = (eX - zeroX) / current_scale + offsetX;
    let transY = (eY - zeroY) / current_scale + offsetY;
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
    offsetX = transX - (eX - zeroX) / current_scale;
    offsetY = transY - (eY - zeroY) / current_scale;
}
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
        // msg(isdragging);
        if (move && alt && !isdragging) {
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
        if (!alt && !isdragging) {
            // add control points;
            msg("Adding a new control point.");
            spline.addControlPoint((e.offsetX - zeroX) / current_scale + offsetX,
                (e.offsetY - zeroY) / current_scale + offsetY);
            msg("A new control point has been added.");
        }
    }
}
function keyboardEvent(e) {
    if (e.type === 'keydown') {
        if (e.keyCode === 18) {
            // Alt down
            alt = true;
            msg("Alt is down. You can drag the canvas with your mouse.");
        }
    }
    else if (e.type === 'keyup') {
        if (e.keyCode === 18) {
            // Alt up
            alt = false;
            msg("Alt is up.");
        }
        else if (e.keyCode === 80) {
            // P up. Remove the last point and everything related
            msg("P is up. Popping the last point and everything related.");
            popControlPoint();
        }
    }
}
function popControlPoint() {
    spline.popControlPoint();
}
function clearCanvas() {
    spline.removeAll();
    btnNormalize.disable();
    btnPlay.disable();
}
function disableBtns(btn_list) {
    for (let btn of btn_list) {
        btn.disable();
    }
}
function enableBtns(btn_list) {
    for (let btn of btn_list) {
        btn.enable();
    }
}
function showElement($element) {
    $element.removeAttr("hidden");
}
function hideElement($element) {
    $element.attr('hidden', "true");
}
class Button {
    constructor($object, fun) {
        this.$ = $object;
        this.$.click(fun);
    }

    enable() {
        this.$.removeAttr("disabled");
    }

    disable() {
        this.$.attr('disabled', "true");
    }

    setText(text) {
        this.$.text(text);
    }
}
let $control_panel = $('#control-panel');
let btnPlay = new Button($('#play'), function () {
    if (spline.startAnimation()) {
        disableBtns([btnDraw, btnNormalize, btnClear, btnPlay]);
        showElement($control_panel);
    }
});
let btnPauseRestore = new Button($('#pause-restore'), function () {
    if (this.innerHTML === "暂停") {
        spline.pauseAnimation();
        enableBtns([btnStep]);
        this.innerHTML = "继续";
    }
    else if (this.innerHTML === "继续") {
        spline.restoreAnimation();
        disableBtns([btnStep]);
        this.innerHTML = "暂停";
    }
});
let btnStop = new Button($('#stop'), function () {
    spline.stopAnimation();
});
let btnStep = new Button($('#step'), function () {
    spline.stepAnimation();
});
let btnNormalize = new Button($('#normalize'), function () {
    spline.normalizeSpline(getNormType());
    btnPlay.enable();
});
let btnDraw = new Button($('#draw'), function () {
    spline.makeSpline();
});
let btnClear = new Button($('#clear'), null);
function initPanel() {
    btnPauseRestore.setText("暂停");
    enableBtns([btnDraw, btnNormalize, btnClear, btnPlay]);
    disableBtns([btnStep]);
    hideElement($control_panel);
}
function showPanel() {
    enableBtns([btnNormalize]);
    showElement($chooseType);
    disableBtns([btnPlay]);
}
function getNormType() {
    let $active_type = $('a.active.nav-link');
    if ($active_type.attr('id') === "norm-type-1-tab") {
        return NORMALIZE_METHOD_TYPE_1;
    }
    else if ($active_type.attr('id') === "norm-type-2-tab") {
        return NORMALIZE_METHOD_TYPE_2;
    }
    else if ($active_type.attr('id') === "norm-type-3-tab") {
        return NORMALIZE_METHOD_TYPE_3;
    }
    else if ($active_type.attr('id') === "norm-type-4-tab") {
        return NORMALIZE_METHOD_TYPE_4;
    }
    else {
        return 0;
    }
}
$showdots.change(function () {
    spline.setShowDots($showdots[0].checked);
});
$autodraw.change(function () {
    spline.setAutoDraw($autodraw[0].checked);
});
function initSlider($slider, $handle, min, max, step, value, slideFn) {
    $slider.slider({
        range: "min",
        min: min,
        max: max,
        value: value,
        step: step,
        animate: true,
        create: function () {
            $handle.text($(this).slider("value"));
        },
        slide: function (event, ui) {
            $handle.text(ui.value);
            slideFn(ui.value);
        }
    })
}
let sliders = [
    [$("#grainslider"), $("#grainhandle"), GRAIN_MIN, GRAIN_MAX, 1, GRAIN_DEFAULT, function (value) {
        spline.setGrain(parseInt(value));
    }],
    [$("#tensionslider"), $("#tensionhandle"), TENSION_MIN, TENSION_MAX, 0.01, TENSION_DEFAULT, function (value) {
        spline.setTension(parseFloat(value));
    }],
    [$("#dotsizeslider"), $("#dotsizehandle"), 3, 20, 1, CONTROL_POINT_SIZE_DEFAULT, function (value) {
        spline.setDotSize(parseInt(value));
    }],
    [$("#linewidthslider"), $("#linewidthhandle"), 3, 20, 1, LINE_WIDTH_DEFAULT, function (value) {
        spline.setLineWidth(parseInt(value));
    }],
    [$("#frameslider"), $("#framehandle"), 5, 50, 1, FRAMES_DENSITY_DEFAULT, function (value) {
        spline.setFrameDensity(parseInt(value), getNormType());
    }]
];
for (let slider of sliders) {
    initSlider(slider[0], slider[1], slider[2], slider[3], slider[4], slider[5], slider[6]);
}