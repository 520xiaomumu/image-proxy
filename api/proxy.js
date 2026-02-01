// api/proxy.js（Vercel Serverless函数）
export default async function handler(req, res) {
  // 1. 配置CORS（允许你的前端域名访问，开发时用*临时测试）
  res.setHeader('Access-Control-Allow-Origin', '*'); // 生产环境替换成你的前端域名，比如"https://你的页面.com"
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理浏览器的OPTIONS预请求（必须加，否则跨域会失败）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 2. 获取要代理的目标图片接口地址（从请求参数里拿）
    const targetUrl = req.query.target;
    if (!targetUrl) {
      return res.status(400).json({ error: '缺少目标接口地址' });
    }

    // 3. 安全限制：只允许代理指定域名（比如MinMax的接口，避免被滥用）
    const allowedDomains = ['api.minimax.chat']; // 替换成你需要代理的接口域名
    const urlObj = new URL(targetUrl);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return res.status(403).json({ error: '不允许代理该域名' });
    }

    // 4. 转发请求到目标接口
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers, // 传递原请求的头（比如Authorization密钥）
      body: req.method === 'POST' ? req.body : null,
    });

    // 5. 把目标接口的结果返回给前端
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
}
