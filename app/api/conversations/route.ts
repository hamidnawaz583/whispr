import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

function cleanupExpiredConversations() {
  const expired = db
    .prepare(
      `
        SELECT id
        FROM conversations
        WHERE expires_at <= datetime('now')
      `
    )
    .all() as { id: number }[];

  for (const conversation of expired) {
    db.prepare(
      "DELETE FROM messages WHERE conversation_id = ?"
    ).run(conversation.id);

    db.prepare(
      "DELETE FROM conversations WHERE id = ?"
    ).run(conversation.id);
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    cleanupExpiredConversations();

    const conversations = db
      .prepare(
        `
          SELECT
            c.id,
            c.expires_at,
            c.created_at,

            CASE
              WHEN c.user_one_id = ? THEN u2.id
              ELSE u1.id
            END AS other_user_id,

            CASE
              WHEN c.user_one_id = ? THEN u2.name
              ELSE u1.name
            END AS other_user_name,

            CASE
              WHEN c.user_one_id = ? THEN u2.username
              ELSE u1.username
            END AS other_user_username,

            (
              SELECT m.text
              FROM messages m
              WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC, m.id DESC
              LIMIT 1
            ) AS last_message,

            (
              SELECT m.message_type
              FROM messages m
              WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC, m.id DESC
              LIMIT 1
            ) AS last_message_type,

            (
              SELECT m.created_at
              FROM messages m
              WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC, m.id DESC
              LIMIT 1
            ) AS last_message_at

          FROM conversations c

          INNER JOIN users u1
            ON u1.id = c.user_one_id

          INNER JOIN users u2
            ON u2.id = c.user_two_id

          WHERE
            c.user_one_id = ?
            OR c.user_two_id = ?

          ORDER BY
            COALESCE(
              (
                SELECT m.created_at
                FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC, m.id DESC
                LIMIT 1
              ),
              c.created_at
            ) DESC
        `
      )
      .all(
        currentUser.id,
        currentUser.id,
        currentUser.id,
        currentUser.id,
        currentUser.id
      );

    return NextResponse.json({
      conversations,
    });
  } catch (error) {
    console.error("Conversations GET error:", error);

    return NextResponse.json(
      { message: "Unable to load conversations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    cleanupExpiredConversations();

    const body = await request.json();

    const otherUserId = Number(body.userId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      return NextResponse.json(
        { message: "A valid userId is required." },
        { status: 400 }
      );
    }

    if (otherUserId === currentUser.id) {
      return NextResponse.json(
        { message: "You cannot start a conversation with yourself." },
        { status: 400 }
      );
    }

    const otherUser = db
      .prepare(
        `
          SELECT id, name, username, email
          FROM users
          WHERE id = ?
          LIMIT 1
        `
      )
      .get(otherUserId) as
      | {
          id: number;
          name: string;
          username: string;
          email: string;
        }
      | undefined;

    if (!otherUser) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const userOneId = Math.min(currentUser.id, otherUserId);
    const userTwoId = Math.max(currentUser.id, otherUserId);

    let conversation = db
      .prepare(
        `
          SELECT
            id,
            user_one_id,
            user_two_id,
            created_at,
            expires_at
          FROM conversations
          WHERE user_one_id = ?
            AND user_two_id = ?
          LIMIT 1
        `
      )
      .get(userOneId, userTwoId) as
      | {
          id: number;
          user_one_id: number;
          user_two_id: number;
          created_at: string;
          expires_at: string;
        }
      | undefined;

    if (!conversation) {
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();

      const result = db
        .prepare(
          `
            INSERT INTO conversations (
              user_one_id,
              user_two_id,
              expires_at
            )
            VALUES (?, ?, ?)
          `
        )
        .run(
          userOneId,
          userTwoId,
          expiresAt
        );

      conversation = db
        .prepare(
          `
            SELECT
              id,
              user_one_id,
              user_two_id,
              created_at,
              expires_at
            FROM conversations
            WHERE id = ?
          `
        )
        .get(Number(result.lastInsertRowid)) as typeof conversation;
    }

    return NextResponse.json({
      conversation,
      otherUser,
    });
  } catch (error) {
    console.error("Conversations POST error:", error);

    return NextResponse.json(
      { message: "Unable to create conversation." },
      { status: 500 }
    );
  }
}