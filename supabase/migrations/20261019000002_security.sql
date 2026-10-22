alter table public.roles add constraint roles_permissions_known check (
  permissions <@ array[
    '*',
    'dashboard.view',
    'products.manage',
    'catalog.manage',
    'orders.manage',
    'customers.view',
    'users.manage',
    'roles.manage',
    'settings.manage'
  ]::text[]
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'roles', 'profiles', 'categories', 'producers', 'products',
    'product_variants', 'banners', 'orders', 'store_settings'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

create or replace function public.has_permission(permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and p.active
      and (permission = any (r.permissions) or '*' = any (r.permissions))
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and active and role_id is not null
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    left(new.raw_user_meta_data ->> 'phone', 30)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute function public.handle_user_email_change();

create or replace function public.guard_system_roles()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.is_system then
      raise exception 'Cargos do sistema não podem ser removidos' using errcode = '42501';
    end if;
    return old;
  end if;

  if old.is_system and (new.permissions is distinct from old.permissions or not new.is_system) then
    raise exception 'Permissões de cargos do sistema são fixas' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_system_roles
before update or delete on public.roles
for each row execute function public.guard_system_roles();

create or replace function public.guard_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if '*' = any (new.permissions) and not exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid()) and p.active and '*' = any (r.permissions)
  ) and (select auth.uid()) is not null then
    raise exception 'Somente administradores concedem acesso total' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger guard_role_escalation
before insert or update on public.roles
for each row execute function public.guard_role_escalation();

create or replace function public.admin_update_member(target uuid, new_role uuid, is_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  current_role_id uuid;
  current_active boolean;
begin
  if not public.has_permission('users.manage') then
    raise exception 'Sem permissão' using errcode = '42501';
  end if;

  select role_id, active into current_role_id, current_active
  from public.profiles
  where id = target
  for update;

  if not found then
    raise exception 'Usuário não encontrado' using errcode = 'P0002';
  end if;

  if target = caller and (new_role is distinct from current_role_id or not is_active) then
    raise exception 'Você não pode alterar o próprio acesso' using errcode = '42501';
  end if;

  if new_role is not null
    and exists (select 1 from public.roles where id = new_role and '*' = any (permissions))
    and not public.has_permission('*') then
    raise exception 'Somente administradores concedem acesso total' using errcode = '42501';
  end if;

  update public.profiles
  set role_id = new_role, active = is_active
  where id = target;

  if not exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.active and '*' = any (r.permissions)
  ) then
    raise exception 'É necessário manter ao menos um administrador ativo' using errcode = '23514';
  end if;

  insert into public.audit_logs (actor_id, action, entity, entity_id, summary)
  values (caller, 'update', 'members', target::text, 'Acesso de membro atualizado');
end;
$$;

