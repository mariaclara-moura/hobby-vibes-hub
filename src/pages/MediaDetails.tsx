import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { getItem, deleteItem, updateItem } from "@/lib/storage";
import { getAIRecommendations } from "@/lib/recommendations";
import { MediaItem } from "@/types/media";
import { StarRating } from "@/components/StarRating";
import { RecommendationCard } from "@/components/RecommendationCard";
import { PosterSkeleton } from "@/components/PosterSkeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Sparkles, Loader2, RefreshCw, Film, Tv, BookOpen, Music, ListMusic, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const typeIcon = { movie: Film, tv: Tv, book: BookOpen, track: Music, playlist: ListMusic };
const typeLabel = { movie: "Movie", tv: "TV Show", book: "Book", track: "Song", playlist: "Playlist" };

export default function MediaDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getItem(id);
    if (!found) {
      navigate("/");
      return;
    }
    setItem(found);

    if (!found.recommendations) {
      generateRecs(found);
    }
  }, [id]);

  const generateRecs = async (target: MediaItem) => {
    setLoadingRecs(true);
    try {
      const recs = await getAIRecommendations(target);
      updateItem(target.id, { recommendations: recs });
      setItem({ ...target, recommendations: recs });
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate recommendations");
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleDelete = () => {
    if (!item) return;
    deleteItem(item.id);
    toast.success("Removed from your collection");
    navigate("/");
  };

  if (!item) return null;
  const Icon = typeIcon[item.type];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero with backdrop */}
      <div className="relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover blur-3xl scale-110 opacity-40" aria-hidden />
          <div className="absolute inset-0 bg-background/60" />
        </div>

        <div className="container py-10">
          <Button asChild variant="ghost" size="sm" className="rounded-full mb-6">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-[300px,1fr] gap-8 items-start"
          >
            <div className="mx-auto md:mx-0">
              <div className="relative">
                <div className="absolute -inset-4 gradient-hero opacity-40 blur-2xl rounded-3xl" />
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="relative w-[260px] md:w-[300px] aspect-[2/3] object-cover rounded-3xl shadow-premium"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="glass px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {typeLabel[item.type]}
                </span>
                {item.year && <span className="text-sm text-muted-foreground">{item.year}</span>}
              </div>

              <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.05] mb-4">{item.title}</h1>

              {item.authors && item.authors.length > 0 && (
                <p className="text-lg text-muted-foreground mb-3">by {item.authors.join(", ")}</p>
              )}

              {item.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {item.categories.slice(0, 5).map((c) => (
                    <span key={c} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-foreground/80 leading-relaxed mb-6 max-w-2xl">{item.description}</p>

              <div className="glass rounded-2xl p-5 max-w-2xl border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Your take</span>
                  <StarRating value={item.rating} readOnly size={20} />
                </div>
                {item.review ? (
                  <p className="font-serif italic text-lg leading-relaxed">"{item.review}"</p>
                ) : (
                  <p className="text-muted-foreground text-sm">No review yet.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-6 items-center">
                {item.externalUrl && (
                  <Button asChild size="sm" className="rounded-full gradient-hero text-white border-0">
                    <a href={item.externalUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" /> Open on Spotify
                    </a>
                  </Button>
                )}
                {item.previewUrl && (
                  <audio controls src={item.previewUrl} className="h-9 max-w-[260px]" />
                )}
                <Button onClick={handleDelete} variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI recommendations */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">AI Curated</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">If this resonated, you might love…</h2>
            <p className="text-muted-foreground mt-1 max-w-xl">Cross-medium picks chosen by atmosphere, emotion and storytelling.</p>
          </div>
          <Button
            onClick={() => generateRecs(item)}
            disabled={loadingRecs}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            {loadingRecs ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Refresh
          </Button>
        </div>

        {loadingRecs ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <PosterSkeleton key={i} />)}
          </div>
        ) : item.recommendations && item.recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {item.recommendations.map((r, i) => <RecommendationCard key={i} rec={r} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No recommendations yet. Try refreshing.</p>
          </div>
        )}
      </section>
    </div>
  );
}
