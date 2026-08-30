import { CreateMenuItemInput } from "../../repositories/menu/menu.repository";

const CATEGORY_KEYWORDS: Record<string, RegExp[]> = {
  BBQ: [/\bbbq\b/i, /\bbarbe?cue\b/i, /\btikka\b/i, /\bkebab\b/i, /\bseekh\b/i],
  Starters: [/\bstarter\b/i, /\bappetizer\b/i, /\bsoup\b/i, /\bsalad\b/i],
  "Main Course": [/\bmain\b/i, /\bhandi\b/i, /\bkarahi\b/i, /\bcurry\b/i, /\bnihari\b/i],
  Biryani: [/\bbiryani\b/i, /\bpulao\b/i, /\brice\b/i],
  Bread: [/\bnaan\b/i, /\broti\b/i, /\bparatha\b/i, /\bbread\b/i],
  Drinks: [/\bdrink\b/i, /\blassi\b/i, /\bjuice\b/i, /\btea\b/i, /\bcoffee\b/i, /\bsoft\b/i],
  Desserts: [/\bdessert\b/i, /\bkheer\b/i, /\bice\s*cream\b/i, /\bsweet\b/i],
};

const PRICE_PATTERN = /(?:rs\.?|pkr)\s*([\d,]+(?:\.\d+)?)|([\d,]+(?:\.\d+)?)\s*(?:rs\.?|pkr)/i;
const ITEM_LINE_PATTERN = /^[\-\*\u2022]?\s*(.+?)(?:\s+[\-\u2013]\s+|\s{2,})(?:rs\.?|pkr)?\s*([\d,]+(?:\.\d+)?)/i;
const SKU_LINE_PATTERN = /^DP-\d+\s+(.+?)\s+(?:Rs\.?|PKR)?\s*([\d,]+(?:\.\d+)?)/i;

function guessCategory(line: string, currentCategory: string): string {
  for (const [category, patterns] of Object.entries(CATEGORY_KEYWORDS)) {
    if (patterns.some((pattern) => pattern.test(line))) {
      return category;
    }
  }
  return currentCategory || "General";
}

function parsePrice(text: string): { price?: number; priceLabel?: string } {
  const match = text.match(PRICE_PATTERN);
  if (!match) return {};

  const raw = (match[1] || match[2] || "").replace(/,/g, "");
  const price = Number(raw);
  if (Number.isNaN(price)) return {};

  return { price, priceLabel: `Rs ${price}` };
}

export function parseMenuFromText(text: string, restaurantId: string): CreateMenuItemInput[] {
  const items: CreateMenuItemInput[] = [];
  const seen = new Set<string>();
  let currentCategory = "General";

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.length < 4) continue;

    const upperLine = line.toUpperCase();
    if (
      line.length < 40 &&
      !PRICE_PATTERN.test(line) &&
      /^[A-Z][A-Za-z\s&]+$/.test(line)
    ) {
      currentCategory = guessCategory(line, line);
      continue;
    }

    const skuMatch = line.match(SKU_LINE_PATTERN);
    if (skuMatch) {
      const name = skuMatch[1]!.trim();
      const price = Number(skuMatch[2]!.replace(/,/g, ""));
      const key = `${currentCategory}:${name.toLowerCase()}`;
      if (!seen.has(key) && name.length > 2) {
        seen.add(key);
        items.push({
          restaurantId,
          name,
          category: currentCategory,
          price,
          priceLabel: `Rs ${price}`,
        });
      }
      continue;
    }

    const itemMatch = line.match(ITEM_LINE_PATTERN);
    if (itemMatch) {
      const name = itemMatch[1]!.trim();
      const price = Number(itemMatch[2]!.replace(/,/g, ""));
      const key = `${currentCategory}:${name.toLowerCase()}`;
      if (!seen.has(key) && name.length > 2) {
        seen.add(key);
        items.push({
          restaurantId,
          name,
          category: currentCategory,
          price,
          priceLabel: `Rs ${price}`,
        });
      }
      continue;
    }

    const priceInfo = parsePrice(line);
    if (priceInfo.price) {
      const name = line.replace(PRICE_PATTERN, "").replace(/[\-\*\u2022]/g, "").trim();
      const category = guessCategory(line, currentCategory);
      const key = `${category}:${name.toLowerCase()}`;
      if (name.length > 2 && !seen.has(key)) {
        seen.add(key);
        items.push({
          restaurantId,
          name,
          category,
          price: priceInfo.price,
          ...(priceInfo.priceLabel ? { priceLabel: priceInfo.priceLabel } : {}),
        });
      }
    }
  }

  return items;
}

export const DEFAULT_MENU_CATEGORIES = [
  { id: "cat_bbq", title: "BBQ", description: "Tikka, Kebab & more" },
  { id: "cat_starters", title: "Starters", description: "Soups & appetizers" },
  { id: "cat_mains", title: "Main Course", description: "Karahi, Handi & curry" },
  { id: "cat_biryani", title: "Biryani & Rice", description: "Biryani & pulao" },
  { id: "cat_bread", title: "Bread", description: "Naan, roti & paratha" },
  { id: "cat_drinks", title: "Drinks", description: "Lassi, chai & juices" },
  { id: "cat_desserts", title: "Desserts", description: "Mithai & sweets" },
];

export const CATEGORY_ID_MAP: Record<string, string> = {
  cat_bbq: "BBQ",
  cat_starters: "Starters",
  cat_mains: "Main Course",
  cat_biryani: "Biryani",
  cat_bread: "Bread",
  cat_drinks: "Drinks",
  cat_desserts: "Desserts",
  cat_all: "General",
};
