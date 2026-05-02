import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { getTmdbKey, setTmdbKey } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ExternalLink, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Settings() {
  const [key, setKey] = useState(getTmdbKey());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setTmdbKey(key.trim());
    setSaved(true);
    toast.success("TMDB key saved");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-10">Configure API access for media discovery.</p>

          <div className="glass rounded-3xl p-7 shadow-card border border-border/50">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-serif text-2xl font-bold">TMDB API key</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Required for movies & TV shows. It's free and takes 1 minute.{" "}
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-0.5 hover:underline"
              >
                Get yours <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="flex gap-2">
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste your TMDB API key (v3 auth)"
                className="rounded-full bg-background h-11"
                type="password"
              />
              <Button onClick={handleSave} className="gradient-hero text-white border-0 rounded-full px-6 h-11">
                {saved ? <><Check className="w-4 h-4 mr-1" /> Saved</> : "Save"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Stored only in your browser (localStorage). Never sent to our servers.
            </p>
          </div>

          <div className="mt-6 glass rounded-3xl p-7 border border-border/50">
            <h3 className="font-serif text-lg font-semibold mb-2">Books & AI</h3>
            <p className="text-sm text-muted-foreground">
              Google Books works without a key. AI recommendations are powered by Lovable AI Gateway and require no setup.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
