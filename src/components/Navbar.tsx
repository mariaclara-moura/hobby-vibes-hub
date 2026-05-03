import { Link, useLocation } from "react-router-dom";
import { Sparkles, Plus, Home, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/collection", label: "Collection", icon: Library },
    { to: "/add", label: "Add", icon: Plus },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass border-b border-border/50"
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 gradient-hero blur-lg opacity-60 group-hover:opacity-100 transition-opacity rounded-full" />
            <div className="relative w-9 h-9 rounded-full gradient-hero flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-xl font-bold tracking-tight">HobbyHub</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">discover · feel · connect</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5",
                  active
                    ? "text-primary-foreground"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 gradient-hero rounded-full shadow-soft"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
