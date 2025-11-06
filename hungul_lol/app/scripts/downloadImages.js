const fs = require('fs');
const path = require('path');
const https = require('https');
const championsData = require('../src/data/champions.json');

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../public/images/champions', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.error(`Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`Error downloading ${filename}:`, err.message);
      fs.unlink(filePath, () => {}); // Delete the file if error
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  console.log(`Starting download of ${championsData.length} champion images...`);
  
  for (let i = 0; i < championsData.length; i++) {
    const champion = championsData[i];
    const filename = `${champion.id}.png`;
    
    try {
      await downloadImage(champion.iconUrl, filename);
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to download ${champion.nameEn} (${champion.id}):`, error.message);
    }
    
    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${championsData.length} images processed`);
    }
  }
  
  console.log('Download completed!');
};

downloadAllImages().catch(console.error);