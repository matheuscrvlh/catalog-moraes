insert into public.products (slug, name, category_id, producer_id, country)
select 'creme-de-cebola-maggi', 'Creme de Cebola Maggi', c.id, pr.id, pr.country
from public.categories c
join public.producers pr on pr.slug = 'nestle'
where c.slug = 'mercearia'
on conflict (slug) do nothing;

update public.product_variants pv
set label = 'Coco natural'
from public.products p
where pv.product_id = p.id and p.slug = 'chocolate-prestigio' and pv.label = 'Caixa display';

insert into public.product_variants (product_id, label, volume_ml, stock, position)
select p.id, v.label, v.volume_ml, 100, v.position
from (values
  ('casal-garcia-sweet', 'Verde', null::integer, 2),
  ('suco-de-uva-alianca-branco-integral', 'Vidro 1 L', 1000, 4),
  ('chocolate-prestigio', 'Dark', null, 1),
  ('chocolate-prestigio', 'Branco', null, 2),
  ('creme-de-cebola-maggi', 'Sachê 68 g', null, 0)
) as v (slug, label, volume_ml, position)
join public.products p on p.slug = v.slug
where not exists (select 1 from public.product_variants x where x.product_id = p.id and x.label = v.label);

insert into public.product_images (product_id, path, alt, position)
select p.id, v.path, v.alt, v.position
from (values
  ('suco-de-uva-alianca-branco-integral', '/products/suco-de-uva-alianca-branco-integral-2.webp', 'Suco de Uva Aliança Branco Integral em vidro de 1 L', 1),
  ('chocolate-prestigio', '/products/chocolate-prestigio-2.webp', 'Chocolate Prestígio Dark', 1),
  ('chocolate-prestigio', '/products/chocolate-prestigio-3.webp', 'Chocolate Prestígio Branco', 2),
  ('creme-de-cebola-maggi', '/products/creme-de-cebola-maggi.webp', 'Creme de Cebola Maggi', 0)
) as v (slug, path, alt, position)
join public.products p on p.slug = v.slug
where not exists (select 1 from public.product_images x where x.product_id = p.id and x.path = v.path);
