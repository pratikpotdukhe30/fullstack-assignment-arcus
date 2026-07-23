import express from "express";
import type { InboundMessage } from "../../shared/types.js";
import { addInBoundMessage, listConversations, getConversation, addAgentReply, addAssistantReply, markConversationRead } from "./store.js";
import { assistantReply } from "./assistant.js";
const app = express();
app.use(express.json());

// Receives inbound messages from the simulator (and, in real life, a provider).
// TODO: validate the payload, store it in the right conversation, decide how to
// handle duplicate ids (see README), and optionally call the assistant.
app.post("/api/webhook", (req, res) => {
  const message = req.body as InboundMessage;
  if(!message?.id || !message.from || !message.customerName || !message.text) {
    res.status(400).json({ ok: false, error: "missing required fields" });
    return;
  }

  const { conversation, isDuplicate } = addInBoundMessage(message);

  if(!isDuplicate) {
    const replyText = assistantReply(message);
    if(replyText) {
      addAssistantReply(message.from, replyText);
    }
  } 

  res.status(200).json({ ok: true, duplicate: isDuplicate, customerId: conversation.customerId, customerName: conversation.customerName, messageCount: conversation.messages.length });

 
});

// TODO: add the endpoints the UI needs, e.g.
//   GET  /api/conversations            list (optional ?search=)
//   GET  /api/conversations/:id        one thread
//   POST /api/conversations/:id/reply  agent reply

 app.get("/api/conversations", (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    res.json(listConversations(search));
  });


app.get("/api/conversations/:id", (req, res) => {
  const conversation = getConversation(req.params.id);
  if (!conversation) {
    res.status(404).json({ ok: false, error: "conversation not found" });
    return;
  }

  markConversationRead(req.params.id);
  res.json(conversation);
  
});

app.post("/api/conversations/:id/reply", (req, res) => {  
  const { text } = req.body as { text?: string };
  if (!text || !text.trim()) {
    res.status(400).json({ ok: false, error: "text is required" });
    return;
  }

  const message = addAgentReply(req.params.id, text.trim());
  if (!message) {
    res.status(404).json({ ok: false, error: "conversation not found" });
    return;
  }

  res.status(201).json(message);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
