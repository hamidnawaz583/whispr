"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="whispr-page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <a href="#home" className="logo">
          <span className="logo-dot"></span>
          whispr
        </a>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>

          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>

          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>

          <Link href="/login" className="nav-login">
  Login
</Link>
        </div>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </nav>


      {/* ================= HERO ================= */}

      <section className="hero" id="home">

        <div className="hero-background-circle circle-one"></div>
        <div className="hero-background-circle circle-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span>
            A different way to connect
          </div>

          <h1>
            Say what you mean.
            <br />
            <span>Then let it disappear.</span>
          </h1>

          <p className="hero-description">
            Whispr is a simple, private communication space for
            conversations that do not need to stay forever.
          </p>

          <div className="hero-buttons">
            <Link href="/create-account" className="primary-button">
  Get started
  <span>→</span>
</Link>

            <Link href="/login" className="secondary-button">
  Sign in
</Link>
          </div>

          <div className="hero-small-text">
            No complicated setup. Just connect and Whispr.
          </div>

        </div>


        {/* CHARACTER AREA */}

        <div className="character-stage">

          <div className="character-glow"></div>

          {/* Bear */}

          <div className="character bear-character">

            <div className="bear-ear bear-ear-left"></div>
            <div className="bear-ear bear-ear-right"></div>

            <div className="bear-head">

              <div className="bear-eye eye-left"></div>
              <div className="bear-eye eye-right"></div>

              <div className="bear-muzzle">
                <div className="bear-nose"></div>
                <div className="bear-mouth"></div>
              </div>

            </div>

            <div className="bear-body">
              <div className="hoodie-pocket"></div>
            </div>

            <div className="bear-arm bear-arm-left"></div>
            <div className="bear-arm bear-arm-right"></div>

            <div className="bear-foot bear-foot-left"></div>
            <div className="bear-foot bear-foot-right"></div>

          </div>


          {/* Person */}

          <div className="character person-character">

            <div className="person-hair"></div>

            <div className="person-head">
              <div className="person-eye eye-left"></div>
              <div className="person-eye eye-right"></div>
              <div className="person-smile"></div>
            </div>

            <div className="person-neck"></div>

            <div className="person-body">
              <div className="phone"></div>
            </div>

            <div className="person-leg person-leg-left"></div>
            <div className="person-leg person-leg-right"></div>

            <div className="person-shoe person-shoe-left"></div>
            <div className="person-shoe person-shoe-right"></div>

          </div>


          {/* Fox */}

          <div className="character fox-character">

            <div className="fox-ear fox-ear-left"></div>
            <div className="fox-ear fox-ear-right"></div>

            <div className="fox-head">

              <div className="fox-eye eye-left"></div>
              <div className="fox-eye eye-right"></div>

              <div className="fox-snout"></div>

            </div>

            <div className="fox-body"></div>

            <div className="fox-tail"></div>

            <div className="fox-foot fox-foot-left"></div>
            <div className="fox-foot fox-foot-right"></div>

          </div>

        </div>

        <a href="#about" className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </a>

      </section>


      {/* ================= INTRO ================= */}

      <section className="intro-section" id="about">

        <div className="section-label">
          <span></span>
          WHAT IS WHISPR?
        </div>

        <div className="intro-grid">

          <div>
            <h2>
              Conversations should feel
              <span> natural.</span>
            </h2>
          </div>

          <div className="intro-text">
            <p>
              Whispr is a communication platform designed around
              simple, temporary conversations.
            </p>

            <p>
              Find people, start a conversation, send messages,
              talk through voice, and stay connected without
              keeping every conversation forever.
            </p>
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}

      <section className="features-section" id="features">

        <div className="section-heading">

          <div className="section-label">
            <span></span>
            BUILT FOR REAL CONVERSATIONS
          </div>

          <h2>
            Everything you need.
            <br />
            <span>Nothing you don&apos;t.</span>
          </h2>

        </div>


        <div className="feature-grid">

          {/* Feature 1 */}

          <article className="feature-card feature-large orange-card">

            <div className="feature-number">01</div>

            <div className="feature-icon">💬</div>

            <h3>Simple messaging</h3>

            <p>
              Send messages instantly and keep conversations
              focused on the people who matter.
            </p>

            <div className="fake-chat">

              <div className="fake-message received">
                Hey, are you around?
              </div>

              <div className="fake-message sent">
                Yep. What&apos;s up?
              </div>

            </div>

          </article>


          {/* Feature 2 */}

          <article className="feature-card dark-card">

            <div className="feature-number">02</div>

            <div className="feature-icon">🎙</div>

            <h3>Voice chat</h3>

            <p>
              Sometimes typing is too much work. Start a voice
              conversation and simply talk.
            </p>

            <div className="voice-visual">

              <div className="voice-circle">
                🎙
              </div>

              <div className="sound-bars">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>

            </div>

          </article>


          {/* Feature 3 */}

          <article className="feature-card cream-card">

            <div className="feature-number">03</div>

            <div className="feature-icon">24h</div>

            <h3>Messages disappear</h3>

            <p>
              Messages are designed to disappear after 24 hours,
              keeping your conversations temporary.
            </p>

            <div className="timer-visual">
              <strong>24</strong>
              <span>hours</span>
            </div>

          </article>


          {/* Feature 4 */}

          <article className="feature-card green-card">

            <div className="feature-number">04</div>

            <div className="feature-icon">✦</div>

            <h3>Made for people</h3>

            <p>
              A clean communication experience without
              unnecessary clutter.
            </p>

            <div className="people-visual">
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>

          </article>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section className="how-section" id="how-it-works">

        <div className="section-label">
          <span></span>
          HOW IT WORKS
        </div>

        <h2>
          Three steps.
          <br />
          <span>That&apos;s it.</span>
        </h2>

        <div className="steps">

          <div className="step">

            <div className="step-number">
              01
            </div>

            <h3>Create your Whispr</h3>

            <p>
              Create an account and set up your profile.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              02
            </div>

            <h3>Connect</h3>

            <p>
              Find people and start a text or voice conversation.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step">

            <div className="step-number">
              03
            </div>

            <h3>Whispr away</h3>

            <p>
              Conversations can disappear after their 24-hour
              lifetime.
            </p>

          </div>

        </div>

      </section>


      {/* ================= DISAPPEARING MESSAGES ================= */}

      <section className="disappear-section">

        <div className="disappear-content">

          <div className="section-label">
            <span></span>
            TEMPORARY BY DESIGN
          </div>

          <h2>
            Not everything
            <br />
            needs to <span>stay.</span>
          </h2>

          <p>
            Whispr gives conversations a 24-hour lifetime.
            After that, messages are automatically removed
            according to the app&apos;s expiration rules.
          </p>

          <button className="outline-button">
            Learn about Whispr
            <span>→</span>
          </button>

        </div>


        <div className="disappear-visual">

          <div className="floating-message message-one">
            See you tomorrow 👋
          </div>

          <div className="floating-message message-two">
            That was fun!
          </div>

          <div className="floating-message message-three">
            <span>24h</span>
            disappearing
          </div>

          <div className="big-24">
            24
            <small>HOURS</small>
          </div>

        </div>

      </section>


      {/* ================= VOICE ================= */}

      <section className="voice-section">

        <div className="voice-card">

          <div className="voice-copy">

            <div className="section-label">
              <span></span>
              VOICE CHAT
            </div>

            <h2>
              When typing
              <br />
              isn&apos;t enough.
            </h2>

            <p>
              Connect through voice and have a real conversation.
              We will build the live voice system after the core
              messaging system is complete.
            </p>

            <button className="light-button">
              Explore voice
              <span>→</span>
            </button>

          </div>


          <div className="voice-character">

            <div className="voice-orbit orbit-one"></div>
            <div className="voice-orbit orbit-two"></div>

            <div className="voice-mic">
              🎙
            </div>

          </div>

        </div>

      </section>


      {/* ================= FINAL CTA ================= */}

      <section className="cta-section">

        <div className="cta-decoration">
          ✦
        </div>

        <h2>
          Ready to
          <br />
          <span>Whispr?</span>
        </h2>

        <p>
          Start a conversation. Make a connection.
          Let the unnecessary disappear.
        </p>

       <Link
  href="/create-account"
  className="primary-button large-button"
>
  Create your account
  <span>→</span>
</Link>
      </section>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-logo">
          <span className="logo-dot"></span>
          whispr
        </div>

        <p>
          Talk freely. Connect privately.
        </p>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
          <a href="#home">Back to top ↑</a>
        </div>

        <div className="footer-bottom">
          © 2026 Whispr. Built for conversations.
        </div>

      </footer>

    </main>
  );
}
