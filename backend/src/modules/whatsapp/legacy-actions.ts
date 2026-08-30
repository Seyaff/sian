 import { isActionId } from "../../utils/language-normalizer";

const LEGACY_ACTION_MESSAGES: Record<string, string> = {
  action_menu: "menu dikhao",
  action_order: "order karna hai",
  action_book: "table book karni hai",
  action_hours: "timing kya hai?",
  action_location: "address kya hai?",
};

export function resolveLegacyActionToText(input: string): string | null {
  if (!isActionId(input)) return null;
  if (input.startsWith("approve_") || input.startsWith("deny_")) return null;

  if (LEGACY_ACTION_MESSAGES[input]) {
    return LEGACY_ACTION_MESSAGES[input];
  }

  if (input.startsWith("cat_")) {
    const category = input.replace(/^cat_/, "").replace(/_/g, " ");
    return `${category} menu dikhao`;
  }

  return null;
}
