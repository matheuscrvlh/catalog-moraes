import { Suspense } from "react";
import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { landingFor } from "@/lib/admin/nav";
import { requireStaff } from "@/lib/auth/viewer";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-royal/10 text-navy">
        <ShieldAlert className="size-7" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Sem acesso a esta área</h1>
      <p className="mt-3 max-w-md text-sm text-ink/55">
        Seu cargo não inclui essa permissão. Fale com um administrador se precisar dela.
      </p>
      <Suspense>
        <BackLink />
      </Suspense>
    </div>
  );
}

async function BackLink() {
  const viewer = await requireStaff();
  const href = landingFor(viewer.permissions);
  if (href === "/admin/sem-acesso") return null;
  return (
    <ButtonLink href={href} variant="dark" className="mt-8">
      Voltar ao painel
    </ButtonLink>
  );
}
