const dotenv = require('dotenv');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const downloadFile = (async (url, path) => {
    const image = await loadImage(url);
    const max = Math.max(image.width, image.height);
    const canvas = createCanvas(max, max);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, max / 2 - image.width / 2, max / 2 - image.height / 2);

    const out = fs.createWriteStream(path)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
});


const borpadex = {};
fetch('https://sheets.googleapis.com/v4/spreadsheets/1rEePpILD6k5x8oY9_QIutsxYS8qcmn2E9u2fDhS9HgI/values/!A1:E905?key=' + process.env.GOOGLE_API_KEY)
    .then(res => res.json())
    .then(json => {
        for (let index = 1; index < json.values.length; index++) {
            const element = json.values[index];
            if (element[3]) {
                console.log(element);
                const imagePath = `/borpas/${element[0]}.png`;
                downloadFile(element[3], `${__dirname}${imagePath}`);
                borpadex[element[0]] = {
                    number: element[0],
                    originalName: element[1],
                    name: element[2],
                    imagePath: imagePath,
                    artist: element[4],
                }
            }
        }

        fs.writeFileSync(`${__dirname}/borpas/borpadex.json`, JSON.stringify(borpadex));
    })


