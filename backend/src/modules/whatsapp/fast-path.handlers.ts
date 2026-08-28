import { WhatsAppComposer } from "./whatsapp.composer";
import { SessionWriter } from "../../memory/session-writer";
import { retrieveContext, formatRetrievedContext } from "../../services/rag/query.service";
import { getCachedRag, setCachedRag } from "../../services/rag/rag-cache";
import { MenuRepository } from "../../repositories/menu/menu.repository";
import {
  CATEGORY_ID_MAP,
  DEFAULT_MENU_CATEGORIES,
} from "../../services/menu/menu-parser.service";

const menuRepo = new MenuRepository();

const RAG_QUERIES: Record<string, string> = {
  hours: "What are the opening hours and closing time?",
  location: "What is the restaurant address and location?",
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
  if (items.length === 0) return "Is category mein abhi items available nahi hain.";
  return items
    .map((item) => {
      const price = item.priceLabel || (item.price ? `Rs ${item.price}` : "");
      return `• *${item.name}*${price ? ` — ${price}` : ""}`;
    })
    .join("\n");
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
    const greeting = isReturning
      ? `Welcome back! *${this.restaurantName}* mein phir khush amdeed!`
      : `Assalam o Alaikum! *${this.restaurantName}* mein khush amdeed!`;

    await this.reply(
      `${greeting}\nAaj kya chahiye? [Buttons: Menu, Order, Table Book]`,
      () =>
        this.composer.sendButtons(`${greeting}\n\nAaj kya chahiye?`, [
          { id: "action_menu", title: "Menu" },
          { id: "action_order", title: "Order" },
          { id: "action_book", title: "Table Book" },
        ])
    );
  }

  async sendMenuCategories(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "browsing" });

    const dbCategories = await menuRepo.getCategories(this.restaurantId);
    const rows =
      dbCategories.length > 0
        ? dbCategories.slice(0, 10).map((cat) => ({
            id: `cat_${cat.toLowerCase().replace(/\s+/g, "_")}`,
            title: cat,
            description: `${cat} items`,
          }))
        : DEFAULT_MENU_CATEGORIES;

    await this.reply("[Showed menu category list]", () =>
      this.composer.sendList(
        "Yeh hain hamari categories — neeche se select karein:",
        "View Menu",
        [{ title: "Menu Categories", rows }]
      )
    );
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
      const text = `*${categoryName}*\n\n${formatMenuItems(items)}\n\nItem ka naam likhein ya Order dabayein!`;
      await this.reply(`[Showed ${categoryName} menu — ${items.length} items]`, async () => {
        await this.composer.sendText(text);
        const withImages = items.filter((item) => item.imageUrl);
        for (const item of withImages.slice(0, 3)) {
          if (item.imageUrl) {
            await this.composer.sendImage(
              item.imageUrl,
              `*${item.name}*${item.priceLabel ? ` — ${item.priceLabel}` : ""}`
            );
          }
        }
        await this.composer.sendButtons("Kya order karna hai?", [
          { id: "action_order", title: "Order Now" },
          { id: "action_menu", title: "More Menu" },
        ]);
      });
      return;
    }

    const chunks = await cachedRetrieve(this.restaurantId, `${categoryName} menu items with prices`);
    const context = formatRetrievedContext(chunks);

    if (!context) {
      await this.reply(`[${categoryName} — no items found]`, () =>
        this.composer.sendText(
          `*${categoryName}* ke items abhi load nahi ho sakay.\nKoi specific dish ka naam likhein!`
        )
      );
      return;
    }

    await this.reply(`[Showed ${categoryName} from knowledge base]`, async () => {
      await this.composer.sendText(
        `*${categoryName}*\n\n${context.slice(0, 3500)}\n\n_Item ka naam likhein ya Order dabayein!_`
      );
      await this.composer.sendButtons("Agla step?", [
        { id: "action_order", title: "Order Now" },
        { id: "action_menu", title: "More Menu" },
      ]);
    });
  }

  async sendHours(): Promise<void> {
    const chunks = await cachedRetrieve(this.restaurantId, RAG_QUERIES.hours!);
    const context = formatRetrievedContext(chunks);
    await this.reply("[Showed opening hours]", async () => {
      await this.composer.sendText(
        context
          ? `*Opening Hours*\n\n${context.slice(0, 500)}\n\nOrder karna hai?`
          : "Timing ke liye humein call karein."
      );
      await this.composer.sendButtons("Kya karna hai?", [
        { id: "action_order", title: "Order" },
        { id: "action_menu", title: "Menu" },
      ]);
    });
  }

  async sendLocation(): Promise<void> {
    const chunks = await cachedRetrieve(this.restaurantId, RAG_QUERIES.location!);
    const context = formatRetrievedContext(chunks);
    await this.reply("[Showed location/address]", async () => {
      await this.composer.sendText(
        context ? `*Location*\n\n${context.slice(0, 500)}` : "Address ke liye humein call karein."
      );
      await this.composer.sendButtons("Aur kuch?", [
        { id: "action_order", title: "Order" },
        { id: "action_menu", title: "Menu" },
      ]);
    });
  }

  async sendOrderPrompt(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "ordering" });
    await this.reply("[Prompted for order details]", async () => {
      await this.composer.sendText(
        "Zabardast!\nApna order likhein — masalan:\n*2 Chicken Tikka, 1 Naan, takeaway*"
      );
      await this.composer.sendButtons("Ya menu se choose karein:", [
        { id: "action_menu", title: "View Menu" },
        { id: "action_book", title: "Book Table" },
      ]);
    });
  }

  async sendReservationPrompt(): Promise<void> {
    await this.sessionWriter?.updateSessionState({ currentIntent: "booking" });
    await this.reply("[Prompted for table reservation]", () =>
      this.composer.sendText(
        "Table book karna hai?\nDate, time aur kitne log — likh dein.\nMasalan: *Kal 8 PM, 4 log*"
      )
    );
  }

  async sendAgentHandoff(): Promise<void> {
    await this.reply("[Handoff to human staff]", () =>
      this.composer.sendText(
        "Theek hai!\nHamara staff jald contact karega.\nTab tak menu ya order ke liye yahan message karein."
      )
    );
  }
}
