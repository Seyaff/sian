export const WHATSAPP_MAX_MESSAGE_LENGTH = 4000;

export function splitWhatsAppMessage(text: string, maxLength = WHATSAPP_MAX_MESSAGE_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const messages: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      messages.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf("\n\n", maxLength);
    if (splitAt < maxLength * 0.5) {
      splitAt = remaining.lastIndexOf("\n", maxLength);
    }
    if (splitAt < maxLength * 0.5) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt <= 0) {
      splitAt = maxLength;
    }

    messages.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  return messages.filter(Boolean);
}

const ROBOTIC_PHRASES = [
  /agla step\??/gi,
  /\[Buttons?:[^\]]*\]/gi,
  /neeche se select karein/gi,
  /item ka naam likhein ya order dabayein/gi,
];

export function formatAgentReply(text: string): string {
  let formatted = text.trim();

  for (const pattern of ROBOTIC_PHRASES) {
    formatted = formatted.replace(pattern, "");
  }

  formatted = formatted.replace(/\n{3,}/g, "\n\n").trim();
  return formatted;
}

export function formatRagMenuText(raw: string, maxItems = 10): string {
  const lines = raw
    .split(/\n|---+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const cleaned = line
      .replace(/\bDP-\d+\b/gi, "")
      .replace(/^[\-\*\u2022\d.]+\s*/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < 3) continue;

    const priceMatch = cleaned.match(/^(.+?)\s+(?:Rs\.?|PKR)\s*([\d,]+)/i);
    if (priceMatch) {
      const name = priceMatch[1]!.trim();
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push(`• *${name}* — Rs ${priceMatch[2]}`);
      }
      continue;
    }

    const trailingPrice = cleaned.match(/^(.+?)\s+([\d,]{3,})\s*$/);
    if (trailingPrice && trailingPrice[1]!.length > 3) {
      const name = trailingPrice[1]!.trim();
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push(`• *${name}* — Rs ${trailingPrice[2]}`);
      }
      continue;
    }

    if (cleaned.length < 60 && !/^(page|section|chapter)\b/i.test(cleaned)) {
      const key = cleaned.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        items.push(`• ${cleaned}`);
      }
    }
  }

  return items.slice(0, maxItems).join("\n");
}

export function formatCategoryList(categories: string[]): string {
  return categories.map((cat, i) => `${i + 1}. ${cat}`).join("\n");
}
