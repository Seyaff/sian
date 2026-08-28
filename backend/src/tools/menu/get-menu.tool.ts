import { z } from "zod";
import { tool } from "ai";
import { MenuRepository } from "../../repositories/menu/menu.repository";
import { knowledgeBaseContextSchema } from "../../validators/rag.validation";

const menuRepo = new MenuRepository();

export const getMenuInputSchema = z.object({
  category: z.string().trim().optional().describe("Menu category to fetch, e.g. BBQ, Starters"),
});

export const getMenuTool = tool({
  contextSchema: knowledgeBaseContextSchema,
  description: "Get structured menu items by category or all categories for the restaurant.",
  inputSchema: getMenuInputSchema,
  execute: async ({ category }, { context }) => {
    if (category) {
      const items = await menuRepo.getByCategory(context.restaurantId, category);
      return {
        category,
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          priceLabel: item.priceLabel,
          description: item.description,
          imageUrl: item.imageUrl,
        })),
      };
    }

    const categories = await menuRepo.getCategories(context.restaurantId);
    const allItems = await menuRepo.getAll(context.restaurantId);

    return {
      categories,
      items: allItems.map((item) => ({
        name: item.name,
        category: item.category,
        price: item.price,
        priceLabel: item.priceLabel,
      })),
    };
  },
});
