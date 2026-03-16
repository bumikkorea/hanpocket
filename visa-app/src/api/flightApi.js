/**
 * Flight Status API
 *
 * TODO: Register for one of:
 * - FlightAware API: VITE_FLIGHTAWARE_API_KEY (https://flightaware.com/commercial/flightxml/)
 * - AeroDataBox API: VITE_AERODATABOX_API_KEY (https://www.aerodatabox.com/)
 *
 * Required env: VITE_FLIGHT_API_KEY
 */

// Common airlines from Korea
const AIRLINES = {
  KE: { name: 'Korean Air', nameKo: '대한항공' },
  OZ: { name: 'Asiana Airlines', nameKo: '아시아나항공' },
  LJ: { name: 'Jin Air', nameKo: '진에어' },
  TW: { name: "T'way Air", nameKo: '티웨이항공' },
  '7C': { name: 'Jeju Air', nameKo: '제주항공' },
  ZE: { name: 'Eastar Jet', nameKo: '이스타항공' },
  BX: { name: 'Air Busan', nameKo: '에어부산' },
  RS: { name: 'Air Seoul', nameKo: '에어서울' },
  CA: { name: 'Air China', nameKo: '중국국제항공' },
  MU: { name: 'China Eastern', nameKo: '중국동방항공' },
  CZ: { name: 'China Southern', nameKo: '중국남방항공' },
  NH: { name: 'ANA', nameKo: '전일본공수' },
  JL: { name: 'Japan Airlines', nameKo: '일본항공' },
}

/**
 * Fetch flight status by flight number
 * TODO: Replace with real API call
 */
export async function fetchFlightStatus(flightNumber, date) {
  const apiKey = import.meta.env.VITE_FLIGHT_API_KEY

  if (apiKey) {
    try {
      // TODO: Real API endpoint (FlightAware or AeroDataBox)
      const res = await fetch(
        `https://aeroapi.flightaware.com/aeroapi/flights/${flightNumber}?start=${date}`,
        { headers: { 'x-apikey': apiKey } }
      )
      if (res.ok) {
        const data = await res.json()
        return parseFlightResponse(data)
      }
    } catch (e) {
      console.warn('Flight API failed:', e)
    }
  }

  // Mock flight data
  const airlineCode = flightNumber.replace(/[0-9]/g, '').toUpperCase()
  const airline = AIRLINES[airlineCode] || { name: airlineCode, nameKo: airlineCode }
  const departureDate = date || new Date().toISOString().split('T')[0]

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        flightNumber: flightNumber.toUpperCase(),
        airline: airline.name,
        airlineKo: airline.nameKo,
        date: departureDate,
        departureAirport: 'ICN',
        departureTerminal: airlineCode === 'KE' || airlineCode === 'OZ' ? 'T2' : 'T1',
        departureTime: `${departureDate}T14:30:00+09:00`,
        departureGate: `${Math.floor(Math.random() * 40) + 100}`,
        arrivalAirport: airlineCode.startsWith('C') ? 'PVG' : airlineCode === 'NH' || airlineCode === 'JL' ? 'NRT' : 'PVG',
        arrivalTime: `${departureDate}T16:00:00+08:00`,
        status: 'scheduled',
        delay: 0,
        boardingTime: `${departureDate}T13:50:00+09:00`,
      })
    }, 600)
  })
}

function parseFlightResponse(data) {
  // TODO: Parse actual API response
  const flight = data?.flights?.[0] || {}
  return {
    flightNumber: flight.ident || '',
    airline: flight.operator || '',
    departureAirport: flight.origin?.code_iata || '',
    departureTerminal: flight.origin?.terminal || '',
    departureTime: flight.scheduled_out || '',
    departureGate: flight.gate_origin || '',
    arrivalAirport: flight.destination?.code_iata || '',
    arrivalTime: flight.scheduled_in || '',
    status: flight.status || 'unknown',
    delay: flight.departure_delay || 0,
  }
}

/**
 * Get airport congestion level
 * TODO: Integrate Incheon Airport congestion API
 */
export async function getAirportCongestion(airportCode = 'ICN') {
  const hour = new Date().getHours()
  // Simulated congestion levels based on typical patterns
  let level = 'normal'
  if (hour >= 6 && hour <= 9) level = 'busy'
  if (hour >= 10 && hour <= 14) level = 'very_busy'
  if (hour >= 15 && hour <= 18) level = 'busy'
  if (hour >= 19 && hour <= 21) level = 'normal'
  if (hour >= 22 || hour < 6) level = 'quiet'

  return {
    airport: airportCode,
    level,
    estimatedSecurityWait: level === 'very_busy' ? 25 : level === 'busy' ? 15 : 8,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Estimate walking time from check-in to gate (minutes)
 */
export function estimateGateWalkTime(terminal, gate) {
  // Rough estimates for ICN
  const gateNum = parseInt(gate) || 0
  if (terminal === 'T2') return gateNum > 250 ? 15 : 10
  // T1
  if (gateNum > 40) return 20
  if (gateNum > 20) return 15
  return 10
}

export { AIRLINES }
