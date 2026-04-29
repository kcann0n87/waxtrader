export type Message = {
  id: string;
  from: "buyer" | "seller" | "support";
  text: string;
  ts: string;
  systemEvent?: { kind: "shipped" | "delivered" | "released" | "dispute"; detail?: string };
};

export type Conversation = {
  id: string;
  with: string;
  withRole: "seller" | "buyer" | "support";
  withRating?: number;
  orderId?: string;
  skuId?: string;
  subject: string;
  lastMessageAt: string;
  unread: boolean;
  messages: Message[];
};

export const conversations: Conversation[] = [
  {
    id: "c-1",
    with: "boxbreaker_pro",
    withRole: "seller",
    withRating: 100,
    orderId: "WM-704112",
    skuId: "5",
    subject: "Order WM-704112 — Panini Prizm Hobby Box",
    lastMessageAt: "2026-04-28 07:12",
    unread: true,
    messages: [
      {
        id: "m1",
        from: "buyer",
        text: "Hey, I just placed the order. Any chance you can ship today? Hoping to break it on stream this weekend.",
        ts: "2026-04-22 18:45",
      },
      {
        id: "m2",
        from: "seller",
        text: "Yep, going to the post office in an hour. I'll send the tracking once it's in the system.",
        ts: "2026-04-22 19:20",
      },
      {
        id: "m3",
        from: "seller",
        text: "Just dropped it off. UPS Ground, label was created at 11:08. You should have an email with tracking.",
        ts: "2026-04-23 11:35",
        systemEvent: { kind: "shipped", detail: "UPS · 1Z999AA10123456784" },
      },
      {
        id: "m4",
        from: "buyer",
        text: "Awesome, appreciate it!",
        ts: "2026-04-23 12:01",
      },
      {
        id: "m5",
        from: "seller",
        text: "Looks like it's out for delivery this morning. Hope it gets there in time for your stream!",
        ts: "2026-04-28 07:12",
      },
    ],
  },
  {
    id: "c-2",
    with: "northwestcards",
    withRole: "seller",
    withRating: 99.6,
    orderId: "WM-700891",
    skuId: "10",
    subject: "Order WM-700891 — 2025 Topps Series 1 Hobby Box",
    lastMessageAt: "2026-04-19 14:02",
    unread: false,
    messages: [
      {
        id: "m1",
        from: "buyer",
        text: "Quick question — is this from a fresh case or a single?",
        ts: "2026-04-15 12:14",
      },
      {
        id: "m2",
        from: "seller",
        text: "Single from a hobby case I broke last week. All boxes from the same case, factory sealed.",
        ts: "2026-04-15 12:32",
      },
      {
        id: "m3",
        from: "buyer",
        text: "Perfect. Going for it.",
        ts: "2026-04-15 12:35",
      },
      {
        id: "m4",
        from: "seller",
        text: "Shipped! USPS Priority, should be there Monday.",
        ts: "2026-04-16 15:25",
        systemEvent: { kind: "shipped", detail: "USPS · 9400111202555842833719" },
      },
      {
        id: "m5",
        from: "buyer",
        text: "Got it today, looks great. Will confirm delivery in the app.",
        ts: "2026-04-19 14:02",
      },
    ],
  },
  {
    id: "c-3",
    with: "augies_collectibles",
    withRole: "seller",
    withRating: 100,
    orderId: "WM-695420",
    skuId: "4",
    subject: "Order WM-695420 — 2024 Topps Chrome Hobby Box",
    lastMessageAt: "2026-04-08 09:14",
    unread: false,
    messages: [
      {
        id: "m1",
        from: "buyer",
        text: "Box arrived sealed and in great shape. Confirmed in the app — thanks!",
        ts: "2026-04-08 09:14",
        systemEvent: { kind: "released", detail: "$179.40 released" },
      },
      {
        id: "m2",
        from: "seller",
        text: "Appreciate the smooth transaction. Hit you up next time we have something good.",
        ts: "2026-04-08 10:30",
      },
    ],
  },
  {
    id: "c-4",
    with: "WaxMarket Support",
    withRole: "support",
    subject: "Question about seller payouts",
    lastMessageAt: "2026-04-25 11:42",
    unread: false,
    messages: [
      {
        id: "m1",
        from: "buyer",
        text: "Hi, when do I get paid for the box I just sold? Order WM-712455.",
        ts: "2026-04-25 09:15",
      },
      {
        id: "m2",
        from: "support",
        text: "Hey! That order was delivered and confirmed yesterday, so the funds were released to your pending balance. They'll be included in your next weekly payout — Friday May 1.",
        ts: "2026-04-25 11:42",
      },
    ],
  },
];

export function findConversation(id: string) {
  return conversations.find((c) => c.id === id);
}
