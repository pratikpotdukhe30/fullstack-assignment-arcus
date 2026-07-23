
import { useEffect, useState } from "react";
import type { Conversation, ConversationSummary } from "../../shared/types.js";
import { fetchConversations, fetchConversation, sendReply } from "./api";
import ConversationList from "./components/ConversationList";
import ConversationThread from "./components/ConversationThread";

export default function App() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setListLoading(true);
      try {
        const data = await fetchConversations(searchTerm);
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setListLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  
  //For new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchConversations(searchTerm);
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [searchTerm]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedConversation(null);
      return;
    }

    let cancelled = false;
    setThreadLoading(true);

    fetchConversation(selectedId)
      .then((data) => {
        if (!cancelled) setSelectedConversation(data);
        setConversations((prev) =>
          prev.map((c) =>
            c.customerId === selectedId ? { ...c, unreadCount: 0 } : c,
          ),
        );
      })
      .catch((err) => {
        console.error("Failed to load conversation:", err);
        if (!cancelled) setSelectedConversation(null);
      })
      .finally(() => {
        if (!cancelled) setThreadLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchConversation(selectedId);
        setSelectedConversation(data);
      } catch (err) {
        console.error("Failed to refresh conversation:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedId]);

  async function handleSendReply(text: string) {
    if (!selectedId) return;
    await sendReply(selectedId, text);

    const [thread, list] = await Promise.all([
      fetchConversation(selectedId),
      fetchConversations(searchTerm),
    ]);
    setSelectedConversation(thread);
    setConversations(list);
  }

  return (
    <div className="app">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={listLoading}
      />
      <ConversationThread
        conversation={selectedConversation}
        loading={threadLoading}
        onSendReply={handleSendReply}
      />
    </div>
  );
}
