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
      <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
        <Link href="/account" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft size={14} /> Account
        </Link>
        <span>/</span>
        <Link href="/account" className="hover:text-white">
          Orders
        </Link>
        <span>/</span>
        <span className="font-mono text-white">{order.id}</span>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Order {order.id}
          </h1>
          <p className="text-sm text-white/50">
            Placed {formatDate(order.placedAt)} · sold by{" "}
            <Link
              href={`/seller/${order.seller}`}
              className="font-semibold text-amber-300 hover:underline"
            >
              {order.seller}
            </Link>{" "}
            ·{" "}
            <Link
              href={`/account/messages/new?to=${order.seller}&order=${order.id}`}
              className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:underline"
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
          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
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
                  className="text-base font-bold text-white hover:text-amber-300"
                >
                  {formatSkuTitle(sku)}
                </Link>
                <div className="text-xs text-white/50">
                  {sku.sport} · Factory Sealed · Qty {order.qty}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                  <Spec label="Item" value={formatUSDFull(order.price)} />
                  <Spec label="Shipping" value={order.shipping === 0 ? "Free" : formatUSDFull(order.shipping)} />
                  <Spec label="Tax" value={formatUSDFull(order.tax)} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold tracking-wider text-white/40 uppercase">Total</div>
                <div className="text-xl font-bold text-white">{formatUSDFull(order.total)}</div>
                <div className="mt-1 text-xs text-white/50">Card •••{order.cardLast4}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
            <h2 className="mb-4 text-base font-bold text-white">Order timeline</h2>
            <ol className="relative space-y-3">
              {order.events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {e.state === "done" ? (
                      <CheckCircle2 className="text-emerald-400" size={18} />
                    ) : e.state === "current" ? (
                      <div className="flex h-[18px] w-[18px] items-center justify-center">
                        <span className="absolute h-3 w-3 animate-ping rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative h-2.5 w-2.5 rounded-full bg-indigo-600" />
                      </div>
                    ) : (
                      <Circle className="text-white/30" size={18} />
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
                        e.state === "pending" ? "text-white/40" : "text-white"
                      }`}
                    >
                      {e.label}
                    </div>
                    {e.detail && (
                      <div className="mt-0.5 text-xs text-white/50">{e.detail}</div>
                    )}
                    {e.ts && (
                      <div className="mt-0.5 text-[11px] text-white/40">{e.ts}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {isDelivered && <ConfirmDeliveryButton orderId={order.id} />}
            {isCompleted && (
              <div className="mt-2 rounded-md border border-emerald-700/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
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
          <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <MapPin size={16} className="text-white/40" />
              Shipping to
            </div>
            <div className="text-sm">
              <div className="font-semibold text-white">{order.shipTo.name}</div>
              <div className="text-white/60">{order.shipTo.addr1}</div>
              <div className="text-white/60">
                {order.shipTo.city}, {order.shipTo.state} {order.shipTo.zip}
              </div>
            </div>
          </div>

          {order.tracking && (
            <div className="rounded-xl border border-white/10 bg-[#101012] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <Truck size={16} className="text-white/40" />
                Tracking
              </div>
              <div className="text-xs text-white/50">{order.carrier}</div>
              <div className="font-mono text-sm font-semibold text-white">{order.tracking}</div>
              {order.estimatedDelivery && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
                  <Clock size={12} className="text-white/40" />
                  Est. delivery {formatDate(order.estimatedDelivery)}
                </div>
              )}
              <a
                href="#"
                className="mt-3 block w-full rounded-md border border-white/15 bg-[#101012] px-3 py-2 text-center text-xs font-semibold text-white/80 hover:bg-white/[0.02]"
              >
                Track on {order.carrier} →
              </a>
            </div>
          )}

          {!order.tracking && order.estimatedDelivery && (
            <div className="rounded-xl border border-amber-700/40 bg-amber-500/10 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-100">
                <Package size={16} className="text-amber-300" />
                Awaiting shipment
              </div>
              <p className="text-xs text-amber-200">
                Seller has until <strong>{formatDate(order.placedAt, 2)}</strong> to ship. You&apos;ll
                get an email with tracking once they do.
              </p>
              <div className="mt-3 border-t border-amber-700/40 pt-2">
                <CancelOrderButton orderId={order.id} total={order.total} />
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white/80">
              <ShieldCheck size={14} className="text-emerald-400" />
              Buyer Protection
            </div>
            <p className="text-xs text-white/60">
              Your payment is held in escrow. If the box doesn&apos;t arrive sealed, open a dispute
              within 3 days of delivery for a full refund.
            </p>
            <Link
              href={`/account/disputes/new?order=${order.id}`}
              className="mt-2 inline-block text-xs font-semibold text-amber-300 hover:underline"
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
    Escrow: { bg: "bg-amber-500/10", text: "text-amber-300", label: "Awaiting ship" },
    Shipped: { bg: "bg-sky-500/10", text: "text-sky-300", label: "In transit" },
    Delivered: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Delivered · Confirm to release" },
    Completed: { bg: "bg-emerald-500/10", text: "text-emerald-300", label: "Completed" },
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
      <dt className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">{label}</dt>
      <dd className="text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function formatDate(d: string, addDays = 0) {
  const [y, m, day] = d.split(" ")[0].split("-").map(Number);
  const date = new Date(y, m - 1, day + addDays);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
