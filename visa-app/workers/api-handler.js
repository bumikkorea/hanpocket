// Cloudflare Workers API Handler for Idol Data and Charts
// Provides REST endpoints for frontend applications

import { idolUpdater } from './idol-updater.js'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

// API routes
const routes = {
  '/api/charts': handleChartRequest,
  '/api/idol-data': handleIdolDataRequest,
  '/api/schedules': handleScheduleRequest,
  '/api/social': handleSocialRequest,
  '/api/news': handleNewsRequest,
  '/api/health': handleHealthCheck,
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }
    
    // Route matching
    const handler = routes[path] || handleNotFound
    
    try {
      const response = await handler(request, env, ctx, url)
      
      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
    } catch (error) {
      console.error('API Handler Error:', error)
      
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }
  },

  // Also handle scheduled tasks
  async scheduled(event, env, ctx) {
    return await idolUpdater.scheduled(event, env, ctx)
  }
}

// Chart data endpoint
async function handleChartRequest(request, env, ctx, url) {
  const source = url.searchParams.get('source') || 'standard'
  const limit = parseInt(url.searchParams.get('limit')) || 10
  
  try {
    // Try to get fresh data from KV cache first
    const cached = await env.IDOL_CACHE?.get('latest_update')
    let chartData = null
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      chartData = cacheData.data?.charts
      
      // Check if cache is for the requested source type
      if (cacheData.source_type === source && chartData) {
        console.log('✅ Chart data served from cache')
        
        return new Response(
          JSON.stringify({
            charts: chartData.slice(0, limit),
            source: source,
            timestamp: cacheData.timestamp,
            cached: true,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }
    
    // If no valid cache, trigger fresh update
    console.log('🔄 Triggering fresh chart update for source:', source)
    
    // Use the idol updater to get fresh data
    const isGFW = source === 'gfw_fallback'
    const sources = isGFW ? GFW_FALLBACK_SOURCES : DATA_SOURCES
    
    const chartData = await updateChartData(sources, env)
    
    const response = {
      charts: chartData.slice(0, limit),
      source: source,
      timestamp: Date.now(),
      cached: false,
    }
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('Chart request failed:', error)
    
    // Fallback response
    return new Response(
      JSON.stringify({
        charts: [],
        source: source,
        timestamp: Date.now(),
        error: error.message,
        fallback: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200, // Return 200 even with error for graceful degradation
      }
    )
  }
}

// Idol data endpoint (combined updates)
async function handleIdolDataRequest(request, env, ctx, url) {
  try {
    const cached = await env.IDOL_CACHE?.get('latest_update')
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      
      return new Response(
        JSON.stringify({
          schedules: cacheData.data?.schedules || [],
          social: cacheData.data?.social || [],
          news: cacheData.data?.news || [],
          charts: cacheData.data?.charts || [],
          timestamp: cacheData.timestamp,
          source_type: cacheData.source_type,
          cached: true,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    // No cache available
    return new Response(
      JSON.stringify({
        schedules: [],
        social: [],
        news: [],
        charts: [],
        timestamp: Date.now(),
        source_type: 'unknown',
        error: 'No cached data available',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    throw new Error(`Idol data request failed: ${error.message}`)
  }
}

// Schedule-specific endpoint
async function handleScheduleRequest(request, env, ctx, url) {
  const artistId = url.searchParams.get('artist')
  const limit = parseInt(url.searchParams.get('limit')) || 50
  
  try {
    const cached = await env.IDOL_CACHE?.get('latest_update')
    let schedules = []
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      schedules = cacheData.data?.schedules || []
      
      // Filter by artist if requested
      if (artistId) {
        schedules = schedules.filter(schedule =>
          schedule.artist?.toLowerCase().includes(artistId.toLowerCase())
        )
      }
    }
    
    return new Response(
      JSON.stringify({
        schedules: schedules.slice(0, limit),
        artist: artistId,
        timestamp: Date.now(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    throw new Error(`Schedule request failed: ${error.message}`)
  }
}

// Social media endpoint
async function handleSocialRequest(request, env, ctx, url) {
  const platform = url.searchParams.get('platform')
  const limit = parseInt(url.searchParams.get('limit')) || 20
  
  try {
    const cached = await env.IDOL_CACHE?.get('latest_update')
    let socialData = []
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      socialData = cacheData.data?.social || []
      
      // Filter by platform if requested
      if (platform) {
        socialData = socialData.filter(item => 
          item.platform?.toLowerCase() === platform.toLowerCase()
        )
      }
    }
    
    return new Response(
      JSON.stringify({
        social: socialData.slice(0, limit),
        platform: platform,
        timestamp: Date.now(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    throw new Error(`Social request failed: ${error.message}`)
  }
}

// News endpoint
async function handleNewsRequest(request, env, ctx, url) {
  const category = url.searchParams.get('category')
  const limit = parseInt(url.searchParams.get('limit')) || 20
  
  try {
    const cached = await env.IDOL_CACHE?.get('latest_update')
    let newsData = []
    
    if (cached) {
      const cacheData = JSON.parse(cached)
      newsData = cacheData.data?.news || []
      
      // Filter by category if requested
      if (category) {
        newsData = newsData.filter(item => 
          item.type?.toLowerCase() === category.toLowerCase()
        )
      }
    }
    
    return new Response(
      JSON.stringify({
        news: newsData.slice(0, limit),
        category: category,
        timestamp: Date.now(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    throw new Error(`News request failed: ${error.message}`)
  }
}

// Health check endpoint
async function handleHealthCheck(request, env, ctx, url) {
  const timestamp = Date.now()
  
  // Check KV access
  let kvStatus = 'unknown'
  try {
    await env.IDOL_CACHE?.get('health_check')
    kvStatus = 'ok'
  } catch (error) {
    kvStatus = 'error'
  }
  
  // Check if we have recent data
  let dataStatus = 'no_data'
  try {
    const cached = await env.IDOL_CACHE?.get('latest_update')
    if (cached) {
      const cacheData = JSON.parse(cached)
      const dataAge = timestamp - cacheData.timestamp
      
      if (dataAge < 7 * 24 * 60 * 60 * 1000) { // 7 days
        dataStatus = 'fresh'
      } else {
        dataStatus = 'stale'
      }
    }
  } catch (error) {
    dataStatus = 'error'
  }
  
  const health = {
    status: 'ok',
    timestamp,
    version: '1.0.0',
    services: {
      kv: kvStatus,
      data: dataStatus,
    },
    uptime: Math.floor(timestamp / 1000), // Rough uptime in seconds
  }
  
  return new Response(
    JSON.stringify(health),
    {
      headers: { 'Content-Type': 'application/json' },
      status: kvStatus === 'ok' ? 200 : 500,
    }
  )
}

// 404 handler
async function handleNotFound(request, env, ctx, url) {
  return new Response(
    JSON.stringify({
      error: 'Not Found',
      path: url.pathname,
      availableEndpoints: Object.keys(routes),
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// Import constants from idol-updater
const DATA_SOURCES = {
  // K-pop News RSS feeds
  soompi: 'https://www.soompi.com/feed/',
  kpopchart: 'https://kpopchart.kr/rss.xml',
  
  // Music Chart APIs (with GFW fallbacks)
  charts: {
    melon: 'https://m2.melon.com/chart/top100/list.json',
    spotify: 'https://api.spotify.com/v1/playlists/37i9dQZEVXbJZGli0rRP3r/tracks',
    youtube: 'https://youtube-music-api.brightdata.com/chart/kr',
    applemusic: 'https://music.apple.com/kr/api/charts/ko-kr/songs/pop',
  },
}

const GFW_FALLBACK_SOURCES = {
  charts: {
    melon: 'https://m2.melon.com/chart/top100/list.json',
    spotify: 'https://api.spotify.com/v1/playlists/37i9dQZEVXbJZGli0rRP3r/tracks',
    netease: 'https://music.163.com/api/toplist/detail?id=19723756',
    qq_music: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
  },
}

// Simplified chart update function for API endpoints
async function updateChartData(sources, env) {
  const chartData = []
  
  // Try Melon
  try {
    const melonResponse = await fetch(sources.charts.melon)
    const melonData = await melonResponse.json()
    
    if (melonData.songs) {
      chartData.push(...melonData.songs.slice(0, 10).map(song => ({
        source: 'melon',
        rank: song.rank,
        title: song.title,
        artist: song.artist,
        isKpop: true, // Assume all Melon chart items are K-pop
      })))
    }
  } catch (error) {
    console.warn('⚠️ Melon chart failed:', error.message)
  }
  
  return chartData
}