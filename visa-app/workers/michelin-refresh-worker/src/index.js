// Michelin Guide Seoul Restaurant Data Auto-Refresh Worker
// Runs on Cloudflare Workers with cron scheduling
// Fetches latest Michelin restaurant data and updates the database

const MICHELIN_GUIDE_SEOUL_API = 'https://guide.michelin.com/api/restaurants/seoul';
const DATABASE_UPDATE_ENDPOINT = process.env.DATABASE_UPDATE_ENDPOINT;
const API_KEY = process.env.MICHELIN_API_KEY;

export default {
  // Handle scheduled events (cron triggers)
  async scheduled(controller, env, ctx) {
    console.log('🍽️ Starting Michelin Guide Seoul data refresh...');
    
    try {
      // Fetch latest Michelin restaurant data
      const michelinData = await fetchMichelinRestaurants();
      
      // Process and format the data
      const processedData = await processMichelinData(michelinData);
      
      // Update the database
      const updateResult = await updateRestaurantDatabase(processedData, env);
      
      console.log(`✅ Successfully updated ${updateResult.count} restaurants`);
      
      // Optional: Send notification about successful update
      await sendNotification(`Michelin data refresh completed: ${updateResult.count} restaurants updated`, env);
      
    } catch (error) {
      console.error('❌ Error refreshing Michelin data:', error);
      
      // Send error notification
      await sendErrorNotification(error.message, env);
    }
  },

  // Handle HTTP requests (for manual triggers or webhooks)
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Manual refresh endpoint
    if (url.pathname === '/refresh') {
      try {
        const result = await this.scheduled(null, env, ctx);
        return new Response(JSON.stringify({ success: true, message: 'Refresh completed' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        service: 'michelin-refresh-worker',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Michelin Guide Seoul Auto-Refresh Worker', { status: 200 });
  }
};

/**
 * Fetch Michelin restaurant data from official API or scraping
 */
async function fetchMichelinRestaurants() {
  console.log('🔍 Fetching Michelin restaurant data...');
  
  // Try official Michelin API first
  try {
    const response = await fetch(MICHELIN_GUIDE_SEOUL_API, {
      headers: {
        'User-Agent': 'HanPocket-MichelinRefresh/1.0',
        'Accept': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      }
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Official API failed, trying alternative sources...');
  }

  // Fallback to web scraping Michelin Guide website
  return await scrapeMichelinGuideSeoul();
}

/**
 * Scrape Michelin Guide Seoul website as fallback
 */
async function scrapeMichelinGuideSeoul() {
  console.log('🕷️ Scraping Michelin Guide Seoul website...');
  
  const restaurants = [];
  const baseUrl = 'https://guide.michelin.com';
  
  try {
    // Fetch the Seoul restaurants page
    const response = await fetch(`${baseUrl}/kr/ko/seoul-region/restaurants`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    
    // Extract restaurant data using regex (simplified approach)
    // In production, use a proper HTML parser like htmlparser2
    const restaurantPattern = /"name":\s*"([^"]+)".*?"address":\s*"([^"]+)".*?"stars":\s*(\d+)/g;
    
    let match;
    while ((match = restaurantPattern.exec(html)) !== null) {
      restaurants.push({
        name: match[1],
        address: match[2], 
        stars: parseInt(match[3]),
        lastUpdated: new Date().toISOString()
      });
    }

    console.log(`📊 Found ${restaurants.length} restaurants from scraping`);
    return restaurants;

  } catch (error) {
    console.error('Failed to scrape Michelin website:', error);
    return [];
  }
}

/**
 * Process and normalize Michelin restaurant data
 */
async function processMichelinData(rawData) {
  console.log('⚙️ Processing Michelin restaurant data...');
  
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map(restaurant => ({
    id: generateRestaurantId(restaurant.name, restaurant.address),
    name: restaurant.name,
    nameKo: restaurant.name_ko || restaurant.name,
    nameEn: restaurant.name_en || restaurant.name,
    address: restaurant.address,
    addressKo: restaurant.address_ko || restaurant.address,
    district: extractDistrict(restaurant.address),
    cuisine: restaurant.cuisine || 'Korean',
    stars: restaurant.stars || 1,
    priceRange: restaurant.price_range || '50000-100000',
    phone: restaurant.phone || '',
    website: restaurant.website || '',
    description: restaurant.description || '',
    coordinates: restaurant.coordinates || null,
    lastMichelinUpdate: restaurant.last_updated || new Date().toISOString(),
    lastDataRefresh: new Date().toISOString(),
    status: 'active'
  }));
}

/**
 * Generate unique restaurant ID
 */
function generateRestaurantId(name, address) {
  const combined = `${name}-${address}`.toLowerCase()
    .replace(/[^\w가-힣]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  
  // Add hash for uniqueness
  const hash = Array.from(combined).reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  return `michelin-${Math.abs(hash)}`;
}

/**
 * Extract district from address
 */
function extractDistrict(address) {
  if (!address) return '';
  
  const districts = ['강남구', '서초구', '송파구', '종로구', '중구', '용산구', '마포구', '서대문구', '은평구', '성북구'];
  
  for (const district of districts) {
    if (address.includes(district)) {
      return district;
    }
  }
  
  return '';
}

/**
 * Update restaurant database with new data
 */
async function updateRestaurantDatabase(restaurants, env) {
  console.log('💾 Updating restaurant database...');
  
  if (!restaurants || restaurants.length === 0) {
    throw new Error('No restaurant data to update');
  }

  // Update database via API endpoint
  const response = await fetch(env.DATABASE_UPDATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.DATABASE_API_KEY}`,
      'X-Source': 'michelin-refresh-worker'
    },
    body: JSON.stringify({
      type: 'michelin_update',
      restaurants: restaurants,
      timestamp: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error(`Database update failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return { count: restaurants.length, result };
}

/**
 * Send success notification
 */
async function sendNotification(message, env) {
  if (!env.NOTIFICATION_WEBHOOK) return;
  
  try {
    await fetch(env.NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🍽️ Michelin Refresh: ${message}`,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Send error notification
 */
async function sendErrorNotification(error, env) {
  if (!env.ERROR_NOTIFICATION_WEBHOOK) return;
  
  try {
    await fetch(env.ERROR_NOTIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `❌ Michelin Refresh Error: ${error}`,
        timestamp: new Date().toISOString(),
        priority: 'high'
      })
    });
  } catch (notifError) {
    console.error('Failed to send error notification:', notifError);
  }
}