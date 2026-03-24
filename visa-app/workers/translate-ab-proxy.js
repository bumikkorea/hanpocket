/**
 * translate-ab-proxy — Cloudflare Worker
 * POST /translate/a  → Qwen Plus
 * POST /translate/b  → DeepSeek V3
 * POST /translate/d  → Qwen MT (translation-specialized)
 * POST /translate/camera → Qwen VL (OCR + translate from image)
 * Body: { text?, image?, mimeType?, from, to }
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const DASH_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function langName(code) {
  return code === 'zh' ? '中文(简体)' : '한국어'
}

function sysPrompt(from, to) {
  return `You are a professional interpreter. Translate from ${langName(from)} to ${langName(to)}. Output ONLY the translated text with no explanations.`
}

async function chatComplete(url, apiKey, model, messages) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.1, max_tokens: 512 }),
  })
  if (!r.ok) throw new Error(`${r.status}: ${(await r.text()).slice(0, 200)}`)
  const d = await r.json()
  return d.choices?.[0]?.message?.content?.trim() || ''
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405)

    const path = new URL(request.url).pathname
    let body
    try { body = await request.json() } catch { return json({ error: 'invalid JSON' }, 400) }

    const { text, image, mimeType = 'image/jpeg', from, to } = body
    if (!from || !to) return json({ error: 'from/to required' }, 400)

    try {
      // ── Model A: Qwen Plus ──────────────────────────────────
      if (path === '/translate/a') {
        if (!text?.trim()) return json({ error: 'text required' }, 400)
        const result = await chatComplete(DASH_URL, env.QWEN_API_KEY, 'qwen-plus', [
          { role: 'system', content: sysPrompt(from, to) },
          { role: 'user', content: text.trim() },
        ])
        return json({ result })
      }

      // ── Model B: DeepSeek V3 ────────────────────────────────
      if (path === '/translate/b') {
        if (!text?.trim()) return json({ error: 'text required' }, 400)
        const result = await chatComplete(DEEPSEEK_URL, env.DEEPSEEK_API_KEY, 'deepseek-chat', [
          { role: 'system', content: sysPrompt(from, to) },
          { role: 'user', content: text.trim() },
        ])
        return json({ result })
      }

      // ── Model D: Qwen MT (translation-specialized) ──────────
      if (path === '/translate/d') {
        if (!text?.trim()) return json({ error: 'text required' }, 400)
        // Qwen MT uses dedicated translation prompt format
        const mtPrompt = from === 'zh'
          ? `将以下中文翻译成韩语，只输出翻译结果：\n${text.trim()}`
          : `다음 한국어를 중국어(简体)로 번역하세요. 번역 결과만 출력하세요：\n${text.trim()}`
        const result = await chatComplete(DASH_URL, env.QWEN_API_KEY, 'qwen-mt-plus', [
          { role: 'user', content: mtPrompt },
        ])
        return json({ result })
      }

      // ── Camera: Qwen VL (OCR + translate) ──────────────────
      if (path === '/translate/camera') {
        if (!image) return json({ error: 'image required' }, 400)
        const toLangName = langName(to)
        const fromLangName = langName(from)
        const prompt = `Please extract all text from this image (which is in ${fromLangName}), then translate it to ${toLangName}.\nFormat your response exactly as:\n원문: [extracted text]\n번역: [translated text]`
        const r = await fetch(DASH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.QWEN_API_KEY}` },
          body: JSON.stringify({
            model: 'qwen-vl-plus',
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
                { type: 'text', text: prompt },
              ],
            }],
            temperature: 0.1,
          }),
        })
        if (!r.ok) throw new Error(`VL error ${r.status}`)
        const d = await r.json()
        const raw = d.choices?.[0]?.message?.content?.trim() || ''
        const origMatch = raw.match(/원문[：:]\s*(.+?)(?:\n|번역|$)/s)
        const transMatch = raw.match(/번역[：:]\s*(.+?)$/s)
        return json({
          ocr: origMatch?.[1]?.trim() || raw,
          result: transMatch?.[1]?.trim() || raw,
          raw,
        })
      }

      return json({ error: 'unknown path' }, 404)
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  },
}
