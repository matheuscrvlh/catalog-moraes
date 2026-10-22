import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/brand-mark";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { getCatalogOverview, getStoreSettings } from "@/lib/catalog/queries";
import { whatsappLink } from "@/lib/format";

export async function SiteFooter() {
  const [settings, overview] = await Promise.all([getStoreSettings(), getCatalogOverview()]);
  const whatsapp = whatsappLink(settings.whatsapp, "Olá! Vim pelo site e gostaria de falar com um vendedor.");

  return (
    <footer className="border-t border-line bg-white pb-28 md:pb-0">
      <div className="brand-stripe h-1" />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:px-8">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-stone">{settings.about}</p>
          <p className="mt-6 font-script text-3xl text-earth">Moraes Comercial</p>
        </div>

        <div>
          <p className="caps mb-5 text-[13px] text-navy">Estilos</p>
          <ul className="space-y-2.5 text-sm text-stone">
            {overview.categories
              .filter((category) => category.count > 0)
              .map((category) => (
                <li key={category.id}>
                  <Link href={`/vinhos?categoria=${category.slug}`} className="transition hover:text-navy">
                    {category.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <p className="caps mb-5 text-[13px] text-navy">Origens</p>
          <ul className="space-y-2.5 text-sm text-stone">
            {overview.countries.slice(0, 6).map((country) => (
              <li key={country.value}>
                <Link href={`/vinhos?pais=${encodeURIComponent(country.value)}`} className="transition hover:text-navy">
                  {country.value}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="caps mb-5 text-[13px] text-navy">Atendimento comercial</p>
          <ul className="space-y-3 text-sm text-stone">
            {whatsapp && (
              <li>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-navy"
                >
                  <WhatsappIcon className="size-4 text-[#1fae5b]" /> Falar com um vendedor
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-2.5 transition hover:text-navy"
                >
                  <Phone className="size-4 text-navy" strokeWidth={1.7} /> {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 transition hover:text-navy">
                  <Mail className="size-4 text-navy" strokeWidth={1.7} /> {settings.email}
                </a>
              </li>
            )}
            {settings.instagram && (
              <li>
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-navy"
                >
                  <InstagramIcon className="size-4 text-red" /> @{settings.instagram}
                </a>
              </li>
            )}
            {settings.address && <li>{settings.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-6 text-xs text-pebble md:flex-row md:px-8">
          <p>Venda de bebidas alcoólicas proibida para menores de 18 anos.</p>
          <div className="flex gap-5">
            <Link href="/admin/login" className="hover:text-navy">
              Área da equipe
            </Link>
            <span>© {settings.storeName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
