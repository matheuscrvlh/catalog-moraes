"use client";

import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveBanner, saveCategory, saveProducer } from "@/lib/admin/catalog-actions";
import { ActionForm } from "./action-form";
import { Sheet } from "./controls";
import { ImageUpload } from "./image-upload";

export type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent: string;
  image_path: string | null;
  position: number;
};

export type ProducerRecord = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  region: string | null;
  description: string | null;
};

export type BannerRecord = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_path: string | null;
  theme: string;
  position: number;
  starts_at: string | null;
  ends_at: string | null;
};

function Trigger({ editing, label, open }: { editing: boolean; label: string; open: () => void }) {
  return editing ? (
    <button
      type="button"
      onClick={open}
      className="rounded-xl p-2 text-ink/45 transition hover:bg-cloud hover:text-ink"
      aria-label={`Editar ${label}`}
    >
      <Pencil className="size-4" />
    </button>
  ) : (
    <Button variant="dark" onClick={open}>
      <Plus className="size-4" /> {label}
    </Button>
  );
}

export function CategorySheet({ category }: { category?: CategoryRecord }) {
  return (
    <Sheet
      title={category ? "Editar categoria" : "Nova categoria"}
      description="Estilos aparecem nos filtros da loja e no dashboard."
      trigger={(open) => <Trigger editing={Boolean(category)} label={category?.name ?? "Nova categoria"} open={open} />}
    >
      {(close) => (
        <ActionForm action={saveCategory} onDone={close}>
          {(errors) => (
            <>
              <input type="hidden" name="id" value={category?.id ?? ""} />
              <Field tone="light" label="Nome" error={errors.name}>
                <Input tone="light" name="name" defaultValue={category?.name} required />
              </Field>
              <Field
                tone="light"
                label="Endereço (slug)"
                error={errors.slug}
                hint="Deixe em branco para gerar a partir do nome."
              >
                <Input tone="light" name="slug" defaultValue={category?.slug} />
              </Field>
              <Field tone="light" label="Descrição" error={errors.description}>
                <Textarea tone="light" name="description" defaultValue={category?.description ?? ""} maxLength={240} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field tone="light" label="Cor" error={errors.accent} hint="Usada na loja e nos gráficos.">
                  <Input
                    tone="light"
                    type="color"
                    name="accent"
                    defaultValue={category?.accent ?? "#b02a4a"}
                    className="h-12 p-1.5"
                  />
                </Field>
                <Field tone="light" label="Ordem" error={errors.position}>
                  <Input tone="light" type="number" name="position" min={0} defaultValue={category?.position ?? 0} />
                </Field>
              </div>
              <Field tone="light" label="Imagem de capa (opcional)">
                <ImageUpload name="imagePath" folder="categories" defaultValue={category?.image_path} />
              </Field>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}

export function ProducerSheet({ producer }: { producer?: ProducerRecord }) {
  return (
    <Sheet
      title={producer ? "Editar vinícola" : "Nova vinícola"}
      trigger={(open) => <Trigger editing={Boolean(producer)} label={producer?.name ?? "Nova vinícola"} open={open} />}
    >
      {(close) => (
        <ActionForm action={saveProducer} onDone={close}>
          {(errors) => (
            <>
              <input type="hidden" name="id" value={producer?.id ?? ""} />
              <Field tone="light" label="Nome" error={errors.name}>
                <Input tone="light" name="name" defaultValue={producer?.name} required />
              </Field>
              <Field
                tone="light"
                label="Endereço (slug)"
                error={errors.slug}
                hint="Deixe em branco para gerar a partir do nome."
              >
                <Input tone="light" name="slug" defaultValue={producer?.slug} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field tone="light" label="País" error={errors.country}>
                  <Input tone="light" name="country" defaultValue={producer?.country ?? ""} />
                </Field>
                <Field tone="light" label="Região" error={errors.region}>
                  <Input tone="light" name="region" defaultValue={producer?.region ?? ""} />
                </Field>
              </div>
              <Field tone="light" label="Sobre" error={errors.description}>
                <Textarea tone="light" name="description" defaultValue={producer?.description ?? ""} maxLength={600} />
              </Field>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}

const toLocalInput = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 16).replace(" ", "T")
    : "";

export function BannerSheet({ banner }: { banner?: BannerRecord }) {
  return (
    <Sheet
      wide
      title={banner ? "Editar banner" : "Novo banner"}
      description="Banners aparecem no carrossel da página inicial."
      trigger={(open) => <Trigger editing={Boolean(banner)} label={banner?.title ?? "Novo banner"} open={open} />}
    >
      {(close) => (
        <ActionForm action={saveBanner} onDone={close}>
          {(errors) => (
            <>
              <input type="hidden" name="id" value={banner?.id ?? ""} />
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <Field tone="light" label="Chamada" error={errors.eyebrow}>
                  <Input tone="light" name="eyebrow" defaultValue={banner?.eyebrow ?? ""} maxLength={40} />
                </Field>
                <Field tone="light" label="Título" error={errors.title}>
                  <Input tone="light" name="title" defaultValue={banner?.title} maxLength={90} required />
                </Field>
              </div>
              <Field tone="light" label="Texto" error={errors.subtitle}>
                <Textarea tone="light" name="subtitle" defaultValue={banner?.subtitle ?? ""} maxLength={220} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field tone="light" label="Texto do botão" error={errors.ctaLabel}>
                  <Input tone="light" name="ctaLabel" defaultValue={banner?.cta_label ?? ""} maxLength={30} />
                </Field>
                <Field tone="light" label="Link do botão" error={errors.ctaHref} hint="Ex.: /vinhos?categoria=tintos">
                  <Input tone="light" name="ctaHref" defaultValue={banner?.cta_href ?? ""} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field tone="light" label="Tema" error={errors.theme}>
                  <Select tone="light" name="theme" defaultValue={banner?.theme ?? "gold"}>
                    <option value="wine">Vinho escuro</option>
                    <option value="navy">Azul Moraes</option>
                    <option value="gold">Claro (marfim)</option>
                  </Select>
                </Field>
                <Field tone="light" label="Início" error={errors.startsAt}>
                  <Input
                    tone="light"
                    type="datetime-local"
                    name="startsAt"
                    defaultValue={toLocalInput(banner?.starts_at ?? null)}
                  />
                </Field>
                <Field tone="light" label="Fim" error={errors.endsAt}>
                  <Input
                    tone="light"
                    type="datetime-local"
                    name="endsAt"
                    defaultValue={toLocalInput(banner?.ends_at ?? null)}
                  />
                </Field>
              </div>
              <Field tone="light" label="Ordem" error={errors.position}>
                <Input
                  tone="light"
                  type="number"
                  name="position"
                  min={0}
                  defaultValue={banner?.position ?? 0}
                  className="max-w-32"
                />
              </Field>
              <Field
                tone="light"
                label="Foto de fundo (opcional)"
                hint="Sem foto, o banner usa o tema com os anéis da marca."
              >
                <ImageUpload
                  name="imagePath"
                  folder="banners"
                  defaultValue={banner?.image_path}
                  aspect="aspect-[21/9]"
                />
              </Field>
            </>
          )}
        </ActionForm>
      )}
    </Sheet>
  );
}
