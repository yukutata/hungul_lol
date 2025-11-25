// 武器マッピングユーティリティ
// Eternal Return API から武器タイプと名前のマッピングを取得し、ローカライゼーションを適用
//
// 使用方法:
//
// 1. 単一の武器タイプ名を取得:
//    const weaponName = await getWeaponTypeName('DirectFire', 'jp'); // "シュリケン"
//
// 2. 全武器タイプの名前マップを取得:
//    const nameMap = await getWeaponNameMap('jp');
//    console.log(nameMap.get('Pistol')); // "ピストル"
//
// 3. 武器タイプの詳細情報を取得:
//    const details = await getWeaponTypeDetails('AssaultRifle');
//    console.log(details.localizedNames); // { jp: "アサルトライフル", kr: "돌격 소총", en: "Assault Rifle" }
//
// 4. 全武器タイプのリスト取得:
//    const allTypes = await getAllWeaponTypes(); // ['Glove', 'Tonfa', 'Bat', ...]
//
// 特徴:
// - APIデータから実際の武器情報とローカライゼーションを取得
// - フォールバック機能（APIエラー時はハードコーディングされた値を使用）
// - 30分間のキャッシュ機能
// - TypeScript対応で型安全
//
// データソース:
// - /v2/data/ItemWeapon: 実際の武器アイテム情報
// - /v2/data/WeaponTypeInfo: 武器タイプの基本情報
// - /v2/l10n/{language}: 各言語のローカライゼーションデータ

import eternalReturnAPI, { type ERItemWeapon, type ERWeaponTypeInfo } from '../api/eternalReturn';
import { fetchWithCache } from './apiCache';

// 言語定義
export type SupportedLanguage = 'Japanese' | 'Korean' | 'English';
export type LanguageCode = 'jp' | 'kr' | 'en';

// 武器タイプマッピングの型定義
export interface WeaponTypeMapping {
  weaponType: string;
  localizedNames: {
    jp: string;
    kr: string;
    en: string;
  };
  weaponTypeInfo?: ERWeaponTypeInfo;
  sampleWeapons: Array<{
    code: number;
    name: string;
    itemGrade: string;
  }>;
}


// フォールバック用のハードコーディングされた武器名（既存のCharacterStatsAdvancedPageから移植）
const FALLBACK_WEAPON_NAMES: Record<string, { jp: string; kr: string; en: string }> = {
  Glove: { jp: 'グローブ', kr: '글러브', en: 'Glove' },
  Tonfa: { jp: 'トンファー', kr: '톤파', en: 'Tonfa' },
  Bat: { jp: 'バット', kr: '방망이', en: 'Bat' },
  Whip: { jp: 'ムチ', kr: '채찍', en: 'Whip' },
  HighAngleFire: { jp: '投げ', kr: '투척', en: 'Throw' },
  DirectFire: { jp: 'シュリケン', kr: '표창', en: 'Shuriken' },
  Bow: { jp: '弓', kr: '활', en: 'Bow' },
  Crossbow: { jp: 'クロスボウ', kr: '석궁', en: 'Crossbow' },
  Pistol: { jp: 'ピストル', kr: '권총', en: 'Pistol' },
  AssaultRifle: { jp: 'アサルトライフル', kr: '돌격 소총', en: 'Assault Rifle' },
  SniperRifle: { jp: 'スナイパーライフル', kr: '저격총', en: 'Sniper Rifle' },
  OneHandSword: { jp: '短剣', kr: '단검', en: 'Dagger' },
  TwoHandSword: { jp: '両手剣', kr: '양손검', en: 'Two-Handed Sword' },
  Axe: { jp: '斧', kr: '도끼', en: 'Axe' },
  DualSword: { jp: '双剣', kr: '쌍검', en: 'Dual Swords' },
  Hammer: { jp: 'ハンマー', kr: '망치', en: 'Hammer' },
  Spear: { jp: '槍', kr: '창', en: 'Spear' },
  Nunchaku: { jp: 'ヌンチャク', kr: '쌍절곤', en: 'Nunchaku' },
  Rapier: { jp: 'レイピア', kr: '레이피어', en: 'Rapier' },
  Guitar: { jp: 'ギター', kr: '기타', en: 'Guitar' },
  Camera: { jp: 'カメラ', kr: '카메라', en: 'Camera' },
  Arcana: { jp: 'アルカナ', kr: '아르카나', en: 'Arcana' },
  VFArm: { jp: 'VFアーム', kr: 'VF의수', en: 'VF Arm' },
  Blade: { jp: 'ブレード', kr: '블레이드', en: 'Blade' },
};

