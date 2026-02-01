export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const target = req.query.target;
    if (!target) return res.status(400).json({ error: '缺少 target 参数' });

    const targetUrl = new URL(target);

    // 可选：限制域名（不限制就注释掉）
    // const allow = ['ai-gateway.vercel.app', 'api.openai.com', 'api.minimax.chat'];
    // if (!allow.includes(targetUrl.hostname)) {
    //   return res.status(403).json({ error: '不允许代理该域名' });
    // }

    const headers = new Headers();
    // 只转发必要头
    if (req.headers.authorization) headers.set('Authorization', req.headers.authorization);
    headers.set('Content-Type', 'application/json');

    const body = req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined;

    const upstream = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (e) {
    return res.status(500).json({ error: '代理失败: ' + e.message });
  }
}
