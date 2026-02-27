import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = join(__dirname, '..', 'src', 'data', '공중화장실정보_서울특별시.csv')
const outputPath = join(__dirname, '..', 'src', 'data', 'seoulRestrooms.js')

// Read CSV as buffer and decode from EUC-KR
const buf = readFileSync(csvPath)
const text = new TextDecoder('euc-kr').decode(buf)

// RFC 4180 compliant CSV row parser (handles quoted fields with commas)
function parseCSVRow(line) {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current.trim())
  return fields
}

const lines = text.split('\n').filter(l => l.trim())
const header = parseCSVRow(lines[0])

// Find column indices
const nameIdx = header.indexOf('화장실명')
const hoursIdx = header.indexOf('개방시간상세')
const latIdx = header.indexOf('WGS84위도')
const lngIdx = header.indexOf('WGS84경도')
const lastModIdx = header.indexOf('최종수정시점')

console.log(`Header columns: ${header.length}`)
console.log(`  화장실명: col ${nameIdx}`)
console.log(`  개방시간상세: col ${hoursIdx}`)
console.log(`  WGS84위도: col ${latIdx}`)
console.log(`  WGS84경도: col ${lngIdx}`)
console.log(`  최종수정시점: col ${lastModIdx}`)

const restrooms = []
let skipped = 0

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVRow(lines[i])
  const lat = parseFloat(fields[latIdx])
  const lng = parseFloat(fields[lngIdx])

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    skipped++
    continue
  }

  const lastMod = (fields[lastModIdx] || '').split(' ')[0] // date portion only

  restrooms.push({
    id: `restroom_${restrooms.length}`,
    name: fields[nameIdx] || '',
    hours: fields[hoursIdx] || '',
    lat,
    lng,
    lastModified: lastMod,
  })
}

console.log(`\nTotal rows: ${lines.length - 1}`)
console.log(`Valid (with coords): ${restrooms.length}`)
console.log(`Skipped (no coords): ${skipped}`)

// Write JS module
const output = `// 서울 공중화장실 위치 데이터
// Source: data.go.kr 공중화장실정보_서울특별시.csv
// 총 ${restrooms.length}개 (좌표가 있는 화장실만 포함)

export const seoulRestrooms = ${JSON.stringify(restrooms)}
`

writeFileSync(outputPath, output, 'utf-8')
console.log(`\nOutput written to: ${outputPath}`)
