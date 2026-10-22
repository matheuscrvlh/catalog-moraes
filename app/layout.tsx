import type { Metadata, Viewport } from "next";
import { Allura, Cormorant_Garamond, Geist_Mono, Jost, Plus_Jakarta_Sans } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const sans = Jost({ subsets: ["latin"], variable: "--font-jost" });
const script = Allura({ subsets: ["latin"], weight: "400", variable: "--font-allura" });
const admin = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: "Moraes Comercial · Vinhos",
    template: "%s · Moraes Comercial",
  },
  description:
    "Vinhos nacionais e importados com curadoria da Distribuidora Moraes Comercial. Tintos, brancos, rosés e espumantes com atendimento pelo WhatsApp.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Moraes Comercial",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${serif.variable} ${sans.variable} ${script.variable} ${admin.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
