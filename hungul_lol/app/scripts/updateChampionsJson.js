const fs = require('fs');
const path = require('path');

// Read the current champions.json file
const championsPath = path.join(__dirname, '../src/data/champions.json');
const champions = JSON.parse(fs.readFileSync(championsPath, 'utf8'));

// Update iconUrl to use local paths
const updatedChampions = champions.map(champion => ({
  ...champion,
  iconUrl: `/images/champions/${champion.id}.png`
}));

// Write the updated champions.json file
fs.writeFileSync(championsPath, JSON.stringify(updatedChampions, null, 2));

console.log(`Updated ${updatedChampions.length} champion entries to use local image paths.`);
console.log('Champions.json has been updated successfully!');