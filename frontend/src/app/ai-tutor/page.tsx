"use client";
import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { sendChat } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ProtectedPage from "@/components/ProtectedPage";

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

// ── Markdown + Math renderer ──────────────────────────────────────────────────
function AiMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      remarkPlugins={[remarkGfm, remarkMath as any]}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rehypePlugins={[rehypeKatex as any]}
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

  // All persistent state lives in ChatContext — survives navigation.
  const { messages, setMessages, thinking, setThinking, subject, setSubject, streamRef, clearStream } = useChat();

  // UI-only state: stays local (no need to persist across navigation).
  const [input, setInput] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    // Instantly resolve any running typewriter before starting a new exchange.
    clearStream();

    const userMsg = { id: Date.now(), role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setThinking(true);

    // Scroll to show the user's message and the thinking dots.
    setTimeout(scrollToBottom, 50);

    try {
      const data = await sendChat(text, subject || undefined, token!);
      setThinking(false);

      const aiMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: "ai", text: "", streaming: true },
      ]);

      // ── Typewriter ─────────────────────────────────────────────────────────
      // ~25 ms/word ≈ 40 words per second. Fast enough to feel live, slow
      // enough to read. The interval runs in ChatContext so it survives if the
      // user navigates away mid-response — history is ready when they return.
      const words = data.response.split(" ");
      let wordIdx = 0;

      streamRef.current = setInterval(() => {
        wordIdx++;
        const partial = words.slice(0, wordIdx).join(" ");
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, text: partial } : m))
        );

        if (wordIdx >= words.length) {
          clearInterval(streamRef.current!);
          streamRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, streaming: false } : m
            )
          );
          scrollToBottom();
        }
      }, 25);
    } catch (err: unknown) {
      setThinking(false);
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
      scrollToBottom();
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
      {/* Full-viewport height: 100vh minus the 64px sticky navbar. Footer is
          hidden on this route (ConditionalFooter), so nothing below this div. */}
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
                Building Strong Concepts
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
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center
                                  text-white text-xs font-bold flex-shrink-0 self-start mt-0.5 shadow-sm">
                    A
                  </div>
                )}

                <div
                  className={`max-w-[80%] md:max-w-[72%] px-4 py-3 text-sm
                    ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}
                >
                  {msg.role === "user" ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <>
                      <AiMarkdown text={msg.text} />
                      {msg.streaming && (
                        <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 align-middle
                                         animate-pulse rounded-sm" />
                      )}
                    </>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center
                                  text-white text-xs font-bold flex-shrink-0 shadow-sm shadow-orange-500/20">
                    U
                  </div>
                )}
              </div>
            ))}

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

            <div aria-hidden="true" />
          </div>
        </div>

        {/* ── Input bar ───────────────────────────────────────────────── */}
        <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0
                        shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={onInput}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything…"
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
            'Aspire AI Tutor' is AI and can make mistakes.
          </p>
        </div>
      </div>
    </ProtectedPage>
  );
}
