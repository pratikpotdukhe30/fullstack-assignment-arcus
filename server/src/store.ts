// Data store, backed by SQLite (Node's built-in node:sqlite module -- no
// npm install needed, ships with Node 22.5+). Same exported functions as the
// in-memory version, so nothing calling this file had to change.

import type {InboundMessage, Conversation, ConversationSummary, Message} from '../../shared/types';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(new URL("../../data/conversations.db", import.meta.url));

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    customerId TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    unreadCount INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    customerId TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    sender TEXT NOT NULL
  );
`);

function fetchOrCreateConversation(from: string, customerName: string): void {
    const existing = db.prepare('SELECT customerId FROM conversations WHERE customerId = ?').get(from);
    if (!existing) {
        db.prepare('INSERT INTO conversations (customerId, customerName, updatedAt, unreadCount) VALUES (?, ?, ?, 0)')
          .run(from, customerName, new Date(0).toISOString());
    }
}

function loadConversation(customerId: string): Conversation | undefined {
    const row = db.prepare('SELECT * FROM conversations WHERE customerId = ?').get(customerId) as any;
    if (!row) return undefined;

    const messages = db.prepare('SELECT id, text, timestamp, sender FROM messages WHERE customerId = ? ORDER BY rowid ASC')
        .all(customerId) as unknown as Message[];

    return {
        customerId: row.customerId,
        customerName: row.customerName,
        updatedAt: row.updatedAt,
        unreadCount: Number(row.unreadCount),
        messages,
    };
}

export function addInBoundMessage(inbound: InboundMessage): 
{
    conversation: Conversation;
    isDuplicate: boolean;
} {
    const existingMsg = db.prepare('SELECT id FROM messages WHERE id = ?').get(inbound.id);
    if (existingMsg) {
        const existing = loadConversation(inbound.from);
        return {
            conversation: existing ?? {
                customerId: inbound.from,
                customerName: inbound.customerName,
                messages: [],
                updatedAt: new Date(0).toISOString(),
                unreadCount: 0,
            },
            isDuplicate: true,
        };
    }

    fetchOrCreateConversation(inbound.from, inbound.customerName);

    db.prepare('INSERT INTO messages (id, customerId, text, timestamp, sender) VALUES (?, ?, ?, ?, ?)')
      .run(inbound.id, inbound.from, inbound.text, inbound.timestamp, 'customer');

    db.prepare('UPDATE conversations SET updatedAt = ?, unreadCount = unreadCount + 1 WHERE customerId = ?')
      .run(inbound.timestamp, inbound.from);

    return { conversation: loadConversation(inbound.from)!, isDuplicate: false };
}

export function listConversations(search?: string): ConversationSummary[] {
    let rows: any[];

    if (search && search.trim()) {
        const q = `%${search.trim().toLowerCase()}%`;
        rows = db.prepare(`
            SELECT DISTINCT c.* FROM conversations c
            LEFT JOIN messages m ON m.customerId = c.customerId
            WHERE lower(c.customerName) LIKE ? OR lower(m.text) LIKE ?
        `).all(q, q) as any[];
    } else {
        rows = db.prepare('SELECT * FROM conversations').all() as any[];
    }

    return rows
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .map((row) => {
            const last = db.prepare('SELECT text FROM messages WHERE customerId = ? ORDER BY rowid DESC LIMIT 1').get(row.customerId) as any;
            const count = db.prepare('SELECT COUNT(*) as c FROM messages WHERE customerId = ?').get(row.customerId) as any;
            return {
                customerId: row.customerId,
                customerName: row.customerName,
                lastMessage: last?.text ?? "",
                lastMessageTimestamp: row.updatedAt,
                messageCount: Number(count.c),
                unreadCount: Number(row.unreadCount),
            };
        });
}

export function getConversation(customerId: string): Conversation | undefined {
  return loadConversation(customerId);
}

export function markConversationRead(customerId: string): void {
  db.prepare('UPDATE conversations SET unreadCount = 0 WHERE customerId = ?').run(customerId);
}

function addReply(customerId: string, text: string, sender: "agent" | "assistant"): Message | null {
  const conv = db.prepare('SELECT customerId FROM conversations WHERE customerId = ?').get(customerId);
  if (!conv) return null;

  const id = `${sender}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const timestamp = new Date().toISOString();

  db.prepare('INSERT INTO messages (id, customerId, text, timestamp, sender) VALUES (?, ?, ?, ?, ?)')
    .run(id, customerId, text, timestamp, sender);
  db.prepare('UPDATE conversations SET updatedAt = ? WHERE customerId = ?').run(timestamp, customerId);

  return { id, text, timestamp, sender };
}

export function addAgentReply(customerId: string, text: string): Message | null {
  return addReply(customerId, text, "agent");
}

export function addAssistantReply(customerId: string, text: string): Message | null {
  return addReply(customerId, text, "assistant");
}