"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [loading, setLoading] = useState(false); const [message, setMessage] = useState(""); const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    setLoading(true);
    try { const response = await fetch("/api/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); const data = await response.json(); setMessage(data.message || "Unable to reset password."); setSuccess(response.ok); } catch { setMessage("Unable to connect to Whispr. Please try again."); } finally { setLoading(false); }
  }
  return <main className="auth-page"><div className="auth-container"><section className="auth-visual"><Link href="/" className="auth-logo"><span />whispr</Link><div className="auth-visual-content"><div className="auth-small-label">ACCOUNT RECOVERY</div><h1>Choose a<br /><span>new password.</span></h1><p>This reset link is valid once, for 30 minutes. We’ll sign out all existing sessions once you’re done.</p></div></section><section className="auth-form-section"><Link href="/" className="mobile-auth-logo"><span />whispr</Link><div className="auth-form auth-form-compact"><Link href="/login" className="back-button" aria-label="Back to login">←</Link><div className="form-heading"><div className="auth-small-label">SECURE RESET</div><h2>New password</h2><p>Use at least 6 characters and keep it private.</p></div>{success ? <div className="reset-complete"><div className="auth-message auth-success">{message}</div><Link href="/login" className="auth-submit">Log in <span>→</span></Link></div> : <form onSubmit={submit}><div className="input-group"><label htmlFor="new-password">New password</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required autoComplete="new-password" /></div><div className="input-group"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={6} required autoComplete="new-password" /></div>{message && <div className="auth-message auth-error" role="alert">{message}</div>}<button className="auth-submit" type="submit" disabled={loading || !token}>{loading ? "Resetting password…" : "Reset password"}<span>→</span></button>{!token && <p className="password-hint">This link is missing its reset token. <Link href="/forgot-password">Request a new one.</Link></p>}</form>}</div></section></div></main>;
}
