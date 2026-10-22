create or replace function public.local_today()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

alter table public.product_views alter column day set default public.local_today();

create or replace function public.track_product_view(product uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.product_views (product_id, day, views)
  select id, public.local_today(), 1 from public.products where id = product and active
  on conflict (product_id, day) do update set views = public.product_views.views + 1;
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
      'revenue', (select coalesce(sum(subtotal), 0) from cur where status in ('confirmado', 'entregue')),
      'revenue_prev', (select coalesce(sum(subtotal), 0) from prev where status in ('confirmado', 'entregue')),
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
      'pending_orders', (select count(*) from public.orders where status in ('novo', 'em_atendimento'))
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
          sum(subtotal) filter (where status in ('confirmado', 'entregue')) as revenue
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
        'current', coalesce((select sum(subtotal) from cur where status in ('confirmado', 'entregue') and extract(isodow from local_at) = d.dow), 0),
        'previous', coalesce((select sum(subtotal) from prev where status in ('confirmado', 'entregue') and extract(isodow from local_at) = d.dow), 0)
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

revoke execute on function public.dashboard_metrics(integer) from public, anon;
grant execute on function public.dashboard_metrics(integer) to authenticated;
