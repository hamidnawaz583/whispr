"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create account.");
        return;
      }

      setSuccess("Account created. Taking you to your space…");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);

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
              JOIN WHISPR
            </div>

            <h1>
              Make space
              <br />
              <span>for better conversations.</span>
            </h1>

            <p>
              Create your Whispr account and
              start communicating in a simpler,
              lighter way.
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
                GET STARTED
              </div>

              <h2>
                Create account
              </h2>

              <p>
                Create your account and start
                using Whispr.
              </p>

            </div>


            <form onSubmit={handleSubmit}>

              {/* FULL NAME */}

              <div className="input-group">

                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

              </div>


              {/* EMAIL */}

              <div className="input-group">

                <label htmlFor="create-email">
                  Email
                </label>

                <input
                  id="create-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

              </div>


              {/* USERNAME */}

              <div className="input-group">

                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  required
                />

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <div className="password-label">

                  <label htmlFor="create-password">
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
                  id="create-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  minLength={6}
                />

              </div>


              <div className="password-hint">
                Use at least 6 characters.
              </div>


              {/* ERROR */}

              {error && (
                <div className="auth-message auth-error">
                  {error}
                </div>
              )}


              {/* SUCCESS */}

              {success && (
                <div className="auth-message auth-success">
                  {success}
                </div>
              )}


              {/* CREATE ACCOUNT */}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}

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


            {/* LOGIN */}

            <p className="switch-auth">

              Already have an account?

              <Link href="/login">
                Log in
              </Link>

            </p>

          </div>

        </section>

      </div>
    </main>
  );
}
