import { NextResponse } from "next/server";

/**
 * Busca a cotação USD/BRL automaticamente via Frankfurter (gratuito, sem chave).
 * Cache de 1 hora no servidor.
 */
export async function GET() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=BRL", {
      headers: { accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("upstream");
    const data = await res.json();
    const rate = data.rates?.BRL;
    if (!rate || typeof rate !== "number") throw new Error("no_rate");
    return NextResponse.json({ usdToBRL: rate });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
