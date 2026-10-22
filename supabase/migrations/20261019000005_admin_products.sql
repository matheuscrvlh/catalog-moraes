create or replace function public.admin_save_product(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  data public.products := jsonb_populate_record(null::public.products, payload -> 'product');
  target uuid := nullif(payload ->> 'id', '')::uuid;
  variant jsonb;
  variant_id uuid;
  kept uuid[] := '{}';
  ordinal bigint;
begin
  if not public.has_permission('products.manage') then
    raise exception 'Sem permissão' using errcode = '42501';
  end if;

  if jsonb_typeof(payload -> 'variants') <> 'array' or jsonb_array_length(payload -> 'variants') = 0 then
    raise exception 'Cadastre ao menos uma variação' using errcode = '22023';
  end if;

  if target is null then
    insert into public.products (
      slug, name, tagline, description, category_id, producer_id, country, region, grapes, sweetness, vintage,
      alcohol, serving_temp, pairing, aroma_notes, palate_notes, body, acidity, tannin, sweetness_level,
      badge, featured, active, created_by
    ) values (
      data.slug, data.name, data.tagline, data.description, data.category_id, data.producer_id, data.country,
      data.region, coalesce(data.grapes, '{}'), data.sweetness, data.vintage, data.alcohol, data.serving_temp,
      coalesce(data.pairing, '{}'), data.aroma_notes, data.palate_notes, data.body, data.acidity, data.tannin,
      data.sweetness_level, data.badge, coalesce(data.featured, false), coalesce(data.active, true), (select auth.uid())
    )
    returning id into target;
  else
    update public.products set
      slug = data.slug,
      name = data.name,
      tagline = data.tagline,
      description = data.description,
      category_id = data.category_id,
      producer_id = data.producer_id,
      country = data.country,
      region = data.region,
      grapes = coalesce(data.grapes, '{}'),
      sweetness = data.sweetness,
      vintage = data.vintage,
      alcohol = data.alcohol,
      serving_temp = data.serving_temp,
      pairing = coalesce(data.pairing, '{}'),
      aroma_notes = data.aroma_notes,
      palate_notes = data.palate_notes,
      body = data.body,
      acidity = data.acidity,
      tannin = data.tannin,
      sweetness_level = data.sweetness_level,
      badge = data.badge,
      featured = coalesce(data.featured, false),
      active = coalesce(data.active, true)
    where id = target;

    if not found then
      raise exception 'Produto não encontrado' using errcode = 'P0002';
    end if;
  end if;

  for variant, ordinal in select value, row_number() over () from jsonb_array_elements(payload -> 'variants') loop
    variant_id := nullif(variant ->> 'id', '')::uuid;

    if variant_id is not null then
      update public.product_variants set
        label = variant ->> 'label',
        volume_ml = nullif(variant ->> 'volume_ml', '')::integer,
        sku = nullif(variant ->> 'sku', ''),
        price = nullif(variant ->> 'price', '')::numeric,
        promo_price = nullif(variant ->> 'promo_price', '')::numeric,
        stock = coalesce(nullif(variant ->> 'stock', '')::integer, 0),
        active = coalesce((variant ->> 'active')::boolean, true),
        position = ordinal - 1
      where id = variant_id and product_id = target;
      if not found then
        variant_id := null;
      end if;
    end if;

    if variant_id is null then
      insert into public.product_variants (product_id, label, volume_ml, sku, price, promo_price, stock, active, position)
      values (
        target,
        variant ->> 'label',
        nullif(variant ->> 'volume_ml', '')::integer,
        nullif(variant ->> 'sku', ''),
        nullif(variant ->> 'price', '')::numeric,
        nullif(variant ->> 'promo_price', '')::numeric,
        coalesce(nullif(variant ->> 'stock', '')::integer, 0),
        coalesce((variant ->> 'active')::boolean, true),
        ordinal - 1
      )
      returning id into variant_id;
    end if;

    kept := kept || variant_id;
  end loop;

  delete from public.product_variants where product_id = target and id <> all (kept);

  delete from public.product_images where product_id = target;
  insert into public.product_images (product_id, path, alt, position)
  select target, value ->> 'path', nullif(value ->> 'alt', ''), (row_number() over ()) - 1
  from jsonb_array_elements(coalesce(payload -> 'images', '[]'::jsonb))
  where coalesce(value ->> 'path', '') <> '';

  return target;
end;
$$;

revoke execute on function public.admin_save_product(jsonb) from public, anon;
grant execute on function public.admin_save_product(jsonb) to authenticated;

create or replace function public.admin_adjust_stock(variant uuid, quantity integer)
returns integer
language sql
security invoker
set search_path = ''
as $$
  update public.product_variants
  set stock = greatest(0, quantity)
  where id = variant and public.has_permission('products.manage')
  returning stock;
$$;

revoke execute on function public.admin_adjust_stock(uuid, integer) from public, anon;
grant execute on function public.admin_adjust_stock(uuid, integer) to authenticated;
