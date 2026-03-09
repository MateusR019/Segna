"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useFinancasStore, calcTotalIncome, calcTotalExpenses } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useCorporalStore } from "@/store/corporalStore";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/lib/i18n";
import {
  User, Palette, Wallet, Scale, Download, Upload,
  Sun, Moon, Monitor, Check, Trash2, Cake, Bell, BellOff,
  Target, Activity, FileDown, Flame,
} from "lucide-react";
import { format, parseISO, isValid, differenceInYears, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TransactionType, AnyCategory } from "@/types";
import { formatBRL } from "@/lib/format";

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#a78bfa", "#fb923c", "#ec4899",
];

function Avatar({ name, color, size = 48 }: { name: string; color: string; size?: number }) {
  const initials = name.trim()
    ? name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?";
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a]">
        <Icon size={14} className="text-[#6366f1]" />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <div className="p-4 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {hint && <p className="text-[11px] text-[#4a4a4a] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, AnyCategory> = {
  moradia: "housing", housing: "housing", habitação: "housing", aluguel: "housing",
  alimentação: "food", alimentacao: "food", comida: "food", food: "food", mercado: "food",
  transporte: "transport", transport: "transport",
  saúde: "health", saude: "health", health: "health",
  lazer: "entertainment", entretenimento: "entertainment", entertainment: "entertainment",
  educação: "education", educacao: "education", education: "education",
  compras: "shopping", shopping: "shopping",
  investimentos: "investments", investments: "investments",
  outro: "other", outros: "other", other: "other",
  salário: "salary", salario: "salary", salary: "salary",
  freelance: "freelance",
  retorno: "investment_return", investment_return: "investment_return", rendimento: "investment_return",
  presente: "gift", gift: "gift",
  outra_renda: "other_income", other_income: "other_income",
};
const TYPE_MAP: Record<string, TransactionType> = {
  despesa: "expense", saída: "expense", saida: "expense", expense: "expense",
  receita: "income", entrada: "income", income: "income",
};
const CATEGORY_LABEL: Record<string, string> = {
  housing: "moradia", food: "alimentacao", transport: "transporte", health: "saude",
  entertainment: "lazer", education: "educacao", shopping: "compras",
  investments: "investimentos", other: "outro",
  salary: "salario", freelance: "freelance", investment_return: "retorno",
  gift: "presente", other_income: "outra_renda",
};
function normalizeStr(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const {
    displayName, setDisplayName,
    avatarColor, setAvatarColor,
    birthDate, setBirthDate,
    joinedAt,
    walletAddress, setWalletAddress,
    zerionApiKey, setZerionApiKey,
    height, setHeight,
    theme, setTheme,
    language, setLanguage,
    notificationsEnabled, setNotificationsEnabled,
    notificationTime, setNotificationTime,
  } = useSettingsStore();

  const { transactions, addTransaction, savingsGoal, setSavingsGoal, clearSavingsGoal } = useFinancasStore();
  const { habits, completions } = useHabitosStore();
  const { addMetric, metrics: bodyMetrics } = useCorporalStore();
  const { success, error: toastError } = useToast();
  const t = useT(language);

  // Form state
  const [nameVal, setNameVal]           = useState(displayName);
  const [heightVal, setHeightVal]       = useState(height > 0 ? String(height) : "");
  const [birthVal, setBirthVal]         = useState(birthDate);
  const [walletVal, setWalletVal]       = useState(walletAddress);
  const [zerionVal, setZerionVal]       = useState(zerionApiKey);
  const [weightVal, setWeightVal]       = useState("");
  const [savingsVal, setSavingsVal]     = useState(savingsGoal ? String(savingsGoal.targetAmount) : "");
  const [notifTimeVal, setNotifTimeVal] = useState(notificationTime);

  // CSV import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importRows, setImportRows] = useState<{
    valid: boolean; date?: string; description?: string;
    amount?: number; type?: TransactionType; category?: AnyCategory;
    raw: string; errors: string[];
  }[]>([]);
  const [importFileName, setImportFileName] = useState("");

  // Export
  const [exportRange, setExportRange] = useState<"month" | "3months" | "year" | "all">("month");
  const [pdfLoading, setPdfLoading]   = useState(false);

  // Danger zone
  const [confirmReset, setConfirmReset] = useState(false);

  const inputClass = "w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#6366f1] transition-colors";

  // ── Stats ──────────────────────────────────────────────────────────────────
  const diasDeUso = joinedAt
    ? Math.max(0, differenceInDays(new Date(), parseISO(joinedAt)))
    : 0;
  const habitosAtivos = habits.filter((h) => !h.paused).length;
  const thisMonth = format(new Date(), "yyyy-MM");
  const transacoesMes = transactions.filter((tx) => tx.date.startsWith(thisMonth)).length;
  const melhorStreak = habits.reduce((max, h) => {
    const s = calcStreak(h.id, completions);
    return Math.max(max, s);
  }, 0);

  // ── Age ────────────────────────────────────────────────────────────────────
  const parsedBirth = birthDate && isValid(parseISO(birthDate)) ? parseISO(birthDate) : null;
  const age = parsedBirth ? differenceInYears(new Date(), parsedBirth) : null;

  // ── Latest weight ──────────────────────────────────────────────────────────
  const latestWeight = bodyMetrics.find((m) => m.weight != null)?.weight ?? null;

  // ── Saves ─────────────────────────────────────────────────────────────────
  function saveName() {
    if (!nameVal.trim()) return;
    setDisplayName(nameVal);
    success(t("nameUpdated"));
  }

  function saveBirth() {
    if (!birthVal) return;
    setBirthDate(birthVal);
    success("Aniversário salvo!");
  }

  function saveHeight() {
    const h = parseFloat(heightVal);
    if (!isNaN(h) && h > 0) { setHeight(h); success(t("heightSaved")); }
  }

  function saveWeight() {
    const w = parseFloat(weightVal.replace(",", "."));
    if (isNaN(w) || w <= 0) return;
    addMetric({ date: format(new Date(), "yyyy-MM-dd"), weight: w });
    setWeightVal("");
    success("Peso registrado!");
  }

  function saveSavingsGoal() {
    const val = parseFloat(savingsVal.replace(",", "."));
    if (isNaN(val) || val <= 0) { clearSavingsGoal(); success("Meta removida."); return; }
    setSavingsGoal(val);
    success("Meta de economia salva!");
  }

  function saveWallet() {
    setWalletAddress(walletVal);
    success(t("walletSaved"));
  }

  function saveZerion() {
    setZerionApiKey(zerionVal);
    success(t("saved"));
  }

  function saveNotifTime() {
    setNotificationTime(notifTimeVal);
    success("Horário salvo!");
  }

  async function toggleNotifications(enable: boolean) {
    if (enable) {
      if (!("Notification" in window)) {
        toastError("Notificações não suportadas neste dispositivo.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Segna", {
          body: `Lembretes de hábitos ativados às ${notificationTime} 🔔`,
          icon: "/icon-192.png",
        });
        success("Notificações ativadas!");
      } else {
        toastError("Permissão negada. Ative nas configurações do navegador.");
      }
    } else {
      setNotificationsEnabled(false);
      success("Notificações desativadas.");
    }
  }

  // ── CSV import ────────────────────────────────────────────────────────────
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const delim = lines[0]?.includes(";") ? ";" : ",";
      const startIdx = normalizeStr((lines[0] ?? "").split(delim)[0]) === "data" ? 1 : 0;
      const rows = lines.slice(startIdx).map((raw) => {
        const cols = raw.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        const [dateRaw, typeRaw, categoryRaw, descRaw, amountRaw] = cols;
        const errors: string[] = [];
        const parsed = dateRaw ? parseISO(dateRaw) : null;
        const date = parsed && isValid(parsed) ? format(parsed, "yyyy-MM-dd") : undefined;
        if (!date) errors.push("data inválida");
        const type = TYPE_MAP[normalizeStr(typeRaw ?? "")];
        if (!type) errors.push(`tipo: "${typeRaw}"`);
        const category = CATEGORY_MAP[normalizeStr(categoryRaw ?? "")];
        if (!category) errors.push(`categoria: "${categoryRaw}"`);
        if (!descRaw?.trim()) errors.push("descrição ausente");
        const amount = parseFloat((amountRaw ?? "").replace("R$", "").replace(/\s/g, "").replace(",", "."));
        if (isNaN(amount) || amount <= 0) errors.push("valor inválido");
        return { raw, valid: errors.length === 0, date, type, category, description: descRaw?.trim(), amount: isNaN(amount) ? undefined : amount, errors };
      }).filter((r) => r.raw.trim());
      setImportRows(rows);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  }

  function doImport() {
    const toImport = importRows.filter((r) => r.valid);
    if (toImport.length === 0) { toastError("Nenhum lançamento válido."); return; }
    toImport.forEach((r) => addTransaction({
      type: r.type!, category: r.category!, description: r.description!,
      amount: r.amount!, date: r.date!, recurring: false,
    }));
    success(`${toImport.length} lançamentos importados!`);
    setImportRows([]); setImportFileName("");
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function doExport() {
    const now = new Date();
    const filtered = transactions.filter((tx) => {
      if (exportRange === "month") return tx.date.startsWith(format(now, "yyyy-MM"));
      if (exportRange === "3months") return (now.getTime() - new Date(tx.date).getTime()) / 86400000 <= 92;
      if (exportRange === "year") return tx.date.startsWith(format(now, "yyyy"));
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
    if (filtered.length === 0) { toastError("Nenhuma transação no período."); return; }
    const header = "data,tipo,categoria,descricao,valor,recorrente";
    const lines = filtered.map((tx) =>
      `${tx.date},${tx.type === "income" ? "receita" : "despesa"},${CATEGORY_LABEL[tx.category] ?? tx.category},"${tx.description.replace(/"/g, '""')}",${tx.amount.toFixed(2)},${tx.recurring ? "sim" : ""}`
    );
    const blob = new Blob(["\uFEFF" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `segna-financas-${format(now, "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
    success(`${filtered.length} lançamentos exportados!`);
  }

  // ── PDF export (data-driven) ───────────────────────────────────────────────
  async function doExportPDF() {
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const now = new Date();
      const monthKey = format(now, "yyyy-MM");
      const monthLabel = format(parseISO(monthKey + "-01"), "MMMM yyyy", { locale: ptBR });

      const filtered = transactions
        .filter((tx) => {
          if (exportRange === "month") return tx.date.startsWith(monthKey);
          if (exportRange === "3months") return (now.getTime() - new Date(tx.date).getTime()) / 86400000 <= 92;
          if (exportRange === "year") return tx.date.startsWith(format(now, "yyyy"));
          return true;
        })
        .sort((a, b) => a.date.localeCompare(b.date));

      if (filtered.length === 0) { toastError("Nenhuma transação no período."); setPdfLoading(false); return; }

      const income   = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const balance  = income - expenses;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      let y = 18;

      // Header
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageW, 12, "F");
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Segna — Relatório Financeiro", 14, 8.5);
      pdf.text(format(now, "dd/MM/yyyy"), pageW - 14, 8.5, { align: "right" });

      y = 22;
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text(`Finanças — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`, 14, y);

      if (displayName) {
        y += 6;
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Usuário: ${displayName}`, 14, y);
      }

      // Summary boxes
      y += 10;
      const boxW = (pageW - 28 - 8) / 3;
      const boxes = [
        { label: "Receitas", value: formatBRL(income), color: [34, 197, 94] as [number,number,number] },
        { label: "Despesas", value: formatBRL(expenses), color: [239, 68, 68] as [number,number,number] },
        { label: "Saldo", value: formatBRL(balance), color: balance >= 0 ? [99, 102, 241] as [number,number,number] : [249, 115, 22] as [number,number,number] },
      ];
      boxes.forEach(({ label, value, color }, i) => {
        const x = 14 + i * (boxW + 4);
        pdf.setFillColor(245, 245, 250);
        pdf.roundedRect(x, y, boxW, 16, 2, 2, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(label, x + boxW / 2, y + 5, { align: "center" });
        pdf.setFontSize(11);
        pdf.setTextColor(...color);
        pdf.text(value, x + boxW / 2, y + 12, { align: "center" });
      });

      // Transactions table
      y += 24;
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
      pdf.text(`Lançamentos (${filtered.length})`, 14, y);
      y += 4;

      // Table header
      pdf.setFillColor(240, 240, 248);
      pdf.rect(14, y, pageW - 28, 7, "F");
      pdf.setFontSize(7.5);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Data",       18,       y + 4.8);
      pdf.text("Descrição",  40,       y + 4.8);
      pdf.text("Categoria",  115,      y + 4.8);
      pdf.text("Valor",      pageW - 18, y + 4.8, { align: "right" });
      y += 7;

      pdf.setFontSize(7.5);
      filtered.forEach((tx) => {
        if (y > 270) { pdf.addPage(); y = 14; }
        const isIncome = tx.type === "income";
        pdf.setTextColor(60, 60, 60);
        pdf.text(tx.date,                     18,         y + 4);
        pdf.text(tx.description.slice(0, 35), 40,         y + 4);
        pdf.text(CATEGORY_LABEL[tx.category] ?? tx.category, 115, y + 4);
        pdf.setTextColor(...(isIncome ? [34, 197, 94] as [number,number,number] : [239, 68, 68] as [number,number,number]));
        pdf.text(`${isIncome ? "+" : "-"}${formatBRL(tx.amount)}`, pageW - 18, y + 4, { align: "right" });
        pdf.setDrawColor(230, 230, 230);
        pdf.line(14, y + 6.5, pageW - 14, y + 6.5);
        y += 7;
      });

      const rangeLabel = exportRange === "month" ? monthKey : exportRange === "year" ? format(now, "yyyy") : exportRange;
      pdf.save(`segna-financas-${rangeLabel}.pdf`);
      success("PDF exportado!");
    } catch (err) {
      console.error(err);
      toastError("Erro ao gerar PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  const validCount   = importRows.filter((r) => r.valid).length;
  const invalidCount = importRows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-5 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">{t("settingsTitle")}</h1>
        <p className="text-sm text-[#6b7280]">{t("settingsDesc")}</p>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "📅", label: "Dias de uso",       value: diasDeUso },
          { icon: "✅", label: "Hábitos ativos",    value: habitosAtivos },
          { icon: "🔥", label: "Melhor streak",     value: melhorStreak },
          { icon: "📊", label: "Transações/mês",    value: transacoesMes },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col items-center gap-1">
            <span className="text-lg leading-none">{icon}</span>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[10px] text-[#6b7280] text-center leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* ── PERFIL ─────────────────────────────────────────────────────────── */}
      <Section title={t("sectionProfile")} icon={User}>
        {/* Avatar preview */}
        <div className="flex items-center gap-4 pb-1">
          <Avatar name={nameVal || displayName || "?"} color={avatarColor} size={52} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {displayName || <span className="text-[#4a4a4a] font-normal">—</span>}
            </p>
            <p className="text-[11px] text-[#4a4a4a]">
              {age !== null ? `${age} anos · ` : ""}Segna Personal OS
            </p>
            {diasDeUso > 0 && (
              <p className="text-[11px] text-[#6366f1]">Usando há {diasDeUso} dia{diasDeUso !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        <Field label={t("labelName")} hint={t("hintName")}>
          <div className="flex gap-2">
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className={inputClass}
              placeholder={t("namePlaceholder")}
            />
            <button
              onClick={saveName}
              disabled={!nameVal.trim() || nameVal.trim() === displayName}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
        </Field>

        <Field label="Data de nascimento" hint="Usada para calcular sua idade e IMC">
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={birthVal}
              onChange={(e) => setBirthVal(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={saveBirth}
              disabled={!birthVal || birthVal === birthDate}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          {age !== null && (
            <p className="text-xs text-[#22c55e] flex items-center gap-1">
              <Cake size={11} /> {age} anos
            </p>
          )}
        </Field>

        <Field label={t("labelAvatarColor")}>
          <div className="flex items-center gap-2">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center flex-shrink-0 ring-offset-[#1a1a1a]"
                style={{ background: c, outline: avatarColor === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
              >
                {avatarColor === c && <Check size={13} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── OBJETIVOS ──────────────────────────────────────────────────────── */}
      <Section title="Objetivos" icon={Target}>
        <Field label="Meta de economia mensal" hint="Quanto você quer guardar por mês (R$)">
          <div className="flex gap-2 items-center">
            <input
              value={savingsVal}
              onChange={(e) => setSavingsVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveSavingsGoal()}
              className={`${inputClass} flex-1`}
              placeholder="Ex: 500"
              type="number"
              min={0}
            />
            <button
              onClick={saveSavingsGoal}
              disabled={savingsVal === (savingsGoal ? String(savingsGoal.targetAmount) : "")}
              className="px-3 py-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-30 disabled:cursor-not-allowed text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          {savingsGoal && (
            <p className="text-xs text-[#22c55e]">Meta atual: {formatBRL(savingsGoal.targetAmount)}/mês</p>
          )}
        </Field>
      </Section>

      {/* ── APARÊNCIA ──────────────────────────────────────────────────────── */}
      <Section title={t("sectionAppearance")} icon={Palette}>
        <Field label={t("labelTheme")} hint={t("hintTheme")}>
          <div className="flex gap-2">
            {([
              { value: "dark"  as const, label: t("themeDark"),  Icon: Moon },
              { value: "light" as const, label: t("themeLight"), Icon: Sun },
              { value: "auto"  as const, label: t("themeAuto"),  Icon: Monitor },
            ]).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  theme === value
                    ? "bg-[#6366f1] text-white border-[#6366f1]"
                    : "bg-[#141414] text-[#6b7280] hover:text-white border-[#2a2a2a] hover:border-[#3a3a3a]"
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t("labelLanguage")}>
          <div className="flex gap-2">
            {([
              { value: "pt" as const, label: t("langPT"), flag: "🇧🇷" },
              { value: "en" as const, label: t("langEN"), flag: "🇺🇸" },
            ]).map(({ value, label, flag }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  language === value
                    ? "bg-[#6366f1] text-white border-[#6366f1]"
                    : "bg-[#141414] text-[#6b7280] hover:text-white border-[#2a2a2a] hover:border-[#3a3a3a]"
                }`}
              >
                <span>{flag}</span> {label}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* ── CORPORAL ───────────────────────────────────────────────────────── */}
      <Section title={t("sectionBody")} icon={Scale}>
        <Field label={t("labelHeight")} hint={t("hintHeight")}>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={50} max={250} step={1}
              value={heightVal}
              onChange={(e) => setHeightVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveHeight()}
              className={`${inputClass} flex-1`}
              placeholder={t("heightPlaceholder")}
            />
            <span className="text-sm text-[#6b7280] flex-shrink-0">cm</span>
            <button
              onClick={saveHeight}
              disabled={!heightVal || parseFloat(heightVal) === height}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          {height > 0 && (
            <p className="text-xs text-[#4a4a4a]">Atual: <span className="text-white">{height} cm</span></p>
          )}
        </Field>

        <Field label="Peso atual" hint="Registra um novo ponto de peso no módulo Corporal">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={20} max={300} step={0.1}
              value={weightVal}
              onChange={(e) => setWeightVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveWeight()}
              className={`${inputClass} flex-1`}
              placeholder="Ex: 75.5"
            />
            <span className="text-sm text-[#6b7280] flex-shrink-0">kg</span>
            <button
              onClick={saveWeight}
              disabled={!weightVal}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          {latestWeight && (
            <p className="text-xs text-[#4a4a4a]">
              Último registro: <span className="text-white">{latestWeight} kg</span>
              {height > 0 && (
                <span className="ml-2 text-[#6366f1]">
                  · IMC {(latestWeight / ((height / 100) ** 2)).toFixed(1)}
                </span>
              )}
            </p>
          )}
        </Field>
      </Section>

      {/* ── NOTIFICAÇÕES ───────────────────────────────────────────────────── */}
      <Section title="Notificações" icon={Bell}>
        <Field label="Lembrete diário de hábitos" hint="Requer permissão do navegador / PWA instalado">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {notificationsEnabled
                ? <Bell size={16} className="text-[#22c55e]" />
                : <BellOff size={16} className="text-[#4a4a4a]" />
              }
              <span className="text-sm text-[#9ca3af]">
                {notificationsEnabled ? "Ativado" : "Desativado"}
              </span>
            </div>
            <button
              onClick={() => toggleNotifications(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                notificationsEnabled ? "bg-[#22c55e]" : "bg-[#2a2a2a]"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  notificationsEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Field>

        {notificationsEnabled && (
          <Field label="Horário do lembrete">
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={notifTimeVal}
                onChange={(e) => setNotifTimeVal(e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={saveNotifTime}
                disabled={notifTimeVal === notificationTime}
                className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                {t("save")}
              </button>
            </div>
            <p className="text-[11px] text-[#4a4a4a]">
              O lembrete aparece enquanto o app estiver aberto ou instalado como PWA
            </p>
          </Field>
        )}
      </Section>

      {/* ── DeFi / WALLET ──────────────────────────────────────────────────── */}
      <Section title={t("sectionWallet")} icon={Wallet}>
        <Field label={t("labelWalletAddress")} hint={t("hintWallet")}>
          <div className="flex gap-2">
            <input
              value={walletVal}
              onChange={(e) => setWalletVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveWallet()}
              className={`${inputClass} font-mono text-xs flex-1`}
              placeholder={t("walletPlaceholder")}
            />
            <button
              onClick={saveWallet}
              disabled={walletVal.trim() === walletAddress}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          {walletAddress && (
            <p className="text-[11px] text-[#4a4a4a] font-mono truncate">{walletAddress}</p>
          )}
        </Field>

        <Field label={t("labelZerionKey")} hint={t("hintZerionKey")}>
          <div className="flex gap-2">
            <input
              type="password"
              value={zerionVal}
              onChange={(e) => setZerionVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveZerion()}
              className={`${inputClass} font-mono text-xs flex-1`}
              placeholder="zk_dev_..."
            />
            <button
              onClick={saveZerion}
              disabled={zerionVal.trim() === zerionApiKey}
              className="px-3 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex-shrink-0"
            >
              {t("save")}
            </button>
          </div>
          <p className="text-[11px] text-[#4a4a4a]">
            Grátis em{" "}
            <a
              href="https://dashboard.zerion.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6366f1] hover:text-[#a78bfa] transition-colors"
            >
              dashboard.zerion.io
            </a>
            {" "}— 3.000 calls/dia
          </p>
          {zerionApiKey && (
            <p className="text-[11px] text-[#22c55e]">● Zerion API key configurada</p>
          )}
        </Field>
      </Section>

      {/* ── IMPORTAR / EXPORTAR ────────────────────────────────────────────── */}
      <Section title={t("sectionData")} icon={Download}>
        {/* Import */}
        <Field label={t("importCSV")}>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-[#3a3a3a] hover:border-[#6366f1] rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors group"
          >
            <Upload size={16} className="text-[#4a4a4a] group-hover:text-[#6366f1] transition-colors flex-shrink-0" />
            <span className="text-xs text-[#6b7280] group-hover:text-[#9ca3af] transition-colors truncate">
              {importFileName || t("chooseFile")}
            </span>
          </button>
          {importRows.length > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#22c55e]">{validCount} {t("valid")}</span>
                {invalidCount > 0 && <span className="text-[#ef4444]">{invalidCount} {t("invalid")}</span>}
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                {importRows.slice(0, 6).map((row, i) => (
                  <div key={i} className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                    row.valid ? "bg-[#22c55e]/8 text-[#9ca3af]" : "bg-[#ef4444]/8 text-[#ef4444]"
                  }`}>
                    {row.valid
                      ? <><span className="truncate">{row.date} · {row.description}</span><span className="flex-shrink-0 font-medium">{formatBRL(row.amount ?? 0)}</span></>
                      : <span className="truncate">{row.errors[0]}</span>
                    }
                  </div>
                ))}
              </div>
              <button
                onClick={doImport}
                disabled={validCount === 0}
                className="w-full py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t("importBtn")} {validCount} lançamentos
              </button>
            </div>
          )}
        </Field>

        <div className="border-t border-[#2a2a2a] pt-4 space-y-3">
          {/* Período selector (shared between CSV and PDF) */}
          <div className="flex flex-wrap gap-1.5">
            {(["month", "3months", "year", "all"] as const).map((r) => (
              <button key={r} onClick={() => setExportRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  exportRange === r ? "bg-[#6366f1] text-white border-[#6366f1]" : "bg-[#141414] text-[#6b7280] hover:text-white border-[#2a2a2a]"
                }`}
              >
                {r === "month" ? t("periodMonth") : r === "3months" ? t("period3Months") : r === "year" ? t("periodYear") : t("periodAll")}
              </button>
            ))}
          </div>

          {/* CSV Export */}
          <Field label={t("exportCSV")}>
            <button onClick={doExport}
              className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg text-xs text-white font-medium transition-colors cursor-pointer"
            >
              <Download size={13} className="text-[#6366f1]" />
              {t("exportBtn")}
            </button>
          </Field>

          {/* PDF Export */}
          <Field label="Exportar PDF">
            <button
              onClick={doExportPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#6366f1] rounded-lg text-xs text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileDown size={13} className={`text-[#6366f1] ${pdfLoading ? "animate-bounce" : ""}`} />
              {pdfLoading ? "Gerando PDF..." : "Exportar relatório PDF"}
            </button>
          </Field>
        </div>
      </Section>

      {/* ── ZONA DE PERIGO ─────────────────────────────────────────────────── */}
      <Section title={t("sectionDanger")} icon={Trash2}>
        <Field label={t("labelResetSettings")} hint={t("hintResetSettings")}>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ef4444]">{t("confirm")}</span>
              <button
                onClick={() => {
                  setDisplayName(""); setNameVal("");
                  setAvatarColor("#6366f1");
                  setBirthDate(""); setBirthVal("");
                  setWalletAddress(""); setWalletVal("");
                  setHeight(0); setHeightVal("");
                  setConfirmReset(false);
                  success(t("settingsReset"));
                }}
                className="text-xs px-2.5 py-1.5 bg-[#ef4444]/15 text-[#ef4444] rounded-lg cursor-pointer hover:bg-[#ef4444]/25 transition-colors"
              >
                {t("yesReset")}
              </button>
              <button onClick={() => setConfirmReset(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">
                {t("cancel")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-[#ef4444]/60 hover:text-[#ef4444] cursor-pointer transition-colors"
            >
              <Trash2 size={13} /> {t("reset")}
            </button>
          )}
        </Field>
      </Section>
    </div>
  );
}
