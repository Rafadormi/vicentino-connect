import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccess } from "@/routes/app";
import { FamilyPicker, Message, PageTitle, cpfFormat, field, label, submit, today } from "./Shared";

type Parish = { id: string; paroquia: string; grupo: string };
export function Sindicancia() {
  const access = useAccess();
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");
  const [parish, setParish] = useState(access.parishId ?? "");
  const [reason, setReason] = useState<
    | "Frequenta missa aqui"
    | "Família histórica"
    | "Indicação vicentina"
    | "Proximidade com grupo"
    | "Outro"
  >("Frequenta missa aqui");
  const [other, setOther] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    void supabase
      .from("paroquias_grupos")
      .select("id,paroquia,grupo")
      .eq("ativo", true)
      .order("paroquia")
      .then(({ data }) => setParishes(data ?? []));
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setFeedback("");
    if (!consent) {
      setFailed(true);
      setFeedback("Confirme o consentimento LGPD antes de salvar.");
      return;
    }
    if (cpf.replace(/\D/g, "").length !== 11) {
      setFailed(true);
      setFeedback("Informe um CPF com 11 dígitos.");
      return;
    }
    const chosenParish = access.role === "voluntario" ? access.parishId : parish;
    if (!chosenParish) {
      setFailed(true);
      setFeedback("É preciso selecionar uma paróquia de vínculo.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("assistidos").insert({
      nome_completo: name.trim(),
      cpf,
      data_nascimento: birth || null,
      telefone: phone || null,
      rua: street.trim(),
      numero: number.trim(),
      bairro: district.trim(),
      complemento: complement || null,
      paroquia_referencia_id: reference || null,
      paroquia_vinculo_id: chosenParish,
      motivo_vinculo: reference && reference !== chosenParish ? reason : null,
      motivo_vinculo_outro: reason === "Outro" ? other.trim() || null : null,
      consentimento_lgpd: true,
      created_by: access.id,
    });
    setBusy(false);
    setFailed(!!error);
    setFeedback(error ? `Não foi possível salvar: ${error.message}` : "Sindicância registrada.");
    if (!error) {
      setName("");
      setCpf("");
      setBirth("");
      setPhone("");
      setStreet("");
      setNumber("");
      setDistrict("");
      setComplement("");
      setConsent(false);
    }
  }
  return (
    <section>
      <PageTitle title="Nova sindicância" detail="Cadastro pastoral de uma família assistida." />
      <form onSubmit={save} className="max-w-3xl space-y-5 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Nome completo *
            <input
              className={field}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={label}>
            CPF *
            <input
              className={field}
              required
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(cpfFormat(e.target.value))}
              placeholder="000.000.000-00"
            />
          </label>
          <label className={label}>
            Nascimento
            <input
              className={field}
              type="date"
              max={today()}
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
          </label>
          <label className={label}>
            Telefone
            <input
              className={field}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className={label}>
            Rua *
            <input
              className={field}
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </label>
          <label className={label}>
            Número *
            <input
              className={field}
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </label>
          <label className={label}>
            Bairro *
            <input
              className={field}
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </label>
          <label className={label}>
            Complemento
            <input
              className={field}
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />
          </label>
          <label className={label}>
            Paróquia de referência
            <select
              className={field}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            >
              <option value="">Selecione</option>
              {parishes.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.paroquia} — {p.grupo}
                </option>
              ))}
            </select>
          </label>
          <label className={label}>
            Paróquia de vínculo *
            <select
              className={field}
              required
              disabled={access.role === "voluntario"}
              value={access.role === "voluntario" ? (access.parishId ?? "") : parish}
              onChange={(e) => setParish(e.target.value)}
            >
              <option value="">Selecione</option>
              {parishes.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.paroquia} — {p.grupo}
                </option>
              ))}
            </select>
          </label>
        </div>
        {reference && reference !== (access.role === "voluntario" ? access.parishId : parish) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Motivo do vínculo
              <select
                className={field}
                value={reason}
                onChange={(e) => setReason(e.target.value as typeof reason)}
              >
                {[
                  "Frequenta missa aqui",
                  "Família histórica",
                  "Indicação vicentina",
                  "Proximidade com grupo",
                  "Outro",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            {reason === "Outro" && (
              <label className={label}>
                Descreva o vínculo
                <input className={field} value={other} onChange={(e) => setOther(e.target.value)} />
              </label>
            )}
          </div>
        )}
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Confirmo que a família autorizou o tratamento dos dados para o acompanhamento pastoral,
            conforme a LGPD. *
          </span>
        </label>
        {feedback && <Message value={feedback} error={failed} />}
        <button className={submit} disabled={busy}>
          {busy ? "Salvando…" : "Registrar sindicância"}
        </button>
      </form>
    </section>
  );
}

