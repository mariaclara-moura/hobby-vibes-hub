// Cross-media recommendation edge function using Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  title: string;
  type: "movie" | "tv" | "book" | "track" | "playlist";
  description?: string;
  categories?: string[];
  authors?: string[];
  rating?: number;
  review?: string;
}

const TYPE_LABEL: Record<string, string> = {
  movie: "movie",
  tv: "TV show",
  book: "book",
  track: "song",
  playlist: "playlist",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const typeLabel = TYPE_LABEL[body.type] || body.type;

    const systemPrompt = `You are a refined cultural curator for HobbyHub — a media discovery platform. You connect books, movies, TV shows, and Spotify playlists by ATMOSPHERE, THEMES, EMOTIONS, STORYTELLING and AESTHETICS — not just genre. Your suggestions feel emotionally intelligent and surprising.

Always return EXACTLY 12 recommendations with this distribution:
- 4 books (type: "book")
- 4 movies or TV shows (type: "movie" or "tv", any mix)
- 4 Spotify playlists (type: "playlist")

Rules:
- Use real, well-known titles only (avoid obscure ones the APIs cannot find).
- For playlists, suggest mood/theme-based playlist names that exist on Spotify (e.g. "Lo-Fi Beats", "Rainy Jazz", "Coffeehouse", "Indie Folk", "Cinematic Soundtracks", "Dark Academia", "Cottagecore", "Melancholy Indie", "Soft Pop").
- Keep reasons concise (one short, evocative sentence).`;

    const userPrompt = `The user just saved a ${typeLabel} they enjoyed:

Title: ${body.title}
${body.authors?.length ? `Artists/Authors: ${body.authors.join(", ")}\n` : ""}${body.categories?.length ? `Categories: ${body.categories.join(", ")}\n` : ""}Description: ${body.description?.slice(0, 600) || "(none)"}
User rating: ${body.rating ?? "?"}/5
User review: "${body.review?.slice(0, 500) || "(none)"}"

Suggest 12 cross-media recommendations (4 books, 4 movies/TV shows, 4 Spotify playlists) capturing similar atmosphere, emotion and storytelling.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_recommendations",
              description: "Return cross-media recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Exact, real title. For playlists, a recognizable mood-based Spotify playlist name." },
                        type: { type: "string", enum: ["movie", "tv", "book", "playlist"] },
                        reason: { type: "string", description: "One short evocative sentence" },
                      },
                      required: ["title", "type", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_recommendations" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments ? JSON.parse(call.function.arguments) : { recommendations: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
