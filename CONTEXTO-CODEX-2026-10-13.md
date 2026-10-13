# Vicentino Connect V3 — contexto local (2026-10-13)

## Fonte e banco
- Repositório: https://github.com/Rafadormi/vicentino-connect
- Projeto Lovable: https://lovable.dev/projects/26dce99a-56e8-45f9-8e2f-159323ae74da
- Supabase definitivo: `wnrmoiwczvyjhoclnpbz` (`https://wnrmoiwczvyjhoclnpbz.supabase.co`).
- Referência V3: `G:\Meu Drive\[SSVP] Controle Vicentino Umuarama\5_Sistema_Web_V3\index.html`.
- O banco integrado antigo do Lovable (`rqygtziqkfywaiktmzvx`) continua existindo, mas a aplicação agora usa explicitamente o Supabase definitivo em `src/integrations/supabase/project.ts`. A chave de publicação ali é pública. Nunca colocar chave secreta no Git ou no frontend.

## Implementado
- Login por e-mail/senha do Supabase e portão de acesso por perfil ativo, papel e paróquia para voluntários.
- Consulta rápida, sindicância, visita, entrega, painel pastoral, ficha de campo A4 e telas administrativas de leitura para usuários e auditoria.
- As consultas respeitam RLS. O esquema e as quatro migrações locais foram aplicados ao Supabase definitivo em 2026-10-13.
- As funções internas das políticas ficam no schema `private` e não são publicadas pela API REST.

## Administrador e dados
- `rafaelamaroumuarama@gmail.com` já está em `auth.users` do Supabase definitivo, com e-mail confirmado.
- Perfil ativo e papel `admin` foram criados nesse banco. A senha não foi lida nem alterada.
- O banco integrado antigo do Lovable tinha zero paróquias, usuários, assistidos, visitas e entregas na verificação de 2026-10-13. Nenhum dado operacional precisou ser copiado.
- O banco definitivo também começou sem dados operacionais; as telas mostrarão estados vazios até o cadastro de paróquias e famílias.
- As telas de Usuários/Auditoria são de leitura; convites e atribuição de perfis continuam sob controle administrativo no Supabase.

## Segurança pendente
- A chave secreta enviada no chat deve ser revogada e substituída em Supabase > Project Settings > API Keys. A aplicação não usa essa chave.
- O advisor de segurança ainda indica proteção contra senhas vazadas desativada em Auth; ativar nas configurações do Supabase.
- O MCP Supabase foi registrado no Codex CLI, mas a autenticação OAuth local não foi concluída. A revisão automática bloqueou a abertura do consentimento porque solicita escopos amplos. O conector Supabase já autenticado no Codex foi usado na migração.
- As versões registradas no histórico remoto das migrações foram geradas pelo conector e diferem dos prefixos dos arquivos locais. Conferir/alinha-las antes de usar `supabase db push` nesse projeto; não reaplicar as migrações existentes.

## Verificação
- `npm run build` e `npx tsc --noEmit` passaram após a troca do banco.
- RLS ativo nas oito tabelas, perfil admin visível como usuário autenticado e invisível como anônimo.
- `npm run preview` local retorna 500 porque o template procura `dist/server/server.js`, enquanto o build gera `.output`. O servidor `npm run dev` funcionou em verificação anterior.
- No Windows, o plugin MCP do Lovable usa separadores de caminho incompatíveis; `vite.config.ts` omite esse plugin apenas no Windows. O lint geral acusa finais de linha CRLF pré-existentes no checkout.
