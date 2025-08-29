import { supabase } from "@/integrations/supabase/client";

// Demo videos pool for random selection
const DEMO_VIDEOS_POOL = [
  {
    id: { videoId: "dQw4w9WgXcQ" },
    snippet: {
      title: "Rick Astley - Never Gonna Give You Up (Music Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } },
      channelTitle: "Official RickAstley",
      publishedAt: "1987-10-25T00:00:00Z"
    }
  },
  {
    id: { videoId: "E7wJTI-1dvQ" },
    snippet: {
      title: "Britney Spears - ...Baby One More Time (Official Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/E7wJTI-1dvQ/hqdefault.jpg" } },
      channelTitle: "Britney Spears",
      publishedAt: "1998-10-23T00:00:00Z"
    }
  },
  {
    id: { videoId: "3JZ_D3ELwOQ" },
    snippet: {
      title: "Eminem - Without Me (Official Music Video)",
      thumbnails: { high: { url: "https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" } },
      channelTitle: "EminemMusic",
      publishedAt: "2009-06-16T00:00:00Z"
    }
  },
  {
    id: { videoId: "ShZ978fBl6Y" },
    snippet: {
      title: "Amazing Parkour Flip #shorts",
      thumbnails: { high: { url: "https://img.youtube.com/vi/ShZ978fBl6Y/hqdefault.jpg" } },
      channelTitle: "ParkourWorld",
      publishedAt: "2023-09-12T00:00:00Z"
    }
  },
  {
    id: { videoId: "ZcUf59Yk5ig" },
    snippet: {
      title: "Quick Cat Reaction #shorts",
      thumbnails: { high: { url: "https://img.youtube.com/vi/ZcUf59Yk5ig/hqdefault.jpg" } },
      channelTitle: "FunnyPets",
      publishedAt: "2022-01-15T00:00:00Z"
    }
  },
  {
    id: { videoId: "kJQP7kiw5Fk" },
    snippet: {
      title: "Despacito",
      thumbnails: { high: { url: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg" } },
      channelTitle: "Luis Fonsi",
      publishedAt: "2017-01-12T00:00:00Z"
    }
  },
  {
    id: { videoId: "9bZkp7q19f0" },
    snippet: {
      title: "PSY - GANGNAM STYLE",
      thumbnails: { high: { url: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg" } },
      channelTitle: "officialpsy",
      publishedAt: "2012-07-15T00:00:00Z"
    }
  }
];

interface CachedSearch {
  query: string;
  results: any[];
  timestamp: number;
}

export class VideoCache {
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_CACHE_SIZE = 50;
  private static readonly USER_CACHE_KEY_PREFIX = 'user_search_cache_';
  private static readonly RECENT_SEARCHES_KEY = 'recent_searches_';

  static getUserCacheKey(userId?: string): string {
    return this.USER_CACHE_KEY_PREFIX + (userId || 'anonymous');
  }

  static getRecentSearchesKey(userId?: string): string {
    return this.RECENT_SEARCHES_KEY + (userId || 'anonymous');
  }

  // Get random videos from demo pool
  static getRandomDemoVideos(count: number = 4): any[] {
    const shuffled = [...DEMO_VIDEOS_POOL].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Cache search results for user
  static cacheSearchResults(query: string, results: any[], userId?: string): void {
    try {
      const cacheKey = this.getUserCacheKey(userId);
      const cached = this.getCachedSearches(userId);
      
      // Add new search to cache
      const newCache: CachedSearch = {
        query: query.toLowerCase(),
        results,
        timestamp: Date.now()
      };

      // Remove old entries for same query
      const filteredCache = cached.filter(item => item.query !== newCache.query);
      
      // Add new entry and limit size
      filteredCache.unshift(newCache);
      const limitedCache = filteredCache.slice(0, this.MAX_CACHE_SIZE);

      localStorage.setItem(cacheKey, JSON.stringify(limitedCache));

      // Update recent searches
      this.updateRecentSearches(query, userId);
    } catch (error) {
      console.error('Error caching search results:', error);
    }
  }

  // Get cached search results
  static getCachedResults(query: string, userId?: string): any[] | null {
    try {
      const cached = this.getCachedSearches(userId);
      const result = cached.find(item => 
        item.query === query.toLowerCase() && 
        Date.now() - item.timestamp < this.CACHE_DURATION
      );
      return result?.results || null;
    } catch (error) {
      console.error('Error getting cached results:', error);
      return null;
    }
  }

  // Get all cached searches for user
  static getCachedSearches(userId?: string): CachedSearch[] {
    try {
      const cacheKey = this.getUserCacheKey(userId);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return [];
      
      const parsed = JSON.parse(cached) as CachedSearch[];
      // Filter out expired entries
      const valid = parsed.filter(item => Date.now() - item.timestamp < this.CACHE_DURATION);
      
      if (valid.length !== parsed.length) {
        // Update storage if we filtered out expired entries
        localStorage.setItem(cacheKey, JSON.stringify(valid));
      }
      
      return valid;
    } catch (error) {
      console.error('Error getting cached searches:', error);
      return [];
    }
  }

  // Update recent searches list
  static updateRecentSearches(query: string, userId?: string): void {
    try {
      const key = this.getRecentSearchesKey(userId);
      const recent = this.getRecentSearches(userId);
      
      // Remove existing occurrence
      const filtered = recent.filter(q => q.toLowerCase() !== query.toLowerCase());
      
      // Add to front and limit to 10
      filtered.unshift(query);
      const limited = filtered.slice(0, 10);
      
      localStorage.setItem(key, JSON.stringify(limited));
    } catch (error) {
      console.error('Error updating recent searches:', error);
    }
  }

  // Get recent searches for user
  static getRecentSearches(userId?: string): string[] {
    try {
      const key = this.getRecentSearchesKey(userId);
      const recent = localStorage.getItem(key);
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  // Get personalized initial videos based on user's search history
  static getPersonalizedVideos(userId?: string, forceRandom: boolean = false): any[] {
    const recentSearches = this.getRecentSearches(userId);
    const cachedSearches = this.getCachedSearches(userId);
    
    // If forced refresh or no search history, return random videos
    if (forceRandom || recentSearches.length === 0 || cachedSearches.length === 0) {
      return this.getRandomDemoVideos();
    }

    // Get videos from recent searches
    const personalizedVideos: any[] = [];
    
    for (const search of recentSearches.slice(0, 3)) {
      const cached = cachedSearches.find(c => c.query === search.toLowerCase());
      if (cached && cached.results.length > 0) {
        personalizedVideos.push(...cached.results.slice(0, 2));
      }
    }

    // If we don't have enough personalized videos, fill with random ones
    const needed = 6 - personalizedVideos.length;
    if (needed > 0) {
      const randomVideos = this.getRandomDemoVideos(needed);
      personalizedVideos.push(...randomVideos);
    }

    // Remove duplicates and limit
    const uniqueVideos = personalizedVideos.filter((video, index, arr) => 
      arr.findIndex(v => v.id.videoId === video.id.videoId) === index
    );

    return uniqueVideos.slice(0, 6);
  }

  // Clear cache for user
  static clearUserCache(userId?: string): void {
    try {
      localStorage.removeItem(this.getUserCacheKey(userId));
      localStorage.removeItem(this.getRecentSearchesKey(userId));
    } catch (error) {
      console.error('Error clearing user cache:', error);
    }
  }
}