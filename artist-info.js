const fs = require('fs');

const borpas = JSON.parse(fs.readFileSync(`${__dirname}/borpas/borpadex.json`));

const borpaArray = Object.keys(borpas).map(key => borpas[key]);

const artists = {};

for (let index = 0; index < borpaArray.length; index++) {
	const element = borpaArray[index];
	if (artists.hasOwnProperty(element.artist)) {
		artists[element.artist].count++;
	} else {
		artists[element.artist] = {count: 1, name: element.artist};
	}
};


const artistArray = Object.keys(artists).map(key => artists[key]).sort((a, b) => b.count - a.count);

const totalBorpaCount = borpaArray.length;
let everyoneElse = 100;
const cutoff = 10;
for (let index = 0; index < Math.min(cutoff, artistArray.length); index++) {
	const element = artistArray[index];
	element.percentage = (element.count / totalBorpaCount) * 100;
	everyoneElse -= element.percentage;
	console.log(`${element.name} - ${element.count} (${element.percentage.toFixed(2)}% of borpas)`);
}
console.log(`${artistArray.length - cutoff} other artists - ${everyoneElse.toFixed(2)}% of borpas`);

fs.writeFileSync(`${__dirname}/artists.json`, JSON.stringify(artistArray, null, 4));