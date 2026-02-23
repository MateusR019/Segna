import { NextResponse } from "next/server";

export async function GET() {
  // Use Open-Meteo (100% free, no API key needed)
  // Default: São Paulo coordinates
  const lat = -23.5505;
  const lon = -46.6333;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=America%2FSao_Paulo`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } }); // cache 30min
    if (!res.ok) throw new Error("weather fetch failed");
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
