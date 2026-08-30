export function chunkText(text: string, chunkSize = 600, overlap = 80): string[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\t/g, " ");
  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length + 2 <= chunkSize) {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
      continue;
    }

    if (current) chunks.push(current);

    if (paragraph.length <= chunkSize) {
      current = paragraph;
      continue;
    }

    let start = 0;
    while (start < paragraph.length) {
      const end = start + chunkSize;
      chunks.push(paragraph.slice(start, end));
      start += chunkSize - overlap;
    }
    current = "";
  }

  if (current) chunks.push(current);
  return chunks;
}
