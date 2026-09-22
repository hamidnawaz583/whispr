import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import db from "@/lib/db";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token || password.length < 6) {
      return NextResponse.json(
        { message: "Use a valid reset link and a password of at least 6 characters." },
        { status: 400 }
      );
    }

    const resetToken = db
      .prepare(
        `
          SELECT id, user_id
          FROM password_reset_tokens
          WHERE token_hash = ?
            AND used_at IS NULL
            AND expires_at > ?
          LIMIT 1
        `
      )
      .get(hashToken(token), new Date().toISOString()) as
      | { id: number; user_id: number }
      | undefined;

    if (!resetToken) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const completeReset = db.transaction(() => {
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
        passwordHash,
        resetToken.user_id
      );
      db.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE id = ?").run(
        new Date().toISOString(),
        resetToken.id
      );
      db.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(
        resetToken.user_id
      );
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(
        resetToken.user_id
      );
    });

    completeReset();

    return NextResponse.json({
      message: "Your password has been reset. Please log in.",
    });
  } catch (error) {
    console.error("Password reset confirmation error:", error);

    return NextResponse.json(
      { message: "Unable to reset password." },
      { status: 500 }
    );
  }
}
