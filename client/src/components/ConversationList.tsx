import type { ConversationSummary } from "../../../shared/types.js";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface ConversationListProps {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (customerId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  loading,
}: ConversationListProps) {
  return (
    <div className="conversation-list">
      <input
        type="text"
        className="search-input"
        placeholder="Search by name or message..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {loading && <p className="hint">Loading...</p>}

      {!loading && conversations.length === 0 && (
        <p className="hint">
          {searchTerm ? "No conversations match your search." : "No conversations yet."}
        </p>
      )}

      <ul className="conversation-items">
        {conversations.map((c) => (
          <li key={c.customerId}>
            <button
              type="button"
              className={`conversation-item ${c.customerId === selectedId ? "selected" : ""}`}
              onClick={() => onSelect(c.customerId)}
            >
              <div className="conversation-item-top">
                <span className="conversation-name">{c.customerName}</span>
                <span className="conversation-time">{formatTimestamp(c.lastMessageTimestamp)}</span>
              </div>
              <p className="conversation-preview">{c.lastMessage}</p>
              {c.unreadCount > 0 && <span className="unread-badge">{c.unreadCount}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}