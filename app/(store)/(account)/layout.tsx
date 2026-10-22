import { SiteHeader } from "@/components/store/site-header";
import { TopBar } from "@/components/store/top-bar";

export default function AccountLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <TopBar />
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
