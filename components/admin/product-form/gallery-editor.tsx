"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { uploadImage } from "../image-upload";

export type GalleryImage = { path: string; alt: string };

export function GalleryEditor({
  images,
  onChange,
}: {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: GalleryImage[] = [];
      for (const file of Array.from(files).slice(0, 12 - images.length)) {
        uploaded.push({ path: await uploadImage(file, "products"), alt: "" });
      }
      onChange([...images, ...uploaded]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...images];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <figure key={image.path} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-cloud">
            <Image src={mediaUrl(image.path)!} alt={image.alt} fill sizes="200px" className="object-contain p-3" />
            {index === 0 && (
              <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">Capa</span>
            )}
            <div className="absolute inset-x-2 bottom-2 flex justify-between opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <span className="flex gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-full bg-white p-1.5 shadow disabled:opacity-40"
                  aria-label="Mover para a esquerda"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-full bg-white p-1.5 shadow disabled:opacity-40"
                  aria-label="Mover para a direita"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => onChange(images.filter((_, position) => position !== index))}
                className="rounded-full bg-white p-1.5 text-red shadow"
                aria-label="Remover imagem"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </figure>
        ))}
        {images.length < 12 && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              upload(event.dataTransfer.files);
            }}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 text-[12.5px] text-ink/50 transition hover:border-royal hover:text-ink"
          >
            {busy ? (
              <LoaderCircle className="size-6 animate-spin" />
            ) : (
              <ImagePlus className="size-6" strokeWidth={1.5} />
            )}
            {busy ? "Enviando…" : "Adicionar fotos"}
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-ink/45">
        PNG com fundo transparente fica melhor na loja. A primeira imagem é a capa.
      </p>
      {error && <p className="mt-1 text-xs text-red">{error}</p>}
      <input
        ref={input}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={(event) => {
          upload(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
