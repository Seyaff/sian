export function chunkText(text: string, chunkSize = 800, overlap = 100): string[] {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    const end = start + chunkSize;
    chunks.push(cleanText.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}
