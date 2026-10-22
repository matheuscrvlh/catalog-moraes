import type { Metadata } from "next";
import { Suspense } from "react";
import { SettingsForm } from "@/components/admin/team-forms";
import { Card, PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Loja"
        title="Configurações"
        description="Dados de contato exibidos no site e usados para receber os pedidos."
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
    <Card className="p-8">
      <SettingsForm settings={settings} />
    </Card>
  );
}
