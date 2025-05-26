
/**
 * Supabase Edge Function: youtube-download
 * Securely calls the RapidAPI YouTube MP3 Converter API and returns the download link.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return new Response(JSON.stringify({ error: "Missing RAPIDAPI_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call RapidAPI endpoint
    const url =
      `https://youtube-mp3-converter.p.rapidapi.com/service/run?lang=en&id=${videoId}&action=button&widget=rapidapi&format=mp3`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "youtube-mp3-converter.p.rapidapi.com",
      },
    });

    const text = await resp.text();
    // The RapidAPI returns some HTML - extract the download link from it
    const match = text.match(/href="([^"]+.mp3)"/);
    if (match && match[1]) {
      return new Response(JSON.stringify({ downloadUrl: match[1] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Could not extract mp3 link" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
