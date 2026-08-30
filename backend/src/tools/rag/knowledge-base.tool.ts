import { tool } from "ai";
import { retrieveContext } from "../../services/rag/query.service";
import { getCachedRag, setCachedRag } from "../../services/rag/rag-cache";
import { knowledgeBaseContextSchema, knowledgeBaseInputSchema } from "../../validators/rag.validation";

const RAG_TOP_K = 5;
const MIN_RELEVANCE_SCORE = 0.7;

export const knowledgeBaseTool = tool({
  contextSchema: knowledgeBaseContextSchema,
  description:
    "Search restaurant knowledge base for hours, location, policies, delivery info, and FAQs. Do NOT use for dish names or prices — use searchMenuTool for those.",
  inputSchema: knowledgeBaseInputSchema,
  execute: async ({ query }, { context }) => {
    let chunks = getCachedRag(context.restaurantId, query);

    if (!chunks) {
      chunks = await retrieveContext(query, context.restaurantId, RAG_TOP_K);
      setCachedRag(context.restaurantId, query, chunks);
    }

    if (chunks.length === 0) {
      return {
        found: false,
        lowConfidence: true,
        message: "No relevant information found in the knowledge base for this query.",
        chunks: [],
      };
    }

    const bestScore = chunks[0]?.score ?? 0;
    const relevantChunks = chunks.filter((c) => (c.score ?? 0) >= MIN_RELEVANCE_SCORE);

    if (relevantChunks.length === 0) {
      return {
        found: false,
        lowConfidence: true,
        message:
          "Information may not be reliable for this query. Tell the customer you need to confirm with staff rather than guessing.",
        chunks: chunks.map((chunk) => ({
          text: chunk.text,
          relevanceScore: chunk.score,
          source: chunk.source,
        })),
      };
    }

    return {
      found: true,
      lowConfidence: false,
      chunks: relevantChunks.map((chunk) => ({
        text: chunk.text,
        relevanceScore: chunk.score,
        source: chunk.source,
      })),
    };
  },
});
