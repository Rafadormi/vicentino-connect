import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listarParoquias from "./tools/listar-paroquias";
import buscarAssistidos from "./tools/buscar-assistidos";
import historicoAssistido from "./tools/historico-assistido";
import registrarVisita from "./tools/registrar-visita";
import { supabaseProject } from "@/integrations/supabase/project";

const projectRef = supabaseProject.ref;

export default defineMcp({
  name: "vicentino-connect",
  title: "Vicentino Connect",
  version: "0.1.0",
  instructions:
    "Ferramentas do Controle Vicentino: consultar paróquias/grupos, buscar famílias assistidas, ver histórico de visitas e entregas e registrar visitas. Os dados respeitam as permissões do usuário conectado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listarParoquias, buscarAssistidos, historicoAssistido, registrarVisita],
});
