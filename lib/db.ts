/**
 * Helpers para ler e escrever dados no Supabase.
 *
 * Arquitetura: coluna única `data JSONB` em user_data.
 * → Para adicionar um novo store, basta incluir a key aqui (sem migração SQL).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
import { supabase, getAuthUser } from "./supabase";

// Adicionar novo store? Só acrescente a key aqui — nenhuma ALTER TABLE necessária.
export type StoreKey =
  | "financas"
  | "habitos"
  | "notas"
  | "defi"
  | "settings"
  | "tarefas"
  | "mood"
  | "corporal"
  | "investimentos";

async function getUserId(): Promise<string | null> {
  const user = await getAuthUser();
  return user?.id ?? null;
}

/** Lê os dados de um store da coluna `data` do Supabase. */
export async function loadStoreData(
  store: StoreKey
): Promise<Record<string, unknown> | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`[db] loadStoreData(${store})`, error.message);
    return null;
  }

  const value = (data?.data as AnyRecord | null)?.[store];
  if (!value || Object.keys(value as object).length === 0) return null;
  return value as Record<string, unknown>;
}

/**
 * Salva um store de forma atômica via RPC `upsert_user_store`.
 * Usa jsonb_set — não sobrescreve os outros stores em saves simultâneos.
 */
export async function saveStoreData(
  store: StoreKey,
  payload: unknown
): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("upsert_user_store", {
    p_user_id: userId,
    p_store: store,
    p_data: payload,
  });

  if (error) {
    console.error(`[db] saveStoreData(${store})`, error.message);
  }
}

/** Salva TODOS os stores de uma vez (usado na migração inicial). */
export async function saveAllStores(
  payload: Partial<Record<StoreKey, unknown>>
): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  // Carrega dado atual para fazer merge (não apagar stores não incluídos)
  const { data: current } = await supabase
    .from("user_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  const merged: AnyRecord = { ...(current?.data as AnyRecord ?? {}), ...payload };

  const { error } = await supabase
    .from("user_data")
    .upsert(
      { user_id: userId, data: merged } as never,
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("[db] saveAllStores", error.message);
    throw error;
  }
}