create or replace function public.place_order(items jsonb, notes text default null)
returns table (order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  customer public.profiles;
  created public.orders;
  item jsonb;
  qty integer;
  variant record;
  total numeric(12, 2) := 0;
begin
  if caller is null then
    raise exception 'Faça login para enviar o pedido' using errcode = '42501';
  end if;

  select * into customer from public.profiles where id = caller and active;
  if not found then
    raise exception 'Conta inativa' using errcode = '42501';
  end if;

  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) not between 1 and 50 then
    raise exception 'Pedido inválido' using errcode = '22023';
  end if;

  if (
    select count(*) from public.orders
    where customer_id = caller and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Muitos pedidos em sequência. Tente novamente mais tarde.' using errcode = '54000';
  end if;

  insert into public.orders (customer_id, customer_name, customer_phone, notes)
  values (caller, nullif(customer.full_name, ''), customer.phone, nullif(btrim(left(notes, 500)), ''))
  returning * into created;

  if created.customer_name is null then
    update public.orders set customer_name = customer.email where id = created.id;
  end if;

  for item in select value from jsonb_array_elements(items) loop
    qty := (item ->> 'quantity')::integer;
    if qty is null or qty not between 1 and 999 then
      raise exception 'Quantidade inválida' using errcode = '22023';
    end if;

    select pv.id, pv.label, coalesce(pv.promo_price, pv.price) as unit_price, p.id as product_id, p.name
    into variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = (item ->> 'variant_id')::uuid and pv.active and p.active;

    if not found then
      raise exception 'Um dos itens não está mais disponível' using errcode = 'P0002';
    end if;

    insert into public.order_items (order_id, product_id, variant_id, product_name, variant_label, unit_price, quantity)
    values (created.id, variant.product_id, variant.id, variant.name, variant.label, variant.unit_price, qty);

    total := total + coalesce(variant.unit_price, 0) * qty;
  end loop;

  update public.orders set subtotal = total where id = created.id;

  return query select created.id, created.number;
end;
$$;

create or replace function public.track_product_view(product uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.product_views (product_id, day, views)
  select id, current_date, 1 from public.products where id = product and active
  on conflict (product_id, day) do update set views = public.product_views.views + 1;
$$;

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  if actor is null then
    return null;
  end if;

  if tg_table_name = 'orders' and tg_op = 'UPDATE'
    and (rec ->> 'status') is not distinct from (to_jsonb(old) ->> 'status') then
    return null;
  end if;

  insert into public.audit_logs (actor_id, action, entity, entity_id, summary)
  values (
    actor,
    lower(tg_op),
    tg_table_name,
    rec ->> 'id',
    coalesce(
      rec ->> 'name',
      rec ->> 'title',
      case when tg_table_name = 'orders' then '#' || (rec ->> 'number') || ' → ' || (rec ->> 'status') end,
      rec ->> 'store_name'
    )
  );
  return null;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['products', 'categories', 'producers', 'banners', 'roles', 'store_settings'] loop
    execute format(
      'create trigger audit after insert or update or delete on public.%I for each row execute function public.log_audit()',
      t
    );
  end loop;
end;
$$;

create trigger audit after update on public.orders
for each row execute function public.log_audit();

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.producers enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.banners enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_views enable row level security;
alter table public.store_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "staff read roles" on public.roles
for select to authenticated using ((select public.is_staff()));
create policy "manage roles" on public.roles
for all to authenticated
using ((select public.has_permission('roles.manage')))
with check ((select public.has_permission('roles.manage')));

create policy "read own or managed profiles" on public.profiles
for select to authenticated using (
  id = (select auth.uid())
  or (select public.has_permission('users.manage'))
  or (select public.has_permission('customers.view'))
  or (select public.has_permission('orders.manage'))
);
create policy "update own profile" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

create policy "read categories" on public.categories
for select using (active or (select public.has_permission('catalog.manage')) or (select public.has_permission('products.manage')));
create policy "manage categories" on public.categories
for all to authenticated
using ((select public.has_permission('catalog.manage')))
with check ((select public.has_permission('catalog.manage')));

create policy "read producers" on public.producers
for select using (active or (select public.has_permission('catalog.manage')) or (select public.has_permission('products.manage')));
create policy "manage producers" on public.producers
for all to authenticated
using ((select public.has_permission('catalog.manage')))
with check ((select public.has_permission('catalog.manage')));

create policy "read products" on public.products
for select using (active or (select public.has_permission('products.manage')));
create policy "manage products" on public.products
for all to authenticated
using ((select public.has_permission('products.manage')))
with check ((select public.has_permission('products.manage')));

create policy "read variants" on public.product_variants
for select using (
  (active and exists (select 1 from public.products p where p.id = product_id))
  or (select public.has_permission('products.manage'))
);
create policy "manage variants" on public.product_variants
for all to authenticated
using ((select public.has_permission('products.manage')))
with check ((select public.has_permission('products.manage')));

create policy "read images" on public.product_images
for select using (exists (select 1 from public.products p where p.id = product_id));
create policy "manage images" on public.product_images
for all to authenticated
using ((select public.has_permission('products.manage')))
with check ((select public.has_permission('products.manage')));

create policy "read banners" on public.banners
for select using (
  (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  or (select public.has_permission('catalog.manage'))
);
create policy "manage banners" on public.banners
for all to authenticated
using ((select public.has_permission('catalog.manage')))
with check ((select public.has_permission('catalog.manage')));

create policy "own favorites" on public.favorites
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "read own or managed orders" on public.orders
for select to authenticated using (
  customer_id = (select auth.uid()) or (select public.has_permission('orders.manage'))
);
create policy "manage orders" on public.orders
for update to authenticated
using ((select public.has_permission('orders.manage')))
with check ((select public.has_permission('orders.manage')));

revoke insert, update, delete on public.orders from anon, authenticated;
grant update (status, internal_notes, handled_by) on public.orders to authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;

create policy "read order items" on public.order_items
for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id));

create policy "read views" on public.product_views
for select to authenticated using ((select public.has_permission('dashboard.view')));
revoke insert, update, delete on public.product_views from anon, authenticated;

create policy "read settings" on public.store_settings for select using (true);
create policy "manage settings" on public.store_settings
for update to authenticated
using ((select public.has_permission('settings.manage')))
with check ((select public.has_permission('settings.manage')));

create policy "read audit" on public.audit_logs
for select to authenticated using ((select public.has_permission('dashboard.view')));
revoke insert, update, delete on public.audit_logs from anon, authenticated;

revoke execute on function public.admin_update_member(uuid, uuid, boolean) from public, anon;
revoke execute on function public.place_order(jsonb, text) from public, anon;
grant execute on function public.admin_update_member(uuid, uuid, boolean) to authenticated;
grant execute on function public.place_order(jsonb, text) to authenticated;
grant execute on function public.track_product_view(uuid) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "staff upload catalog media" on storage.objects
for insert to authenticated with check (
  bucket_id = 'catalog'
  and ((select public.has_permission('products.manage')) or (select public.has_permission('catalog.manage')))
);
create policy "staff update catalog media" on storage.objects
for update to authenticated using (
  bucket_id = 'catalog'
  and ((select public.has_permission('products.manage')) or (select public.has_permission('catalog.manage')))
);
create policy "staff delete catalog media" on storage.objects
for delete to authenticated using (
  bucket_id = 'catalog'
  and ((select public.has_permission('products.manage')) or (select public.has_permission('catalog.manage')))
);
