"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Conversation = {
  id: number;
  user_one_id: number;
  user_two_id: number;
  created_at: string;
  expires_at: string;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_type: string;
  text: string | null;
  audio_path: string | null;
  created_at: string;
  expires_at: string;
  mine: boolean;
};

type OtherUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const [recording, setRecording] =
    useState(false);

  const [recordingSeconds, setRecordingSeconds] =
    useState(0);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const recordingTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const cancelRecordingRef =
    useRef(false);

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [otherUser, setOtherUser] =
    useState<OtherUser | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const conversationId =
      params.get("conversationId");

    const userId =
      params.get("userId");

    if (conversationId) {
      openExistingConversation(
        conversationId,
        userId
      );
      return;
    }

    if (userId) {
      startConversation(userId);
      return;
    }

    queueMicrotask(() => {
      setError("No conversation was selected.");
      setLoading(false);
    });
  }, []);

  async function openExistingConversation(
    conversationId: string,
    userId: string | null
  ) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (response.status === 410) {
        setConversation(null);
        setMessages([]);
        setError(
          "This conversation has expired."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to open conversation."
        );
      }

      setConversation(
        data.conversation
      );

      const currentUserId =
        data.currentUserId;

      const formattedMessages =
        (data.messages || []).map(
          (
            item: Omit<Message, "mine">
          ) => ({
            ...item,
            mine:
              item.sender_id ===
              currentUserId,
          })
        );

      setMessages(
        formattedMessages
      );

      if (userId) {
        await loadOtherUser(userId);
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to open conversation."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadOtherUser(
    userId: string
  ) {
    try {
      const response = await fetch(
        `/api/people/${encodeURIComponent(
          userId
        )}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        return;
      }

      setOtherUser(data.user);
    } catch (error) {
      console.error(
        "Unable to load user:",
        error
      );
    }
  }

  async function startConversation(
    userId: string
  ) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: Number(userId),
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start conversation."
        );
      }

      setConversation(
        data.conversation
      );

      setOtherUser(
        data.otherUser
      );

      await loadMessages(
        data.conversation.id
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start conversation."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(
    conversationId: number
  ) {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (response.status === 410) {
        setConversation(null);
        setMessages([]);
        setError(
          "This conversation has expired."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load messages."
        );
      }

      const currentUserId =
        data.currentUserId;

      const formattedMessages =
        (data.messages || []).map(
          (
            item: Omit<Message, "mine">
          ) => ({
            ...item,
            mine:
              item.sender_id ===
              currentUserId,
          })
        );

      setMessages(
        formattedMessages
      );

      if (data.conversation) {
        setConversation(
          data.conversation
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load messages."
      );
    }
  }

  async function sendMessage() {
    const text =
      message.trim();

    if (
      !text ||
      !conversation ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            text,
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (response.status === 410) {
        setConversation(null);
        setMessages([]);
        setError(
          "This conversation has expired."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send message."
        );
      }

      setMessage("");

      await loadMessages(
        conversation.id
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  async function sendVoiceMessage() {
    if (
      !audioBlob ||
      !conversation ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const formData =
        new FormData();

      const mimeType =
        audioBlob.type ||
        "audio/webm";

      let extension = "webm";

      if (
        mimeType.includes("ogg")
      ) {
        extension = "ogg";
      } else if (
        mimeType.includes("mp4")
      ) {
        extension = "mp4";
      } else if (
        mimeType.includes("mpeg")
      ) {
        extension = "mp3";
      } else if (
        mimeType.includes("wav")
      ) {
        extension = "wav";
      }

      const audioFile =
        new File(
          [audioBlob],
          `voice-message.${extension}`,
          {
            type: mimeType,
          }
        );

      formData.append(
        "audio",
        audioFile
      );

      const response = await fetch(
        `/api/conversations/${conversation.id}/messages`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login";
        return;
      }

      if (response.status === 410) {
        setConversation(null);
        setMessages([]);
        setError(
          "This conversation has expired."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send voice message."
        );
      }

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl
        );
      }

      setAudioUrl(null);
      setAudioBlob(null);
      setRecordingSeconds(0);

      await loadMessages(
        conversation.id
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send voice message."
      );
    } finally {
      setSending(false);
    }
  }

  function handleMessageKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  }

  async function startRecording() {
    try {
      setError("");

      if (!conversation) {
        setError(
          "Open a conversation before recording a voice message."
        );
        return;
      }

      if (
        navigator.mediaDevices ===
          undefined ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setError(
          "Your browser does not support microphone recording."
        );
        return;
      }

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl
        );

        setAudioUrl(null);
      }

      setAudioBlob(null);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      let recorder: MediaRecorder;

      try {
        recorder =
          new MediaRecorder(
            stream
          );
      } catch (error) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        throw error;
      }

      audioChunksRef.current =
        [];

      cancelRecordingRef.current =
        false;

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size > 0
          ) {
            audioChunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        if (
          cancelRecordingRef.current
        ) {
          audioChunksRef.current =
            [];

          return;
        }

        const audioBlob =
          new Blob(
            audioChunksRef.current,
            {
              type:
                recorder.mimeType ||
                "audio/webm",
            }
          );

        const url =
          URL.createObjectURL(
            audioBlob
          );

        setAudioBlob(
          audioBlob
        );

        setAudioUrl(url);

        audioChunksRef.current =
          [];

        mediaRecorderRef.current =
          null;
      };

      mediaRecorderRef.current =
        recorder;

      recorder.start();

      setRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current =
        setInterval(() => {
          setRecordingSeconds(
            (previous) =>
              previous + 1
          );
        }, 1000);
    } catch (error) {
      console.error(error);

      setError(
        "Microphone permission was denied or the microphone could not be accessed."
      );
    }
  }

  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    cancelRecordingRef.current =
      false;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();
    }

    setRecording(false);

    if (
      recordingTimerRef.current
    ) {
      clearInterval(
        recordingTimerRef.current
      );

      recordingTimerRef.current =
        null;
    }
  }

  function cancelRecording() {
    cancelRecordingRef.current =
      true;

    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.stop();
    }

    mediaRecorderRef.current =
      null;

    audioChunksRef.current =
      [];

    setRecording(false);
    setRecordingSeconds(0);
    setAudioBlob(null);

    if (
      recordingTimerRef.current
    ) {
      clearInterval(
        recordingTimerRef.current
      );

      recordingTimerRef.current =
        null;
    }

    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );

      setAudioUrl(null);
    }
  }

  function deleteRecordedAudio() {
    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingSeconds(0);
  }

  function formatRecordingTime(
    seconds: number
  ) {
    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;
  }

  useEffect(() => {
    return () => {
      if (
        recordingTimerRef.current
      ) {
        clearInterval(
          recordingTimerRef.current
        );
      }

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl
        );
      }

      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    const interval =
      setInterval(() => {
        loadMessages(
          conversation.id
        );
      }, 3000);

    return () =>
      clearInterval(
        interval
      );
  }, [conversation?.id]);

  return (
    <main className="chat-page">
      <aside className="chat-sidebar">
        <Link
          href="/"
          className="chat-logo"
        >
          <span></span>
          whispr
        </Link>

        <nav className="chat-nav">
          <Link
            href="/dashboard"
            className="chat-nav-item"
          >
            <span>⌂</span>
            Home
          </Link>

          <Link
            href="/messages"
            className="chat-nav-item active"
          >
            <span>◌</span>
            Messages
          </Link>

          <Link
            href="/students"
            className="chat-nav-item"
          >
            <span>♧</span>
            People
          </Link>
        </nav>

        <div className="chat-sidebar-bottom">
          <Link
            href="/"
            className="chat-nav-item"
          >
            <span>↪</span>
            Log out
          </Link>

          <Link
            href="/account"
            className="chat-account"
          >
            <div className="chat-account-avatar">
              ?
            </div>

            <div>
              <strong>
                Account
              </strong>

              <span>
                Your profile
              </span>
            </div>
          </Link>
        </div>
      </aside>

      <section className="chat-main">
        <header className="chat-header">
          <Link
            href="/messages"
            className="chat-back"
            aria-label="Back to messages"
          >
            ←
          </Link>

          <div className="chat-person-avatar">
            ?
          </div>

          <div className="chat-person-info">
            <h1>
              {otherUser?.name ||
                "Conversation"}
            </h1>

            <span>
              {otherUser
                ? `@${otherUser.username}`
                : "Private Whispr"}
            </span>
          </div>

          <button
            type="button"
            className="chat-more"
            aria-label="Conversation options"
          >
            •••
          </button>
        </header>

        <div className="chat-lifetime-notice">
          <span className="chat-lifetime-icon">
            ◷
          </span>

          <div>
            <strong>
              This conversation disappears
              after 24 hours.
            </strong>

            <p>
              The conversation and its
              messages are automatically
              removed.
            </p>
          </div>
        </div>

        <div className="chat-messages">
          {loading ? (
            <div className="chat-empty">
              <div className="chat-empty-symbol">
                ◌
              </div>

              <div className="chat-empty-label">
                LOADING
              </div>

              <h2>
                Opening conversation...
              </h2>

              <p>
                Your private conversation
                is being loaded.
              </p>
            </div>
          ) : error ? (
            <div className="chat-empty">
              <div className="chat-empty-symbol">
                !
              </div>

              <div className="chat-empty-label">
                CONVERSATION
              </div>

              <h2>{error}</h2>

              <p>
                Go back to Messages and
                try again.
              </p>
            </div>
          ) : messages.length ===
            0 ? (
            <div className="chat-empty">
              <div className="chat-empty-symbol">
                ✦
              </div>

              <div className="chat-empty-label">
                PRIVATE CONVERSATION
              </div>

              <h2>
                Start the conversation.
              </h2>

              <p>
                Your messages will appear
                here.
                <br />
                The conversation disappears
                after 24 hours.
              </p>

              <div className="chat-empty-lifetime">
                <span>◷</span>

                <div>
                  <strong>
                    24h lifetime
                  </strong>

                  <small>
                    The conversation expires
                    automatically.
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-message-list">
              {messages.map(
                (item) => (
                  <MessageBubble
                    key={item.id}
                    message={item}
                  />
                )
              )}
            </div>
          )}
        </div>

        {recording && (
          <div className="voice-recording-panel">
            <div className="voice-recording-left">
              <button
                type="button"
                className="voice-cancel"
                onClick={
                  cancelRecording
                }
              >
                ×
              </button>

              <div className="voice-recording-indicator">
                <span></span>
              </div>

              <div className="voice-recording-time">
                {formatRecordingTime(
                  recordingSeconds
                )}
              </div>

              <div className="voice-wave">
                {Array.from({
                  length: 16,
                }).map(
                  (_, index) => (
                    <i
                      key={index}
                    ></i>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              className="voice-send"
              onClick={
                stopRecording
              }
            >
              Stop
              <span>■</span>
            </button>
          </div>
        )}

        {!recording && (
          <div className="chat-composer-area">
            {audioUrl && (
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "12px",
                  marginBottom:
                    "10px",
                }}
              >
                <audio
                  controls
                  src={audioUrl}
                />

                <button
                  type="button"
                  onClick={
                    deleteRecordedAudio
                  }
                >
                  Delete
                </button>

                <button
                  type="button"
                  onClick={
                    sendVoiceMessage
                  }
                  disabled={
                    !audioBlob ||
                    sending ||
                    !conversation
                  }
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>
              </div>
            )}

            <div className="chat-composer">
              <button
                type="button"
                className="chat-attach"
                aria-label="Attach"
              >
                +
              </button>

              <input
                type="text"
                value={message}
                onChange={(
                  event
                ) =>
                  setMessage(
                    event.target
                      .value
                  )
                }
                onKeyDown={
                  handleMessageKeyDown
                }
                placeholder="Whisper something..."
                aria-label="Message"
              />

              <button
                type="button"
                className="chat-voice"
                aria-label="Record voice message"
                onClick={
                  startRecording
                }
                disabled={
                  sending ||
                  !conversation
                }
              >
                ◉
              </button>

              <button
                type="button"
                className="chat-send"
                aria-label="Send message"
                onClick={
                  sendMessage
                }
                disabled={
                  !message.trim() ||
                  sending ||
                  !conversation
                }
              >
                ↑
              </button>
            </div>

            <div className="chat-composer-footer">
              <span>
                ◷ Conversation expires
                after 24 hours
              </span>

              <span>
                Voice messages supported
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function MessageBubble({
  message,
}: {
  message: Message;
}) {
  const remaining =
    getRemainingTime(
      message.expires_at
    );

  return (
    <div
      className={`chat-message-row ${
        message.mine
          ? "mine"
          : "theirs"
      }`}
    >
      <div className="chat-message-content">
        <div className="chat-message-bubble">
          {message.message_type ===
          "audio" ? (
            <audio
              controls
              src={
                message.audio_path ||
                undefined
              }
            />
          ) : (
            message.text
          )}
        </div>

        <div className="chat-message-meta">
          <span className="chat-message-time">
            {remaining.expired
              ? "Expired"
              : `${remaining.hours}h ${remaining.minutes}m left`}
          </span>

          <span className="chat-message-lifetime">
            ◷
          </span>
        </div>
      </div>
    </div>
  );
}

function getRemainingTime(
  expiresAt: string
) {
  const difference =
    new Date(
      expiresAt
    ).getTime() -
    Date.now();

  if (difference <= 0) {
    return {
      expired: true,
      hours: 0,
      minutes: 0,
    };
  }

  const totalMinutes =
    Math.floor(
      difference /
        (1000 * 60)
    );

  return {
    expired: false,
    hours: Math.floor(
      totalMinutes / 60
    ),
    minutes:
      totalMinutes % 60,
  };
}
