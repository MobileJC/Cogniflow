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
      className="fixed bg-white dark:bg-gray-800 border-2 border-purple-400 dark:border-purple-600 rounded-lg shadow-2xl z-40 flex flex-col hover:shadow-2xl transition-shadow"
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
        className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-b border-purple-300 dark:border-purple-600 cursor-move hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            Keyword Branch
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
            "{selectedText.substring(0, 30)}{selectedText.length > 30 ? "..." : ""}"
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
          title="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-700">
        {branchMessages.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Start a conversation about "{selectedText.substring(0, 20)}
            {selectedText.length > 20 ? "..." : ""}"
          </div>
        ) : (
          <>
            {branchMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-sm p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-600 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-500"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-purple-200 dark:border-purple-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about..."
          className="flex-1 px-3 py-2 text-base rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center justify-center"
          title="Send message"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Footer with Merge Button */}
      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 border-t border-purple-300 dark:border-purple-600">
        <button
          onClick={onMerge}
          className="w-full px-3 py-2 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          title="Merge this branch back to primary chat"
        >
          Merge Back to Primary
        </button>
      </div>
    </div>
  );
};
