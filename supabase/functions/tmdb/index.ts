// TMDB proxy: keeps API key on the server
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TMDB_BASE = "https://api.themoviedb.org/3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action: string = body.action || "search";
    const key = Deno.env.get("TMDB_API_KEY");
    if (!key) throw new Error("TMDB_API_KEY not configured");

    let url = "";
    if (action === "search") {
      const kind: string = body.kind === "tv" ? "tv" : "movie";
      const query: string = body.query || "";
      if (!query.trim()) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      url = `${TMDB_BASE}/search/${kind}?api_key=${key}&query=${encodeURIComponent(query)}&include_adult=false`;
    } else if (action === "details") {
      const kind: string = body.kind === "tv" ? "tv" : "movie";
      const id: string = body.id;
      if (!id) throw new Error("Missing id");
      url = `${TMDB_BASE}/${kind}/${encodeURIComponent(id)}?api_key=${key}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(url);
    if (!res.ok) {
      const t = await res.text();
      console.error("TMDB error", res.status, t);
      throw new Error(`TMDB error: ${res.status}`);
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tmdb error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
