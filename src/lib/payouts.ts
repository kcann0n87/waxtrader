export type OrderLifecycleStatus =
  | "Charged"
  | "InEscrow"
  | "Shipped"
  | "Delivered"
  | "Released"
  | "PaidOut";

export type PayoutStatus = "Pending" | "InTransit" | "Paid" | "Failed";

export type Payout = {
  id: string;
  amount: number;
  status: PayoutStatus;
  initiated: string;
  arrivesBy: string;
  bankLast4: string;
  ordersIncluded: string[];
};

export type PendingItem = {
  orderId: string;
  skuId: string;
  grossSale: number;
  fee: number;
  processing: number;
  netToSeller: number;
  status: OrderLifecycleStatus;
  releaseEta?: string;
};

export const seller = {
  bankName: "Chase",
  bankLast4: "8421",
  payoutSchedule: "Weekly — every Friday for sales released that week",
  nextPayoutDate: "Fri, May 1",
  taxStatus: "Verified · 1099-K eligible",
  verified: true,
};

export const pending: PendingItem[] = [
  {
    orderId: "WM-712455",
    skuId: "10",
    grossSale: 109,
    fee: 8.72,
    processing: 3.46,
    netToSeller: 96.82,
    status: "Released",
    releaseEta: "In Friday's payout",
  },
  {
    orderId: "WM-711921",
    skuId: "7",
    grossSale: 489,
    fee: 39.12,
    processing: 14.48,
    netToSeller: 435.4,
    status: "Delivered",
    releaseEta: "Released today",
  },
  {
    orderId: "WM-710330",
    skuId: "12",
    grossSale: 380,
    fee: 30.4,
    processing: 11.32,
    netToSeller: 338.28,
    status: "Shipped",
    releaseEta: "Pending delivery",
  },
  {
    orderId: "WM-709842",
    skuId: "3",
    grossSale: 410,
    fee: 32.8,
    processing: 12.19,
    netToSeller: 365.01,
    status: "InEscrow",
    releaseEta: "Awaiting ship",
  },
];

export const payoutHistory: Payout[] = [
  {
    id: "PO-104221",
    amount: 2104.68,
    status: "Paid",
    initiated: "2026-04-24",
    arrivesBy: "2026-04-25",
    bankLast4: "8421",
    ordersIncluded: ["WM-708112", "WM-707981", "WM-707440", "WM-706891", "WM-706512"],
  },
  {
    id: "PO-103998",
    amount: 1842.36,
    status: "Paid",
    initiated: "2026-04-17",
    arrivesBy: "2026-04-18",
    bankLast4: "8421",
    ordersIncluded: ["WM-704988", "WM-704812", "WM-704210", "WM-704119"],
  },
  {
    id: "PO-103745",
    amount: 945.5,
    status: "Paid",
    initiated: "2026-04-10",
    arrivesBy: "2026-04-11",
    bankLast4: "8421",
    ordersIncluded: ["WM-702455", "WM-702102", "WM-701889"],
  },
  {
    id: "PO-103412",
    amount: 1356.91,
    status: "Paid",
    initiated: "2026-04-03",
    arrivesBy: "2026-04-04",
    bankLast4: "8421",
    ordersIncluded: ["WM-700112", "WM-699988", "WM-699540", "WM-699201"],
  },
];

export function lifecycleLabel(s: OrderLifecycleStatus): string {
  return {
    Charged: "Charged",
    InEscrow: "Escrow",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Released: "Released",
    PaidOut: "Paid out",
  }[s];
}
