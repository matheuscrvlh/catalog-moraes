import type { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound, UserRound } from "lucide-react";
import { OwnAccessForm, OwnDetailsForm } from "@/components/admin/profile-forms";
import { Badge, Card, PageHeader, PanelSkeleton, Section } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/viewer";
import { initials } from "@/lib/text";

export const metadata: Metadata = { title: "Meu perfil" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Profile />
    </Suspense>
  );
}

async function Profile() {
  const viewer = await requireStaff();

  return (
    <>
      <PageHeader eyebrow="Conta" title="Meu perfil" description="Seus dados no painel e as credenciais de acesso." />
      <div className="space-y-5">
        <Card className="flex items-center gap-4 p-6 md:p-8">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-red to-wine text-lg font-bold text-white">
            {initials(viewer.fullName || viewer.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-ink">{viewer.fullName || viewer.email}</p>
            <p className="truncate text-sm text-mist">{viewer.email}</p>
          </div>
          <Badge tone="#2f43b8" className="ml-auto">
            {viewer.role.name}
          </Badge>
        </Card>

        <Section icon={UserRound} title="Dados pessoais" description="Como seu nome aparece no painel e nos pedidos.">
          <OwnDetailsForm fullName={viewer.fullName} phone={viewer.phone} />
        </Section>

        <Section
          icon={KeyRound}
          title="Acesso"
          description="Troque o e-mail de login ou defina uma nova senha. Confirme com a senha atual."
        >
          <OwnAccessForm email={viewer.email} />
        </Section>
      </div>
    </>
  );
}
