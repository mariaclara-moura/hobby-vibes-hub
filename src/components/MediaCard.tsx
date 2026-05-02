import { MediaItem } from "@/types/media";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { StarRating } from "./StarRating";
import { Film, Tv, BookOpen } from "lucide-react";

const typeIcon = { movie: Film, tv: Tv, book: BookOpen };
const typeLabel = { movie: "Movie", tv: "TV Show", book: "Book" };

export function MediaCard({ item, index = 0 }: { item: MediaItem; index?: number }) {
  const Icon = typeIcon[item.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/item/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-card bg-muted">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 gradient-overlay opacity-90" />

          {/* Type badge */}
          <div className="absolute top-3 left-3 glass px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
            <Icon className="w-3 h-3" />
            {typeLabel[item.type]}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-serif text-lg font-semibold leading-tight line-clamp-2 mb-1.5">
              {item.title}
            </h3>
            <div className="flex items-center justify-between">
              <StarRating value={item.rating} readOnly size={14} />
              {item.year && <span className="text-xs opacity-75">{item.year}</span>}
            </div>
          </div>

          {/* Glow on hover */}
          <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/60 rounded-2xl transition-all duration-500 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
