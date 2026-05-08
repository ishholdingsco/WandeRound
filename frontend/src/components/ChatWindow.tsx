"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Send, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

function ThinkingAccordion({ steps }: { steps: string[] }) {
  const [open, setOpen] = useState(false);
  if (!steps?.length) return null;
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {open ? "Hide" : "Show"} reasoning ({steps.length} steps)
      </button>
      {open && (
        <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100 text-[11px] text-zinc-500 space-y-1 max-h-44 overflow-y-auto">
          {steps.map((step, i) => (
            <p key={i} className="font-mono whitespace-pre-wrap break-all leading-relaxed">
              {step}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  isLast,
  streaming,
}: {
  msg: Message;
  isLast: boolean;
  streaming: boolean;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-zinc-900 text-white rounded-br-none"
            : "bg-white border border-zinc-100 text-zinc-800 rounded-bl-none shadow-sm"
        )}
      >
        {!isUser &&
          msg.thinking_steps &&
          msg.thinking_steps.length > 0 && (
            <ThinkingAccordion steps={msg.thinking_steps} />
          )}

        {isLast && streaming && !msg.content ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 size={13} className="animate-spin" />
            <span className="text-xs">Thinking...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        )}

        {!isUser && msg.geojson && <MapView geojson={msg.geojson} />}
      </div>
    </div>
  );
}

interface Props {
  messages: Message[];
  isStreaming: boolean;
  onSendMessage: (input: string) => void;
  hasThread: boolean;
  onCreateThread: () => void;
}

export function ChatWindow({
  messages,
  isStreaming,
  onSendMessage,
  hasThread,
  onCreateThread,
}: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  if (!hasThread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            WandeRound
          </h1>
          <p className="text-sm text-zinc-500 max-w-xs">
            Plan your next trip with AI-powered geospatial intelligence
          </p>
        </div>
        <button
          onClick={onCreateThread}
          className="px-5 py-2.5 bg-zinc-900 text-white text-sm rounded-xl hover:bg-zinc-700 transition-colors font-medium"
        >
          Start planning
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 min-w-0 overflow-hidden">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-6 space-y-4"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              Describe a trip and I'll help you plan it
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            isLast={i === messages.length - 1}
            streaming={isStreaming}
          />
        ))}
      </div>

      {/* Input */}
      <div className="px-8 py-4 bg-white border-t border-zinc-100">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder="Plan a 2-day trip to Yogyakarta..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white disabled:opacity-50 overflow-hidden"
            style={{ minHeight: "48px", maxHeight: "128px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-400 mt-2.5">
          Powered by DeepSeek · OpenStreetMap
        </p>
      </div>
    </div>
  );
}
