import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/admin/toaster";
import { AdminTopbar } from "@/components/admin/topbar";
import { navFor } from "@/lib/admin/nav";
import { can, requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-cloud font-admin text-ink">
      <Toaster>
        <div className="flex gap-5 p-4">
          <Suspense
            fallback={
              <aside className="hidden h-[calc(100vh-2rem)] w-[248px] shrink-0 rounded-[28px] bg-white lg:block" />
            }
          >
            <Sidebar />
          </Suspense>
          <div className="min-w-0 flex-1 md:px-2">
            <Suspense fallback={<div className="mb-6 h-12" />}>
              <Topbar />
            </Suspense>
            <main className="mx-auto max-w-[1400px] pb-10">{children}</main>
          </div>
        </div>
      </Toaster>
    </div>
  );
}

async function pendingCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("status", ["novo", "em_atendimento"]);
  return count ?? 0;
}

async function Sidebar() {
  const viewer = await requireStaff();
  const supabase = await createClient();
  const [pending, { count: activeProducts }] = await Promise.all([
    can(viewer, "orders.manage") ? pendingCount() : 0,
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  return (
    <AdminSidebar groups={navFor(viewer.permissions)} pendingOrders={pending} activeProducts={activeProducts ?? 0} />
  );
}

async function Topbar() {
  const viewer = await requireStaff();
  const pending = can(viewer, "orders.manage") ? await pendingCount() : 0;

  return (
    <AdminTopbar
      name={viewer.fullName}
      email={viewer.email}
      role={viewer.role.name}
      pendingOrders={pending}
      canSearchProducts={can(viewer, "products.manage")}
    />
  );
}
