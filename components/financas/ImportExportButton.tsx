"use client";
import { useRef, useState } from "react";
import { useFinancasStore } from "@/store/financasStore";
import { useToast } from "@/hooks/useToast";
import { Transaction, TransactionType, AnyCategory } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Download, CheckCircle2, XCircle, AlertCircle, FileText, Copy,
} from "lucide-react";
import { formatBRL } from "@/lib/format";
import { format, isValid, parseISO } from "date-fns";

// ─── Category maps ─────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, AnyCategory> = {
  // Despesas
  moradia: "housing", habitação: "housing", habitacao: "housing", housing: "housing",
  aluguel: "housing", casa: "housing",
  alimentação: "food", alimentacao: "food", comida: "food", food: "food",
  mercado: "food", supermercado: "food", restaurante: "food",
  transporte: "transport", transport: "transport", uber: "transport",
  combustível: "transport", combustivel: "transport", gasolina: "transport",
  saúde: "health", saude: "health", health: "health",
  médico: "health", medico: "health", farmácia: "health", farmacia: "health",
  lazer: "entertainment", entretenimento: "entertainment", entertainment: "entertainment",
  academia: "entertainment", netflix: "entertainment", spotify: "entertainment",
  educação: "education", educacao: "education", education: "education",
  curso: "education", livro: "education",
  compras: "shopping", shopping: "shopping", roupa: "shopping", roupas: "shopping",
  investimentos: "investments", investments: "investments", aporte: "investments",
  outro: "other", outros: "other", other: "other", geral: "other",
  // Receitas
  salário: "salary", salario: "salary", salary: "salary",
  freelance: "freelance", freela: "freelance", autônomo: "freelance", autonomo: "freelance",
  retorno: "investment_return", dividendos: "investment_return",
  investment_return: "investment_return", rendimento: "investment_return",
  presente: "gift", gift: "gift", doação: "gift", doacao: "gift",
  outra_renda: "other_income", other_income: "other_income", outras_receitas: "other_income",
  renda: "other_income",
};

const TYPE_MAP: Record<string, TransactionType> = {
  despesa: "expense", saída: "expense", saida: "expense", expense: "expense", débito: "expense", debito: "expense",
  receita: "income", entrada: "income", income: "income", crédito: "income", credito: "income",
};

// PT labels for export
const CATEGORY_LABEL: Record<AnyCategory, string> = {
  housing: "moradia", food: "alimentacao", transport: "transporte", health: "saude",
  entertainment: "lazer", education: "educacao", shopping: "compras",
  investments: "investimentos", other: "outro",
  salary: "salario", freelance: "freelance", investment_return: "retorno",
  gift: "presente", other_income: "outra_renda",
};

// ─── CSV parsing ───────────────────────────────────────────────────────────
interface ParsedRow {
  raw: string;
  line: number;
  date?: string;
  type?: TransactionType;
  category?: AnyCategory;
  description?: string;
  amount?: number;
  recurring?: boolean;
  errors: string[];
  valid: boolean;
}

