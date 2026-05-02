import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { Film, Tv, BookOpen, Search, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaType, SearchResult, MediaItem } from "@/types/media";
import { search, fetchTmdbDetails } from "@/lib/api";
import { saveItem, updateItem, getTmdbKey } from "@/lib/storage";
import { getAIRecommendations } from "@/lib/recommendations";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPES: { type: MediaType; label: string; icon: typeof Film }[] = [
  { type: "movie", label: "Movies", icon: Film },
  { type: "tv", label: "TV Shows", icon: Tv },
  { type: "book", label: "Books", icon: BookOpen },
];

export default function AddMedia() {
  const [type, setType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // debounced search
  useEffect(() => {
    if (selected) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if ((type === "movie" || type === "tv") && !getTmdbKey()) return;

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await search(type, query);
        setResults(r);
      } catch (e) {
        toast.error("Search failed. Check your API key.");
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query, type, selected]);

  const handleSubmit = async () => {
    if (!selected || rating === 0) {
      toast.error("Please select a media item and rate it");
      return;
    }
    setSubmitting(true);

    // enrich movie/tv with genres
    let categories = selected.categories;
    if (selected.type !== "book") {
      const details = await fetchTmdbDetails(selected.type, selected.externalId);
      if (details?.categories) categories = details.categories;
    }

    const item: MediaItem = {
      id: crypto.randomUUID(),
      externalId: selected.externalId,
      type: selected.type,
      title: selected.title,
      description: selected.description,
      imageUrl: selected.imageUrl,
      categories,
      year: selected.year,
      authors: selected.authors,
      rating,
      review,
      createdAt: Date.now(),
    };

    saveItem(item);
    toast.success("Saved! Generating AI recommendations…");
    navigate(`/item/${item.id}`);

    // background: get recs
    try {
      const recs = await getAIRecommendations(item);
      updateItem(item.id, { recommendations: recs });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "AI recommendations failed");
    } finally {
      setSubmitting(false);
    }
  };

  const tmdbMissing = (type === "movie" || type === "tv") && !getTmdbKey();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-4xl py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Add a hobby</h1>
          <p className="text-muted-foreground mb-8">Find something you loved and let AI connect it across mediums.</p>
        </motion.div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6 p-1 glass rounded-full w-fit">
          {TYPES.map(({ type: t, label, icon: Icon }) => (
            <button
              key={t}
              onClick={() => { setType(t); setSelected(null); setResults([]); setQuery(""); }}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all",
                type === t ? "gradient-hero text-white shadow-soft" : "hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tmdbMissing ? (
          <div className="glass rounded-2xl border border-primary/30 p-6 text-center">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-semibold mb-1">TMDB API key needed for movies & TV</p>
            <p className="text-sm text-muted-foreground mb-4">It's free — get one at themoviedb.org and paste it in Settings.</p>
            <Button onClick={() => navigate("/settings")} className="rounded-full">Open settings</Button>
          </div>
        ) : (
          <>
            {/* Search */}
            {!selected && (
              <div className="relative mb-6">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search for ${type === "tv" ? "a TV show" : type === "movie" ? "a movie" : "a book"}…`}
                  className="pl-14 h-14 rounded-full text-base bg-card shadow-soft border-border"
                />
                {searching && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />}
              </div>
            )}

            {/* Results */}
            <AnimatePresence>
              {!selected && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="grid sm:grid-cols-2 gap-3 mb-8"
                >
                  {results.map((r) => (
                    <button
                      key={r.externalId}
                      onClick={() => setSelected(r)}
                      className="text-left glass rounded-2xl p-3 flex gap-3 hover:scale-[1.02] hover:shadow-card transition-all duration-300 border border-border/50"
                    >
                      <img src={r.imageUrl} alt={r.title} className="w-16 h-24 object-cover rounded-lg flex-shrink-0" />
                      <div className="min-w-0 py-1">
                        <h3 className="font-serif font-semibold leading-tight line-clamp-2">{r.title}</h3>
                        {r.year && <p className="text-xs text-muted-foreground mt-0.5">{r.year}</p>}
                        {r.authors && r.authors.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.authors.join(", ")}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected + form */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-3xl p-6 md:p-8 shadow-premium border border-border/50"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <img src={selected.imageUrl} alt={selected.title} className="w-40 md:w-48 aspect-[2/3] object-cover rounded-2xl shadow-card mx-auto md:mx-0" />
                    <div className="flex-1">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight">{selected.title}</h2>
                      {selected.year && <p className="text-sm text-muted-foreground mt-1">{selected.year}{selected.authors?.length ? ` · ${selected.authors.join(", ")}` : ""}</p>}
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-4">{selected.description}</p>
                      <button onClick={() => setSelected(null)} className="text-xs text-primary hover:underline mt-3">← choose a different one</button>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Your rating</label>
                      <StarRating value={rating} onChange={setRating} size={32} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Your review</label>
                      <Textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="What did this make you feel? What did it remind you of?"
                        rows={4}
                        className="rounded-2xl resize-none bg-background"
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || rating === 0}
                      size="lg"
                      className="w-full gradient-hero text-white border-0 hover:opacity-90 rounded-full h-12 shadow-glow"
                    >
                      {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Sparkles className="w-4 h-4 mr-2" /> Save & get AI picks</>}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
