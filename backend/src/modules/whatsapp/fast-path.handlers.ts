import { WhatsAppComposer } from "./whatsapp.composer";
import { SessionWriter } from "../../memory/session-writer";
import { retrieveContext, formatRetrievedContext } from "../../services/rag/query.service";
import { getCachedRag, setCachedRag } from "../../services/rag/rag-cache";
import { MenuRepository } from "../../repositories/menu/menu.repository";
import {
  CATEGORY_ID_MAP,
  DEFAULT_MENU_CATEGORIES,
} from "../../services/menu/menu-parser.service";
import { formatCategoryList } from "../../utils/whatsapp-formatting";

const menuRepo = new MenuRepository();

const RAG_QUERIES: Record<string, string> = {
  hours: "What are the opening hours and closing time?",
  location: "What is the restaurant address and location?",
};

const MENU_SUGGESTIONS: Record<string, string> = {
  BBQ: "Chicken Tikka — soft aur juicy, bestseller hai 🍗",
  Starters: "Soup of the Day try karein — light aur tasty",
  "Main Course": "Muttar Karahi half — yahan ki sab se zyada pasandeeda dish hai 🔥",
  Biryani: "Chicken Biryani — full portion, 2 log ke liye perfect",
  Bread: "Garlic Naan — karahi ke sath zabardast jata hai",
  Drinks: "Mango Lassi — thandi aur refreshing 😊",
  Desserts: "Kheer — meetha khatam karne ke liye",
};

async function cachedRetrieve(restaurantId: string, query: string) {
  const cached = getCachedRag(restaurantId, query);
  if (cached) return cached;
  const chunks = await retrieveContext(query, restaurantId, 3);
  setCachedRag(restaurantId, query, chunks);
  return chunks;
}

function formatMenuItems(
  items: Array<{ name: string; priceLabel?: string; price?: number }>
): string {
  if (items.length === 0) return "";
  return items
    .map((item) => {
      const price = item.priceLabel || (item.price ? `Rs ${item.price}` : "");
      return `• *${item.name}*${price ? ` — ${price}` : ""}`;
    })
    .join("\n");
}

function pickSuggestion(category: string): string {
  return MENU_SUGGESTIONS[category] ?? "Muttar Karahi — aaj try karein, bahut pasand aayegi 🔥";
}

export class FastPathHandlers {
  constructor(
    private readonly composer: WhatsAppComposer,
    private readonly restaurantId: string,
    private readonly sessionWriter?: SessionWriter,
    private readonly restaurantName = "Da Pakhtun Dera"
  ) {}

  private async reply(summary: string, fn: () => Promise<void>): Promise<void> {
    await fn();
    if (this.sessionWriter) {
      await this.sessionWriter.appendAssistantMessage(summary);
    }
  }

  async sendWelcome(isReturning = false): Promise<void> {
    const text = isReturning
      ? `Assalam o Alaikum! 😊\n*${this.restaurantName}* mein phir khush amdeed!\nAaj kya mood hai — kuch spicy, BBQ, ya karahi?`
      : `Assalam o Alaikum! 😊\n*${this.restaurantName}* mein khush amdeed!\nMenu dekhna hai, order karna hai, ya table book karni hai?`;

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendMenuCategories(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "browsing" });

    const dbCategories = await menuRepo.getCategories(this.restaurantId);
    const names =
      dbCategories.length > 0
        ? dbCategories.slice(0, 8)
        : DEFAULT_MENU_CATEGORIES.map((c) => c.title);

    const list = formatCategoryList(names);
    const text = `Yeh hain hamari categories:\n\n${list}\n\n💡 Aaj *Muttar Karahi* try karein — sab se zyada order hoti hai.\n\nKoi category bata dein ya seedha dish ka naam likh dein 😊`;

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendCategoryMenu(categoryId: string): Promise<void> {
    const categoryName =
      CATEGORY_ID_MAP[categoryId] || categoryId.replace(/^cat_/, "").replace(/_/g, " ");

    await this.sessionWriter?.updateSessionState({
      currentIntent: "browsing",
      lastCategoryViewed: categoryName,
    });

    const items = await menuRepo.getByCategory(this.restaurantId, categoryName);

    if (items.length > 0) {
      const menuText = formatMenuItems(items.slice(0, 10));
      const suggestion = pickSuggestion(categoryName);
      const text = `*${categoryName}* 🍽️\n\n${menuText}\n\n_${suggestion}_\n\nJo pasand ho naam likh dein — main order set kar deta hoon.`;

      await this.reply(`[Showed ${categoryName} menu]`, async () => {
        await this.composer.sendText(text);
        const withImages = items.filter((item) => item.imageUrl);
        for (const item of withImages.slice(0, 2)) {
          if (item.imageUrl) {
            await this.composer.sendImage(
              item.imageUrl,
              `*${item.name}*${item.priceLabel ? ` — ${item.priceLabel}` : ""}`
            );
          }
        }
      });
      return;
    }

    const chunks = await cachedRetrieve(this.restaurantId, `${categoryName} menu items with prices`);
    const context = formatRetrievedContext(chunks);

    if (!context) {
      const text = `*${categoryName}* ke items abhi load nahi ho sakay.\nKoi dish ka naam likh dein — main check karta hoon 😊`;
      await this.reply(text, () => this.composer.sendText(text));
      return;
    }

    const suggestion = pickSuggestion(categoryName);
    const text = `*${categoryName}* 🍽️\n\n${context}\n\n_${suggestion}_\n\nJo order karna ho likh dein.`;

    await this.reply(`[Showed ${categoryName} from knowledge base]`, () =>
      this.composer.sendText(text)
    );
  }

  async sendHours(): Promise<void> {
    const chunks = await cachedRetrieve(this.restaurantId, RAG_QUERIES.hours!);
    const context = formatRetrievedContext(chunks);
    const text = context
      ? `*Opening Hours* 🕐\n\n${context.slice(0, 400)}`
      : "Timing ke liye humein call karein — hum help kar denge.";

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendLocation(): Promise<void> {
    const chunks = await cachedRetrieve(this.restaurantId, RAG_QUERIES.location!);
    const context = formatRetrievedContext(chunks);
    const text = context
      ? `*Location* 📍\n\n${context.slice(0, 400)}`
      : "Address ke liye humein call karein.";

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendOrderPrompt(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "ordering" });
    const text =
      "Bilkul! 😊\nApna order likh dein — masalan:\n*2 Chicken Tikka, 1 Naan, takeaway*\n\nYa agar confused hain to bata dein kitne log hain, main suggest karunga.";

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendReservationPrompt(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "booking" });
    const text =
      "Table book karte hain 😊\nDate, time aur kitne log — likh dein.\nMasalan: *Kal 8 PM, 4 log*";

    await this.reply(text, () => this.composer.sendText(text));
  }

  async sendAgentHandoff(): Promise<void> {
    const text =
      "Theek hai — hamara staff jald contact karega.\nTab tak yahan message karte rahiye agar kuch chahiye.";
    await this.reply(text, () => this.composer.sendText(text));
  }
}
