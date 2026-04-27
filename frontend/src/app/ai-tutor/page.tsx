"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sendChat } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

const SUBJECTS = [
  "", "Mathematics", "Physics", "Chemistry", "Biology",
  "English", "Urdu", "Computer Science", "Islamiyat",
  "Social Studies", "Accounting", "Economics",
];

const WELCOME: Message = {
  id: 0,
  role: "ai",
  text: "Hello! I'm your AI tutor powered by Groq. Ask me any academic question and I'll walk you through it step by step. Select a subject above for more focused help. 📚",
};

export default function AiTutorPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setThinking(true);

    try {
      const data = await sendChat(text, subject || undefined, token!);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: data.response },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: `Sorry, I couldn't reach the AI service. ${err instanceof Error ? err.message : "Please try again."}`,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Chat header ───────────────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-xl select-none">
            🤖
          </div>
          <div>
            <p className="font-bold text-sm">AI Tutor</p>
            <p className="text-xs text-blue-200">Powered by Groq · Always here to help</p>
          </div>
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="text-sm bg-blue-600 text-white border border-blue-500 rounded-lg
                     px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s || "All Subjects"}</option>
          ))}
        </select>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                🤖
              </div>
            )}

            <div
              className={`max-w-[80%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${msg.role === "user"
                  ? "bg-blue-700 text-white rounded-br-sm shadow-sm"
                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                }`}
            >
              {msg.text}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center
                              text-white text-xs font-bold flex-shrink-0">
                U
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {thinking && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              🤖
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onInput}
            onKeyDown={onKeyDown}
            placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{ resize: "none", maxHeight: "120px" }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent overflow-y-auto"
          />
          <button
            onClick={send}
            disabled={!input.trim() || thinking}
            className="flex-shrink-0 p-3 bg-blue-700 text-white rounded-xl
                       hover:bg-blue-800 border-2 border-transparent hover:border-orange-400
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Send message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
