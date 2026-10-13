import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const today = () => new Date().toLocaleDateString("en-CA");
export function cpfFormat(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}
export function maskCpf(value: string | null) {
  return value ? "***.***.***-" + value.slice(-2) : "CPF não informado";
}
export function PageTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-[#00236f]">{title}</h1>
      {detail && <p className="mt-1 text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}
export function Message({ value, error = false }: { value: string; error?: boolean }) {
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-md p-3 text-sm ${error ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-900"}`}
    >
      {value}
    </p>
  );
}
export function FamilyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [term, setTerm] = useState("");
  const [items, setItems] = useState<
    { id: string; nome_completo: string; bairro: string | null }[]
  >([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (term.trim().length < 2) {
      setItems([]);
      return;
    }
    let live = true;
    const timer = setTimeout(async () => {
      const safe = term.trim().replace(/[%,()]/g, "");
      const { data, error: queryError } = await supabase
        .from("assistidos")
        .select("id,nome_completo,bairro")
        .eq("anonimizado", false)
        .or(`nome_completo.ilike.%${safe}%,bairro.ilike.%${safe}%`)
        .limit(20);
      if (live) {
        setItems(data ?? []);
        setError(queryError?.message ?? "");
      }
    }, 300);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [term]);
  return (
    <div className="space-y-2">
      <label htmlFor="family-search" className="block text-sm font-medium">
        Família atendida *
      </label>
      <input
        id="family-search"
        className="w-full rounded-md border bg-white p-3"
        placeholder="Busque por nome ou bairro"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          onChange("");
        }}
      />
      {error && <Message value={error} error />}
      {items.length > 0 && (
        <ul className="max-h-52 overflow-auto rounded-md border bg-white">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onChange(item.id);
                  setTerm(item.nome_completo);
                  setItems([]);
                }}
                className="w-full p-3 text-left hover:bg-blue-50"
              >
                {item.nome_completo} <span className="text-muted-foreground">— {item.bairro}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && <p className="text-sm text-emerald-700">Família selecionada.</p>}
    </div>
  );
}
export const field = "w-full rounded-md border border-slate-300 bg-white p-3 text-sm";
export const label = "block space-y-1 text-sm font-medium";
export const submit =
  "rounded-md bg-[#00236f] px-5 py-3 font-medium text-white disabled:opacity-60";