// 全ての武器タイプマッピングを取得
export async function fetchWeaponTypeMappings(): Promise<Map<string, WeaponTypeMapping>> {
  return await fetchWithCache('weaponTypeMappings', async () => {
    try {
      // 並行して各種データを取得
      const [itemWeapons, weaponTypeInfo, jpLocalization, krLocalization, enLocalization] = await Promise.all([
        eternalReturnAPI.getItemWeapons(),
        eternalReturnAPI.getWeaponTypeInfo(),
        eternalReturnAPI.getLocalizationData('Japanese'),
        eternalReturnAPI.getLocalizationData('Korean'),
        eternalReturnAPI.getLocalizationData('English'),
      ]);

      // 武器タイプごとにグループ化
      const weaponsByType = new Map<string, ERItemWeapon[]>();
      itemWeapons.forEach(weapon => {
        if (weapon.weaponType) {
          if (!weaponsByType.has(weapon.weaponType)) {
            weaponsByType.set(weapon.weaponType, []);
          }
          weaponsByType.get(weapon.weaponType)!.push(weapon);
        }
      });

      // 武器タイプ情報をマップに変換
      const weaponTypeInfoMap = new Map<string, ERWeaponTypeInfo>();
      weaponTypeInfo.forEach(info => {
        weaponTypeInfoMap.set(info.code, info);
      });

      // 武器タイプマッピングを構築
      const mappings = new Map<string, WeaponTypeMapping>();

      weaponsByType.forEach((weapons, weaponType) => {
        // ローカライゼーションから名前を取得
        const getLocalizedName = (locMap: Map<string, string>, fallback: string): string => {
          const localizedName = locMap.get(`WeaponType/Name/${weaponType}`);
          return localizedName || fallback;
        };

        // フォールバック名を取得
        const fallbackNames = FALLBACK_WEAPON_NAMES[weaponType] || {
          jp: weaponType,
          kr: weaponType,
          en: weaponType
        };

        const localizedNames = {
          jp: getLocalizedName(jpLocalization, fallbackNames.jp),
          kr: getLocalizedName(krLocalization, fallbackNames.kr),
          en: getLocalizedName(enLocalization, fallbackNames.en),
        };

        // サンプル武器を選択（各グレードから1つずつ、最大5つ）
        const sampleWeapons = weapons
          .filter(weapon => weapon.name && weapon.itemGrade)
          .reduce((acc, weapon) => {
            // グレードごとに1つずつ選択
            const existing = acc.find(w => w.itemGrade === weapon.itemGrade);
            if (!existing) {
              acc.push({
                code: weapon.code,
                name: weapon.name,
                itemGrade: weapon.itemGrade,
              });
            }
            return acc;
          }, [] as Array<{ code: number; name: string; itemGrade: string }>)
          .slice(0, 5); // 最大5つまで

        mappings.set(weaponType, {
          weaponType,
          localizedNames,
          weaponTypeInfo: weaponTypeInfoMap.get(weaponType),
          sampleWeapons,
        });
      });

      return mappings;
    } catch (error) {
      console.error('Failed to fetch weapon type mappings:', error);

      // エラー時はフォールバックマッピングを作成
      const fallbackMappings = new Map<string, WeaponTypeMapping>();
      Object.entries(FALLBACK_WEAPON_NAMES).forEach(([weaponType, names]) => {
        fallbackMappings.set(weaponType, {
          weaponType,
          localizedNames: names,
          sampleWeapons: [],
        });
      });
      return fallbackMappings;
    }
  }, 30 * 60 * 1000); // 30分キャッシュ
}

