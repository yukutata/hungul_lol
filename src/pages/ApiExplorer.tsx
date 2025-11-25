import React, { useState } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import eternalReturnAPI from '../api/eternalReturn';
import { fetchWithCache } from '../utils/apiCache';
import { fetchWeaponTypeMappings, getWeaponMappingStats } from '../utils/weaponMapping';

interface ApiEndpoint {
  name: string;
  endpoint: string;
  description: string;
  testFunction: () => Promise<unknown>;
}

const ApiExplorer: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiEndpoints: ApiEndpoint[] = [
    {
      name: 'データハッシュ',
      endpoint: '/v2/data/hash',
      description: 'ゲームデータのハッシュ値を取得',
      testFunction: () => fetchWithCache('dataHash', async () => {
        const response = await fetch('/api/eternal-return/v2/data/hash', {
          headers: { 'accept': 'application/json' }
        });
        return await response.json();
      })
    },
    {
      name: 'キャラクター一覧',
      endpoint: '/v2/data/Character',
      description: '全キャラクターの情報を取得',
      testFunction: () => fetchWithCache('characters', () => eternalReturnAPI.getCharacters())
    },
    {
      name: 'アイテム - 武器',
      endpoint: '/v2/data/ItemWeapon',
      description: '武器アイテムの情報を取得',
      testFunction: () => fetchWithCache('itemWeapon', async () => {
        const response = await fetch('/api/eternal-return/v2/data/ItemWeapon', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'アイテム - 防具',
      endpoint: '/v2/data/ItemArmor',
      description: '防具アイテムの情報を取得',
      testFunction: () => fetchWithCache('itemArmor', async () => {
        const response = await fetch('/api/eternal-return/v2/data/ItemArmor', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'アイテム - 消耗品',
      endpoint: '/v2/data/ItemConsumable',
      description: '消耗品アイテムの情報を取得',
      testFunction: () => fetchWithCache('itemConsumable', async () => {
        const response = await fetch('/api/eternal-return/v2/data/ItemConsumable', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'アイテム - 特殊',
      endpoint: '/v2/data/ItemSpecial',
      description: '特殊アイテムの情報を取得',
      testFunction: () => fetchWithCache('itemSpecial', async () => {
        const response = await fetch('/api/eternal-return/v2/data/ItemSpecial', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'アイテム - その他',
      endpoint: '/v2/data/ItemMisc',
      description: 'その他のアイテム情報を取得',
      testFunction: () => fetchWithCache('itemMisc', async () => {
        const response = await fetch('/api/eternal-return/v2/data/ItemMisc', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'エリア情報',
      endpoint: '/v2/data/Area',
      description: 'ゲームマップのエリア情報を取得',
      testFunction: () => fetchWithCache('area', async () => {
        const response = await fetch('/api/eternal-return/v2/data/Area', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'モンスター情報',
      endpoint: '/v2/data/Monster',
      description: 'モンスター情報を取得',
      testFunction: () => fetchWithCache('monster', async () => {
        const response = await fetch('/api/eternal-return/v2/data/Monster', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'スキル情報',
      endpoint: '/v2/data/Skill',
      description: 'キャラクタースキルの情報を取得',
      testFunction: () => fetchWithCache('skill', async () => {
        const response = await fetch('/api/eternal-return/v2/data/Skill', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'キャラクターステータス',
      endpoint: '/v2/data/CharacterAttributes',
      description: 'キャラクターの詳細ステータス情報',
      testFunction: () => fetchWithCache('characterAttributes', async () => {
        const response = await fetch('/api/eternal-return/v2/data/CharacterAttributes', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'キャラクタースキン',
      endpoint: '/v2/data/CharacterSkin',
      description: 'キャラクタースキンの情報を取得',
      testFunction: () => fetchWithCache('characterSkin', async () => {
        const response = await fetch('/api/eternal-return/v2/data/CharacterSkin', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'キャラクター熟練度',
      endpoint: '/v2/data/CharacterMastery',
      description: '各キャラクターが使用可能な武器・探索・生存熟練度',
      testFunction: () => fetchWithCache('characterMastery', async () => {
        const response = await fetch('/api/eternal-return/v2/data/CharacterMastery', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: '熟練度ステータス',
      endpoint: '/v2/data/MasteryStat',
      description: 'キャラクターごとの武器熟練度によるステータスボーナス',
      testFunction: () => fetchWithCache('masteryStat', async () => {
        const response = await fetch('/api/eternal-return/v2/data/MasteryStat', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: '熟練度レベル',
      endpoint: '/v2/data/MasteryLevel',
      description: '熟練度レベルごとの必要経験値',
      testFunction: () => fetchWithCache('masteryLevel', async () => {
        const response = await fetch('/api/eternal-return/v2/data/MasteryLevel', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: '武器タイプ情報',
      endpoint: '/v2/data/WeaponTypeInfo',
      description: '各武器タイプの基本情報',
      testFunction: () => fetchWithCache('weaponTypeInfo', async () => {
        const response = await fetch('/api/eternal-return/v2/data/WeaponTypeInfo', {
          headers: { 'accept': 'application/json' }
        });
        const data = await response.json();
        return data.data;
      })
    },
    {
      name: 'ローカライゼーションパス - 韓国語',
      endpoint: '/v2/l10n/Korean',
      description: '韓国語ローカライゼーションファイルのパスを取得',
      testFunction: async () => {
        const response = await fetch('/api/eternal-return/v2/l10n/Korean', {
          headers: { 'accept': 'application/json' }
        });
        return await response.json();
      }
    },
    {
      name: 'ローカライゼーションパス - 日本語',
      endpoint: '/v2/l10n/Japanese',
      description: '日本語ローカライゼーションファイルのパスを取得',
      testFunction: async () => {
        const response = await fetch('/api/eternal-return/v2/l10n/Japanese', {
          headers: { 'accept': 'application/json' }
        });
        return await response.json();
      }
    },
    {
      name: '武器マッピング（カスタム）',
      endpoint: 'カスタム処理',
      description: '武器タイプとローカライゼーションの統合マッピング',
      testFunction: async () => {
        const mappings = await fetchWeaponTypeMappings();
        const stats = await getWeaponMappingStats();

        // Map を JSONシリアライズ可能な形式に変換
        const mappingsObject: Record<string, {
          weaponType: string;
          localizedNames: {
            jp: string;
            kr: string;
            en: string;
          };
          sampleWeapons: Array<{
            code: number;
            name: string;
          }>;
        }> = {};
        mappings.forEach((mapping, weaponType) => {
          mappingsObject[weaponType] = {
            ...mapping,
            weaponType: mapping.weaponType,
            localizedNames: mapping.localizedNames,
            sampleWeapons: mapping.sampleWeapons.slice(0, 3), // 最初の3つのみ表示
          };
        });

        return {
          stats,
          mappings: mappingsObject,
          summary: {
            totalMappings: Object.keys(mappingsObject).length,
            hasJapaneseLoc: stats.weaponTypesWithLocalization.jp,
            hasKoreanLoc: stats.weaponTypesWithLocalization.kr,
            hasEnglishLoc: stats.weaponTypesWithLocalization.en,
          }
        };
      }
    }
  ];

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    setLoading(endpoint.name);
    setErrors(prev => ({ ...prev, [endpoint.name]: '' }));

    try {
      const result = await endpoint.testFunction();
      setResults(prev => ({ ...prev, [endpoint.name]: result }));
      console.log(`${endpoint.name}:`, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      setErrors(prev => ({ ...prev, [endpoint.name]: errorMessage }));
      console.error(`${endpoint.name} エラー:`, error);
    } finally {
      setLoading(null);
    }
  };

  const formatResult = (data: unknown): string => {
    if (Array.isArray(data)) {
      return `配列 (${data.length}件)\n最初の3件:\n${JSON.stringify(data.slice(0, 3), null, 2)}`;
    } else if (typeof data === 'object' && data !== null) {
      const entries = Object.entries(data);
      if (entries.length > 10) {
        const preview = Object.fromEntries(entries.slice(0, 10));
        return `オブジェクト (${entries.length}個のキー)\n最初の10個:\n${JSON.stringify(preview, null, 2)}`;
      }
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Eternal Return API エクスプローラー
        </Typography>
        <Typography variant="body1" color="text.secondary">
          利用可能なAPIエンドポイントとデータ構造を調査します
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {apiEndpoints.map((endpoint) => (
          <Card key={endpoint.name}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6">{endpoint.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {endpoint.endpoint}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {endpoint.description}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => testEndpoint(endpoint)}
                  disabled={loading === endpoint.name}
                  startIcon={loading === endpoint.name ? <CircularProgress size={20} /> : null}
                >
                  {loading === endpoint.name ? 'テスト中...' : 'テスト実行'}
                </Button>
              </Box>

              {errors[endpoint.name] && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors[endpoint.name]}
                </Alert>
              )}

              {results[endpoint.name] && (
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>結果を表示</Typography>
                    {Array.isArray(results[endpoint.name]) && (
                      <Chip
                        label={`${results[endpoint.name].length}件`}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: 'background.paper',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        maxHeight: 400
                      }}
                    >
                      {formatResult(results[endpoint.name])}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default ApiExplorer;