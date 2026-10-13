-- Limita as funcoes com privilegios elevados aos usos das politicas e dos triggers.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT _user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.user_roles r
    JOIN public.usuarios u ON u.id = r.user_id
    WHERE r.user_id = _user_id AND r.role = _role AND u.ativo = TRUE
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_paroquia(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT paroquia_id FROM public.usuarios
  WHERE id = _user_id AND _user_id = auth.uid() AND ativo = TRUE
$$;

REVOKE EXECUTE ON FUNCTION public.atualizar_ultima_visita() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atualizar_ultima_entrega() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_paroquia(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_paroquia(UUID) TO authenticated;
