import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import fs from "fs";
import path from "path";

type RouteContext = {
  params: Promise<{
    id: string;
    messageId: string;
  }>;
};

const VOICE_STORAGE_DIR = path.join(
  process.cwd(),
  "storage",
  "voice"
);

function getContentType(filePath: string) {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  switch (extension) {
    case ".webm":
      return "audio/webm";

    case ".ogg":
      return "audio/ogg";

    case ".mp4":
      return "audio/mp4";

    case ".mp3":
      return "audio/mpeg";

    case ".wav":
      return "audio/wav";

    default:
      return "application/octet-stream";
  }
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

    const { id, messageId } =
      await context.params;

    const conversationId = Number(id);
    const parsedMessageId = Number(messageId);

    if (
      !Number.isInteger(conversationId) ||
      conversationId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid conversation ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(parsedMessageId) ||
      parsedMessageId <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid message ID.",
        },
        {
          status: 400,
        }
      );
    }

    const conversation = db
      .prepare(
        `
          SELECT
            id,
            user_one_id,
            user_two_id,
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
        currentUser.id,
        currentUser.id
      ) as
      | {
          id: number;
          user_one_id: number;
          user_two_id: number;
          expires_at: string;
        }
      | undefined;

    if (!conversation) {
      return NextResponse.json(
        {
          message:
            "Conversation not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Do not allow access after
     * the conversation expires.
     */
    if (
      new Date(
        conversation.expires_at
      ).getTime() <= Date.now()
    ) {
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

    const message = db
      .prepare(
        `
          SELECT
            id,
            conversation_id,
            sender_id,
            receiver_id,
            message_type,
            audio_path,
            expires_at
          FROM messages
          WHERE id = ?
            AND conversation_id = ?
          LIMIT 1
        `
      )
      .get(
        parsedMessageId,
        conversationId
      ) as
      | {
          id: number;
          conversation_id: number;
          sender_id: number;
          receiver_id: number;
          message_type: string;
          audio_path: string | null;
          expires_at: string;
        }
      | undefined;

    if (!message) {
      return NextResponse.json(
        {
          message:
            "Message not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      message.message_type !== "audio"
    ) {
      return NextResponse.json(
        {
          message:
            "This message is not an audio message.",
        },
        {
          status: 400,
        }
      );
    }

    if (!message.audio_path) {
      return NextResponse.json(
        {
          message:
            "Audio file is not available.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Check the message expiration too.
     */
    if (
      new Date(
        message.expires_at
      ).getTime() <= Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "This audio message has expired.",
        },
        {
          status: 410,
        }
      );
    }

    /*
     * Only use the filename stored in
     * the database. basename() prevents
     * path traversal.
     */
    const safeFilename =
      path.basename(message.audio_path);

    const filePath = path.join(
      VOICE_STORAGE_DIR,
      safeFilename
    );

    /*
     * Make sure the resolved file is
     * actually inside our voice folder.
     */
    const resolvedStorageDir =
      path.resolve(
        VOICE_STORAGE_DIR
      );

    const resolvedFilePath =
      path.resolve(filePath);

    if (
      !resolvedFilePath.startsWith(
        resolvedStorageDir +
          path.sep
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid audio file.",
        },
        {
          status: 400,
        }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        {
          message:
            "Audio file not found.",
        },
        {
          status: 404,
        }
      );
    }

    const audioBuffer =
      fs.readFileSync(filePath);

    const contentType =
      getContentType(filePath);

    return new NextResponse(
      audioBuffer,
      {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length":
            String(audioBuffer.length),
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Audio GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load audio.",
      },
      {
        status: 500,
      }
    );
  }
}