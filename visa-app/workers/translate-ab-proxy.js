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

const DASH_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
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
        const result = await chatComplete(DASH_URL, env.QWEN_API_KEY, 'qwen3.5-plus', [
          { role: 'system', content: sysPrompt(from, to) },
          { role: 'user', content: text.trim() },
        ])
        return json({ result })
      }

      // ── Model B: DeepSeek V3.2 (via Alibaba Cloud) ─────────
      if (path === '/translate/b') {
        if (!text?.trim()) return json({ error: 'text required' }, 400)
        const result = await chatComplete(DASH_URL, env.QWEN_API_KEY, 'deepseek-v3', [
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
        const result = await chatComplete(DASH_URL, env.QWEN_API_KEY, 'qwen-mt-turbo', [
          { role: 'user', content: mtPrompt },
        ])
        return json({ result })
      }

      // ── Camera: Qwen VL (OCR + overlay translate) ──────────
      if (path === '/translate/camera') {
        if (!image) return json({ error: 'image required' }, 400)
        const toLangName = langName(to)
        const fromLangName = langName(from)
        const prompt = `Detect every text region in this image. For each region return its translation from ${fromLangName} to ${toLangName} and its bounding box as percentages of image width/height.
Return ONLY a JSON array, no markdown, no explanation:
[{"orig":"original text","trans":"translated text","x1":10,"y1":5,"x2":40,"y2":15}, ...]
x1,y1 = top-left corner %, x2,y2 = bottom-right corner %. If no text found return [].`
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
            max_tokens: 800,
          }),
        })
        if (!r.ok) throw new Error(`VL error ${r.status}`)
        const d = await r.json()
        const raw = d.choices?.[0]?.message?.content?.trim() || ''

        // JSON 파싱 (```json ... ``` 감싸진 경우도 처리)
        let blocks = []
        try {
          const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
          const parsed = JSON.parse(jsonStr)
          if (Array.isArray(parsed)) blocks = parsed
        } catch {
          // 파싱 실패 시 전체 텍스트 폴백
          blocks = []
        }

        // 전체 텍스트 요약 (폴백용)
        const allOrig = blocks.map(b => b.orig).join(' / ') || raw
        const allTrans = blocks.map(b => b.trans).join(' / ')

        return json({ blocks, ocr: allOrig, result: allTrans, raw })
      }

      // ── Omni: Qwen3-Omni-Flash (audio → audio + text) ─────────
      if (path === '/translate/omni') {
        const { audio: audioData, audioFormat = 'wav' } = body
        if (!audioData) return json({ error: 'audio required' }, 400)
        const toLangName = langName(to)
        const fromLangName = langName(from)
        const instrText = `You are a professional interpreter. Listen to this ${fromLangName} speech and provide the translation in ${toLangName}. Speak only the translation, nothing else.`
        const r = await fetch(DASH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.QWEN_API_KEY}` },
          body: JSON.stringify({
            model: 'qwen3-omni-flash',
            messages: [{
              role: 'user',
              content: [
                { type: 'input_audio', input_audio: { data: audioData, format: audioFormat === 'webm' ? 'ogg' : audioFormat } },
                { type: 'text', text: instrText },
              ],
            }],
            modalities: ['text', 'audio'],
            audio: { voice: 'Cherry', format: 'wav' },
            stream: true,
          }),
        })
        if (!r.ok) throw new Error(`Omni error ${r.status}: ${(await r.text()).slice(0, 200)}`)

        // Accumulate SSE stream
        const reader = r.body.getReader()
        const decoder = new TextDecoder()
        const textParts = []
        const audioChunks = []
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() // keep incomplete line
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const obj = JSON.parse(data)
              const delta = obj.choices?.[0]?.delta
              if (delta?.content) textParts.push(delta.content)
              if (delta?.audio?.data) audioChunks.push(delta.audio.data)
            } catch { /* skip malformed */ }
          }
        }

        // Concatenate audio binary (decode each base64 chunk, merge, re-encode)
        let audioBase64 = ''
        if (audioChunks.length > 0) {
          const binaries = audioChunks.map(b64 => {
            const raw = atob(b64)
            const bytes = new Uint8Array(raw.length)
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
            return bytes
          })
          const totalLen = binaries.reduce((s, b) => s + b.length, 0)
          const merged = new Uint8Array(totalLen)
          let off = 0
          for (const b of binaries) { merged.set(b, off); off += b.length }
          // btoa on large arrays — chunked to avoid stack overflow
          let str = ''
          const chunk = 8192
          for (let i = 0; i < merged.length; i += chunk) {
            str += String.fromCharCode(...merged.subarray(i, i + chunk))
          }
          audioBase64 = btoa(str)
        }

        return json({ text: textParts.join(''), audio: audioBase64 })
      }

      return json({ error: 'unknown path' }, 404)
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  },
}
