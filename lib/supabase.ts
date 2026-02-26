import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton para evitar múltiplas instâncias no cliente.
// Usa createBrowserClient do @supabase/ssr em vez de createClient do supabase-js.
// Isso garante que a sessão seja salva em cookies (além do localStorage),
// permitindo que o middleware Next.js leia o auth corretamente.
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createBrowserClient(supabaseUrl, supabaseAnon);
  }
  return _client;
}

export const supabase = getSupabase();
