#!/usr/bin/env node
// Geocode restaurants in restaurantData.js using Kakao Local API
// Phase 1: Collect coordinates → geocode-results.json
// Phase 2: Patch restaurantData.js
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../src/data/restaurantData.js')
const RESULTS_FILE = path.join(__dirname, 'geocode-results.json')

const KAKAO_REST_KEY = '6afa9f63ce3a224ae93a8f315248d98a'
const DELAY_MS = 220

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function geocode(query) {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `KakaoAK ${KAKAO_REST_KEY}`,
      'KA': 'sdk/1.0 os/javascript origin/https://hanpocket.pages.dev'
    }
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.documents?.length > 0) {
    return { lat: parseFloat(data.documents[0].y), lng: parseFloat(data.documents[0].x) }
  }
  return null
}

const mode = process.argv[2] || 'all'

if (mode === 'all' || mode === 'fetch') {
  // Phase 1: Fetch coordinates
  const mod = await import(DATA_FILE)
  const all = [...mod.MICHELIN_RESTAURANTS, ...mod.BLUE_RIBBON_RESTAURANTS]
  console.log(`Total: ${all.length}`)

  const existing = existsSync(RESULTS_FILE) ? JSON.parse(readFileSync(RESULTS_FILE, 'utf-8')) : {}
  let success = Object.keys(existing).length, fail = 0

  for (let i = 0; i < all.length; i++) {
    const r = all[i]
    if (existing[r.id]) { continue }
    if (r.lat && r.lng) { existing[r.id] = { lat: r.lat, lng: r.lng }; continue }

    const nameKo = r.name?.ko || ''
    const gu = r.area?.gu || ''
    const city = r.area?.city || ''

    let coords = await geocode(`${nameKo} ${gu}`.trim())
    if (!coords && city) { await sleep(DELAY_MS); coords = await geocode(`${nameKo} ${city}`) }
    if (!coords) { await sleep(DELAY_MS); coords = await geocode(nameKo) }

    if (coords) {
      existing[r.id] = coords
      success++
      console.log(`[${i + 1}/${all.length}] ✓ ${nameKo} → ${coords.lat}, ${coords.lng}`)
    } else {
      fail++
      console.log(`[${i + 1}/${all.length}] ✗ ${nameKo}`)
    }
    await sleep(DELAY_MS)
  }

  writeFileSync(RESULTS_FILE, JSON.stringify(existing, null, 2))
  console.log(`\nSaved ${Object.keys(existing).length} results. Failed: ${fail}`)
}

if (mode === 'all' || mode === 'patch') {
  // Phase 2: Patch the source file
  const results = JSON.parse(readFileSync(RESULTS_FILE, 'utf-8'))
  let src = readFileSync(DATA_FILE, 'utf-8')

  let patched = 0
  for (const [id, coords] of Object.entries(results)) {
    // Find this restaurant's object block
    const idStr = `"id": "${id}"`
    let pos = 0
    while (true) {
      const idx = src.indexOf(idStr, pos)
      if (idx === -1) break
      pos = idx + idStr.length

      // Check if lat already exists in this object (next 500 chars until closing brace)
      const objEnd = src.indexOf('\n  },', idx)
      if (objEnd === -1) continue
      const objSlice = src.slice(idx, objEnd)
      if (objSlice.includes('"lat"')) continue

      // Find "priceRange": line in this object
      const priceMatch = objSlice.match(/"priceRange": \d+,?/)
      if (!priceMatch) continue

      const pricePos = idx + objSlice.indexOf(priceMatch[0])
      const priceLineEnd = src.indexOf('\n', pricePos)

      // Ensure priceRange line ends with comma
      let lineContent = src.slice(pricePos, priceLineEnd)
      if (!lineContent.endsWith(',')) {
        src = src.slice(0, priceLineEnd) + ',' + src.slice(priceLineEnd)
      }

      const insertPos = src.indexOf('\n', pricePos) + 1
      const insertion = `    "lat": ${coords.lat},\n    "lng": ${coords.lng},\n`
      src = src.slice(0, insertPos) + insertion + src.slice(insertPos)
      patched++
      break
    }
  }

  writeFileSync(DATA_FILE, src, 'utf-8')
  console.log(`Patched ${patched} restaurants with coordinates`)
}
