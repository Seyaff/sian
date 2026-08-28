import { embed } from "ai";
import { getRestaurantNamespace } from "./pinecone.client";
import { embeddingModel, queryEmbeddingProviderOptions } from "./embedding.model";

export interface RetrievedChunk {
  text: string;
  score: number;
  source?: string;
}

export const retrieveContext = async (
  userQuestion: string,
  restaurantId: string,
  topK = 3
): Promise<RetrievedChunk[]> => {
  const namespace = await getRestaurantNamespace(restaurantId);

  const { embedding } = await embed({
    model: embeddingModel,
    value: userQuestion,
    providerOptions: queryEmbeddingProviderOptions,
  });

  const queryResult = await namespace.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return queryResult.matches
    .filter((match) => match.metadata?.text)
    .map((match) => {
      const chunk: RetrievedChunk = {
        text: String(match.metadata!.text),
        score: match.score ?? 0,
      };

      if (match.metadata?.source) {
        chunk.source = String(match.metadata.source);
      }

      return chunk;
    });
};

export const formatRetrievedContext = (chunks: RetrievedChunk[]): string => {
  if (chunks.length === 0) {
    return "";
  }

  return chunks.map((chunk) => chunk.text).join("\n---\n");
};
