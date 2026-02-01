// api/proxy.js（Vercel Serverless函数，仅代理ai-gateway.vercel.app）
export default async function handler(req, res) {
  // 1. 配置CORS跨域允许，开发时通配*方便测试
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理浏览器OPTIONS预请求，跨域必须加
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 获取拼接在请求里的目标接口地址
    const targetUrl = req.query.target;
    if (!targetUrl) {
      return res.status(400).json({ error: '缺少目标接口地址' });
    }

    // 仅允许代理图片接口的域名
    const allowedDomains = ['ai-gateway.vercel.app'];
    const urlObj = new URL(targetUrl);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return res.status(403).json({ error: '不允许代理该域名' });
    }

    // 转发请求到目标接口，透传请求方法、头、参数
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'POST' ? req.body : null,
    });

    // 把目标接口的结果原封不动返回给工具
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: '代理请求失败：' + error.message });
  }
}
