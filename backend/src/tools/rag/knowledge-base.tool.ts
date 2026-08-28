import { tool } from "ai";
import { retrieveContext } from "../../services/rag/query.service";
import { getCachedRag, setCachedRag } from "../../services/rag/rag-cache";
import { knowledgeBaseContextSchema, knowledgeBaseInputSchema } from "../../validators/rag.validation";

export const knowledgeBaseTool = tool({
  contextSchema: knowledgeBaseContextSchema,
  description:
    "Search the restaurant knowledge base for menu items, prices, opening hours, location, policies, and other business-specific information. Always use this before answering business questions.",
  inputSchema: knowledgeBaseInputSchema,
  execute: async ({ query }, { context }) => {
    let chunks = getCachedRag(context.restaurantId, query);

    if (!chunks) {
      chunks = await retrieveContext(query, context.restaurantId);
      setCachedRag(context.restaurantId, query, chunks);
    }

    if (chunks.length === 0) {
      return {
        found: false,
        message: "No relevant information found in the knowledge base for this query.",
        chunks: [],
      };
    }

    return {
      found: true,
      chunks: chunks.map((chunk) => ({
        text: chunk.text,
        relevanceScore: chunk.score,
        source: chunk.source,
      })),
    };
  },
});
