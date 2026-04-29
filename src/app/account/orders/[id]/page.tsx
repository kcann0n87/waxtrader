import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Clock, MapPin, MessageCircle, Package, ShieldCheck, Truck } from "lucide-react";
import { findOrder } from "@/lib/orders";
import { skus } from "@/lib/data";
import { CancelOrderButton } from "./cancel-order";
import { ConfirmDeliveryButton } from "./confirm-delivery";
import { LeaveReview } from "./leave-review";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { formatSkuTitle, formatUSDFull } from "@/lib/utils";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = findOrder(id);
  if (!order) notFound();
  const sku = skus.find((s) => s.id === order.skuId)!;

  const isDelivered = order.status === "Delivered";
  const isCompleted = order.status === "Completed";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <Link href="/account" className="hover:text-slate-900">
          Orders
        </Link>
        <span>/</span>
        <span className="font-mono text-slate-900">{order.id}</span>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Order {order.id}
          </h1>
          <p className="text-sm text-slate-500">
            Placed {formatDate(order.placedAt)} · sold by{" "}
            <Link
              href={`/seller/${order.seller}`}
              className="font-semibold text-indigo-600 hover:underline"
            >
              {order.seller}
            </Link>{" "}
            ·{" "}
            <Link
              href={`/account/messages/new?to=${order.seller}&order=${order.id}`}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
            >
              <MessageCircle size={11} className="inline" />
              Message
            </Link>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-4">
              <Link
                href={`/product/${sku.slug}`}
                className="block h-20 w-16 shrink-0 overflow-hidden rounded text-[8px] font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${sku.gradient[0]}, ${sku.gradient[1]})` }}
              >
                <div className="flex h-full items-center justify-center">
                  {sku.brand.slice(0, 4).toUpperCase()}
                </div>
              </Link>
              <div className="flex-1">
                <Link
                  href={`/product/${sku.slug}`}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600"
                >
                  {formatSkuTitle(sku)}
                </Link>
                <div className="text-xs text-slate-500">
                  {sku.sport} · Factory Sealed · Qty {order.qty}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <Spec label="Item" value={formatUSDFull(order.price)} />
                  <Spec label="Shipping" value={order.shipping === 0 ? "Free" : formatUSDFull(order.shipping)} />
                  <Spec label="Tax" value={formatUSDFull(order.tax)} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total</div>
                <div className="text-xl font-bold text-slate-900">{formatUSDFull(order.total)}</div>
                <div className="mt-1 text-xs text-slate-500">Card •••{order.cardLast4}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-bold text-slate-900">Order timeline</h2>
            <ol className="relative space-y-3">
              {order.events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {e.state === "done" ? (
                      <CheckCircle2 className="text-emerald-600" size={18} />
                    ) : e.state === "current" ? (
                      <div className="flex h-[18px] w-[18px] items-center justify-center">
                        <span className="absolute h-3 w-3 animate-ping rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      </div>
                    ) : (
                      <Circle className="text-slate-300" size={18} />
                    )}
                    {i < order.events.length - 1 && (
                      <div
                        className={`mt-1 h-full w-px flex-1 ${
                          e.state === "done" ? "bg-emerald-200" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div
                      className={`text-sm font-semibold ${
                        e.state === "pending" ? "text-slate-400" : "text-slate-900"
                      }`}
                    >
                      {e.label}
                    </div>
                    {e.detail && (
                      <div className="mt-0.5 text-xs text-slate-500">{e.detail}</div>
                    )}
                    {e.ts && (
                      <div className="mt-0.5 text-[11px] text-slate-400">{e.ts}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {isDelivered && <ConfirmDeliveryButton orderId={order.id} />}
            {isCompleted && (
              <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <ShieldCheck size={14} className="mr-1 inline align-text-bottom" />
                You confirmed this order as sealed and arrived in good condition. Funds were released
                to {order.seller}.
              </div>
            )}
          </div>

          {order.trackingEvents && order.tracking && order.carrier && (
            <TrackingTimeline
              events={order.trackingEvents}
              carrier={order.carrier}
              tracking={order.tracking}
              estimatedDelivery={order.estimatedDelivery}
            />
          )}

          {isCompleted && <LeaveReview sellerUsername={order.seller} />}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <MapPin size={16} className="text-slate-400" />
              Shipping to
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">{order.shipTo.name}</div>
              <div className="text-slate-600">{order.shipTo.addr1}</div>
              <div className="text-slate-600">
                {order.shipTo.city}, {order.shipTo.state} {order.shipTo.zip}
              </div>
            </div>
          </div>

          {order.tracking && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Truck size={16} className="text-slate-400" />
                Tracking
              </div>
              <div className="text-xs text-slate-500">{order.carrier}</div>
              <div className="font-mono text-sm font-semibold text-slate-900">{order.tracking}</div>
              {order.estimatedDelivery && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <Clock size={12} className="text-slate-400" />
                  Est. delivery {formatDate(order.estimatedDelivery)}
                </div>
              )}
              <a
                href="#"
                className="mt-3 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Track on {order.carrier} →
              </a>
            </div>
          )}

          {!order.tracking && order.estimatedDelivery && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-900">
                <Package size={16} className="text-amber-700" />
                Awaiting shipment
              </div>
              <p className="text-xs text-amber-800">
                Seller has until <strong>{formatDate(order.placedAt, 2)}</strong> to ship. You&apos;ll
                get an email with tracking once they do.
              </p>
              <div className="mt-3 border-t border-amber-200 pt-2">
                <CancelOrderButton orderId={order.id} total={order.total} />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldCheck size={14} className="text-emerald-600" />
              Buyer Protection
            </div>
            <p className="text-xs text-slate-600">
              Your payment is held in escrow. If the box doesn&apos;t arrive sealed, open a dispute
              within 3 days of delivery for a full refund.
            </p>
            <Link
              href={`/account/disputes/new?order=${order.id}`}
              className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline"
            >
              Open a dispute →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: import("@/lib/orders").OrderStatus }) {
  const cfg = {
    Escrow: { bg: "bg-amber-50", text: "text-amber-700", label: "Awaiting ship" },
    Shipped: { bg: "bg-sky-50", text: "text-sky-700", label: "In transit" },
    Delivered: { bg: "bg-indigo-50", text: "text-indigo-700", label: "Delivered · Confirm to release" },
    Completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Completed" },
  }[status];
  return (
    <span className={`inline-flex rounded-md px-3 py-1.5 text-sm font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function formatDate(d: string, addDays = 0) {
  const [y, m, day] = d.split(" ")[0].split("-").map(Number);
  const date = new Date(y, m - 1, day + addDays);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
