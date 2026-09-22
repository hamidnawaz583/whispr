"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      /*
       * Temporary client-side storage.
       * We will replace this with a secure session
       * when we build authentication properly.
       */
      localStorage.setItem(
        "whispr_user",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Make sure Whispr is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">

      <div className="auth-container">

        {/* LEFT SIDE */}

        <section className="auth-visual">

          <Link href="/" className="auth-logo">
            <span></span>
            whispr
          </Link>

          <div className="auth-visual-content">

            <div className="auth-small-label">
              WELCOME BACK
            </div>

            <h1>
              Good conversations
              <br />
              <span>start here.</span>
            </h1>

            <p>
              Come back to your conversations,
              reconnect with people, and keep
              communicating without the clutter.
            </p>

          </div>

          <div className="auth-character">
            <div className="auth-character-bg"></div>

            <div className="auth-character-image">
              <img
                src="/whispr-characters.png"
                alt="Whispr characters"
              />
            </div>
          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="auth-form-section">

          <Link href="/" className="mobile-auth-logo">
            <span></span>
            whispr
          </Link>

          <div className="auth-form">

            <Link href="/" className="back-button">
              ←
            </Link>

            <div className="form-heading">

              <div className="auth-small-label">
                ACCOUNT
              </div>

              <h2>
                Log in
              </h2>

              <p>
                Welcome back. Enter your details
                to continue to Whispr.
              </p>

            </div>


            <form onSubmit={handleSubmit}>

              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <div className="password-label">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />

              </div>


              {/* OPTIONS */}

              <div className="form-options">

                <label className="remember">

                  <input type="checkbox" />

                  <span>
                    Remember me
                  </span>

                </label>

                <Link
                  href="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>

              </div>


              {/* ERROR */}

              {error && (
                <div className="auth-message auth-error">
                  {error}
                </div>
              )}


              {/* LOGIN */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}

                {!loading && <span>→</span>}
              </button>

            </form>


            {/* DIVIDER */}

            <div className="auth-divider">
              <span></span>
              or
              <span></span>
            </div>


            {/* GOOGLE */}

            <button
              type="button"
              className="social-button"
            >
              <span className="google-icon">
                G
              </span>

              Continue with Google
            </button>


            {/* CREATE ACCOUNT */}

            <p className="switch-auth">
              Don&apos;t have an account?

              <Link href="/create-account">
                Create account
              </Link>
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
