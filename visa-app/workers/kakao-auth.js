// Cloudflare Worker: 카카오 OAuth 토큰 교환
// POST /auth/kakao { code, redirectUri }
// → 카카오에서 access_token 받아서 → 사용자 정보 조회 → 반환

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { code, redirectUri } = await request.json();
      
      if (!code || !redirectUri) {
        return new Response(JSON.stringify({ error: 'code and redirectUri required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Step 1: 인가 코드 → 액세스 토큰
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: env.KAKAO_REST_API_KEY,
          redirect_uri: redirectUri,
          code: code,
        }).toString()
      });

      const tokenData = await tokenRes.json();
      
      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error, message: tokenData.error_description }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Step 2: 액세스 토큰 → 사용자 정보
      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });

      const userData = await userRes.json();

      const userInfo = {
        id: userData.id,
        nickname: userData.kakao_account?.profile?.nickname || '',
        profile_image: userData.kakao_account?.profile?.profile_image_url || '',
        email: userData.kakao_account?.email || '',
        loginType: 'kakao',
        loginTime: new Date().toISOString()
      };

      return new Response(JSON.stringify({ ok: true, user: userInfo }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error', message: err.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
