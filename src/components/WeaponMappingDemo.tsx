import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  getAllWeaponTypes,
  getWeaponNameMap,
  getWeaponTypeDetails,
  getWeaponMappingStats,
  type WeaponTypeMapping,
  type LanguageCode
} from '../utils/weaponMapping';

const WeaponMappingDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageCode>('jp');
  const [weaponTypes, setWeaponTypes] = useState<string[]>([]);
  const [weaponNames, setWeaponNames] = useState<Map<string, string>>(new Map());
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponTypeMapping | null>(null);
  const [stats, setStats] = useState<{
    totalWeaponTypes: number;
    totalWeaponItems: number;
    weaponTypesWithLocalization: {
      jp: number;
      kr: number;
      en: number;
    };
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [types, nameMap, mappingStats] = await Promise.all([
          getAllWeaponTypes(),
          getWeaponNameMap(language),
          getWeaponMappingStats()
        ]);

        setWeaponTypes(types);
        setWeaponNames(nameMap);
        setStats(mappingStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [language]);

  const handleWeaponSelect = async (weaponType: string) => {
    try {
      const details = await getWeaponTypeDetails(weaponType);
      setSelectedWeapon(details);
    } catch (err) {
      console.error('武器詳細の取得に失敗:', err);
    }
  };

  if (loading && weaponTypes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        武器マッピングユーティリティ デモ
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Eternal Return API から武器タイプと名前のマッピングを取得するユーティリティのデモンストレーションです。
      </Typography>

      {/* 言語選択 */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>言語</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            label="言語"
          >
            <MenuItem value="jp">日本語</MenuItem>
            <MenuItem value="kr">한국어</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 統計情報 */}
      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              統計情報
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  総武器タイプ数
                </Typography>
                <Typography variant="h6">
                  {stats.totalWeaponTypes}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  ローカライゼーション数
                </Typography>
                <Typography variant="h6">
                  JP: {stats.weaponTypesWithLocalization.jp} /
                  KR: {stats.weaponTypesWithLocalization.kr} /
                  EN: {stats.weaponTypesWithLocalization.en}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  総武器アイテム数
                </Typography>
                <Typography variant="h6">
                  {stats.totalWeapons}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 武器タイプ一覧 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            武器タイプ一覧（{weaponNames.size}種類）
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {weaponTypes.map(weaponType => (
              <Chip
                key={weaponType}
                label={weaponNames.get(weaponType) || weaponType}
                onClick={() => handleWeaponSelect(weaponType)}
                variant={selectedWeapon?.weaponType === weaponType ? 'filled' : 'outlined'}
                color={selectedWeapon?.weaponType === weaponType ? 'primary' : 'default'}
                clickable
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* 武器詳細 */}
      {selectedWeapon && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedWeapon.localizedNames[language]} の詳細情報
            </Typography>

            {/* ローカライゼーション */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                多言語対応名
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>言語</TableCell>
                      <TableCell>名前</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>日本語</TableCell>
                      <TableCell>{selectedWeapon.localizedNames.jp}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>한국어</TableCell>
                      <TableCell>{selectedWeapon.localizedNames.kr}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>English</TableCell>
                      <TableCell>{selectedWeapon.localizedNames.en}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 武器タイプ情報 */}
            {selectedWeapon.weaponTypeInfo && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  武器タイプ情報
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>攻撃タイプ</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.attackType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>射程タイプ</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.rangeType}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>習得時間</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.learningTime}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>基礎攻撃力</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.attackPower}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>基礎攻撃速度</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.attackSpeed}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>武器長</TableCell>
                        <TableCell>{selectedWeapon.weaponTypeInfo.weaponLength}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* サンプル武器 */}
            {selectedWeapon.sampleWeapons.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  サンプル武器 ({selectedWeapon.sampleWeapons.length}個)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>コード</TableCell>
                        <TableCell>名前</TableCell>
                        <TableCell>グレード</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedWeapon.sampleWeapons.map(weapon => (
                        <TableRow key={weapon.code}>
                          <TableCell>{weapon.code}</TableCell>
                          <TableCell>{weapon.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={weapon.itemGrade}
                              size="small"
                              color={
                                weapon.itemGrade === 'Epic' ? 'secondary' :
                                weapon.itemGrade === 'Rare' ? 'primary' :
                                weapon.itemGrade === 'Uncommon' ? 'success' :
                                'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default WeaponMappingDemo;