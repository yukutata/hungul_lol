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
  TableSortLabel,
  TextField,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Tooltip,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { visuallyHidden } from '@mui/utils';
import eternalReturnAPI, { type ERCharacterLevelUpStat } from '../api/eternalReturn';
import { fetchWithCache } from '../utils/apiCache';
import CacheManager from '../components/CacheManager';

interface CharacterStats {
  code: number;
  name: string;
  nameKr: string;
  nameJpn: string;
  nameEn: string;
  // Level 1 stats
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
  moveSpeed: number;
  hpRegen: number;
  spRegen: number;
  criticalStrikeChance: number;
  // Level 20 stats (calculated)
  maxHpLv20: number;
  maxSpLv20: number;
  attackPowerLv20: number;
  defenseLv20: number;
  attackSpeedLv20: number;
  moveSpeedLv20: number;
  hpRegenLv20: number;
  spRegenLv20: number;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof CharacterStats;
  label: string;
  labelKr: string;
  labelEn: string;
  numeric: boolean;
  width?: string;
}

const headCells: HeadCell[] = [
  { id: 'name', label: '名前', labelKr: '이름', labelEn: 'Name', numeric: false, width: '150px' },
  { id: 'maxHp', label: 'HP', labelKr: '체력', labelEn: 'HP', numeric: true },
  { id: 'maxHpLv20', label: 'HP(Lv20)', labelKr: '체력(Lv20)', labelEn: 'HP(Lv20)', numeric: true },
  { id: 'maxSp', label: 'SP', labelKr: '스태미나', labelEn: 'Stamina', numeric: true },
  { id: 'maxSpLv20', label: 'SP(Lv20)', labelKr: '스태미나(Lv20)', labelEn: 'Stamina(Lv20)', numeric: true },
  { id: 'attackPower', label: '攻撃力', labelKr: '공격력', labelEn: 'Attack', numeric: true },
  { id: 'attackPowerLv20', label: '攻撃力(Lv20)', labelKr: '공격력(Lv20)', labelEn: 'Attack(Lv20)', numeric: true },
  { id: 'defense', label: '防御力', labelKr: '방어력', labelEn: 'Defense', numeric: true },
  { id: 'defenseLv20', label: '防御力(Lv20)', labelKr: '방어력(Lv20)', labelEn: 'Defense(Lv20)', numeric: true },
  { id: 'attackSpeed', label: '攻撃速度', labelKr: '공격 속도', labelEn: 'Attack Speed', numeric: true },
  { id: 'moveSpeed', label: '移動速度', labelKr: '이동 속도', labelEn: 'Move Speed', numeric: true },
  { id: 'hpRegen', label: 'HP回復', labelKr: '체력 재생', labelEn: 'HP Regen', numeric: true },
  { id: 'spRegen', label: 'SP回復', labelKr: '스태미나 재생', labelEn: 'SP Regen', numeric: true },
];

type Language = 'jp' | 'kr' | 'en';
type ViewMode = 'absolute' | 'growth';

