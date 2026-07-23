// Where you keep conversations and messages, so the webhook can save them and
// the API can read them back. Pick what fits: an in-memory variable, a JSON
// file, or SQLite. No database server needed; note your choice in the README.
//
// Export whatever functions your routes need.

import type {InboundMessage, Conversation, ConversationSummary, Message} from '../../shared/types';


const conversations: Map<string, Conversation> = new Map();
const seenMsgIds: Set<string> = new Set<string>();

function fetchOrCreateConversation(from: string, customerName: string): Conversation {
    const existing = conversations.get(from);
    
    if (existing) {
        return existing;
    }

    const newConversation: Conversation = {
        customerId: from,
        customerName,
        messages: [],
        updatedAt: new Date(0).toISOString(),
        unreadCount: 0,
    };

    conversations.set(from, newConversation);
    return newConversation;
}

export function addInBoundMessage(inbound: InboundMessage): 
{
    conversation: Conversation;
    isDuplicate: boolean;
} {
    const conversation = fetchOrCreateConversation(inbound.from, inbound.customerName);

    if(seenMsgIds.has(inbound.id)) {
        return {
            conversation,
            isDuplicate: true,
        };
    }

    seenMsgIds.add(inbound.id);

    conversation.messages.push({
        id: inbound.id,
        text: inbound.text,
        timestamp: inbound.timestamp,
        sender: 'customer',
    });

    conversation.updatedAt = inbound.timestamp;
    conversation.unreadCount += 1;

    return { conversation, isDuplicate: false };
}

export function listConversations(search?: string): ConversationSummary[] {
    let all = Array.from(conversations.values());

    if(search && search.trim()) {
        const query = search.trim().toLowerCase();
        all = all.filter((c) => c.customerName.toLowerCase().includes(query) ||
        c.messages.some((m) => m.text.toLowerCase().includes(query)));
    }

    return all 
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((c) => ({
            customerId: c.customerId,
            customerName: c.customerName,
            lastMessage: c.messages[c.messages.length - 1]?.text ?? "",
            lastMessageTimestamp: c.updatedAt,
            messageCount: c.messages.length,
            unreadCount: c.unreadCount,
        }));

    } 


export function getConversation(customerId: string): Conversation | undefined {
  return conversations.get(customerId);
}

export function markConversationRead(customerId: string): void {
  const conversation = conversations.get(customerId);
  if (conversation) {
    conversation.unreadCount = 0;
  }
}   

function addReply(customerId: string, text: string, sender: "agent" | "assistant"): Message | null {
  const conversation = conversations.get(customerId);
  if (!conversation) return null;

  const message: Message = {
    id: `${sender}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    text,
    timestamp: new Date().toISOString(),
    sender,
  };

  conversation.messages.push(message);
  conversation.updatedAt = message.timestamp;
  return message;
}

export function addAgentReply(customerId: string, text: string): Message | null {
  return addReply(customerId, text, "agent");
}

export function addAssistantReply(customerId: string, text: string): Message | null {
  return addReply(customerId, text, "assistant");
}