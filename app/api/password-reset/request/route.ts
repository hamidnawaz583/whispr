import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";

const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const SUCCESS_MESSAGE =
  "If an account matches that email, password reset instructions are ready.";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Enter your email address." },
        { status: 400 }
      );
    }

    const user = db
      .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
      .get(email) as { id: number } | undefined;

    if (!user) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_LIFETIME_MS
    ).toISOString();

    db.prepare(
      `
        DELETE FROM password_reset_tokens
        WHERE user_id = ? OR expires_at <= ?
      `
    ).run(user.id, new Date().toISOString());

    db.prepare(
      `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        ) VALUES (?, ?, ?)
      `
    ).run(user.id, hashToken(token), expiresAt);

    const response: { message: string; resetUrl?: string } = {
      message: SUCCESS_MESSAGE,
    };

    // A real deployment should send this URL through its configured email
    // provider. Exposing it only outside production makes local testing usable
    // without weakening production account security.
    if (process.env.NODE_ENV !== "production") {
      response.resetUrl = new URL(
        `/reset-password?token=${token}`,
        request.url
      ).toString();
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Password reset request error:", error);

    return NextResponse.json(
      { message: "Unable to start password reset." },
      { status: 500 }
    );
  }
}
