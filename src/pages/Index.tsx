import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MediaCard } from "@/components/MediaCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { getItems } from "@/lib/storage";
import { MediaItem } from "@/types/media";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setItems(getItems());
  }, []);

  // Latest item with recs
  const latestWithRecs = items.find((i) => i.recommendations && i.recommendations.length > 0);

  return (
    <div className="min-h-screen">
      <Navbar />

      <Hero />

      {/* Recently added */}
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold">Your collection</h2>
            <p className="text-muted-foreground mt-1">Stories you've fallen for</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/add"><Plus className="w-4 h-4 mr-1" /> Add new</Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 rounded-3xl border-2 border-dashed border-border"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-hero flex items-center justify-center shadow-glow animate-float">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-serif text-2xl font-semibold mb-2">Your hub awaits</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add a book, movie, TV show, song or playlist that moved you and let AI weave connections across mediums.
            </p>
            <Button asChild className="gradient-hero text-white border-0 rounded-full">
              <Link to="/add">Add your first hobby</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {CATEGORIES.map((cat) => {
              const catItems = items.filter((i) => i.type === cat.type);
              if (catItems.length === 0) return null;
              const Icon = cat.icon;
              return (
                <div key={cat.type}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold">{cat.label}</h3>
                    <span className="text-sm text-muted-foreground">({catItems.length})</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {catItems.map((item, i) => (
                      <MediaCard key={item.id} item={item} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* AI recs from latest */}
      {latestWithRecs && (
        <section className="py-12 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 gradient-shine" />
          <div className="container">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">AI Picks</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-1">
              Because you loved <span className="italic text-gradient">{latestWithRecs.title}</span>
            </h2>
            <p className="text-muted-foreground mb-8">Curated across books, film, TV and music — by feeling, not just genre.</p>

            <div className="flex flex-col sm:flex-row gap-5 sm:overflow-x-auto pb-4 scrollbar-hide sm:-mx-6 sm:px-6">
              {latestWithRecs.recommendations!.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="container py-12 text-center text-sm text-muted-foreground">
        <p>HobbyHub · A cinematic prototype for cultural discovery</p>
      </footer>
    </div>
  );
};

export default Index;
