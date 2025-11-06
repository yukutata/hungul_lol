const fs = require('fs');
const path = require('path');

// 画像ディレクトリのパス
const imagesDir = path.join(__dirname, '../public/images/champions');

// 画像ファイルのサイズ情報を取得
const getImageStats = () => {
  const files = fs.readdirSync(imagesDir);
  const pngFiles = files.filter(file => file.endsWith('.png'));
  
  let totalSize = 0;
  const fileStats = [];
  
  pngFiles.forEach(file => {
    const filePath = path.join(imagesDir, file);
    const stats = fs.statSync(filePath);
    const sizeInKB = Math.round(stats.size / 1024);
    
    totalSize += stats.size;
    fileStats.push({
      name: file,
      size: sizeInKB
    });
  });
  
  const totalSizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log('📊 画像統計情報:');
  console.log(`  総画像数: ${pngFiles.length}`);
  console.log(`  合計サイズ: ${totalSizeInMB} MB`);
  console.log(`  平均サイズ: ${Math.round(totalSize / pngFiles.length / 1024)} KB`);
  
  // 大きいファイルトップ5
  const largestFiles = fileStats.sort((a, b) => b.size - a.size).slice(0, 5);
  console.log('\n📈 最大ファイルトップ5:');
  largestFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name}: ${file.size} KB`);
  });
  
  return {
    count: pngFiles.length,
    totalSize: totalSizeInMB,
    files: fileStats
  };
};

// メイン実行
getImageStats();