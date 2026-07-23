import { useState } from "react";
import type { Conversation } from "../../../shared/types.js";

interface ConversationThreadProps {
  conversation: Conversation | null;
  loading: boolean;
  onSendReply: (text: string) => Promise<void>;
}

function senderLabel(sender: "customer" | "agent" | "assistant"): string {
  if (sender === "agent") return "You";
  if (sender === "assistant") return "Assistant";
  return "Customer";
}

export default function ConversationThread({
  conversation,
  loading,
  onSendReply,
}: ConversationThreadProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) {
    return (
      <div className="conversation-thread empty">
        <p className="hint">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="conversation-thread empty">
        <p className="hint">Select a conversation to view it.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      await onSendReply(text);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="conversation-thread">
      <div className="thread-header">
        <h2>{conversation.customerName}</h2>
      </div>

      <div className="thread-messages">
        {conversation.messages.map((m) => (
          <div key={m.id} className={`message message-${m.sender}`}>
            <span className="message-sender">{senderLabel(m.sender)}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      <form className="reply-form" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a reply..."
          rows={2}
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}