// 特定の言語での武器名マップを取得
export async function getWeaponNameMap(language: LanguageCode): Promise<Map<string, string>> {
  const mappings = await fetchWeaponTypeMappings();
  const nameMap = new Map<string, string>();

  mappings.forEach((mapping, weaponType) => {
    nameMap.set(weaponType, mapping.localizedNames[language]);
  });

  return nameMap;
}

// 単一の武器タイプ名を取得
export async function getWeaponTypeName(weaponType: string, language: LanguageCode): Promise<string> {
  try {
    const mappings = await fetchWeaponTypeMappings();
    const mapping = mappings.get(weaponType);

    if (mapping) {
      return mapping.localizedNames[language];
    }

    // フォールバック
    const fallback = FALLBACK_WEAPON_NAMES[weaponType];
    if (fallback) {
      return fallback[language];
    }

    return weaponType; // 最終フォールバック
  } catch (error) {
    console.error(`Failed to get weapon type name for ${weaponType}:`, error);

    // エラー時のフォールバック
    const fallback = FALLBACK_WEAPON_NAMES[weaponType];
    return fallback ? fallback[language] : weaponType;
  }
}

// 武器タイプの詳細情報を取得
export async function getWeaponTypeDetails(weaponType: string): Promise<WeaponTypeMapping | null> {
  try {
    const mappings = await fetchWeaponTypeMappings();
    return mappings.get(weaponType) || null;
  } catch (error) {
    console.error(`Failed to get weapon type details for ${weaponType}:`, error);
    return null;
  }
}

// 全武器タイプのリストを取得
export async function getAllWeaponTypes(): Promise<string[]> {
  try {
    const mappings = await fetchWeaponTypeMappings();
    return Array.from(mappings.keys()).sort();
  } catch (error) {
    console.error('Failed to get all weapon types:', error);
    return Object.keys(FALLBACK_WEAPON_NAMES);
  }
}

// 武器タイプマッピングキャッシュをクリア
export async function clearWeaponMappingCache(): Promise<void> {
  const { apiCache } = await import('./apiCache');
  apiCache.remove('weaponTypeMappings');
}

// 開発/デバッグ用: 武器マッピング統計を取得
export async function getWeaponMappingStats(): Promise<{
  totalWeaponTypes: number;
  weaponTypesWithLocalization: { jp: number; kr: number; en: number };
  totalWeapons: number;
  weaponsByType: Record<string, number>;
}> {
  try {
    const mappings = await fetchWeaponTypeMappings();
    const stats = {
      totalWeaponTypes: mappings.size,
      weaponTypesWithLocalization: { jp: 0, kr: 0, en: 0 },
      totalWeapons: 0,
      weaponsByType: {} as Record<string, number>,
    };

    mappings.forEach((mapping, weaponType) => {
      // ローカライゼーション統計
      if (mapping.localizedNames.jp !== weaponType) stats.weaponTypesWithLocalization.jp++;
      if (mapping.localizedNames.kr !== weaponType) stats.weaponTypesWithLocalization.kr++;
      if (mapping.localizedNames.en !== weaponType) stats.weaponTypesWithLocalization.en++;

      // 武器数統計
      const weaponCount = mapping.sampleWeapons.length;
      stats.totalWeapons += weaponCount;
      stats.weaponsByType[weaponType] = weaponCount;
    });

    return stats;
  } catch (error) {
    console.error('Failed to get weapon mapping stats:', error);
    throw error;
  }
}