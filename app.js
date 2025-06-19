import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const camera = new THREE.PerspectiveCamera(
    10,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 13;

const scene = new THREE.Scene();

let bee, mixer, activeAction;
let animations = [];

const loader = new GLTFLoader();
loader.load('san.glb',
    function (gltf) {
        bee = gltf.scene;
        scene.add(bee);

        animations = gltf.animations;
        mixer = new THREE.AnimationMixer(bee);

        playAnimation('_bee_hover_skeletal.1');
        modelMove();
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// animate
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02);
};
reRender3D();

// animation clip switcher
function playAnimation(name) {
    if (!mixer || animations.length === 0) return;

    const clip = animations.find(clip => clip.name === name);
    if (!clip) {
        console.warn(`Animation clip "${name}" not found`);
        return;
    }

    const action = mixer.clipAction(clip);
    if (activeAction !== action) {
        if (activeAction) activeAction.fadeOut(0.5);
        action.reset().fadeIn(0.5).play();
        activeAction = action;
    }
}

// position + animation per section
let arrPositionModel = [
    {
        id: 'banner',
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 1.5, z: 0 },
        animationClip: '_bee_hover_skeletal.1'
    },
    {
        id: "intro",
        position: { x: 1, y: -1, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 },
        animationClip: '1'
    },
    {
        id: "description",
        position: { x: -1, y: -1, z: -20 },
        rotation: { x: 0, y: 0.5, z: 0 },
        animationClip: '_bee_take_off_and_land_skeletal.1'
    },
    {
        id: "contact",
        position: { x: 4, y: -1, z: -20 },
        rotation: { x: 0.3, y: -2, z: 0 },
        animationClip: 'Static_Pose'
    },
];

// scroll-based animation/position change
const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;
    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSection = section.id;
        }
    });

    let position_active = arrPositionModel.findIndex(val => val.id === currentSection);
    if (position_active >= 0) {
        let new_coordinates = arrPositionModel[position_active];

        // animate position and rotation
        gsap.to(bee.position, {
            x: new_coordinates.position.x,
            y: new_coordinates.position.y,
            z: new_coordinates.position.z,
            duration: 3,
            ease: "power1.out"
        });
        gsap.to(bee.rotation, {
            x: new_coordinates.rotation.x,
            y: new_coordinates.rotation.y,
            z: new_coordinates.rotation.z,
            duration: 3,
            ease: "power1.out"
        });

        // play animation
        if (new_coordinates.animationClip) {
            playAnimation(new_coordinates.animationClip);
        }
    }
};

// listeners
window.addEventListener('scroll', () => {
    if (bee) {
        modelMove();
    }
});
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
