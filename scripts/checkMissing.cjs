const fs = require('fs');
const characters = require('../src/data/eternal-return-characters.json');
const imageDir = '../public/images/eternal-return/';

const missing = characters.filter(char => !fs.existsSync(imageDir + char.id + '.png'));
console.log('Missing images:', missing.map(char => `${char.nameEn} (${char.id})`).join(', '));
console.log('Total missing:', missing.length);