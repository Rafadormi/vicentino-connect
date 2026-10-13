import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "historico_assistido",
  title: "Histórico da família",
  description: "Retorna as visitas e entregas recentes de uma família assistida.",
  inputSchema: {
    assistido_id: z.string().uuid().describe("ID da família assistida."),
    limite: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ assistido_id, limite }, ctx) => {
    const sb = supabaseForUser(ctx);
    const [visitas, entregas] = await Promise.all([
      sb
        .from("visitas")
        .select("id, data_visita, tipo_visita, necessidades, como_familia_esta, proxima_visita, concluida")
        .eq("assistido_id", assistido_id)
        .order("data_visita", { ascending: false })
        .limit(limite),
      sb
        .from("entregas")
        .select("id, data_entrega, tipo_entrega, quantidade, unidade, justificativa")
        .eq("assistido_id", assistido_id)
        .order("data_entrega", { ascending: false })
        .limit(limite),
    ]);
    if (visitas.error) throw new ToolError(visitas.error.message);
    if (entregas.error) throw new ToolError(entregas.error.message);
    const result = {
      visitas: (visitas.data ?? []).map((v) => ({ ...v, necessidades: [...v.necessidades] })),
      entregas: (entregas.data ?? []).map((e) => ({ ...e })),
    };
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
  },
});
