export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-PK");
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function formatKpiValue(
  value: number,
  format: "currency" | "percent" | "number" | "duration" | "decimal"
): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return `${value}%`;
    case "duration":
      return formatDuration(value);
    case "decimal":
      return value.toFixed(1);
    default:
      return formatNumber(value);
  }
}

export function shortOrderId(id: string): string {
  return id.slice(-6).toUpperCase();
}
