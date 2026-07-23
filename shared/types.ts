// Payload delivered to POST /api/webhook by the simulator and seed data.
// How you model conversations internally is up to you.
export interface InboundMessage {
  id: string; // provider message id; may arrive more than once
  from: string; // stable customer id (phone number)
  customerName: string;
  text: string;
  timestamp: string; // ISO 8601
}

// A product from data/catalog.json.
export interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  price: number;
  inStock: boolean;
}


export interface Message {
  id: string;
 
  text: string;
  timestamp: string; 
  sender: 'customer' | 'agent' | "assistant";
}

export interface Conversation { 
  customerId: string;
  customerName: string;
  messages: Message[];
  updatedAt: string; 
  unreadCount: number;
}  

export interface ConversationSummary {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageTimestamp: string; 
  messageCount: number;
  unreadCount: number;
}