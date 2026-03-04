"use client";

import { useState, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useFinancasStore } from "@/store/financasStore";
import { useHabitosStore } from "@/store/habitosStore";
import { useNotasStore } from "@/store/notasStore";
import { useDefiStore } from "@/store/defiStore";
import { useCorporalStore } from "@/store/corporalStore";
import { useToast } from "@/hooks/useToast";
import {
  User, Palette, Wallet, Scale, Download, Upload,
  Sun, Moon, Monitor, ChevronRight, Check, Trash2, X,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Transaction, TransactionType, AnyCategory } from "@/types";
import { formatBRL } from "@/lib/format";

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#a78bfa", "#fb923c", "#ec4899",
];

function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
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

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2a2a]">
        <Icon size={14} className="text-[#6366f1]" />
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[36px]">
      <div className="min-w-0">
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="text-[11px] text-[#4a4a4a] mt-0.5">{hint}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── CSV helpers (importação de finanças) ─────────────────────────────────────

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
    height, setHeight,
    theme, setTheme,
  } = useSettingsStore();

  const { transactions, addTransaction } = useFinancasStore();
  const { success, error: toastError } = useToast();

  // Perfil edit state
  const [editName, setEditName] = useState(displayName);
  const [editingName, setEditingName] = useState(false);

  // Wallet edit
  const [editWallet, setEditWallet] = useState(walletAddress);
  const [editingWallet, setEditingWallet] = useState(false);

  // Height edit
  const [editHeight, setEditHeight] = useState(String(height || ""));
  const [editingHeight, setEditingHeight] = useState(false);

  // CSV import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importRows, setImportRows] = useState<{ valid: boolean; date?: string; description?: string; amount?: number; type?: TransactionType; category?: AnyCategory; raw: string; errors: string[] }[]>([]);
  const [importFileName, setImportFileName] = useState("");

  // Export state
  const [exportRange, setExportRange] = useState<"month" | "3months" | "year" | "all">("month");

  // Danger zone confirm
  const [confirmReset, setConfirmReset] = useState(false);

  // ── Profile save ──────────────────────────────────────────────────────────
  function saveName() {
    setDisplayName(editName);
    setEditingName(false);
    success("Nome atualizado!");
  }

  function saveWallet() {
    setWalletAddress(editWallet);
    setEditingWallet(false);
    success("Wallet atualizada!");
  }

  function saveHeight() {
    const h = parseFloat(editHeight);
    if (!isNaN(h) && h > 0) { setHeight(h); success("Altura salva!"); }
    setEditingHeight(false);
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

      const rows = lines.slice(startIdx).map((raw, idx) => {
        const cols = raw.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ""));
        const [dateRaw, typeRaw, categoryRaw, descRaw, amountRaw] = cols;
        const errors: string[] = [];

        const parsed = dateRaw ? parseISO(dateRaw) : null;
        const date = parsed && isValid(parsed) ? format(parsed, "yyyy-MM-dd") : undefined;
        if (!date) errors.push("data inválida");

        const type = TYPE_MAP[normalizeStr(typeRaw ?? "")];
        if (!type) errors.push(`tipo desconhecido: "${typeRaw}"`);

        const category = CATEGORY_MAP[normalizeStr(categoryRaw ?? "")];
        if (!category) errors.push(`categoria desconhecida: "${categoryRaw}"`);

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
    toImport.forEach((r) => {
      addTransaction({ type: r.type!, category: r.category!, description: r.description!, amount: r.amount!, date: r.date!, recurring: false });
    });
    success(`${toImport.length} lançamentos importados!`);
    setImportRows([]);
    setImportFileName("");
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  function doExport() {
    const now = new Date();
    const thisMonth = format(now, "yyyy-MM");
    const filtered = transactions.filter((t) => {
      if (exportRange === "month") return t.date.startsWith(thisMonth);
      if (exportRange === "3months") return (now.getTime() - new Date(t.date).getTime()) / 86400000 <= 92;
      if (exportRange === "year") return t.date.startsWith(format(now, "yyyy"));
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));

    if (filtered.length === 0) { toastError("Nenhuma transação no período."); return; }

    const header = "data,tipo,categoria,descricao,valor,recorrente";
    const lines = filtered.map((t) => {
      const tipo = t.type === "income" ? "receita" : "despesa";
      const cat = CATEGORY_LABEL[t.category] ?? t.category;
      return `${t.date},${tipo},${cat},"${t.description.replace(/"/g, '""')}",${t.amount.toFixed(2)},${t.recurring ? "sim" : ""}`;
    });

    const blob = new Blob(["\uFEFF" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segna-financas-${format(now, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success(`${filtered.length} lançamentos exportados!`);
  }

  const inputClass = "bg-[#141414] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#3a3a3a] outline-none focus:border-[#6366f1] transition-colors";

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Configurações</h1>
        <p className="text-sm text-[#6b7280]">Perfil, aparência e gerenciamento de dados</p>
      </div>

      {/* ── PERFIL ─────────────────────────────────────────────────────────── */}
      <Section title="Perfil" icon={User}>
        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <Avatar name={displayName || "?"} color={avatarColor} size={52} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{displayName || <span className="text-[#4a4a4a]">Sem nome</span>}</p>
            <p className="text-xs text-[#4a4a4a]">Seus dados ficam salvos localmente + nuvem</p>
          </div>
        </div>

        {/* Nome */}
        <Row label="Nome de exibição" hint="Aparece no perfil e boas-vindas">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                className={`${inputClass} w-40 text-xs`}
                placeholder="Seu nome"
              />
              <button onClick={saveName} className="text-[#22c55e] hover:text-[#16a34a] cursor-pointer"><Check size={15} /></button>
              <button onClick={() => setEditingName(false)} className="text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer"><X size={15} /></button>
            </div>
          ) : (
            <button
              onClick={() => { setEditName(displayName); setEditingName(true); }}
              className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#a78bfa] cursor-pointer transition-colors"
            >
              {displayName || "Definir nome"} <ChevronRight size={13} />
            </button>
          )}
        </Row>

        {/* Cor do avatar */}
        <Row label="Cor do avatar">
          <div className="flex items-center gap-1.5">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarColor(c)}
                className="w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
                style={{ background: c }}
              >
                {avatarColor === c && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ── APARÊNCIA ──────────────────────────────────────────────────────── */}
      <Section title="Aparência" icon={Palette}>
        <Row label="Tema" hint="Claro em breve — app usa tema escuro por padrão">
          <div className="flex items-center gap-1">
            {([
              { value: "dark",  label: "Escuro", Icon: Moon },
              { value: "light", label: "Claro",  Icon: Sun },
              { value: "auto",  label: "Auto",   Icon: Monitor },
            ] as const).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  theme === value
                    ? "bg-[#6366f1] text-white"
                    : "bg-[#141414] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* ── CORPORAL ───────────────────────────────────────────────────────── */}
      <Section title="Métricas Corporais" icon={Scale}>
        <Row label="Altura" hint="Usada para calcular o IMC na página Corporal">
          {editingHeight ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="number"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveHeight(); if (e.key === "Escape") setEditingHeight(false); }}
                className={`${inputClass} w-20 text-xs`}
                placeholder="cm"
              />
              <span className="text-xs text-[#6b7280]">cm</span>
              <button onClick={saveHeight} className="text-[#22c55e] hover:text-[#16a34a] cursor-pointer"><Check size={15} /></button>
              <button onClick={() => setEditingHeight(false)} className="text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer"><X size={15} /></button>
            </div>
          ) : (
            <button
              onClick={() => { setEditHeight(height > 0 ? String(height) : ""); setEditingHeight(true); }}
              className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#a78bfa] cursor-pointer transition-colors"
            >
              {height > 0 ? `${height} cm` : "Definir altura"} <ChevronRight size={13} />
            </button>
          )}
        </Row>
      </Section>

      {/* ── DeFi / WALLET ──────────────────────────────────────────────────── */}
      <Section title="DeFi / Wallet" icon={Wallet}>
        <Row label="Endereço EVM" hint="Usado para sincronizar pools de liquidez automaticamente">
          {editingWallet ? (
            <div className="flex flex-col gap-2 w-full">
              <input
                autoFocus
                value={editWallet}
                onChange={(e) => setEditWallet(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveWallet(); if (e.key === "Escape") setEditingWallet(false); }}
                className={`${inputClass} font-mono text-xs w-full`}
                placeholder="0x..."
              />
              <div className="flex gap-2">
                <button onClick={saveWallet} className="flex items-center gap-1 text-xs text-[#22c55e] hover:text-[#16a34a] cursor-pointer"><Check size={13} /> Salvar</button>
                <button onClick={() => setEditingWallet(false)} className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer">Cancelar</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setEditWallet(walletAddress); setEditingWallet(true); }}
              className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#a78bfa] cursor-pointer transition-colors max-w-[200px]"
            >
              <span className="font-mono truncate">
                {walletAddress || "Configurar wallet"}
              </span>
              <ChevronRight size={13} className="flex-shrink-0" />
            </button>
          )}
        </Row>
      </Section>

      {/* ── IMPORTAR / EXPORTAR ────────────────────────────────────────────── */}
      <Section title="Importar / Exportar Finanças" icon={Download}>
        {/* Import */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-[#9ca3af]">Importar CSV</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-[#3a3a3a] hover:border-[#6366f1] rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors group"
          >
            <Upload size={16} className="text-[#4a4a4a] group-hover:text-[#6366f1] transition-colors flex-shrink-0" />
            <span className="text-xs text-[#6b7280] group-hover:text-[#9ca3af] transition-colors">
              {importFileName || "Clique para selecionar arquivo CSV"}
            </span>
          </button>

          {importRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#22c55e]">{importRows.filter((r) => r.valid).length} válidos</span>
                {importRows.filter((r) => !r.valid).length > 0 && (
                  <span className="text-[#ef4444]">{importRows.filter((r) => !r.valid).length} inválidos</span>
                )}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {importRows.slice(0, 8).map((row, i) => (
                  <div key={i} className={`text-[11px] px-2 py-1 rounded flex items-center justify-between gap-2 ${
                    row.valid ? "bg-[#22c55e]/8 text-[#9ca3af]" : "bg-[#ef4444]/8 text-[#ef4444]"
                  }`}>
                    {row.valid ? (
                      <><span className="truncate">{row.date} · {row.description}</span><span className="font-medium flex-shrink-0">{formatBRL(row.amount ?? 0)}</span></>
                    ) : (
                      <span className="truncate">{row.errors[0]} — {row.raw.slice(0, 40)}</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={doImport}
                disabled={importRows.filter((r) => r.valid).length === 0}
                className="w-full py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Importar {importRows.filter((r) => r.valid).length} lançamentos
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-[#2a2a2a] pt-3 space-y-3">
          <p className="text-xs font-medium text-[#9ca3af]">Exportar CSV</p>
          <div className="flex flex-wrap gap-1.5">
            {(["month", "3months", "year", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setExportRange(r)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  exportRange === r ? "bg-[#6366f1] text-white" : "bg-[#141414] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                }`}
              >
                {r === "month" ? "Este mês" : r === "3months" ? "3 meses" : r === "year" ? "Este ano" : "Todos"}
              </button>
            ))}
          </div>
          <button
            onClick={doExport}
            className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg text-xs text-white font-medium transition-colors cursor-pointer"
          >
            <Download size={13} className="text-[#6366f1]" />
            Baixar CSV
          </button>
        </div>
      </Section>

      {/* ── ZONA DE PERIGO ─────────────────────────────────────────────────── */}
      <Section title="Zona de Perigo" icon={Trash2}>
        <Row label="Redefinir configurações" hint="Apaga nome, avatar, altura e wallet. Não afeta transações.">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#ef4444]">Confirmar?</span>
              <button
                onClick={() => {
                  setDisplayName("");
                  setAvatarColor("#6366f1");
                  setWalletAddress("");
                  setHeight(0);
                  setConfirmReset(false);
                  success("Configurações redefinidas.");
                }}
                className="text-xs px-2 py-1 bg-[#ef4444]/15 text-[#ef4444] rounded cursor-pointer hover:bg-[#ef4444]/25 transition-colors"
              >
                Sim, redefinir
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-xs text-[#4a4a4a] hover:text-[#6b7280] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-[#ef4444]/70 hover:text-[#ef4444] cursor-pointer transition-colors"
            >
              <Trash2 size={13} /> Redefinir
            </button>
          )}
        </Row>
      </Section>
    </div>
  );
}
