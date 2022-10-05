
import gsap from "https://cdn.skypack.dev/gsap"

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/GLTFLoader.js';
import { RenderPass } from 'https://unpkg.com/three@0.126.1/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.126.1/examples/jsm/postprocessing/ShaderPass.js';
import { BloomPass } from 'https://unpkg.com/three@0.126.1/examples/jsm/postprocessing/BloomPass.js';
import { EffectComposer } from 'https://unpkg.com/three@0.126.1/examples/jsm/postprocessing/EffectComposer.js';
import { CopyShader } from 'https://unpkg.com/three@0.126.1/examples/jsm/shaders/CopyShader.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.126.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'https://unpkg.com/three@0.126.1/examples/jsm/loaders/RGBELoader.js';

import Stats from 'https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js';
import { GUI } from 'https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js';
import * as dat from "https://cdn.skypack.dev/dat.gui";
//loading


const loader1 = new GLTFLoader();
const loader = new THREE.TextureLoader()
const cross = loader.load('sp.png')

// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')
let composer, mixer;
//bloom paramaters

const params = {
    exposure: .5,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 2,
};

//start scene
init();

function init() {


    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, .3);

    /**
 * Renderer
 */
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas,
        alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(new THREE.Color('#000000'), 1)
    renderer.toneMapping = THREE.ReinhardToneMapping;;
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;


    document.body.appendChild(renderer.domElement);

    /**
     * Camera
     */
    // Base camera
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 2.2
    camera.position.z = 3.8
    scene.add(camera);

    //bloom
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, .85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);






    // Load a glTF resource
    var model;
    loader1.load('scene.gltf',
        // called when the resource is loaded
        function (gltf) {
            model = gltf.scene;
            model.traverse(n => {
                if (n.isMesh)
                    n.castShadow = true;
                n.receiveShadow = true;
                if (n.material) n.material.anisotropy = 16;
            })
            scene.add(model);
            mixer = new THREE.AnimationMixer(model);
            const clip = gltf.animations[0];
            mixer.clipAction(clip.optimize()).play();

            animate();

        },

        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
        }


    );

    // Objects
    const geometry = new THREE.SphereGeometry(0, 0, 0, 0)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 4000;
    const posArray = new Float32Array(particlesCnt * 3)

    for (let i = 0; i < particlesCnt * 3; i++) {

        posArray[i] = (Math.random() - 0.5) * (Math.random() * 10)
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    // Materials
    const material = new THREE.PointsMaterial({
        size: 0.025
    })
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.025,
        map: cross,
        transparent: true

    })

    // Mesh
    const sphere = new THREE.Points(geometry, material)
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(sphere, particlesMesh)



    // Lights

    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.x = 10
    pointLight.position.y = 10
    pointLight.position.z = 1
    scene.add(pointLight)

    //light2

    const pointLight2 = new THREE.PointLight(0xff0000, 100)
    pointLight2.position.set(-5.95, -17.85, -2.31)
    pointLight2.distance = 10000;
    pointLight2.intensity = 1500;
    pointLight2.castShadow = true;
    pointLight2.shadow.bias = -0.0001;
    pointLight2.shadow.mapSize.width = 1024 * 4;
    pointLight2.shadow.mapSize.height = 1024 * 4;

    scene.add(pointLight2)
    //

    //gui.add(pointLight2.position, 'y').min(-10).max(10).step(0.01)
    //gui.add(pointLight2.position, 'x').min(-10).max(10).step(0.01)
    //gui.add(pointLight2.position, 'z').min(-10).max(10).step(0.01)
    //gui.add(pointLight2,'intensity') .min(-10).max(10).step(0.01)

    //const pointLightHelper = new THREE.PointLightHelper(pointLight2, 1)
    //scene.add(pointLightHelper)

    //light3

    const pointLight3 = new THREE.PointLight(0x008080, 100)
    pointLight3.position.set(5.95, 17.85, -2.31)
    pointLight3.distance = 10000;
    pointLight3.intensity = 1500
    pointLight3.castShadow = true;
    pointLight3.shadow.bias = -0.0001;
    pointLight3.shadow.mapSize.width = 1024 * 4;
    pointLight3.shadow.mapSize.height = 1024 * 4;

    scene.add(pointLight3)

    //gui.add(pointLight3.position, 'y').min(-10).max(10).step(0.01)
    //gui.add(pointLight3.position, 'x').min(-10).max(10).step(0.01)
    //gui.add(pointLight3.position, 'z').min(-10).max(10).step(0.01)
    //gui.add(pointLight3,'intensity') .min(-10).max(10).step(0.01)

    //const pointLightHelper1 = new THREE.PointLightHelper(pointLight3, 1)
    //scene.add(pointLightHelper1)

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    // Controls
    // const controls = new OrbitControls(camera, canvas)
    //controls.enableDamping = true



    //gui debug



    /**
     * Animate
     */


    document.addEventListener('mousemove', onDocumentMouseMove, animateParticles)
    let mouseX = 0;
    let mouseY = 0;

    let targetX = 0;
    let targetY = 0;
    let flag = 0;

    const windowX = window.innerWidth / 2;
    const windowY = window.innerHeight / 2;

    window.addEventListener('resize', onWindowResize);

    function onWindowResize() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        composer.setSize(width, height);

    }



    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowX)
        mouseY = (event.clientY - windowY)
    }

    function animateParticles(e) {
        mouseX = e.clientX / canvas.width * 20 - 10;
        mouseY = e.clientY / canvas.height * 20 - 10;
        flag = 1;

    }

    const clock = new THREE.Clock()

    const tick = () => {
        targetX = mouseX * .01
        targetY = mouseY * .01

        const deltaTime = clock.getDelta()

        if (flag == 0)
            // Update objects
            if (mouseX > 0)
                if (mouseY > 0)
                    if (model) model.rotation.y += -mouseY * (deltaTime * 0.0007)
        if (model) model.rotation.y += -mouseX * (deltaTime * 0.0007)


        if (mouseX > 0)
            if (mouseY > 0)
                particlesMesh.rotation.x += -mouseY * (deltaTime * 0.00008)
        particlesMesh.rotation.y += -mouseX * (deltaTime * 0.00008)


        // Update Orbital Controls
        // controls.update()

        // Render
        pointLight.position.set(
            camera.position.x + 10,
            camera.position.y + 10,
            camera.position.z + 10
        )

        renderer.render(scene, camera)
        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }
    function animate() {

        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        mixer.update(delta);

        composer.render();


    }
    tick()


}
