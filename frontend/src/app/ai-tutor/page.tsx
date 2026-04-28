"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ProtectedPage from "@/components/ProtectedPage";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
}

const SUBJECTS = [
  "",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Urdu",
  "Computer Science",
  "Islamiyat",
  "Social Studies",
  "Accounting",
  "Economics",
];

const WELCOME: Message = {
  id: 0,
  role: "ai",
  text: "**Assalamu Alaikum! Welcome to Aspire Learning Hub.**\n\nI'm your personal AI Tutor — here to help you build **strong concepts**, not just memorise answers.\n\nAsk me anything academic and I'll guide you step by step using thought-provoking questions. Select your subject above for focused help.\n\n*Let's start learning!*",
};

// ── Markdown renderer ─────────────────────────────────────────────────────────
function AiMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h1: ({ children }: any) => (
          <h1 className="text-base font-bold mt-4 mb-1.5 text-slate-900 border-b border-slate-100 pb-1">{children}</h1>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h2: ({ children }: any) => (
          <h2 className="text-sm font-bold mt-3 mb-1 text-slate-800">{children}</h2>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        h3: ({ children }: any) => (
          <h3 className="text-sm font-semibold mt-2 mb-1 text-slate-700">{children}</h3>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        p: ({ children }: any) => (
          <p className="mb-2 last:mb-0 leading-relaxed text-slate-700">{children}</p>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ul: ({ children }: any) => (
          <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ol: ({ children }: any) => (
          <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        li: ({ children }: any) => (
          <li className="leading-relaxed text-slate-700">{children}</li>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        strong: ({ children }: any) => (
          <strong className="font-semibold text-slate-900">{children}</strong>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        em: ({ children }: any) => (
          <em className="italic text-slate-500">{children}</em>
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ inline, children }: any) =>
          inline ? (
            <code className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono border border-orange-100">
              {children}
            </code>
          ) : (
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl mt-2 mb-2 overflow-x-auto text-xs font-mono leading-relaxed">
              <code>{children}</code>
            </pre>
          ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        blockquote: ({ children }: any) => (
          <blockquote className="border-l-4 border-orange-400 pl-3 italic text-slate-500 my-2 bg-orange-50/50 py-1 pr-2 rounded-r-lg">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-slate-200 my-3" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AiTutorPage() {
  const { token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
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
          text: `**Sorry, I couldn't reach the AI service.**\n\n${
            err instanceof Error ? err.message : "Please try again in a moment."
          }`,
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
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <ProtectedPage>
      <div className="flex flex-col bg-slate-50" style={{ height: "calc(100vh - 64px)" }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between
                        flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center
                            text-white font-bold text-sm flex-shrink-0 shadow-sm">
              A
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">Aspire AI Tutor</p>
              <p className="text-slate-400 text-xs leading-tight">
                Building Strong Concepts · Mardan, KPK
              </p>
            </div>
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400/50" />
          </div>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-sm bg-slate-50 text-slate-700 border border-slate-200 rounded-lg
                       px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400
                       focus:border-orange-400 cursor-pointer transition-colors"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s || "All Subjects"}
              </option>
            ))}
          </select>
        </div>

        {/* ── Messages ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI avatar */}
                {msg.role === "ai" && (
                  <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center
                                  text-white text-xs font-bold flex-shrink-0 self-start mt-0.5 shadow-sm">
                    A
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[80%] md:max-w-[72%] px-4 py-3 text-sm
                    ${msg.role === "user"
                      ? "bubble-user"
                      : "bubble-ai"
                    }`}
                >
                  {msg.role === "user" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <AiMarkdown text={msg.text} />
                  )}
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center
                                  text-white text-xs font-bold flex-shrink-0 shadow-sm shadow-orange-500/20">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {thinking && (
              <div className="flex items-end gap-2.5 justify-start">
                <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center
                                text-white text-xs font-bold flex-shrink-0 shadow-sm">
                  A
                </div>
                <div className="bubble-ai px-4 py-3.5">
                  <div className="flex gap-1.5 items-center">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input bar ───────────────────────────────────────────────── */}
        <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              placeholder="Ask a question… (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{ resize: "none", maxHeight: "120px" }}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm
                         text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                         focus:ring-orange-400 focus:border-orange-400 focus:bg-white
                         overflow-y-auto transition-all"
            />
            <button
              onClick={send}
              disabled={!input.trim() || thinking}
              className="flex-shrink-0 p-3 bg-orange-500 text-white rounded-xl
                         hover:bg-orange-600 border-2 border-transparent hover:border-orange-700
                         disabled:opacity-40 disabled:cursor-not-allowed transition-all
                         shadow-md shadow-orange-500/20 hover:-translate-y-0.5"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </ProtectedPage>
  );
}
