import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "listar_paroquias",
  title: "Listar paróquias e grupos",
  description: "Lista as paróquias e grupos vicentinos ativos com seus bairros de referência.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("paroquias_grupos")
      .select("id, paroquia, grupo, bairros_referencia, telefone, ativo")
      .eq("ativo", true)
      .order("paroquia");
    if (error) throw new ToolError(error.message);
    const paroquias = (data ?? []).map((p) => ({
      id: p.id,
      paroquia: p.paroquia,
      grupo: p.grupo,
      bairros_referencia: [...p.bairros_referencia],
      telefone: p.telefone,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(paroquias) }],
      structuredContent: { paroquias },
    };
  },
});
