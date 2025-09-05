const API_KEY = "AIzaSyBXbToqkneqDmQv5r3EOxH58PzjygpHSlg"; // <-- Your public YouTube Data API v3 key

// For demo purposes, this will mock data if API_KEY is empty.
export async function searchYouTube(query: string, pageToken?: string) {
  // Mock data function
  const getMockData = () => ({
    items: [
      {
        id: { videoId: "dQw4w9WgXcQ" },
        snippet: {
          title: "Rick Astley - Never Gonna Give You Up (Official Video)",
          thumbnails: { high: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } },
          channelTitle: "Rick Astley",
          publishedAt: "2009-10-25T00:00:00Z"
        },
      },
      {
        id: { videoId: "9bZkp7q19f0" },
        snippet: {
          title: "PSY - GANGNAM STYLE(강남스타일) M/V",
          thumbnails: { high: { url: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg" } },
          channelTitle: "officialpsy",
          publishedAt: "2012-07-15T00:00:00Z"
        },
      },
      {
        id: { videoId: "kJQP7kiw5Fk" },
        snippet: {
          title: "Despacito",
          thumbnails: { high: { url: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg" } },
          channelTitle: "Luis Fonsi",
          publishedAt: "2017-01-12T00:00:00Z"
        },
      },
      {
        id: { videoId: "fJ9rUzIMcZQ" },
        snippet: {
          title: "Queen – Bohemian Rhapsody (Official Video Remastered)",
          thumbnails: { high: { url: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" } },
          channelTitle: "Queen Official",
          publishedAt: "2008-08-01T00:00:00Z"
        },
      },
    ],
    nextPageToken: null
  });

  if (!API_KEY) {
    return getMockData();
  }

  try {
    const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      query
    )}&type=video&maxResults=12&key=${API_KEY}${pageParam}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // Check for API errors (quota exceeded, etc.)
    if (data.error) {
      console.warn('YouTube API error:', data.error.message);
      return getMockData();
    }
    
    // Check if items exist
    if (!data.items) {
      console.warn('No items in YouTube API response');
      return getMockData();
    }
    
    return { items: data.items, nextPageToken: data.nextPageToken };
  } catch (error) {
    console.error('YouTube API fetch failed:', error);
    return getMockData();
  }
}

// Add this function to fix the import error
export async function getTrendingVideos(pageToken?: string) {
  // Mock data function
  const getMockTrendingData = () => ({
    items: [
      {
        id: "dQw4w9WgXcQ",
        snippet: {
          title: "Rick Astley - Never Gonna Give You Up (Official Video)",
          thumbnails: { high: { url: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" } },
          channelTitle: "Rick Astley",
          publishedAt: "2009-10-25T00:00:00Z"
        },
      },
      {
        id: "9bZkp7q19f0",
        snippet: {
          title: "PSY - GANGNAM STYLE(강남스타일) M/V",
          thumbnails: { high: { url: "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg" } },
          channelTitle: "officialpsy",
          publishedAt: "2012-07-15T00:00:00Z"
        },
      },
      {
        id: "kJQP7kiw5Fk",
        snippet: {
          title: "Despacito",
          thumbnails: { high: { url: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg" } },
          channelTitle: "Luis Fonsi",
          publishedAt: "2017-01-12T00:00:00Z"
        },
      },
    ],
    nextPageToken: null
  });

  if (!API_KEY) {
    return getMockTrendingData();
  }
  
  try {
    const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=12&key=${API_KEY}${pageParam}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // Check for API errors (quota exceeded, etc.)
    if (data.error) {
      console.warn('YouTube API error:', data.error.message);
      return getMockTrendingData();
    }
    
    // Check if items exist
    if (!data.items) {
      console.warn('No items in YouTube API response');
      return getMockTrendingData();
    }
    
    return { items: data.items, nextPageToken: data.nextPageToken };
  } catch (error) {
    console.error('YouTube API fetch failed:', error);
    return getMockTrendingData();
  }
}
