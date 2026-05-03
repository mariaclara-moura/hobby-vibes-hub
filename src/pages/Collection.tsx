import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MediaCard } from "@/components/MediaCard";
import { getItems } from "@/lib/storage";
import { MediaItem, MediaType } from "@/types/media";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Plus, BookOpen, Film, Tv, Music, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES: { type: MediaType; label: string; icon: any }[] = [
  { type: "book", label: "Books", icon: BookOpen },
  { type: "movie", label: "Movies", icon: Film },
  { type: "tv", label: "TV Shows", icon: Tv },
  { type: "track", label: "Songs", icon: Music },
  { type: "playlist", label: "Playlists", icon: ListMusic },
];

const Collection = () => {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setItems(getItems());
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="container py-12">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold">My collection</h1>
            <p className="text-muted-foreground mt-1">All your hobbies, organized by category</p>
          </div>
          <Button asChild className="gradient-hero text-white border-0 rounded-full">
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
            <h3 className="font-serif text-2xl font-semibold mb-2">Nothing here yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start adding books, movies, TV shows, songs and playlists you love.
            </p>
            <Button asChild className="gradient-hero text-white border-0 rounded-full">
              <Link to="/add">Add your first hobby</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-14">
            {CATEGORIES.map((cat) => {
              const catItems = items.filter((i) => i.type === cat.type);
              if (catItems.length === 0) return null;
              const Icon = cat.icon;
              return (
                <div key={cat.type}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold">{cat.label}</h2>
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
    </div>
  );
};

export default Collection;
