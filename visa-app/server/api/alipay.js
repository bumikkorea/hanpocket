// Alipay OAuth 서버 사이드 구현
// 이 파일은 Express.js 서버에서 사용됩니다.

const crypto = require('crypto');
const axios = require('axios');

// Alipay 설정 (환경변수에서 가져와야 함)
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID;
const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY;
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY;
const ALIPAY_GATEWAY = 'https://openapi.alipay.com/gateway.do';

// RSA 서명 생성
function generateSign(params, privateKey) {
  // 매개변수를 알파벳 순으로 정렬
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  // RSA-SHA256 서명 생성
  const sign = crypto
    .createSign('RSA-SHA256')
    .update(sortedParams, 'utf8')
    .sign(privateKey, 'base64');
    
  return sign;
}

// 서명 검증
function verifySign(params, sign, publicKey) {
  const sortedParams = Object.keys(params)
    .filter(key => key !== 'sign' && key !== 'sign_type')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  return crypto
    .createVerify('RSA-SHA256')
    .update(sortedParams, 'utf8')
    .verify(publicKey, sign, 'base64');
}

// 인증 코드를 액세스 토큰으로 교환
async function exchangeToken(req, res) {
  try {
    const { authCode } = req.body;
    
    if (!authCode) {
      return res.status(400).json({ error: 'Auth code is required' });
    }
    
    const bizContent = {
      grant_type: 'authorization_code',
      code: authCode
    };
    
    const params = {
      app_id: ALIPAY_APP_ID,
      method: 'alipay.system.oauth.token',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    };
    
    // 서명 생성
    const sign = generateSign(params, ALIPAY_PRIVATE_KEY);
    params.sign = sign;
    
    // Alipay API 호출
    const response = await axios.post(ALIPAY_GATEWAY, null, {
      params: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    const result = response.data;
    
    // 응답 검증
    if (result.alipay_system_oauth_token_response) {
      const tokenData = result.alipay_system_oauth_token_response;
      
      if (tokenData.code === '10000') {
        res.json({
          access_token: tokenData.access_token,
          user_id: tokenData.user_id,
          expires_in: tokenData.expires_in,
          refresh_token: tokenData.refresh_token
        });
      } else {
        res.status(400).json({ 
          error: 'Token exchange failed', 
          details: tokenData 
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Invalid response from Alipay', 
        details: result 
      });
    }
    
  } catch (error) {
    console.error('Alipay token exchange error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// 사용자 정보 가져오기
async function getUserInfo(req, res) {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    const bizContent = {
      auth_token: access_token
    };
    
    const params = {
      app_id: ALIPAY_APP_ID,
      method: 'alipay.user.info.share',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    };
    
    // 서명 생성
    const sign = generateSign(params, ALIPAY_PRIVATE_KEY);
    params.sign = sign;
    
    // Alipay API 호출
    const response = await axios.post(ALIPAY_GATEWAY, null, {
      params: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    const result = response.data;
    
    // 응답 검증
    if (result.alipay_user_info_share_response) {
      const userInfo = result.alipay_user_info_share_response;
      
      if (userInfo.code === '10000') {
        res.json({
          user_id: userInfo.user_id,
          nick_name: userInfo.nick_name,
          avatar: userInfo.avatar,
          gender: userInfo.gender,
          province: userInfo.province,
          city: userInfo.city
        });
      } else {
        res.status(400).json({ 
          error: 'User info request failed', 
          details: userInfo 
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Invalid response from Alipay', 
        details: result 
      });
    }
    
  } catch (error) {
    console.error('Alipay user info error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Express.js 라우터 설정 예시
module.exports = function(app) {
  // POST /api/alipay/exchange-token
  app.post('/api/alipay/exchange-token', exchangeToken);
  
  // POST /api/alipay/user-info
  app.post('/api/alipay/user-info', getUserInfo);
};

// 또는 라우터 객체로 내보내기
const express = require('express');
const router = express.Router();

router.post('/exchange-token', exchangeToken);
router.post('/user-info', getUserInfo);

module.exports = router;