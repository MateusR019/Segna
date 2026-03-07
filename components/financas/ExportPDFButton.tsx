"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settingsStore";
import { useT } from "@/lib/i18n";

interface ExportPDFButtonProps {
  targetId: string;
  month: string; // "YYYY-MM"
}

export function ExportPDFButton({ targetId, month }: ExportPDFButtonProps) {
  const language = useSettingsStore((s) => s.language);
  const t = useT(language);
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const el = document.getElementById(targetId);
      if (!el) return;

      const canvas = await html2canvas(el, {
        backgroundColor: "#111111",
        scale: 1.5,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgW = pageW - 16;
      const imgH = imgW / ratio;

      // Se a imagem for maior que uma página, divide
      let yPos = 8;
      let remainingH = imgH;
      let sourceY = 0;
      const maxH = pageH - 16;

      while (remainingH > 0) {
        const sliceH = Math.min(remainingH, maxH);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceH / imgH) * canvas.height;
        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sliceCanvas.height,
            0, 0,
            canvas.width, sliceCanvas.height,
          );
        }
        if (sourceY > 0) {
          pdf.addPage();
          yPos = 8;
        }
        pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 8, yPos, imgW, sliceH);
        sourceY += sliceCanvas.height;
        remainingH -= sliceH;
      }

      pdf.save(`relatorio-financas-${month}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleExport}
      disabled={loading}
      className="h-8 px-2.5 text-xs text-[#6b7280] hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer gap-1.5"
    >
      <FileDown size={13} className={loading ? "animate-bounce" : ""} />
      {loading ? "..." : t("exportPDF")}
    </Button>
  );
}
