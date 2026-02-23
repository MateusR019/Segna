"use client";
import { useDefiStore } from "@/store/defiStore";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/format";

export function DefiSummary() {
  const tokens = useDefiStore((s) => s.tokens);
  const total = tokens.reduce((acc, t) => acc + t.quantity * t.priceInBRL, 0);
  const count = tokens.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="p-4">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">
            Total do Portfolio
          </p>
          <p className="text-xl font-semibold text-white">{formatBRL(total)}</p>
        </CardContent>
      </Card>
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        <CardContent className="p-4">
          <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1.5">
            Ativos
          </p>
          <p className="text-xl font-semibold text-white">{count}</p>
        </CardContent>
      </Card>
    </div>
  );
}
