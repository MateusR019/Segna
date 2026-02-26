import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton — usa createBrowserClient (@supabase/ssr) para salvar sessão em
// cookies, permitindo que o middleware Next.js leia o auth corretamente.
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createBrowserClient(supabaseUrl, supabaseAnon);
  }
  return _client;
}

export const supabase = getSupabase();

/**
 * Retorna o usuário autenticado atual com tipo explícito.
 * createBrowserClient sem type params perde a inferência de auth —
 * este wrapper centraliza o cast em um único lugar.
 */
export async function getAuthUser(): Promise<User | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.auth.getUser() as Promise<any>);
  return (data?.user as User | null) ?? null;
}
