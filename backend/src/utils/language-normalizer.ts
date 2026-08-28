export type DetectedIntent =
  | "greeting"
  | "menu"
  | "order"
  | "reservation"
  | "hours"
  | "location"
  | "agent"
  | "unknown";

const INTENT_PATTERNS: Array<{ intent: DetectedIntent; patterns: RegExp[] }> = [
  {
    intent: "greeting",
    patterns: [
      /^(salam|assalam|aoa|hi|hello|hey|good\s*(morning|evening|afternoon)|kia\s*hal|kaise\s*ho)\b/i,
      /^(salam|hi)\s+/i,
    ],
  },
  {
    intent: "menu",
    patterns: [
      /\b(menu|menue|khana|dishes|food\s*list)\b/i,
      /\b(menu|khana)\s*(dikhao|dekhao|batao|bata do|chahiye)\b/i,
      /\bkya\s*(milta|available)\b/i,
    ],
  },
  {
    intent: "order",
    patterns: [
      /\b(order|parcel|takeaway|delivery|ghar\s*bhej|le\s*jana)\b/i,
      /\b(order|khana)\s*(karna|chahiye|kar)\b/i,
      /\b\d+\s*(plate|portion|pcs|piece)\b/i,
    ],
  },
  {
    intent: "reservation",
    patterns: [
      /\b(table|booking|reserve|reservation)\b/i,
      /\b(table|booking)\s*(book|chahiye|karna)\b/i,
    ],
  },
  {
    intent: "hours",
    patterns: [
      /\b(timing|timings|hours|open|close|band|khula)\b/i,
      /\b(kab|kitne\s*baje)\s*(khult|band|open|close)\b/i,
    ],
  },
  {
    intent: "location",
    patterns: [
      /\b(location|address|pata|kahan|map|direction)\b/i,
      /\b(kahan\s*hai|address\s*kya)\b/i,
    ],
  },
  {
    intent: "agent",
    patterns: [/\b(insaan|human|agent|manager|staff)\b/i, /\b(baat|baat)\s*(chahiye|karni)\b/i],
  },
];

export function normalizeText(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

export function detectIntent(input: string): DetectedIntent {
  const text = normalizeText(input);

  if (!text) return "unknown";

  if (
    /\b(suggest|recommend|kya\s*khau|kuch\s*acha|help\s*me\s*choose)\b/i.test(text) ||
    /\b(kya\s*order|kya\s*khana)\s*(karun|khaun|karein)\b/i.test(text)
  ) {
    return "unknown";
  }

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(text))) {
      return intent;
    }
  }

  return "unknown";
}

export function isActionId(input: string): boolean {
  return /^(action_|cat_|approve_|deny_)/.test(input);
}
