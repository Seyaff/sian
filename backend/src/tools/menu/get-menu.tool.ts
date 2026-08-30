import { tool } from "ai";
import { MenuRepository } from "../../repositories/menu/menu.repository";
import { knowledgeBaseContextSchema } from "../../validators/rag.validation";
import { getMenuInputSchema } from "./get-menu.schema";

const menuRepo = new MenuRepository();

export { getMenuInputSchema } from "./get-menu.schema";

export const getMenuTool = tool({
  contextSchema: knowledgeBaseContextSchema,
  description: "Get structured menu items by category or all categories for the restaurant.",
  inputSchema: getMenuInputSchema,
  execute: async ({ category }, { context }) => {
    const normalized = typeof category === "string" ? category.trim() : "";
    if (normalized) {
      const items = await menuRepo.getByCategory(context.restaurantId, normalized);
      return {
        category: normalized,
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
