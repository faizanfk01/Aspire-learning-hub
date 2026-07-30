"use client";
import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
  streaming?: boolean;
}

// Conversation history lives ONLY in sessionStorage — it survives page refreshes
// and in-tab navigation, but the browser wipes it automatically when the tab or
// window is closed. It is also cleared explicitly on logout. Never persisted to
// localStorage (would outlive the tab) or the database.
export const CHAT_STORAGE_KEY = "chat_history";

/**
 * Rebuild the conversation as the AI API expects it, straight from sessionStorage.
 * Called on every send so the model always sees the full, current conversation.
 * Excludes the canned welcome message (id 0) and any empty/placeholder bubbles.
 */
export function loadChatHistory(): { role: "user" | "assistant"; content: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m.id !== 0 && m.text && m.text.trim().length > 0)
      .map((m) => ({
        role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      }));
  } catch {
    return [];
  }
}

interface ChatContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  thinking: boolean;
  setThinking: (v: boolean) => void;
  subject: string;
  setSubject: (v: string) => void;
  // lives in context so mid-stream responses survive page navigation
  streamRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
  clearStream: () => void;
  resetChat: () => void;
}

const WELCOME: ChatMessage = {
  id: 0,
  role: "ai",
  text: "**Assalamu Alaikum! Welcome to Aspire Learning Hub.**\n\nI'm your personal AI Tutor — here to help you build **strong concepts**, not just memorise answers.\n\nAsk me anything academic and I'll guide you step by step using thought-provoking questions. Select your subject above for focused help.\n\n*Let's start learning!*",
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [thinking, setThinking] = useState(false);
  const [subject, setSubject] = useState("");
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards the persist effect from running before the initial sessionStorage
  // restore, which would otherwise overwrite a saved conversation with [WELCOME].
  const hydratedRef = useRef(false);

  // Restore the conversation from sessionStorage on mount (page load / refresh).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      // Corrupt payload — fall back to the fresh welcome state.
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
    hydratedRef.current = true;
  }, []);

  // Persist every change back to sessionStorage. A conversation of just the
  // welcome message is treated as "empty" and clears the key entirely.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      if (messages.length <= 1) {
        sessionStorage.removeItem(CHAT_STORAGE_KEY);
      } else {
        // Drop the transient `streaming` flag so a refresh mid-stream doesn't
        // restore a message stuck with a blinking cursor.
        const serializable = messages.map(({ streaming: _streaming, ...m }) => m);
        sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(serializable));
      }
    } catch {
      // sessionStorage unavailable (private mode / quota) — memory still works in-tab.
    }
  }, [messages]);

  const clearStream = () => {
    if (streamRef.current) {
      clearInterval(streamRef.current);
      streamRef.current = null;
    }
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
    );
  };

  const resetChat = () => {
    if (streamRef.current) {
      clearInterval(streamRef.current);
      streamRef.current = null;
    }
    setMessages([WELCOME]);
    setThinking(false);
    setSubject("");
    // Wipe persisted history immediately (also runs on logout via handleLogout).
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore — nothing to clear if storage is unavailable
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        thinking,
        setThinking,
        subject,
        setSubject,
        streamRef,
        clearStream,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
