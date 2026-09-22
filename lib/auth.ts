import crypto from "crypto";
import { cookies } from "next/headers";
import db from "./db";

const SESSION_COOKIE_NAME = "whispr_session";
const SESSION_DURATION_DAYS = 7;

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  db.prepare(
    `
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `
  ).run(userId, tokenHash, expiresAt);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = db
    .prepare(
      `
        SELECT
          sessions.id AS session_id,
          sessions.user_id,
          sessions.expires_at,
          users.id,
          users.name,
          users.username,
          users.email
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
        LIMIT 1
      `
    )
    .get(tokenHash) as
    | {
        session_id: number;
        user_id: number;
        expires_at: string;
        id: number;
        name: string;
        username: string;
        email: string;
      }
    | undefined;

  if (!session) {
    return null;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(
      session.session_id
    );

    cookieStore.delete(SESSION_COOKIE_NAME);

    return null;
  }

  return {
    id: session.id,
    name: session.name,
    username: session.username,
    email: session.email,
  };
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    db.prepare(
      "DELETE FROM sessions WHERE token_hash = ?"
    ).run(tokenHash);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}