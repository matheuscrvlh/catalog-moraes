"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/field";
import { saveProduct } from "@/lib/admin/product-actions";
import { formatPrice, SWEETNESS } from "@/lib/format";
import type { FormState } from "@/lib/forms";
import { mediaUrl } from "@/lib/media";
import { useToast } from "../toaster";
import { GalleryEditor, type GalleryImage } from "./gallery-editor";
import { ChipsInput, ScaleInput, SectionCard } from "./inputs";
import { emptyVariant, VariantsEditor, type VariantDraft } from "./variants-editor";

export type ProductFormData = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category_id: string;
  producer_id: string | null;
  country: string | null;
  region: string | null;
  grapes: string[];
  pairing: string[];
  sweetness: string | null;
  vintage: number | null;
  alcohol: number | null;
  serving_temp: string | null;
  aroma_notes: string | null;
  palate_notes: string | null;
  body: number | null;
  acidity: number | null;
  tannin: number | null;
  sweetness_level: number | null;
  badge: string | null;
  featured: boolean;
  active: boolean;
  variants: {
    id: string;
    label: string;
    volume_ml: number | null;
    sku: string | null;
    price: number | null;
    promo_price: number | null;
    stock: number;
    active: boolean;
  }[];
  images: { path: string; alt: string | null }[];
};

type Option = { id: string; name: string };
type Props = {
  product?: ProductFormData;
  categories: (Option & { accent: string })[];
  producers: (Option & { country: string | null; region: string | null })[];
  grapeSuggestions: string[];
};

const PAIRINGS = [
  "Carnes vermelhas",
  "Massas",
  "Queijos",
  "Peixes",
  "Frutos do mar",
  "Aves",
  "Saladas",
  "Sobremesas",
  "Aperitivos",
  "Pizza",
];

const str = (value: number | string | null | undefined) => (value == null ? "" : String(value));
const money = (value: number | null) => (value == null ? "" : value.toFixed(2));

