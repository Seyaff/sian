import { z } from "zod";

export const knowledgeBaseContextSchema = z.object({
  restaurantId: z.string().trim().min(1),
});

export const knowledgeBaseInputSchema = z.object({
  query: z.string().trim().min(1).describe("The business question to look up in the restaurant knowledge base."),
});
