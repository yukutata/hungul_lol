export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // URLデコード
    const targetUrl = decodeURIComponent(url);

    // Eternal Return APIへのリクエストの場合、APIキーを追加
    const headers = {};
    if (targetUrl.includes('open-api.bser.io')) {
      const apiKey = process.env.VITE_ETERNAL_RETURN_API_KEY;
      if (apiKey) {
        headers['x-api-key'] = apiKey;
        headers['accept'] = 'application/json';
      }
    }

    console.log('Proxying to:', targetUrl);
    console.log('Headers:', headers);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
    });

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      res.setHeader('Content-Type', contentType || 'text/plain');
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Proxy request failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}