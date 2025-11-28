import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableSortLabel,
  Divider
} from '@mui/material';
import eternalReturnAPI, {
  type ERCharacterLevelUpStat,
  type ERCharacterMastery,
  type ERMasteryStat
} from '../api/eternalReturn';
import { fetchWithCache } from '../utils/apiCache';
import { getWeaponTypeName, type LanguageCode } from '../utils/weaponMapping';
import CacheManager from '../components/CacheManager';

interface CharacterStats {
  code: number;
  name: string;
  nameKr: string;
  nameJpn: string;
  nameEn: string;
  // Base stats
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
  moveSpeed: number;
  hpRegen: number;
  spRegen: number;
  criticalStrikeChance?: number;
  // Calculated stats with mastery
  finalMaxHp: number;
  finalMaxSp: number;
  finalAttackPower: number;
  finalDefense: number;
  finalAttackSpeed: number;
  finalMoveSpeed: number;
  finalSkillAmp: number; // スキル増幅
  // Mastery info
  availableWeapons: string[];
  weaponType?: string; // 特定の武器タイプ（組み合わせ表示用）
}

type Language = LanguageCode;

type OrderBy = 'name' | 'hp' | 'attackPower' | 'defense' | 'attackSpeed' | 'moveSpeed' | 'skillAmp';
type Order = 'asc' | 'desc';

