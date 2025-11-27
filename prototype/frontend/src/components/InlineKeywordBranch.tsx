/**
 * InlineKeywordBranch Component
 * Small floating chatbox that appears next to a selected keyword/message
 * Allows continuing conversation with a branch and merging back to primary chat
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Message } from "./ChatWindow";
import { Chat } from "./TitleHeader";
import Markdown from "./Markdown";

interface InlineKeywordBranchProps {
  branchChat: Chat;
  branchMessages: Message[];
  selectedText: string;
  sourceMessageId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onMerge: () => void;
  onSendMessage: (content: string) => void;
  isSending?: boolean;
}

export const InlineKeywordBranch: React.FC<InlineKeywordBranchProps> = ({
  branchChat,
  branchMessages,
  selectedText,
  sourceMessageId,
  position,
  onClose,
  onMerge,
  onSendMessage,
  isSending = false,
}) => {
  const [input, setInput] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pos, setPos] = useState({ x: Math.max(20, position.x), y: Math.max(20, position.y) });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug: log messages when they change
  useEffect(() => {
    console.log(`[InlineKeywordBranch] Messages for chat ${branchChat.id}:`, branchMessages);
  }, [branchMessages, branchChat.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [branchMessages]);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onSendMessage(input);
        setInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dragging logic
  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = 'touches' in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
    if (containerRef.current) {
      setDragOffset({
        x: point.clientX - pos.x,
        y: point.clientY - pos.y,
      });
    }

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const movePoint = 'touches' in moveEvent ? (moveEvent as TouchEvent).touches[0] : (moveEvent as MouseEvent);
      const newX = Math.max(0, movePoint.clientX - dragOffset.x);
      const newY = Math.max(0, movePoint.clientY - dragOffset.y);
      setPos({ x: newX, y: newY });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed z-40 flex flex-col rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-black/30 shadow-lg overflow-hidden"
      style={{
        left: `${Math.min(pos.x, window.innerWidth - 520)}px`,
        top: `${Math.min(pos.y, window.innerHeight - 520)}px`,
        width: "500px",
        height: "500px",
        maxHeight: "calc(100vh - 40px)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="flex items-center justify-between gap-3 px-4 py-3 cursor-move"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            KB
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Keyword Branch</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">"{selectedText.substring(0, 40)}{selectedText.length > 40 ? '...' : ''}"</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onMerge}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-white/5 border border-white/10 dark:border-black/20 rounded-full text-sm text-green-700 dark:text-green-300 hover:brightness-105 transition"
            title="Merge back to primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M20 12H8M14 6l-6 6 6 6" />
            </svg>
            Merge
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/5 transition"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-transparent">
        {branchMessages.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300 italic px-2 py-3">
            Start a conversation about "{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}"
          </div>
        ) : (
          <>
            {branchMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm text-gray-700 dark:text-gray-200">AI</div>
                    <div className="max-w-[78%] bg-white/80 dark:bg-[#111827]/60 border border-white/10 dark:border-black/20 p-3 rounded-xl shadow-sm text-sm text-gray-900 dark:text-gray-100">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="flex items-end">
                    <div className="max-w-[78%] bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 rounded-xl shadow-md text-sm">
                      <p className="break-words">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-transparent border-t border-white/10 dark:border-black/20">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a follow-up..."
            className="flex-1 px-4 py-2 rounded-full bg-white/90 dark:bg-gray-800/80 border border-white/10 dark:border-black/20 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 active:scale-95 text-white shadow-md transition-transform disabled:opacity-50"
            title="Send message"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Footer with Merge Button (kept for accessibility) */}
      <div className="px-4 py-3 bg-transparent">
        <button
          onClick={onMerge}
          className="w-full px-3 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          title="Merge this branch back to primary chat"
        >
          Merge Back to Primary
        </button>
      </div>
    </div>
  );
};
