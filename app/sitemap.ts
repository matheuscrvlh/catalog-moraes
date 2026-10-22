import type { MetadataRoute } from "next";
import { getProductSlugs } from "@/lib/catalog/queries";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProductSlugs();
  return [
    { url: env.siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${env.siteUrl}/vinhos`, changeFrequency: "daily", priority: 0.9 },
    ...slugs.map((slug) => ({
      url: `${env.siteUrl}/vinhos/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
