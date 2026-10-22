# Moraes Comercial · Catálogo de vinhos

Catálogo B2B de vinhos da Distribuidora Moraes Comercial (para adegas, mercados, restaurantes e vinícolas) com painel administrativo.

- **Loja**: home com banners fotográficos, catálogo com filtros na URL, página de produto com ficha técnica e perfil sensorial, favoritos, pedido que é gravado e enviado ao vendedor pelo WhatsApp, cadastro de empresa (CNPJ e tipo de negócio) e conta com histórico.
- **Painel** (`/admin`): dashboard (receita, pedidos, vendas por estilo, origem dos vinhos, taxa de conversão, mapa do estoque, mapa de calor, rankings), produtos com variações e fotos, categorias, vinícolas, banners agendáveis, pedidos com status, clientes, equipe, cargos com permissões e configurações da loja.

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Supabase (Postgres + Auth + Storage), Zod e Motion.

Documentação: [banco de dados](docs/database.md) · [páginas e linguagem visual](docs/pages.md)

## Rodando localmente

Requisitos: Node 20.9+, Docker (para o Supabase local).

```bash
npm install
npx supabase start          # sobe Postgres, Auth e Storage locais e aplica migrations + seeds
cp .env.example .env.local  # preencha com as chaves exibidas pelo comando acima
npm run dev
```

Usuários de demonstração (senha `moraes123`):

| E-mail | Acesso |
| --- | --- |
| `admin@moraes.dev` | Administrador |
| `gerente@moraes.dev` | Gerente |
| `vendas@moraes.dev` | Vendedor |
| `ana.silva@exemplo.com` | Cliente (Adega Vila Nova) |

Scripts úteis:

```bash
npx supabase db reset   # recria o banco local com migrations e seeds
npm run db:types        # regenera lib/supabase/database.types.ts
npm run lint
npm run format
```

## Publicando no Supabase

1. Crie o projeto no Supabase e anote **URL**, **publishable key** e **secret key** (Project Settings → API).
2. Aplique o schema:
   ```bash
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push
   ```
3. Carregue o catálogo inicial executando `supabase/seed.sql` no SQL Editor. **Não** rode `supabase/seeds/demo.sql` em produção: ele cria usuários e pedidos fictícios.
4. Em **Authentication → URL Configuration**, defina o Site URL do domínio e adicione `https://seu-dominio/auth/confirmar` às Redirect URLs.
5. Crie o primeiro administrador em **Authentication → Users** e promova-o pelo SQL Editor:
   ```sql
   update public.profiles
   set role_id = (select id from public.roles where name = 'Administrador')
   where email = 'seu-email@dominio.com';
   ```
6. Configure as variáveis de ambiente na hospedagem (Vercel ou outra) conforme `.env.example`. A `SUPABASE_SECRET_KEY` fica só no servidor e é usada apenas para criar acessos da equipe.

Os preços do catálogo inicial são **valores de referência**; ajuste no painel em Produtos.

## Estrutura

```
app/(store)        páginas da loja
app/admin          login e painel
components/store   componentes da loja
components/admin   componentes do painel (dashboard, formulários, tabelas)
lib/catalog        consultas públicas em cache e filtros
lib/admin          ações de servidor do painel
lib/auth           sessão, permissões e ações de login
supabase           migrations, seeds e config local
```

## Segurança

- Todo acesso a dados passa por RLS no Postgres; as ações de servidor conferem a permissão de novo antes de gravar.
- Pedidos são criados apenas pela função `place_order`, que recalcula os preços no banco.
- Clientes não conseguem alterar o próprio cargo (permissão de update por coluna) e trocas de cargo passam por `admin_update_member`, que impede remover o último administrador.
- Upload de imagens restrito à equipe com permissão de catálogo, até 5 MB e apenas imagens.

## Créditos

Fotos de ambientação: [Unsplash](https://unsplash.com/license) (licença livre para uso comercial). Fotos das garrafas: catálogo da Moraes Comercial.
