import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, type Permission } from "./permissions";

export type Viewer = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  companyName: string | null;
  taxId: string | null;
  businessType: string | null;
  role: { id: string; name: string } | null;
  permissions: string[];
};

export type StaffViewer = Viewer & { role: { id: string; name: string } };

export const getViewer = cache(async (): Promise<Viewer | null> => {
  await connection();
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, company_name, tax_id, business_type, active, role:roles(id, name, permissions)",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.active) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    companyName: profile.company_name,
    taxId: profile.tax_id,
    businessType: profile.business_type,
    role: profile.role ? { id: profile.role.id, name: profile.role.name } : null,
    permissions: profile.role?.permissions ?? [],
  };
});

export function isStaff(viewer: Viewer | null): viewer is StaffViewer {
  return Boolean(viewer?.role);
}

export function can(viewer: Viewer | null, permission: Permission) {
  return isStaff(viewer) && hasPermission(viewer.permissions, permission);
}

export async function requireCustomer(next: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return viewer;
}

export async function requireStaff(permission?: Permission): Promise<StaffViewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/admin/login");
  if (!isStaff(viewer)) redirect("/admin/login?erro=sem-acesso");
  if (permission && !hasPermission(viewer.permissions, permission)) redirect("/admin/sem-acesso");
  return viewer;
}

export async function authorize(permission: Permission) {
  const viewer = await getViewer();
  return can(viewer, permission) ? (viewer as StaffViewer) : null;
}
