import type { Sweetness } from "@/lib/format";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  producer: string | null;
  country: string | null;
  region: string | null;
  grapes: string[];
  badge: string | null;
  categorySlug: string;
  categoryName: string;
  accent: string;
  imagePath: string | null;
  price: number | null;
  regularPrice: number | null;
  stock: number;
  variantCount: number;
  defaultVariant: { id: string; label: string; price: number | null } | null;
};

export type ProductVariant = {
  id: string;
  label: string;
  volumeMl: number | null;
  price: number | null;
  promoPrice: number | null;
  stock: number;
};

export type ProductDetail = ProductCard & {
  description: string | null;
  sweetness: Sweetness | null;
  vintage: number | null;
  alcohol: number | null;
  servingTemp: string | null;
  pairing: string[];
  aromaNotes: string | null;
  palateNotes: string | null;
  profile: { body: number | null; acidity: number | null; tannin: number | null; sweetness: number | null };
  images: { path: string; alt: string | null }[];
  variants: ProductVariant[];
  producerSlug: string | null;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  accent: string;
  imagePath: string | null;
  cover: string | null;
  count: number;
};

export type Facet = { value: string; count: number };

export type CatalogOverview = {
  categories: Category[];
  countries: Facet[];
  grapes: Facet[];
  producers: number;
  products: number;
};

export type Banner = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imagePath: string | null;
  theme: "wine" | "navy" | "gold";
};

export type StoreSettings = {
  storeName: string;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
  about: string | null;
};
