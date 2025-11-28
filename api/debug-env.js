export default function handler(req, res) {
  // セキュリティのため、本番環境では無効化
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return res.status(404).json({ error: 'Not found' });
  }

  const envVars = {};

  // 環境変数を表示
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_') || key.includes('ETERNAL_RETURN')) {
      // APIキーは一部のみ表示
      if (key.includes('KEY')) {
        envVars[key] = process.env[key] ? `${process.env[key].substring(0, 8)}...` : 'not set';
      } else {
        envVars[key] = process.env[key];
      }
    }
  });

  res.status(200).json({
    message: 'Environment variables',
    env: envVars,
    hasViteApiKey: !!process.env.VITE_ETERNAL_RETURN_API_KEY,
    hasApiKey: !!process.env.ETERNAL_RETURN_API_KEY,
    viteKeyLength: process.env.VITE_ETERNAL_RETURN_API_KEY?.length || 0,
    apiKeyLength: process.env.ETERNAL_RETURN_API_KEY?.length || 0
  });
}