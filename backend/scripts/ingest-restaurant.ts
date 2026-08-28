import "dotenv/config";
import path from "path";
import connectDatabase from "../src/config/database.config";
import { ingestPdfToPinecone } from "../src/services/rag/ingestion.service";

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--restaurant" || arg === "-r") {
      args.restaurant = argv[++i] ?? "";
    } else if (arg === "--file" || arg === "-f") {
      args.file = argv[++i] ?? "";
    }
  }

  return args;
}

async function main() {
  const { restaurant, file } = parseArgs(process.argv.slice(2));

  if (!restaurant || !file) {
    console.error("Usage: npm run ingest -- --restaurant <restaurant-id> --file <path-to-pdf>");
    process.exit(1);
  }

  const resolvedFile = path.resolve(file);

  await connectDatabase();

  const result = await ingestPdfToPinecone(resolvedFile, restaurant);

  console.log("Ingestion summary:", result);
  process.exit(0);
}

main().catch((error) => {
  console.error("Ingestion failed:", error);
  process.exit(1);
});
