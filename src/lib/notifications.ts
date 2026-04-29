export type NotificationType =
  | "bid-placed"
  | "outbid"
  | "bid-accepted"
  | "order-shipped"
  | "order-delivered"
  | "payout-sent"
  | "price-drop"
  | "new-listing"
  | "new-message";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  ts: string;
  unread: boolean;
};

export const notifications: Notification[] = [
  {
    id: "n0",
    type: "new-message",
    title: "New message from boxbreaker_pro",
    body: "Looks like it's out for delivery this morning. Hope it gets there in time for your stream!",
    href: "/account/messages/c-1",
    ts: "2026-04-28 07:12",
    unread: true,
  },
  {
    id: "n1",
    type: "order-shipped",
    title: "Your order shipped",
    body: "2025-26 Panini Prizm Hobby Box · UPS · Out for delivery in Austin, TX",
    href: "/account/orders/WM-704112",
    ts: "2026-04-28 06:48",
    unread: true,
  },
  {
    id: "n2",
    type: "price-drop",
    title: "Price drop on your watchlist",
    body: "2025-26 Topps Cosmic Chrome Hobby Box dropped to $985 (was $1,025)",
    href: "/product/2025-26-topps-cosmic-chrome-basketball-hobby-box",
    ts: "2026-04-28 03:14",
    unread: true,
  },
  {
    id: "n3",
    type: "outbid",
    title: "You were outbid",
    body: "Someone outbid you on 2024-25 Panini Donruss Optic Hobby Box. Highest bid is now $220.",
    href: "/account",
    ts: "2026-04-27 22:10",
    unread: true,
  },
  {
    id: "n4",
    type: "payout-sent",
    title: "Payout sent — $2,104.68",
    body: "ACH initiated to Chase •••8421 · arrives by Apr 25",
    href: "/account/payouts",
    ts: "2026-04-24 08:00",
    unread: false,
  },
  {
    id: "n5",
    type: "order-delivered",
    title: "Box delivered",
    body: "2025 Topps Series 1 Baseball Hobby Box · confirm delivery to release funds",
    href: "/account/orders/WM-700891",
    ts: "2026-04-19 13:48",
    unread: false,
  },
  {
    id: "n6",
    type: "new-listing",
    title: "New listing — Bowman Chrome",
    body: "A new seller listed 2024-25 Bowman Chrome Hobby Box at $487 — undercutting the prior lowest by $8.",
    href: "/product/2024-bowman-chrome-baseball-hobby-box",
    ts: "2026-04-19 09:22",
    unread: false,
  },
  {
    id: "n7",
    type: "bid-accepted",
    title: "Bid accepted",
    body: "Your bid of $109 on Topps Series 1 Hobby Box was accepted by northwestcards.",
    href: "/account/orders/WM-700891",
    ts: "2026-04-15 12:00",
    unread: false,
  },
];
