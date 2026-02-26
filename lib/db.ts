/**
 * Helpers para ler e escrever dados de cada store no Supabase.
 * Cada store tem sua coluna JSONB na tabela user_data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
import { supabase } from "./supabase";

export type StoreKey = "financas" | "habitos" | "notas" | "defi" | "settings" | "tarefas" | "mood";

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Lê os dados de um store do Supabase. Retorna null se não autenticado ou sem dados. */
export async function loadStoreData(store: StoreKey): Promise<Record<string, unknown> | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_data")
    .select(store)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`[db] loadStoreData(${store})`, error.message);
    return null;
  }

  const value = data?.[store];
  if (!value || Object.keys(value).length === 0) return null;
  return value as Record<string, unknown>;
}

/** Salva os dados de um store no Supabase (upsert). */
export async function saveStoreData(store: StoreKey, data: unknown): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const row: AnyRecord = { user_id: userId, [store]: data };
  const { error } = await supabase
    .from("user_data")
    .upsert(row as never, { onConflict: "user_id" });

  if (error) {
    console.error(`[db] saveStoreData(${store})`, error.message);
  }
}

/** Salva TODOS os stores de uma vez (usada na migração). */
export async function saveAllStores(payload: Partial<Record<StoreKey, unknown>>): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const row: AnyRecord = { user_id: userId, ...payload };
  const { error } = await supabase
    .from("user_data")
    .upsert(row as never, { onConflict: "user_id" });

  if (error) {
    console.error("[db] saveAllStores", error.message);
    throw error;
  }
}