export function Visita() {
  const access = useAccess();
  const [family, setFamily] = useState("");
  const [date, setDate] = useState(today());
  const [kind, setKind] = useState<
    "Primeira visita" | "Acompanhamento" | "Entrega" | "Espiritual" | "Reavaliação"
  >("Acompanhamento");
  const [volunteers, setVolunteers] = useState("");
  const [status, setStatus] = useState("");
  const [prayer, setPrayer] = useState("");
  const [needs, setNeeds] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!family) {
      setFailed(true);
      setMessage("Selecione uma família.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("visitas").insert({
      assistido_id: family,
      data_visita: date,
      tipo_visita: kind,
      voluntarios: volunteers
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      como_familia_esta: status || null,
      intencao_oracao: prayer || null,
      necessidades: needs
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      proxima_visita: next || null,
      created_by: access.id,
    });
    setBusy(false);
    setFailed(!!error);
    setMessage(error ? `Não foi possível salvar: ${error.message}` : "Visita registrada.");
    if (!error) {
      setFamily("");
      setStatus("");
      setPrayer("");
      setNeeds("");
      setNext("");
    }
  }
  return (
    <section>
      <PageTitle title="Registrar visita" detail="Escuta e acompanhamento da família." />
      <form onSubmit={save} className="max-w-2xl space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <FamilyPicker value={family} onChange={setFamily} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Data *
            <input
              className={field}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className={label}>
            Tipo
            <select
              className={field}
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              {["Primeira visita", "Acompanhamento", "Entrega", "Espiritual", "Reavaliação"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </label>
        </div>
        <label className={label}>
          Voluntários (separe por vírgula) *
          <input
            className={field}
            required
            value={volunteers}
            onChange={(e) => setVolunteers(e.target.value)}
          />
        </label>
        <label className={label}>
          Como a família está?
          <textarea
            className={field}
            rows={3}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </label>
        <label className={label}>
          Intenção de oração (opcional)
          <textarea
            className={field}
            rows={2}
            value={prayer}
            onChange={(e) => setPrayer(e.target.value)}
          />
        </label>
        <label className={label}>
          Necessidades (separe por vírgula)
          <input className={field} value={needs} onChange={(e) => setNeeds(e.target.value)} />
        </label>
        <label className={label}>
          Próxima visita
          <input
            className={field}
            type="date"
            min={date}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
        {message && <Message value={message} error={failed} />}
        <button className={submit} disabled={busy}>
          {busy ? "Salvando…" : "Registrar visita"}
        </button>
      </form>
    </section>
  );
}

export function Entrega() {
  const access = useAccess();
  const [family, setFamily] = useState("");
  const [date, setDate] = useState(today());
  const [kind, setKind] = useState<
    | "Cesta básica"
    | "Roupas"
    | "Medicamento"
    | "Material escolar"
    | "Material de higiene"
    | "Gás"
    | "Auxílio financeiro"
    | "Outro"
  >("Cesta básica");
  const [quantity, setQuantity] = useState(1);
  const [prior, setPrior] = useState(true);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!family) {
      setFailed(true);
      setMessage("Selecione uma família.");
      return;
    }
    if (!prior && !reason.trim()) {
      setFailed(true);
      setMessage("Explique por que a entrega ocorreu sem visita prévia.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("entregas").insert({
      assistido_id: family,
      data_entrega: date,
      tipo_entrega: kind,
      quantidade: quantity,
      visita_previa: prior,
      justificativa: reason || null,
      created_by: access.id,
      paroquia_id: access.parishId,
    });
    setBusy(false);
    setFailed(!!error);
    setMessage(error ? `Não foi possível salvar: ${error.message}` : "Entrega registrada.");
    if (!error) {
      setFamily("");
      setReason("");
    }
  }
  return (
    <section>
      <PageTitle title="Registrar entrega" detail="Prestação de contas do auxílio material." />
      <form onSubmit={save} className="max-w-2xl space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <FamilyPicker value={family} onChange={setFamily} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Data *
            <input
              className={field}
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className={label}>
            Benefício
            <select
              className={field}
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
            >
              {[
                "Cesta básica",
                "Roupas",
                "Medicamento",
                "Material escolar",
                "Material de higiene",
                "Gás",
                "Auxílio financeiro",
                "Outro",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <label className={label}>
          Quantidade *
          <input
            className={field}
            type="number"
            min="1"
            step="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={prior} onChange={(e) => setPrior(e.target.checked)} />
          Houve visita domiciliar prévia
        </label>
        <label className={label}>
          Justificativa{!prior && " *"}
          <textarea
            className={field}
            required={!prior}
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        {message && <Message value={message} error={failed} />}
        <button className={submit} disabled={busy}>
          {busy ? "Salvando…" : "Confirmar entrega"}
        </button>
      </form>
    </section>
  );
}
