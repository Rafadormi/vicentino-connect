export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assistidos: {
        Row: {
          anonimizado: boolean
          bairro: string | null
          cidade: string | null
          complemento: string | null
          consentimento_anexo_url: string | null
          consentimento_lgpd: boolean
          cpf: string | null
          created_at: string
          created_by: string | null
          data_nascimento: string | null
          data_ultima_entrega: string | null
          data_ultima_visita: string | null
          flag_duplicidade_beneficio: boolean
          id: string
          motivo_vinculo: Database["public"]["Enums"]["motivo_vinculo"] | null
          motivo_vinculo_outro: string | null
          nome_completo: string
          numero: string | null
          observacoes_sensiveis: string | null
          paroquia_referencia_id: string | null
          paroquia_vinculo_id: string | null
          rua: string | null
          status_assistido: Database["public"]["Enums"]["status_assistido"]
          telefone: string | null
          territorio_validado:
            | Database["public"]["Enums"]["territorio_validado"]
            | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          anonimizado?: boolean
          bairro?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_anexo_url?: string | null
          consentimento_lgpd?: boolean
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_ultima_entrega?: string | null
          data_ultima_visita?: string | null
          flag_duplicidade_beneficio?: boolean
          id?: string
          motivo_vinculo?: Database["public"]["Enums"]["motivo_vinculo"] | null
          motivo_vinculo_outro?: string | null
          nome_completo: string
          numero?: string | null
          observacoes_sensiveis?: string | null
          paroquia_referencia_id?: string | null
          paroquia_vinculo_id?: string | null
          rua?: string | null
          status_assistido?: Database["public"]["Enums"]["status_assistido"]
          telefone?: string | null
          territorio_validado?:
            | Database["public"]["Enums"]["territorio_validado"]
            | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          anonimizado?: boolean
          bairro?: string | null
          cidade?: string | null
          complemento?: string | null
          consentimento_anexo_url?: string | null
          consentimento_lgpd?: boolean
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          data_nascimento?: string | null
          data_ultima_entrega?: string | null
          data_ultima_visita?: string | null
          flag_duplicidade_beneficio?: boolean
          id?: string
          motivo_vinculo?: Database["public"]["Enums"]["motivo_vinculo"] | null
          motivo_vinculo_outro?: string | null
          nome_completo?: string
          numero?: string | null
          observacoes_sensiveis?: string | null
          paroquia_referencia_id?: string | null
          paroquia_vinculo_id?: string | null
          rua?: string | null
          status_assistido?: Database["public"]["Enums"]["status_assistido"]
          telefone?: string | null
          territorio_validado?:
            | Database["public"]["Enums"]["territorio_validado"]
            | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistidos_paroquia_referencia_id_fkey"
            columns: ["paroquia_referencia_id"]
            isOneToOne: false
            referencedRelation: "paroquias_grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistidos_paroquia_vinculo_id_fkey"
            columns: ["paroquia_vinculo_id"]
            isOneToOne: false
            referencedRelation: "paroquias_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria: {
        Row: {
          acao: string
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          id: string
          registro_id: string | null
          tabela: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          registro_id?: string | null
          tabela: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          id?: string
          registro_id?: string | null
          tabela?: string
          user_id?: string | null
        }
        Relationships: []
      }
      entregas: {
        Row: {
          assistido_id: string
          created_at: string
          created_by: string | null
          data_entrega: string
          foto_url: string | null
          id: string
          justificativa: string | null
          paroquia_id: string | null
          quantidade: number
          tipo_entrega: Database["public"]["Enums"]["tipo_entrega"]
          unidade: string | null
          visita_previa: boolean
        }
        Insert: {
          assistido_id: string
          created_at?: string
          created_by?: string | null
          data_entrega?: string
          foto_url?: string | null
          id?: string
          justificativa?: string | null
          paroquia_id?: string | null
          quantidade?: number
          tipo_entrega: Database["public"]["Enums"]["tipo_entrega"]
          unidade?: string | null
          visita_previa?: boolean
        }
        Update: {
          assistido_id?: string
          created_at?: string
          created_by?: string | null
          data_entrega?: string
          foto_url?: string | null
          id?: string
          justificativa?: string | null
          paroquia_id?: string | null
          quantidade?: number
          tipo_entrega?: Database["public"]["Enums"]["tipo_entrega"]
          unidade?: string | null
          visita_previa?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "entregas_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_paroquia_id_fkey"
            columns: ["paroquia_id"]
            isOneToOne: false
            referencedRelation: "paroquias_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      familiares: {
        Row: {
          assistido_id: string
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          id: string
          nome: string
          observacoes: string | null
          parentesco: string | null
        }
        Insert: {
          assistido_id: string
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          parentesco?: string | null
        }
        Update: {
          assistido_id?: string
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          parentesco?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "familiares_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
        ]
      }
      paroquias_grupos: {
        Row: {
          ativo: boolean
          bairros_referencia: string[]
          created_at: string
          email_contato: string | null
          grupo: string
          id: string
          paroquia: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bairros_referencia?: string[]
          created_at?: string
          email_contato?: string | null
          grupo: string
          id?: string
          paroquia: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bairros_referencia?: string[]
          created_at?: string
          email_contato?: string | null
          grupo?: string
          id?: string
          paroquia?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome_completo: string
          paroquia_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id: string
          nome_completo: string
          paroquia_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
          paroquia_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_paroquia_id_fkey"
            columns: ["paroquia_id"]
            isOneToOne: false
            referencedRelation: "paroquias_grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          assistido_id: string
          como_familia_esta: string | null
          concluida: boolean
          created_at: string
          created_by: string | null
          data_visita: string
          id: string
          intencao_oracao: string | null
          necessidade_outra: string | null
          necessidades: string[]
          proxima_visita: string | null
          tipo_visita: Database["public"]["Enums"]["tipo_visita"]
          voluntarios: string[]
        }
        Insert: {
          assistido_id: string
          como_familia_esta?: string | null
          concluida?: boolean
          created_at?: string
          created_by?: string | null
          data_visita?: string
          id?: string
          intencao_oracao?: string | null
          necessidade_outra?: string | null
          necessidades?: string[]
          proxima_visita?: string | null
          tipo_visita?: Database["public"]["Enums"]["tipo_visita"]
          voluntarios?: string[]
        }
        Update: {
          assistido_id?: string
          como_familia_esta?: string | null
          concluida?: boolean
          created_at?: string
          created_by?: string | null
          data_visita?: string
          id?: string
          intencao_oracao?: string | null
          necessidade_outra?: string | null
          necessidades?: string[]
          proxima_visita?: string | null
          tipo_visita?: Database["public"]["Enums"]["tipo_visita"]
          voluntarios?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "visitas_assistido_id_fkey"
            columns: ["assistido_id"]
            isOneToOne: false
            referencedRelation: "assistidos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_paroquia: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coordenador" | "voluntario"
      motivo_vinculo:
        | "Frequenta missa aqui"
        | "Família histórica"
        | "Indicação vicentina"
        | "Proximidade com grupo"
        | "Outro"
      status_assistido:
        | "Ativo"
        | "Em acompanhamento"
        | "Suspenso"
        | "Encerrado"
        | "Em análise territorial"
      territorio_validado: "Sim" | "Nao" | "Em análise"
      tipo_entrega:
        | "Cesta básica"
        | "Roupas"
        | "Medicamento"
        | "Material escolar"
        | "Material de higiene"
        | "Gás"
        | "Auxílio financeiro"
        | "Outro"
      tipo_visita:
        | "Primeira visita"
        | "Acompanhamento"
        | "Entrega"
        | "Espiritual"
        | "Reavaliação"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordenador", "voluntario"],
      motivo_vinculo: [
        "Frequenta missa aqui",
        "Família histórica",
        "Indicação vicentina",
        "Proximidade com grupo",
        "Outro",
      ],
      status_assistido: [
        "Ativo",
        "Em acompanhamento",
        "Suspenso",
        "Encerrado",
        "Em análise territorial",
      ],
      territorio_validado: ["Sim", "Nao", "Em análise"],
      tipo_entrega: [
        "Cesta básica",
        "Roupas",
        "Medicamento",
        "Material escolar",
        "Material de higiene",
        "Gás",
        "Auxílio financeiro",
        "Outro",
      ],
      tipo_visita: [
        "Primeira visita",
        "Acompanhamento",
        "Entrega",
        "Espiritual",
        "Reavaliação",
      ],
    },
  },
} as const
