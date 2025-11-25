// 武器マッピング機能のテスト用ファイル
// 実際のテストフレームワークではなく、手動テスト用のヘルパー関数

import {
  getWeaponNameMap,
  getWeaponTypeName,
  getWeaponTypeDetails,
  getAllWeaponTypes,
  getWeaponMappingStats
} from './weaponMapping';

// 手動テスト関数
export async function testWeaponMapping() {
  console.log('=== 武器マッピング機能テスト ===\n');

  try {
    // 1. 基本的な武器タイプ名取得のテスト
    console.log('1. 武器タイプ名取得テスト:');
    const directFireJp = await getWeaponTypeName('DirectFire', 'jp');
    const pistolKr = await getWeaponTypeName('Pistol', 'kr');
    const gloveEn = await getWeaponTypeName('Glove', 'en');

    console.log(`  DirectFire (JP): ${directFireJp}`);
    console.log(`  Pistol (KR): ${pistolKr}`);
    console.log(`  Glove (EN): ${gloveEn}\n`);

    // 2. 全武器タイプの取得テスト
    console.log('2. 全武器タイプ取得テスト:');
    const allTypes = await getAllWeaponTypes();
    console.log(`  総武器タイプ数: ${allTypes.length}`);
    console.log(`  武器タイプ: ${allTypes.slice(0, 5).join(', ')}... (最初の5つ)\n`);

    // 3. 武器名マップの取得テスト
    console.log('3. 武器名マップ取得テスト:');
    const jpNameMap = await getWeaponNameMap('jp');
    const commonWeapons = ['DirectFire', 'Pistol', 'Bow', 'TwoHandSword', 'Glove'];

    commonWeapons.forEach(weaponType => {
      const name = jpNameMap.get(weaponType);
      console.log(`  ${weaponType} → ${name}`);
    });
    console.log('');

    // 4. 武器詳細情報の取得テスト
    console.log('4. 武器詳細情報取得テスト:');
    const assaultRifleDetails = await getWeaponTypeDetails('AssaultRifle');
    if (assaultRifleDetails) {
      console.log('  AssaultRifle 詳細情報:');
      console.log(`    JP: ${assaultRifleDetails.localizedNames.jp}`);
      console.log(`    KR: ${assaultRifleDetails.localizedNames.kr}`);
      console.log(`    EN: ${assaultRifleDetails.localizedNames.en}`);
      console.log(`    サンプル武器数: ${assaultRifleDetails.sampleWeapons.length}`);
      if (assaultRifleDetails.weaponTypeInfo) {
        console.log(`    攻撃タイプ: ${assaultRifleDetails.weaponTypeInfo.attackType}`);
        console.log(`    射程タイプ: ${assaultRifleDetails.weaponTypeInfo.rangeType}`);
      }
    } else {
      console.log('  AssaultRifle の詳細情報が見つかりませんでした');
    }
    console.log('');

    // 5. 統計情報の取得テスト
    console.log('5. 武器マッピング統計テスト:');
    const stats = await getWeaponMappingStats();
    console.log(`  総武器タイプ数: ${stats.totalWeaponTypes}`);
    console.log(`  日本語ローカライゼーション数: ${stats.weaponTypesWithLocalization.jp}`);
    console.log(`  韓国語ローカライゼーション数: ${stats.weaponTypesWithLocalization.kr}`);
    console.log(`  英語ローカライゼーション数: ${stats.weaponTypesWithLocalization.en}`);
    console.log(`  総武器アイテム数: ${stats.totalWeapons}`);
    console.log('');

    // 6. フォールバック機能のテスト
    console.log('6. フォールバック機能テスト:');
    const unknownWeapon = await getWeaponTypeName('UnknownWeaponType', 'jp');
    console.log(`  不明な武器タイプ: ${unknownWeapon}`);
    console.log('');

    console.log('=== テスト完了 ===');
    return {
      success: true,
      directFireJp,
      allTypesCount: allTypes.length,
      stats
    };

  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// ブラウザのコンソールで使用するための関数
export function runWeaponMappingTest() {
  testWeaponMapping().then(result => {
    console.log('テスト結果:', result);
  });
}

// 特定の武器タイプの詳細を確認するためのヘルパー
export async function inspectWeaponType(weaponType: string) {
  console.log(`=== ${weaponType} の詳細情報 ===`);

  try {
    const details = await getWeaponTypeDetails(weaponType);

    if (!details) {
      console.log(`${weaponType} の情報が見つかりませんでした`);
      return;
    }

    console.log('ローカライゼーション:');
    console.log(`  日本語: ${details.localizedNames.jp}`);
    console.log(`  韓国語: ${details.localizedNames.kr}`);
    console.log(`  英語: ${details.localizedNames.en}`);

    if (details.weaponTypeInfo) {
      console.log('\n武器タイプ情報:');
      console.log(`  攻撃タイプ: ${details.weaponTypeInfo.attackType}`);
      console.log(`  射程タイプ: ${details.weaponTypeInfo.rangeType}`);
      console.log(`  習得時間: ${details.weaponTypeInfo.learningTime}`);
      console.log(`  基礎攻撃力: ${details.weaponTypeInfo.attackPower}`);
      console.log(`  基礎攻撃速度: ${details.weaponTypeInfo.attackSpeed}`);
      console.log(`  武器長: ${details.weaponTypeInfo.weaponLength}`);
    }

    if (details.sampleWeapons.length > 0) {
      console.log('\nサンプル武器:');
      details.sampleWeapons.forEach(weapon => {
        console.log(`  ${weapon.name} (Grade: ${weapon.itemGrade}, Code: ${weapon.code})`);
      });
    }

  } catch (error) {
    console.error(`${weaponType} の情報取得中にエラーが発生しました:`, error);
  }
}

// ブラウザのコンソールで特定の武器を調査するため
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).inspectWeaponType = inspectWeaponType;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).runWeaponMappingTest = runWeaponMappingTest;