# Páginas

## Linguagem visual

A Moraes é uma **distribuidora B2B**: o catálogo é para adegas, mercados, restaurantes e vinícolas. O texto fala com quem compra para revender ou servir.

Loja clara e sofisticada, inspirada nos mockups `home 2` (WineMart) e `home 1` (Samelian). As cores da marca aparecem só nos detalhes.

| Token | Cor | Uso |
| --- | --- | --- |
| `ivory` / `linen` | `#FAF7F2` / `#F4EEE6` | Fundo da loja e painéis dos produtos |
| `navy` | `#1B2A78` | Títulos, botões principais (azul do logo) |
| `red` | `#E3262E` | Detalhes: traços, selo de oferta, indicadores (vermelho do logo) |
| `bronze` / `earth` | `#96765A` / `#4A3A33` | Textos manuscritos e filetes (marrom do logo) |
| `royal` / `cyan` | `#2F43B8` / `#1FA3D6` | Séries dos gráficos do painel |
| `cloud` | `#EEF0F6` | Fundo do painel |

Tipografia: **Cormorant Garamond** (títulos em caixa-alta espaçada), **Allura** (detalhes manuscritos), **Jost** (texto da loja) e **Plus Jakarta Sans** (painel).

Fotos de banners e seções: Unsplash (licença livre para uso comercial), em `public/images`. As garrafas vêm do catálogo da própria Moraes.

## Loja

### Home `/`

```
┌───────────────────────────────────────────────────────────────┐
│ ◇ MORAES            Vinhos  Espumantes  Exclusivos     ⌕ ♡ ◉ 👜 │  header transparente → vidro no scroll
├───────────────────────────────────────────────────────────────┤
│  faixa superior: atendimento comercial · tabela pelo WhatsApp  │
│                                              ▌  ▌  ▌           │
│  A adega que                                 garrafas em       │
│  *chega até você.*                           parallax + reflexo │
│  [Explorar vinhos]  [WhatsApp]                                 │
│  108 rótulos · 11 países · 23 vinícolas                         │
├─ marquee de vinícolas ─────────────────────────────────────────┤
│  BANNERS (carrossel gerenciado no admin)                        │
├───────────────────────────────────────────────────────────────┤
│  Escolha pelo estilo   [Tintos][Brancos][Rosés][Espumantes]...  │  cards altos com a cor da categoria
├───────────────────────────────────────────────────────────────┤
│  Destaques da adega   ← carrossel de cards grandes →            │
├───────────────────────────────────────────────────────────────┤
│  Uma volta ao mundo   Brasil 41 · Chile 14 · Portugal 13 ...    │  lista de países com hover de garrafas
├───────────────────────────────────────────────────────────────┤
│  (fundo creme) foto da sommelier  |  texto de curadoria        │
├───────────────────────────────────────────────────────────────┤
│  Exclusivos Moraes — importação de Portugal                     │
├───────────────────────────────────────────────────────────────┤
│  Rodapé: contatos, Instagram, WhatsApp, links                   │
└───────────────────────────────────────────────────────────────┘
```

Mobile: barra inferior fixa com recorte central (referência `bottom mobile 1`): Início, Vinhos, **Sacola**, Favoritos, Conta.

### Catálogo `/vinhos`

```
┌──────────────┬────────────────────────────────────────────────┐
│ ⌕ buscar     │  Vinhos · 108 rótulos            Ordenar ▾      │
│ Estilo       │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│  ● Tintos    │  │ ▌  │ │ ▌  │ │ ▌  │ │ ▌  │  garrafa sobre     │
│  ● Brancos   │  │    │ │    │ │    │ │    │  brilho da cor da  │
│ País         │  └────┘ └────┘ └────┘ └────┘  categoria         │
│ Uva          │  Nome / vinícola · país / a partir de R$ / +    │
│ Doçura       │                                                │
│ Preço        │              [ Carregar mais ]                  │
└──────────────┴────────────────────────────────────────────────┘
```

Filtros vivem na URL (`?categoria=tintos&pais=Chile&uva=Malbec&doçura=seco&ordem=preco`) para serem compartilháveis. No mobile os filtros abrem em painel.

### Produto `/vinhos/[slug]`

