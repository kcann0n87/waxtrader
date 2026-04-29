import { skus } from "./data";

export type OrderStatus = "Escrow" | "Shipped" | "Delivered" | "Completed";
export type ListingStatus = "Active" | "Sold" | "Expired";

export type TimelineEvent = {
  ts: string;
  label: string;
  detail?: string;
  state: "done" | "current" | "pending";
};

export type TrackingEvent = {
  ts: string;
  status: string;
  location?: string;
  isLatest?: boolean;
  isDelivered?: boolean;
};

export type Order = {
  id: string;
  skuId: string;
  qty: number;
  price: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  cardLast4: string;
  seller: string;
  shipTo: { name: string; addr1: string; city: string; state: string; zip: string };
  carrier?: string;
  tracking?: string;
  estimatedDelivery?: string;
  events: TimelineEvent[];
  trackingEvents?: TrackingEvent[];
};

export type Listing = {
  id: string;
  skuId: string;
  qty: number;
  ask: number;
  shipping: number | "calc";
  status: ListingStatus;
  listedAt: string;
  views: number;
  watching: number;
  soldOrder?: { id: string; soldAt: string; buyer: string; needsShipBy: string; carrier?: string; tracking?: string };
};

const sku = (id: string) => skus.find((s) => s.id === id)!;

export const orders: Order[] = [
  {
    id: "WM-706373",
    skuId: "1",
    qty: 1,
    price: 990,
    shipping: 0,
    tax: 69.3,
    total: 1059.3,
    status: "Escrow",
    placedAt: "2026-04-26",
    cardLast4: "4242",
    seller: "sealed_only",
    shipTo: { name: "Kyle Cannon", addr1: "123 Main St", city: "Austin", state: "TX", zip: "78701" },
    estimatedDelivery: "2026-05-02",
    events: [
      { ts: "2026-04-26 14:22", label: "Order placed", detail: "Card •••4242 charged $1,059.30", state: "done" },
      { ts: "2026-04-26 14:22", label: "Payment held in escrow", detail: "Released to seller after delivery confirmation", state: "done" },
      { ts: "2026-04-27 09:15", label: "Awaiting seller shipment", detail: "Seller has until Apr 28 to ship", state: "current" },
      { ts: "", label: "Shipped", state: "pending" },
      { ts: "", label: "Delivered", state: "pending" },
      { ts: "", label: "Funds released to seller", state: "pending" },
    ],
  },
  {
    id: "WM-704112",
    skuId: "5",
    qty: 1,
    price: 580,
    shipping: 0,
    tax: 40.6,
    total: 620.6,
    status: "Shipped",
    placedAt: "2026-04-22",
    cardLast4: "4242",
    seller: "boxbreaker_pro",
    shipTo: { name: "Kyle Cannon", addr1: "123 Main St", city: "Austin", state: "TX", zip: "78701" },
    carrier: "UPS",
    tracking: "1Z999AA10123456784",
    estimatedDelivery: "2026-04-28",
    events: [
      { ts: "2026-04-22 18:40", label: "Order placed", detail: "Card •••4242 charged $620.60", state: "done" },
      { ts: "2026-04-22 18:40", label: "Payment held in escrow", state: "done" },
      { ts: "2026-04-23 11:08", label: "Shipped via UPS", detail: "1Z999AA10123456784", state: "done" },
      { ts: "2026-04-28 06:48", label: "Out for delivery — Austin, TX", state: "current" },
      { ts: "", label: "Delivered", state: "pending" },
    ],
    trackingEvents: [
      { ts: "2026-04-28 06:48", status: "Out for delivery", location: "Austin, TX", isLatest: true },
      { ts: "2026-04-27 14:22", status: "Departed UPS facility", location: "San Antonio, TX" },
      { ts: "2026-04-27 02:18", status: "Arrived at UPS facility", location: "San Antonio, TX" },
      { ts: "2026-04-25 09:14", status: "Departed UPS facility", location: "El Paso, TX" },
      { ts: "2026-04-25 04:30", status: "Arrived at UPS facility", location: "El Paso, TX" },
      { ts: "2026-04-23 22:48", status: "Departed UPS facility", location: "Phoenix, AZ" },
      { ts: "2026-04-23 14:22", status: "Pickup scan", location: "Phoenix, AZ" },
      { ts: "2026-04-23 11:08", status: "Shipping label created", location: "Phoenix, AZ" },
    ],
  },
  {
    id: "WM-700891",
    skuId: "10",
    qty: 1,
    price: 110,
    shipping: 8,
    tax: 8.26,
    total: 126.26,
    status: "Delivered",
    placedAt: "2026-04-15",
    cardLast4: "4242",
    seller: "northwestcards",
    shipTo: { name: "Kyle Cannon", addr1: "123 Main St", city: "Austin", state: "TX", zip: "78701" },
    carrier: "USPS",
    tracking: "9400111202555842833719",
    events: [
      { ts: "2026-04-15 12:00", label: "Order placed", detail: "Card •••4242 charged $126.26", state: "done" },
      { ts: "2026-04-15 12:00", label: "Payment held in escrow", state: "done" },
      { ts: "2026-04-16 15:22", label: "Shipped via USPS", detail: "9400111202555842833719", state: "done" },
      { ts: "2026-04-19 13:48", label: "Delivered", detail: "Left at front door · Austin, TX", state: "current" },
      { ts: "", label: "Confirm delivery to release funds", state: "pending" },
    ],
    trackingEvents: [
      { ts: "2026-04-19 13:48", status: "Delivered — Left at front door", location: "Austin, TX 78701", isLatest: true, isDelivered: true },
      { ts: "2026-04-19 07:30", status: "Out for delivery", location: "Austin, TX" },
      { ts: "2026-04-18 19:50", status: "Arrived at USPS facility", location: "Austin, TX" },
      { ts: "2026-04-18 02:14", status: "Departed USPS facility", location: "Denver, CO" },
      { ts: "2026-04-17 04:42", status: "Arrived at USPS facility", location: "Salt Lake City, UT" },
      { ts: "2026-04-16 18:30", status: "Departed USPS facility", location: "Portland, OR" },
      { ts: "2026-04-16 15:22", status: "Acceptance", location: "Portland, OR" },
      { ts: "2026-04-16 09:14", status: "Shipping label created", location: "Portland, OR" },
    ],
  },
  {
    id: "WM-695420",
    skuId: "4",
    qty: 1,
    price: 195,
    shipping: 0,
    tax: 13.65,
    total: 208.65,
    status: "Completed",
    placedAt: "2026-04-02",
    cardLast4: "4242",
    seller: "augies_collectibles",
    shipTo: { name: "Kyle Cannon", addr1: "123 Main St", city: "Austin", state: "TX", zip: "78701" },
    carrier: "FedEx",
    tracking: "612345678901234",
    events: [
      { ts: "2026-04-02 09:14", label: "Order placed", state: "done" },
      { ts: "2026-04-02 09:14", label: "Payment held in escrow", state: "done" },
      { ts: "2026-04-03 14:30", label: "Shipped via FedEx", detail: "612345678901234", state: "done" },
      { ts: "2026-04-06 11:20", label: "Delivered", state: "done" },
      { ts: "2026-04-08 09:00", label: "Box confirmed sealed", detail: "Buyer confirmed", state: "done" },
      { ts: "2026-04-08 09:00", label: "Funds released to seller", detail: "$179.40 paid to augies_collectibles", state: "done" },
    ],
    trackingEvents: [
      { ts: "2026-04-06 11:20", status: "Delivered — Signed for by K. CANNON", location: "Austin, TX 78701", isLatest: true, isDelivered: true },
      { ts: "2026-04-06 06:14", status: "Out for delivery", location: "Austin, TX" },
      { ts: "2026-04-05 22:18", status: "At local FedEx facility", location: "Austin, TX" },
      { ts: "2026-04-04 14:22", status: "Departed FedEx hub", location: "Memphis, TN" },
      { ts: "2026-04-04 06:30", status: "Arrived at FedEx hub", location: "Memphis, TN" },
      { ts: "2026-04-03 23:48", status: "Departed FedEx facility", location: "Phoenix, AZ" },
      { ts: "2026-04-03 18:00", status: "Picked up", location: "Phoenix, AZ" },
      { ts: "2026-04-03 14:30", status: "Shipping label created", location: "Phoenix, AZ" },
    ],
  },
];

