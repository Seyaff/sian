import { google } from "@ai-sdk/google";
import { EMBEDDING_DIMENSION } from "./pinecone.client";

export const embeddingModel = google.textEmbeddingModel("gemini-embedding-001");

export const embeddingProviderOptions = {
  google: {
    outputDimensionality: EMBEDDING_DIMENSION,
    taskType: "RETRIEVAL_DOCUMENT" as const,
  },
};

export const queryEmbeddingProviderOptions = {
  google: {
    outputDimensionality: EMBEDDING_DIMENSION,
    taskType: "RETRIEVAL_QUERY" as const,
  },
};
