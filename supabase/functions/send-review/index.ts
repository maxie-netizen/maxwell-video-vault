
/**
 * Supabase Edge Function: send-review
 * Emails reviews from the footer to the app owner.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment, username } = await req.json();
    const emailBody = `
      <h3>New Site Review</h3>
      <p><strong>User:</strong> ${username}</p>
      <p>${comment}</p>`;
    const apiKey = Deno.env.get("RESEND_API_KEY");

    if (!apiKey) throw new Error("Email API key not set.");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "noreply@videovault.app",
        to: ["maxwellirungu64@gmail.com"],
        subject: "New VideoVault Review",
        html: emailBody,
      })
    });
    const out = await res.json();
    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
