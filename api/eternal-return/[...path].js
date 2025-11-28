export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  const apiKey = process.env.VITE_ETERNAL_RETURN_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const targetUrl = `https://open-api.bser.io/${apiPath}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'x-api-key': apiKey,
        'accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Eternal Return API', details: error.message });
  }
}