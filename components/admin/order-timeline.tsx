import Image from "next/image";
import { ArrowRight, Download, FileText, MessageSquare, ShoppingBag } from "lucide-react";
import type { OrderEvent } from "@/lib/admin/order-log";
import { formatDateTime, formatRelative, ORDER_STATUS } from "@/lib/format";
import { formatBytes } from "@/lib/orders/files";
import { initials } from "@/lib/text";
import { Badge } from "./ui";

function Marker({ event }: { event: OrderEvent }) {
  if (event.kind === "comment") {
    return (
      <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-navy to-royal text-[11px] font-bold text-white">
        {initials(event.author ?? "") || <MessageSquare className="size-4" />}
      </span>
    );
  }
  const Icon = event.kind === "created" ? ShoppingBag : ArrowRight;
  const tone = event.to ? ORDER_STATUS[event.to].tone : "#2f43b8";
  return (
    <span
      className="flex size-9 items-center justify-center rounded-full"
      style={{ background: `${tone}1a`, color: tone }}
    >
      <Icon className="size-4" />
    </span>
  );
}

function Summary({ event, fromStore }: { event: OrderEvent; fromStore: boolean }) {
  const who = <strong className="font-semibold text-ink">{event.author ?? "Sistema"}</strong>;
  if (event.kind === "created") {
    return fromStore ? <>Pedido enviado pela loja por {who}</> : <>Pedido criado por {who}</>;
  }
  if (event.kind === "status" && event.to) {
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {who} alterou o status
        {event.from && <Badge tone={ORDER_STATUS[event.from].tone}>{ORDER_STATUS[event.from].label}</Badge>}
        <ArrowRight className="size-3.5 text-mist" />
        <Badge tone={ORDER_STATUS[event.to].tone}>{ORDER_STATUS[event.to].label}</Badge>
      </span>
    );
  }
  return who;
}

function Attachments({ files }: { files: OrderEvent["files"] }) {
  const images = files.filter((file) => file.mimeType.startsWith("image/") && file.mimeType !== "image/heic");
  const documents = files.filter((file) => !images.includes(file));

  return (
    <div className="mt-3 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((file) =>
            file.url ? (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="relative block size-24 overflow-hidden rounded-xl border border-ink/8 bg-cloud transition hover:opacity-90"
                title={file.name}
              >
                <Image src={file.url} alt={file.name} fill sizes="96px" unoptimized className="object-cover" />
              </a>
            ) : null,
          )}
        </div>
      )}
      {documents.map((file) => (
        <a
          key={file.id}
          href={file.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="flex max-w-sm items-center gap-3 rounded-xl border border-ink/8 bg-white px-3 py-2.5 text-[13px] transition hover:border-royal/30"
        >
          <FileText className="size-5 shrink-0 text-royal" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">{file.name}</span>
            <span className="text-[11.5px] text-mist">{formatBytes(file.size)}</span>
          </span>
          <Download className="size-4 text-mist" />
        </a>
      ))}
    </div>
  );
}

export function OrderTimeline({ events, fromStore }: { events: OrderEvent[]; fromStore: boolean }) {
  if (!events.length) return <p className="py-6 text-center text-[13px] text-mist">Nenhuma atualização ainda.</p>;

  return (
    <ol className="relative mt-5 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-px before:bg-ink/8">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-3.5">
          <span className="relative z-10 shrink-0 rounded-full bg-white">
            <Marker event={event} />
          </span>
          <div className="min-w-0 flex-1 pt-1.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13.5px] text-ink/70">
              <span>
                <Summary event={event} fromStore={fromStore} />
              </span>
              <time
                dateTime={event.createdAt}
                title={formatDateTime(event.createdAt)}
                className="text-[12px] text-mist"
              >
                {formatRelative(event.createdAt)}
              </time>
            </div>
            {event.body && (
              <p className="mt-2 rounded-2xl rounded-tl-md bg-cloud/70 px-4 py-3 text-[14px] leading-relaxed whitespace-pre-line text-ink">
                {event.body}
              </p>
            )}
            {event.files.length > 0 && <Attachments files={event.files} />}
          </div>
        </li>
      ))}
    </ol>
  );
}
