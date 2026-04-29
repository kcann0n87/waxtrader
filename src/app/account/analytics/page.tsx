import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  DollarSign,
  Eye,
  MapPin,
  Package,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { SalesChart } from "@/components/analytics-chart";
import { skus } from "@/lib/data";
import { formatSkuTitle, formatUSD, formatUSDFull } from "@/lib/utils";

const TODAY = new Date(2026, 3, 28);

function buildSalesByDay() {
  const days = 30;
  const data: { date: string; revenue: number; orders: number }[] = [];
  let s = 12345;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    const orders = 1 + Math.floor(rand() * 5);
    const revenue = orders * (180 + Math.floor(rand() * 600));
    data.push({
      date: d.toISOString().slice(0, 10),
      orders,
      revenue,
    });
  }
  return data;
}

const topSelling = [
  { skuId: "1", units: 8, revenue: 7920, conversionRate: 4.2 },
  { skuId: "2", units: 5, revenue: 3600, conversionRate: 3.8 },
  { skuId: "10", units: 12, revenue: 1320, conversionRate: 6.1 },
  { skuId: "7", units: 4, revenue: 1980, conversionRate: 2.9 },
  { skuId: "3", units: 3, revenue: 1230, conversionRate: 2.4 },
];

const topStates = [
  { state: "California", orders: 23, revenue: 8420 },
  { state: "Texas", orders: 18, revenue: 6155 },
  { state: "New York", orders: 14, revenue: 5210 },
  { state: "Florida", orders: 11, revenue: 3890 },
  { state: "Illinois", orders: 9, revenue: 3120 },
];

export default function AnalyticsPage() {
  const data = buildSalesByDay();
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const last7 = data.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const prev7 = data.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
  const wow = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <span className="text-slate-900">Analytics</span>
      </div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Seller analytics</h1>
          <p className="text-sm text-slate-500">Last 30 days · across all your listings</p>
        </div>
        <select className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
          <option>Year to date</option>
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI
          icon={<DollarSign size={16} />}
          label="Revenue"
          value={formatUSD(totalRevenue)}
          delta={wow}
          accent="emerald"
        />
        <KPI
          icon={<Package size={16} />}
          label="Orders"
          value={String(totalOrders)}
          delta={11.3}
        />
        <KPI
          icon={<TrendingUp size={16} />}
          label="Avg order value"
          value={formatUSD(avgOrderValue)}
          delta={-2.1}
        />
        <KPI
          icon={<Eye size={16} />}
          label="Listing views"
          value="1,842"
          delta={18.4}
        />
      </div>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Daily revenue</h2>
            <p className="text-xs text-slate-500">Total: {formatUSDFull(totalRevenue)} across {totalOrders} orders</p>
          </div>
        </div>
        <SalesChart data={data} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top sellers</h2>
              <p className="text-xs text-slate-500">By revenue, last 30d</p>
            </div>
          </div>
          <ul className="space-y-2">
            {topSelling.map((row, i) => {
              const sku = skus.find((s) => s.id === row.skuId)!;
              return (
                <li key={row.skuId} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {i + 1}
                  </div>
                  <ProductImage sku={sku} size="sm" className="aspect-[4/5] w-9 shrink-0 rounded" showText={false} />
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${sku.slug}`} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-indigo-600">
                      {formatSkuTitle(sku)}
                    </Link>
                    <div className="text-xs text-slate-500">
                      {row.units} sold · {row.conversionRate}% conversion
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-slate-900">{formatUSD(row.revenue)}</div>
                    <div className="text-[10px] text-slate-400">revenue</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
                <MapPin size={14} className="text-slate-400" />
                Top states
              </h2>
              <p className="text-xs text-slate-500">Where your buyers ship to</p>
            </div>
          </div>
          <ul className="space-y-3">
            {topStates.map((row) => {
              const max = topStates[0].orders;
              const pct = (row.orders / max) * 100;
              return (
                <li key={row.state}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700">{row.state}</span>
                    <span className="text-slate-500">
                      {row.orders} orders · <span className="font-semibold text-slate-900">{formatUSD(row.revenue)}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
              <Users size={14} className="text-slate-400" />
              Buyer breakdown
            </h2>
            <p className="text-xs text-slate-500">Repeat vs new customers</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
          <BuyerStat label="New buyers" value="42" sub="of 70 orders" pct={60} tone="indigo" />
          <BuyerStat label="Returning" value="28" sub="40% loyal" pct={40} tone="emerald" />
          <BuyerStat label="Top buyer" value="ripper2024" sub="6 orders, $2,240" pct={null} tone="amber" />
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <ArrowUpRight size={16} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-emerald-900">Tips to grow</h3>
            <ul className="mt-1.5 space-y-1 text-xs text-emerald-800">
              <li>· Your conversion is highest on Topps Series 1 — consider listing the Update Series too.</li>
              <li>· 60% of your buyers are first-timers — a thank-you note in the package boosts return rate by ~22% on similar sellers.</li>
              <li>· Avg shipping speed score is 4.2/5 — same-day shipping pushes you to 4.8+ and unlocks Verified Seller badge.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function KPI({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  accent?: "emerald";
}) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span className={accent === "emerald" ? "text-emerald-600" : "text-slate-400"}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      {delta !== undefined && (
        <div
          className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${
            positive ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {positive ? "+" : ""}
          {delta.toFixed(1)}% vs prior 7d
        </div>
      )}
    </div>
  );
}

function BuyerStat({
  label,
  value,
  sub,
  pct,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  pct: number | null;
  tone: "indigo" | "emerald" | "amber";
}) {
  const toneCfg = {
    indigo: "text-indigo-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
  }[tone];
  return (
    <div className="px-4 py-3">
      <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{label}</div>
      <div className={`mt-1 text-xl font-bold ${toneCfg}`}>{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
      {pct !== null && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full ${
              tone === "indigo" ? "bg-indigo-500" : tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
