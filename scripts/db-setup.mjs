/**
 * db-setup.mjs — Configuração inicial do Supabase CLI (roda UMA vez por máquina)
 *
 * O que faz:
 *  1. Lê SUPABASE_ACCESS_TOKEN e SUPABASE_DB_PASSWORD do .env.local
 *  2. Faz login no CLI com o token
 *  3. Linka o projeto remoto
 *
 * Uso:  node scripts/db-setup.mjs
 */

import { execSync }    from "child_process";
import { readFileSync } from "fs";
import { resolve }     from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const PROJECT_REF = "muogkqsoepsmznfeimkp";

/* ── Lê .env.local ─────────────────────────────────────────────────────────── */
function readEnv(filePath) {
  try {
    return Object.fromEntries(
      readFileSync(filePath, "utf-8")
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"))
        .map((l) => {
          const [k, ...rest] = l.split("=");
          return [k.trim(), rest.join("=").trim()];
        })
    );
  } catch {
    return {};
  }
}

const env = {
  ...readEnv(resolve(ROOT, ".env.local")),
  ...readEnv(resolve(ROOT, ".env")),
};

const token    = env.SUPABASE_ACCESS_TOKEN;
const password = env.SUPABASE_DB_PASSWORD;

if (!token) {
  console.error(`
❌  SUPABASE_ACCESS_TOKEN não encontrado em .env.local

  Como obter:
  1. Acesse https://supabase.com/dashboard/account/tokens
  2. Clique em "New token" → nomeie como "Segna Dev"
  3. Copie o token gerado
  4. Adicione ao .env.local:

     SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxx
`);
  process.exit(1);
}

if (!password) {
  console.error(`
❌  SUPABASE_DB_PASSWORD não encontrado em .env.local

  Como obter:
  1. Acesse https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database
  2. Seção "Database password" → clique em "Reset database password" se não lembrar
  3. Adicione ao .env.local:

     SUPABASE_DB_PASSWORD=sua-senha-aqui
`);
  process.exit(1);
}

const run = (cmd, label) => {
  console.log(`\n→ ${label}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
};

try {
  run(
    `npx supabase login --token "${token}"`,
    "Fazendo login no Supabase CLI..."
  );

  run(
    `npx supabase link --project-ref ${PROJECT_REF} --password "${password}"`,
    "Linkando projeto remoto..."
  );

  console.log(`
✅  Setup concluído!

  Agora você pode usar:
    npm run db:push    — aplicar migrations pendentes
    npm run db:new     — criar nova migration

  O Claude fará isso automaticamente quando necessário.
`);
} catch (err) {
  console.error("\n❌ Erro no setup:", err.message);
  process.exit(1);
}
