import { AIRecommendation } from "@/types/media";
import { motion } from "framer-motion";
import { Film, Tv, BookOpen, Sparkles } from "lucide-react";

const typeIcon = { movie: Film, tv: Tv, book: BookOpen };
const typeLabel = { movie: "Movie", tv: "TV Show", book: "Book" };

export function RecommendationCard({ rec, index = 0 }: { rec: AIRecommendation; index?: number }) {
  if (!rec.resolved) return null;
  const Icon = typeIcon[rec.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      className="group flex-shrink-0 w-[220px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-card bg-muted">
        <img
          src={rec.resolved.imageUrl}
          alt={rec.resolved.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute top-3 left-3 glass px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
          <Icon className="w-3 h-3" />
          {typeLabel[rec.type]}
        </div>
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full gradient-hero flex items-center justify-center shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h4 className="font-serif font-semibold leading-tight line-clamp-2 mb-1">
            {rec.resolved.title}
          </h4>
          {rec.resolved.year && <span className="text-[11px] opacity-70">{rec.resolved.year}</span>}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground italic leading-relaxed line-clamp-3 px-1">
        "{rec.reason}"
      </p>
    </motion.div>
  );
}
