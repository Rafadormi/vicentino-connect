import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ next: oauthReturnPath(s.next) }),
  head: () => ({
    meta: [
      { title: "Entrar — Vicentino Connect" },
      { name: "description", content: "Acesso dos voluntários e coordenadores vicentinos." },
      { property: "og:title", content: "Entrar — Vicentino Connect" },
      { property: "og:description", content: "Acesso dos voluntários e coordenadores vicentinos." },
    ],
  }),
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    if (next.startsWith("/.lovable/")) window.location.href = next;
    else navigate({ to: next });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6">
        <h1 className="text-xl font-semibold text-foreground">Entrar</h1>
        <input
          type="email" required placeholder="E-mail" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
        />
        <input
          type="password" required placeholder="Senha" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
        />
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">
          {busy ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
