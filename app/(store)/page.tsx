import { About } from "@/components/store/home/about";
import { Business } from "@/components/store/home/business";
import { Exclusives } from "@/components/store/home/exclusives";
import { HeroSlider } from "@/components/store/home/hero-slider";
import { ProductTabs } from "@/components/store/home/product-tabs";
import { SectionTitle } from "@/components/store/home/section-title";
import { Spotlight } from "@/components/store/home/spotlight";
import { StyleStrip } from "@/components/store/home/style-strip";
import { Highlights, StyleTiles } from "@/components/store/home/style-tiles";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import {
  getBanners,
  getCatalogOverview,
  getFeaturedProducts,
  getNewestProducts,
  getProducerNames,
  getProductsByBadge,
  getProductsOnSale,
  getStoreSettings,
} from "@/lib/catalog/queries";
import { whatsappLink } from "@/lib/format";
import type { ProductCard as Product } from "@/lib/catalog/types";

function Grid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [overview, featured, onSale, newest, exclusives, banners, producers, settings] = await Promise.all([
    getCatalogOverview(),
    getFeaturedProducts(12),
    getProductsOnSale(8),
    getNewestProducts(8),
    getProductsByBadge("Exclusivo"),
    getBanners(),
    getProducerNames(),
    getStoreSettings(),
  ]);

  const whatsapp = whatsappLink(
    settings.whatsapp,
    "Olá! Tenho um comércio e gostaria de receber a tabela de vinhos da Moraes.",
  );
  const spotlight = featured.filter((product) => product.badge).slice(0, 3);
  const tabs = [
    { id: "destaques", label: "Destaques", content: <Grid products={featured.slice(0, 8)} /> },
    ...(onSale.length ? [{ id: "ofertas", label: "Ofertas", content: <Grid products={onSale} /> }] : []),
    { id: "novidades", label: "Novidades", content: <Grid products={newest} /> },
  ];

  return (
    <>
      <HeroSlider banners={banners} />
      <StyleTiles />
      <Highlights
        items={[
          { value: String(overview.products), label: "Rótulos no catálogo" },
          { value: String(overview.countries.length), label: "Países de origem" },
          { value: String(overview.producers), label: "Vinícolas e marcas" },
          {
            value: String(overview.categories.filter((category) => category.count > 0).length),
            label: "Estilos de vinho",
          },
        ]}
      />
      <Spotlight products={spotlight.length ? spotlight : featured} />

      <section className="mx-auto max-w-7xl px-5 pt-28 md:px-8">
        <SectionTitle eyebrow="Nosso catálogo" title="Escolhidos para revenda" />
        <div className="mt-12">
          <ProductTabs tabs={tabs} />
        </div>
        <div className="mt-12 flex justify-center">
          <ButtonLink href="/vinhos" variant="outline" size="lg">
            Ver catálogo completo
          </ButtonLink>
        </div>
      </section>

      <StyleStrip categories={overview.categories} />
      <Business
        bottles={[featured[1], featured[0]].filter(Boolean)}
        stats={{ products: overview.products, countries: overview.countries.length }}
        whatsapp={whatsapp}
      />
      <Exclusives products={exclusives} />
      <About whatsapp={whatsapp} producers={producers} />
    </>
  );
}
