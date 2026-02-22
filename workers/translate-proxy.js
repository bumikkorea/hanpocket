/**
 * Cloudflare Workers 번역 프록시
 * DeepSeek API를 사용하여 텍스트 번역 서비스 제공
 */

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// 언어 코드 매핑
const LANGUAGE_NAMES = {
  'ko': 'Korean',
  'en': 'English',
  'ja': 'Japanese',
  'zh': 'Chinese',
  'fr': 'French',
  'de': 'German',
  'es': 'Spanish',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
};

async function handleTranslate(request, env) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    // 입력 검증
    if (!text || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: text, sourceLang, targetLang' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 언어 이름 변환
    const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
    const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

    // DeepSeek API 호출
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the given text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text without any additional explanation or formatting.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}));
      console.error('DeepSeek API Error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Translation service unavailable',
          details: errorData.error?.message || 'Unknown error'
        }), 
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const deepseekData = await deepseekResponse.json();
    const translatedText = deepseekData.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      return new Response(
        JSON.stringify({ 
          error: 'No translation received from service' 
        }), 
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        originalText: text,
        translatedText: translatedText,
        sourceLang: sourceLang,
        targetLang: targetLang,
        usage: deepseekData.usage || {}
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Translation Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// OPTIONS 요청 처리 (CORS preflight)
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// 메인 요청 핸들러
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // OPTIONS 요청 처리
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // /api/translate 엔드포인트
    if (url.pathname === '/api/translate' && request.method === 'POST') {
      return handleTranslate(request, env);
    }

    // 기본 응답 (API 정보)
    if (url.pathname === '/' || url.pathname === '/api') {
      return new Response(
        JSON.stringify({
          service: 'Translation Proxy',
          version: '1.0.0',
          endpoints: {
            'POST /api/translate': {
              description: 'Translate text using DeepSeek API',
              body: {
                text: 'Text to translate',
                sourceLang: 'Source language code (e.g., en, ko, ja)',
                targetLang: 'Target language code (e.g., en, ko, ja)'
              }
            }
          },
          supported_languages: Object.keys(LANGUAGE_NAMES)
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 404 응답
    return new Response(
      JSON.stringify({ error: 'Not Found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};