const CharacterStatsPage: React.FC = () => {
  const [characters, setCharacters] = useState<CharacterStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof CharacterStats>('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState<Language>('jp');
  const [viewMode, setViewMode] = useState<ViewMode>('absolute');

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setLoading(true);
        // キャッシュ付きでデータを取得
        const [charactersData, levelUpData, koreanLoc, japaneseLoc] = await Promise.all([
          fetchWithCache('characters', () => eternalReturnAPI.getCharacters()),
          fetchWithCache('characterLevelUpStats', () => eternalReturnAPI.getCharacterLevelUpStats()),
          fetchWithCache('localization-korean', () => eternalReturnAPI.getLocalizationData('Korean')),
          fetchWithCache('localization-japanese', () => eternalReturnAPI.getLocalizationData('Japanese'))
        ]);

          koreanLocType: koreanLoc instanceof Map,
          koreanLocSize: koreanLoc instanceof Map ? koreanLoc.size : 0,
          japaneseLocType: japaneseLoc instanceof Map,
          japaneseLocSize: japaneseLoc instanceof Map ? japaneseLoc.size : 0,
          sampleKorean: koreanLoc instanceof Map ? koreanLoc.get('Character/Name/61') : null,
          sampleJapanese: japaneseLoc instanceof Map ? japaneseLoc.get('Character/Name/61') : null
        });



        // レベルアップデータをコードでマッピング
        const levelUpMap = new Map<number, ERCharacterLevelUpStat>();
        levelUpData.forEach(stat => {
          levelUpMap.set(stat.code, stat);
        });

        // Level 20のステータスを正確に計算
        const processedData: CharacterStats[] = charactersData.map((char) => {
          const levelUpStat = levelUpMap.get(char.code);

          // ローカライゼーションから名前を取得
          const koreanName = (koreanLoc instanceof Map ? koreanLoc.get(`Character/Name/${char.code}`) : null) || char.name;
          const japaneseName = (japaneseLoc instanceof Map ? japaneseLoc.get(`Character/Name/${char.code}`) : null) || char.name;

          // デバッグ: イレムの名前を確認
          if (char.code === 61) {
              code: char.code,
              baseName: char.name,
              koreanName,
              japaneseName,
              koreanLocType: koreanLoc instanceof Map,
              japaneseLocType: japaneseLoc instanceof Map
            });
          }

          return {
          code: char.code,
          name: char.name,
          nameKr: koreanName,
          nameJpn: japaneseName,
          nameEn: char.name,
          // Level 1 stats
          maxHp: char.maxHp,
          maxSp: char.maxSp,
          attackPower: char.attackPower,
          defense: char.defense,
          attackSpeed: char.attackSpeed,
          moveSpeed: char.moveSpeed,
          hpRegen: char.hpRegen,
          spRegen: char.spRegen,
          criticalStrikeChance: char.criticalStrikeChance || 0,
          // Level 20 stats (正確な計算)
          maxHpLv20: levelUpStat ? Math.floor(char.maxHp + (levelUpStat.maxHp * 19)) : char.maxHp,
          maxSpLv20: levelUpStat ? Math.floor(char.maxSp + (levelUpStat.maxSp * 19)) : char.maxSp,
          attackPowerLv20: levelUpStat ? Math.floor(char.attackPower + (levelUpStat.attackPower * 19)) : char.attackPower,
          defenseLv20: levelUpStat ? Math.floor(char.defense + (levelUpStat.defense * 19)) : char.defense,
          attackSpeedLv20: levelUpStat ? Math.min(char.attackSpeed + (levelUpStat.attackSpeed * 19), char.attackSpeedLimit || 2.5) : char.attackSpeed,
          moveSpeedLv20: levelUpStat ? char.moveSpeed + (levelUpStat.moveSpeed * 19) : char.moveSpeed,
          hpRegenLv20: levelUpStat ? char.hpRegen + (levelUpStat.hpRegen * 19) : char.hpRegen,
          spRegenLv20: levelUpStat ? char.spRegen + (levelUpStat.spRegen * 19) : char.spRegen,
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

  const handleRequestSort = (property: keyof CharacterStats) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleLanguageChange = (_event: React.MouseEvent<HTMLElement>, newLanguage: Language | null) => {
    if (newLanguage !== null) {
      setLanguage(newLanguage);
    }
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newViewMode: ViewMode | null) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const getCharacterName = (char: CharacterStats): string => {
    switch (language) {
      case 'kr': return char.nameKr;
      case 'en': return char.nameEn;
      default: return char.nameJpn;
    }
  };

  const getHeaderLabel = (cell: HeadCell): string => {
    switch (language) {
      case 'kr': return cell.labelKr;
      case 'en': return cell.labelEn;
      default: return cell.label;
    }
  };

  const filteredAndSortedCharacters = useMemo(() => {
    const filtered = characters.filter(char => {
      const name = getCharacterName(char).toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [characters, orderBy, order, searchTerm, getCharacterName]);

  const getGrowthRate = (base: number, lv20: number): number => {
    return ((lv20 - base) / base) * 100;
  };

  const getStatValue = (character: CharacterStats, statKey: string): string => {
    if (viewMode === 'growth') {
      switch (statKey) {
        case 'maxHp': return `+${getGrowthRate(character.maxHp, character.maxHpLv20).toFixed(1)}%`;
        case 'maxSp': return `+${getGrowthRate(character.maxSp, character.maxSpLv20).toFixed(1)}%`;
        case 'attackPower': return `+${getGrowthRate(character.attackPower, character.attackPowerLv20).toFixed(1)}%`;
        case 'defense': return `+${getGrowthRate(character.defense, character.defenseLv20).toFixed(1)}%`;
        default: return '-';
      }
    }
    return String(character[statKey as keyof CharacterStats]);
  };

  const getStatColor = (value: number, statType: string): string => {
    // ステータスタイプに応じた色分け
    const ranges = {
      hp: { low: 800, high: 1200 },
      sp: { low: 350, high: 500 },
      attack: { low: 25, high: 40 },
      defense: { low: 30, high: 50 },
      attackSpeed: { low: 0.5, high: 1.0 },
      moveSpeed: { low: 3.0, high: 4.0 },
    };

    let range = { low: 0, high: 100 };
    if (statType.includes('Hp')) range = ranges.hp;
    else if (statType.includes('Sp')) range = ranges.sp;
    else if (statType.includes('attackPower')) range = ranges.attack;
    else if (statType.includes('defense')) range = ranges.defense;
    else if (statType.includes('attackSpeed')) range = ranges.attackSpeed;
    else if (statType.includes('moveSpeed')) range = ranges.moveSpeed;

    const percentage = (value - range.low) / (range.high - range.low);
    if (percentage >= 0.8) return '#4caf50';
    if (percentage >= 0.6) return '#8bc34a';
    if (percentage >= 0.4) return '#ffc107';
    if (percentage >= 0.2) return '#ff9800';
    return '#f44336';
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            キャラクターステータス一覧
          </Typography>
          <Button
            component={Link}
            to="/character-stats-advanced"
            variant="outlined"
            endIcon={<KeyboardArrowRightIcon />}
          >
            武器熟練度込みステータス
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Eternal Return全キャラクターのステータスを比較できます。Level 1とLevel 20の数値を確認できます。
        </Typography>

        {/* キャッシュマネージャー */}
        <CacheManager />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
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
              onChange={handleLanguageChange}
              size="small"
            >
              <ToggleButton value="jp">
                日本語
              </ToggleButton>
              <ToggleButton value="kr">
                한국어
              </ToggleButton>
              <ToggleButton value="en">
                English
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              表示:
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="absolute">
                実数値
              </ToggleButton>
              <ToggleButton value="growth">
                成長率
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'background.paper',
                    width: headCell.width,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id)}
                  >
                    {getHeaderLabel(headCell)}
                    {orderBy === headCell.id ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCharacters.map((character) => (
              <TableRow
                key={character.code}
                sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row">
                  {(() => {
                    const displayName = getCharacterName(character);
                    if (character.code === 61) { // イレムでデバッグ
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
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.maxHp, 'maxHp') : undefined }}>
                  {viewMode === 'absolute' ? character.maxHp : getStatValue(character, 'maxHp')}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.maxHpLv20, 'maxHp') : undefined }}>
                  {viewMode === 'absolute' ? character.maxHpLv20 : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.maxSp, 'maxSp') : undefined }}>
                  {viewMode === 'absolute' ? character.maxSp : getStatValue(character, 'maxSp')}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.maxSpLv20, 'maxSp') : undefined }}>
                  {viewMode === 'absolute' ? character.maxSpLv20 : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.attackPower, 'attackPower') : undefined }}>
                  {viewMode === 'absolute' ? character.attackPower : getStatValue(character, 'attackPower')}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.attackPowerLv20, 'attackPower') : undefined }}>
                  {viewMode === 'absolute' ? character.attackPowerLv20 : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.defense, 'defense') : undefined }}>
                  {viewMode === 'absolute' ? character.defense : getStatValue(character, 'defense')}
                </TableCell>
                <TableCell align="right" sx={{ color: viewMode === 'absolute' ? getStatColor(character.defenseLv20, 'defense') : undefined }}>
                  {viewMode === 'absolute' ? character.defenseLv20 : '-'}
                </TableCell>
                <TableCell align="right">
                  {character.attackSpeed.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {character.moveSpeed.toFixed(1)}
                </TableCell>
                <TableCell align="right">
                  {character.hpRegen.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {character.spRegen.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip label="高い値" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
          <Chip label="やや高い" size="small" sx={{ backgroundColor: '#8bc34a', color: 'white' }} />
          <Chip label="普通" size="small" sx={{ backgroundColor: '#ffc107', color: 'white' }} />
          <Chip label="やや低い" size="small" sx={{ backgroundColor: '#ff9800', color: 'white' }} />
          <Chip label="低い値" size="small" sx={{ backgroundColor: '#f44336', color: 'white' }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          ※ APIデータは最新のゲームバランス調整を反映していない場合があります。
        </Typography>
      </Box>
    </Container>
  );
};

export default CharacterStatsPage;