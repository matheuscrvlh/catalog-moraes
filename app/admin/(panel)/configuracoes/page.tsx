import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { CircleDollarSign } from "lucide-react";
import { ActionSwitch } from "@/components/admin/controls";
import { SettingsForm } from "@/components/admin/team-forms";
import { Card, CardTitle, PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { setStorePrices } from "@/lib/admin/team-actions";
import { requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plataforma"
        title="Configurações"
        description="Preferências da loja e dados de contato da distribuidora."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  await requireStaff("settings.manage");
  const supabase = await createClient();
  const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();
  if (!settings) return null;

  return (
    <div className="max-w-4xl space-y-5">
      <Card className="p-6 md:p-8">
        <CardTitle title="Loja" description="Como o catálogo aparece para os clientes." />
        <Preference
          icon={<CircleDollarSign className="size-5" strokeWidth={1.8} />}
          title="Exibir preços dos vinhos"
          description="Desligado, a loja mostra “Preço sob consulta” em todos os rótulos e o cliente envia o pedido sem ver valores."
        >
          <ActionSwitch checked={settings.show_prices} label="Exibir preços dos vinhos" action={setStorePrices} />
        </Preference>
      </Card>

      <Card className="p-6 md:p-8">
        <CardTitle title="Contato" description="Dados exibidos no site e usados para receber os pedidos." />
        <SettingsForm settings={settings} />
      </Card>
    </div>
  );
}

function Preference({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-cloud p-4 sm:items-center md:p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cloud text-navy">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-mist">{description}</p>
      </div>
      {children}
    </div>
  );
}
