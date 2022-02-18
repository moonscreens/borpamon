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
const lineGeometry = new THREE.PlaneBufferGeometry(400, 1);
const lineSpawningRange = 0;
for (let i = 0; i < 60; i++) {
    const line = new THREE.Mesh(lineGeometry, new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: Math.random() * 0.15,
        side: THREE.DoubleSide,
    }));
    line.scale.y = Math.random() * 3;
    line.position.x = (Math.random() * 2 - 1) * lineSpawningRange + 50;
    line.position.y = (Math.random() * 2 - 1) * lineSpawningRange - 40;
    line.position.z = -40 + Math.random();
    //line.rotation.x = Math.random() * Math.PI;
    //line.rotation.y = (Math.random() - 0.5) * Math.PI / 3;
    line.rotation.z = Math.random() * Math.PI * 2;
    line.speed = Math.random() * 0.1 + 0.01;
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

const getWrappedText = (ctx, text, maxWidth) => {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

const getLetterWidth = (ctx, letter) => {
    const metrics = ctx.measureText(letter);
    return metrics.width; //metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
}

const drawFancyText = (text, y = 0, ctx, canvas) => {
    // draw the letters one at a time to avoid the stroke overlapping
    let width = 0;
    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        width += getLetterWidth(ctx, letter);
    }

    let x = canvas.width / 2 - width / 2;
    const letterArray = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        letterArray[i] = { letter, x };
        x += getLetterWidth(ctx, letter);
    }

    //const shuffledText = letterArray.sort(() => Math.random() - 0.5);

    // sort vowels to be last
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const shuffledText = letterArray.reverse().sort((a, b) => {
        if (vowels.includes(a.letter) && vowels.includes(b.letter)) {
            return 0;
        } else if (vowels.includes(a.letter)) {
            return 1;
        } else if (vowels.includes(b.letter)) {
            return -1;
        } else {
            return 0;
        }
    });

    for (let i = 0; i < shuffledText.length; i++) {
        const letter = shuffledText[i];
        ctx.fillText(letter.letter, letter.x, y);
        ctx.strokeText(letter.letter, letter.x, y);
    }
}
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const borpadex = {};
let borpaKeys = [];
let borpaIndex = -1;
const loader = new THREE.TextureLoader();
fetch('./borpas/borpadex.json?v='+Date.now())
    .then(res => res.json())
    .then(json => {
        for (const key in json) {
            if (Object.hasOwnProperty.call(json, key)) {
                const element = json[key];
                borpadex[key] = {
                    ...element,
                }
            }
        }
        borpaKeys = Object.keys(borpadex);
        //shuffle borpaKeys
        shuffleArray(borpaKeys);

        changeBorpa();
    });

function withLeadingZeros(str, length) {
    let numbers = "";
    let letters = "";
    for (let index = 0; index < str.length; index++) {
        // check if str[index] is a number
        if (!isNaN(str[index])) {
            numbers += str[index];
        } else {
            letters += str[index];
        }
    }
    while (numbers.length < length) {
        numbers = '0' + numbers;
    }
    return numbers + letters;
}

function changeBorpa() {
    borpaIndex++;
    if (borpaIndex >= borpaKeys.length) borpaIndex = 0;

	if (borpadex[borpaKeys[borpaIndex]].texture) {
		borpadex[borpaKeys[borpaIndex]].texture.dispose();
		delete borpadex[borpaKeys[borpaIndex]].texture;
	}

	//ensure next 3 textures are loaded
	for (let index = borpaIndex; index < borpaIndex + 3; index++) {
		const element = borpadex[borpaKeys[index]];
		if (!element.texture) {
			element.texture = loader.load(element.imagePath);
		}
	}

    borpa.material.map = borpadex[borpaKeys[borpaIndex]].texture;
    borpa.material.needsUpdate = true;

    borpaNameCtx.clearRect(0, 0, 1024, 1024);
    borpaNameCtx.fillStyle = '#FBC816';
    const fontSize = 58;
    borpaNameCtx.lineWidth = fontSize / 15;
    borpaNumberCtx.lineWidth = fontSize / 15;

    borpaNameCtx.font = fontSize + 'px ' + fancyFont;
    borpaNameCtx.textAlign = 'center';
    //borpaNameCtx.fillText(borpadex[borpaKeys[borpaIndex]].name, borpaNameCanvas.width / 2, fontSize);
    //borpaNameCtx.strokeText(borpadex[borpaKeys[borpaIndex]].name, borpaNameCanvas.width / 2, fontSize);
    const wrappedText = getWrappedText(borpaNameCtx, borpadex[borpaKeys[borpaIndex]].name, borpaNameCanvas.width * 0.9);
    for (let i = 0; i < wrappedText.length; i++) {
        drawFancyText(wrappedText[i], fontSize + fontSize * i, borpaNameCtx, borpaNameCanvas);
    }
    borpaNameCtx.font = fontSize * 0.5 + 'px ' + defaultFont;
    borpaNameCtx.fillStyle = '#000000';
    borpaNameCtx.fillText('Made by ' + borpadex[borpaKeys[borpaIndex]].artist, borpaNameCanvas.width / 2, fontSize * (wrappedText.length + 1));
    borpaName.material.needsUpdate = true;
    borpaNameTexture.needsUpdate = true;


    borpaNumberCtx.clearRect(0, 0, 1024, 1024);
    borpaNumberCtx.fillStyle = '#FBC816';
    borpaNumberCtx.font = fontSize + 'px ' + fancyFont;
    borpaNumberCtx.textAlign = 'center';
    //borpaNumberCtx.fillText(`#${withLeadingZeros(borpaKeys[borpaIndex], 4)}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize);
    //borpaNumberCtx.strokeText(`#${withLeadingZeros(borpaKeys[borpaIndex], 4)}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize);
    drawFancyText(`#${withLeadingZeros(borpaKeys[borpaIndex], 4)}`, borpaNumberCanvas.height - fontSize, borpaNumberCtx, borpaNumberCanvas);
    borpaNumberCtx.font = (fontSize / 2) + 'px ' + defaultFont;
    borpaNumberCtx.fillStyle = '#000000';
    borpaNumberCtx.fillText(`${borpadex[borpaKeys[borpaIndex]].originalName}`, borpaNumberCanvas.width / 2, borpaNumberCanvas.height - fontSize * 2);
    borpaNumber.material.needsUpdate = true;
    borpaNumberTexture.needsUpdate = true;


    /*borpaNameCtx.fillRect(0,0,1024, 1024);
    borpaNumberCtx.fillRect(0,0,1024, 1024);*/
}

