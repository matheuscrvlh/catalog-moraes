drop view public.customer_summaries;

alter type public.order_status rename to order_status_old;
create type public.order_status as enum ('novo', 'confirmado', 'em_rota', 'entregue', 'cancelado');

alter table public.orders alter column status drop default;
alter table public.orders
  alter column status type public.order_status
  using (case status::text when 'em_atendimento' then 'confirmado' else status::text end)::public.order_status;
alter table public.orders alter column status set default 'novo';

drop type public.order_status_old;

create view public.customer_summaries
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.company_name,
  p.tax_id,
  p.business_type,
  p.active,
  p.created_at,
  count(o.id) filter (where o.status <> 'cancelado')::integer as orders,
  coalesce(sum(o.subtotal) filter (where o.status in ('confirmado', 'em_rota', 'entregue')), 0) as spent,
  max(o.created_at) as last_order_at
from public.profiles p
left join public.orders o on o.customer_id = p.id
where p.role_id is null
group by p.id;

create or replace function public.admin_create_order(customer uuid, items jsonb, notes text default null)
returns table (order_id uuid, order_number bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  buyer public.profiles;
  created public.orders;
begin
  if not public.has_permission('orders.manage') then
    raise exception 'Sem permissão para criar pedidos' using errcode = '42501';
  end if;

  select * into buyer from public.profiles where id = customer and active;
  if not found then
    raise exception 'Cliente não encontrado ou inativo' using errcode = 'P0002';
  end if;

  insert into public.orders (customer_id, customer_name, customer_phone, status, notes, created_by, handled_by)
  values (
    buyer.id,
    coalesce(nullif(buyer.full_name, ''), buyer.email),
    buyer.phone,
    'confirmado',
    nullif(btrim(left(notes, 500)), ''),
    caller,
    caller
  )
  returning * into created;

  perform public.fill_order_items(created.id, items);

  return query select created.id, created.number;
end;
$$;

create or replace function public.dashboard_metrics(period_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  days integer := least(greatest(coalesce(period_days, 30), 7), 365);
  today date := public.local_today();
  start_day date := today - (days - 1);
  prev_day date := start_day - days;
  result jsonb;
begin
  if not public.has_permission('dashboard.view') then
    raise exception 'Sem permissão' using errcode = '42501';
  end if;

  with
  orders_local as (
    select o.*, (o.created_at at time zone 'America/Sao_Paulo') as local_at
    from public.orders o
    where o.created_at >= (prev_day::timestamp at time zone 'America/Sao_Paulo')
  ),
  cur as (select * from orders_local where local_at::date >= start_day),
  prev as (select * from orders_local where local_at::date < start_day),
  views_cur as (select coalesce(sum(views), 0) as total from public.product_views where day >= start_day),
  views_prev as (select coalesce(sum(views), 0) as total from public.product_views where day >= prev_day and day < start_day)
  select jsonb_build_object(
    'period_days', days,
    'kpis', jsonb_build_object(
      'revenue', (select coalesce(sum(subtotal), 0) from cur where status in ('confirmado', 'em_rota', 'entregue')),
      'revenue_prev', (select coalesce(sum(subtotal), 0) from prev where status in ('confirmado', 'em_rota', 'entregue')),
      'orders', (select count(*) from cur where status <> 'cancelado'),
      'orders_prev', (select count(*) from prev where status <> 'cancelado'),
      'customers', (
        select count(*) from public.profiles
        where role_id is null and (created_at at time zone 'America/Sao_Paulo')::date >= start_day
      ),
      'customers_prev', (
        select count(*) from public.profiles
        where role_id is null
          and (created_at at time zone 'America/Sao_Paulo')::date >= prev_day
          and (created_at at time zone 'America/Sao_Paulo')::date < start_day
      ),
      'views', (select total from views_cur),
      'views_prev', (select total from views_prev),
      'active_products', (select count(*) from public.products where active),
      'low_stock', (select count(*) from public.product_variants where active and stock between 1 and 6),
      'out_of_stock', (select count(*) from public.product_variants where active and stock = 0),
      'pending_orders', (select count(*) from public.orders where status = 'novo')
    ),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', d.day::date,
        'orders', coalesce(o.orders, 0),
        'revenue', coalesce(o.revenue, 0),
        'views', coalesce(v.views, 0)
      ) order by d.day), '[]'::jsonb)
      from generate_series(start_day, today, interval '1 day') as d(day)
      left join (
        select local_at::date as day,
          count(*) filter (where status <> 'cancelado') as orders,
          sum(subtotal) filter (where status in ('confirmado', 'em_rota', 'entregue')) as revenue
        from cur
        group by 1
      ) o on o.day = d.day::date
      left join (
        select day, sum(views) as views from public.product_views where day >= start_day group by day
      ) v on v.day = d.day::date
    ),
    'status', (
      select coalesce(jsonb_object_agg(status, total), '{}'::jsonb)
      from (select status, count(*) as total from cur group by status) s
    ),
    'categories', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', c.name, 'accent', c.accent, 'products', coalesce(x.products, 0), 'stock', coalesce(x.stock, 0)
      ) order by c.position, c.name), '[]'::jsonb)
      from public.categories c
      left join (
        select p.category_id, count(distinct p.id) as products, coalesce(sum(v.stock), 0) as stock
        from public.products p
        left join public.product_variants v on v.product_id = p.id and v.active
        where p.active
        group by p.category_id
      ) x on x.category_id = c.id
      where c.active
    ),
    'top_viewed', (
      select coalesce(jsonb_agg(t order by t.views desc), '[]'::jsonb)
      from (
        select p.id, p.name, p.slug, cp.image_path, cp.category_accent as accent, sum(pv.views) as views
        from public.product_views pv
        join public.products p on p.id = pv.product_id
        join public.catalog_products cp on cp.id = p.id
        where pv.day >= start_day
        group by p.id, p.name, p.slug, cp.image_path, cp.category_accent
        order by views desc
        limit 5
      ) t
    ),
    'top_sold', (
      select coalesce(jsonb_agg(t order by t.quantity desc), '[]'::jsonb)
      from (
        select oi.product_id as id, max(oi.product_name) as name, max(cp.image_path) as image_path,
          max(cp.category_accent) as accent, sum(oi.quantity) as quantity, sum(oi.line_total) as revenue
        from public.order_items oi
        join cur on cur.id = oi.order_id and cur.status <> 'cancelado'
        left join public.catalog_products cp on cp.id = oi.product_id
        group by oi.product_id
        order by quantity desc
        limit 5
      ) t
    ),
    'cellar', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', cp.id, 'name', cp.name, 'slug', cp.slug, 'category', cp.category_name,
        'accent', cp.category_accent, 'stock', cp.total_stock, 'image_path', cp.image_path
      ) order by c.position, cp.name), '[]'::jsonb)
      from public.catalog_products cp
      join public.categories c on c.id = cp.category_id
      where cp.active
    ),
    'heatmap', (
      select coalesce(jsonb_agg(jsonb_build_object('dow', dow, 'hour', hour, 'orders', total)), '[]'::jsonb)
      from (
        select extract(isodow from local_at)::int as dow, extract(hour from local_at)::int as hour, count(*) as total
        from cur
        where status <> 'cancelado'
        group by 1, 2
      ) h
    ),
    'weekday', (
      select jsonb_agg(jsonb_build_object(
        'dow', d.dow,
        'current', coalesce((select sum(subtotal) from cur where status in ('confirmado', 'em_rota', 'entregue') and extract(isodow from local_at) = d.dow), 0),
        'previous', coalesce((select sum(subtotal) from prev where status in ('confirmado', 'em_rota', 'entregue') and extract(isodow from local_at) = d.dow), 0)
      ) order by d.dow)
      from generate_series(1, 7) as d(dow)
    ),
    'style_sales', (
      select coalesce(jsonb_agg(s order by s.bottles desc), '[]'::jsonb)
      from (
        select c.name, c.accent,
          coalesce(sum(oi.quantity) filter (where o.local_at::date >= start_day), 0) as bottles,
          coalesce(sum(oi.quantity) filter (where o.local_at::date < start_day), 0) as bottles_prev,
          coalesce(sum(oi.line_total) filter (where o.local_at::date >= start_day), 0) as revenue
        from public.categories c
        join public.products p on p.category_id = c.id
        join public.order_items oi on oi.product_id = p.id
        join orders_local o on o.id = oi.order_id and o.status <> 'cancelado'
        group by c.id, c.name, c.accent
      ) s
    ),
    'origins', (
      select coalesce(jsonb_agg(o order by o.bottles desc), '[]'::jsonb)
      from (
        select coalesce(p.country, 'Outros') as country, sum(oi.quantity) as bottles, sum(oi.line_total) as revenue
        from public.order_items oi
        join cur on cur.id = oi.order_id and cur.status <> 'cancelado'
        join public.products p on p.id = oi.product_id
        group by 1
        order by 2 desc
        limit 6
      ) o
    ),
    'recent_orders', (
      select coalesce(jsonb_agg(r order by r.created_at desc), '[]'::jsonb)
      from (
        select o.id, o.number, coalesce(o.customer_company, o.customer_name) as customer_name, o.customer_name as contact_name, o.status, o.subtotal, o.created_at,
          (select coalesce(sum(quantity), 0) from public.order_items where order_id = o.id) as items
        from public.orders o
        order by o.created_at desc
        limit 6
      ) r
    ),
    'activity', (
      select coalesce(jsonb_agg(a order by a.created_at desc), '[]'::jsonb)
      from (
        select l.id, l.action, l.entity, l.summary, l.created_at, coalesce(nullif(p.full_name, ''), p.email) as actor
        from public.audit_logs l
        left join public.profiles p on p.id = l.actor_id
        order by l.created_at desc
        limit 8
      ) a
    )
  ) into result;

  return result;
