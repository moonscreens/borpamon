const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const { google } = require('googleapis');

const drive = google.drive({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY,
});

const getFromDrive = (fileId, dest) => {
    return new Promise((resolve, reject) => {
        drive.files.get({
            fileId,
            alt: 'media',
            mimeType: 'image/png',
            key: process.env.GOOGLE_API_KEY,
        }, {
            responseType: 'stream',
        }, (err, res) => {
            if (err) {
                console.log('initial error')
                reject(err);
            } else {
                res.data
                    .on('end', () => {
                        resolve();
                    })
                    .on('error', err => {
                        console.log('promise error')
                        reject(err);
                    })
                    .pipe(fs.createWriteStream(dest))
            }
        });
    });
};

const downloadFile = (async (url, path) => {
    if (url.toLowerCase().includes('drive.google.com')) {
        const parts = url.split('/');
        for (let index = 0; index < parts.length; index++) {
            if (parts[index] === "d") {
                try {
                    //await getFromDrive(parts[index + 1], path);
                    //url = 'data:image/png;base64,' + fs.readFileSync(path).toString('base64');
                    url = `https://www.googleapis.com/drive/v2/files/${parts[index + 1]}?key=${process.env.GOOGLE_API_KEY}&alt=media&source=downloadUrl`;
                    /*let googleResponse = await fetch(`https://www.googleapis.com/drive/v2/files/${parts[index+1]}?key=${process.env.GOOGLE_API_KEY}`);
                    googleResponse = await googleResponse.json();
                    console.log(googleResponse);
                    url = googleResponse.downloadUrl;*/
                } catch (e) {
                    console.error("Google Drive error");
                    console.error(e);
                    console.log('the URL ', url, 'failed to fetch info from google drive');
                    return;
                }
                index = parts.length;
            }
        }
    }
    let image = null;
    try {
        image = await loadImage(url);
    } catch (e) {
        console.error(e);
        console.log('the URL ', url, 'failed to download');
        return;
    }
    const max = Math.max(image.width, image.height);
    const canvas = createCanvas(max, max);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, max / 2 - image.width / 2, max / 2 - image.height / 2);

    const tempCanvas = createCanvas(1024, 1024);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, 1024, 1024);
    canvas.width = 1024;
    canvas.height = 1024;
    ctx.drawImage(tempCanvas, 0, 0);

    const out = fs.createWriteStream(path)
    const stream = canvas.createPNGStream();
    stream.pipe(out)
    console.log(`Downloaded ${path}`);
});


const borpadex = {};
let count = 0;
fetch('https://sheets.googleapis.com/v4/spreadsheets/1rEePpILD6k5x8oY9_QIutsxYS8qcmn2E9u2fDhS9HgI/values/!A:F?key=' + process.env.GOOGLE_API_KEY)
    .then(res => res.json())
    .then(json => {
        for (let index = 2; index < json.values.length; index++) {
            const element = json.values[index];
            if (element.length >= 4 && element[4] && element[4].toLowerCase().includes('http')) {
                count++;
                const imagePath = `/borpas/${element[0]}.png`;
                if (!fs.existsSync(`${__dirname}${imagePath}`)) {
                    setTimeout(() => {
                        downloadFile((element[4] && element[4] !=="") ? element[4] : element[3], `${__dirname}${imagePath}`);
                    }, 125 * count);
                }
                if (borpadex[element[0]] !== undefined) {
                    console.log(`${element[0]} already exists`);
                }
                borpadex[element[0]] = {
                    number: element[0],
                    originalName: element[1],
                    name: element[2],
                    imagePath: imagePath.replace('.png', '.webp'),
                    artist: element[5],
                }
            }
        }

        fs.writeFileSync(`${__dirname}/borpas/borpadex.json`, JSON.stringify(borpadex, null, 4));
        console.log(`Saved ${count} borpas`);
    })


