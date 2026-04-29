"use client";

import { useEffect, useState } from "react";
import { conversations as seedConversations, type Conversation, type Message } from "./messages";

const KEY = "waxmarket:messages";
const SEED_VERSION = 2;
const SEED_KEY = "waxmarket:messages-seed";

function read(): Conversation[] {
  if (typeof window === "undefined") return seedConversations;
  try {
    const seedV = parseInt(window.localStorage.getItem(SEED_KEY) || "0", 10);
    if (seedV < SEED_VERSION) {
      window.localStorage.setItem(KEY, JSON.stringify(seedConversations));
      window.localStorage.setItem(SEED_KEY, String(SEED_VERSION));
      return seedConversations;
    }
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : seedConversations;
  } catch {
    return seedConversations;
  }
}

function write(items: Conversation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("waxmarket:messages-change"));
}

export function useMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConversations(read());
    setHydrated(true);
    const onChange = () => setConversations(read());
    window.addEventListener("waxmarket:messages-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("waxmarket:messages-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const sendReply = (conversationId: string, text: string) => {
    const current = read();
    const now = nowStamp();
    const next = current.map((c) => {
      if (c.id !== conversationId) return c;
      const newMsg: Message = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: "buyer",
        text,
        ts: now,
      };
      return {
        ...c,
        messages: [...c.messages, newMsg],
        lastMessageAt: now,
        unread: false,
      };
    });
    setConversations(next);
    write(next);
  };

  const startConversation = (params: {
    with: string;
    withRole: "seller" | "buyer" | "support";
    withRating?: number;
    orderId?: string;
    skuId?: string;
    subject: string;
    initialMessage: string;
  }) => {
    const current = read();
    const existing = current.find(
      (c) =>
        c.with === params.with &&
        (params.orderId ? c.orderId === params.orderId : !c.orderId),
    );
    if (existing) {
      const now = nowStamp();
      const newMsg: Message = {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: "buyer",
        text: params.initialMessage,
        ts: now,
      };
      const next = current.map((c) =>
        c.id === existing.id
          ? { ...c, messages: [...c.messages, newMsg], lastMessageAt: now, unread: false }
          : c,
      );
      setConversations(next);
      write(next);
      return existing.id;
    }
    const id = `c-${Date.now()}`;
    const now = nowStamp();
    const newConvo: Conversation = {
      id,
      with: params.with,
      withRole: params.withRole,
      withRating: params.withRating,
      orderId: params.orderId,
      skuId: params.skuId,
      subject: params.subject,
      lastMessageAt: now,
      unread: false,
      messages: [
        {
          id: `m-${Date.now()}`,
          from: "buyer",
          text: params.initialMessage,
          ts: now,
        },
      ],
    };
    const next = [...current, newConvo];
    setConversations(next);
    write(next);
    return id;
  };

  const markRead = (conversationId: string) => {
    const current = read();
    const next = current.map((c) => (c.id === conversationId ? { ...c, unread: false } : c));
    setConversations(next);
    write(next);
  };

  return {
    conversations,
    hydrated,
    sendReply,
    startConversation,
    markRead,
    findConversation: (id: string) => conversations.find((c) => c.id === id),
    findConversationWith: (username: string, orderId?: string) =>
      conversations.find(
        (c) => c.with === username && (orderId ? c.orderId === orderId : !c.orderId),
      ),
    unreadCount: conversations.filter((c) => c.unread).length,
  };
}

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
