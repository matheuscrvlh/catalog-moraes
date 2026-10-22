import { hasPermission, type Permission } from "@/lib/auth/permissions";

export type NavKey =
  | "dashboard"
  | "products"
  | "categories"
  | "producers"
  | "banners"
  | "orders"
  | "customers"
  | "users"
  | "roles"
  | "settings";

export type NavItem = { key: NavKey; href: string; label: string; permission: Permission };

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Visão geral",
    items: [{ key: "dashboard", href: "/admin", label: "Dashboard", permission: "dashboard.view" }],
  },
  {
    group: "Catálogo",
    items: [
      { key: "products", href: "/admin/produtos", label: "Produtos", permission: "products.manage" },
      { key: "categories", href: "/admin/categorias", label: "Categorias", permission: "catalog.manage" },
      { key: "producers", href: "/admin/vinicolas", label: "Vinícolas", permission: "catalog.manage" },
      { key: "banners", href: "/admin/banners", label: "Banners", permission: "catalog.manage" },
    ],
  },
  {
    group: "Vendas",
    items: [
      { key: "orders", href: "/admin/pedidos", label: "Pedidos", permission: "orders.manage" },
      { key: "customers", href: "/admin/clientes", label: "Clientes", permission: "customers.view" },
    ],
  },
  {
    group: "Equipe",
    items: [
      { key: "users", href: "/admin/usuarios", label: "Usuários", permission: "users.manage" },
      { key: "roles", href: "/admin/cargos", label: "Cargos", permission: "roles.manage" },
    ],
  },
  {
    group: "Plataforma",
    items: [{ key: "settings", href: "/admin/configuracoes", label: "Configurações", permission: "settings.manage" }],
  },
];

export function navFor(permissions: readonly string[]) {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(permissions, item.permission)),
  })).filter((group) => group.items.length > 0);
}

export function landingFor(permissions: readonly string[]) {
  return navFor(permissions)[0]?.items[0]?.href ?? "/admin/sem-acesso";
}
