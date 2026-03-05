/**
 * check-users.mjs — Lista todos os usuários cadastrados no Supabase Auth
 * Uso: node scripts/check-users.mjs
 *   ou: npm run db:users
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function readEnv() {
  const content = readFileSync(resolve(ROOT, ".env.local"), "utf-8");
  return Object.fromEntries(
    content.split("\n")
      .filter(l => l.trim() && !l.startsWith("#"))
      .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
  );
}

const env = readEnv();
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "https://muogkqsoepsmznfeimkp.supabase.co";

if (!serviceRole) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrado em .env.local");
  process.exit(1);
}

const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=100`, {
  headers: {
    Authorization: `Bearer ${serviceRole}`,
    apikey: serviceRole,
  },
});

const data = await res.json();

if (!res.ok || !data.users) {
  console.log("Resposta inesperada:", JSON.stringify(data, null, 2));
  process.exit(1);
}

const now = new Date();

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║           USUÁRIOS CADASTRADOS — SEGNA                   ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log(`\n  Total: ${data.users.length} usuário(s)   (${now.toLocaleString("pt-BR")})\n`);

// Ordena por último login (mais recentes primeiro)
data.users
  .sort((a, b) => new Date(b.last_sign_in_at || 0) - new Date(a.last_sign_in_at || 0))
  .forEach((u, i) => {
    const criado = new Date(u.created_at).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

    const lastLogin = u.last_sign_in_at
      ? new Date(u.last_sign_in_at).toLocaleString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "2-digit",
          hour: "2-digit", minute: "2-digit",
        })
      : "—";

    // Calcula "há X dias"
    const diasLogin = u.last_sign_in_at
      ? Math.floor((now - new Date(u.last_sign_in_at)) / 86400000)
      : null;
    const diasStr = diasLogin === null ? "" : diasLogin === 0 ? " (hoje)" : ` (há ${diasLogin}d)`;

    const emailOk = u.email_confirmed_at ? "✓" : "✗ sem confirmação";
    const provider = u.app_metadata?.provider || "email";

    console.log(`  ${String(i + 1).padStart(2, "0")}. ${u.email || "(sem email)"}  [${provider}] ${emailOk}`);
    console.log(`      Cadastro: ${criado}   Último login: ${lastLogin}${diasStr}`);
    console.log();
  });

// Estatísticas rápidas
const confirmados  = data.users.filter(u => u.email_confirmed_at).length;
const ativosHoje   = data.users.filter(u => {
  if (!u.last_sign_in_at) return false;
  return Math.floor((now - new Date(u.last_sign_in_at)) / 86400000) === 0;
}).length;
const ativos7dias  = data.users.filter(u => {
  if (!u.last_sign_in_at) return false;
  return (now - new Date(u.last_sign_in_at)) / 86400000 <= 7;
}).length;

console.log("  ─────────────────────────────────────────────────");
console.log(`  📧 Confirmados:    ${confirmados}/${data.users.length}`);
console.log(`  🟢 Ativos hoje:    ${ativosHoje}`);
console.log(`  📅 Ativos 7 dias:  ${ativos7dias}`);
console.log();
