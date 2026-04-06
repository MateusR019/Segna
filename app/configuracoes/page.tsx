"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore, calcStreak } from "@/store/habitosStore";
import { useCorporalStore } from "@/store/corporalStore";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Palette, Scale, Download, Upload,
  Sun, Moon, Monitor, Check, Trash2, Cake, Bell,
  Target, FileDown, LogOut, ChevronDown,
  Pencil, Globe, Clock, Wallet, Key,
} from "lucide-react";
import { format, parseISO, isValid, differenceInYears, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TransactionType, AnyCategory } from "@/types";
import { formatBRL } from "@/lib/format";

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

// ─── UI Building blocks ───────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-widest px-1 pt-1">
      {children}
    </p>
  );
}

function SettingCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden divide-y divide-[#1f1f1f]">
      {children}
    </div>
  );
}

function Row({
  icon: Icon, color = "#6366f1", title, subtitle, end, onClick, danger = false,
}: {
  icon: React.ElementType; color?: string; title: string; subtitle?: string;
  end?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? "cursor-pointer hover:bg-[#1f1f1f] active:bg-[#242424] transition-colors" : ""}`}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: (danger ? "#ef4444" : color) + "20" }}
      >
        <Icon size={15} style={{ color: danger ? "#ef4444" : color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-tight ${danger ? "text-[#ef4444]" : "text-white"}`}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-[#4a4a4a] mt-0.5 leading-tight">{subtitle}</p>
        )}
      </div>
      {end !== undefined && (
        <div className="flex-shrink-0 flex items-center gap-2">{end}</div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        value ? "bg-[#6366f1]" : "bg-[#2a2a2a]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Chips<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-[#141414] rounded-xl p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            value === opt.value ? "bg-[#6366f1] text-white shadow-sm" : "text-[#6b7280] hover:text-white"
          }`}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function InlineInput({
  value, onChange, onSave, placeholder, type = "text", unit, min, max, step, mono = false,
}: {
  value: string; onChange: (v: string) => void; onSave: () => void;
  placeholder?: string; type?: string; unit?: string; min?: number; max?: number; step?: number; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type={type} value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={(e) => e.key === "Enter" && onSave()}
        placeholder={placeholder}
        className={`w-28 bg-[#141414] border border-[#2a2a2a] focus:border-[#6366f1] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#3a3a3a] outline-none transition-colors ${mono ? "font-mono" : ""}`}
      />
      {unit && <span className="text-xs text-[#4a4a4a]">{unit}</span>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const router = useRouter();

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

  // Profile editing
  const [editingName, setEditingName]   = useState(false);
  const [nameVal, setNameVal]           = useState(displayName);

  // Fields
  const [heightVal, setHeightVal]       = useState(height > 0 ? String(height) : "");
  const [birthVal, setBirthVal]         = useState(birthDate);
  const [walletVal, setWalletVal]       = useState(walletAddress);
  const [zerionVal, setZerionVal]       = useState(zerionApiKey);
  const [weightVal, setWeightVal]       = useState("");
  const [savingsVal, setSavingsVal]     = useState(savingsGoal ? String(savingsGoal.targetAmount) : "");
  const [notifTimeVal, setNotifTimeVal] = useState(notificationTime);

  // Data section
  const fileRef                                = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport]            = useState(false);
  const [showExport, setShowExport]            = useState(false);
  const [importRows, setImportRows]            = useState<{
    valid: boolean; date?: string; description?: string;
    amount?: number; type?: TransactionType; category?: AnyCategory;
    raw: string; errors: string[];
  }[]>([]);
  const [importFileName, setImportFileName]    = useState("");
  const [exportRange, setExportRange]          = useState<"month" | "3months" | "year" | "all">("month");
  const [pdfLoading, setPdfLoading]            = useState(false);
  const [confirmReset, setConfirmReset]        = useState(false);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const diasDeUso      = joinedAt ? Math.max(0, differenceInDays(new Date(), parseISO(joinedAt))) : 0;
  const habitosAtivos  = habits.filter((h) => !h.paused).length;
  const thisMonth      = format(new Date(), "yyyy-MM");
  const transacoesMes  = transactions.filter((tx) => tx.date.startsWith(thisMonth)).length;
  const melhorStreak   = habits.reduce((max, h) => Math.max(max, calcStreak(h.id, completions)), 0);
  const parsedBirth    = birthDate && isValid(parseISO(birthDate)) ? parseISO(birthDate) : null;
  const age            = parsedBirth ? differenceInYears(new Date(), parsedBirth) : null;
  const latestWeight   = bodyMetrics.find((m) => m.weight != null)?.weight ?? null;

  // ── Saves ─────────────────────────────────────────────────────────────────────
  function saveName() {
    if (!nameVal.trim()) { setNameVal(displayName); setEditingName(false); return; }
    setDisplayName(nameVal);
    setEditingName(false);
    success(t("nameUpdated"));
  }
  function saveBirth() {
    if (!birthVal || birthVal === birthDate) return;
    setBirthDate(birthVal);
    success("Aniversário salvo!");
  }
  function saveHeight() {
    const h = parseFloat(heightVal);
    if (!isNaN(h) && h > 0 && h !== height) { setHeight(h); success(t("heightSaved")); }
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
    if (walletVal.trim() === walletAddress) return;
    setWalletAddress(walletVal);
    success(t("walletSaved"));
  }
  function saveZerion() {
    if (zerionVal.trim() === zerionApiKey) return;
    setZerionApiKey(zerionVal);
    success(t("saved"));
  }
  function saveNotifTime() {
    if (notifTimeVal === notificationTime) return;
    setNotificationTime(notifTimeVal);
    success("Horário salvo!");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function toggleNotifications(enable: boolean) {
    if (enable) {
      if (!("Notification" in window)) { toastError("Notificações não suportadas."); return; }
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotificationsEnabled(true);
        new Notification("Segna", { body: `Lembretes ativados às ${notificationTime} 🔔`, icon: "/icon-192.png" });
        success("Notificações ativadas!");
      } else { toastError("Permissão negada."); }
    } else { setNotificationsEnabled(false); success("Notificações desativadas."); }
  }

  // ── CSV Import ────────────────────────────────────────────────────────────────
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
    setImportRows([]); setImportFileName(""); setShowImport(false);
  }

  // ── CSV / PDF Export ──────────────────────────────────────────────────────────
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
  async function doExportPDF() {
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const now = new Date();
      const monthKey   = format(now, "yyyy-MM");
      const monthLabel = format(parseISO(monthKey + "-01"), "MMMM yyyy", { locale: ptBR });
      const filtered = transactions.filter((tx) => {
        if (exportRange === "month") return tx.date.startsWith(monthKey);
        if (exportRange === "3months") return (now.getTime() - new Date(tx.date).getTime()) / 86400000 <= 92;
        if (exportRange === "year") return tx.date.startsWith(format(now, "yyyy"));
        return true;
      }).sort((a, b) => a.date.localeCompare(b.date));
      if (filtered.length === 0) { toastError("Nenhuma transação no período."); setPdfLoading(false); return; }
      const income   = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const balance  = income - expenses;
      const pdf  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      let y = 18;
      pdf.setFillColor(99, 102, 241); pdf.rect(0, 0, pageW, 12, "F");
      pdf.setFontSize(11); pdf.setTextColor(255, 255, 255);
      pdf.text("Segna — Relatório Financeiro", 14, 8.5);
      pdf.text(format(now, "dd/MM/yyyy"), pageW - 14, 8.5, { align: "right" });
      y = 22; pdf.setFontSize(16); pdf.setTextColor(30, 30, 30);
      pdf.text(`Finanças — ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`, 14, y);
      if (displayName) { y += 6; pdf.setFontSize(9); pdf.setTextColor(100, 100, 100); pdf.text(`Usuário: ${displayName}`, 14, y); }
      y += 10;
      const boxW = (pageW - 28 - 8) / 3;
      ([
        { label: "Receitas", value: formatBRL(income), color: [34, 197, 94] as [number,number,number] },
        { label: "Despesas", value: formatBRL(expenses), color: [239, 68, 68] as [number,number,number] },
        { label: "Saldo", value: formatBRL(balance), color: balance >= 0 ? [99,102,241] as [number,number,number] : [249,115,22] as [number,number,number] },
      ]).forEach(({ label, value, color }, i) => {
        const x = 14 + i * (boxW + 4);
        pdf.setFillColor(245, 245, 250); pdf.roundedRect(x, y, boxW, 16, 2, 2, "F");
        pdf.setFontSize(8); pdf.setTextColor(120, 120, 120); pdf.text(label, x + boxW / 2, y + 5, { align: "center" });
        pdf.setFontSize(11); pdf.setTextColor(...color); pdf.text(value, x + boxW / 2, y + 12, { align: "center" });
      });
      y += 24; pdf.setFontSize(10); pdf.setTextColor(30, 30, 30); pdf.text(`Lançamentos (${filtered.length})`, 14, y); y += 4;
      pdf.setFillColor(240, 240, 248); pdf.rect(14, y, pageW - 28, 7, "F");
      pdf.setFontSize(7.5); pdf.setTextColor(80, 80, 80);
      pdf.text("Data", 18, y + 4.8); pdf.text("Descrição", 40, y + 4.8); pdf.text("Categoria", 115, y + 4.8); pdf.text("Valor", pageW - 18, y + 4.8, { align: "right" });
      y += 7; pdf.setFontSize(7.5);
      filtered.forEach((tx) => {
        if (y > 270) { pdf.addPage(); y = 14; }
        pdf.setTextColor(60, 60, 60);
        pdf.text(tx.date, 18, y + 4); pdf.text(tx.description.slice(0, 35), 40, y + 4); pdf.text(CATEGORY_LABEL[tx.category] ?? tx.category, 115, y + 4);
        pdf.setTextColor(...(tx.type === "income" ? [34,197,94] as [number,number,number] : [239,68,68] as [number,number,number]));
        pdf.text(`${tx.type === "income" ? "+" : "-"}${formatBRL(tx.amount)}`, pageW - 18, y + 4, { align: "right" });
        pdf.setDrawColor(230, 230, 230); pdf.line(14, y + 6.5, pageW - 14, y + 6.5); y += 7;
      });
      const rangeLabel = exportRange === "month" ? monthKey : exportRange === "year" ? format(now, "yyyy") : exportRange;
      pdf.save(`segna-financas-${rangeLabel}.pdf`);
      success("PDF exportado!");
    } catch (err) { console.error(err); toastError("Erro ao gerar PDF."); }
    finally { setPdfLoading(false); }
  }

  const validCount   = importRows.filter((r) => r.valid).length;
  const invalidCount = importRows.filter((r) => !r.valid).length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 max-w-lg pb-10">

      {/* ── PROFILE CARD ──────────────────────────────────────────────────────── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="relative group">
            <Avatar name={nameVal || displayName || "?"} color={avatarColor} size={68} />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={() => setEditingName(true)}>
              <Pencil size={14} className="text-white" />
            </div>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setNameVal(displayName); setEditingName(false); } }}
                className="w-full bg-[#141414] border border-[#6366f1] rounded-xl px-3 py-2 text-sm text-white outline-none"
                placeholder="Seu nome"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="flex items-center gap-2 group cursor-pointer text-left w-full"
              >
                <span className="text-base font-semibold text-white group-hover:text-[#a78bfa] transition-colors truncate">
                  {displayName || <span className="text-[#4a4a4a] font-normal text-sm">Adicionar nome</span>}
                </span>
                <Pencil size={11} className="text-[#4a4a4a] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            )}
            <p className="text-xs text-[#4a4a4a] mt-0.5">
              {age !== null ? `${age} anos · ` : ""}Segna Personal OS
            </p>
            {diasDeUso > 0 && (
              <p className="text-[11px] text-[#6366f1] mt-0.5">
                {diasDeUso} dia{diasDeUso !== 1 ? "s" : ""} de jornada
              </p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 pt-3.5 border-t border-[#1f1f1f]">
          {[
            { label: "Dias", value: diasDeUso,     color: "#6366f1" },
            { label: "Hábitos", value: habitosAtivos, color: "#22c55e" },
            { label: "Streak",  value: melhorStreak,  color: "#f59e0b" },
            { label: "Trans.",  value: transacoesMes, color: "#06b6d4" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span className="text-lg font-bold text-white leading-none">{value}</span>
              <span className="text-[10px] leading-tight" style={{ color }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTA ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Conta</SectionLabel>
        <SettingCard>
          {/* Aniversário */}
          <Row
            icon={Cake}
            color="#f59e0b"
            title="Aniversário"
            subtitle={age !== null ? `${age} anos · ${format(parsedBirth!, "d 'de' MMMM", { locale: ptBR })}` : "Não definido"}
            end={
              <input
                type="date"
                value={birthVal}
                onChange={(e) => { setBirthVal(e.target.value); }}
                onBlur={saveBirth}
                className="bg-transparent text-xs text-[#6b7280] outline-none cursor-pointer w-[1px] opacity-0 absolute"
                id="birth-input"
              />
            }
            onClick={() => (document.getElementById("birth-input") as HTMLInputElement | null)?.showPicker?.()}
          />

          {/* Cor do avatar */}
          <Row
            icon={Palette}
            color="#a78bfa"
            title="Cor do avatar"
            end={
              <div className="flex items-center gap-1.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={(e) => { e.stopPropagation(); setAvatarColor(c); }}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center flex-shrink-0"
                    style={{ background: c, outline: avatarColor === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }}
                  >
                    {avatarColor === c && <Check size={9} className="text-white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            }
          />

          {/* Logout */}
          <Row
            icon={LogOut}
            title="Sair da conta"
            danger
            onClick={handleLogout}
          />
        </SettingCard>
      </div>

      {/* ── APARÊNCIA ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Aparência</SectionLabel>
        <SettingCard>
          <Row
            icon={Moon}
            color="#6366f1"
            title={t("labelTheme")}
            subtitle={t("hintTheme")}
            end={
              <Chips
                options={[
                  { value: "dark"  as const, label: "Escuro", icon: <Moon size={10} /> },
                  { value: "light" as const, label: "Claro",  icon: <Sun size={10} /> },
                  { value: "auto"  as const, label: "Auto",   icon: <Monitor size={10} /> },
                ]}
                value={theme}
                onChange={setTheme}
              />
            }
          />
          <Row
            icon={Globe}
            color="#06b6d4"
            title={t("labelLanguage")}
            end={
              <Chips
                options={[
                  { value: "pt" as const, label: "PT-BR", icon: "🇧🇷" },
                  { value: "en" as const, label: "EN",    icon: "🇺🇸" },
                ]}
                value={language}
                onChange={setLanguage}
              />
            }
          />
        </SettingCard>
      </div>

      {/* ── SAÚDE & METAS ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Saúde & Metas</SectionLabel>
        <SettingCard>
          {/* Altura */}
          <Row
            icon={Scale}
            color="#22c55e"
            title={t("labelHeight")}
            subtitle={height > 0 ? `${height} cm` : t("hintHeight")}
            end={
              <InlineInput
                type="number" min={50} max={250} step={1}
                value={heightVal}
                onChange={setHeightVal}
                onSave={saveHeight}
                placeholder="175"
                unit="cm"
              />
            }
          />

          {/* Peso */}
          <Row
            icon={Scale}
            color="#f59e0b"
            title="Registrar peso"
            subtitle={latestWeight ? `Último: ${latestWeight} kg${height > 0 ? ` · IMC ${(latestWeight / ((height / 100) ** 2)).toFixed(1)}` : ""}` : "Nenhum registro ainda"}
            end={
              <div className="flex items-center gap-1.5">
                <InlineInput
                  type="number" min={20} max={300} step={0.1}
                  value={weightVal}
                  onChange={setWeightVal}
                  onSave={() => {}}
                  placeholder="75.0"
                  unit="kg"
                />
                <button
                  onClick={saveWeight}
                  disabled={!weightVal}
                  className="px-2.5 py-1.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            }
          />

          {/* Meta de economia */}
          <Row
            icon={Target}
            color="#6366f1"
            title="Meta de economia"
            subtitle={savingsGoal ? `Meta: ${formatBRL(savingsGoal.targetAmount)}/mês` : "Quanto quer guardar por mês"}
            end={
              <div className="flex items-center gap-1.5">
                <InlineInput
                  type="number" min={0}
                  value={savingsVal}
                  onChange={setSavingsVal}
                  onSave={saveSavingsGoal}
                  placeholder="500"
                  unit="R$"
                />
                <button
                  onClick={saveSavingsGoal}
                  disabled={savingsVal === (savingsGoal ? String(savingsGoal.targetAmount) : "")}
                  className="px-2.5 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-30 disabled:cursor-not-allowed text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <Check size={12} />
                </button>
              </div>
            }
          />
        </SettingCard>
      </div>

      {/* ── NOTIFICAÇÕES ──────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Notificações</SectionLabel>
        <SettingCard>
          <Row
            icon={Bell}
            color="#22c55e"
            title="Lembrete diário de hábitos"
            subtitle="Requer permissão do navegador / PWA instalado"
            end={<Toggle value={notificationsEnabled} onChange={toggleNotifications} />}
          />
          {notificationsEnabled && (
            <Row
              icon={Clock}
              color="#6366f1"
              title="Horário do lembrete"
              end={
                <InlineInput
                  type="time"
                  value={notifTimeVal}
                  onChange={setNotifTimeVal}
                  onSave={saveNotifTime}
                />
              }
            />
          )}
        </SettingCard>
      </div>

      {/* ── INTEGRAÇÕES ──────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Integrações</SectionLabel>
        <SettingCard>
          {/* Wallet */}
          <div className="px-4 py-3.5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#06b6d420" }}>
                <Wallet size={15} style={{ color: "#06b6d4" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-tight">{t("labelWalletAddress")}</p>
                <p className="text-xs text-[#4a4a4a] mt-0.5 leading-tight">{t("hintWallet")}</p>
              </div>
            </div>
            <input
              value={walletVal}
              onChange={(e) => setWalletVal(e.target.value)}
              onBlur={saveWallet}
              onKeyDown={(e) => e.key === "Enter" && saveWallet()}
              className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#6366f1] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#3a3a3a] outline-none transition-colors font-mono"
              placeholder={t("walletPlaceholder")}
            />
            {walletAddress && (
              <p className="text-[10px] text-[#4a4a4a] font-mono truncate">{walletAddress}</p>
            )}
          </div>

          <div className="border-t border-[#1f1f1f]" />

          {/* Zerion */}
          <div className="px-4 py-3.5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#a78bfa20" }}>
                <Key size={15} style={{ color: "#a78bfa" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-tight">{t("labelZerionKey")}</p>
                <p className="text-xs text-[#4a4a4a] mt-0.5 leading-tight">
                  Grátis em{" "}
                  <a href="https://dashboard.zerion.io" target="_blank" rel="noopener noreferrer" className="text-[#6366f1] hover:text-[#a78bfa] transition-colors">
                    dashboard.zerion.io
                  </a>{" "}— 3.000 calls/dia
                </p>
              </div>
              {zerionApiKey && <span className="text-[10px] text-[#22c55e] flex-shrink-0">● Ativo</span>}
            </div>
            <input
              type="password"
              value={zerionVal}
              onChange={(e) => setZerionVal(e.target.value)}
              onBlur={saveZerion}
              onKeyDown={(e) => e.key === "Enter" && saveZerion()}
              className="w-full bg-[#141414] border border-[#2a2a2a] focus:border-[#6366f1] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#3a3a3a] outline-none transition-colors font-mono"
              placeholder="zk_dev_..."
            />
          </div>
        </SettingCard>
      </div>

      {/* ── DADOS ─────────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Dados</SectionLabel>
        <SettingCard>

          {/* Importar CSV */}
          <Row
            icon={Upload}
            color="#22c55e"
            title="Importar CSV"
            subtitle="Transações em formato Segna ou genérico"
            onClick={() => setShowImport((v) => !v)}
            end={<ChevronDown size={14} className={`text-[#4a4a4a] transition-transform ${showImport ? "rotate-180" : ""}`} />}
          />
          {showImport && (
            <div className="px-4 pb-4 space-y-3">
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-[#3a3a3a] hover:border-[#6366f1] rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors group"
              >
                <Upload size={14} className="text-[#4a4a4a] group-hover:text-[#6366f1] transition-colors flex-shrink-0" />
                <span className="text-xs text-[#6b7280] group-hover:text-[#9ca3af] transition-colors truncate">
                  {importFileName || t("chooseFile")}
                </span>
              </button>
              {importRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#22c55e]">{validCount} válidos</span>
                    {invalidCount > 0 && <span className="text-[#ef4444]">{invalidCount} inválidos</span>}
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {importRows.slice(0, 5).map((row, i) => (
                      <div key={i} className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                        row.valid ? "bg-[#22c55e]/8 text-[#9ca3af]" : "bg-[#ef4444]/8 text-[#ef4444]"
                      }`}>
                        {row.valid
                          ? <><span className="truncate">{row.date} · {row.description}</span><span className="flex-shrink-0">{formatBRL(row.amount ?? 0)}</span></>
                          : <span className="truncate">{row.errors[0]}</span>
                        }
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={doImport}
                    disabled={validCount === 0}
                    className="w-full py-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Importar {validCount} lançamentos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Exportar */}
          <Row
            icon={Download}
            color="#6366f1"
            title="Exportar transações"
            subtitle="CSV ou PDF com período selecionado"
            onClick={() => setShowExport((v) => !v)}
            end={<ChevronDown size={14} className={`text-[#4a4a4a] transition-transform ${showExport ? "rotate-180" : ""}`} />}
          />
          {showExport && (
            <div className="px-4 pb-4 space-y-3">
              {/* Period selector */}
              <div className="flex gap-1.5 flex-wrap">
                {(["month", "3months", "year", "all"] as const).map((r) => (
                  <button key={r} onClick={() => setExportRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      exportRange === r ? "bg-[#6366f1] text-white border-[#6366f1]" : "bg-[#141414] text-[#6b7280] hover:text-white border-[#2a2a2a]"
                    }`}
                  >
                    {r === "month" ? "Este mês" : r === "3months" ? "3 meses" : r === "year" ? "Este ano" : "Tudo"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={doExport}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#6366f1] rounded-xl text-xs text-white font-medium transition-colors cursor-pointer"
                >
                  <Download size={12} className="text-[#6366f1]" /> CSV
                </button>
                <button onClick={doExportPDF} disabled={pdfLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#6366f1] rounded-xl text-xs text-white font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileDown size={12} className={`text-[#6366f1] ${pdfLoading ? "animate-bounce" : ""}`} />
                  {pdfLoading ? "Gerando..." : "PDF"}
                </button>
              </div>
            </div>
          )}
        </SettingCard>
      </div>

      {/* ── ZONA DE PERIGO ────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <SectionLabel>Zona de perigo</SectionLabel>
        <SettingCard>
          {confirmReset ? (
            <div className="px-4 py-3.5 flex items-center gap-3">
              <p className="text-xs text-[#ef4444] flex-1">Tem certeza? Isso apaga nome, avatar e configurações.</p>
              <button
                onClick={() => {
                  setDisplayName(""); setNameVal(""); setAvatarColor("#6366f1");
                  setBirthDate(""); setBirthVal(""); setWalletAddress(""); setWalletVal("");
                  setHeight(0); setHeightVal(""); setConfirmReset(false);
                  success(t("settingsReset"));
                }}
                className="text-xs px-3 py-1.5 bg-[#ef4444]/15 text-[#ef4444] rounded-lg cursor-pointer hover:bg-[#ef4444]/25 transition-colors"
              >
                Confirmar
              </button>
              <button onClick={() => setConfirmReset(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">
                Cancelar
              </button>
            </div>
          ) : (
            <Row
              icon={Trash2}
              title={t("labelResetSettings")}
              subtitle={t("hintResetSettings")}
              danger
              onClick={() => setConfirmReset(true)}
            />
          )}
        </SettingCard>
      </div>

    </div>
  );
}
