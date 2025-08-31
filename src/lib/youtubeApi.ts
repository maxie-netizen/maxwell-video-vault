const API_KEY = "AIzaSyBXbToqkneqDmQv5r3EOxH58PzjygpHSlg"; // <-- Your public YouTube Data API v3 key

// For demo purposes, this will mock data if API_KEY is empty.
export async function searchYouTube(query: string, pageToken?: string) {
  if (!API_KEY) {
    // Mock example data
    return {
      items: [
        {
          id: { videoId: "1" },
          snippet: {
            title: "BMW MD SONG | IBRAHIM ADAMS | OFFICIAL VIDEO",
            thumbnails: { high: { url: "https://img.youtube.com/vi/1/hqdefault.jpg" } },
            channelTitle: "Ibrahim Tech official",
            publishedAt: "2024-05-01T00:00:00Z"
          },
        },
        {
          id: { videoId: "2" },
          snippet: {
            title: "Imran Khan - Amplifier (Official Music Video)",
            thumbnails: { high: { url: "https://img.youtube.com/vi/2/hqdefault.jpg" } },
            channelTitle: "imrankhanworld",
            publishedAt: "2020-02-18T00:00:00Z"
          },
        },
      ],
      nextPageToken: null
    };
  }
  const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=12&key=${API_KEY}${pageParam}`;
  const res = await fetch(url);
  const data = await res.json();
  return { items: data.items, nextPageToken: data.nextPageToken };
}

// Add this function to fix the import error
export async function getTrendingVideos(pageToken?: string) {
  if (!API_KEY) {
    // Mock example data for trending videos
    return {
      items: [
        {
          id: "1",
          snippet: {
            title: "Trending Video 1",
            thumbnails: { high: { url: "https://img.youtube.com/vi/1/hqdefault.jpg" } },
            channelTitle: "Trending Channel 1",
            publishedAt: "2024-05-01T00:00:00Z"
          },
        },
        {
          id: "2",
          snippet: {
            title: "Trending Video 2",
            thumbnails: { high: { url: "https://img.youtube.com/vi/2/hqdefault.jpg" } },
            channelTitle: "Trending Channel 2",
            publishedAt: "2024-05-02T00:00:00Z"
          },
        },
      ],
      nextPageToken: null
    };
  }
  
  const pageParam = pageToken ? `&pageToken=${pageToken}` : '';
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=12&key=${API_KEY}${pageParam}`;
  const res = await fetch(url);
  const data = await res.json();
  return { items: data.items, nextPageToken: data.nextPageToken };
}
