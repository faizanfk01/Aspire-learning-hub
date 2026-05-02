"use client";
import { createContext, useContext, useState, useRef, ReactNode } from "react";

export interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
  streaming?: boolean;
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
