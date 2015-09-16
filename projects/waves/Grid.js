'use strict';

function Drop() {
    this.impact = new THREE.Vector3();
    this.range = 0;
    this.expansion = 0;
    this.strength = 0;

    this.tweens = [];
}

Drop.prototype = {
    start: function (point) {
        var self = this;

        this.range = 0;
        this.expansion = 0;
        this.strength = 0;

        this.impact.set(point.x, point.y, point.z);

        this.tweens.forEach(function (tween) {
            tween.onComplete = null;
            tween.stop();
        });

        this.tweens = [];

        this.tweens.push(new TWEEN
            .Tween({expansion: 0})
            .to({expansion: 1500}, 10000)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(function () {
                self.expansion = this.expansion;
            })
            .start());

        this.tweens.push(new TWEEN
            .Tween({strength: 0})
            .to({strength: 70}, 500)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(function () {
                self.strength = this.strength;
            })
            .start());

        this.tweens.push(new TWEEN
            .Tween({range: 0})
            .to({range: 150}, 5000)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .onUpdate(function () {
                self.range = this.range;
            })
            .start());

        this.tweens.push(new TWEEN
            .Tween({strength: 70})
            .to({strength: 0}, 1000)
            .onUpdate(function () {
                self.strength = this.strength;
            })
            .delay(9000)
            .start());
    }
};

var scene,
    renderer,
    camera,

    obj,

    container,
    canvas,

    counter = 0,

    cWidth = 0,
    cHeight = 0,

    raycaster,
    colors,

    then,

    clickIndex = 0,

    dropCount = 20,

    drops = [],
    impacts = [],
    ranges = [],
    expansions = [],
    strengths = [];

var attributes,
    uniforms;

function init() {
    container = document.querySelector('.canvas');
    buildScene();
    buildDrops();
    buildObj();
    resize();
    update(performance.now());
    window.addEventListener('resize', resize);
}

function buildScene() {


    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    renderer.setSize(cWidth, cHeight);
    canvas = renderer.domElement;
    container.appendChild(canvas);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, cWidth / cHeight, 1, 10000);
    camera.position.set(0, -1500, 1500);
    camera.lookAt(new THREE.Vector3);
    scene.add(camera);

    raycaster = new THREE.Raycaster();
    raycaster.params.PointCloud.threshold = 30;

    container.addEventListener('mousedown', onMousedown);
    container.addEventListener('touchstart', onTouchstart);

    colors = [
        new THREE.Color(0x4AC784),
        new THREE.Color(0x46C8FF),
        new THREE.Color(0xFF0064)
    ];

    var colorDots = document.querySelector('.colors').querySelectorAll('span');

    colorDots[0].addEventListener('click', function () {
        uniforms.activeColor.value.setRGB(colors[0].r, colors[0].g, colors[0].b);
    });
    colorDots[1].addEventListener('click', function () {
        uniforms.activeColor.value.setRGB(colors[1].r, colors[1].g, colors[1].b);
    });
    colorDots[2].addEventListener('click', function () {
        uniforms.activeColor.value.setRGB(colors[2].r, colors[2].g, colors[2].b);
    });

}

function buildDrops() {
    for (var i = 0; i < dropCount; i++) {
        drops.push(new Drop());
        impacts.push(new THREE.Vector3);
        ranges.push(0);
        expansions.push(0);
        strengths.push(0);
    }
}

function buildObj() {
    var geo = new THREE.PlaneBufferGeometry(1000, 1000, 120, 120);

    attributes = {};

    uniforms = {
        time: {type: 'f', value: 0.1},
        color: {type: 'c', value: new THREE.Color(0x27405E)},
        activeColor: {type: 'c', value: colors[Math.floor(Math.random() * colors.length)].clone()},
        impact: {type: 'v3v', value: impacts},
        range: {type: 'fv1', value: ranges},
        expansion: {type: 'fv1', value: expansions},
        strength: {type: 'fv1', value: strengths}
    };

    var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: '#define DROPCOUNT ' + dropCount + '\n' + document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
    });

    obj = new THREE.PointCloud(geo, mat);
    //obj.rotation.set(0, 0, 0.25);

    scene.add(obj);
}

function onMousedown(event) {

    var mouse = new THREE.Vector2;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    getIntersect(mouse);

}

function onTouchstart(event) {
    for (var i = 0; i < event.touches.length; i++) {
        if (event.touches[i].target === canvas) {
            event.preventDefault();
            var mouse = new THREE.Vector2;

            mouse.x = ( event.touches[i].clientX / window.innerWidth ) * 2 - 1;
            mouse.y = -( event.touches[i].clientY / window.innerHeight ) * 2 + 1;

            getIntersect(mouse);
        }
    }
}

function getIntersect(mouse) {
    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects([obj]);

    if (intersects[0]) {

        var dropIndex = clickIndex++ % dropCount;
        var currentDrop = drops[dropIndex];

        currentDrop.start(intersects[0].point);
        uniforms.impact.value[dropIndex].set(currentDrop.impact.x, currentDrop.impact.y, currentDrop.impact.z);
    }
}

function update(time) {
    requestAnimationFrame(update);

    TWEEN.update();

    if (!then) then = time;
    var delta = time - then;
    then = time;

    counter += 0.0002 * delta;
    uniforms.time.value = counter;

    for (var i = 0; i < dropCount; i++) {
        var drop = drops[i];

        uniforms.strength.value[i] = drop.strength;
        uniforms.expansion.value[i] = drop.expansion;
        uniforms.range.value[i] = drop.range;
    }

    renderer.render(scene, camera);
}

function resize() {
    cWidth = container.clientWidth;
    cHeight = container.clientHeight;

    camera.aspect = cWidth / cHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(cWidth, cHeight);
}

init();