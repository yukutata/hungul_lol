import React, { useState } from 'react';
import { Button, CircularProgress, Alert, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import eternalReturnAPI from '../api/eternalReturn';

const ApiTestButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testAPIConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      // APIキーの有効性をチェック
      const isValid = await eternalReturnAPI.checkAPIKey();

      if (isValid) {
        // ゲームバージョンを取得してテスト
        const version = await eternalReturnAPI.getGameVersion();

        // キャラクター数も取得してみる
        const characters = await eternalReturnAPI.getCharacters();
        console.log(`取得したキャラクター数: ${characters.length}`);
        console.log('最初の3キャラクター:', characters.slice(0, 3));

        setResult({
          success: true,
          message: `API接続成功！\n${version}\nキャラクター数: ${characters.length}`
        });

      } else {
        setResult({
          success: false,
          message: 'APIキーが無効です'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `エラー: ${error instanceof Error ? error.message : '不明なエラー'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', p: 2 }}>
      <Button
        variant="contained"
        onClick={testAPIConnection}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'テスト中...' : 'Eternal Return API テスト'}
      </Button>

      {result && (
        <Alert
          severity={result.success ? 'success' : 'error'}
          icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {result.message}
        </Alert>
      )}
    </Box>
  );
};

export default ApiTestButton;