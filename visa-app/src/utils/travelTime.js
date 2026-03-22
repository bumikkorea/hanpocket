/**
 * Haversine-based travel time estimation for Seoul area.
 * No external API calls — uses statistical averages.
 */

const DEG_TO_RAD = Math.PI / 180

export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = (lat2 - lat1) * DEG_TO_RAD
  const dLng = (lng2 - lng1) * DEG_TO_RAD
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getDetourFactor(lat1, lng1, lat2, lng2) {
  // Cross Han River (~37.52 latitude)
  if ((lat1 > 37.52 && lat2 < 37.52) || (lat1 < 37.52 && lat2 > 37.52)) return 1.7
  // Near mountain area (northern Seoul)
  if (lat1 > 37.58 || lat2 > 37.58) return 1.6
  return 1.35
}

export function estimateTravel(stop1, stop2, method = 'auto') {
  if (!stop1?.lat || !stop1?.lng || !stop2?.lat || !stop2?.lng) {
    return { method: method === 'auto' ? 'walk' : method, minutes: 0, km: 0 }
  }

  const straightKm = haversineKm(stop1.lat, stop1.lng, stop2.lat, stop2.lng)
  const detour = getDetourFactor(stop1.lat, stop1.lng, stop2.lat, stop2.lng)
  const roadKm = straightKm * detour

  // Auto-select method based on distance
  if (method === 'auto') {
    if (straightKm < 0.8) method = 'walk'
    else if (straightKm < 3) method = 'bus'
    else method = 'subway'
  }

  let minutes
  switch (method) {
    case 'walk':
      minutes = (roadKm / 4) * 60
      break
    case 'bicycle':
      minutes = (roadKm / 14) * 60 + 2 // avg 14km/h + unlock time
      break
    case 'subway':
    case 'transit': {
      // Bus+Subway combined: estimate based on distance
      const stations = Math.ceil(roadKm / 1.2)
      minutes = stations * 2 + 5 + 3 // ride + wait + walk
      break
    }
    case 'bus':
      minutes = (roadKm / 17) * 60 + 7 // ride + wait
      break
    case 'taxi': {
      // Seoul taxi: 30~60km/h depending on traffic
      const fastMin = Math.round((roadKm / 55) * 60) + 2
      const slowMin = Math.round((roadKm / 28) * 60) + 2
      return {
        method: 'taxi',
        minutes: fastMin, // show as range via minMinutes/maxMinutes
        minMinutes: Math.max(1, fastMin),
        maxMinutes: Math.max(1, slowMin),
        km: Math.round(roadKm * 10) / 10,
      }
    }
    default:
      minutes = (roadKm / 4) * 60
  }

  return {
    method,
    minutes: Math.max(1, Math.round(minutes)),
    km: Math.round(roadKm * 10) / 10,
  }
}

/**
 * Get all 4 transport mode estimates at once (카카오맵 style)
 * Returns: { taxi, transit, walk, bicycle }
 */
export function estimateAllModes(stop1, stop2) {
  if (!stop1?.lat || !stop1?.lng || !stop2?.lat || !stop2?.lng) {
    return null
  }
  const straightKm = haversineKm(stop1.lat, stop1.lng, stop2.lat, stop2.lng)
  const detour = getDetourFactor(stop1.lat, stop1.lng, stop2.lat, stop2.lng)
  const roadKm = straightKm * detour

  return {
    taxi: estimateTravel(stop1, stop2, 'taxi'),
    transit: estimateTravel(stop1, stop2, 'transit'),
    walk: estimateTravel(stop1, stop2, 'walk'),
    bicycle: estimateTravel(stop1, stop2, 'bicycle'),
    km: Math.round(roadKm * 10) / 10,
  }
}

export function kakaoDirectionLink(from, to) {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return ''
  const sName = typeof from.name === 'string' ? from.name : (from.name?.ko || from.name?.en || '')
  const eName = typeof to.name === 'string' ? to.name : (to.name?.ko || to.name?.en || '')
  // Official Kakao Map link format — auto-converts WGS84 to internal coords
  return `https://map.kakao.com/link/from/${encodeURIComponent(sName)},${from.lat},${from.lng}/to/${encodeURIComponent(eName)},${to.lat},${to.lng}`
}

export function getDirectionLinks(from, to) {
  const sName = typeof from?.name === 'string' ? from.name : (from?.name?.ko || from?.name?.en || '')
  const eName = typeof to?.name === 'string' ? to.name : (to?.name?.ko || to?.name?.en || '')
  return {
    kakao: kakaoDirectionLink(from, to),
    google: `https://www.google.com/maps/dir/?api=1&origin=${from?.lat},${from?.lng}&destination=${to?.lat},${to?.lng}&travelmode=transit`,
    baidu: `https://api.map.baidu.com/direction?origin=latlng:${from?.lat},${from?.lng}|name:${encodeURIComponent(sName)}&destination=latlng:${to?.lat},${to?.lng}|name:${encodeURIComponent(eName)}&coord_type=wgs84&mode=transit&output=html`,
    amap: `https://uri.amap.com/navigation?from=${from?.lng},${from?.lat},${encodeURIComponent(sName)}&to=${to?.lng},${to?.lat},${encodeURIComponent(eName)}&mode=bus&coordinate=wgs84&callnative=1`,
    naver: `https://map.naver.com/v5/directions/${from?.lng},${from?.lat},${encodeURIComponent(sName)}/${to?.lng},${to?.lat},${encodeURIComponent(eName)}/-/transit`,
  }
}
