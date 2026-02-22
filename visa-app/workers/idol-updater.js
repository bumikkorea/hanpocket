// Cloudflare Workers - Idol Data Auto Updater
// Scheduled to run weekly, collects latest K-pop data from various sources

const DATA_SOURCES = {
  // K-pop News RSS feeds
  soompi: 'https://www.soompi.com/feed/',
  kpopchart: 'https://kpopchart.kr/rss.xml',
  
  // Music Chart APIs (with GFW fallbacks)
  charts: {
    melon: 'https://m2.melon.com/chart/top100/list.json',
    spotify: 'https://api.spotify.com/v1/playlists/37i9dQZEVXbJZGli0rRP3r/tracks', // K-Pop Central
    youtube: 'https://youtube-music-api.brightdata.com/chart/kr', // Korea Chart
    applemusic: 'https://music.apple.com/kr/api/charts/ko-kr/songs/pop',
  },

  // Social Media APIs
  weverse: 'https://global.apis.naver.com/weverse_web/prod/fanboard',
  twitter: 'https://api.twitter.com/2/tweets/search/recent',
  
  // Schedule/Event APIs
  ticketlink: 'https://www.ticketlink.co.kr/api/search',
  yes24: 'https://ticket.yes24.com/api/concert',
};

// GFW-friendly fallback sources (no Apple Music, Twitter)
const GFW_FALLBACK_SOURCES = {
  charts: {
    melon: 'https://m2.melon.com/chart/top100/list.json',
    spotify: 'https://api.spotify.com/v1/playlists/37i9dQZEVXbJZGli0rRP3r/tracks',
    netease: 'https://music.163.com/api/toplist/detail?id=19723756', // China-accessible
    qq_music: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg', // Tencent Music
  },
  social: {
    weibo: 'https://m.weibo.cn/api/container/getIndex', // Chinese platform
    douyin: 'https://www.douyin.com/aweme/v1/web/aweme/post/', // TikTok China
  }
};

