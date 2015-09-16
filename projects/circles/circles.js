"use strict";

var PI = Math.PI,

    cWidth,
    cHeight,

    radius,

    canvas,
    ctx;

var circles = [];

var mousemoved = false;


function Circle(numPoints, radius, centerX, centerY) {
    this.numPoints = numPoints;
    this.radius = radius;
    this.center = [centerX, centerY];

    this.points = [];

    for (var i = 0; i < numPoints; i++) {
        this.points.push(rotateAroundPoint(0, 0, 0, radius, PI / numPoints * 2 * i));
    }
}

Circle.prototype = {

    draw: function (ctx) {

        ctx.save();
        ctx.translate(this.center[0], this.center[1]);
        ctx.beginPath();

        var p1 = this.points[this.numPoints - 1],
            p2 = this.points[0],
            p3 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

        ctx.moveTo(p3[0] + cWidth / 2, p3[1] + cHeight / 2);

        for (var i = 0; i < this.numPoints - 1; i++) {
            p1 = this.points[i];
            p2 = this.points[i + 1];
            p3 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

            ctx.quadraticCurveTo(p1[0] + cWidth / 2, p1[1] + cHeight / 2, p3[0] + cWidth / 2, p3[1] + cHeight / 2);
        }

        p1 = this.points[this.numPoints - 1];
        p2 = this.points[0];
        p3 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

        ctx.quadraticCurveTo(p1[0] + cWidth / 2, p1[1] + cHeight / 2, p3[0] + cWidth / 2, p3[1] + cHeight / 2);
        ctx.stroke();

        ctx.restore();
    },

    offset: function () {
        for (var i = 0; i < this.numPoints; i++) {
            var offset = 0.98 + Math.random() * 0.04;
            this.points[i][0] *= offset;
            this.points[i][1] *= offset;
        }
    },

    relax: function () {
        for (var i = 0; i < this.numPoints; i++) {
            var p = this.points[i];
            if (Math.sqrt(p[0] * p[0] + p[1] * p[1]) > this.radius + 0.1) {
                p[0] *= 0.99;
                p[1] *= 0.99;
            } else if (Math.sqrt(p[0] * p[0] + p[1] * p[1]) < this.radius - 0.1) {
                var s = this.radius / Math.sqrt(p[0] * p[0] + p[1] * p[1]);
                p[0] *= s;
                p[1] *= s;
            }
        }
    }

};


function init() {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');


    cWidth = canvas.clientWidth;
    cHeight = canvas.clientHeight;
    canvas.width = cWidth;
    canvas.height = cHeight;

    radius = Math.floor(cHeight * 0.35);

    ctx.strokeStyle = '#27405e';

    circles.push(
        new Circle(84, radius, 0, 0),
        new Circle(51, radius, 0, 0),
        new Circle(74, radius, 0, 0),
        new Circle(34, radius, 0, 0),
        new Circle(32, radius, 0, 0),
        new Circle(52, radius, 0, 0),
        new Circle(30, radius, 0, 0),
        new Circle(41, radius, 0, 0),
        new Circle(200, radius, 0, 0),
        new Circle(90, radius, 0, 0),
        new Circle(55, radius, 0, 0),
        new Circle(32, radius, 0, 0),
        new Circle(34, radius, 0, 0),
        new Circle(30, radius, 0, 0)
    );

    window.addEventListener('mousemove', function (event) {
        //mouseX = (event.clientX - cWidth / 2) * -1;
        //mouseY = event.clientY - cHeight / 2;
        mousemoved = true;
    });

    loop();
}

function rotateAroundPoint(cx, cy, x, y, radians) {
    var cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return [nx, ny];
}


function offset() {
    for (var i = 0; i < circles.length; i++) {
        circles[i].offset();
    }
}

function relax() {
    for (var i = 0; i < circles.length; i++) {
        circles[i].relax();
    }
}

function draw() {
    for (var i = 0; i < circles.length; i++) {
        circles[i].draw(ctx);
    }

    ctx.beginPath();
    ctx.arc(cWidth / 2, cHeight / 2, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, cWidth, cHeight);
    if (mousemoved) {
        offset();
        mousemoved = false;
    } else {
        relax();
    }

    draw();
}

init();