const fs = require('fs');
const https = require('https');
const path = require('path');

// エターナルリターンキャラクターデータの読み込み
const eternalReturnData = require('../src/data/eternal-return-characters.json');

// 画像保存ディレクトリ
const imageDir = path.join(__dirname, '..', 'public', 'images', 'eternal-return');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// dak.ggのCDNから画像URLを生成
function generateImageUrl(characterId) {
  // キャラクター名の変換（スペースやアンパサンドの処理）
  let urlName = characterId;
  
  // 特殊文字の処理
  if (characterId === 'debi_marlene') {
    urlName = 'Debi%26Marlene'; // & -> %26
  } else if (characterId === 'li_dailin') {
    urlName = 'LiDailin'; // スペース削除
  } else {
    // 最初の文字を大文字に
    urlName = characterId.charAt(0).toUpperCase() + characterId.slice(1);
  }
  
  return `https://cdn.dak.gg/assets/er/game-assets/9.2.0/CharProfile_${urlName}_S000.png`;
}

// 画像をダウンロードする関数
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imageDir, filename);
    
    // ファイルが既に存在する場合はスキップ
    if (fs.existsSync(filePath)) {
      console.log(`✅ Already exists: ${filename}`);
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        fs.unlink(filePath, () => {}); // 失敗したファイルを削除
        console.log(`❌ Failed to download ${filename}: HTTP ${response.statusCode}`);
        console.log(`   URL: ${url}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // 失敗したファイルを削除
      console.log(`❌ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

// メイン処理
async function downloadAllImages() {
  console.log(`📥 Starting download of ${eternalReturnData.length} Eternal Return character images...`);
  console.log(`📁 Save directory: ${imageDir}`);
  
  let successCount = 0;
  let failedCount = 0;
  const failedImages = [];
  
  for (const character of eternalReturnData) {
    try {
      const imageUrl = generateImageUrl(character.id);
      const filename = `${character.id}.png`;
      
      console.log(`⬇️  Downloading ${character.nameKo} (${character.nameEn}): ${filename}`);
      await downloadImage(imageUrl, filename);
      successCount++;
      
      // レート制限対策として少し待機
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`❌ Failed: ${character.nameKo} (${character.nameEn})`);
      failedImages.push({
        character: character.nameEn,
        id: character.id,
        error: error.message
      });
      failedCount++;
    }
  }
  
  console.log('\n📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount}`);
  console.log(`❌ Failed downloads: ${failedCount}`);
  
  if (failedImages.length > 0) {
    console.log('\n❌ Failed images:');
    failedImages.forEach(failed => {
      console.log(`   - ${failed.character} (${failed.id}): ${failed.error}`);
    });
    
    console.log('\n🔧 You can manually download these images:');
    failedImages.forEach(failed => {
      const manualUrl = generateImageUrl(failed.id);
      console.log(`   ${failed.character}: ${manualUrl}`);
    });
  }
  
  // 保存された画像の統計
  const savedImages = fs.readdirSync(imageDir).filter(file => file.endsWith('.png'));
  console.log(`\n📁 Total images in directory: ${savedImages.length}`);
  
  // ファイルサイズの計算
  let totalSize = 0;
  savedImages.forEach(filename => {
    const filePath = path.join(imageDir, filename);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });
  
  console.log(`💾 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📏 Average size: ${(totalSize / savedImages.length / 1024).toFixed(2)} KB per image`);
  
  console.log('\n🎉 Download process completed!');
}

// スクリプト実行
if (require.main === module) {
  downloadAllImages().catch(console.error);
}

module.exports = { downloadAllImages, generateImageUrl };