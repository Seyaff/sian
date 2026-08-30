import { IMenuItem } from "../models/menu-item.model";

export interface MenuSearchMatch {
  name: string;
  category: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  confidence: number;
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeForSearch(text).split(" ").filter((t) => t.length > 1);
}

function scoreMatch(query: string, itemName: string): number {
  const q = normalizeForSearch(query);
  const name = normalizeForSearch(itemName);

  if (!q || !name) return 0;
  if (name === q) return 1;
  if (name.includes(q) || q.includes(name)) return 0.92;

  const queryTokens = tokenize(query);
  const nameTokens = tokenize(itemName);

  if (queryTokens.length === 0 || nameTokens.length === 0) return 0;

  let matched = 0;
  for (const qt of queryTokens) {
    if (nameTokens.some((nt) => nt.includes(qt) || qt.includes(nt))) {
      matched++;
    }
  }

  const tokenScore = matched / queryTokens.length;
  const lengthPenalty = Math.abs(nameTokens.length - queryTokens.length) * 0.05;
  return Math.max(0, tokenScore - lengthPenalty);
}

export function rankMenuItems(query: string, items: IMenuItem[], limit = 5): MenuSearchMatch[] {
  return items
    .map((item) => {
      const match: MenuSearchMatch = {
        name: item.name,
        category: item.category,
        confidence: scoreMatch(query, item.name),
      };
      if (item.price !== undefined) match.price = item.price;
      if (item.priceLabel) match.priceLabel = item.priceLabel;
      if (item.description) match.description = item.description;
      return match;
    })
    .filter((match) => match.confidence >= 0.35)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

export function findBestMenuMatch(
  query: string,
  items: IMenuItem[],
  minConfidence = 0.5
): MenuSearchMatch | null {
  const [best] = rankMenuItems(query, items, 1);
  if (!best || best.confidence < minConfidence) return null;
  return best;
}
