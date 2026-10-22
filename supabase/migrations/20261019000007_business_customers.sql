create type public.business_type as enum ('adega', 'mercado', 'vinicola', 'restaurante', 'distribuidor', 'outro');

alter table public.profiles
  add column company_name text check (char_length(company_name) <= 120),
  add column tax_id text check (tax_id ~ '^\d{11}$|^\d{14}$'),
  add column business_type public.business_type;

grant update (company_name, tax_id, business_type) on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  document text := nullif(regexp_replace(coalesce(meta ->> 'tax_id', ''), '\D', '', 'g'), '');
begin
  insert into public.profiles (id, email, full_name, phone, company_name, tax_id, business_type)
  values (
    new.id,
    new.email,
    left(coalesce(meta ->> 'full_name', ''), 120),
    left(meta ->> 'phone', 30),
    nullif(left(meta ->> 'company_name', 120), ''),
    case when document ~ '^\d{11}$|^\d{14}$' then document end,
    case
      when meta ->> 'business_type' in ('adega', 'mercado', 'vinicola', 'restaurante', 'distribuidor', 'outro')
      then (meta ->> 'business_type')::public.business_type
    end
  );
  return new;
end;
$$;

create or replace function public.stamp_order_company()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.customer_id is not null and new.customer_company is null then
    select company_name into new.customer_company from public.profiles where id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger stamp_order_company
before insert on public.orders
for each row execute function public.stamp_order_company();

drop view public.customer_summaries;

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
  coalesce(sum(o.subtotal) filter (where o.status in ('confirmado', 'entregue')), 0) as spent,
  max(o.created_at) as last_order_at
from public.profiles p
left join public.orders o on o.customer_id = p.id
where p.role_id is null
group by p.id;

update public.store_settings
set about = 'Distribuidora de vinhos e bebidas que abastece adegas, mercados, restaurantes e vinícolas com rótulos nacionais e importados.'
where id = 1;
