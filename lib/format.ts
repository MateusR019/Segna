/**
 * Converte string com vírgula ou ponto decimal para número.
 * Aceita tanto "1.234,56" (pt-BR) quanto "1234.56" (en-US).
 */
export function parseNumber(value: string): number {
  // Se contiver vírgula após ponto (ex: "1.234,56") → formato pt-BR
  if (/\.\d{3},/.test(value) || (value.includes(",") && !value.includes("."))) {
    // Remove pontos de milhar e troca vírgula decimal por ponto
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
  }
  // Remove vírgulas de milhar (ex: "1,234.56") ou simplesmente troca vírgula por ponto
  return parseFloat(value.replace(",", ".")) || 0;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Formata valor em dólares. Para preços de tokens usa até 6 casas; para totais usa 2. */
export function formatUSD(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  const decimals = Math.abs(value) > 0 && Math.abs(value) < 0.01 ? 6 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDatePTBR(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"));
}
