import { z } from "zod";

// Groq validates tool args strictly — null must be allowed in the JSON schema, not just Zod optional.
export const nullableString = () => z.union([z.string(), z.null()]).optional();

export const nullableNumber = () => z.union([z.number(), z.null()]).optional();

export function cleanString(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
