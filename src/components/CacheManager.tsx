import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { apiCache } from '../utils/apiCache';

const CacheManager: React.FC = () => {
  const [cacheStats, setCacheStats] = useState({ totalSize: 0, itemCount: 0 });

  useEffect(() => {
    updateCacheStats();
  }, []);

  const updateCacheStats = () => {
    const stats = apiCache.getStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    // ローカライゼーション関連のキャッシュを特別にクリア
    apiCache.remove('localization-korean');
    apiCache.remove('localization-japanese');
    apiCache.clearAll();
    updateCacheStats();
    // ページをリロードして新しいデータを取得
    window.location.reload();
  };

  const handleClearExpired = () => {
    apiCache.clearExpiredCache();
    updateCacheStats();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercentage = (cacheStats.totalSize / (5 * 1024 * 1024)) * 100; // 5MBを上限と仮定

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        APIキャッシュ管理
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Chip
            label={`${cacheStats.itemCount}件のキャッシュ`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={formatBytes(cacheStats.totalSize)}
            color="secondary"
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            ストレージ使用率: {usagePercentage.toFixed(1)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={usagePercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleClearExpired}
        >
          期限切れを削除
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleClearCache}
        >
          全て削除
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        APIレート制限を避けるため、データは1時間キャッシュされます
      </Typography>
    </Paper>
  );
};

export default CacheManager;