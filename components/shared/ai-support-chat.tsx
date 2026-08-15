"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiSupportApi, ChatMessage } from "@/lib/api/ai-support";

const STORAGE_KEY = "easybills:ai-chat";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm the EasyBills AI Assistant. Ask me about airtime, data, wallet funding, electricity payments, or anything else — I'm here 24/7.",
  timestamp: new Date().toISOString(),
};

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [WELCOME_MESSAGE];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

export function AiSupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load from sessionStorage on mount (client only)
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  // Persist to sessionStorage on every change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // sessionStorage unavailable — fail silently, chat still works in-memory
    }
  }, [messages, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || typing) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const reply = await aiSupportApi.getReply(trimmed, nextMessages);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now() + 1}`,
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-40 z-[60] mx-auto flex h-[65vh] max-h-[560px] w-auto max-w-sm flex-col overflow-hidden rounded-3xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-850 shadow-soft-dark sm:right-6 sm:left-auto sm:bottom-28 sm:w-[380px]"
          >
            <div className="flex items-center justify-between gap-3 bg-brand-mesh px-4 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="h-4 w-4 text-brand-200" />
                </span>
                <div>
                  <p className="text-sm font-semibold">EasyBills AI Assistant</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  aria-label="Clear conversation"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 no-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-brand-600 text-white rounded-br-md"
                        : "bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-paper-100 rounded-bl-md"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-ink-100 dark:bg-ink-800 px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 dark:bg-paper-200/40"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-ink-200 dark:border-ink-700 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about airtime, wallet, bills..."
                className="h-11 flex-1 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="px-4 pb-3 text-center text-[10px] text-ink-400 dark:text-paper-200/30">
              AI-powered support · chat is stored only for this browser session
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
        className="fixed bottom-40 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-mesh text-white shadow-glow sm:bottom-8 sm:right-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-ink-950" />}
      </motion.button>
    </>
  );
}
