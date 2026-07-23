import type { Conversation, ConversationSummary, Message } from "../../shared/types.js";

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchConversations(search?: string): Promise<ConversationSummary[]> {
  const url = search ? `${BASE}/conversations?search=${encodeURIComponent(search)}` : `${BASE}/conversations`;
  const res = await fetch(url);
  return handle<ConversationSummary[]>(res);
}

export async function fetchConversation(customerId: string): Promise<Conversation> {
  const res = await fetch(`${BASE}/conversations/${encodeURIComponent(customerId)}`);
  return handle<Conversation>(res);
}

export async function sendReply(customerId: string, text: string): Promise<Message> {
  const res = await fetch(`${BASE}/conversations/${encodeURIComponent(customerId)}/reply`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return handle<Message>(res);
}