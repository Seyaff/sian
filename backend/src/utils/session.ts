export function buildSessionId(restaurantId: string, phone: string): string {
  return `${restaurantId}:${phone}`;
}

export function parseSessionId(sessionId: string): { restaurantId: string; phone: string } {
  const separatorIndex = sessionId.indexOf(":");
  if (separatorIndex === -1) {
    return { restaurantId: "", phone: sessionId };
  }

  return {
    restaurantId: sessionId.slice(0, separatorIndex),
    phone: sessionId.slice(separatorIndex + 1),
  };
}