import questionMarkURL from './question-mark.png';
const questionMarkMat = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(questionMarkURL),
    transparent: true,
});
const questionMarkGeom = new THREE.PlaneBufferGeometry(1, 1);
const spawnQuestionMark = () => {
    const questionMark = new THREE.Mesh(questionMarkGeom, questionMarkMat);
    questionMark.position.x = -3;
    questionMark.position.z = 1.1;
    questionMark.scale.setScalar(1);
    const dir = Math.random() * Math.PI * 2;
    questionMark.velocity = new THREE.Vector3(Math.sin(dir), Math.cos(dir), Math.random() * 2 - 1);
    scene.add(questionMark);
    questionMarks.push(questionMark);
    questionMark.spawnTime = Date.now();
}
const questionMarks = [];


let lastBorpaTime = Date.now();
const borpaDuration = 8000;
const transitionInDuration = 3000;
const transitionOutDuration = 500;

let lastQuestionMark = Date.now();

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

    if (Date.now() - lastBorpaTime < transitionInDuration) {

        const p = (Date.now() - lastBorpaTime) / transitionInDuration;
        borpa.material.opacity = p;
        borpa.material.color = new THREE.Color(0x000000);
        borpaName.material.opacity = 0;
        borpaNumber.material.opacity = 0;

        //stop rotating sooner in the transition
        const p2 = Math.min(1, (Date.now() - lastBorpaTime) / transitionInDuration);
        borpa.rotation.z = (1 - (Math.pow(1 - p2, 3))) * Math.PI * 4;

        if (Date.now() - lastQuestionMark > 500 && p2 !== 1) {
            spawnQuestionMark();
            lastQuestionMark = Date.now();
        }

    } else if (Date.now() - lastBorpaTime > borpaDuration - transitionOutDuration) {
        const p = (borpaDuration - (Date.now() - lastBorpaTime)) / transitionOutDuration;
        borpa.rotation.z = (1 - Math.pow(1 - p, 3)) * Math.PI * -4;
        borpa.material.opacity = p;
    } else {
        borpaName.material.opacity = 1;
        borpaNumber.material.opacity = 1;
        borpa.material.opacity = 1;
        borpa.material.color = new THREE.Color(0xFFFFFF);
        borpa.rotation.z = 0;//Math.sin(Date.now() / 10000) * 0.25;
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

    const questionMarkLife = 3500;
    const questionMarkTransition = 500;
    for (let index = questionMarks.length - 1; index >= 0; index--) {
        const element = questionMarks[index];

        if (Date.now() - element.spawnTime < questionMarkTransition) {
            let p = Math.min(1, (Date.now() - element.spawnTime) / questionMarkTransition);
            element.scale.setScalar(p);
        } else if (Date.now() - element.spawnTime > questionMarkLife - questionMarkTransition) {
            let p = (questionMarkLife - (Date.now() - element.spawnTime)) / questionMarkTransition;
            element.scale.setScalar(p);
        }

        element.position.x += element.velocity.x * delta;
        element.position.y += element.velocity.y * delta;
        element.rotation.z += element.velocity.z * delta;
        if (element.spawnTime < Date.now() - questionMarkLife) {
            scene.remove(element);
            questionMarks.splice(index, 1);
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

    group.position.x = 9;
    group.position.y = -5.5;
    group.dateSpawned = Date.now();

    const direction = (Math.PI * 1.25) + (Math.random() * Math.PI * 0.4) + Math.PI * 0.3;
    group.velocity = new THREE.Vector3(Math.sin(direction), Math.cos(direction, 0));
    group.velocity.multiplyScalar(1.5);

    group.rotation.z = -direction - Math.PI / 2;

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
