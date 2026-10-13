import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthResult = {
  data: {
    redirect_url?: string;
    redirect_to?: string;
    client?: { name?: string } | null;
  } | null;
  error: { message: string } | null;
};
type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<OAuthResult>;
  approveAuthorization(id: string): Promise<OAuthResult>;
  denyAuthorization(id: string): Promise<OAuthResult>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  head: () => ({
    meta: [
      { title: "Autorizar acesso — Vicentino Connect" },
      { name: "description", content: "Autorize um assistente a acessar o Vicentino Connect." },
      { property: "og:title", content: "Autorizar acesso — Vicentino Connect" },
      { property: "og:description", content: "Autorize um assistente a acessar o Vicentino Connect." },
    ],
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Pedido de autorização sem identificador.");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/login", search: { next } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center p-4 text-foreground">
      Não foi possível carregar este pedido: {error instanceof Error ? error.message : String(error)}
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = details?.client?.name ?? "um aplicativo";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("O servidor não retornou um endereço de retorno."); return; }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold text-foreground">Conectar {name} à sua conta</h1>
        <p className="text-sm text-muted-foreground">
          {name} poderá consultar e registrar dados do Controle Vicentino em seu nome, respeitando suas permissões.
        </p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <button disabled={busy} onClick={() => decide(true)} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Autorizar</button>
          <button disabled={busy} onClick={() => decide(false)} className="rounded-md border px-4 py-2 text-foreground">Negar</button>
        </div>
      </div>
    </main>
  );
}
