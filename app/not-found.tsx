import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <BrandMark tone="light" className="h-12 w-auto" />
      <p className="mt-10 font-display text-[clamp(6rem,18vw,10rem)] leading-none font-medium text-navy">404</p>
      <p className="font-script text-4xl text-bronze">Rótulo não encontrado</p>
      <p className="mt-4 max-w-sm text-stone">O endereço pode ter mudado ou o produto saiu do catálogo.</p>
      <Link
        href="/vinhos"
        className="mt-10 bg-navy px-8 py-3.5 text-[12px] font-medium tracking-[0.2em] text-white uppercase transition hover:bg-navy-900"
      >
        Ver catálogo
      </Link>
    </main>
  );
}
