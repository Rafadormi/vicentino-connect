
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'coordenador', 'voluntario');

CREATE TYPE public.status_assistido AS ENUM (
  'Ativo', 'Em acompanhamento', 'Suspenso', 'Encerrado', 'Em análise territorial'
);

CREATE TYPE public.territorio_validado AS ENUM ('Sim', 'Nao', 'Em análise');

CREATE TYPE public.tipo_visita AS ENUM (
  'Primeira visita', 'Acompanhamento', 'Entrega', 'Espiritual', 'Reavaliação'
);

CREATE TYPE public.motivo_vinculo AS ENUM (
  'Frequenta missa aqui',
  'Família histórica',
  'Indicação vicentina',
  'Proximidade com grupo',
  'Outro'
);

CREATE TYPE public.tipo_entrega AS ENUM (
  'Cesta básica', 'Roupas', 'Medicamento', 'Material escolar',
  'Material de higiene', 'Gás', 'Auxílio financeiro', 'Outro'
);

-- ============================================================
-- TABELA: paroquias_grupos
-- ============================================================
CREATE TABLE public.paroquias_grupos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paroquia        TEXT NOT NULL,
  grupo           TEXT NOT NULL,
  bairros_referencia TEXT[] NOT NULL DEFAULT '{}',
  email_contato   TEXT,
  telefone        TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (paroquia, grupo)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.paroquias_grupos TO authenticated;
GRANT ALL ON public.paroquias_grupos TO service_role;

-- ============================================================
-- TABELA: usuarios (perfil)
-- ============================================================
CREATE TABLE public.usuarios (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo   TEXT NOT NULL,
  email           TEXT NOT NULL,
  telefone        TEXT,
  paroquia_id     UUID REFERENCES public.paroquias_grupos(id),
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;

-- ============================================================
-- TABELA: user_roles (separada por segurança)
-- ============================================================
CREATE TABLE public.user_roles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Security definer: evita recursão em RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_paroquia(_user_id UUID)
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT paroquia_id FROM public.usuarios WHERE id = _user_id
$$;

-- ============================================================
-- TABELA: assistidos
-- ============================================================
CREATE TABLE public.assistidos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf             TEXT UNIQUE,
  nome_completo   TEXT NOT NULL,
  data_nascimento DATE,
  telefone        TEXT,
  rua             TEXT,
  numero          TEXT,
  bairro          TEXT,
  complemento     TEXT,
  cidade          TEXT DEFAULT 'Umuarama',
  uf              TEXT DEFAULT 'PR',
  paroquia_referencia_id  UUID REFERENCES public.paroquias_grupos(id),
  paroquia_vinculo_id     UUID REFERENCES public.paroquias_grupos(id),
  motivo_vinculo          public.motivo_vinculo,
  motivo_vinculo_outro    TEXT,
  territorio_validado     public.territorio_validado DEFAULT 'Em análise',
  status_assistido        public.status_assistido NOT NULL DEFAULT 'Em análise territorial',
  data_ultima_visita      DATE,
  data_ultima_entrega     DATE,
  consentimento_lgpd      BOOLEAN NOT NULL DEFAULT FALSE,
  consentimento_anexo_url TEXT,
  flag_duplicidade_beneficio BOOLEAN NOT NULL DEFAULT FALSE,
  observacoes_sensiveis   TEXT,
  anonimizado             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by              UUID REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cpf_format CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$')
);

CREATE INDEX idx_assistidos_paroquia_vinculo ON public.assistidos(paroquia_vinculo_id);
CREATE INDEX idx_assistidos_status ON public.assistidos(status_assistido);
CREATE INDEX idx_assistidos_cpf ON public.assistidos(cpf);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assistidos TO authenticated;
GRANT ALL ON public.assistidos TO service_role;

