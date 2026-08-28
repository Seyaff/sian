import { CustomerRepository } from "../../repositories/customer/customer.repository";
import { CustomerEventRepository } from "../../repositories/customer-event/customer-event.repository";

const customerRepo = new CustomerRepository();
const eventRepo = new CustomerEventRepository();

const NAME_PATTERNS = [
  /\b(?:mera|my)\s+naam\s+(\w+)/i,
  /\bi(?:'m| am)\s+(\w+)/i,
  /\bname\s+is\s+(\w+)/i,
  /\bmein\s+(\w+)\s+hun\b/i,
];

const DIETARY_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /\bvegetarian\b/i, value: "vegetarian" },
  { pattern: /\bvegan\b/i, value: "vegan" },
  { pattern: /\bno\s+beef\b/i, value: "no beef" },
  { pattern: /\bbeef\s+nahi\b/i, value: "no beef" },
  { pattern: /\bhalal\b/i, value: "halal" },
];

const SPICY_PATTERNS = [
  { pattern: /\b(?:mild|kam\s+mirch)\b/i, value: "mild" },
  { pattern: /\b(?:spicy|tez|extra\s+spicy)\b/i, value: "spicy" },
];

const FAVORITE_PATTERNS = [
  /\b(?:love|pasand|favorite)\s+(?:the\s+)?(.{3,40}?)(?:\.|$)/i,
  /\b(.{3,30})\s+bohot\s+acha\b/i,
];

const PARTY_SIZE_PATTERN = /\b(\d+)\s*(?:log|people|persons?|banday)\b/i;

export class ProfileExtractorService {
  constructor(
    private customers = new CustomerRepository(),
    private events = new CustomerEventRepository()
  ) {}

  async extractFromMessage(
    phone: string,
    restaurantId: string,
    text: string
  ): Promise<void> {
    const updates: Parameters<CustomerRepository["updateProfile"]>[2] = {};

    for (const pattern of NAME_PATTERNS) {
      const match = text.match(pattern);
      if (match?.[1] && match[1].length > 2) {
        updates.name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        break;
      }
    }

    const dietary: string[] = [];
    for (const { pattern, value } of DIETARY_PATTERNS) {
      if (pattern.test(text)) dietary.push(value);
    }
    if (dietary.length) updates.dietary = dietary;

    for (const { pattern, value } of SPICY_PATTERNS) {
      if (pattern.test(text)) {
        updates.spiceLevel = value;
        break;
      }
    }

    for (const pattern of FAVORITE_PATTERNS) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const favorite = match[1].trim();
        if (favorite.length > 2 && favorite.length < 50) {
          updates.favorites = [favorite];
        }
      }
    }

    if (/\b(roman urdu|urdu mein|hinglish)\b/i.test(text)) {
      updates.language = "roman_urdu";
    } else if (/\benglish\b/i.test(text)) {
      updates.language = "english";
    }

    if (Object.keys(updates).length === 0) return;

    const customer = await this.customers.updateProfile(phone, restaurantId, updates);
    if (!customer) return;

    await this.events.log({
      phone,
      restaurantId,
      type: updates.name ? "name_updated" : "preference_updated",
      payload: updates as Record<string, unknown>,
    });
  }

  extractQualifyingAnswers(text: string) {
    const answers: { partySize?: number; spicy?: boolean; meatPreference?: string } = {};

    const partyMatch = text.match(PARTY_SIZE_PATTERN);
    if (partyMatch?.[1]) {
      answers.partySize = Number(partyMatch[1]);
    }

    if (/\b(?:mild|kam)\b/i.test(text)) answers.spicy = false;
    if (/\b(?:spicy|tez)\b/i.test(text)) answers.spicy = true;

    if (/\b(?:chicken|murg)\b/i.test(text)) answers.meatPreference = "chicken";
    if (/\b(?:beef|gaye)\b/i.test(text)) answers.meatPreference = "beef";
    if (/\b(?:mutton|lamb|bakray)\b/i.test(text)) answers.meatPreference = "mutton";

    return answers;
  }
}

export const profileExtractorService = new ProfileExtractorService();
