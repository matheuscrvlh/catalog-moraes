import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, PackageX, Receipt } from "lucide-react";
import { CellarMap } from "@/components/admin/dashboard/cellar-map";
import { ConversionGlass } from "@/components/admin/dashboard/conversion-glass";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { OrderHeatmap } from "@/components/admin/dashboard/order-heatmap";
import { OriginBubbles } from "@/components/admin/dashboard/origin-bubbles";
import { Activity, Ranking, RecentOrders } from "@/components/admin/dashboard/panels";
import { StyleRings } from "@/components/admin/dashboard/style-rings";
import { TrendChart } from "@/components/admin/dashboard/trend-chart";
import { WeekdayBars } from "@/components/admin/dashboard/weekday-bars";
import { Card, CardTitle, PanelSkeleton } from "@/components/admin/ui";
import { getDashboard, parsePeriod, PERIODS } from "@/lib/admin/dashboard";
import { landingFor } from "@/lib/admin/nav";
import { can, requireStaff } from "@/lib/auth/viewer";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

const chip =
  "inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium shadow-[0_1px_2px_rgba(23,25,43,0.05)] transition hover:text-navy";

export default function DashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

function today() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  })
    .format(new Date())
    .replace(/^\p{L}/u, (char) => char.toUpperCase());
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const viewer = await requireStaff();
  if (!can(viewer, "dashboard.view")) redirect(landingFor(viewer.permissions));

  const period = parsePeriod((await searchParams).periodo);
  const data = await getDashboard(period);
  const { kpis } = data;
  const confirmed = (data.status.confirmado ?? 0) + (data.status.entregue ?? 0);
  const canceled = data.status.cancelado ?? 0;
  const bottles = data.style_sales.reduce((sum, style) => sum + Number(style.bottles), 0);
  const bottlesPrev = data.style_sales.reduce((sum, style) => sum + Number(style.bottles_prev), 0);
  const note = `vs ${period} dias anteriores`;

  return (
    <div className="space-y-5">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-[28px] leading-tight font-bold tracking-tight">Relatório de vendas</h1>
          <p className="mt-1 text-sm text-mist">{today()}</p>
        </div>
        <nav className="flex rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(23,25,43,0.05)]" aria-label="Período">
          {PERIODS.map((value) => (
            <Link
              key={value}
              href={`/admin?periodo=${value}`}
              scroll={false}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                value === period ? "bg-navy text-white" : "text-mist hover:text-ink",
              )}
            >
              {value} dias
            </Link>
          ))}
        </nav>
      </header>

      {(kpis.out_of_stock > 0 || kpis.low_stock > 0 || kpis.pending_orders > 0) && (
        <div className="flex flex-wrap gap-2">
          {kpis.pending_orders > 0 && (
            <Link href="/admin/pedidos?status=novo" className={chip}>
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-red/70" />
                <span className="relative size-2 rounded-full bg-red" />
              </span>
              <Receipt className="size-4 text-red" /> {kpis.pending_orders} pedidos aguardando atendimento
            </Link>
          )}
          {kpis.low_stock > 0 && (
            <Link href="/admin/produtos?estoque=baixo" className={chip}>
              <AlertTriangle className="size-4 text-[#d99a1a]" /> {kpis.low_stock} variações com estoque baixo
            </Link>
          )}
          {kpis.out_of_stock > 0 && (
            <Link href="/admin/produtos?estoque=zerado" className={chip}>
              <PackageX className="size-4 text-mist" /> {kpis.out_of_stock} esgotadas
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <KpiCard
              primary
              label="Receita confirmada"
              value={kpis.revenue}
              previous={kpis.revenue_prev}
              format="currency"
              icon="revenue"
              note={note}
            />
            <KpiCard
              label="Pedidos recebidos"
              value={kpis.orders}
              previous={kpis.orders_prev}
              format="integer"
              icon="orders"
              note={note}
            />
            <KpiCard
              label="Garrafas vendidas"
              value={bottles}
              previous={bottlesPrev}
              format="integer"
              icon="bottles"
              note={note}
            />
            <KpiCard
              label="Visitas aos rótulos"
              value={kpis.views}
              previous={kpis.views_prev}
              format="compact"
              icon="views"
              note={note}
            />
          </div>
          <Card>
            <CardTitle title="Receita por dia da semana" description="Comparação com o período anterior" />
            <WeekdayBars data={data.weekday} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle title="Vendas por estilo" description="Garrafas vendidas no período" />
            <StyleRings data={data.style_sales} />
          </Card>
          <Card>
            <CardTitle title="Origem dos vinhos" description="Países dos rótulos vendidos" />
            <OriginBubbles data={data.origins} />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="flex flex-col">
          <TrendChart series={data.series} />
        </Card>
        <ConversionGlass
          conversion={kpis.orders ? confirmed / kpis.orders : 0}
          confirmed={confirmed}
          total={kpis.orders}
          canceled={canceled}
        />
      </div>

      <Card>
        <CardTitle
          title="Mapa do estoque"
          description={`Cada losango é um rótulo: a cor indica o estilo e o tamanho, o estoque. Ticket médio no período: ${formatPrice(confirmed ? kpis.revenue / confirmed : 0)}.`}
          action={
            <Link href="/admin/produtos" className="text-[13px] font-semibold text-royal hover:underline">
              Gerenciar estoque
            </Link>
          }
        />
        <CellarMap cellar={data.cellar} />
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardTitle title="Mais vendidos" description={`Garrafas nos últimos ${period} dias`} />
          <Ranking
            unit="un."
            items={data.top_sold.map((item) => ({
              id: item.id,
              name: item.name,
              image_path: item.image_path,
              value: item.quantity,
              detail: formatPrice(item.revenue),
              href: `/admin/produtos/${item.id}`,
            }))}
          />
        </Card>
        <Card>
          <CardTitle title="Quando os clientes compram" description="Pedidos por dia da semana e hora" />
          <OrderHeatmap heatmap={data.heatmap} />
        </Card>
        <Card>
          <CardTitle title="Atividade da equipe" />
          <Activity activity={data.activity} />
        </Card>
      </div>

      <Card>
        <CardTitle
          title="Pedidos recentes"
          action={
            <Link href="/admin/pedidos" className="text-[13px] font-semibold text-royal hover:underline">
              Ver todos
            </Link>
          }
        />
        <RecentOrders orders={data.recent_orders} />
      </Card>
    </div>
  );
}