export const myListings: Listing[] = [
  {
    id: "L-2208",
    skuId: "7",
    qty: 2,
    ask: 489,
    shipping: 0,
    status: "Active",
    listedAt: "2026-04-21",
    views: 142,
    watching: 8,
  },
  {
    id: "L-2150",
    skuId: "10",
    qty: 1,
    ask: 109,
    shipping: 0,
    status: "Sold",
    listedAt: "2026-04-12",
    views: 89,
    watching: 4,
    soldOrder: {
      id: "WM-711921",
      soldAt: "2026-04-25",
      buyer: "buyer_3829",
      needsShipBy: "2026-04-27",
    },
  },
  {
    id: "L-2099",
    skuId: "12",
    qty: 3,
    ask: 380,
    shipping: 0,
    status: "Active",
    listedAt: "2026-04-08",
    views: 312,
    watching: 19,
  },
  {
    id: "L-1988",
    skuId: "3",
    qty: 1,
    ask: 410,
    shipping: 0,
    status: "Sold",
    listedAt: "2026-03-28",
    views: 67,
    watching: 2,
    soldOrder: {
      id: "WM-709842",
      soldAt: "2026-04-22",
      buyer: "buyer_1124",
      needsShipBy: "2026-04-24",
      carrier: "UPS",
      tracking: "1Z999AA10987654321",
    },
  },
];

export function findOrder(id: string) {
  return orders.find((o) => o.id === id);
}

export function findListing(id: string) {
  return myListings.find((l) => l.id === id);
}

export { sku };
