import type { Metadata } from "next";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { DeleteButton } from "@/components/admin/controls";
import { RoleSheet } from "@/components/admin/team-forms";
import { PageHeader, PanelSkeleton } from "@/components/admin/ui";
import { deleteRole } from "@/lib/admin/team-actions";
import { PERMISSIONS, PERMISSION_KEYS } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Cargos" };

export default function RolesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Equipe"
        title="Cargos"
        description="Cargos agrupam permissões. Ao alterar um cargo, todos os membros dele são atualizados na hora."
        actions={<RoleSheet />}
      />
      <Suspense fallback={<PanelSkeleton />}>
        <RolesGrid />
      </Suspense>
    </>
  );
}

async function RolesGrid() {
  await requireStaff("roles.manage");
  const supabase = await createClient();
  const [{ data: roles }, { data: members }] = await Promise.all([
    supabase
      .from("roles")
      .select("id, name, description, permissions, is_system")
      .order("is_system", { ascending: false })
      .order("name"),
    supabase.from("profiles").select("role_id").not("role_id", "is", null),
  ]);

  const counts = new Map<string, number>();
  (members ?? []).forEach(
    (member) => member.role_id && counts.set(member.role_id, (counts.get(member.role_id) ?? 0) + 1),
  );

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {(roles ?? []).map((role) => {
        const full = role.permissions.includes("*");
        const total = counts.get(role.id) ?? 0;
        const members = total === 1 ? "1 membro" : `${total} membros`;
        return (
          <article key={role.id} className="flex flex-col rounded-[26px] border border-ink/6 bg-white p-6">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-display text-3xl leading-none">
                  {role.name}
                  {role.is_system && <Lock className="size-4 text-ink/35" aria-label="Cargo do sistema" />}
                </h2>
                <p className="mt-2 text-[13px] text-ink/55">{role.description}</p>
              </div>
              <span className="flex items-center">
                <RoleSheet role={role} />
                {!role.is_system && (
                  <DeleteButton
                    label={`Remover ${role.name}`}
                    confirmText={`Remover o cargo "${role.name}"? ${members} perderão o acesso ao painel.`}
                    action={deleteRole.bind(null, role.id)}
                  />
                )}
              </span>
            </header>
            <ul className="mt-5 grid grid-cols-2 gap-1.5">
              {PERMISSION_KEYS.map((key) => {
                const granted = full || role.permissions.includes(key);
                return (
                  <li
                    key={key}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-[12.5px]",
                      granted ? "bg-navy/8 text-navy" : "bg-cloud/60 text-ink/35 line-through",
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", granted ? "bg-royal" : "bg-ink/20")} />
                    {PERMISSIONS[key].label}
                  </li>
                );
              })}
            </ul>
            <p className="mt-auto pt-5 text-[12px] text-ink/45">{members}</p>
          </article>
        );
      })}
    </div>
  );
}
