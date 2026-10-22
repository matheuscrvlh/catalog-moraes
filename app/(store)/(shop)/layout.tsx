import { SiteFooter } from "@/components/store/site-footer";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
