import type { Metadata } from "next";
import { BagView } from "@/components/store/checkout/bag-view";
import { getStoreSettings } from "@/lib/catalog/queries";

export const metadata: Metadata = { title: "Pedido" };

export default async function BagPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 pb-32 md:px-8">
      <div className="mb-10 text-center">
        <p className="font-script text-4xl text-bronze">Seu pedido</p>
        <h1 className="caps mt-1 text-[clamp(2.2rem,4vw,3rem)] text-navy">Revisar pedido</h1>
        <span className="mx-auto mt-5 block h-px w-14 bg-red" />
      </div>
      <BagView storeWhatsapp={settings.whatsapp} />
    </div>
  );
}
