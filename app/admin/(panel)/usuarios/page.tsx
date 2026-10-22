import type { Metadata } from "next";
import { Suspense } from "react";
import { InviteMemberSheet, MemberControls } from "@/components/admin/team-forms";
import { Badge, PageHeader, PanelSkeleton, table } from "@/components/admin/ui";
import { requireStaff } from "@/lib/auth/viewer";
import { formatDay } from "@/lib/format";
import { initials } from "@/lib/text";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Usuários" };

export default function UsersPage() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  const viewer = await requireStaff("users.manage");
  const supabase = await createClient();
  const [{ data: roles }, { data: members }] = await Promise.all([
    supabase.from("roles").select("id, name").order("name"),
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, active, created_at, role:roles(id, name)")
      .not("role_id", "is", null)
      .order("full_name"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Equipe"
        title="Usuários"
        description="Quem tem acesso ao painel. Cada membro enxerga apenas o que o cargo permite."
        actions={<InviteMemberSheet roles={roles ?? []} />}
      />
      <div className={table.wrap}>
        <table className={table.table}>
          <thead className={table.head}>
            <tr>
              <th className={table.th}>Membro</th>
              <th className={table.th}>Cargo atual</th>
              <th className={table.th}>Status</th>
              <th className={table.th}>Desde</th>
              <th className={`${table.th} text-right`}>Acesso</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((member) => (
              <tr key={member.id} className={table.row}>
                <td className={table.td}>
                  <span className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-navy to-red font-mono text-xs text-white">
                      {initials(member.full_name || member.email)}
                    </span>
                    <span>
                      <span className="block font-medium">{member.full_name || member.email}</span>
                      <span className="text-xs text-ink/45">{member.email}</span>
                    </span>
                  </span>
                </td>
                <td className={table.td}>{member.role?.name}</td>
                <td className={table.td}>
                  <Badge tone={member.active ? "#2f9e6e" : "#8a8fa8"}>{member.active ? "Ativo" : "Suspenso"}</Badge>
                </td>
                <td className={`${table.td} text-ink/55`}>{formatDay(member.created_at)}</td>
                <td className={table.td}>
                  {member.role && (
                    <MemberControls
                      memberId={member.id}
                      roleId={member.role.id}
                      active={member.active}
                      roles={roles ?? []}
                      isSelf={member.id === viewer.id}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
