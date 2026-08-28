import { ICustomer } from "../../models/customer.model";
import { SessionState } from "../../domain/types/session-state.types";

function daysSince(date?: Date): string | null {
  if (!date) return null;
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function formatLastOrder(customer: ICustomer): string | null {
  if (!customer.lastOrderItems?.length) return null;
  const items = customer.lastOrderItems.map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const when = daysSince(customer.lastOrderAt);
  return when ? `${items} (${when})` : items;
}

export class MemoryInjectorService {
  buildMemoryBlock(customer: ICustomer, sessionState?: SessionState, isNew = false): string {
    const lines: string[] = ["CUSTOMER MEMORY:"];

    if (customer.name) {
      lines.push(`- Name: ${customer.name}${isNew ? " (new)" : ` (returning, order #${customer.totalOrders + 1})`}`);
    } else {
      lines.push(`- ${isNew ? "New customer" : `Returning customer (${customer.totalOrders} orders)`}`);
    }

    if (customer.preferences?.dietary?.length) {
      lines.push(`- Dietary: ${customer.preferences.dietary.join(", ")}`);
    }
    if (customer.preferences?.favorites?.length) {
      lines.push(`- Favorites: ${customer.preferences.favorites.join(", ")}`);
    }
    if (customer.preferences?.spiceLevel) {
      lines.push(`- Spice preference: ${customer.preferences.spiceLevel}`);
    }

    const lastOrder = formatLastOrder(customer);
    if (lastOrder) {
      lines.push(`- Last order: ${lastOrder}`);
    }

    if (customer.conversationSummary) {
      lines.push(`- History summary: ${customer.conversationSummary}`);
    }

    if (sessionState) {
      if (sessionState.lastCategoryViewed) {
        lines.push(`- This session: viewed ${sessionState.lastCategoryViewed} menu`);
      }
      if (sessionState.currentIntent) {
        lines.push(`- This session intent: ${sessionState.currentIntent}`);
      }
      if (sessionState.cartDraft.length > 0) {
        const cart = sessionState.cartDraft.map((i) => `${i.quantity}x ${i.name}`).join(", ");
        lines.push(`- Cart draft: ${cart}`);
      }
      if (sessionState.qualifyingAnswers.partySize) {
        lines.push(`- Party size: ${sessionState.qualifyingAnswers.partySize}`);
      }
    }

    if (!customer.marketingOptIn) {
      lines.push("- Marketing: opted out");
    }

    return lines.join("\n");
  }
}

export const memoryInjectorService = new MemoryInjectorService();
