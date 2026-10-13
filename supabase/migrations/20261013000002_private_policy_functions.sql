-- Funcoes de apoio as politicas ficam fora do schema exposto pela API.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;

ALTER FUNCTION public.has_role(UUID, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.get_user_paroquia(UUID) SET SCHEMA private;

GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_paroquia(UUID) TO authenticated;
