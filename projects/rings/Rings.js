'use strict';

var scene,
    renderer,
    camera,
    cameraControls,

    obj,

    container,

    counter = 0,

    cWidth = 0,
    cHeight = 0,

    then;

var attributes,
    uniforms;

function init() {
    container = document.querySelector('.canvas');
    buildScene();
    buildObj();
    resize();
    update(Date.now());
    window.addEventListener('resize', resize);
}

function buildScene() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    renderer.setSize(cWidth, cHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, cWidth / cHeight, 1, 10000);
    camera.position.set(-400, -1880, 345);
    camera.lookAt(new THREE.Vector3());

    window.cam = camera;
    scene.add(camera);

    cameraControls = new THREE.TrackballControls(camera, container);

}

function buildObj() {


    var geo = new THREE.Geometry();

    for (var i = 0; i < 400; i++) {
        var curve = new THREE.EllipseCurve(
            0, 0,
            300 + 5 * i, 300 + 5 * i,
            0, 2 * Math.PI,
            false
        );

        var path = new THREE.Path(curve.getPoints(200));
        var geometry = path.createPointsGeometry(200);

        geo.merge(geometry);

    }

    attributes = {};

    uniforms = {
        time: {type: 'f', value: 0.1},
        strength: {type: 'f', value: 0},
        color1: {type: 'c', value: new THREE.Color(0x1F343D)},
        color2: {type: 'c', value: new THREE.Color(0xE50374)}
    };

    var mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        attributes: attributes,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    obj = new THREE.Line(geo, mat);

    scene.add(obj);
}

function resize() {
    cWidth = container.clientWidth;
    cHeight = container.clientHeight;

    camera.aspect = cWidth / cHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(cWidth, cHeight);
}

function update(time) {
    requestAnimationFrame(update);

    cameraControls.update();

    if (!then) then = time;
    var delta = time - then;

    then = time;
    counter += 0.0002 * delta;

    obj.rotation.set(time * 0.00001, time * 0.00002, time * 0.00003);

    uniforms.time.value = time;
    uniforms.strength.value = Math.sin(time / 8000) * 100;

    renderer.render(scene, camera);

}

init();