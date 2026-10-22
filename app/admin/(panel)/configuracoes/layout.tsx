import { Suspense } from "react";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import { PageHeader } from "@/components/admin/ui";
import { SETTINGS_TABS } from "@/lib/admin/nav";
import { can, requireStaff } from "@/lib/auth/viewer";

export default function SettingsLayout({ children }: LayoutProps<"/admin/configuracoes">) {
  return (
    <>
      <PageHeader
        eyebrow="Plataforma"
        title="Configurações"
        description="Preferências da loja, dados de contato e banners da página inicial."
      />
      <Suspense fallback={<div className="mb-6 h-11" />}>
        <Tabs />
      </Suspense>
      {children}
    </>
  );
}

async function Tabs() {
  const viewer = await requireStaff();
  const tabs = SETTINGS_TABS.filter((tab) => can(viewer, tab.permission)).map(({ href, label }) => ({ href, label }));
  return <SettingsTabs tabs={tabs} />;
}