end;
$$;

create type public.order_event_kind as enum ('created', 'status', 'comment');

create table public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  kind public.order_event_kind not null,
  body text check (char_length(body) between 1 and 2000),
  from_status public.order_status,
  to_status public.order_status,
  created_at timestamptz not null default now(),
  constraint order_events_status_shape check (kind <> 'status' or to_status is not null)
);

create index order_events_order_idx on public.order_events (order_id, created_at);

create table public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  event_id uuid not null references public.order_events (id) on delete cascade,
  path text not null unique check (path like order_id::text || '/%'),
  name text not null check (char_length(name) between 1 and 200),
  mime_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);

create index order_files_event_idx on public.order_files (event_id);
create index order_files_order_idx on public.order_files (order_id);

create or replace function public.track_order_events()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_events (order_id, author_id, kind, to_status, created_at)
    values (new.id, coalesce(new.created_by, new.customer_id), 'created', new.status, new.created_at);
  elsif new.status is distinct from old.status then
    insert into public.order_events (order_id, author_id, kind, from_status, to_status)
    values (new.id, (select auth.uid()), 'status', old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger order_events
after insert or update of status on public.orders
for each row execute function public.track_order_events();

insert into public.order_events (order_id, author_id, kind, to_status, created_at)
select id, coalesce(created_by, customer_id), 'created', null, created_at from public.orders;

insert into public.order_events (order_id, author_id, kind, body, created_at)
select id, handled_by, 'comment', left(btrim(internal_notes), 2000), updated_at
from public.orders
where nullif(btrim(internal_notes), '') is not null;

alter table public.order_events enable row level security;
alter table public.order_files enable row level security;

create policy "staff read order events" on public.order_events
for select to authenticated using ((select public.has_permission('orders.manage')));

create policy "staff comment on orders" on public.order_events
for insert to authenticated with check (
  (select public.has_permission('orders.manage'))
  and kind = 'comment'
  and author_id = (select auth.uid())
  and from_status is null
  and to_status is null
);

create policy "staff read order files" on public.order_files
for select to authenticated using ((select public.has_permission('orders.manage')));

create policy "staff attach order files" on public.order_files
for insert to authenticated with check (
  (select public.has_permission('orders.manage'))
  and exists (
    select 1 from public.order_events e
    where e.id = event_id and e.order_id = order_files.order_id and e.author_id = (select auth.uid())
  )
);

revoke all on public.order_events, public.order_files from anon;
revoke update, delete, truncate on public.order_events, public.order_files from authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-files',
  'order-files',
  false,
  10485760,
  array[
    'image/png', 'image/jpeg', 'image/webp', 'image/heic',
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

create policy "staff upload order files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'order-files' and (select public.has_permission('orders.manage'))
);

create policy "staff read order files" on storage.objects
for select to authenticated using (
  bucket_id = 'order-files' and (select public.has_permission('orders.manage'))
);

create policy "staff remove order files" on storage.objects
for delete to authenticated using (
  bucket_id = 'order-files' and owner_id = (select auth.uid())::text
);
