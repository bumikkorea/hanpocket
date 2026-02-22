// ─── HanPocket Push Notification Server (Cloudflare Worker) ───
// Deploy: wrangler deploy workers/push-server.js
// Secrets needed: VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY

// VAPID auth header generation
async function generateVapidAuth(endpoint, vapidKeys) {
  const urlObj = new URL(endpoint)
  const audience = `${urlObj.protocol}//${urlObj.host}`
  
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: 'mailto:push@hanpocket.kr'
  }

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const unsignedToken = `${headerB64}.${payloadB64}`

  // Import private key
  const privateKeyRaw = base64urlToBuffer(vapidKeys.privateKey)
  const publicKeyRaw = base64urlToBuffer(vapidKeys.publicKey)
  
  const keyData = new Uint8Array(32 + 65)
  // Not directly usable — need JWK import
  const jwk = {
    kty: 'EC', crv: 'P-256',
    x: bufferToBase64url(publicKeyRaw.slice(1, 33)),
    y: bufferToBase64url(publicKeyRaw.slice(33, 65)),
    d: bufferToBase64url(privateKeyRaw),
  }

  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsignedToken))
  
  const sigB64 = bufferToBase64url(new Uint8Array(signature))
  const jwt = `${unsignedToken}.${sigB64}`

  return {
    authorization: `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
  }
}

function base64urlToBuffer(b64) {
  const padding = '='.repeat((4 - b64.length % 4) % 4)
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function bufferToBase64url(buffer) {
  let binary = ''
  for (const byte of buffer) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// ─── Main Handler ───
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // POST /api/push/subscribe — store subscription
    if (url.pathname === '/api/push/subscribe' && request.method === 'POST') {
      const { subscription, userId } = await request.json()
      if (!subscription?.endpoint) {
        return Response.json({ error: 'Invalid subscription' }, { status: 400, headers: corsHeaders })
      }
      // Store in KV
      await env.PUSH_SUBSCRIPTIONS.put(`sub:${userId || subscription.endpoint}`, JSON.stringify({
        subscription,
        userId,
        createdAt: new Date().toISOString()
      }))
      return Response.json({ ok: true }, { headers: corsHeaders })
    }

    // POST /api/push/send — send notification to a user
    if (url.pathname === '/api/push/send' && request.method === 'POST') {
      const { userId, title, body, url: notifUrl, tag, type } = await request.json()
      
      const subData = await env.PUSH_SUBSCRIPTIONS.get(`sub:${userId}`)
      if (!subData) {
        return Response.json({ error: 'No subscription found' }, { status: 404, headers: corsHeaders })
      }
      
      const { subscription } = JSON.parse(subData)
      const result = await sendPushNotification(subscription, { title, body, url: notifUrl, tag, type }, {
        publicKey: env.VAPID_PUBLIC_KEY,
        privateKey: env.VAPID_PRIVATE_KEY,
      })
      
      return Response.json({ ok: result }, { headers: corsHeaders })
    }

    // POST /api/push/broadcast — send to all subscribers
    if (url.pathname === '/api/push/broadcast' && request.method === 'POST') {
      const { title, body, url: notifUrl, tag, type } = await request.json()
      
      const list = await env.PUSH_SUBSCRIPTIONS.list({ prefix: 'sub:' })
      let sent = 0, failed = 0
      
      for (const key of list.keys) {
        try {
          const subData = JSON.parse(await env.PUSH_SUBSCRIPTIONS.get(key.name))
          const ok = await sendPushNotification(subData.subscription, { title, body, url: notifUrl, tag, type }, {
            publicKey: env.VAPID_PUBLIC_KEY,
            privateKey: env.VAPID_PRIVATE_KEY,
          })
          if (ok) sent++; else failed++
        } catch { failed++ }
      }
      
      return Response.json({ sent, failed }, { headers: corsHeaders })
    }

    // ─── Cron: D-day check for all users ───
    // This would be triggered by Workers Cron
    if (url.pathname === '/api/cron/dday-check') {
      const list = await env.PUSH_SUBSCRIPTIONS.list({ prefix: 'sub:' })
      let checked = 0
      
      for (const key of list.keys) {
        try {
          const subData = JSON.parse(await env.PUSH_SUBSCRIPTIONS.get(key.name))
          if (subData.visaExpiry) {
            const dday = Math.ceil((new Date(subData.visaExpiry) - new Date()) / 86400000)
            if ([90, 60, 30, 14, 7, 3, 1].includes(dday)) {
              await sendPushNotification(subData.subscription, {
                title: 'HanPocket 비자 알림',
                body: `비자 만료 D-${dday}일! ${dday <= 7 ? '긴급 연장 준비하세요!' : '연장 서류를 준비하세요.'}`,
                url: '/?tab=visaalert',
                tag: `visa-dday-${dday}`,
                type: 'visa'
              }, { publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY })
              checked++
            }
          }
        } catch {}
      }
      
      return Response.json({ checked }, { headers: corsHeaders })
    }

    return Response.json({ service: 'HanPocket Push Server', status: 'ok' }, { headers: corsHeaders })
  },

  // Cloudflare Workers Cron Trigger
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      fetch(`https://hanpocket-push.bumik-korea.workers.dev/api/cron/dday-check`)
    )
  }
}

async function sendPushNotification(subscription, payload, vapidKeys) {
  try {
    const vapidAuth = await generateVapidAuth(subscription.endpoint, vapidKeys)
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        ...vapidAuth,
        'Content-Type': 'application/json',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
      },
      body: JSON.stringify(payload)
    })

    if (response.status === 410 || response.status === 404) {
      // Subscription expired, should remove
      return false
    }
    
    return response.ok
  } catch (err) {
    console.error('Push send error:', err)
    return false
  }
}
