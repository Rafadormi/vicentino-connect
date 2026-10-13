import { createContext, useContext, useEffect, useState } from "react";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "coordenador" | "voluntario";
export type Access = { id: string; name: string; role: Role; parishId: string | null };
const AccessContext = createContext<Access | null>(null);
export function useAccess() {
  const access = useContext(AccessContext);
  if (!access) throw new Error("Acesso interno indisponível");
  return access;
}

export const Route = createFileRoute("/app")({ component: AppLayout });

const links = [
  ["consulta", "Consulta rápida"],
  ["sindicancia", "Nova sindicância"],
  ["visitas", "Registrar visita"],
  ["entregas", "Registrar entrega"],
  ["painel", "Painel pastoral"],
  ["ficha", "Ficha de campo"],
] as const;

function AppLayout() {
  const [state, setState] = useState<"loading" | "signed-out" | "blocked" | "ready" | "error">(
    "loading",
  );
  const [access, setAccess] = useState<Access | null>(null);
  useEffect(() => {
    let active = true;
    async function load() {
      setState("loading");
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        setState("signed-out");
        return;
      }
      const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] =
        await Promise.all([
          supabase
            .from("usuarios")
            .select("id,nome_completo,paroquia_id,ativo")
            .eq("id", auth.user.id)
            .maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", auth.user.id),
        ]);
      if (!active) return;
      if (profileError || rolesError) {
        setState("error");
        return;
      }
      if (!profile?.ativo || !roles?.length) {
        setState("blocked");
        return;
      }
      const role: Role = roles.some((r) => r.role === "admin")
        ? "admin"
        : roles.some((r) => r.role === "coordenador")
          ? "coordenador"
          : "voluntario";
      if (role === "voluntario" && !profile.paroquia_id) {
        setState("blocked");
        return;
      }
      setAccess({
        id: auth.user.id,
        name: profile.nome_completo,
        role,
        parishId: profile.paroquia_id,
      });
      setState("ready");
    }
    void load();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || event === "SIGNED_IN") void load();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state === "loading")
    return (
      <main className="p-8" role="status">
        Verificando acesso…
      </main>
    );
  if (state === "signed-out") return <Navigate to="/login" search={{ next: "/app/consulta" }} />;
  if (state === "blocked" || state === "error")
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold text-primary">Acesso indisponível</h1>
        <p className="mt-3 text-muted-foreground">
          {state === "blocked"
            ? "Sua conta precisa de um perfil ativo autorizado pela coordenação."
            : "Não foi possível verificar seu perfil. Tente novamente."}
        </p>
        <button
          className="mt-6 rounded-md bg-primary px-4 py-3 text-primary-foreground"
          onClick={() => void supabase.auth.signOut()}
        >
          Sair
        </button>
      </main>
    );
  if (!access) return null;
  return (
    <AccessContext.Provider value={access}>
      <div className="min-h-screen bg-[#f6f8fc] text-slate-900 md:flex">
        <aside className="print:hidden hidden w-64 shrink-0 bg-[#00236f] p-5 text-white md:flex md:flex-col">
          <div className="mb-8">
            <strong className="text-lg">Vicentino Connect</strong>
            <p className="text-sm text-blue-200">SSVP Umuarama</p>
          </div>
          <nav aria-label="Páginas internas" className="space-y-1">
            {links.map(([slug, label]) => (
              <a
                key={slug}
                href={`/app/${slug}`}
                className="block rounded-lg px-3 py-3 hover:bg-white/15"
              >
                {label}
              </a>
            ))}
            {access.role === "admin" && (
              <>
                <a href="/app/usuarios" className="block rounded-lg px-3 py-3 hover:bg-white/15">
                  Usuários
                </a>
                <a href="/app/auditoria" className="block rounded-lg px-3 py-3 hover:bg-white/15">
                  Auditoria
                </a>
              </>
            )}
          </nav>
          <div className="mt-auto pt-8 text-sm">
            <p className="truncate">{access.name}</p>
            <p className="capitalize text-blue-200">{access.role}</p>
            <button className="mt-3 underline" onClick={() => void supabase.auth.signOut()}>
              Sair
            </button>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="print:hidden flex items-center justify-between bg-[#00236f] px-4 py-4 text-white md:hidden">
            <span className="font-semibold">Vicentino Connect</span>
            <button onClick={() => void supabase.auth.signOut()}>Sair</button>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6 pb-28 md:p-8">
            <Outlet />
          </main>
          <nav
            aria-label="Navegação móvel"
            className="print:hidden fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t bg-white text-center text-xs shadow md:hidden"
          >
            {links.map(([slug, label]) => (
              <a key={slug} href={`/app/${slug}`} className="min-h-14 px-1 py-3 text-[#00236f]">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </AccessContext.Provider>
  );
}
