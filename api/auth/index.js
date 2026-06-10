// 微信 OAuth 回调处理器 - Vercel Serverless Function
const APPID = 'wx7170a4e1a81b39eb';
const APPSECRET = '40e22039ff268da109cfa5d037c0e199';
const FRONTEND_URL = 'https://zhanmeng001.github.io/yun-miao/';

export default async function handler(req, res) {
  const { code } = req.query;

  // 没有 code → 跳转微信授权页
  if (!code) {
    const wechatAuth = 'https://open.weixin.qq.com/connect/oauth2/authorize' +
      '?appid=' + APPID +
      '&redirect_uri=' + encodeURIComponent('https://zhanmeng001.github.io/yun-miao/api/auth') +
      '&response_type=code' +
      '&scope=snsapi_userinfo' +
      '&state=wechat#wechat_redirect';
    res.redirect(302, wechatAuth);
    return;
  }

  // 有 code → 换 access_token → 拿用户信息 → 跳回页面
  try {
    const tokenRes = await fetch(
      'https://api.weixin.qq.com/sns/oauth2/access_token' +
      '?appid=' + APPID +
      '&secret=' + APPSECRET +
      '&code=' + code +
      '&grant_type=authorization_code'
    );
    const tokenData = await tokenRes.json();

    if (tokenData.errcode) {
      res.status(400).json({ error: tokenData });
      return;
    }

    const userRes = await fetch(
      'https://api.weixin.qq.com/sns/userinfo' +
      '?access_token=' + tokenData.access_token +
      '&openid=' + tokenData.openid +
      '&lang=zh_CN'
    );
    const userData = await userRes.json();

    const redirectUrl = FRONTEND_URL +
      '?nickname=' + encodeURIComponent(userData.nickname) +
      '&avatar=' + encodeURIComponent(userData.headimgurl);

    res.redirect(302, redirectUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
