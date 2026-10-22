import { CartDrawer } from "@/components/store/cart-drawer";
import { MobileNav } from "@/components/store/mobile-nav";
import { StoreProviders } from "@/components/store/providers";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { TopBar } from "@/components/store/top-bar";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <StoreProviders>
      <div className="min-h-screen bg-ivory text-ink">
        <TopBar />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MobileNav />
        <CartDrawer />
      </div>
    </StoreProviders>
  );
}
