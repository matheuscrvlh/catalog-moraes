"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { CATALOG_BUCKET, mediaUrl } from "@/lib/media";
import { getBrowserClient } from "@/lib/supabase/browser";

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadImage(file: File, folder: string) {
  if (!ACCEPT.includes(file.type)) throw new Error("Use PNG, JPG, WEBP ou AVIF.");
  if (file.size > MAX_BYTES) throw new Error("A imagem deve ter no máximo 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "webp";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await getBrowserClient().storage.from(CATALOG_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error("Falha no envio da imagem.");
  return path;
}

type Props = {
  name: string;
  folder: string;
  defaultValue?: string | null;
  aspect?: string;
  fit?: "cover" | "contain";
};

export function ImageUpload({ name, folder, defaultValue, aspect = "aspect-[4/3]", fit = "cover" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const src = mediaUrl(path);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setPath(await uploadImage(file, folder));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={path} />
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-dashed border-ink/15 bg-cloud/60 transition hover:border-royal",
          aspect,
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFile(event.dataTransfer.files[0]);
        }}
      >
        {src && (
          <Image
            src={src}
            alt=""
            fill
            sizes="480px"
            className={fit === "cover" ? "object-cover" : "object-contain p-4"}
          />
        )}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 text-[13px] text-ink/55 transition",
            src && "bg-ink/0 opacity-0 group-hover:bg-ink/40 group-hover:text-white group-hover:opacity-100",
          )}
        >
          {busy ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" strokeWidth={1.5} />}
          {busy ? "Enviando…" : src ? "Trocar imagem" : "Clique ou arraste uma imagem"}
        </button>
        {src && !busy && (
          <button
            type="button"
            onClick={() => setPath("")}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-ink shadow"
            aria-label="Remover imagem"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red">{error}</p>}
      <input
        ref={input}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
