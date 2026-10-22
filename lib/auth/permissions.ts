export const PERMISSIONS = {
  "dashboard.view": { label: "Dashboard", description: "Indicadores, gráficos e histórico de atividade" },
  "products.manage": { label: "Produtos", description: "Cadastro de vinhos, variações, fotos e estoque" },
  "catalog.manage": { label: "Catálogo", description: "Categorias, vinícolas e banners da home" },
  "orders.manage": { label: "Pedidos", description: "Visualizar e atualizar pedidos" },
  "customers.view": { label: "Clientes", description: "Lista e histórico de clientes" },
  "users.manage": { label: "Equipe", description: "Convidar membros, trocar cargos e desativar acessos" },
  "roles.manage": { label: "Cargos", description: "Criar cargos e definir permissões" },
  "settings.manage": { label: "Configurações", description: "Dados da loja exibidos no site" },
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type Grant = Permission | "*";

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as Permission[];

export function hasPermission(grants: readonly string[], permission: Permission) {
  return grants.includes("*") || grants.includes(permission);
}