export function ProductForm({ product, categories, producers, grapeSuggestions }: Props) {
  const notify = useToast();
  const [state, action, pending] = useActionState(saveProduct, {} as FormState);
  const handled = useRef<FormState | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [producerId, setProducerId] = useState(product?.producer_id ?? "");
  const [country, setCountry] = useState(product?.country ?? "");
  const [region, setRegion] = useState(product?.region ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [grapes, setGrapes] = useState(product?.grapes ?? []);
  const [pairing, setPairing] = useState(product?.pairing ?? []);
  const [profile, setProfile] = useState({
    body: product?.body ?? null,
    acidity: product?.acidity ?? null,
    tannin: product?.tannin ?? null,
    sweetnessLevel: product?.sweetness_level ?? null,
  });
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.length
      ? product.variants.map((variant) => ({
          key: variant.id,
          id: variant.id,
          label: variant.label,
          volumeMl: str(variant.volume_ml),
          sku: variant.sku ?? "",
          price: money(variant.price),
          promoPrice: money(variant.promo_price),
          stock: str(variant.stock),
          active: variant.active,
        }))
      : [emptyVariant()],
  );
  const [images, setImages] = useState<GalleryImage[]>(
    (product?.images ?? []).map((image) => ({ path: image.path, alt: image.alt ?? "" })),
  );

  const errors = state.errors ?? {};
  const accent = categories.find((category) => category.id === categoryId)?.accent ?? "#b02a4a";
  const producer = producers.find((entry) => entry.id === producerId);
  const prices = variants.map((variant) => Number(variant.promoPrice || variant.price)).filter((value) => value > 0);
  const cover = mediaUrl(images[0]?.path);

  useEffect(() => {
    if (state.ok && handled.current !== state) {
      handled.current = state;
      notify(state.message ?? "Salvo.");
    } else if (state.message && !state.ok && handled.current !== state) {
      handled.current = state;
      notify(state.message, "error");
    }
  }, [state, notify]);

  const selectProducer = (id: string) => {
    setProducerId(id);
    const selected = producers.find((entry) => entry.id === id);
    if (selected && !country) setCountry(selected.country ?? "");
    if (selected && !region) setRegion(selected.region ?? "");
  };

  return (
    <form action={action} noValidate className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="grapes" value={JSON.stringify(grapes)} />
      <input type="hidden" name="pairing" value={JSON.stringify(pairing)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          variants.map((variant) => ({
            id: variant.id,
            label: variant.label,
            volumeMl: variant.volumeMl,
            sku: variant.sku,
            price: variant.price,
            promoPrice: variant.promoPrice,
            stock: variant.stock || "0",
            active: variant.active,
          })),
        )}
      />

      <div className="space-y-6">
        <SectionCard title="Identificação">
          <Field tone="light" label="Nome do vinho" error={errors.name}>
            <Input
              tone="light"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              tone="light"
              label="Frase de destaque"
              error={errors.tagline}
              hint="Aparece abaixo do nome na página."
            >
              <Input tone="light" name="tagline" defaultValue={product?.tagline ?? ""} maxLength={160} />
            </Field>
            <Field tone="light" label="Endereço (slug)" error={errors.slug} hint="Em branco = gerado a partir do nome.">
              <Input tone="light" name="slug" defaultValue={product?.slug ?? ""} maxLength={120} />
            </Field>
          </div>
          <Field tone="light" label="Descrição" error={errors.description}>
            <Textarea
              tone="light"
              name="description"
              defaultValue={product?.description ?? ""}
              className="min-h-36"
              maxLength={4000}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Classificação" description="Usada nos filtros da loja e no dashboard.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field tone="light" label="Estilo" error={errors.categoryId}>
              <Select
                tone="light"
                name="categoryId"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field tone="light" label="Vinícola" error={errors.producerId}>
              <Select
                tone="light"
                name="producerId"
                value={producerId}
                onChange={(event) => selectProducer(event.target.value)}
              >
                <option value="">Sem vinícola</option>
                {producers.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field tone="light" label="País" error={errors.country}>
              <Input tone="light" name="country" value={country} onChange={(event) => setCountry(event.target.value)} />
            </Field>
            <Field tone="light" label="Região" error={errors.region}>
              <Input tone="light" name="region" value={region} onChange={(event) => setRegion(event.target.value)} />
            </Field>
          </div>
          <Field tone="light" label="Uvas" error={errors.grapes}>
            <ChipsInput
              value={grapes}
              onChange={setGrapes}
              placeholder="Digite e tecle Enter"
              suggestions={grapeSuggestions}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field tone="light" label="Doçura" error={errors.sweetness}>
              <Select tone="light" name="sweetness" defaultValue={product?.sweetness ?? ""}>
                <option value="">Não informado</option>
                {Object.entries(SWEETNESS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field tone="light" label="Safra" error={errors.vintage}>
              <Input
                tone="light"
                name="vintage"
                inputMode="numeric"
                defaultValue={str(product?.vintage)}
                placeholder="Ex.: 2022"
              />
            </Field>
            <Field tone="light" label="Teor alcoólico (%)" error={errors.alcohol}>
              <Input
                tone="light"
                name="alcohol"
                inputMode="decimal"
                defaultValue={str(product?.alcohol)}
                placeholder="Ex.: 13"
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          title="Variações"
          description="Cada versão vendável: volume, uva ou doçura, com preço e estoque próprios."
        >
          <VariantsEditor variants={variants} onChange={setVariants} errors={errors} />
        </SectionCard>

        <SectionCard title="Fotos">
          <GalleryEditor images={images} onChange={setImages} />
        </SectionCard>

        <SectionCard title="Na taça" description="Perfil sensorial e serviço exibidos na página do vinho.">
          <div className="grid gap-6 md:grid-cols-2">
            <ScaleInput
              name="body"
              label="Corpo"
              low="Leve"
              high="Encorpado"
              value={profile.body}
              onChange={(body) => setProfile({ ...profile, body })}
              accent={accent}
            />
            <ScaleInput
              name="acidity"
              label="Acidez"
              low="Macia"
              high="Vibrante"
              value={profile.acidity}
              onChange={(acidity) => setProfile({ ...profile, acidity })}
              accent={accent}
            />
            <ScaleInput
              name="tannin"
              label="Tanino"
              low="Suave"
              high="Marcante"
              value={profile.tannin}
              onChange={(tannin) => setProfile({ ...profile, tannin })}
              accent={accent}
            />
            <ScaleInput
              name="sweetnessLevel"
              label="Doçura"
              low="Seco"
              high="Doce"
              value={profile.sweetnessLevel}
              onChange={(sweetnessLevel) => setProfile({ ...profile, sweetnessLevel })}
              accent={accent}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field tone="light" label="Aroma" error={errors.aromaNotes}>
              <Input tone="light" name="aromaNotes" defaultValue={product?.aroma_notes ?? ""} maxLength={300} />
            </Field>
            <Field tone="light" label="Paladar" error={errors.palateNotes}>
              <Input tone="light" name="palateNotes" defaultValue={product?.palate_notes ?? ""} maxLength={300} />
            </Field>
          </div>
          <Field tone="light" label="Temperatura de serviço" error={errors.servingTemp}>
            <Input
              tone="light"
              name="servingTemp"
              defaultValue={product?.serving_temp ?? ""}
              placeholder="Ex.: 16–18 °C"
              className="max-w-xs"
            />
          </Field>
          <Field tone="light" label="Harmoniza com" error={errors.pairing}>
            <ChipsInput
              value={pairing}
              onChange={setPairing}
              placeholder="Digite e tecle Enter"
              suggestions={PAIRINGS}
            />
          </Field>
        </SectionCard>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-[26px] bg-white p-5">
          <p className="mb-4 text-[12px] font-semibold text-mist">Prévia na loja</p>
          <div className="overflow-hidden border border-line">
            <div className="relative aspect-4/5 bg-linen">
              <div
                className="absolute inset-x-[20%] bottom-[6%] h-[30%] rounded-[50%] opacity-40 blur-2xl"
                style={{ background: accent }}
              />
              {cover && <Image src={cover} alt="" fill sizes="300px" className="object-contain px-12 py-8" />}
              {badge && (
                <span className="absolute top-3 left-3 bg-white px-2 py-1 text-[9px] font-medium tracking-[0.18em] text-navy uppercase">
                  {badge}
                </span>
              )}
            </div>
            <div className="px-4 py-5 text-center font-sans">
              <p className="truncate text-[10px] font-medium tracking-[0.22em] text-bronze uppercase">
                {producer?.name ?? "Vinícola"}
              </p>
              <p className="mt-2 font-display text-xl leading-tight font-medium text-ink">{name || "Nome do vinho"}</p>
              <p className="mt-1 truncate text-xs text-stone">
                {[country, grapes.slice(0, 2).join(", ")].filter(Boolean).join(" · ") || "Uvas"}
              </p>
              <p className="mt-3 text-[16px] font-medium text-navy">
                {prices.length > 1 && <span className="mr-1 text-[10px] text-pebble uppercase">a partir de</span>}
                {formatPrice(prices.length ? Math.min(...prices) : null)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[26px] border border-ink/6 bg-white p-5">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="block font-medium">Publicado</span>
              <span className="text-xs text-ink/45">Visível na loja</span>
            </span>
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="size-5 accent-[#2f9e6e]"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="block font-medium">Destaque</span>
              <span className="text-xs text-ink/45">Aparece na home</span>
            </span>
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="size-5 accent-navy"
            />
          </label>
          <Field tone="light" label="Selo" error={errors.badge} hint="Ex.: Exclusivo, Reserva, Oferta">
            <Input
              tone="light"
              name="badge"
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
              maxLength={24}
            />
          </Field>
          {state.message && !state.ok && <FormMessage message={state.message} />}
          <Button type="submit" variant="dark" size="lg" pending={pending} className="w-full">
            {product ? "Salvar alterações" : "Cadastrar produto"}
          </Button>
          {product && (
            <Link
              href={`/vinhos/${product.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-2 text-[13px] text-ink/55 hover:text-ink"
            >
              Ver na loja <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
      </aside>
    </form>
  );
}
