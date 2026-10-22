create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;

create type public.wine_sweetness as enum (
  'seco', 'meio_seco', 'suave', 'doce', 'brut', 'extra_brut', 'demi_sec', 'nature'
);

create type public.order_status as enum (
  'novo', 'em_atendimento', 'confirmado', 'entregue', 'cancelado'
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 60),
  description text,
  permissions text[] not null default '{}',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  email text not null,
  phone text check (char_length(phone) <= 30),
  avatar_url text,
  role_id uuid references public.roles (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role_id) where role_id is not null;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  accent text not null default '#8e1b3a' check (accent ~ '^#[0-9a-fA-F]{6}$'),
  image_path text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.producers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  country text,
  region text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  tagline text check (char_length(tagline) <= 160),
  description text,
  category_id uuid not null references public.categories (id) on delete restrict,
  producer_id uuid references public.producers (id) on delete set null,
  country text,
  region text,
  grapes text[] not null default '{}',
  sweetness public.wine_sweetness,
  vintage smallint check (vintage between 1900 and 2100),
  alcohol numeric(4, 1) check (alcohol between 0 and 25),
  serving_temp text,
  pairing text[] not null default '{}',
  aroma_notes text,
  palate_notes text,
  body smallint check (body between 1 and 5),
  acidity smallint check (acidity between 1 and 5),
  tannin smallint check (tannin between 1 and 5),
  sweetness_level smallint check (sweetness_level between 1 and 5),
  badge text check (char_length(badge) <= 24),
  featured boolean not null default false,
  active boolean not null default true,
  search_text text not null default '',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.products_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  producer_name text;
begin
  select name into producer_name from public.producers where id = new.producer_id;
  new.search_text = lower(public.immutable_unaccent(concat_ws(' ',
    new.name, new.tagline, new.badge, new.country, new.region, producer_name, array_to_string(new.grapes, ' ')
  )));
  return new;
end;
$$;

create trigger products_search_text
before insert or update on public.products
for each row execute function public.products_search_text();

create index products_category_idx on public.products (category_id);
create index products_producer_idx on public.products (producer_id);
create index products_featured_idx on public.products (featured) where featured and active;
create index products_grapes_idx on public.products using gin (grapes);
create index products_search_idx on public.products using gin (search_text extensions.gin_trgm_ops);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  volume_ml integer check (volume_ml > 0),
  sku text unique,
  price numeric(10, 2) check (price >= 0),
  promo_price numeric(10, 2) check (promo_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (promo_price is null or price is null or promo_price < price)
);

create index product_variants_product_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  alt text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, position);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text check (char_length(eyebrow) <= 40),
  title text not null check (char_length(title) between 2 and 90),
  subtitle text check (char_length(subtitle) <= 220),
  cta_label text check (char_length(cta_label) <= 30),
  cta_href text,
  image_path text,
  theme text not null default 'wine' check (theme in ('wine', 'navy', 'gold')),
  position integer not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  customer_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_company text,
  customer_phone text,
  status public.order_status not null default 'novo',
  subtotal numeric(12, 2) not null default 0,
  notes text check (char_length(notes) <= 500),
  internal_notes text,
  handled_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text not null,
  unit_price numeric(10, 2),
  quantity integer not null check (quantity between 1 and 999),
  line_total numeric(12, 2) generated always as (coalesce(unit_price, 0) * quantity) stored
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.product_views (
  product_id uuid not null references public.products (id) on delete cascade,
  day date not null default current_date,
  views integer not null default 0,
  primary key (product_id, day)
);

create index product_views_day_idx on public.product_views (day);

create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'Moraes Comercial',
  whatsapp text,
  phone text,
  email text,
  instagram text,
  address text,
  about text,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text,
  created_at timestamptz not null default now()
);

create index audit_logs_created_idx on public.audit_logs (created_at desc);

create view public.catalog_products
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.tagline,
  p.country,
  p.region,
  p.grapes,
  p.sweetness,
  p.vintage,
  p.badge,
  p.featured,
  p.active,
  p.search_text,
  p.created_at,
  c.id as category_id,
  c.slug as category_slug,
  c.name as category_name,
  c.accent as category_accent,
  pr.id as producer_id,
  pr.slug as producer_slug,
  pr.name as producer_name,
  img.path as image_path,
  v.min_price,
  v.min_regular_price,
  v.total_stock,
  v.variant_count,
  dv.id as default_variant_id,
  dv.label as default_variant_label,
  coalesce(dv.promo_price, dv.price) as default_variant_price
from public.products p
join public.categories c on c.id = p.category_id
left join public.producers pr on pr.id = p.producer_id
left join lateral (
  select i.path
  from public.product_images i
  where i.product_id = p.id
  order by i.position
  limit 1
) img on true
left join lateral (
  select
    min(coalesce(pv.promo_price, pv.price)) as min_price,
    min(pv.price) as min_regular_price,
    coalesce(sum(pv.stock), 0)::integer as total_stock,
    count(*)::integer as variant_count
  from public.product_variants pv
  where pv.product_id = p.id and pv.active
) v on true
left join lateral (
  select pv.id, pv.label, pv.price, pv.promo_price
  from public.product_variants pv
  where pv.product_id = p.id and pv.active
  order by pv.position
  limit 1
) dv on true;
