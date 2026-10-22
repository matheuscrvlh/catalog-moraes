import { CartDrawer } from "@/components/store/cart-drawer";
import { MobileNav } from "@/components/store/mobile-nav";
import { StoreProviders } from "@/components/store/providers";
import { SiteHeader } from "@/components/store/site-header";
import { TopBar } from "@/components/store/top-bar";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <StoreProviders>
      <div className="flex min-h-svh flex-col bg-ivory text-ink">
        <TopBar />
        <SiteHeader />
        {children}
        <MobileNav />
        <CartDrawer />
      </div>
    </StoreProviders>
  );
}
