import './main.css';
import * as THREE from "three";
import Chat from 'twitch-chat-emotes';

const defaultFont = 'sans-serif';
const fancyFont = 'Pokemon, Cursive';

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

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
resize();
window.addEventListener('resize', resize);

scene.background = new THREE.Color(0xD7130E);

import frame1Src from './1.png';
import frame2Src from './2.png';
import frame3Src from './3.png';
import fetch from 'node-fetch';
const frames = [
    new THREE.TextureLoader().load(frame1Src),
    new THREE.TextureLoader().load(frame2Src),
    new THREE.TextureLoader().load(frame3Src),
];
let frameIndex = 0;
const shinyMaterial = new THREE.SpriteMaterial({
    map: frames[0],
    transparent: true,
    color: 0xffffff,
    //blending: THREE.AdditiveBlending,
    opacity: 0.9,
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
    line.scale.y = Math.random() * 3;
    line.position.x = (Math.random() * 2 - 1) * lineSpawningRange + 45;
    line.position.y = (Math.random() * 2 - 1) * lineSpawningRange + 30 * (Math.random() > 0.5 ? -1 : 1);
    line.position.z = -40;
    //line.rotation.x = Math.random() * Math.PI;
    line.rotation.y = (Math.random() - 0.5) * Math.PI / 3;
    line.rotation.z = Math.random() * Math.PI * 2;
    line.speed = Math.random() * 0.15 + 0.05;
    if (Math.random() > 0.5) line.speed *= -1;
    lines.push(line);
    scene.add(line);
}

const borpa = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
    })
);
borpa.position.z = 2;
borpa.position.x = -3;
borpa.scale.setScalar(4);
scene.add(borpa);

const borpaNumberCanvas = document.createElement('canvas');
borpaNumberCanvas.width = 1024;
borpaNumberCanvas.height = 1024;
const borpaNumberCtx = borpaNumberCanvas.getContext('2d');
borpaNumberCtx.strokeStyle = '#425FA2';
const borpaNumberTexture = new THREE.CanvasTexture(borpaNumberCanvas);
const borpaNumber = new THREE.Sprite(new THREE.SpriteMaterial({ map: borpaNumberTexture }));

const borpaNameCanvas = document.createElement('canvas');
borpaNameCanvas.width = 1024;
borpaNameCanvas.height = 1024;
const borpaNameCtx = borpaNameCanvas.getContext('2d');
borpaNameCtx.strokeStyle = '#425FA2';
const borpaNameTexture = new THREE.CanvasTexture(borpaNameCanvas);
const borpaName = new THREE.Sprite(new THREE.SpriteMaterial({ map: borpaNameTexture }));

const textSpriteSize = 8;
scene.add(borpaNumber);
scene.add(borpaName);
borpaName.position.x = -3;
borpaName.position.y = -(textSpriteSize / 2 + 2);
borpaName.position.z = 2.001;
borpaName.scale.setScalar(textSpriteSize);
borpaNumber.position.x = -3;
borpaNumber.position.y = (textSpriteSize / 2 + 2);
borpaNumber.position.z = 2.001;
borpaNumber.scale.setScalar(textSpriteSize);

const borpadex = {};
let borpaKeys = [];
let borpaIndex = -1;
fetch('./borpas/borpadex.json')
    .then(res => res.json())
    .then(json => {
        for (const key in json) {
            if (Object.hasOwnProperty.call(json, key)) {
                const element = json[key];
                borpadex[key] = {
                    texture: new THREE.TextureLoader().load(element.imagePath),
                    ...element,
                }
            }
        }
        borpaKeys = Object.keys(borpadex);
        //shuffle borpaKeys
        borpaKeys = borpaKeys.sort(() => Math.random() - 0.5);

        changeBorpa();
    });

function withLeadingZeros(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function changeBorpa() {
    borpaIndex++;
    if (borpaIndex >= borpaKeys.length) borpaIndex = 0;
    borpa.material.map = borpadex[borpaKeys[borpaIndex]].texture;
    borpa.material.needsUpdate = true;

    borpaNameCtx.clearRect(0, 0, 1024, 1024);
    borpaNameCtx.fillStyle = '#FBC816';
    const fontSize = 58;
    borpaNameCtx.lineWidth = fontSize/15;
    borpaNumberCtx.lineWidth = fontSize/15;

    borpaNameCtx.font = fontSize + 'px ' + fancyFont;
    borpaNameCtx.textAlign = 'center';
    borpaNameCtx.fillText(borpadex[borpaKeys[borpaIndex]].name, borpaNameCanvas.width / 2, fontSize);
    borpaNameCtx.strokeText(borpadex[borpaKeys[borpaIndex]].name, borpaNameCanvas.width / 2, fontSize);
    borpaNameCtx.font = fontSize * 0.5 + 'px ' + defaultFont;
    borpaNameCtx.fillStyle = '#000000';
    borpaNameCtx.fillText('Made by ' + borpadex[borpaKeys[borpaIndex]].artist, borpaNameCanvas.width / 2, fontSize * 2);
    borpaName.material.needsUpdate = true;
    borpaNameTexture.needsUpdate = true;


    borpaNumberCtx.clearRect(0, 0, 1024, 1024);
    borpaNumberCtx.fillStyle = '#FBC816';
    borpaNumberCtx.font = fontSize + 'px ' + fancyFont;
    borpaNumberCtx.textAlign = 'center';
    borpaNumberCtx.fillText(`#${withLeadingZeros(borpaKeys[borpaIndex], 4)}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize);
    borpaNumberCtx.strokeText(`#${withLeadingZeros(borpaKeys[borpaIndex], 4)}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize);
    borpaNumberCtx.font = (fontSize / 2) + 'px ' + defaultFont;
    borpaNumberCtx.fillStyle = '#000000';
    borpaNumberCtx.fillText(`${borpadex[borpaKeys[borpaIndex]].originalName}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize * 2);
    borpaNumber.material.needsUpdate = true;
    borpaNumberTexture.needsUpdate = true;


    /*borpaNameCtx.fillRect(0,0,1024, 1024);
    borpaNumberCtx.fillRect(0,0,1024, 1024);*/
}


let lastBorpaTime = Date.now();
const borpaDuration = 10000;
const transitionDuration = 1000;

let lastFrame = Date.now();
// Called once per frame
function draw() {
    window.requestAnimationFrame(draw);

    // number of seconds since the last frame was drawn
    const delta = (Date.now() - lastFrame) / 1000;

    if (Date.now() - lastBorpaTime > borpaDuration) {
        changeBorpa();
        lastBorpaTime = Date.now();
    }

    if (Date.now() - lastBorpaTime < transitionDuration) {
        const p = (Date.now() - lastBorpaTime) / transitionDuration;
        borpa.rotation.z = (1 - (1 - p) * (1 - p)) * Math.PI * 10;
    } else if (Date.now() - lastBorpaTime > borpaDuration - transitionDuration) {
        const p = (borpaDuration - (Date.now() - lastBorpaTime)) / transitionDuration;
        borpa.rotation.z = (1 - (1 - p) * (1 - p)) * Math.PI * 10;
    } else {
        borpa.rotation.z = Math.sin(Date.now() / 10000) * 0.25;
    }

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
