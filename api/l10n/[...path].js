export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  const targetUrl = `https://d1wkxvul68bth9.cloudfront.net/${apiPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
    });

    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('content-type', contentType || 'text/plain');

    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch localization data', details: error.message });
  }
}