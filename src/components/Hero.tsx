import { motion } from "framer-motion";
import { Sparkles, Film, BookOpen, Tv, Music, ListMusic } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 -left-20 w-96 h-96 rounded-full gradient-hero blur-3xl opacity-30 animate-glow-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/30 blur-3xl opacity-40 animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container py-20 md:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI-powered cultural discovery</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6"
        >
          Where stories you love{" "}
          <span className="text-gradient italic">find each other</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Save the books, movies, TV shows and music that move you. Get emotionally
          intelligent recommendations that bridge every medium.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Button asChild size="lg" className="gradient-hero text-white border-0 hover:opacity-90 hover:scale-105 transition-all shadow-glow rounded-full px-8 h-12 text-base">
            <Link to="/add">
              <Sparkles className="w-4 h-4 mr-1" />
              Add your first hobby
            </Link>
          </Button>
        </motion.div>

        {/* floating media chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex items-center justify-center gap-3 mt-12 text-sm text-muted-foreground"
        >
          {[
            { icon: BookOpen, label: "Books" },
            { icon: Film, label: "Movies" },
            { icon: Tv, label: "TV Shows" },
            { icon: Music, label: "Songs" },
            { icon: ListMusic, label: "Playlists" },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              className="glass px-4 py-2 rounded-full flex items-center gap-2"
            >
              <c.icon className="w-4 h-4 text-primary" />
              {c.label}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
