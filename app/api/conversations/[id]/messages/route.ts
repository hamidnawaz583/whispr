import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const VOICE_STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "voice"
);

const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
]);

function ensureVoiceStorage() {
  if (!fs.existsSync(VOICE_STORAGE_DIR)) {
    fs.mkdirSync(VOICE_STORAGE_DIR, {
      recursive: true,
    });
  }
}

function normalizeAudioType(contentType: string) {
  return contentType
    .split(";")[0]
    .trim()
    .toLowerCase();
}

function getAudioExtension(contentType: string) {
  const normalizedType =
    normalizeAudioType(contentType);

  switch (normalizedType) {
    case "audio/webm":
      return ".webm";

    case "audio/ogg":
      return ".ogg";

    case "audio/mp4":
      return ".mp4";

    case "audio/mpeg":
      return ".mp3";

    case "audio/wav":
    case "audio/x-wav":
      return ".wav";

    default:
      return ".webm";
  }
}

function deleteAudioFile(filename: string | null) {
  if (!filename) {
    return;
  }

  const safeFilename = path.basename(filename);

  const filePath = path.join(
    VOICE_STORAGE_DIR,
    safeFilename
  );

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Unable to delete audio file:",
      error
    );
  }
}

function cleanupExpiredConversation(
  conversationId: number
) {
  const conversation = db
    .prepare(
      `
        SELECT id, expires_at
        FROM conversations
        WHERE id = ?
        LIMIT 1
      `
    )
    .get(conversationId) as
    | {
        id: number;
        expires_at: string;
      }
    | undefined;

  if (!conversation) {
    return false;
  }

  if (
    new Date(conversation.expires_at).getTime() <=
    Date.now()
  ) {
    const audioMessages = db
      .prepare(
        `
          SELECT audio_path
          FROM messages
          WHERE conversation_id = ?
            AND message_type = 'audio'
            AND audio_path IS NOT NULL
        `
      )
      .all(conversationId) as {
      audio_path: string;
    }[];

    for (const message of audioMessages) {
      deleteAudioFile(message.audio_path);
    }

    db.prepare(
      "DELETE FROM messages WHERE conversation_id = ?"
    ).run(conversationId);

    db.prepare(
      "DELETE FROM conversations WHERE id = ?"
    ).run(conversationId);

    return true;
  }

  return false;
}

