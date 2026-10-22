import Image from "next/image";
import { Wine } from "lucide-react";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";

type Props = {
  path: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function BottleImage({ path, alt, sizes, className, priority }: Props) {
  const src = mediaUrl(path);
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center text-current/30", className)}>
        <Wine className="size-1/3" strokeWidth={1} />
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="relative h-full w-full">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
      </div>
    </div>
  );
}
