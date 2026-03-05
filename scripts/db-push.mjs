/**
 * db-push.mjs — Aplica todas as migrations pendentes no Supabase remoto
 *
 * O que faz:
 *  1. Verifica que o projeto está linkado
 *  2. Roda `supabase db push` — aplica migrations ainda não aplicadas
 *  3. As migrations aplicadas ficam registradas na tabela supabase_migrations.schema_migrations
 *
 * Uso:  node scripts/db-push.mjs
 *   ou  npm run db:push
 */

import { execSync }    from "child_process";
import { readFileSync, readdirSync } from "fs";
import { resolve }     from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const MIGRATIONS_DIR = resolve(ROOT, "supabase", "migrations");

/* ── Checa que existe pelo menos 1 migration ──────────────────────────────── */
const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
if (files.length === 0) {
  console.log("Nenhuma migration encontrada em supabase/migrations/");
  process.exit(0);
}

console.log(`\n📦 ${files.length} migration(s) encontrada(s):`);
files.forEach((f) => console.log(`   · ${f}`));

/* ── Checa se o projeto está linkado (supabase/.temp/project-ref) ─────────── */
const linkedRef = (() => {
  try {
    return readFileSync(resolve(ROOT, "supabase", ".temp", "project-ref"), "utf-8").trim();
  } catch {
    return null;
  }
})();

if (!linkedRef) {
  console.error(`
❌  Projeto não está linkado.
    Rode primeiro:  npm run db:setup
`);
  process.exit(1);
}

console.log(`\n🔗 Projeto linkado: ${linkedRef}`);
console.log("🚀 Aplicando migrations...\n");

try {
  execSync("npx supabase db push", {
    stdio: "inherit",
    cwd: ROOT,
  });
  console.log("\n✅ Migrations aplicadas com sucesso!");
} catch (err) {
  console.error("\n❌ Erro ao aplicar migrations:", err.message);
  console.error("\n   Se o erro for de autenticação, rode: npm run db:setup");
  process.exit(1);
}