function normalizeStr(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const results: ParsedRow[] = [];

  // Detect delimiter
  const firstLine = lines[0] ?? "";
  const delim = firstLine.includes(";") ? ";" : ",";

  // Skip header row (if it starts with "data", "date", etc.)
  const startIdx =
    normalizeStr(firstLine.split(delim)[0]) === "data" ||
    normalizeStr(firstLine.split(delim)[0]) === "date"
      ? 1
      : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    const cols = raw.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const [dateRaw, typeRaw, categoryRaw, descRaw, amountRaw, recurringRaw] = cols;

    const row: ParsedRow = { raw, line: i + 1, errors: [], valid: false };

    // date
    if (!dateRaw) {
      row.errors.push("data ausente");
    } else {
      const parsed = parseISO(dateRaw);
      if (!isValid(parsed)) {
        row.errors.push(`data inválida: "${dateRaw}" (use AAAA-MM-DD)`);
      } else {
        row.date = format(parsed, "yyyy-MM-dd");
      }
    }

    // type
    const typeKey = normalizeStr(typeRaw ?? "");
    const type = TYPE_MAP[typeKey];
    if (!type) {
      row.errors.push(`tipo inválido: "${typeRaw}" (use: despesa, receita)`);
    } else {
      row.type = type;
    }

    // category
    const catKey = normalizeStr(categoryRaw ?? "");
    const category = CATEGORY_MAP[catKey];
    if (!category) {
      row.errors.push(`categoria desconhecida: "${categoryRaw}"`);
    } else {
      row.category = category;
    }

    // description
    if (!descRaw?.trim()) {
      row.errors.push("descrição ausente");
    } else {
      row.description = descRaw.trim();
    }

    // amount
    const amountStr = (amountRaw ?? "").replace("R$", "").replace(/\s/g, "").replace(",", ".");
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      row.errors.push(`valor inválido: "${amountRaw}" (use número positivo)`);
    } else {
      row.amount = amount;
    }

    // recurring (optional)
    const rec = normalizeStr(recurringRaw ?? "");
    row.recurring = rec === "sim" || rec === "yes" || rec === "true" || rec === "1";

    row.valid = row.errors.length === 0;
    results.push(row);
  }

  return results;
}

// ─── Sample CSV ────────────────────────────────────────────────────────────
const SAMPLE_CSV = `data,tipo,categoria,descricao,valor,recorrente
2026-02-01,despesa,moradia,Aluguel,2500.00,sim
2026-02-05,receita,salario,Pagamento mensal,5000.00,sim
2026-02-10,despesa,alimentacao,Supermercado,350.00,
2026-02-15,despesa,lazer,Netflix,55.90,sim`;

