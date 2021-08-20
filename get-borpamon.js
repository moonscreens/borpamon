const dotenv = require('dotenv');
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const downloadFile = (async (url, path) => {
    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", reject);
        fileStream.on("finish", resolve);
    });
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