-- ============================================================
-- TABELA: familiares
-- ============================================================
CREATE TABLE public.familiares (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistido_id    UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  parentesco      TEXT,
  data_nascimento DATE,
  cpf             TEXT,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_familiares_assistido ON public.familiares(assistido_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.familiares TO authenticated;
GRANT ALL ON public.familiares TO service_role;

-- ============================================================
-- TABELA: visitas
-- ============================================================
CREATE TABLE public.visitas (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistido_id        UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  data_visita         DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_visita         public.tipo_visita NOT NULL DEFAULT 'Acompanhamento',
  voluntarios         TEXT[] NOT NULL DEFAULT '{}',
  como_familia_esta   TEXT,
  intencao_oracao     TEXT,
  necessidades        TEXT[] NOT NULL DEFAULT '{}',
  necessidade_outra   TEXT,
  proxima_visita      DATE,
  concluida           BOOLEAN NOT NULL DEFAULT TRUE,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitas_assistido ON public.visitas(assistido_id);
CREATE INDEX idx_visitas_data ON public.visitas(data_visita DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitas TO authenticated;
GRANT ALL ON public.visitas TO service_role;

-- ============================================================
-- TABELA: entregas
-- ============================================================
CREATE TABLE public.entregas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistido_id    UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  paroquia_id     UUID REFERENCES public.paroquias_grupos(id),
  data_entrega    DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_entrega    public.tipo_entrega NOT NULL,
  quantidade      NUMERIC(10,2) NOT NULL DEFAULT 1,
  unidade         TEXT DEFAULT 'un',
  visita_previa   BOOLEAN NOT NULL DEFAULT FALSE,
  justificativa   TEXT,
  foto_url        TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entregas_assistido ON public.entregas(assistido_id);
CREATE INDEX idx_entregas_data ON public.entregas(data_entrega DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entregas TO authenticated;
GRANT ALL ON public.entregas TO service_role;

-- ============================================================
-- TABELA: auditoria
-- ============================================================
CREATE TABLE public.auditoria (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  acao          TEXT NOT NULL,
  tabela        TEXT NOT NULL,
  registro_id   UUID,
  dados_antes   JSONB,
  dados_depois  JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_auditoria_user ON public.auditoria(user_id);
CREATE INDEX idx_auditoria_tabela ON public.auditoria(tabela, registro_id);
GRANT SELECT, INSERT ON public.auditoria TO authenticated;
GRANT ALL ON public.auditoria TO service_role;

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_paroquias_updated  BEFORE UPDATE ON public.paroquias_grupos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_usuarios_updated   BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_assistidos_updated BEFORE UPDATE ON public.assistidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- TRIGGER: atualizar data_ultima_visita / entrega + duplicidade
-- ============================================================
CREATE OR REPLACE FUNCTION public.atualizar_ultima_visita()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.assistidos
     SET data_ultima_visita = NEW.data_visita
   WHERE id = NEW.assistido_id
     AND (data_ultima_visita IS NULL OR data_ultima_visita < NEW.data_visita);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_visitas_ultima AFTER INSERT ON public.visitas
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_ultima_visita();

CREATE OR REPLACE FUNCTION public.atualizar_ultima_entrega()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cpf TEXT;
  v_dup BOOLEAN := FALSE;
BEGIN
  UPDATE public.assistidos
     SET data_ultima_entrega = NEW.data_entrega
   WHERE id = NEW.assistido_id
     AND (data_ultima_entrega IS NULL OR data_ultima_entrega < NEW.data_entrega);

  SELECT cpf INTO v_cpf FROM public.assistidos WHERE id = NEW.assistido_id;
  IF v_cpf IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
        FROM public.entregas e
        JOIN public.assistidos a ON a.id = e.assistido_id
       WHERE a.cpf = v_cpf
         AND e.data_entrega >= CURRENT_DATE - INTERVAL '30 days'
         AND a.paroquia_vinculo_id IS DISTINCT FROM
             (SELECT paroquia_vinculo_id FROM public.assistidos WHERE id = NEW.assistido_id)
    ) INTO v_dup;

    IF v_dup THEN
      UPDATE public.assistidos SET flag_duplicidade_beneficio = TRUE
       WHERE cpf = v_cpf;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_entregas_ultima AFTER INSERT ON public.entregas
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_ultima_entrega();

-- ============================================================
-- TRIGGER: criar usuário automaticamente ao cadastrar conta
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome_completo, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voluntario');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.paroquias_grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistidos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiares       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entregas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria        ENABLE ROW LEVEL SECURITY;

-- paroquias_grupos: todos autenticados leem; admin gerencia
CREATE POLICY pg_select ON public.paroquias_grupos FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY pg_admin  ON public.paroquias_grupos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- usuarios: próprio perfil; admins/coordenadores veem todos
CREATE POLICY us_self_select ON public.usuarios FOR SELECT TO authenticated
  USING (id = auth.uid()
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role(auth.uid(), 'coordenador'));
CREATE POLICY us_self_update ON public.usuarios FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY us_admin_insert ON public.usuarios FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY us_admin_delete ON public.usuarios FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: usuário vê suas roles; admin gerencia
CREATE POLICY ur_self_select ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY ur_admin_all ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- assistidos: admin/coord veem todos; voluntário só do seu grupo/paróquia
CREATE POLICY as_select ON public.assistidos FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordenador')
  OR paroquia_vinculo_id = public.get_user_paroquia(auth.uid())
);
CREATE POLICY as_insert ON public.assistidos FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordenador')
  OR public.has_role(auth.uid(), 'voluntario')
);
CREATE POLICY as_update ON public.assistidos FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordenador')
  OR paroquia_vinculo_id = public.get_user_paroquia(auth.uid())
);
CREATE POLICY as_delete ON public.assistidos FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- familiares: herda do assistido
CREATE POLICY fa_select ON public.familiares FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  )
);
CREATE POLICY fa_mutate ON public.familiares FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ));

-- visitas: mesmo critério
CREATE POLICY vi_select ON public.visitas FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  )
);
CREATE POLICY vi_mutate ON public.visitas FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ));

-- entregas: mesmo critério
CREATE POLICY en_select ON public.entregas FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  )
);
CREATE POLICY en_mutate ON public.entregas FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.assistidos a
     WHERE a.id = assistido_id
       AND (public.has_role(auth.uid(), 'admin')
            OR public.has_role(auth.uid(), 'coordenador')
            OR a.paroquia_vinculo_id = public.get_user_paroquia(auth.uid()))
  ));

-- auditoria: admin/coordenador leem; inserts via service_role
CREATE POLICY au_select ON public.auditoria FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordenador')
);
CREATE POLICY au_insert ON public.auditoria FOR INSERT TO authenticated WITH CHECK (TRUE);
