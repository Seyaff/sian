import { tool } from "ai";
import { MenuRepository } from "../../repositories/menu/menu.repository";
import { knowledgeBaseContextSchema } from "../../validators/rag.validation";
import { searchMenuInputSchema } from "./search-menu.schema";

const menuRepo = new MenuRepository();

export const searchMenuTool = tool({
  contextSchema: knowledgeBaseContextSchema,
  description:
    "Search menu items by dish name (typo-tolerant). Use this FIRST for any dish name, price, or 'do you have X' question. Returns real prices from the menu database.",
  inputSchema: searchMenuInputSchema,
  execute: async ({ query }, { context }) => {
    const matches = await menuRepo.searchByName(context.restaurantId, query, 5);

    if (matches.length === 0) {
      return {
        found: false,
        query,
        message: "No matching menu items found for this query.",
        matches: [],
      };
    }

    return {
      found: true,
      query,
      matches: matches.map((m) => ({
        name: m.name,
        category: m.category,
        price: m.price,
        priceLabel: m.priceLabel ?? (m.price ? `Rs ${m.price}` : undefined),
        confidence: Math.round(m.confidence * 100) / 100,
      })),
    };
  },
});