function getConversationForUser(
  conversationId: number,
  userId: number
) {
  return db
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
          AND (
            user_one_id = ?
            OR user_two_id = ?
          )
        LIMIT 1
      `
    )
    .get(
      conversationId,
      userId,
      userId
    ) as
    | {
        id: number;
        user_one_id: number;
        user_two_id: number;
        created_at: string;
        expires_at: string;
      }
    | undefined;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;
    const conversationId = Number(id);

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid conversation ID.",
        },
        {
          status: 400,
        }
      );
    }

    const expired =
      cleanupExpiredConversation(conversationId);

    if (expired) {
      return NextResponse.json({
        conversation: null,
        messages: [],
        expired: true,
      });
    }

    const conversation =
      getConversationForUser(
        conversationId,
        currentUser.id
      );

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const messages = db
      .prepare(
        `
          SELECT
            id,
            sender_id,
            receiver_id,
            message_type,
            text,
            audio_path,
            created_at,
            expires_at
          FROM messages
          WHERE conversation_id = ?
          ORDER BY created_at ASC, id ASC
        `
      )
      .all(conversationId) as {
      id: number;
      sender_id: number;
      receiver_id: number;
      message_type: string;
      text: string | null;
      audio_path: string | null;
      created_at: string;
      expires_at: string;
    }[];

    const messagesWithAudioUrls =
      messages.map((message) => {
        if (
          message.message_type === "audio" &&
          message.audio_path
        ) {
          return {
            ...message,
            audio_path:
              `/api/conversations/${conversationId}/messages/${message.id}/audio`,
          };
        }

        return message;
      });

    return NextResponse.json({
      currentUserId: currentUser.id,
      conversation,
      messages: messagesWithAudioUrls,
    });
  } catch (error) {
    console.error(
      "Messages GET error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load messages.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Not authenticated.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } = await context.params;
    const conversationId = Number(id);

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid conversation ID.",
        },
        {
          status: 400,
        }
      );
    }

    const expired =
      cleanupExpiredConversation(conversationId);

    if (expired) {
      return NextResponse.json(
        {
          message:
            "This conversation has expired.",
        },
        {
          status: 410,
        }
      );
    }

    const conversation =
      getConversationForUser(
        conversationId,
        currentUser.id
      );

    if (!conversation) {
      return NextResponse.json(
        {
          message: "Conversation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const receiverId =
      conversation.user_one_id === currentUser.id
        ? conversation.user_two_id
        : conversation.user_one_id;

    const contentType =
      request.headers.get("content-type") || "";

    /*
     * VOICE MESSAGE
     */
    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
      const formData =
        await request.formData();

      const audio = formData.get("audio");

      if (!(audio instanceof File)) {
        return NextResponse.json(
          {
            message:
              "No audio file was provided.",
          },
          {
            status: 400,
          }
        );
      }

      if (audio.size <= 0) {
        return NextResponse.json(
          {
            message:
              "Audio file is empty.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        audio.size > MAX_AUDIO_SIZE
      ) {
        return NextResponse.json(
          {
            message:
              "Audio file is too large. Maximum size is 10 MB.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Browsers can send MIME types such as:
       *
       * audio/webm;codecs=opus
       * audio/ogg;codecs=opus
       *
       * We only need the base MIME type for validation.
       */
      const normalizedAudioType =
        normalizeAudioType(audio.type);

      if (
        !ALLOWED_AUDIO_TYPES.has(
          normalizedAudioType
        )
      ) {
        console.error(
          "Unsupported audio MIME type:",
          audio.type
        );

        return NextResponse.json(
          {
            message:
              "Unsupported audio format.",
          },
          {
            status: 400,
          }
        );
      }

      ensureVoiceStorage();

      const extension =
        getAudioExtension(
          normalizedAudioType
        );

      const filename =
        `${crypto.randomUUID()}${extension}`;

      const filePath = path.join(
        VOICE_STORAGE_DIR,
        filename
      );

      const audioBuffer =
        Buffer.from(
          await audio.arrayBuffer()
        );

      fs.writeFileSync(
        filePath,
        audioBuffer
      );

      try {
        const result = db
          .prepare(
            `
              INSERT INTO messages (
                conversation_id,
                sender_id,
                receiver_id,
                message_type,
                text,
                audio_path,
                expires_at
              )
              VALUES (
                ?,
                ?,
                ?,
                'audio',
                NULL,
                ?,
                ?
              )
            `
          )
          .run(
            conversationId,
            currentUser.id,
            receiverId,
            filename,
            conversation.expires_at
          );

        const message = db
          .prepare(
            `
              SELECT
                id,
                sender_id,
                receiver_id,
                message_type,
                text,
                audio_path,
                created_at,
                expires_at
              FROM messages
              WHERE id = ?
              LIMIT 1
            `
          )
          .get(
            Number(
              result.lastInsertRowid
            )
          ) as {
          id: number;
          sender_id: number;
          receiver_id: number;
          message_type: string;
          text: string | null;
          audio_path: string | null;
          created_at: string;
          expires_at: string;
        };

        return NextResponse.json(
          {
            message: {
              ...message,
              audio_path:
                `/api/conversations/${conversationId}/messages/${message.id}/audio`,
            },
          },
          {
            status: 201,
          }
        );
      } catch (error) {
        deleteAudioFile(filename);
        throw error;
      }
    }

    /*
     * TEXT MESSAGE
     */
    const body = await request.json();

    const text = String(
      body.text || ""
    ).trim();

    if (!text) {
      return NextResponse.json(
        {
          message:
            "Message cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Message is too long. Maximum 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const result = db
      .prepare(
        `
          INSERT INTO messages (
            conversation_id,
            sender_id,
            receiver_id,
            message_type,
            text,
            expires_at
          )
          VALUES (
            ?,
            ?,
            ?,
            'text',
            ?,
            ?
          )
        `
      )
      .run(
        conversationId,
        currentUser.id,
        receiverId,
        text,
        conversation.expires_at
      );

    const message = db
      .prepare(
        `
          SELECT
            id,
            sender_id,
            receiver_id,
            message_type,
            text,
            audio_path,
            created_at,
            expires_at
          FROM messages
          WHERE id = ?
          LIMIT 1
        `
      )
      .get(
        Number(result.lastInsertRowid)
      );

    return NextResponse.json(
      {
        message,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Messages POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to send message.",
      },
      {
        status: 500,
      }
    );
  }
}