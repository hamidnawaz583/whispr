"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); setResetUrl("");
    try {
      const response = await fetch("/api/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      setMessage(data.message || "Unable to start password reset.");
      if (response.ok) setResetUrl(data.resetUrl || "");
    } catch { setMessage("Unable to connect to Whispr. Please try again."); }
    finally { setLoading(false); }
  }

  return <AuthShell eyebrow="ACCOUNT RECOVERY" title={<>Reset your<br /><span>password.</span></>} description="Enter the email connected to your account. We’ll prepare a secure, one-time reset link."><form onSubmit={submit}><div className="input-group"><label htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /></div>{message && <div className="auth-message auth-success" role="status">{message}</div>}{resetUrl && <div className="reset-dev-link"><strong>Development reset link</strong><Link href={resetUrl}>Reset your password →</Link></div>}<button className="auth-submit" type="submit" disabled={loading}>{loading ? "Preparing link…" : "Continue"}<span>→</span></button></form><p className="switch-auth">Remembered it? <Link href="/login">Log in</Link></p></AuthShell>;
}

function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: React.ReactNode; description: string; children: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-container"><section className="auth-visual"><Link href="/" className="auth-logo"><span />whispr</Link><div className="auth-visual-content"><div className="auth-small-label">YOUR ACCOUNT, SECURELY</div><h1>Back to the<br /><span>conversations.</span></h1><p>Secure account recovery with a time-limited link, so only you can choose a new password.</p></div></section><section className="auth-form-section"><Link href="/" className="mobile-auth-logo"><span />whispr</Link><div className="auth-form auth-form-compact"><Link href="/login" className="back-button" aria-label="Back to login">←</Link><div className="form-heading"><div className="auth-small-label">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>{children}</div></section></div></main>;
}
