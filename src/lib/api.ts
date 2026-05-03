import { SearchResult, MediaType } from "@/types/media";
import { supabase } from "@/integrations/supabase/client";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";
const OPEN_LIBRARY_BASE = "https://openlibrary.org/search.json";
const GOOGLE_BOOKS_KEY = "AIzaSyC-FmZ7FZoh0CkzsoEW1rP4hPUtWIluMIc";

const PLACEHOLDER = "https://via.placeholder.com/500x750/f5d5e0/8b3a5c?text=No+Image";

async function callTmdb(payload: any) {
  const { data, error } = await supabase.functions.invoke("tmdb", { body: payload });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await callTmdb({ action: "search", kind: "movie", query });
  return (data.results || []).slice(0, 10).map((m: any): SearchResult => ({
    externalId: String(m.id),
    type: "movie",
    title: m.title,
    description: m.overview || "",
    imageUrl: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : PLACEHOLDER,
    categories: [],
    year: m.release_date?.slice(0, 4),
    externalUrl: `https://www.themoviedb.org/movie/${m.id}`,
  }));
}

export async function searchTv(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await callTmdb({ action: "search", kind: "tv", query });
  return (data.results || []).slice(0, 10).map((m: any): SearchResult => ({
    externalId: String(m.id),
    type: "tv",
    title: m.name,
    description: m.overview || "",
    imageUrl: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : PLACEHOLDER,
    categories: [],
    year: m.first_air_date?.slice(0, 4),
    externalUrl: `https://www.themoviedb.org/tv/${m.id}`,
  }));
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${BOOKS_BASE}?q=${encodeURIComponent(query)}&maxResults=10&printType=books&key=${GOOGLE_BOOKS_KEY}`);
    if (!res.ok) throw new Error("Google Books unavailable");
    const data = await res.json();
    return (data.items || []).map((b: any): SearchResult => {
      const v = b.volumeInfo || {};
      return {
        externalId: b.id,
        type: "book",
        title: v.title || "Untitled",
        description: v.description || "",
        imageUrl: v.imageLinks?.thumbnail?.replace("http://", "https://") || PLACEHOLDER,
        categories: v.categories || [],
        year: v.publishedDate?.slice(0, 4),
        authors: v.authors || [],
        externalUrl: v.infoLink || v.previewLink || `https://books.google.com/books?id=${b.id}`,
      };
    });
  } catch {
    const fallback = await fetch(`${OPEN_LIBRARY_BASE}?title=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,subject,first_sentence`);
    if (!fallback.ok) throw new Error("Books search unavailable");
    const data = await fallback.json();
    return (data.docs || []).map((b: any): SearchResult => ({
      externalId: b.key || `${b.title}-${b.first_publish_year || "unknown"}`,
      type: "book",
      title: b.title || "Untitled",
      description: Array.isArray(b.first_sentence) ? b.first_sentence[0] || "" : b.first_sentence || "",
      imageUrl: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg` : PLACEHOLDER,
      categories: (b.subject || []).slice(0, 3),
      year: b.first_publish_year ? String(b.first_publish_year) : undefined,
      authors: b.author_name || [],
      externalUrl: b.key ? `https://openlibrary.org${b.key}` : undefined,
    }));
  }
}

export async function searchSpotify(kind: "track" | "playlist", query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const { data, error } = await supabase.functions.invoke("spotify", {
    body: { action: "search", kind, query },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return (data?.results || []) as SearchResult[];
}

export async function search(type: MediaType, query: string): Promise<SearchResult[]> {
  if (type === "movie") return searchMovies(query);
  if (type === "tv") return searchTv(query);
  if (type === "track" || type === "playlist") return searchSpotify(type, query);
  return searchBooks(query);
}

// Resolve a recommended title to a real media item (with categories enriched)
export async function resolveRecommendation(type: MediaType, title: string) {
  try {
    const results = await search(type, title);
    if (results.length === 0) return null;
    const first = results[0];

    // Enrich movies/tv with TMDB genres
    let categories = first.categories;
    if ((type === "movie" || type === "tv") && (!categories || categories.length === 0)) {
      const details = await fetchTmdbDetails(type, first.externalId);
      if (details?.categories) categories = details.categories;
    }

    return {
      externalId: first.externalId,
      title: first.title,
      imageUrl: first.imageUrl,
      description: first.description,
      year: first.year,
      externalUrl: first.externalUrl,
      previewUrl: first.previewUrl,
      categories: categories || [],
    };
  } catch {
    return null;
  }
}

// Fetch movie/tv genres for richer context
export async function fetchTmdbDetails(type: "movie" | "tv", id: string) {
  try {
    const data = await callTmdb({ action: "details", kind: type, id });
    return {
      categories: (data.genres || []).map((g: any) => g.name),
    };
  } catch {
    return null;
  }
}
