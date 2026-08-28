import { DetectedIntent, detectIntent, isActionId } from "../../utils/language-normalizer";
import { FastPathHandlers } from "./fast-path.handlers";

export type RouteResult =
  | { handled: true; intent: DetectedIntent | "action" }
  | { handled: false; intent: DetectedIntent };

export class IntentRouter {
  async route(
    input: string,
    handlers: FastPathHandlers,
    options: { isNewCustomer?: boolean; isFirstMessage?: boolean } = {}
  ): Promise<RouteResult> {
    if (isActionId(input)) {
      await this.handleAction(input, handlers);
      return { handled: true, intent: "action" };
    }

    const intent = detectIntent(input);

    if (options.isFirstMessage && (intent === "greeting" || intent === "unknown")) {
      await handlers.sendWelcome(!options.isNewCustomer);
      return { handled: true, intent: "greeting" };
    }

    switch (intent) {
      case "greeting":
        await handlers.sendWelcome();
        return { handled: true, intent };

      case "menu":
        await handlers.sendMenuCategories();
        return { handled: true, intent };

      case "hours":
        await handlers.sendHours();
        return { handled: true, intent };

      case "location":
        await handlers.sendLocation();
        return { handled: true, intent };

      case "order":
        await handlers.sendOrderPrompt();
        return { handled: true, intent };

      case "reservation":
        await handlers.sendReservationPrompt();
        return { handled: true, intent };

      case "agent":
        await handlers.sendAgentHandoff();
        return { handled: true, intent };

      default:
        return { handled: false, intent: "unknown" };
    }
  }

  private async handleAction(actionId: string, handlers: FastPathHandlers): Promise<void> {
    if (actionId === "action_menu") {
      await handlers.sendMenuCategories();
      return;
    }

    if (actionId === "action_order") {
      await handlers.sendOrderPrompt();
      return;
    }

    if (actionId === "action_book") {
      await handlers.sendReservationPrompt();
      return;
    }

    if (actionId === "action_hours") {
      await handlers.sendHours();
      return;
    }

    if (actionId === "action_location") {
      await handlers.sendLocation();
      return;
    }

    if (actionId.startsWith("cat_")) {
      await handlers.sendCategoryMenu(actionId);
      return;
    }
  }
}
