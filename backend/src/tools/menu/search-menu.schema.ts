import { z } from "zod";

export const searchMenuInputSchema = z.object({
  query: z.string().trim().min(1).describe("Dish name or partial name to search, e.g. chicken nuggets, karahi, biryani"),
});