export default {
  async scheduled(event, env, ctx) {
    console.log('🚀 Idol updater started:', new Date().toISOString());
    
    try {
      // Check if we're in GFW environment by testing Apple Music access
      const isGFW = await this.detectGFWEnvironment();
      console.log('🌍 GFW environment detected:', isGFW);
      
      // Select appropriate data sources
      const sources = isGFW ? GFW_FALLBACK_SOURCES : DATA_SOURCES;
      
      // Fetch latest data from all sources
      const updates = await Promise.allSettled([
        this.updateSchedules(sources),
        this.updateChartData(sources),
        this.updateSocialMedia(sources),
        this.updateGroupNews(sources),
      ]);
      
      // Process and merge data
      const mergedData = this.mergeUpdates(updates);
      
      // Store in KV/D1 for cache
      await env.IDOL_CACHE.put('latest_update', JSON.stringify({
        timestamp: Date.now(),
        data: mergedData,
        source_type: isGFW ? 'gfw_fallback' : 'standard',
      }), {
        expirationTtl: 604800, // 7 days
      });
      
      console.log('✅ Idol data updated successfully:', {
        groups_updated: mergedData.groups?.length || 0,
        schedules_added: mergedData.schedules?.length || 0,
        chart_entries: mergedData.charts?.length || 0,
      });
      
    } catch (error) {
      console.error('❌ Idol updater failed:', error);
      
      // Send error notification
      await this.notifyError(env, error);
    }
  },

  // Detect GFW environment by testing Apple Music accessibility
  async detectGFWEnvironment() {
    try {
      const response = await fetch('https://music.apple.com/kr/api/ping', {
        method: 'HEAD',
        timeout: 5000,
      });
      return !response.ok;
    } catch (error) {
      // If Apple Music is unreachable, assume GFW environment
      return true;
    }
  },

  // Update concert/event schedules
  async updateSchedules(sources) {
    const schedules = [];
    
    try {
      // Fetch from Korean ticket sites
      const ticketResponse = await fetch(sources.ticketlink || DATA_SOURCES.ticketlink);
      const ticketData = await ticketResponse.json();
      
      // Parse concert data
      if (ticketData.concerts) {
        for (const concert of ticketData.concerts) {
          if (this.isKpopEvent(concert)) {
            schedules.push({
              date: concert.date,
              type: 'concert',
              name: {
                ko: concert.title_kr,
                en: concert.title_en,
                zh: concert.title_zh || this.translateToZh(concert.title_kr),
              },
              artist: this.extractArtistFromTitle(concert.title_kr),
              venue: concert.venue,
              tickets: concert.booking_url,
            });
          }
        }
      }
      
    } catch (error) {
      console.warn('⚠️ Schedule update failed:', error.message);
    }
    
    return schedules;
  },

  // Update chart data with GFW fallbacks
  async updateChartData(sources) {
    const chartData = [];
    
    // Try Melon (accessible from most regions)
    try {
      const melonResponse = await fetch(sources.charts.melon);
      const melonData = await melonResponse.json();
      
      if (melonData.songs) {
        chartData.push(...melonData.songs.map(song => ({
          source: 'melon',
          rank: song.rank,
          title: song.title,
          artist: song.artist,
          isKpop: this.isKpopArtist(song.artist),
        })));
      }
    } catch (error) {
      console.warn('⚠️ Melon chart failed:', error.message);
    }
    
    // Try Spotify (global access)
    try {
      if (sources.charts.spotify) {
        const spotifyResponse = await fetch(sources.charts.spotify, {
          headers: {
            'Authorization': 'Bearer ' + env.SPOTIFY_TOKEN,
          },
        });
        const spotifyData = await spotifyResponse.json();
        
        if (spotifyData.tracks) {
          chartData.push(...spotifyData.tracks.items.map((item, index) => ({
            source: 'spotify',
            rank: index + 1,
            title: item.track.name,
            artist: item.track.artists.map(a => a.name).join(', '),
            isKpop: this.isKpopArtist(item.track.artists[0].name),
          })));
        }
      }
    } catch (error) {
      console.warn('⚠️ Spotify chart failed:', error.message);
    }
    
    // GFW fallback: Netease Music (China)
    if (sources.charts.netease) {
      try {
        const neteaseResponse = await fetch(sources.charts.netease);
        const neteaseData = await neteaseResponse.json();
        
        if (neteaseData.playlist?.tracks) {
          chartData.push(...neteaseData.playlist.tracks.map((song, index) => ({
            source: 'netease',
            rank: index + 1,
            title: song.name,
            artist: song.ar.map(a => a.name).join(', '),
            isKpop: this.isKpopArtist(song.ar[0].name),
          })));
        }
      } catch (error) {
        console.warn('⚠️ Netease chart failed:', error.message);
      }
    }
    
    return chartData.filter(item => item.isKpop);
  },

  // Update social media activity
  async updateSocialMedia(sources) {
    const socialData = [];
    
    // Weverse updates (accessible globally)
    try {
      const weverseResponse = await fetch(sources.weverse || DATA_SOURCES.weverse);
      const weverseData = await weverseResponse.json();
      
      if (weverseData.posts) {
        socialData.push(...weverseData.posts.map(post => ({
          platform: 'weverse',
          artist: post.artist,
          content: post.content,
          timestamp: post.created_at,
          engagement: post.like_count + post.comment_count,
        })));
      }
    } catch (error) {
      console.warn('⚠️ Weverse update failed:', error.message);
    }
    
    // Weibo fallback for GFW environment
    if (sources.social?.weibo) {
      try {
        const weiboResponse = await fetch(sources.social.weibo);
        const weiboData = await weiboResponse.json();
        
        if (weiboData.data?.cards) {
          socialData.push(...weiboData.data.cards.map(card => ({
            platform: 'weibo',
            artist: this.extractWeiboArtist(card.mblog.text),
            content: card.mblog.text,
            timestamp: card.mblog.created_at,
            engagement: card.mblog.attitudes_count,
          })));
        }
      } catch (error) {
        console.warn('⚠️ Weibo update failed:', error.message);
      }
    }
    
    return socialData;
  },

  // Update group news and comebacks
  async updateGroupNews(sources) {
    const news = [];
    
    try {
      const soompiResponse = await fetch(sources.soompi || DATA_SOURCES.soompi);
      const soompiXml = await soompiResponse.text();
      
      // Parse RSS XML
      const items = this.parseRSS(soompiXml);
      
      for (const item of items) {
        if (this.isKpopNews(item.title)) {
          news.push({
            title: item.title,
            summary: item.description,
            url: item.link,
            published: item.pubDate,
            artist: this.extractArtistFromNews(item.title),
            type: this.categorizeNews(item.title),
          });
        }
      }
    } catch (error) {
      console.warn('⚠️ News update failed:', error.message);
    }
    
    return news;
  },

  // Merge all update sources
  mergeUpdates(updates) {
    const merged = {
      schedules: [],
      charts: [],
      social: [],
      news: [],
    };
    
    updates.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const updateType = ['schedules', 'charts', 'social', 'news'][index];
        merged[updateType] = result.value || [];
      }
    });
    
    return merged;
  },

  // Helper: Check if event is K-pop related
  isKpopEvent(event) {
    const kpopKeywords = ['콘서트', '팬미팅', '월드투어', '아이돌', 'Concert', 'Fan Meeting', 'World Tour'];
    return kpopKeywords.some(keyword => 
      event.title_kr?.includes(keyword) || 
      event.title_en?.includes(keyword)
    );
  },

  // Helper: Check if artist is K-pop
  isKpopArtist(artistName) {
    // Load idol database for comparison
    const knownIdols = [
      'BTS', '블랙핑크', 'BLACKPINK', 'TWICE', 'SEVENTEEN', 'NewJeans', 
      'aespa', 'ITZY', '아이브', 'IVE', '르세라핌', 'LE SSERAFIM',
      // ... (would load from idolData.js)
    ];
    
    return knownIdols.some(idol => 
      artistName.toLowerCase().includes(idol.toLowerCase()) ||
      this.koreanNameMatch(artistName, idol)
    );
  },

  // Helper: Korean name matching
  koreanNameMatch(name1, name2) {
    const korean1 = name1.match(/[가-힣]+/g)?.join('') || '';
    const korean2 = name2.match(/[가-힣]+/g)?.join('') || '';
    return korean1 && korean2 && korean1.includes(korean2);
  },

  // Helper: Parse RSS XML
  parseRSS(xmlString) {
    // Simple RSS parser (would use proper XML parser in production)
    const items = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    let match;
    
    while ((match = itemRegex.exec(xmlString)) !== null) {
      const itemXml = match[1];
      items.push({
        title: this.extractXmlTag(itemXml, 'title'),
        description: this.extractXmlTag(itemXml, 'description'),
        link: this.extractXmlTag(itemXml, 'link'),
        pubDate: this.extractXmlTag(itemXml, 'pubDate'),
      });
    }
    
    return items;
  },

  // Helper: Extract XML tag content
  extractXmlTag(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  },

  // Helper: Translate to Chinese (simplified)
  translateToZh(koreanText) {
    const translations = {
      '콘서트': '演唱会',
      '팬미팅': '粉丝见面会',
      '월드투어': '世界巡演',
      '앨범': '专辑',
      '발매': '发售',
      '컴백': '回归',
    };
    
    let translated = koreanText;
    for (const [ko, zh] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(ko, 'g'), zh);
    }
    return translated;
  },

  // Helper: Extract artist from news title
  extractArtistFromNews(title) {
    // Extract artist names from news titles
    const patterns = [
      /(.+?)(?:의|가|는|이)\s/,
      /(.+?)\s(?:새|신곡|앨범|컴백)/,
      /(.+?)\s(?:concert|album|comeback)/i,
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  },

  // Helper: Categorize news type
  categorizeNews(title) {
    if (/앨범|album|발매|release/i.test(title)) return 'album';
    if (/콘서트|concert|투어|tour/i.test(title)) return 'concert';
    if (/컴백|comeback/i.test(title)) return 'comeback';
    if (/팬미팅|fanmeeting|fan meeting/i.test(title)) return 'fanmeeting';
    return 'news';
  },

  // Helper: Check if news is K-pop related
  isKpopNews(title) {
    const kpopKeywords = [
      'K-Pop', 'KPOP', '케이팝', '아이돌', 'idol', '걸그룹', '보이그룹',
      'girl group', 'boy group', 'Korean', '한국', '서울', 'Seoul'
    ];
    
    return kpopKeywords.some(keyword => 
      title.toLowerCase().includes(keyword.toLowerCase())
    );
  },

  // Helper: Error notification
  async notifyError(env, error) {
    try {
      // Send to monitoring service or admin
      await fetch(env.WEBHOOK_URL || 'https://hooks.slack.com/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Idol Updater Failed: ${error.message}`,
          timestamp: Date.now(),
        }),
      });
    } catch (notifyError) {
      console.error('Failed to send error notification:', notifyError);
    }
  },
};