import { createFileRoute } from "@tanstack/react-router";
import { Consulta, Painel, Ficha, Usuarios, Auditoria } from "@/components/vicentino/Views";
import { Sindicancia, Visita, Entrega } from "@/components/vicentino/Forms";

export const Route = createFileRoute("/app/$section")({ component: Section });

function Section() {
  const { section } = Route.useParams();
  switch (section) {
    case "consulta":
      return <Consulta />;
    case "sindicancia":
      return <Sindicancia />;
    case "visitas":
      return <Visita />;
    case "entregas":
      return <Entrega />;
    case "painel":
      return <Painel />;
    case "ficha":
      return <Ficha />;
    case "usuarios":
      return <Usuarios />;
    case "auditoria":
      return <Auditoria />;
    default:
      return (
        <main className="p-8">
          <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        </main>
      );
  }
}
