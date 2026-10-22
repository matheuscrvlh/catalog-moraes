import { hasPermission, type Permission } from "@/lib/auth/permissions";

export type NavKey =
  "dashboard" | "products" | "categories" | "producers" | "orders" | "customers" | "users" | "roles" | "settings";

export type NavItem = {
  key: NavKey;
  href: string;
  label: string;
  permission: Permission | Permission[];
  keywords?: string;
};

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Visão geral",
    items: [
      {
        key: "dashboard",
        href: "/admin",
        label: "Dashboard",
        permission: "dashboard.view",
        keywords: "relatório vendas indicadores gráficos",
      },
    ],
  },
  {
    group: "Catálogo",
    items: [
      {
        key: "products",
        href: "/admin/produtos",
        label: "Produtos",
        permission: "products.manage",
        keywords: "vinhos rótulos estoque novo produto",
      },
      {
        key: "categories",
        href: "/admin/categorias",
        label: "Categorias",
        permission: "catalog.manage",
        keywords: "estilos tintos brancos espumantes",
      },
      {
        key: "producers",
        href: "/admin/vinicolas",
        label: "Vinícolas",
        permission: "catalog.manage",
        keywords: "marcas produtores",
      },
    ],
  },
  {
    group: "Vendas",
    items: [
      {
        key: "orders",
        href: "/admin/pedidos",
        label: "Pedidos",
        permission: "orders.manage",
        keywords: "vendas novo pedido atendimento",
      },
      {
        key: "customers",
        href: "/admin/clientes",
        label: "Clientes",
        permission: "customers.view",
        keywords: "empresas adegas mercados restaurantes novo cliente",
      },
    ],
  },
  {
    group: "Equipe",
    items: [
      {
        key: "users",
        href: "/admin/usuarios",
        label: "Usuários",
        permission: "users.manage",
        keywords: "equipe membros acessos senha",
      },
      {
        key: "roles",
        href: "/admin/cargos",
        label: "Cargos",
        permission: "roles.manage",
        keywords: "permissões funções",
      },
    ],
  },
  {
    group: "Plataforma",
    items: [
      {
        key: "settings",
        href: "/admin/configuracoes",
        label: "Configurações",
        permission: ["settings.manage", "catalog.manage"],
        keywords: "loja preços contato whatsapp plataforma banners home destaques",
      },
    ],
  },
];

export function navFor(permissions: readonly string[]) {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => [item.permission].flat().some((key) => hasPermission(permissions, key))),
  })).filter((group) => group.items.length > 0);
}

export function landingFor(permissions: readonly string[]) {
  return navFor(permissions)[0]?.items[0]?.href ?? "/admin/sem-acesso";
}

export const SETTINGS_TABS: { href: string; label: string; permission: Permission }[] = [
  { href: "/admin/configuracoes", label: "Geral", permission: "settings.manage" },
  { href: "/admin/configuracoes/banners", label: "Banners", permission: "catalog.manage" },
];
