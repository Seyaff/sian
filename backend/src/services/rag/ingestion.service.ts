import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { embedMany } from "ai";
import { PineconeRecord } from "@pinecone-database/pinecone";
import { getRestaurantNamespace } from "./pinecone.client";
import { chunkText } from "./chunking";
import { embeddingModel, embeddingProviderOptions } from "./embedding.model";

import { parseMenuFromText } from "../menu/menu-parser.service";
import { MenuRepository } from "../../repositories/menu/menu.repository";

const menuRepo = new MenuRepository();

export interface IngestionResult {
  restaurantId: string;
  filePath: string;
  chunksIngested: number;
  menuItemsParsed: number;
}

export const ingestPdfToPinecone = async (
  filePath: string,
  restaurantId: string
): Promise<IngestionResult> => {
  console.log(`\n--- Starting PDF ingestion for restaurant "${restaurantId}": ${filePath} ---`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const parsed = await parser.getText();

  console.log(`Parsed PDF successfully. Total characters extracted: ${parsed.text.length}`);

  const chunks = chunkText(parsed.text);
  console.log(`Generated ${chunks.length} text chunks.`);

  if (chunks.length === 0) {
    throw new Error("No text could be extracted from the PDF.");
  }

  console.log("Generating vector embeddings using Gemini (gemini-embedding-001)...");

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
    providerOptions: embeddingProviderOptions,
  });

  const fileBaseName = path.basename(filePath);
  const records: PineconeRecord[] = chunks.map((chunk, i) => {
    const values = embeddings[i];
    if (!values) {
      throw new Error(`Failed to generate embedding for chunk #${i}`);
    }

    return {
      id: `${restaurantId}-${fileBaseName}-chunk-${i}`,
      values,
      metadata: {
        text: chunk,
        source: filePath,
        restaurantId,
        createdAt: new Date().toISOString(),
      },
    };
  });

  const namespace = await getRestaurantNamespace(restaurantId);

  console.log(`Upserting ${records.length} records into namespace "${restaurantId}"...`);
  await namespace.upsert({ records });

  console.log(`Ingestion complete for restaurant "${restaurantId}".\n`);

  const menuItems = parseMenuFromText(parsed.text, restaurantId);
  const menuItemsParsed = await menuRepo.upsertMany(menuItems);
  console.log(`Parsed ${menuItemsParsed} structured menu items into MongoDB.`);

  return {
    restaurantId,
    filePath,
    chunksIngested: records.length,
    menuItemsParsed,
  };
};
