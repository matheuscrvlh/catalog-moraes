create view public.customer_summaries
with (security_invoker = true)
as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.active,
  p.created_at,
  count(o.id) filter (where o.status <> 'cancelado')::integer as orders,
  coalesce(sum(o.subtotal) filter (where o.status in ('confirmado', 'entregue')), 0) as spent,
  max(o.created_at) as last_order_at
from public.profiles p
left join public.orders o on o.customer_id = p.id
where p.role_id is null
group by p.id;
