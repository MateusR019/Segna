/**
 * auth-config.mjs — Checa e ajusta configurações de Auth do Supabase
 * Uso: node scripts/auth-config.mjs
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

const TOKEN = env.SUPABASE_ACCESS_TOKEN;
const REF   = "muogkqsoepsmznfeimkp";
const BASE  = `https://api.supabase.com/v1/projects/${REF}`;

const cfg = await fetch(`${BASE}/config/auth`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
}).then(r => r.json());

console.log("\n=== Config de Auth atual ===");
console.log("mailer_autoconfirm:", cfg.mailer_autoconfirm);
console.log("enable_signup:", cfg.enable_signup);
console.log("smtp_host:", cfg.smtp_host || "(padrão Supabase)");
console.log("");