// 武器タイプの日本語名
const weaponTypeNames: Record<string, { jp: string; kr: string; en: string }> = {
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


const CharacterStatsAdvancedPage: React.FC = () => {
  const [characters, setCharacters] = useState<CharacterStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<Language>('jp');

  // レベル設定
  const [characterLevel, setCharacterLevel] = useState<number>(20);
  const [weaponMasteryLevel, setWeaponMasteryLevel] = useState<number>(20);
  const [explorationMasteryLevel, setExplorationMasteryLevel] = useState<number>(20);
  const [defenseMasteryLevel, setDefenseMasteryLevel] = useState<number>(20);

  // ソート設定
  const [orderBy, setOrderBy] = useState<OrderBy>('name');
  const [order, setOrder] = useState<Order>('asc');

  // 熟練度関連のデータ
  const [masteryStat, setMasteryStat] = useState<ERMasteryStat[]>([]);
  const [allWeaponTypes, setAllWeaponTypes] = useState<string[]>([]);
  const [weaponNames, setWeaponNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true);
        // キャッシュ付きでデータを取得
        const [
          charactersData,
          levelUpData,
          koreanLoc,
          japaneseLoc,
          englishLoc,
          masteryData,
          masteryStatData
        ] = await Promise.all([
          fetchWithCache('characters', () => eternalReturnAPI.getCharacters()),
          fetchWithCache('characterLevelUpStats', () => eternalReturnAPI.getCharacterLevelUpStats()),
          fetchWithCache('localization-korean', () => eternalReturnAPI.getLocalizationData('Korean')),
          fetchWithCache('localization-japanese', () => eternalReturnAPI.getLocalizationData('Japanese')),
          fetchWithCache('localization-english', () => eternalReturnAPI.getLocalizationData('English')),
          fetchWithCache('characterMastery', () => eternalReturnAPI.getCharacterMastery()),
          fetchWithCache('masteryStat', async () => {
            const data = await eternalReturnAPI.getMasteryStat();
            console.log('MasteryStat API Response:', data);
            if (data && data.length > 0) {
              console.log('First MasteryStat item:', data[0]);
              console.log('Sample MasteryStat for Sissela:', data.find(d => d.characterCode === 15));
            }
            return data;
          })
        ]);

        console.log('Advanced Page - Localization data loaded:', {
          koreanLocType: koreanLoc instanceof Map,
          koreanLocSize: koreanLoc instanceof Map ? koreanLoc.size : 0,
          japaneseLocType: japaneseLoc instanceof Map,
          japaneseLocSize: japaneseLoc instanceof Map ? japaneseLoc.size : 0,
          englishLocType: englishLoc instanceof Map,
          englishLocSize: englishLoc instanceof Map ? englishLoc.size : 0,
          sampleKorean: koreanLoc instanceof Map ? koreanLoc.get('Character/Name/61') : null,
          sampleJapanese: japaneseLoc instanceof Map ? japaneseLoc.get('Character/Name/61') : null
        });

        // レベルアップデータをコードでマッピング
        const levelUpMap = new Map<number, ERCharacterLevelUpStat>();
        levelUpData.forEach(stat => {
          levelUpMap.set(stat.code, stat);
        });

        // 熟練度データをマッピング
        const masteryMap = new Map<number, ERCharacterMastery>();
        masteryData.forEach(mastery => {
          masteryMap.set(mastery.code, mastery);
        });
        setMasteryStat(masteryStatData);

        // MasteryStat データの構造を確認
        console.log('=== MASTERY STAT DATA STRUCTURE CHECK ===');
        console.log('Total MasteryStat items:', masteryStatData.length);
        if (masteryStatData.length > 0) {
          console.log('First item full structure:', JSON.stringify(masteryStatData[0], null, 2));
          console.log('First item keys:', Object.keys(masteryStatData[0]));

          // シセラの熟練度データを確認
          const sisselaMasteryStats = masteryStatData.filter(stat => stat.characterCode === 15);
          console.log('Sissela mastery stats:', sisselaMasteryStats);
          sisselaMasteryStats.forEach((stat, index) => {
            console.log(`Sissela stat [${index}]:`, JSON.stringify(stat, null, 2));
          });
        }

        // 全武器タイプを収集
        const weaponTypesSet = new Set<string>();
        masteryData.forEach(mastery => {
          if (mastery.weapon1 && mastery.weapon1 !== 'None') weaponTypesSet.add(mastery.weapon1);
          if (mastery.weapon2 && mastery.weapon2 !== 'None') weaponTypesSet.add(mastery.weapon2);
          if (mastery.weapon3 && mastery.weapon3 !== 'None') weaponTypesSet.add(mastery.weapon3);
          if (mastery.weapon4 && mastery.weapon4 !== 'None') weaponTypesSet.add(mastery.weapon4);
        });
        setAllWeaponTypes(Array.from(weaponTypesSet).sort());

        // 武器タイプのローカライゼーションは getWeaponTypeName 関数で個別に取得するため
        // ここでの一括取得は不要

        // キャラクターデータを処理
        const processedData: CharacterStats[] = charactersData.map((char) => {
          const levelUpStat = levelUpMap.get(char.code);
          const mastery = masteryMap.get(char.code);

          // ローカライゼーションから名前を取得
          const koreanName = (koreanLoc instanceof Map ? koreanLoc.get(`Character/Name/${char.code}`) : null) || char.name;
          const japaneseName = (japaneseLoc instanceof Map ? japaneseLoc.get(`Character/Name/${char.code}`) : null) || char.name;

          // デバッグ: イレムの名前を確認
          if (char.code === 61) {
            console.log('Irem localization:', {
              code: char.code,
              baseName: char.name,
              koreanName,
              japaneseName,
              koreanLocType: koreanLoc instanceof Map,
              japaneseLocType: japaneseLoc instanceof Map
            });
          }

          // 使用可能な武器を取得
          const availableWeapons: string[] = [];
          if (mastery) {
            if (mastery.weapon1 && mastery.weapon1 !== 'None') availableWeapons.push(mastery.weapon1);
            if (mastery.weapon2 && mastery.weapon2 !== 'None') availableWeapons.push(mastery.weapon2);
            if (mastery.weapon3 && mastery.weapon3 !== 'None') availableWeapons.push(mastery.weapon3);
            if (mastery.weapon4 && mastery.weapon4 !== 'None') availableWeapons.push(mastery.weapon4);
          }

          // 基本ステータスを計算（レベル20想定）
          const baseStats = {
            maxHp: levelUpStat ? Math.floor(char.maxHp + (levelUpStat.maxHp * 19)) : char.maxHp,
            maxSp: levelUpStat ? Math.floor(char.maxSp + (levelUpStat.maxSp * 19)) : char.maxSp,
            attackPower: levelUpStat ? Math.floor(char.attackPower + (levelUpStat.attackPower * 19)) : char.attackPower,
            defense: levelUpStat ? Math.floor(char.defense + (levelUpStat.defense * 19)) : char.defense,
            attackSpeed: levelUpStat ? char.attackSpeed + (levelUpStat.attackSpeed * 19) : char.attackSpeed,
            moveSpeed: levelUpStat ? char.moveSpeed + (levelUpStat.moveSpeed * 19) : char.moveSpeed,
            hpRegen: levelUpStat ? char.hpRegen + (levelUpStat.hpRegen * 19) : char.hpRegen,
            spRegen: levelUpStat ? char.spRegen + (levelUpStat.spRegen * 19) : char.spRegen,
          };

          return {
            code: char.code,
            name: char.name,
            nameKr: koreanName,
            nameJpn: japaneseName,
            nameEn: char.name,
            // Base stats
            maxHp: char.maxHp,
            maxSp: char.maxSp,
            attackPower: char.attackPower,
            defense: char.defense,
            attackSpeed: char.attackSpeed,
            moveSpeed: char.moveSpeed,
            hpRegen: char.hpRegen,
            spRegen: char.spRegen,
            criticalStrikeChance: char.criticalStrikeChance || 0,
            // Initially same as base, will be calculated with mastery
            finalMaxHp: baseStats.maxHp,
            finalMaxSp: baseStats.maxSp,
            finalAttackPower: baseStats.attackPower,
            finalDefense: baseStats.defense,
            finalAttackSpeed: baseStats.attackSpeed,
            finalMoveSpeed: baseStats.moveSpeed,
            finalSkillAmp: 0, // 初期値は0
            // Mastery info
            availableWeapons: availableWeapons,
          };
        });

        setCharacters(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterData();
  }, []);

  // 言語変更時に武器名を再取得
  useEffect(() => {
    const loadWeaponNames = async () => {
      try {
        const weaponNameMap = new Map<string, string>();
        for (const weaponType of allWeaponTypes) {
          try {
            const name = await getWeaponTypeName(weaponType, language);
            weaponNameMap.set(weaponType, name);
            console.log(`Loaded weapon name: ${weaponType} -> ${name} (${language})`);
          } catch (error) {
            console.error(`Failed to get name for weapon type ${weaponType}:`, error);
            // フォールバック
            const fallback = weaponTypeNames[weaponType];
            const fallbackName = fallback ? fallback[language] : weaponType;
            weaponNameMap.set(weaponType, fallbackName);
          }
        }
        setWeaponNames(weaponNameMap);
      } catch (error) {
        console.error('Failed to load weapon names:', error);
      }
    };

    if (allWeaponTypes.length > 0) {
      loadWeaponNames();
    }
  }, [language, allWeaponTypes]);

  // キャラクター×武器の組み合わせごとにデータを生成
  const charactersWithMastery = useMemo(() => {
    const result: CharacterStats[] = [];

    // シセラのみのデバッグ
    const SISSELA_CODE = 15;

    characters.forEach(char => {
      // レベルに応じた基本ステータスを再計算
      const levelMultiplier = (characterLevel - 1) / 19; // 0-1の範囲

      // 各キャラクターの使用可能な武器ごとに行を生成
      char.availableWeapons.forEach(weaponType => {
        // 熟練度ボーナスを計算
        const relevantMasteryStats = masteryStat.filter(stat =>
          stat.characterCode === char.code &&
          stat.type === weaponType
        );

        // シセラのみデバッグログを表示
        if (char.code === SISSELA_CODE) {
          console.log('=== WEAPON MASTERY DEBUG ===');
          console.log(`Character: ${char.nameEn || char.name} (Code: ${char.code})`);
          console.log(`  Names: JP=${char.nameJpn}, KR=${char.nameKr}, EN=${char.nameEn}`);
          console.log(`  Weapon Type: ${weaponType}`);
          console.log(`  Available Weapons: [${char.availableWeapons.join(', ')}]`);
          console.log(`  Total mastery stats in system: ${masteryStat.length}`);
          console.log(`  Filtering for characterCode=${char.code} AND type=${weaponType}`);
          console.log(`  Relevant mastery stats found: ${relevantMasteryStats.length}`);

          // Show all mastery stats for this character
          const characterMasteryStats = masteryStat.filter(stat => stat.characterCode === char.code);
          console.log(`  All mastery stats for this character (${characterMasteryStats.length} total):`);
          characterMasteryStats.forEach((stat, index) => {
            console.log(`    [${index}] Type: ${stat.type}, Options: ${stat.firstOption}=${stat.firstOptionSection4Value}, ${stat.secondOption}=${stat.secondOptionSection4Value}, ${stat.thirdOption}=${stat.thirdOptionSection4Value}`);
          });

          // Show specific relevant mastery stats
          if (relevantMasteryStats.length > 0) {
            console.log(`  Relevant mastery stats for ${weaponType}:`);
            relevantMasteryStats.forEach((stat, index) => {
              console.log(`    [${index}] Code: ${stat.code}, Type: ${stat.type}`);
              console.log(`      FirstOption: ${stat.firstOption} = Sec1:${stat.firstOptionSection1Value}, Sec2:${stat.firstOptionSection2Value}, Sec3:${stat.firstOptionSection3Value}, Sec4:${stat.firstOptionSection4Value}`);
              console.log(`      SecondOption: ${stat.secondOption} = Sec1:${stat.secondOptionSection1Value}, Sec2:${stat.secondOptionSection2Value}, Sec3:${stat.secondOptionSection3Value}, Sec4:${stat.secondOptionSection4Value}`);
              console.log(`      ThirdOption: ${stat.thirdOption} = Sec1:${stat.thirdOptionSection1Value}, Sec2:${stat.thirdOptionSection2Value}, Sec3:${stat.thirdOptionSection3Value}, Sec4:${stat.thirdOptionSection4Value}`);
            });
          } else {
            console.log(`  ❌ NO relevant mastery stats found for ${weaponType}!`);
          }
        }

        // レベルに応じたステータスを計算
        const updatedChar = { ...char, weaponType };

        // キャラクターレベルによる成長を反映
        updatedChar.finalMaxHp = Math.floor(char.maxHp + (char.finalMaxHp - char.maxHp) * levelMultiplier);
        updatedChar.finalAttackPower = Math.floor(char.attackPower + (char.finalAttackPower - char.attackPower) * levelMultiplier);
        updatedChar.finalDefense = Math.floor(char.defense + (char.finalDefense - char.defense) * levelMultiplier);
        updatedChar.finalAttackSpeed = char.attackSpeed + (char.finalAttackSpeed - char.attackSpeed) * levelMultiplier;
        updatedChar.finalMoveSpeed = char.moveSpeed + (char.finalMoveSpeed - char.moveSpeed) * levelMultiplier;

        // 武器熟練度によるボーナス（セクション値を直接使用するため、乗算は不要）
        const weaponMasteryMultiplier = 1; // セクション値を直接使用

        if (char.code === SISSELA_CODE) {
          console.log(`  Weapon Mastery Level: ${weaponMasteryLevel}, Multiplier: ${weaponMasteryMultiplier}`);
          console.log(`  Base stats before mastery application:`);
          console.log(`    HP: ${updatedChar.finalMaxHp}`);
          console.log(`    Attack Power: ${updatedChar.finalAttackPower}`);
          console.log(`    Defense: ${updatedChar.finalDefense}`);
          console.log(`    Attack Speed: ${updatedChar.finalAttackSpeed}`);
          console.log(`    Skill Amp: ${updatedChar.finalSkillAmp}`);

          // 実際のオブジェクト構造を確認
          if (relevantMasteryStats.length > 0) {
            console.log('  === ACTUAL MASTERY STAT OBJECT STRUCTURE ===');
            console.log('  Full object:', relevantMasteryStats[0]);
            console.log('  Object keys:', Object.keys(relevantMasteryStats[0]));
            console.log('  JSON:', JSON.stringify(relevantMasteryStats[0], null, 2));
          }
        }

        relevantMasteryStats.forEach((stat, statIndex) => {
          // 各オプションを適用
          const applyOption = (option: string, value: number, optionName: string) => {
            const scaledValue = value * weaponMasteryMultiplier;
            const oldValue = { ...updatedChar };

            switch (option) {
              case 'AttackPower':
                updatedChar.finalAttackPower += scaledValue;
                break;
              case 'Defense':
                updatedChar.finalDefense += scaledValue;
                break;
              case 'AttackSpeedRatio':
                // 攻撃速度は乗算で適用（基礎値 × (1 + ボーナス率)）
                updatedChar.finalAttackSpeed = updatedChar.finalAttackSpeed * (1 + scaledValue);
                break;
              case 'MaxHp':
                updatedChar.finalMaxHp += scaledValue;
                break;
              case 'HpRegen':
                // HP再生は基本値に対する割合で増加
                updatedChar.finalMaxHp += updatedChar.maxHp * scaledValue;
                break;
              case 'IncreaseBasicAttackDamageRatio':
                // 基本攻撃ダメージ増加は攻撃力に反映
                updatedChar.finalAttackPower *= (1 + scaledValue);
                break;
              case 'SkillAmpRatio':
                // スキル増幅を追加
                updatedChar.finalSkillAmp += scaledValue;
                break;
            }

            if (char.code === SISSELA_CODE && option && value !== 0) {
              console.log(`    Applying ${optionName}: ${option} = ${value} (scaled: ${scaledValue})`);
              switch (option) {
                case 'AttackPower':
                  console.log(`      Attack Power: ${oldValue.finalAttackPower} → ${updatedChar.finalAttackPower} (+${scaledValue})`);
                  break;
                case 'Defense':
                  console.log(`      Defense: ${oldValue.finalDefense} → ${updatedChar.finalDefense} (+${scaledValue})`);
                  break;
                case 'AttackSpeedRatio':
                  console.log(`      Attack Speed: ${oldValue.finalAttackSpeed} → ${updatedChar.finalAttackSpeed} (+${scaledValue})`);
                  break;
                case 'MaxHp':
                  console.log(`      Max HP: ${oldValue.finalMaxHp} → ${updatedChar.finalMaxHp} (+${scaledValue})`);
                  break;
                case 'HpRegen':
                  console.log(`      HP Regen (to Max HP): ${oldValue.finalMaxHp} → ${updatedChar.finalMaxHp} (+${updatedChar.maxHp * scaledValue})`);
                  break;
                case 'IncreaseBasicAttackDamageRatio':
                  console.log(`      Basic Attack Damage Ratio: ${oldValue.finalAttackPower} → ${updatedChar.finalAttackPower} (*${1 + scaledValue})`);
                  break;
                case 'SkillAmpRatio':
                  console.log(`      Skill Amp: ${oldValue.finalSkillAmp} → ${updatedChar.finalSkillAmp} (+${scaledValue})`);
                  break;
                default:
                  console.log(`      ⚠️ UNKNOWN OPTION: ${option} with value ${scaledValue}`);
                  break;
              }
            }
          };

          if (char.code === SISSELA_CODE) {
            console.log(`  Processing mastery stat [${statIndex}] with code ${stat.code}:`);
          }

          // 熟練度レベルに応じたセクションの値を使用
          // 各セクションの値はレベル1あたりの増加率なので、レベルを掛ける必要がある
          const getSectionValue = (level: number, sec1: number, sec2: number, sec3: number, sec4: number): number => {
            let baseValue: number;
            let selectedSection: string;

            if (level <= 5) {
              baseValue = sec1;
              selectedSection = "Section1 (Lv1-5)";
            } else if (level <= 10) {
              baseValue = sec2;
              selectedSection = "Section2 (Lv6-10)";
            } else if (level <= 15) {
              baseValue = sec3;
              selectedSection = "Section3 (Lv11-15)";
            } else {
              baseValue = sec4;
              selectedSection = "Section4 (Lv16-20)";
            }

            // 実際のボーナス = セクション値（レベル1あたりの増加率） × 熟練度レベル
            const actualBonus = baseValue * level;

            if (char.code === SISSELA_CODE) {
              console.log(`    getSectionValue: Level ${level} → ${selectedSection}`);
              console.log(`      Base value per level: ${baseValue}`);
              console.log(`      Total bonus: ${baseValue} × ${level} = ${actualBonus}`);
            }

            return actualBonus;
          };

          // 各オプションを適用
          if (stat.firstOption && stat.firstOption !== 'None') {
            const value = getSectionValue(weaponMasteryLevel,
              stat.firstOptionSection1Value,
              stat.firstOptionSection2Value,
              stat.firstOptionSection3Value,
              stat.firstOptionSection4Value
            );
            applyOption(stat.firstOption, value, 'FirstOption');
          }

          if (stat.secondOption && stat.secondOption !== 'None') {
            const value = getSectionValue(weaponMasteryLevel,
              stat.secondOptionSection1Value,
              stat.secondOptionSection2Value,
              stat.secondOptionSection3Value,
              stat.secondOptionSection4Value
            );
            applyOption(stat.secondOption, value, 'SecondOption');
          }

          if (stat.thirdOption && stat.thirdOption !== 'None') {
            const value = getSectionValue(weaponMasteryLevel,
              stat.thirdOptionSection1Value,
              stat.thirdOptionSection2Value,
              stat.thirdOptionSection3Value,
              stat.thirdOptionSection4Value
            );
            applyOption(stat.thirdOption, value, 'ThirdOption');
          }
        });

        if (char.code === SISSELA_CODE) {
          console.log(`  Final stats after weapon mastery application:`);
          console.log(`    HP: ${updatedChar.finalMaxHp}`);
          console.log(`    Attack Power: ${updatedChar.finalAttackPower}`);
          console.log(`    Defense: ${updatedChar.finalDefense}`);
          console.log(`    Attack Speed: ${updatedChar.finalAttackSpeed}`);
          console.log(`    Skill Amp: ${updatedChar.finalSkillAmp}`);
          console.log('=== END WEAPON MASTERY DEBUG ===');
        }

        // 探索・防御熟練度によるボーナス（仮実装）
        // 探索熟練度: 移動速度ボーナス
        updatedChar.finalMoveSpeed += 0.01 * explorationMasteryLevel;

        // 防御熟練度: 防御力・HPボーナス
        updatedChar.finalDefense += 2 * defenseMasteryLevel;
        updatedChar.finalMaxHp += 10 * defenseMasteryLevel;

        result.push(updatedChar);
      });
    });

    return result;
  }, [characters, masteryStat, characterLevel, weaponMasteryLevel, explorationMasteryLevel, defenseMasteryLevel]);

  const getCharacterName = useCallback((char: CharacterStats): string => {
    switch (language) {
      case 'kr': return char.nameKr;
      case 'en': return char.nameEn;
      default: return char.nameJpn;
    }
  }, [language]);

  const getWeaponName = (weaponType: string): string => {
    // キャッシュされた武器名から取得
    const cachedName = weaponNames.get(weaponType);
    if (cachedName) {
      return cachedName;
    }

    // フォールバック: ハードコーディングされた値を使用
    const names = weaponTypeNames[weaponType];
    if (!names) return weaponType;
    switch (language) {
      case 'kr': return names.kr;
      case 'en': return names.en;
      default: return names.jp;
    }
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAndSortedCharacters = useMemo(() => {
    const filtered = charactersWithMastery.filter(char => {
      const nameMatch = getCharacterName(char).toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch;
    });

    return filtered.sort((a, b) => {
      let compareValue = 0;

      switch (orderBy) {
        case 'name':
          compareValue = getCharacterName(a).localeCompare(getCharacterName(b));
          break;
        case 'hp':
          compareValue = a.finalMaxHp - b.finalMaxHp;
          break;
        case 'attackPower':
          compareValue = a.finalAttackPower - b.finalAttackPower;
          break;
        case 'defense':
          compareValue = a.finalDefense - b.finalDefense;
          break;
        case 'attackSpeed':
          compareValue = a.finalAttackSpeed - b.finalAttackSpeed;
          break;
        case 'moveSpeed':
          compareValue = a.finalMoveSpeed - b.finalMoveSpeed;
          break;
        case 'skillAmp':
          compareValue = a.finalSkillAmp - b.finalSkillAmp;
          break;
      }

      return order === 'asc' ? compareValue : -compareValue;
    });
  }, [charactersWithMastery, searchTerm, getCharacterName, orderBy, order]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ whiteSpace: 'pre-line' }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          キャラクターステータス詳細（武器熟練度込み）
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          武器熟練度によるステータスボーナスを含めた詳細なキャラクター比較
        </Typography>

        <CacheManager />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
          {/* 検索と言語選択 */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              label="キャラクター検索"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                言語:
              </Typography>
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={(e, newLang) => newLang && setLanguage(newLang)}
                size="small"
              >
                <ToggleButton value="jp">日本語</ToggleButton>
                <ToggleButton value="kr">한국어</ToggleButton>
                <ToggleButton value="en">English</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* レベル設定 */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>キャラクターLv</InputLabel>
              <Select
                value={characterLevel}
                onChange={(e) => setCharacterLevel(e.target.value as number)}
                label="キャラクターLv"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <MenuItem key={level} value={level}>Lv {level}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>武器熟練度</InputLabel>
              <Select
                value={weaponMasteryLevel}
                onChange={(e) => setWeaponMasteryLevel(e.target.value as number)}
                label="武器熟練度"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <MenuItem key={level} value={level}>Lv {level}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>探索熟練度</InputLabel>
              <Select
                value={explorationMasteryLevel}
                onChange={(e) => setExplorationMasteryLevel(e.target.value as number)}
                label="探索熟練度"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <MenuItem key={level} value={level}>Lv {level}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>防御熟練度</InputLabel>
              <Select
                value={defenseMasteryLevel}
                onChange={(e) => setDefenseMasteryLevel(e.target.value as number)}
                label="防御熟練度"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <MenuItem key={level} value={level}>Lv {level}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 400px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  武器 / キャラクター
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'hp'}
                  direction={orderBy === 'hp' ? order : 'asc'}
                  onClick={() => handleRequestSort('hp')}
                >
                  HP
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'attackPower'}
                  direction={orderBy === 'attackPower' ? order : 'asc'}
                  onClick={() => handleRequestSort('attackPower')}
                >
                  攻撃力
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'defense'}
                  direction={orderBy === 'defense' ? order : 'asc'}
                  onClick={() => handleRequestSort('defense')}
                >
                  防御力
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'attackSpeed'}
                  direction={orderBy === 'attackSpeed' ? order : 'asc'}
                  onClick={() => handleRequestSort('attackSpeed')}
                >
                  攻撃速度
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'moveSpeed'}
                  direction={orderBy === 'moveSpeed' ? order : 'asc'}
                  onClick={() => handleRequestSort('moveSpeed')}
                >
                  移動速度
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                <TableSortLabel
                  active={orderBy === 'skillAmp'}
                  direction={orderBy === 'skillAmp' ? order : 'asc'}
                  onClick={() => handleRequestSort('skillAmp')}
                >
                  スキル増幅
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCharacters.map((character, index) => (
              <TableRow
                key={`${character.code}-${character.weaponType}-${index}`}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell component="th" scope="row">
                  {(() => {
                    const displayName = getCharacterName(character);
                    const weaponName = character.weaponType ? getWeaponName(character.weaponType) : '';
                    const fullName = `${weaponName} ${displayName}`;

                    if (character.code === 61) { // イレムでデバッグ
                      console.log(`Rendering Irem:`, {
                        language,
                        displayName,
                        weaponName,
                        fullName,
                        character: {
                          code: character.code,
                          name: character.name,
                          nameKr: character.nameKr,
                          nameJpn: character.nameJpn,
                          nameEn: character.nameEn,
                          weaponType: character.weaponType
                        }
                      });
                    }
                    return language === 'kr' ? (
                      <Tooltip title={`${character.nameEn} (${character.nameJpn})`} placement="right">
                        <span>{fullName}</span>
                      </Tooltip>
                    ) : (
                      fullName
                    );
                  })()}
                </TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalMaxHp)}
                  {character.weaponType && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalMaxHp - character.maxHp)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalAttackPower)}
                  {character.weaponType && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalAttackPower - character.attackPower)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalDefense)}
                  {character.weaponType && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalDefense - character.defense)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {character.finalAttackSpeed.toFixed(2)}
                  {character.weaponType && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{((character.finalAttackSpeed / character.attackSpeed - 1) * 100).toFixed(1)}%)
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {character.finalMoveSpeed.toFixed(1)}
                  {character.weaponType && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{(character.finalMoveSpeed - character.moveSpeed).toFixed(1)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {(character.finalSkillAmp * 100).toFixed(1)}%
                  {character.weaponType && character.finalSkillAmp > 0 && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{(character.finalSkillAmp * 100).toFixed(1)}%)
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          ※ 設定されたレベルでのステータスを表示しています。実際のゲーム内では他の要素も影響します。
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          ※ APIデータは最新のゲームバランス調整を反映していない場合があります。
        </Typography>
      </Box>

      {/* デバッグ用：シセラの計算詳細 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>シセラの攻撃速度計算詳細</Typography>
        {(() => {
          const sissela = filteredAndSortedCharacters.find(char =>
            char.code === 15 && char.weaponType === 'DirectFire'
          );
          if (!sissela) return <Typography>シュリケン シセラが見つかりません</Typography>;

          const baseAS = sissela.attackSpeed;
          const masteryBonus = sissela.finalAttackSpeed - sissela.attackSpeed;

          return (
            <Box>
              <Typography variant="body2">【シュリケン シセラ】</Typography>
              <Typography variant="body2">基本攻撃速度: {baseAS.toFixed(2)}</Typography>
              <Typography variant="body2">キャラクターレベル: {characterLevel}</Typography>
              <Typography variant="body2">武器熟練度レベル: {weaponMasteryLevel}</Typography>
              <Typography variant="body2">最終攻撃速度: {sissela.finalAttackSpeed.toFixed(2)}</Typography>
              <Typography variant="body2">増加値: +{masteryBonus.toFixed(2)}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption">
                計算式: 基本値({baseAS.toFixed(2)}) × (1 + 熟練度ボーナス率) = {baseAS.toFixed(2)} × {(sissela.finalAttackSpeed / baseAS).toFixed(3)} = {sissela.finalAttackSpeed.toFixed(2)}
              </Typography>

              {/* マスタリーデータの詳細 */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">【DirectFire マスタリーデータ】</Typography>
                {(() => {
                  const directFireMastery = masteryStat.find(stat =>
                    stat.characterCode === 15 && stat.type === 'DirectFire'
                  );
                  if (!directFireMastery) return <Typography variant="caption">データなし</Typography>;

                  return (
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="caption" display="block">
                        FirstOption: {directFireMastery.firstOption}
                      </Typography>
                      <Typography variant="caption" display="block">
                        - Section1 (Lv1-5): {directFireMastery.firstOptionSection1Value}
                      </Typography>
                      <Typography variant="caption" display="block">
                        - Section2 (Lv6-10): {directFireMastery.firstOptionSection2Value}
                      </Typography>
                      <Typography variant="caption" display="block">
                        - Section3 (Lv11-15): {directFireMastery.firstOptionSection3Value}
                      </Typography>
                      <Typography variant="caption" display="block">
                        - Section4 (Lv16-20): {directFireMastery.firstOptionSection4Value}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        現在の熟練度レベル {weaponMasteryLevel} → {(() => {
                          const baseValue = weaponMasteryLevel <= 5 ? directFireMastery.firstOptionSection1Value :
                                          weaponMasteryLevel <= 10 ? directFireMastery.firstOptionSection2Value :
                                          weaponMasteryLevel <= 15 ? directFireMastery.firstOptionSection3Value :
                                          directFireMastery.firstOptionSection4Value;
                          const totalBonus = baseValue * weaponMasteryLevel;
                          return `${baseValue} × ${weaponMasteryLevel} = ${totalBonus.toFixed(3)} (${(totalBonus * 100).toFixed(1)}%)`;
                        })()}
                      </Typography>
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          );
        })()}
      </Box>
    </Container>
  );
};

export default CharacterStatsAdvancedPage;