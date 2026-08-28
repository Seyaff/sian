import { Pinecone } from "@pinecone-database/pinecone";
import { Env } from "../../config/app.config";

export const INDEX_NAME = "crm";
export const EMBEDDING_DIMENSION = 1024;

const pc = new Pinecone({ apiKey: Env.PINECONE_API_KEY });

export const getPineconeClient = () => pc;

export const getOrCreateIndex = async () => {
  const { indexes } = await pc.listIndexes();
  const exists = indexes?.some((idx) => idx.name === INDEX_NAME);

  if (!exists) {
    console.log(`Index "${INDEX_NAME}" does not exist. Creating now...`);
    await pc.createIndex({
      name: INDEX_NAME,
      dimension: EMBEDDING_DIMENSION,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    console.log(`Index "${INDEX_NAME}" created successfully. Waiting 5s for initialization...`);
    await new Promise((res) => setTimeout(res, 5000));
  }

  return pc.index(INDEX_NAME);
};

export const getRestaurantNamespace = async (restaurantId: string) => {
  const index = await getOrCreateIndex();
  return index.namespace(restaurantId);
};
