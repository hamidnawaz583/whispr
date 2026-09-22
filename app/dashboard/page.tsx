"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <Link href="/" className="dashboard-logo">
          <span></span>
          whispr
        </Link>

        <nav className="dashboard-nav">
          {/* Home */}
          <Link
            href="/dashboard"
            className="dashboard-nav-item active"
          >
            <span className="nav-icon">⌂</span>
            <span className="nav-text">Home</span>
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className="dashboard-nav-item"
          >
            <span className="nav-icon">◌</span>
            <span className="nav-text">Messages</span>
          </Link>

          {/* People */}
          <Link
            href="/students"
            className="dashboard-nav-item"
          >
            <span className="nav-icon">♧</span>
            <span className="nav-text">People</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          {/* Log out */}
          <Link
            href="/"
            className="dashboard-nav-item logout-item"
          >
            <span className="nav-icon">↪</span>
            <span className="nav-text">Log out</span>
          </Link>

          {/* Account */}
          <Link
            href="/account"
            className="sidebar-user"
          >
            <div className="user-avatar">W</div>

            <div className="sidebar-user-info">
              <strong>Account</strong>
              <span>Profile</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Dashboard */}
      <section className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <div className="dashboard-eyebrow">
              YOUR SPACE
            </div>

            <h1>
              Welcome to <span>Whispr.</span>
            </h1>

            <p className="dashboard-intro">
              A quieter way to talk, connect, and let
              conversations disappear when they&apos;re no
              longer needed.
            </p>
          </div>

          {/* Account shortcut */}
          <Link
            href="/account"
            className="header-avatar"
            aria-label="Open your account"
          >
            ?
          </Link>
        </header>

        {/* Main actions */}
        <section className="dashboard-focus">
          <div className="dashboard-focus-copy">
            <div className="section-label">
              START HERE
            </div>

            <h2>
              Say something.
              <br />
              <span>Keep it private.</span>
            </h2>

            <p>
              Find someone you know or open your
              conversations. Every Whispr is designed to
              disappear after 24 hours.
            </p>
          </div>

          <div className="dashboard-focus-actions">
            {/* Find People */}
            <Link
              href="/students"
              className="dashboard-action-card"
            >
              <div className="dashboard-action-icon">
                ♧
              </div>

              <div>
                <strong>Find people</strong>

                <span>
                  Search by name or username.
                </span>
              </div>

              <b>↗</b>
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className="dashboard-action-card dark"
            >
              <div className="dashboard-action-icon">
                ◌
              </div>

              <div>
                <strong>Messages</strong>

                <span>
                  Choose who you want to Whispr with.
                </span>
              </div>

              <b>↗</b>
            </Link>
          </div>
        </section>

        {/* Recent Conversations */}
        <section className="dashboard-panel dashboard-conversations">
          <div className="panel-heading">
            <div>
              <div className="section-label">
                MESSAGES
              </div>

              <h2>Recent conversations</h2>
            </div>
          </div>

          <div className="dashboard-empty-state">
            <div className="empty-state-icon">
              ◌
            </div>

            <div className="empty-state-label">
              NOTHING HERE YET
            </div>

            <h3>No conversations yet.</h3>

            <p>
              Your conversations will appear here after
              you start talking with someone.
            </p>
          </div>
        </section>

        {/* Privacy */}
        <section className="privacy-banner">
          <div className="privacy-icon">
            ◷
          </div>

          <div className="privacy-content">
            <span>THE WHISPR WAY</span>

            <h3>
              Say what you mean.
              <br />
              Then let it disappear.
            </h3>

            <p>
              Conversations are temporary by design.
              Messages have a 24-hour lifetime.
            </p>
          </div>

          <div className="privacy-time">
            <strong>24h</strong>
            <span>lifetime</span>
          </div>
        </section>
      </section>
    </main>
  );
}
