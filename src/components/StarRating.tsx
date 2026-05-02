import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0-5
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({ value, onChange, size = 22, readOnly, className }: Props) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn(
            "transition-transform duration-200",
            !readOnly && "hover:scale-125 cursor-pointer",
            readOnly && "cursor-default"
          )}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={size}
            className={cn(
              "transition-colors",
              n <= value ? "fill-accent text-accent" : "text-muted-foreground/30"
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
