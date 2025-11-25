import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
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
  // Mastery info
  availableWeapons: string[];
}

type Language = LanguageCode;

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
  const [selectedWeapon, setSelectedWeapon] = useState<string>('all');
  const [masteryLevel, setMasteryLevel] = useState<number>(1);

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
          fetchWithCache('masteryStat', () => eternalReturnAPI.getMasteryStat())
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
        setCharacterMastery(masteryMap);
        setMasteryStat(masteryStatData);

        // 全武器タイプを収集
        const weaponTypesSet = new Set<string>();
        masteryData.forEach(mastery => {
          if (mastery.weapon1 && mastery.weapon1 !== 'None') weaponTypesSet.add(mastery.weapon1);
          if (mastery.weapon2 && mastery.weapon2 !== 'None') weaponTypesSet.add(mastery.weapon2);
          if (mastery.weapon3 && mastery.weapon3 !== 'None') weaponTypesSet.add(mastery.weapon3);
          if (mastery.weapon4 && mastery.weapon4 !== 'None') weaponTypesSet.add(mastery.weapon4);
        });
        setAllWeaponTypes(Array.from(weaponTypesSet).sort());

        // 武器タイプのローカライゼーションを設定
        const weaponLocMap = {
          jp: new Map<string, string>(),
          kr: new Map<string, string>(),
          en: new Map<string, string>()
        };

        // 武器タイプごとにローカライゼーションデータを取得
        weaponTypesSet.forEach(weaponType => {
          const jpName = (japaneseLoc instanceof Map ? japaneseLoc.get(`WeaponType/Name/${weaponType}`) : null);
          const krName = (koreanLoc instanceof Map ? koreanLoc.get(`WeaponType/Name/${weaponType}`) : null);
          const enName = (englishLoc instanceof Map ? englishLoc.get(`WeaponType/Name/${weaponType}`) : null);

          if (jpName) weaponLocMap.jp.set(weaponType, jpName);
          if (krName) weaponLocMap.kr.set(weaponType, krName);
          if (enName) weaponLocMap.en.set(weaponType, enName);
        });

        setWeaponLocalization(weaponLocMap);

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

  // 選択された武器と熟練度レベルに基づいてステータスを再計算
  const charactersWithMastery = useMemo(() => {
    return characters.map(char => {
      // 選択された武器がキャラクターで使用可能か確認
      if (selectedWeapon === 'all' || !char.availableWeapons.includes(selectedWeapon)) {
        return char;
      }

      // 熟練度ボーナスを計算
      const relevantMasteryStats = masteryStat.filter(stat =>
        stat.characterCode === char.code &&
        stat.type === selectedWeapon
      );

      if (relevantMasteryStats.length === 0) {
        return char;
      }

      // 熟練度レベルに応じたボーナスを適用（簡易計算）
      const masteryMultiplier = masteryLevel / 20; // 1-20レベルを0-1の倍率に変換
      const updatedChar = { ...char };

      relevantMasteryStats.forEach(stat => {
        // 各オプションを適用
        const applyOption = (option: string, value: number) => {
          const scaledValue = value * masteryMultiplier;
          switch (option) {
            case 'AttackPower':
              updatedChar.finalAttackPower += scaledValue;
              break;
            case 'Defense':
              updatedChar.finalDefense += scaledValue;
              break;
            case 'AttackSpeedRatio':
              updatedChar.finalAttackSpeed += scaledValue;
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
              // スキル増幅は表示しない（別途計算が必要）
              break;
          }
        };

        applyOption(stat.option1, stat.optionValue1);
        applyOption(stat.option2, stat.optionValue2);
        applyOption(stat.option3, stat.optionValue3);
      });

      return updatedChar;
    });
  }, [characters, selectedWeapon, masteryLevel, masteryStat]);

  const getCharacterName = (char: CharacterStats): string => {
    switch (language) {
      case 'kr': return char.nameKr;
      case 'en': return char.nameEn;
      default: return char.nameJpn;
    }
  };

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

  const filteredCharacters = useMemo(() => {
    return charactersWithMastery.filter(char => {
      const nameMatch = getCharacterName(char).toLowerCase().includes(searchTerm.toLowerCase());
      const weaponMatch = selectedWeapon === 'all' || char.availableWeapons.includes(selectedWeapon);
      return nameMatch && weaponMatch;
    });
  }, [charactersWithMastery, searchTerm, selectedWeapon, getCharacterName]);

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
        <Alert severity="error">{error}</Alert>
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

          {/* 武器選択と熟練度レベル */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>武器タイプ</InputLabel>
              <Select
                value={selectedWeapon}
                onChange={(e) => setSelectedWeapon(e.target.value)}
                label="武器タイプ"
              >
                <MenuItem value="all">全て（基本ステータス）</MenuItem>
                <Divider />
                {allWeaponTypes.map(weaponType => (
                  <MenuItem key={weaponType} value={weaponType}>
                    {getWeaponName(weaponType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedWeapon !== 'all' && (
              <Box sx={{ width: 300, px: 2 }}>
                <Typography variant="body2" gutterBottom>
                  武器熟練度レベル: {masteryLevel}
                </Typography>
                <Slider
                  value={masteryLevel}
                  onChange={(e, newValue) => setMasteryLevel(newValue as number)}
                  min={1}
                  max={20}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 400px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                キャラクター
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                使用可能武器
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                HP
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                SP
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                攻撃力
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                防御力
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                攻撃速度
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'background.paper' }}>
                移動速度
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCharacters.map((character) => (
              <TableRow
                key={character.code}
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                  opacity: selectedWeapon !== 'all' && !character.availableWeapons.includes(selectedWeapon) ? 0.5 : 1
                }}
              >
                <TableCell component="th" scope="row">
                  {(() => {
                    const displayName = getCharacterName(character);
                    if (character.code === 61) { // イレムでデバッグ
                      console.log(`Rendering Irem:`, {
                        language,
                        displayName,
                        character: {
                          code: character.code,
                          name: character.name,
                          nameKr: character.nameKr,
                          nameJpn: character.nameJpn,
                          nameEn: character.nameEn
                        }
                      });
                    }
                    return language === 'kr' ? (
                      <Tooltip title={`${character.nameEn} (${character.nameJpn})`} placement="right">
                        <span>{displayName}</span>
                      </Tooltip>
                    ) : (
                      displayName
                    );
                  })()}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {character.availableWeapons.map(weapon => (
                      <Chip
                        key={weapon}
                        label={getWeaponName(weapon)}
                        size="small"
                        color={weapon === selectedWeapon ? 'primary' : 'default'}
                        variant={weapon === selectedWeapon ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalMaxHp)}
                  {selectedWeapon !== 'all' && character.availableWeapons.includes(selectedWeapon) && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalMaxHp - character.maxHp)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{Math.floor(character.finalMaxSp)}</TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalAttackPower)}
                  {selectedWeapon !== 'all' && character.availableWeapons.includes(selectedWeapon) && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalAttackPower - character.attackPower)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {Math.floor(character.finalDefense)}
                  {selectedWeapon !== 'all' && character.availableWeapons.includes(selectedWeapon) && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                      (+{Math.floor(character.finalDefense - character.defense)})
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">{character.finalAttackSpeed.toFixed(2)}</TableCell>
                <TableCell align="right">{character.finalMoveSpeed.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          ※ 熟練度ボーナスは簡易計算です。実際のゲーム内では他の要素も影響します。
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          ※ APIデータは最新のゲームバランス調整を反映していない場合があります。
        </Typography>
      </Box>
    </Container>
  );
};

export default CharacterStatsAdvancedPage;