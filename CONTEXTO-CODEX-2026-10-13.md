# Vicentino Connect V3 — contexto local (2026-10-13)

## Fonte e fluxo
- Repositório: https://github.com/Rafadormi/vicentino-connect
- Projeto Lovable: https://lovable.dev/projects/26dce99a-56e8-45f9-8e2f-159323ae74da
- Supabase do Vicentino: `rqygtziqkfywaiktmzvx`. O projeto `wnrmoiwczvyjhoclnpbz` aberto em outro painel não pertence a este app.
- Referência V3: `G:\Meu Drive\[SSVP] Controle Vicentino Umuarama\5_Sistema_Web_V3\index.html`.

## Implementado
- Login por e-mail/senha do Supabase e portão de acesso por perfil ativo, papel e paróquia para voluntários.
- Consulta rápida, sindicância, visita, entrega, painel pastoral, ficha de campo A4 e telas administrativas de leitura para usuários e auditoria.
- As consultas respeitam as políticas RLS do banco; a migração `20261013000000_auth_access_hardening.sql` foi aplicada ao Supabase do Vicentino em 2026-10-13.

## Primeiro administrador pendente
- E-mail indicado: `rafaelamaroumuarama@gmail.com`.
- Ainda não há conta em `auth.users`. O convite deve ser enviado em **Authentication > Users > Invite user** no Supabase do Vicentino. Não compartilhar senha no chat ou no código.
- Após o convite criar a conta, ativar o perfil e atribuir papel admin no banco:
```sql
BEGIN;
UPDATE public.usuarios SET ativo = TRUE
WHERE email = 'rafaelamaroumuarama@gmail.com';
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM public.usuarios
WHERE email = 'rafaelamaroumuarama@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
COMMIT;
```
- Confirmar o e-mail e entrar pelo formulário de login. A conta nasce inativa por segurança.
- As telas de Usuários/Auditoria são de leitura; convites e atribuição de perfis continuam sob controle administrativo no Supabase.

## Verificação
- `npm install --no-package-lock --ignore-scripts`
- `npm run build`
- `npx tsc --noEmit`
- `npx eslint src/routes/index.tsx src/routes/login.tsx src/routes/app.tsx 'src/routes/app.$section.tsx' src/components/vicentino --rule 'prettier/prettier: off'`
- Rotas respondem no servidor `npm run dev` (HTTP 200; `/login` redireciona para `?next=/app/consulta`). `npm run preview` local retorna 500 porque o template procura `dist/server/server.js`, enquanto o build gera `.output`.
- No Windows, o plugin MCP do Lovable usa separadores de caminho incompatíveis; `vite.config.ts` omite esse plugin apenas no Windows. O lint geral acusa finais de linha CRLF pré-existentes no checkout.
