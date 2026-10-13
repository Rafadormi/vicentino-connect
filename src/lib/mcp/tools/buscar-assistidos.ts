import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "buscar_assistidos",
  title: "Buscar famílias assistidas",
  description:
    "Busca famílias assistidas visíveis ao usuário por nome, bairro ou status. Não retorna CPF nem observações sensíveis.",
  inputSchema: {
    nome: z.string().trim().min(1).optional().describe("Parte do nome do responsável."),
    bairro: z.string().trim().min(1).optional().describe("Bairro."),
    status: z
      .enum(["Ativo", "Em acompanhamento", "Suspenso", "Encerrado", "Em análise territorial"])
      .optional(),
    limite: z.number().int().min(1).max(100).default(25),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ nome, bairro, status, limite }, ctx) => {
    let q = supabaseForUser(ctx)
      .from("assistidos")
      .select(
        "id, nome_completo, bairro, cidade, status_assistido, territorio_validado, data_ultima_visita, data_ultima_entrega, flag_duplicidade_beneficio",
      )
      .eq("anonimizado", false)
      .order("nome_completo")
      .limit(limite);
    if (nome) q = q.ilike("nome_completo", `%${nome}%`);
    if (bairro) q = q.ilike("bairro", `%${bairro}%`);
    if (status) q = q.eq("status_assistido", status);
    const { data, error } = await q;
    if (error) throw new ToolError(error.message);
    const assistidos = (data ?? []).map((a) => ({ ...a }));
    return {
      content: [{ type: "text", text: JSON.stringify(assistidos) }],
      structuredContent: { assistidos },
    };
  },
});
