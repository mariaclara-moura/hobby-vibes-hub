// Spotify proxy: handles client-credentials auth + search for tracks/playlists
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) return cachedToken.token;
  const id = Deno.env.get("SPOTIFY_CLIENT_ID");
  const secret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!id || !secret) throw new Error("Spotify credentials not configured");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action: string = body.action || "search";
    const token = await getToken();

    if (action === "search") {
      const query: string = body.query || "";
      const kind: string = body.kind || "track"; // "track" | "playlist"
      if (!query.trim()) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${kind}&limit=10`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const t = await res.text();
        console.error("Spotify search error", res.status, t);
        throw new Error(`Spotify search failed: ${res.status}`);
      }
      const data = await res.json();
      const results: any[] = [];
      if (kind === "track") {
        for (const t of data.tracks?.items || []) {
          if (!t) continue;
          results.push({
            externalId: t.id,
            type: "track",
            title: t.name,
            description: `${t.artists?.map((a: any) => a.name).join(", ") || ""}${t.album?.name ? ` — ${t.album.name}` : ""}`,
            imageUrl: t.album?.images?.[0]?.url || "",
            categories: [],
            year: t.album?.release_date?.slice(0, 4),
            authors: t.artists?.map((a: any) => a.name) || [],
            externalUrl: t.external_urls?.spotify,
            previewUrl: t.preview_url,
          });
        }
      } else {
        for (const p of data.playlists?.items || []) {
          if (!p) continue;
          results.push({
            externalId: p.id,
            type: "playlist",
            title: p.name,
            description: p.description || `Playlist by ${p.owner?.display_name || "Spotify"}`,
            imageUrl: p.images?.[0]?.url || "",
            categories: [],
            authors: p.owner?.display_name ? [p.owner.display_name] : [],
            externalUrl: p.external_urls?.spotify,
          });
        }
      }
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("spotify error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