// ─── Component ─────────────────────────────────────────────────────────────
export function ImportExportButton() {
  const { transactions, addTransaction } = useFinancasStore();
  const { success, error: toastError } = useToast();

  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Import state
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [skipDupes, setSkipDupes] = useState(true);

  // Export state
  const [exportRange, setExportRange] = useState<"month" | "3months" | "year" | "all">("month");
  const [exportType, setExportType] = useState<"all" | "income" | "expense">("all");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
    };
    reader.readAsText(file, "UTF-8");
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  function isDuplicate(row: ParsedRow): boolean {
    return transactions.some(
      (t) =>
        t.date === row.date &&
        t.description === row.description &&
        t.amount === row.amount &&
        t.type === row.type
    );
  }

  function handleImport() {
    const valid = rows.filter((r) => r.valid);
    const toImport = skipDupes ? valid.filter((r) => !isDuplicate(r)) : valid;

    if (toImport.length === 0) {
      toastError("Nenhum lançamento novo para importar.");
      return;
    }

    toImport.forEach((r) => {
      addTransaction({
        type: r.type!,
        category: r.category!,
        description: r.description!,
        amount: r.amount!,
        date: r.date!,
        recurring: r.recurring ?? false,
      });
    });

    success(`${toImport.length} ${toImport.length === 1 ? "lançamento importado" : "lançamentos importados"}!`);
    setRows([]);
    setFileName("");
    setOpen(false);
  }

  // ── Export ──────────────────────────────────────────────────────────────
  function getExportRows(): Transaction[] {
    const now = new Date();
    const thisMonth = format(now, "yyyy-MM");
    const filtered = transactions.filter((t) => {
      if (exportType !== "all" && t.type !== exportType) return false;
      if (exportRange === "month") return t.date.startsWith(thisMonth);
      if (exportRange === "3months") {
        const d = parseISO(t.date);
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 92;
      }
      if (exportRange === "year") return t.date.startsWith(format(now, "yyyy"));
      return true;
    });
    return filtered.sort((a, b) => a.date.localeCompare(b.date));
  }

  function handleExport() {
    const exportRows = getExportRows();
    if (exportRows.length === 0) {
      toastError("Nenhuma transação no período selecionado.");
      return;
    }
    const header = "data,tipo,categoria,descricao,valor,recorrente";
    const csvLines = exportRows.map((t) => {
      const tipo = t.type === "income" ? "receita" : "despesa";
      const cat = CATEGORY_LABEL[t.category] ?? t.category;
      const desc = `"${t.description.replace(/"/g, '""')}"`;
      const valor = t.amount.toFixed(2);
      const rec = t.recurring ? "sim" : "";
      return `${t.date},${tipo},${cat},${desc},${valor},${rec}`;
    });

    const csvContent = [header, ...csvLines].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `segna-financas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success(`${exportRows.length} lançamentos exportados!`);
  }

  function copyTemplate() {
    navigator.clipboard.writeText(SAMPLE_CSV);
    success("Template copiado!");
  }

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);
  const dupeCount = skipDupes ? validRows.filter(isDuplicate).length : 0;
  const toImportCount = validRows.length - dupeCount;
  const exportPreviewCount = getExportRows().length;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRows([]); setFileName(""); } }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 bg-[#1a1a1a] hover:bg-[#222] text-[#6b7280] hover:text-white border border-[#2a2a2a] text-xs font-medium cursor-pointer gap-1.5"
        >
          <Upload size={12} />
          Import / Export
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#111111] border border-[#2a2a2a] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText size={15} className="text-[#6b7280]" />
            Importar / Exportar Lançamentos
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="mt-1">
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] h-8 w-full">
            <TabsTrigger value="import" className="flex-1 text-xs cursor-pointer gap-1.5">
              <Upload size={11} /> Importar CSV
            </TabsTrigger>
            <TabsTrigger value="export" className="flex-1 text-xs cursor-pointer gap-1.5">
              <Download size={11} /> Exportar CSV
            </TabsTrigger>
          </TabsList>

          {/* ── IMPORT TAB ── */}
          <TabsContent value="import" className="space-y-3 mt-3">
            {/* Template */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#9ca3af] font-medium">Formato esperado do CSV</p>
                <button
                  onClick={copyTemplate}
                  className="flex items-center gap-1 text-[10px] text-[#a78bfa] hover:text-white cursor-pointer transition-colors"
                >
                  <Copy size={10} /> copiar template
                </button>
              </div>
              <pre className="text-[10px] text-[#4a4a4a] font-mono leading-relaxed overflow-x-auto">
                {`data,tipo,categoria,descricao,valor,recorrente
2026-02-01,despesa,moradia,Aluguel,2500.00,sim
2026-02-05,receita,salario,Pagamento,5000.00,sim
2026-02-10,despesa,alimentacao,Mercado,350.00,`}
              </pre>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-[#4a4a4a] pt-1 border-t border-[#1f1f1f]">
                <div>
                  <p className="text-[#6b7280] mb-0.5">Tipos</p>
                  <p>despesa · receita</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-0.5">Categorias (despesa)</p>
                  <p>moradia · alimentacao · transporte · saude · lazer · educacao · compras · investimentos · outro</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-0.5">Categorias (receita)</p>
                  <p>salario · freelance · retorno · presente · outra_renda</p>
                </div>
                <div>
                  <p className="text-[#6b7280] mb-0.5">Recorrente</p>
                  <p>sim · não (opcional)</p>
                </div>
              </div>
            </div>

            {/* File input */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-[#3a3a3a] hover:border-[#6366f1] rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition-colors group"
              >
                <Upload size={18} className="text-[#4a4a4a] group-hover:text-[#6366f1] transition-colors" />
                <p className="text-xs text-[#6b7280] group-hover:text-[#9ca3af] transition-colors">
                  {fileName || "Clique para selecionar arquivo CSV"}
                </p>
              </button>
            </div>

            {/* Parse results */}
            {rows.length > 0 && (
              <div className="space-y-2">
                {/* Stats bar */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[#22c55e]">
                    <CheckCircle2 size={12} /> {validRows.length} válidos
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="flex items-center gap-1 text-[#ef4444]">
                      <XCircle size={12} /> {invalidRows.length} inválidos
                    </span>
                  )}
                  {dupeCount > 0 && (
                    <span className="flex items-center gap-1 text-[#f59e0b]">
                      <AlertCircle size={12} /> {dupeCount} duplicatas
                    </span>
                  )}
                </div>

                {/* Preview list */}
                <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                        !row.valid
                          ? "bg-[#ef4444]/8 border border-[#ef4444]/20"
                          : isDuplicate(row) && skipDupes
                          ? "bg-[#f59e0b]/8 border border-[#f59e0b]/20 opacity-60"
                          : "bg-[#22c55e]/8 border border-[#22c55e]/15"
                      }`}
                    >
                      {row.valid ? (
                        isDuplicate(row) && skipDupes ? (
                          <AlertCircle size={12} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 size={12} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
                        )
                      ) : (
                        <XCircle size={12} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        {row.valid ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#9ca3af] truncate">
                              {row.date} · {row.description}
                            </span>
                            <span className={`font-medium flex-shrink-0 ${row.type === "income" ? "text-[#22c55e]" : "text-white"}`}>
                              {row.type === "income" ? "+" : "-"}{formatBRL(row.amount!)}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-[#6b7280] truncate font-mono text-[10px]">{row.raw}</p>
                            {row.errors.map((e, ei) => (
                              <p key={ei} className="text-[#ef4444] text-[10px]">• {e}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Options */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setSkipDupes((v) => !v)}
                    className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${skipDupes ? "bg-[#6366f1]" : "bg-[#2a2a2a]"}`}
                  >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${skipDupes ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-xs text-[#6b7280]">Ignorar duplicatas já existentes</span>
                </label>

                <Button
                  onClick={handleImport}
                  disabled={toImportCount === 0}
                  className="w-full bg-[#6366f1] hover:bg-[#5558e8] text-white text-sm font-semibold disabled:opacity-30 cursor-pointer"
                >
                  {toImportCount === 0
                    ? "Nenhum lançamento para importar"
                    : `Importar ${toImportCount} ${toImportCount === 1 ? "lançamento" : "lançamentos"}`}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ── EXPORT TAB ── */}
          <TabsContent value="export" className="space-y-3 mt-3">
            <div className="space-y-2">
              <p className="text-xs text-[#6b7280]">Período</p>
              <div className="grid grid-cols-4 gap-1.5">
                {(["month", "3months", "year", "all"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setExportRange(r)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      exportRange === r
                        ? "bg-[#6366f1] text-white"
                        : "bg-[#1a1a1a] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    {r === "month" ? "Este mês" : r === "3months" ? "3 meses" : r === "year" ? "Este ano" : "Todos"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[#6b7280]">Tipo</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(["all", "expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setExportType(t)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      exportType === t
                        ? "bg-[#6366f1] text-white"
                        : "bg-[#1a1a1a] text-[#6b7280] hover:text-white border border-[#2a2a2a]"
                    }`}
                  >
                    {t === "all" ? "Todos" : t === "expense" ? "Despesas" : "Receitas"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{exportPreviewCount} lançamentos</p>
                <p className="text-[10px] text-[#4a4a4a] mt-0.5">
                  Formato: CSV com cabeçalho · UTF-8 · separador vírgula
                </p>
              </div>
              <FileText size={18} className="text-[#3a3a3a]" />
            </div>

            <Button
              onClick={handleExport}
              disabled={exportPreviewCount === 0}
              className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-white text-sm font-semibold disabled:opacity-30 cursor-pointer gap-2"
            >
              <Download size={14} />
              Baixar CSV
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
