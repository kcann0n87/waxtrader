export type MyBid = {
  id: string;
  skuId: string;
  price: number;
  status: "Active" | "Won" | "Outbid" | "Expired" | "Canceled";
  expiresAt: string;
  placedAt: string;
};

export const myBids: MyBid[] = [
  {
    id: "B-1042",
    skuId: "2",
    price: 705,
    status: "Active",
    expiresAt: "2026-05-04",
    placedAt: "2026-04-21",
  },
  {
    id: "B-1019",
    skuId: "11",
    price: 1310,
    status: "Active",
    expiresAt: "2026-05-11",
    placedAt: "2026-04-12",
  },
  {
    id: "B-998",
    skuId: "9",
    price: 215,
    status: "Outbid",
    expiresAt: "2026-04-30",
    placedAt: "2026-04-08",
  },
];

export function findBid(id: string) {
  return myBids.find((b) => b.id === id);
}
