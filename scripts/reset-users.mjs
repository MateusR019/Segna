/**
 * reset-users.mjs — Apaga todos os usuários do Supabase Auth e ativa auto-confirm
 * Uso: node scripts/reset-users.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env  = Object.fromEntries(
  readFileSync(resolve(ROOT, ".env.local"), "utf-8")
    .split("\n").filter(l => l.trim() && !l.startsWith("#"))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()]; })
);

const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY;
const TOKEN        = env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const REF          = "muogkqsoepsmznfeimkp";

/* ── 1. Busca todos os usuários ─────────────────────────────────────────────── */
const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=100`, {
  headers: { Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE },
});
const { users = [] } = await listRes.json();

if (users.length === 0) {
  console.log("Nenhum usuário para apagar.");
} else {
  console.log(`\n🗑  Apagando ${users.length} usuário(s)...`);
  for (const u of users) {
    const del = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${u.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, apikey: SERVICE_ROLE },
    });
    if (del.ok || del.status === 404) {
      console.log(`  ✓ ${u.email}`);
    } else {
      const err = await del.text();
      console.log(`  ✗ ${u.email} — ${del.status}: ${err}`);
    }
  }
}

/* ── 2. Ativa auto-confirm (sem precisar confirmar email) ───────────────────── */
console.log("\n⚙  Ativando auto-confirm no Supabase Auth...");
const patchRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ mailer_autoconfirm: true }),
});

if (patchRes.ok) {
  console.log("  ✓ Auto-confirm ativado — novos cadastros entram direto, sem email de confirmação.");
} else {
  const err = await patchRes.text();
  console.log("  ✗ Erro ao ativar auto-confirm:", err);
}

console.log("\n✅ Pronto! O banco está limpo e pronto para novos usuários.\n");
