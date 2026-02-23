import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 }, // cache 60s server-side
    });

    if (res.status === 429) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "upstream_error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
