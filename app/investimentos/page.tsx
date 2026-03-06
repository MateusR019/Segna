import { redirect } from "next/navigation";

/**
 * /investimentos foi integrado à página de Finanças como uma tab.
 * Redireciona automaticamente para evitar links quebrados.
 */
export default function InvestimentosRedirect() {
  redirect("/financas");
}
