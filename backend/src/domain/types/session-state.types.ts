export type SessionIntent = "ordering" | "browsing" | "booking" | null;

export interface CartDraftItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface SessionState {
  currentIntent: SessionIntent;
  cartDraft: CartDraftItem[];
  lastCategoryViewed?: string;
  qualifyingAnswers: {
    partySize?: number;
    spicy?: boolean;
    meatPreference?: string;
  };
  languageStyle: "roman_urdu" | "english" | "mixed";
  lastActivityAt: Date;
}

export const defaultSessionState = (): SessionState => ({
  currentIntent: null,
  cartDraft: [],
  qualifyingAnswers: {},
  languageStyle: "mixed",
  lastActivityAt: new Date(),
});

export function normalizeSessionState(state?: Partial<SessionState> | null): SessionState {
  const defaults = defaultSessionState();
  if (!state) return defaults;

  return {
    currentIntent: state.currentIntent ?? defaults.currentIntent,
    cartDraft: state.cartDraft ?? defaults.cartDraft,
    qualifyingAnswers: state.qualifyingAnswers ?? defaults.qualifyingAnswers,
    languageStyle: state.languageStyle ?? defaults.languageStyle,
    lastActivityAt: state.lastActivityAt ?? defaults.lastActivityAt,
    ...(state.lastCategoryViewed ? { lastCategoryViewed: state.lastCategoryViewed } : {}),
  };
}
