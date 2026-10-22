import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { CalendarClock } from "lucide-react";
import { DiamondRing } from "@/components/brand/brand-mark";
import { BannerSheet } from "@/components/admin/catalog-forms";
import { ActionSwitch, DeleteButton } from "@/components/admin/controls";
import { EmptyState, PanelSkeleton } from "@/components/admin/ui";
import { deleteBanner, setBannerActive } from "@/lib/admin/catalog-actions";
import { requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Banners" };

const THEMES: Record<string, string> = {
  wine: "bg-[linear-gradient(120deg,#3a0716,#7d1230_60%,#a51c40)]",
  navy: "bg-[linear-gradient(120deg,#070a1c,#142663_65%,#1f3a8a)]",
  gold: "bg-[linear-gradient(120deg,#1e1608,#5b4419_60%,#b08a3e)]",
};

export default function BannersPage() {
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mist">
          O carrossel da página inicial. Agende início e fim para campanhas e promoções.
        </p>
        <BannerSheet />
      </div>
      <Suspense fallback={<PanelSkeleton />}>
        <BannersGrid />
      </Suspense>
    </>
  );
}

async function BannersGrid() {
  await requireStaff("catalog.manage");
  const supabase = await createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("position");

  if (!banners?.length) return <EmptyState title="Nenhum banner" description="Crie o primeiro destaque da home." />;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {banners.map((banner) => {
        const image = mediaUrl(banner.image_path);
        return (
          <article key={banner.id} className="overflow-hidden rounded-[26px] border border-ink/6 bg-white">
            <div
              className={cn(
                "relative h-44 overflow-hidden p-6 text-white",
                THEMES[banner.theme],
                !banner.active && "grayscale",
              )}
            >
              {image ? (
                <>
                  <Image src={image} alt="" fill sizes="600px" className="object-cover" />
                  <div className="absolute inset-0 bg-linear-to-r from-ink-950/90 to-transparent" />
                </>
              ) : (
                <DiamondRing className="absolute top-1/2 -right-10 size-64 -translate-y-1/2 text-white/20" />
              )}
              <div className="relative max-w-[75%]">
                <p className="eyebrow text-[9px]! text-white/70">{banner.eyebrow}</p>
                <p className="mt-2 font-display text-3xl leading-none">{banner.title}</p>
                <p className="mt-2 line-clamp-2 text-xs text-white/70">{banner.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0 text-[12.5px] text-ink/55">
                <span className="font-mono">#{banner.position}</span>
                {banner.cta_href && <span className="ml-2 truncate">→ {banner.cta_href}</span>}
                {(banner.starts_at || banner.ends_at) && (
                  <span className="mt-1 flex items-center gap-1.5">
                    <CalendarClock className="size-3.5" />
                    {banner.starts_at ? formatDateTime(banner.starts_at) : "agora"} →{" "}
                    {banner.ends_at ? formatDateTime(banner.ends_at) : "sem fim"}
                  </span>
                )}
              </div>
              <span className="flex shrink-0 items-center gap-2">
                <ActionSwitch
                  checked={banner.active}
                  label={`Exibir ${banner.title}`}
                  action={setBannerActive.bind(null, banner.id)}
                />
                <BannerSheet banner={banner} />
                <DeleteButton
                  label={`Remover ${banner.title}`}
                  confirmText={`Remover o banner "${banner.title}"?`}
                  action={deleteBanner.bind(null, banner.id)}
                />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
