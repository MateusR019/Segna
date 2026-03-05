/**
 * db-new.mjs — Cria nova migration com timestamp automático
 *
 * Uso:  node scripts/db-new.mjs "add_user_preferences"
 *   ou  npm run db:new add_user_preferences
 *
 * Gera:  supabase/migrations/20260305143022_add_user_preferences.sql
 */

import { writeFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = resolve(__dirname, "..");
const MIGRATIONS = resolve(ROOT, "supabase", "migrations");

const name = process.argv[2];

if (!name) {
  console.error(`
❌  Informe o nome da migration.

  Uso:  npm run db:new <nome_da_migration>

  Exemplos:
    npm run db:new add_notifications
    npm run db:new alter_user_data_add_column
    npm run db:new create_audit_log
`);
  process.exit(1);
}

/* ── Gera timestamp no formato YYYYMMDDHHmmss ────────────────────────────── */
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const ts  = [
  now.getFullYear(),
  pad(now.getMonth() + 1),
  pad(now.getDate()),
  pad(now.getHours()),
  pad(now.getMinutes()),
  pad(now.getSeconds()),
].join("");

/* ── Garante nome único (incrementa se já existe mesmo segundo) ──────────── */
const existing = readdirSync(MIGRATIONS).filter((f) => f.startsWith(ts));
const suffix   = existing.length > 0 ? `_${existing.length}` : "";

const filename = `${ts}${suffix}_${name.replace(/\s+/g, "_").toLowerCase()}.sql`;
const filepath = resolve(MIGRATIONS, filename);

const template = `-- ============================================================
-- Migration: ${name}
-- Criada em: ${now.toISOString()}
-- ============================================================

-- Escreva sua migration abaixo.
-- Dica: use IF NOT EXISTS / OR REPLACE para idempotência.

`;

writeFileSync(filepath, template, "utf-8");

console.log(`
✅  Migration criada:

    supabase/migrations/${filename}

  Edite o arquivo, depois rode:
    npm run db:push
`);
