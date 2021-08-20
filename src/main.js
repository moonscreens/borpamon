import './main.css';
import * as THREE from "three";
import Chat from 'twitch-chat-emotes';

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    query_vars[key] = value;
});

if (query_vars.channels) {
    channels = query_vars.channels.split(',');
}

// create our chat instance
const ChatInstance = new Chat({
    channels,
    duplicateEmoteLimit: 5,
});

const emoteSources = {};
const emoteTextures = {};
const emoteMaterials = {};

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 10;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0xD7130E);

import frame1Src from './1.png';
import frame2Src from './2.png';
import frame3Src from './3.png';
const frames = [
    new THREE.TextureLoader().load(frame1Src),
    new THREE.TextureLoader().load(frame2Src),
    new THREE.TextureLoader().load(frame3Src),
];
let frameIndex = 0;
const shinyMaterial = new THREE.SpriteMaterial({
    map: frames[0],
});
const shinyThingy = new THREE.Sprite(shinyMaterial);
shinyThingy.scale.setScalar(15);
shinyThingy.scale.y /= 1.777;
shinyThingy.position.z += 1
scene.add(shinyThingy);

setInterval(() => {
    frameIndex += 1;
    if (frameIndex >= frames.length) {
        frameIndex = 0;
    }

    shinyMaterial.map = frames[frameIndex];
    shinyMaterial.needsUpdate = true;
}, 100);

// the fun lines in the background
const lines = [];
const lineGeometry = new THREE.PlaneBufferGeometry(300, 1);
const lineSpawningRange = 1;
for (let i = 0; i < 30; i++) {
    const line = new THREE.Mesh(lineGeometry, new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: Math.random() * 0.25,
        side: THREE.DoubleSide,
    }));
    line.position.x = (Math.random() * 2 - 1) * lineSpawningRange + 45;
    line.position.y = (Math.random() * 2 - 1) * lineSpawningRange + 30 * (Math.random() > 0.5 ? -1 : 1);
    line.position.z = -40;
    //line.rotation.x = Math.random() * Math.PI;
    line.rotation.y = (Math.random() - 0.5) * Math.PI / 2;
    line.rotation.z = Math.random() * Math.PI * 2;
    line.speed = Math.random() * 0.15 + 0.05;
    if (Math.random() > 0.5) line.speed *= -1;
    lines.push(line);
    scene.add(line);
}

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);


let lastFrame = Date.now();
// Called once per frame
function draw() {
    window.requestAnimationFrame(draw);

    // number of seconds since the last frame was drawn
    const delta = (Date.now() - lastFrame) / 1000;

    // update materials for animated emotes
    for (const key in emoteMaterials) {
        if (Object.hasOwnProperty.call(emoteMaterials, key)) {
            emoteMaterials[key].needsUpdate = true;
            emoteTextures[key].needsUpdate = true;
        }
    }

    for (let index = 0; index < lines.length; index++) {
        lines[index].rotation.z += delta * 0.1 * lines[index].speed;

    }

    for (let index = emoteArray.length - 1; index >= 0; index--) {
        const element = emoteArray[index];

        element.position.x += element.velocity.x * delta;
        element.position.y += element.velocity.y * delta;
        element.position.z += element.velocity.z * delta;

        // Remove a given set of emotes after 15 seconds have passed
        if (element.dateSpawned < Date.now() - 15000) {
            scene.remove(element);
            emoteArray.splice(index, 1);
        }
    }

    renderer.render(scene, camera);

    lastFrame = Date.now();
}


const spriteGeometry = new THREE.PlaneBufferGeometry(1, 1);
// add a callback function for when a new message with emotes is sent
const emoteArray = [];
ChatInstance.on("emotes", (emotes) => {
    const group = new THREE.Group();

    group.position.x = -5;
    group.position.y = 0;
    group.dateSpawned = Date.now();

    const direction = (Math.random() * Math.PI / 2) + Math.PI / 4;
    group.velocity = new THREE.Vector3(Math.sin(direction), Math.cos(direction, 0));
    group.velocity.multiplyScalar(1.5);

    group.rotation.z = -direction + Math.PI / 2;

    group.scale.setScalar(0.5);


    for (let index = 0; index < emotes.length; index++) {
        const emote = emotes[index];

        // cache textures/materials to save on GPU bandwidth, otherwise a material would need to be generated for every unique use of the same emote
        if (!emoteTextures[emote.id]) {
            emoteSources[emote.id] = emote;
            emoteTextures[emote.id] = new THREE.CanvasTexture(emote.gif.canvas);
            emoteTextures[emote.id].emote = emote;

            // Feel free to change this from a nearest neighbor upsampling method to match your visual style
            emoteTextures[emote.id].magFilter = THREE.NearestFilter;

            emoteMaterials[emote.id] = new THREE.MeshBasicMaterial({
                map: emoteTextures[emote.id],
                transparent: true,
            });
        }
        const sprite = new THREE.Mesh(spriteGeometry, emoteMaterials[emote.id]);
        sprite.position.x = index;

        group.add(sprite);
    }
    scene.add(group);
    emoteArray.push(group);
})

draw();
