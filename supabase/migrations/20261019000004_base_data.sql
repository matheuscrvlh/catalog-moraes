insert into public.roles (name, description, permissions, is_system) values
  ('Administrador', 'Acesso total ao painel', array['*'], true),
  ('Gerente', 'Catálogo, pedidos e clientes', array['dashboard.view', 'products.manage', 'catalog.manage', 'orders.manage', 'customers.view'], false),
  ('Vendedor', 'Atendimento de pedidos', array['dashboard.view', 'orders.manage', 'customers.view'], false),
  ('Estoquista', 'Cadastro de produtos e estoque', array['products.manage'], false);

insert into public.store_settings (id, store_name, whatsapp, phone, instagram, about) values (
  1,
  'Moraes Comercial',
  '5522992358186',
  '(22) 2779-4940',
  'moraescomercialoficial',
  'Distribuidora de bebidas com curadoria de vinhos nacionais e importados, atendendo a Região dos Lagos.'
);
