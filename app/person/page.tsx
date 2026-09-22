"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Person = {
  id: number;
  name: string;
  username: string;
};

function PersonContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPerson() {
      if (!userId) {
        setError("No person was selected.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/people/${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load profile.");
          return;
        }

        setPerson(data.user);
      } catch (error) {
        console.error("Profile loading error:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    loadPerson();
  }, [userId]);

  return (
    <main className="person-page">
      <aside className="person-sidebar">
        <Link href="/" className="person-logo">
          <span></span>
          whispr
        </Link>

        <nav className="person-nav">
          <Link href="/dashboard" className="person-nav-item">
            <span>⌂</span>
            Home
          </Link>

          <Link href="/messages" className="person-nav-item">
            <span>◌</span>
            Messages
          </Link>

          <Link
            href="/students"
            className="person-nav-item active"
          >
            <span>♧</span>
            People
          </Link>
        </nav>

        <div className="person-sidebar-bottom">
          <Link href="/" className="person-nav-item">
            <span>↪</span>
            Log out
          </Link>

          <Link href="/account" className="person-account">
            <div className="person-account-avatar">W</div>

            <div>
              <strong>Account</strong>
              <span>Your profile</span>
            </div>
          </Link>
        </div>
      </aside>

      <section className="person-main">

        <header className="person-topbar">
          <Link href="/students" className="person-back">
            ← <span>Back to people</span>
          </Link>

          <div className="person-top-label">
            WHISPR / PROFILE
          </div>
        </header>


        {loading && (
          <section className="person-profile">
            <div className="person-profile-art">
              <div className="person-avatar">•</div>
            </div>

            <div className="person-profile-content">
              <div className="person-label">
                PROFILE
              </div>

              <h1>
                Loading...
              </h1>

              <p className="person-description">
                Loading this person&apos;s profile.
              </p>
            </div>
          </section>
        )}


        {!loading && error && (
          <section className="person-profile">
            <div className="person-profile-art">
              <div className="person-avatar">•</div>
            </div>

            <div className="person-profile-content">
              <div className="person-label">
                PROFILE
              </div>

              <h1>
                Profile unavailable.
              </h1>

              <p className="person-description">
                {error}
              </p>

              <div className="person-actions">
                <Link
                  href="/students"
                  className="person-primary-button"
                >
                  Back to people
                  <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        )}


        {!loading && !error && person && (
          <>
            <section className="person-profile">

              <div className="person-profile-art">
                <div className="person-avatar">
                  {person.name.slice(0, 1).toUpperCase()}
                </div>

                <div className="person-status-dot"></div>
              </div>

              <div className="person-profile-content">

                <div className="person-label">
                  PROFILE
                </div>

                <h1>
                  {person.name}
                </h1>

                <p className="person-username">
                  @{person.username}
                </p>

                <p className="person-description">
                  Start a private conversation with{" "}
                  {person.name}.
                  Your conversation is temporary by design.
                </p>

                <div className="person-actions">

                  <Link
                    href={`/chat?userId=${person.id}`}
                    className="person-primary-button"
                  >
                    Start a Whispr
                    <span>→</span>
                  </Link>

                  <button
                    type="button"
                    className="person-secondary-button"
                  >
                    More
                    <span>•••</span>
                  </button>

                </div>

              </div>
            </section>


            <section className="person-info-grid">

              <div className="person-info-card">
                <span>USERNAME</span>

                <h3>
                  @{person.username}
                </h3>

                <p>
                  This is the username people can
                  use to find this person.
                </p>
              </div>

              <div className="person-info-card">
                <span>CONVERSATION</span>

                <h3>
                  Keep it private.
                </h3>

                <p>
                  Start a Whispr when you&apos;re ready.
                  Conversations are temporary.
                </p>
              </div>

            </section>
          </>
        )}


        <section className="person-principle">

          <div className="person-principle-symbol">
            ✦
          </div>

          <div>
            <div className="person-principle-label">
              WHISPR PRINCIPLE
            </div>

            <h2>
              Say what you mean.
              <br />
              <span>Then let it disappear.</span>
            </h2>
          </div>

        </section>

      </section>
    </main>
  );
}

export default function PersonPage() {
  return (
    <Suspense fallback={null}>
      <PersonContent />
    </Suspense>
  );
}
