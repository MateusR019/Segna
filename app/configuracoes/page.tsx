"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useFinancasStore } from "@/store/financasStore";
import { useToast } from "@/hooks/useToast";
import { useT } from "@/lib/i18n";
import {
  User, Palette, Wallet, Scale, Download, Upload,
  Sun, Moon, Monitor, Check, Trash2,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
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
const CATEGORY_LABEL: Record<AnyCategory, string> = {
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
    walletAddress, setWalletAddress,
    zerionApiKey, setZerionApiKey,
    height, setHeight,
    theme, setTheme,
    language, setLanguage,
  } = useSettingsStore();

  const { transactions, addTransaction } = useFinancasStore();
  const { success, error: toastError } = useToast();
  const t = useT(language);

  // Form state — campos diretos, sem click-to-edit
  const [nameVal, setNameVal]       = useState(displayName);
  const [heightVal, setHeightVal]   = useState(height > 0 ? String(height) : "");
  const [walletVal, setWalletVal]   = useState(walletAddress);
  const [zerionVal, setZerionVal]   = useState(zerionApiKey);

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

  // Danger zone
  const [confirmReset, setConfirmReset] = useState(false);

  const inputClass = "w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#6366f1] transition-colors";

  // ── Saves ─────────────────────────────────────────────────────────────────
  function saveName() {
    if (!nameVal.trim()) return;
    setDisplayName(nameVal);
    success(t("nameUpdated"));
  }

  function saveHeight() {
    const h = parseFloat(heightVal);
    if (!isNaN(h) && h > 0) { setHeight(h); success(t("heightSaved")); }
  }

  function saveWallet() {
    setWalletAddress(walletVal);
    success(t("walletSaved"));
  }

  function saveZerion() {
    setZerionApiKey(zerionVal);
    success(t("saved"));
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
    const filtered = transactions.filter((t) => {
      if (exportRange === "month") return t.date.startsWith(format(now, "yyyy-MM"));
      if (exportRange === "3months") return (now.getTime() - new Date(t.date).getTime()) / 86400000 <= 92;
      if (exportRange === "year") return t.date.startsWith(format(now, "yyyy"));
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

  const validCount = importRows.filter((r) => r.valid).length;
  const invalidCount = importRows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-5 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">{t("settingsTitle")}</h1>
        <p className="text-sm text-[#6b7280]">{t("settingsDesc")}</p>
      </div>

      {/* ── PERFIL ─────────────────────────────────────────────────────────── */}
      <Section title={t("sectionProfile")} icon={User}>
        {/* Avatar preview */}
        <div className="flex items-center gap-4 pb-1">
          <Avatar name={nameVal || displayName || "?"} color={avatarColor} size={52} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName || <span className="text-[#4a4a4a] font-normal">—</span>}</p>
            <p className="text-[11px] text-[#4a4a4a]">Segna Personal OS</p>
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
            {" "}— 300 calls/dia
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
          <Field label={t("exportCSV")}>
            <div className="flex flex-wrap gap-1.5 mb-2">
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
            <button onClick={doExport}
              className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg text-xs text-white font-medium transition-colors cursor-pointer"
            >
              <Download size={13} className="text-[#6366f1]" />
              {t("exportBtn")}
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
