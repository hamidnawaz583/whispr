"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

function initials(value: string) {
  return value.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function AccountPage() {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          router.push("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Account loading error:", error);
        setError("Unable to load your account.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="account-page">
      {/* Sidebar */}
      <aside className="account-sidebar">
        <Link href="/" className="account-logo">
          <span></span>
          whispr
        </Link>

        <nav className="account-nav">
          <Link href="/dashboard" className="account-nav-item">
            <span className="account-nav-icon">⌂</span>
            <span>Home</span>
          </Link>

          <Link href="/messages" className="account-nav-item">
            <span className="account-nav-icon">◌</span>
            <span>Messages</span>
          </Link>

          <Link href="/students" className="account-nav-item">
            <span className="account-nav-icon">♧</span>
            <span>People</span>
          </Link>
        </nav>

        <div className="account-sidebar-bottom">
          <button
            type="button"
            className="account-nav-item account-logout-button"
            onClick={handleLogout}
          >
            <span className="account-nav-icon">↪</span>
            <span>Log out</span>
          </button>

          <div className="account-sidebar-profile">
            <div className="account-sidebar-avatar">
              {initials(user?.name || "Whispr")}
            </div>

            <div className="account-sidebar-profile-info">
              <strong>
                {loading ? "Loading..." : user?.name || "Account"}
              </strong>

              <span>
                {loading
                  ? "Loading profile"
                  : user
                    ? `@${user.username}`
                    : "Your profile"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="account-main">
        {/* Header */}
        <header className="account-header">
          <div>
            <div className="account-eyebrow">
              YOUR SPACE
            </div>

            <h1>
              Your <span>account.</span>
            </h1>

            <p>
              Manage your profile and control how
              you use Whispr.
            </p>
          </div>

          <div className="account-header-avatar">
            {initials(user?.name || "Whispr")}
          </div>
        </header>

        {error && (
          <div className="account-error">
            {error}
          </div>
        )}

        {/* Profile */}
        <section className="account-profile-card">
          <div className="account-profile-top">
            <div className="account-large-avatar">
              {initials(user?.name || "Whispr")}
            </div>

            <div className="account-profile-heading">
              <div className="account-section-label">
                PROFILE
              </div>

              <h2>Your profile</h2>

              <p>
                Your real Whispr account information is
                connected to your database.
              </p>
            </div>

            <button
              type="button"
              className="account-edit-button"
              onClick={() => setEditing(!editing)}
              disabled={loading || !user}
            >
              {editing ? "Done" : "Edit profile"}
              <span>{editing ? "✓" : "→"}</span>
            </button>
          </div>

          <div className="account-details-grid">
            <div className="account-detail">
              <span>NAME</span>

              {editing ? (
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="account-input"
                  disabled
                />
              ) : (
                <strong>
                  {loading
                    ? "Loading..."
                    : user?.name || "Not available"}
                </strong>
              )}
            </div>

            <div className="account-detail">
              <span>USERNAME</span>

              {editing ? (
                <input
                  type="text"
                  defaultValue={
                    user?.username
                      ? `@${user.username}`
                      : ""
                  }
                  className="account-input"
                  disabled
                />
              ) : (
                <strong>
                  {loading
                    ? "Loading..."
                    : user?.username
                      ? `@${user.username}`
                      : "Not available"}
                </strong>
              )}
            </div>

            <div className="account-detail">
              <span>EMAIL</span>

              {editing ? (
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="account-input"
                  disabled
                />
              ) : (
                <strong>
                  {loading
                    ? "Loading..."
                    : user?.email || "Not available"}
                </strong>
              )}
            </div>

            <div className="account-detail">
              <span>ACCOUNT</span>

              <strong>Whispr account</strong>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="account-section">
          <div className="account-section-heading">
            <div>
              <div className="account-section-label">
                PRIVACY
              </div>

              <h2>Built to stay temporary.</h2>
            </div>
          </div>

          <div className="account-privacy-card">
            <div className="account-privacy-icon">
              ◷
            </div>

            <div className="account-privacy-content">
              <span>MESSAGE LIFETIME</span>

              <h3>24 hours</h3>

              <p>
                Messages are designed to disappear
                after 24 hours.
              </p>
            </div>

            <div className="account-privacy-badge">
              ACTIVE
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="account-section">
          <div className="account-section-heading">
            <div>
              <div className="account-section-label">
                ACCOUNT
              </div>

              <h2>Your Whispr space.</h2>
            </div>
          </div>

          <div className="account-info-grid">
            <div className="account-info-card">
              <span>IDENTITY</span>

              <h3>Private by design.</h3>

              <p>
                Your profile can be used to help people
                find and connect with you.
              </p>
            </div>

            <div className="account-info-card">
              <span>CONVERSATIONS</span>

              <h3>Keep things simple.</h3>

              <p>
                Find someone, start a conversation,
                and let the conversation disappear.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom principle */}
        <section className="account-principle">
          <div className="account-principle-symbol">
            ✦
          </div>

          <div>
            <div className="account-principle-label">
              THE WHISPR WAY
            </div>

            <h2>
              Your account is yours.
              <br />
              <span>
                Your conversations are temporary.
              </span>
            </h2>
          </div>
        </section>
      </section>
    </main>
  );
}
