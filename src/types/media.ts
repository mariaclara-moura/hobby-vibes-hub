export type MediaType = "movie" | "tv" | "book" | "track" | "playlist";

export interface MediaItem {
  id: string; // unique storage id
  externalId: string; // tmdb id or google books id
  type: MediaType;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  year?: string;
  authors?: string[];
  rating: number; // 1-5
  review: string;
  createdAt: number;
  recommendations?: AIRecommendation[];
}

export interface AIRecommendation {
  title: string;
  type: MediaType;
  reason: string;
  // resolved later
  resolved?: {
    externalId: string;
    title: string;
    imageUrl: string;
    description: string;
    year?: string;
  } | null;
}

export interface SearchResult {
  externalId: string;
  type: MediaType;
  title: string;
  description: string;
  imageUrl: string;
  categories: string[];
  year?: string;
  authors?: string[];
  externalUrl?: string;
  previewUrl?: string;
}
