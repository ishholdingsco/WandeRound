"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, MessageSquare, Trash2, Pencil, Check, X } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Thread } from "@/types";

interface Props {
  threads: Thread[];
  currentThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, title: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ChatSidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onRenameThread,
  isOpen = false,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (thread: Thread, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(thread.id);
    setEditValue(thread.title);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim()) onRenameThread(id, editValue.trim());
    setEditingId(null);
  };

  return (
    <div
      className={cn(
        "w-60 h-full flex flex-col bg-zinc-950 text-zinc-100 flex-shrink-0 select-none",
        "fixed inset-y-0 left-0 z-[999] transition-transform duration-200 md:static md:translate-x-0 md:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <Image
          src="/wanderound-icon.png"
          alt="WandeRound"
          width={24}
          height={24}
          className="flex-shrink-0 [filter:brightness(0)_invert(1)]"
          priority
        />
        <span className="font-semibold text-sm tracking-wide">WandeRound</span>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded hover:bg-zinc-800 text-zinc-400 md:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 pb-3">
        <button
          onClick={onCreateThread}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      <div className="px-3 pb-2">
        <span className="text-[10px] uppercase tracking-widest text-zinc-600 px-1">
          Recent
        </span>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {threads.length === 0 && (
          <p className="text-xs text-zinc-600 px-3 py-2">No chats yet</p>
        )}
        {threads.map((thread) => (
          <div
            key={thread.id}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
              currentThreadId === thread.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200"
            )}
            onClick={() => onSelectThread(thread.id)}
          >
            {editingId === thread.id ? (
              <div
                className="flex items-center gap-1 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(thread.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-zinc-700 text-white text-xs px-2 py-1 rounded outline-none"
                />
                <button
                  onClick={() => saveEdit(thread.id)}
                  className="text-green-400 hover:text-green-300 p-0.5"
                >
                  <Check size={11} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-zinc-500 hover:text-zinc-300 p-0.5"
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <>
                <MessageSquare
                  size={13}
                  className="flex-shrink-0 opacity-50"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium leading-relaxed">
                    {thread.title}
                  </p>
                  <p className="text-[10px] text-zinc-600 leading-none mt-0.5">
                    {formatRelativeTime(thread.updated_at)}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button
                    onClick={(e) => startEdit(thread, e)}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteThread(thread.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
