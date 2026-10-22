import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/admin/toaster";
import { navFor } from "@/lib/admin/nav";
import { can, requireStaff } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh bg-cloud font-admin text-ink">
      <Toaster>
        <div className="flex flex-col gap-5 p-4 lg:flex-row">
          <Suspense
            fallback={
              <>
                <aside className="hidden h-[calc(100svh-2rem)] w-[248px] shrink-0 rounded-[28px] bg-white lg:block" />
                <div className="h-15 rounded-[22px] bg-white lg:hidden" />
              </>
            }
          >
            <Sidebar />
          </Suspense>
          <div className="min-w-0 flex-1 md:px-2 lg:pt-3">
            <main className="mx-auto max-w-[1400px] pb-10">{children}</main>
          </div>
        </div>
      </Toaster>
    </div>
  );
}

async function Sidebar() {
  const viewer = await requireStaff();
  const supabase = await createClient();
  const canSeeOrders = can(viewer, "orders.manage");
  const [{ count: pending }, { count: activeProducts }] = await Promise.all([
    canSeeOrders
      ? supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["novo", "em_atendimento"])
      : { count: 0 },
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
  ]);

  return (
    <AdminSidebar
      groups={navFor(viewer.permissions)}
      pendingOrders={pending ?? 0}
      activeProducts={activeProducts ?? 0}
      user={{ name: viewer.fullName, email: viewer.email, role: viewer.role.name }}
      canSearchProducts={can(viewer, "products.manage")}
      canSeeOrders={canSeeOrders}
    />
  );
}
