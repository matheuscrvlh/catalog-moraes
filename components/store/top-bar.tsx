import Link from "next/link";
import { InstagramIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import { getStoreSettings } from "@/lib/catalog/queries";
import { whatsappLink } from "@/lib/format";

export async function TopBar() {
  const settings = await getStoreSettings();
  const whatsapp = whatsappLink(settings.whatsapp, "Olá! Gostaria de receber a tabela de vinhos da Moraes.");

  return (
    <div className="hidden border-b border-line bg-ivory text-[11.5px] text-stone md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-8">
        <p>
          Distribuidora de vinhos para adegas, mercados e restaurantes
          {settings.phone && <span className="text-pebble"> · {settings.phone}</span>}
        </p>
        <div className="flex items-center gap-5">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-navy"
            >
              <WhatsappIcon className="size-3.5" /> Pedir tabela de preços
            </a>
          )}
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition hover:text-navy"
            >
              <InstagramIcon className="size-3.5" /> @{settings.instagram}
            </a>
          )}
          <Link href="/admin/login" className="transition hover:text-navy">
            Área da equipe
          </Link>
        </div>
      </div>
    </div>
  );
}
