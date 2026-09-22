"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Conversation = {
  id: number;
  expires_at: string;
  created_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_username: string;
  last_message: string | null;
  last_message_type: string | null;
  last_message_at: string | null;
};

type User = { name: string; username: string };

function initials(value: string) {
  return value.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    const response = await fetch("/api/me", { credentials: "include", cache: "no-store" });
    if (response.status === 401) { router.replace("/login"); return; }
    if (response.ok) setCurrentUser((await response.json()).user);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.replace("/");
    router.refresh();
  }

  async function loadConversations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/conversations",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load conversations."
        );
      }

      setConversations(
        data.conversations || []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredConversations =
    useMemo(() => {
      const value = search
        .trim()
        .toLowerCase();

      if (!value) {
        return conversations;
      }

      return conversations.filter(
        (conversation) => {
          return (
            conversation.other_user_name
              ?.toLowerCase()
              .includes(value) ||
            conversation.other_user_username
              ?.toLowerCase()
              .includes(value)
          );
        }
      );
    }, [conversations, search]);

  function getLastMessage(
    conversation: Conversation
  ) {
    if (
      conversation.last_message_type ===
      "audio"
    ) {
      return "Voice message";
    }

    return (
      conversation.last_message ||
      "No messages yet"
    );
  }

  function formatTime(
    value: string | null
  ) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="messages-page">
      {/* Sidebar */}
      <aside className="messages-sidebar">
        <Link
          href="/dashboard"
          className="messages-logo"
        >
          <span></span>
          whispr
        </Link>

        <nav className="messages-nav">
          <Link
            href="/dashboard"
            className="messages-nav-item"
          >
            <span>⌂</span>
            Home
          </Link>

          <Link
            href="/messages"
            className="messages-nav-item active"
          >
            <span>◌</span>
            Messages
          </Link>

          <Link
            href="/students"
            className="messages-nav-item"
          >
            <span>♧</span>
            People
          </Link>
        </nav>

        <div className="messages-sidebar-bottom">
          <button type="button" className="messages-nav-item messages-logout-button" onClick={handleLogout}>
            <span>↪</span>
            Log out
          </button>

          <Link
            href="/account"
            className="messages-account"
          >
            <div className="messages-account-avatar">
              {initials(currentUser?.name || "Whispr")}
            </div>

            <div>
              <strong>{currentUser?.name || "Your account"}</strong>
              <span>{currentUser ? `@${currentUser.username}` : "Profile & settings"}</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <section className="messages-main">
        <header className="messages-header">
          <div>
            <div className="messages-eyebrow">
              PRIVATE CONVERSATIONS
            </div>

            <h1>
              Your <span>messages.</span>
            </h1>

            <p>
              Choose someone to continue a
              conversation, or find someone new.
            </p>
          </div>

          <Link
            href="/account"
            className="messages-header-avatar"
            aria-label="Open account"
          >
            {initials(currentUser?.name || "Whispr")}
          </Link>
        </header>

        {/* Search */}
        <div className="messages-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search conversations..."
            aria-label="Search conversations"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* Conversation list */}
        <section className="messages-list-section">
          <div className="messages-section-heading">
            <div>
              <span>INBOX</span>
              <h2>Conversations</h2>
            </div>
          </div>

          {loading && (
            <div className="messages-empty">
              <div className="messages-empty-symbol">
                ◌
              </div>

              <div className="messages-empty-label">
                LOADING
              </div>

              <h3>
                Loading conversations...
              </h3>

              <p>
                Your conversations are being
                loaded.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="messages-empty">
              <div className="messages-empty-symbol">
                !
              </div>

              <div className="messages-empty-label">
                SOMETHING WENT WRONG
              </div>

              <h3>
                Unable to load messages.
              </h3>

              <p>{error}</p>

              <button
                type="button"
                className="messages-find-button"
                onClick={loadConversations}
              >
                Try again
                <span>↻</span>
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            filteredConversations.length ===
              0 && (
              <div className="messages-empty">
                <div className="messages-empty-symbol">
                  ◌
                </div>

                <div className="messages-empty-label">
                  YOUR INBOX IS QUIET
                </div>

                <h3>
                  {search
                    ? "No matching conversations."
                    : "No conversations yet."}
                </h3>

                <p>
                  {search
                    ? "Try another name or username."
                    : "When you start talking with someone, your conversations will appear here."}
                </p>

                {!search && (
                  <Link
                    href="/students"
                    className="messages-find-button"
                  >
                    Find someone
                    <span>→</span>
                  </Link>
                )}
              </div>
            )}

          {!loading &&
            !error &&
            filteredConversations.length >
              0 && (
              <div className="messages-conversation-list">
                {filteredConversations.map(
                  (conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/chat?conversationId=${conversation.id}&userId=${conversation.other_user_id}`}
                      className="messages-conversation"
                    >
                      <div className="messages-conversation-avatar">
                        {initials(conversation.other_user_name)}
                      </div>

                      <div className="messages-conversation-content">
                        <div className="messages-conversation-top">
                          <strong>
                            {
                              conversation.other_user_name
                            }
                          </strong>

                          <span>
                            {formatTime(
                              conversation.last_message_at
                            )}
                          </span>
                        </div>

                        <div className="messages-conversation-bottom">
                          <span>
                            @
                            {
                              conversation.other_user_username
                            }
                          </span>

                          <p>
                            {getLastMessage(
                              conversation
                            )}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
        </section>

        {/* Privacy note */}
        <section className="messages-privacy">
          <div className="messages-privacy-icon">
            ◷
          </div>

          <div>
            <span>WHISPR PRINCIPLE</span>

            <h3>
              Nothing needs to stay forever.
            </h3>

            <p>
              Conversations are designed to
              disappear after 24 hours.
            </p>
          </div>

          <strong>24h</strong>
        </section>
      </section>
    </main>
  );
}