```
┌───────────────────────────────┬───────────────────────────────┐
│                               │ Vinhos / Tintos                │
│        ◇  (anel do logo)      │ VINÍCOLA AURORA                │
│           ▌ garrafa           │ Aurora Gran Reserva            │
│           ▌ com brilho        │ "O topo da Aurora..."          │
│                               │ Brasil · Serra Gaúcha · 13%    │
│                               │ [Tannat][Cabernet][Touriga]    │
│                               │ R$ 129,90     – 1 +            │
│                               │ [ Adicionar à sacola ]  ♡      │
├───────────────────────────────┴───────────────────────────────┤
│ Perfil sensorial  corpo ▰▰▰▰▱  acidez ▰▰▰▱▱  tanino ...         │
│ [Uvas] [Temperatura] [Teor] [Doçura]   Harmoniza com: ...      │
│ Descrição                                                     │
│ Você também vai gostar →                                       │
└───────────────────────────────────────────────────────────────┘
```

### Sacola `/sacola`

Itens, quantidade, observações e total. "Enviar pedido" exige login, grava o pedido (`place_order`) e abre o WhatsApp da loja com o resumo e o número do pedido.

### Entrar `/entrar` · Cadastro `/cadastro`

Tela dividida: arte com garrafas à esquerda, formulário à direita.

### Minha conta `/conta`

Abas: **Pedidos** (histórico com linha do tempo de status), **Favoritos**, **Dados** (nome e telefone).

## Painel `/admin`

```
┌──────────┬────────────────────────────────────────────────────┐
│ ◇ MORAES │  Boa tarde, Juliana            [7d][30d][90d]  Loja │
│          │ ┌──────────────┐ ┌─────┐┌─────┐┌─────┐┌─────┐       │
│ Dashboard│ │ Receita   🍷 │ │Ped. ││Ticket││Clien││Visit│       │
│ Produtos │ │ taça enchendo│ └─────┘└─────┘└─────┘└─────┘       │
│ Categor. │ └──────────────┘                                    │
│ Vinícolas│ ┌─ Safra de vendas (área) ─────┐ ┌─ Composição ──┐  │
│ Banners  │ └──────────────────────────────┘ └───────────────┘  │
│ Pedidos  │ ┌─ Mapa da adega (rack de losangos = produtos) ──┐  │
│ Clientes │ │ ◆◆◆◇◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆ cor = estilo, brilho =   │  │
│ Equipe   │ │ ◆◆◆◆◆◆◇◆◆◆◆◆◆◆◆◆◆◆◆◆◆◆ estoque, vazio = zerado │  │
│ Cargos   │ └────────────────────────────────────────────────┘  │
│ Config.  │ ┌─ Mais vendidos ─┐ ┌─ Quando pedem ─┐ ┌─ Recentes ┐ │
│ [perfil] │ └─────────────────┘ └────────────────┘ └───────────┘ │
└──────────┴────────────────────────────────────────────────────┘
```

- **Login** `/admin/login`: escuro, só e-mail e senha. Usuário sem cargo não entra.
- **Produtos** `/admin/produtos`: tabela com foto, estilo, vinícola, faixa de preço, barra de estoque e status; busca e filtro por estilo.
- **Produto** `/admin/produtos/novo` e `/admin/produtos/[id]`: seções (identificação, classificação, perfil sensorial com sliders, serviço, variações em linhas editáveis, imagens com upload) e prévia do card ao vivo.
- **Categorias**, **Vinícolas**, **Banners**: listas com formulário lateral.
- **Pedidos** `/admin/pedidos`: abas por status com contagem; detalhe com itens, cliente, troca de status, notas internas e botão para chamar o cliente no WhatsApp.
- **Clientes** `/admin/clientes`: pedidos, total gasto e último pedido.
- **Equipe** `/admin/usuarios`: convidar membro (cria acesso), trocar cargo, desativar.
- **Cargos** `/admin/cargos`: matriz de permissões por cargo.
- **Configurações** `/admin/configuracoes`: dados da loja usados no site e no WhatsApp.

O menu mostra só o que o cargo permite, e cada ação no servidor confere a permissão de novo antes de tocar no banco.
