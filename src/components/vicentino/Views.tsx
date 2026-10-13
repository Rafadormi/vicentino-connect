import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/routes/app";
import { FamilyPicker, Message, PageTitle, field, maskCpf, submit } from "./Shared";

type Family = {
  id: string;
  nome_completo: string;
  cpf: string | null;
  bairro: string | null;
  rua: string | null;
  numero: string | null;
  telefone: string | null;
  status_assistido: string;
  paroquia_vinculo_id: string | null;
  flag_duplicidade_beneficio: boolean;
};
export function Consulta() {
  const [term, setTerm] = useState("");
  const [rows, setRows] = useState<Family[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  async function search(e: FormEvent) {
    e.preventDefault();
    const safe = term.trim().replace(/[%,()]/g, "");
    if (safe.length < 2) {
      setError("Digite ao menos dois caracteres.");
      return;
    }
    setBusy(true);
    setError("");
    setSearched(true);
    const { data, error: queryError } = await supabase
      .from("assistidos")
      .select(
        "id,nome_completo,cpf,bairro,rua,numero,telefone,status_assistido,paroquia_vinculo_id,flag_duplicidade_beneficio",
      )
      .eq("anonimizado", false)
      .or(`nome_completo.ilike.%${safe}%,cpf.ilike.%${safe}%,bairro.ilike.%${safe}%`)
      .order("nome_completo")
      .limit(20);
    setRows(data ?? []);
    setBusy(false);
    setError(queryError?.message ?? "");
  }
  return (
    <section>
      <PageTitle
        title="Consulta rápida"
        detail="Busque uma família por nome, CPF ou bairro. A visualização respeita seu acesso."
      />
      <form onSubmit={search} className="mb-5 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="query" className="sr-only">
          Busca de famílias
        </label>
        <input
          id="query"
          className={field}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Nome, CPF ou bairro"
        />
        <button className={submit} disabled={busy}>
          {busy ? "Buscando…" : "Consultar"}
        </button>
      </form>
      {error && <Message value={error} error />}
      {!error && searched && !busy && rows.length === 0 && (
        <Message value="Nenhuma família encontrada para esta busca." />
      )}
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold text-[#00236f]">{row.nome_completo}</h2>
                <p className="text-sm text-muted-foreground">
                  {row.bairro ?? "Bairro não informado"} · {maskCpf(row.cpf)}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs">
                {row.status_assistido}
              </span>
            </div>
            {row.flag_duplicidade_beneficio && (
              <p className="mt-2 text-sm text-amber-700">
                Caso marcado para alinhamento entre paróquias.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#00236f]">
              <a className="underline" href="/app/visitas">
                Registrar visita
              </a>
              <a className="underline" href="/app/entregas">
                Registrar entrega
              </a>
              <a className="underline" href={`/app/ficha?id=${encodeURIComponent(row.id)}`}>
                Ficha A4
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Painel() {
  const [counts, setCounts] = useState<{
    families: number;
    visits: number;
    deliveries: number;
    alerts: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    async function load() {
      const [families, visits, deliveries, alerts] = await Promise.all([
        supabase
          .from("assistidos")
          .select("id", { count: "exact", head: true })
          .eq("status_assistido", "Ativo"),
        supabase.from("visitas").select("id", { count: "exact", head: true }),
        supabase.from("entregas").select("id", { count: "exact", head: true }),
        supabase
          .from("assistidos")
          .select("id", { count: "exact", head: true })
          .eq("flag_duplicidade_beneficio", true),
      ]);
      if (!live) return;
      const failure = families.error || visits.error || deliveries.error || alerts.error;
      if (failure) setError(failure.message);
      else
        setCounts({
          families: families.count ?? 0,
          visits: visits.count ?? 0,
          deliveries: deliveries.count ?? 0,
          alerts: alerts.count ?? 0,
        });
    }
    void load();
    return () => {
      live = false;
    };
  }, []);
  return (
    <section>
      <PageTitle
        title="Painel pastoral"
        detail="Totais dos registros aos quais seu perfil tem acesso."
      />
      {error ? (
        <Message value={error} error />
      ) : !counts ? (
        <p role="status">Carregando indicadores…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Famílias ativas", counts.families],
              ["Visitas registradas", counts.visits],
              ["Entregas registradas", counts.deliveries],
              ["Casos em alerta", counts.alerts],
            ] as const
          ).map(([title, value]) => (
            <div key={title} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{title}</p>
              <strong className="mt-3 block text-3xl text-[#00236f]">{value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Ficha() {
  const [selected, setSelected] = useState("");
  const [family, setFamily] = useState<Family | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setSelected(id);
  }, []);
  useEffect(() => {
    if (!selected) {
      setFamily(null);
      return;
    }
    let live = true;
    void supabase
      .from("assistidos")
      .select(
        "id,nome_completo,cpf,bairro,rua,numero,telefone,status_assistido,paroquia_vinculo_id,flag_duplicidade_beneficio",
      )
      .eq("id", selected)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (live) {
          setFamily(data);
          setError(queryError?.message ?? (data ? "" : "Família indisponível para seu perfil."));
        }
      });
    return () => {
      live = false;
    };
  }, [selected]);
  return (
    <section>
      <div className="print:hidden">
        <PageTitle
          title="Ficha de campo"
          detail="Documento interno de visita, formatado para folha A4."
        />
        <FamilyPicker value={selected} onChange={setSelected} />
        {error && <Message value={error} error />}
        {family && (
          <button className={`mt-4 ${submit}`} onClick={() => window.print()}>
            Imprimir ficha
          </button>
        )}
      </div>
      {family && (
        <article className="mx-auto mt-6 max-w-[190mm] space-y-6 bg-white p-8 print:m-0 print:max-w-none print:p-0">
          <header className="border-b-2 border-slate-900 pb-4">
            <h2 className="text-xl font-bold uppercase">Ficha pastoral de visita domiciliar</h2>
            <p className="text-sm">SSVP · Conselho Central de Umuarama/PR · Uso interno</p>
            <p className="text-sm">Emitida em {new Date().toLocaleDateString("pt-BR")}</p>
          </header>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <strong>Titular:</strong> {family.nome_completo}
            </p>
            <p>
              <strong>CPF:</strong> {maskCpf(family.cpf)}
            </p>
            <p>
              <strong>Endereço:</strong> {family.rua}, {family.numero} — {family.bairro}
            </p>
            <p>
              <strong>Telefone:</strong> {family.telefone ?? "—"}
            </p>
            <p>
              <strong>Situação:</strong> {family.status_assistido}
            </p>
          </div>
          <div className="space-y-5 pt-4">
            <h3 className="font-semibold">Anotações de campo</h3>
            <div className="h-24 rounded border border-dashed p-2 text-sm text-slate-500">
              Escuta e necessidades observadas
            </div>
            <div className="h-20 rounded border border-dashed p-2 text-sm text-slate-500">
              Intenção de oração
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 pt-12 text-center text-sm">
            <div className="border-t pt-2">Visitador 1</div>
            <div className="border-t pt-2">Visitador 2</div>
          </div>
        </article>
      )}
    </section>
  );
}

export function Usuarios() {
  const access = useAccess();
  const [rows, setRows] = useState<
    { id: string; nome_completo: string; email: string; ativo: boolean }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (access.role !== "admin") return;
    void supabase
      .from("usuarios")
      .select("id,nome_completo,email,ativo")
      .order("nome_completo")
      .limit(100)
      .then(({ data, error: err }) => {
        setRows(data ?? []);
        setError(err?.message ?? "");
      });
  }, [access.role]);
  if (access.role !== "admin") return <Message value="Acesso reservado ao administrador." error />;
  return (
    <section>
      <PageTitle
        title="Usuários"
        detail="Contas vinculadas ao sistema. Cadastro e perfis são administrados no Supabase."
      />
      {error && <Message value={error} error />}
      <ul className="divide-y rounded-xl bg-white">
        {rows.map((row) => (
          <li key={row.id} className="p-4">
            <strong>{row.nome_completo}</strong>
            <span className="ml-2 text-sm text-muted-foreground">
              {row.email} · {row.ativo ? "Ativo" : "Inativo"}
            </span>
          </li>
        ))}
      </ul>
      {!error && rows.length === 0 && <Message value="Nenhum usuário disponível." />}
    </section>
  );
}

export function Auditoria() {
  const access = useAccess();
  const [rows, setRows] = useState<
    { id: string; acao: string; tabela: string; created_at: string }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (access.role !== "admin") return;
    void supabase
      .from("auditoria")
      .select("id,acao,tabela,created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error: err }) => {
        setRows(data ?? []);
        setError(err?.message ?? "");
      });
  }, [access.role]);
  if (access.role !== "admin") return <Message value="Acesso reservado ao administrador." error />;
  return (
    <section>
      <PageTitle
        title="Auditoria"
        detail="Ações recentes, sem exibir conteúdo pessoal dos registros."
      />
      {error && <Message value={error} error />}
      <ul className="divide-y rounded-xl bg-white">
        {rows.map((row) => (
          <li key={row.id} className="p-4 text-sm">
            {new Date(row.created_at).toLocaleString("pt-BR")} · {row.acao} · {row.tabela}
          </li>
        ))}
      </ul>
      {!error && rows.length === 0 && <Message value="Nenhum evento de auditoria disponível." />}
    </section>
  );
}
