alter table public.orders
  add column created_by uuid references public.profiles (id) on delete set null;

create or replace function public.fill_order_items(target uuid, items jsonb)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  qty integer;
  variant record;
  total numeric(12, 2) := 0;
begin
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) not between 1 and 50 then
    raise exception 'Pedido inválido' using errcode = '22023';
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
    values (target, variant.product_id, variant.id, variant.name, variant.label, variant.unit_price, qty);

    total := total + coalesce(variant.unit_price, 0) * qty;
  end loop;

  update public.orders set subtotal = total where id = target;
  return total;
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
begin
  if caller is null then
    raise exception 'Faça login para enviar o pedido' using errcode = '42501';
  end if;

  select * into customer from public.profiles where id = caller and active;
  if not found then
    raise exception 'Conta inativa' using errcode = '42501';
  end if;

  if (
    select count(*) from public.orders
    where customer_id = caller and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Muitos pedidos em sequência. Tente novamente mais tarde.' using errcode = '54000';
  end if;

  insert into public.orders (customer_id, customer_name, customer_phone, notes)
  values (
    caller,
    coalesce(nullif(customer.full_name, ''), customer.email),
    customer.phone,
    nullif(btrim(left(notes, 500)), '')
  )
  returning * into created;

  perform public.fill_order_items(created.id, items);

  return query select created.id, created.number;
end;
$$;

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
    'em_atendimento',
    nullif(btrim(left(notes, 500)), ''),
    caller,
    caller
  )
  returning * into created;

  perform public.fill_order_items(created.id, items);

  return query select created.id, created.number;
end;
$$;

revoke execute on function public.fill_order_items(uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_create_order(uuid, jsonb, text) from public, anon;
grant execute on function public.admin_create_order(uuid, jsonb, text) to authenticated;
