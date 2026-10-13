-- Contas novas aguardam ativacao administrativa.
ALTER TABLE public.usuarios ALTER COLUMN ativo SET DEFAULT FALSE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome_completo, email, ativo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email), NEW.email, FALSE);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'voluntario');
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles r
    JOIN public.usuarios u ON u.id = r.user_id
    WHERE r.user_id = _user_id AND r.role = _role AND u.ativo = TRUE
  )
$$;
CREATE OR REPLACE FUNCTION public.get_user_paroquia(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT paroquia_id FROM public.usuarios WHERE id = _user_id AND ativo = TRUE
$$;
REVOKE INSERT, UPDATE, DELETE ON public.usuarios FROM authenticated;
REVOKE INSERT ON public.auditoria FROM authenticated;
DROP POLICY IF EXISTS au_insert ON public.auditoria;
DROP POLICY IF EXISTS as_insert ON public.assistidos;
CREATE POLICY as_insert ON public.assistidos FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'coordenador')
  OR (
    public.has_role(auth.uid(), 'voluntario')
    AND paroquia_vinculo_id = public.get_user_paroquia(auth.uid())
  )
);