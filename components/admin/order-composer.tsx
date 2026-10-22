"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, ImageIcon, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { addOrderComment } from "@/lib/admin/order-actions";
import {
  formatBytes,
  ORDER_FILE_MAX_BYTES,
  ORDER_FILE_MAX_COUNT,
  ORDER_FILE_TYPES,
  ORDER_FILES_BUCKET,
} from "@/lib/orders/files";
import { getBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "./toaster";

export function OrderComposer({ orderId }: { orderId: string }) {
  const notify = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pick = (list: FileList | null) => {
    setError(null);
    const picked = [...(list ?? [])];
    const invalid = picked.find((file) => !ORDER_FILE_TYPES.includes(file.type) || file.size > ORDER_FILE_MAX_BYTES);
    if (invalid) setError(`“${invalid.name}” não é aceito. Use imagem, PDF, planilha ou documento de até 10 MB.`);
    const accepted = picked.filter(
      (file) => file !== invalid && ORDER_FILE_TYPES.includes(file.type) && file.size <= ORDER_FILE_MAX_BYTES,
    );
    setFiles((current) => [...current, ...accepted].slice(0, ORDER_FILE_MAX_COUNT));
    if (input.current) input.current.value = "";
  };

  const submit = () => {
    setError(null);
    if (!body.trim() && !files.length) return setError("Escreva um comentário ou anexe um arquivo.");
    startTransition(async () => {
      const storage = getBrowserClient().storage.from(ORDER_FILES_BUCKET);
      const uploaded: { path: string; name: string; type: string; size: number }[] = [];
      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
        const path = `${orderId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await storage.upload(path, file, { contentType: file.type });
        if (uploadError) {
          if (uploaded.length) await storage.remove(uploaded.map((entry) => entry.path));
          return setError(`Falha ao enviar “${file.name}”. Tente novamente.`);
        }
        uploaded.push({ path, name: file.name, type: file.type, size: file.size });
      }

      const result = await addOrderComment({ orderId, body, files: uploaded });
      if (!result.ok) return setError(result.message ?? "Não foi possível salvar.");
      notify(result.message ?? "Comentário adicionado.");
      setBody("");
      setFiles([]);
    });
  };

  return (
    <div className="rounded-2xl border border-ink/8 bg-cloud/40 p-3 focus-within:border-royal/30 focus-within:bg-white">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Registre um contato, combine entrega ou anexe comprovantes e fotos…"
        className="w-full resize-none bg-transparent px-2 py-1.5 text-[14px] text-ink outline-none placeholder:text-mist"
      />

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2 px-1 pb-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="inline-flex max-w-full items-center gap-2 rounded-xl bg-white py-1.5 pr-1.5 pl-3 text-[12.5px] text-ink shadow-[0_1px_2px_rgba(23,25,43,0.06)]"
            >
              {file.type.startsWith("image/") ? (
                <ImageIcon className="size-4 shrink-0 text-royal" />
              ) : (
                <FileText className="size-4 shrink-0 text-royal" />
              )}
              <span className="truncate">{file.name}</span>
              <span className="shrink-0 text-mist">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => setFiles((current) => current.filter((_, position) => position !== index))}
                className="rounded-lg p-1 text-mist hover:bg-cloud hover:text-ink"
                aria-label={`Remover ${file.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-ink/6 pt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-ink/70 transition hover:bg-cloud hover:text-ink">
          <Paperclip className="size-4" /> Anexar foto ou arquivo
          <input
            ref={input}
            type="file"
            multiple
            accept={ORDER_FILE_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => pick(event.target.files)}
          />
        </label>
        <Button type="button" variant="dark" size="sm" pending={pending} onClick={submit}>
          Comentar
        </Button>
      </div>
      {error && (
        <div className="px-1 pt-2">
          <FormMessage message={error} />
        </div>
      )}
    </div>
  );
}
