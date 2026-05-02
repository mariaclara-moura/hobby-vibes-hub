import { MediaItem } from "@/types/media";

const KEY = "hobbyhub:items";

export function getItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return [];
  }
}

export function saveItem(item: MediaItem) {
  const items = getItems();
  items.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function updateItem(id: string, patch: Partial<MediaItem>) {
  const items = getItems().map((i) => (i.id === id ? { ...i, ...patch } : i));
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function deleteItem(id: string) {
  const items = getItems().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getItem(id: string): MediaItem | undefined {
  return getItems().find((i) => i.id === id);
}

