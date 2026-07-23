import type { InboundMessage, Product } from "../../shared/types.js";

import {readFileSync} from "node:fs";

// Decides whether to auto-reply, and what to say. No real AI here — keep it to a
// few simple, deterministic rules (see data/catalog.json for products). Return
// the reply text, or null to leave the message for a human. Two or three rules
// is enough; don't over-invest.

const catalog: Product[] = JSON.parse(readFileSync(new URL("../../data/catalog.json", import.meta.url), "utf-8"));

function findMentionedProduct(text: string): Product | undefined {
  const lowerText = text.toLowerCase();
  return catalog.find(product => lowerText.includes(product.name.toLowerCase()));
}

export function assistantReply(message: InboundMessage): string | null {
  // TODO: implement
  const product = findMentionedProduct(message.text);
  if (product) {
    return product.inStock
      ? `Yes! The ${product.name} is in stock ($${product.price.toFixed(2)}).`
      : `Sorry, the ${product.name} is currently out of stock.`;
    }
  

  if(message.text.toLowerCase().includes("order")) {
    return "Thanks for reaching out about your order -- a team member will look into this and get back to you shortly.";
  }
  
  const greetings = ["hi", "hello", "hey"];
  if (greetings.some(g => message.text.toLowerCase().startsWith(g))) {
    return "Hi there! Thanks for reaching out -- how can we help today?";
  }
  
  return null;
}
