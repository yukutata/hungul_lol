const fs = require('fs');
const path = require('path');
const https = require('https');

// 高品質画像が利用可能なチャンピオンのリスト
const specificImageUrls = {
  'fiddlesticks': 'https://opgg-static.akamaized.net/meta/images/lol/15.22.1/champion/Fiddlesticks.png?image=c_crop,h_103,w_103,x_9,y_9/q_auto:good,f_webp,w_160,h_160&v=1522',
  // 必要に応じて他のチャンピオンも追加可能
};

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../public/images/champions', filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Updated: ${filename}`);
          resolve();
        });
      } else {
        console.error(`❌ Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      console.error(`❌ Error downloading ${filename}:`, err.message);
      fs.unlink(filePath, () => {}); // Delete the file if error
      reject(err);
    });
  });
};

const updateSpecificImages = async () => {
  console.log(`🚀 Updating ${Object.keys(specificImageUrls).length} specific champion images...`);
  
  for (const [championId, imageUrl] of Object.entries(specificImageUrls)) {
    const filename = `${championId}.png`;
    
    try {
      await downloadImage(imageUrl, filename);
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to update ${championId}:`, error.message);
    }
  }
  
  console.log('✅ Specific image updates completed!');
};

updateSpecificImages().catch(console.error);