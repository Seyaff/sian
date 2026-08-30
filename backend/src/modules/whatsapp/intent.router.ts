import { DetectedIntent, detectIntent, isActionId } from "../../utils/language-normalizer";
import { FastPathHandlers } from "./fast-path.handlers";

export type RouteResult =
  | { handled: true; intent: DetectedIntent | "action" }
  | { handled: false; intent: DetectedIntent };

// Only these stay on fast-path (quick facts). Everything else goes to the agent for natural chat.
const FAST_PATH_INTENTS = new Set<DetectedIntent>(["hours", "location"]);

export class IntentRouter {
  async route(
    input: string,
    handlers: FastPathHandlers,
    _options: { isNewCustomer?: boolean; isFirstMessage?: boolean } = {}
  ): Promise<RouteResult> {
    if (isActionId(input)) {
      await this.handleAction(input, handlers);
      return { handled: true, intent: "action" };
    }

    const intent = detectIntent(input);

    if (FAST_PATH_INTENTS.has(intent)) {
      if (intent === "hours") await handlers.sendHours();
      if (intent === "location") await handlers.sendLocation();
      return { handled: true, intent };
    }

    return { handled: false, intent };
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
    }
  }
}
