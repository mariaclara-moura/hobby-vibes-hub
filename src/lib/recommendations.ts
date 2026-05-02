import { supabase } from "@/integrations/supabase/client";
import { AIRecommendation, MediaItem } from "@/types/media";
import { resolveRecommendation } from "./api";

export async function getAIRecommendations(item: MediaItem): Promise<AIRecommendation[]> {
  const { data, error } = await supabase.functions.invoke("recommend", {
    body: {
      title: item.title,
      type: item.type,
      description: item.description,
      categories: item.categories,
      authors: item.authors,
      rating: item.rating,
      review: item.review,
    },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);

  const recs: AIRecommendation[] = (data?.recommendations || []).map((r: any) => ({
    title: r.title,
    type: r.type,
    reason: r.reason,
  }));

  // Resolve in parallel
  const resolved = await Promise.all(
    recs.map(async (r) => ({ ...r, resolved: await resolveRecommendation(r.type, r.title) }))
  );
  return resolved.filter((r) => r.resolved); // drop unresolved
}
