import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "registrar_visita",
  title: "Registrar visita",
  description: "Registra uma visita vicentina a uma família assistida, em nome do usuário conectado.",
  inputSchema: {
    assistido_id: z.string().uuid(),
    data_visita: z.string().date().optional().describe("Data (AAAA-MM-DD). Padrão: hoje."),
    tipo_visita: z
      .enum(["Primeira visita", "Acompanhamento", "Entrega", "Espiritual", "Reavaliação"])
      .default("Acompanhamento"),
    como_familia_esta: z.string().trim().max(2000).optional(),
    necessidades: z.array(z.string().trim().min(1)).max(20).default([]),
    proxima_visita: z.string().date().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("visitas")
      .insert({
        assistido_id: input.assistido_id,
        data_visita: input.data_visita,
        tipo_visita: input.tipo_visita,
        como_familia_esta: input.como_familia_esta ?? null,
        necessidades: input.necessidades,
        proxima_visita: input.proxima_visita ?? null,
        created_by: ctx.getUserId(),
        concluida: true,
      })
      .select("id, data_visita, tipo_visita")
      .single();
    if (error) throw new ToolError(error.message);
    return {
      content: [{ type: "text", text: `Visita registrada (${data.id}).` }],
      structuredContent: { visita: { ...data } },
    };
  },
});
