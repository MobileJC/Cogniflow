// ...existing code...
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/Sidebar";
import OverlappingPages from "../components/OverlappingPages";
import TitleHeader, { Chat } from "../components/TitleHeader";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import ChatWindow, { Message } from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { TreeCanvas } from "../components/TreeCanvas";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [isTreeView, setIsTreeView] = useState(false);

  useEffect(() => {
    if (chats.length === 0) {
      const initialChatId = uuidv4();
      const initialChat: Chat = {
        id: initialChatId,
        parentId: null,
        title: "Primary Chat",
      };
      setChats([initialChat]);
      setActiveChatId(initialChatId);
    }
  }, [chats.length]);

  const handleToggleTreeView = () => {
    setIsTreeView((prev) => !prev);
  };

  // Utility: get messages visible inside a layer (those whose parentId === layer.rootParentId)
  // const messagesForLayer = (layer: LayerType) =>
  //   messages.filter((m) => m.parentId === layer.rootParentId);

  // Send message inside active layer
  const handleSend = () => {
    if (input.trim() && activeChatId) {
      const userMessage: Message = {
        id: uuidv4(),
        chatId: activeChatId,
        role: "user",
        content: input,
      };

      const currentMessages = messages.filter((m) => m.chatId === activeChatId);
      if (currentMessages.length === 0) {
        setChats(
          chats.map((c) => (c.id === activeChatId ? { ...c, title: input } : c))
        );
      }

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: activeChatId,
          role: "assistant",
          content: `Mock response to: ${input}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 500);

      setInput("");
    }
  };

  // Send message from tree view
  const handleTreeSend = (chatId: string, content: string) => {
    if (content.trim()) {
      const userMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        role: "user",
        content: content,
      };

      const currentMessages = messages.filter((m) => m.chatId === chatId);
      if (currentMessages.length === 0) {
        setChats(
          chats.map((c) => (c.id === chatId ? { ...c, title: content } : c))
        );
      }

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: chatId,
          role: "assistant",
          content: `Mock response to: ${content}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 500);
    }
  };

  const handleBranchFromSelection = (
    sourceMessage: Message,
    selectedText: string
  ) => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      parentId: sourceMessage.chatId,
      sourceMessageId: sourceMessage.id,
      title: selectedText.substring(0, 40) + "...",
    };
    setChats((prev) => [...prev, newChat]);

    const userMessage: Message = {
      id: uuidv4(),
      chatId: newChatId,
      role: "user",
      content: selectedText,
    };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: `Mock response to: ${selectedText}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);

    setActiveChatId(newChatId);
    setInput("");
  };

  const handleMerge = () => {
    const chatToMerge = activeChat;
    if (!chatToMerge || !chatToMerge.parentId) return;

    const parentId = chatToMerge.parentId;
    const messagesToMerge = messages.filter((m) => m.chatId === chatToMerge.id);

    setMessages((prev) => [
      ...prev.filter((m) => m.chatId !== chatToMerge.id),
      ...messagesToMerge.map((m) => ({ ...m, chatId: parentId })),
    ]);
    setChats((prev) => prev.filter((c) => c.id !== chatToMerge.id));
    setActiveChatId(parentId);
  };

  const handlePrune = () => {
    const chatToPrune = activeChat;
    if (!chatToPrune || !chatToPrune.parentId) return;

    const parentId = chatToPrune.parentId;
    const childIds = chats
      .filter((c) => c.parentId === chatToPrune.id)
      .map((c) => c.id);
    const allIdsToDelete = [chatToPrune.id, ...childIds];

    setMessages((prev) =>
      prev.filter((m) => !allIdsToDelete.includes(m.chatId))
    );
    setChats((prev) => prev.filter((c) => !allIdsToDelete.includes(c.id)));
    setActiveChatId(parentId);
  };

  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingTitleId(chatId);
    setEditingTitleValue(currentTitle);
  };

  const saveTitle = () => {
    if (editingTitleId) {
      setChats(
        chats.map((c) =>
          c.id === editingTitleId ? { ...c, title: editingTitleValue } : c
        )
      );
    }
    setEditingTitleId(null);
    setEditingTitleValue("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") setEditingTitleId(null);
  };

  const breadcrumbs = useMemo(() => {
    const trail: Chat[] = [];
    let currentId = activeChatId;
    while (currentId) {
      const chat = chats.find((c) => c.id === currentId);
      if (chat) {
        trail.unshift(chat);
        currentId = chat.parentId;
      } else {
        break;
      }
    }
    return trail;
  }, [activeChatId, chats]);

  const visibleMessages = messages.filter((msg) => msg.chatId === activeChatId);
  const activeChat = chats.find((c) => c.id === activeChatId);
  const isRootChat = activeChat ? activeChat.parentId === null : true;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <MainHeader title="Trinity Tinder" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
          chats={chats}
          activeChatId={activeChatId}
          onChatClick={setActiveChatId}
          onToggleTreeView={handleToggleTreeView}
        />

        <OverlappingPages
          breadcrumbs={breadcrumbs}
          onPageClick={setActiveChatId}
        />

        <div className="flex flex-col flex-1 min-w-0">
          <TitleHeader
            chat={activeChat}
            isEditing={editingTitleId === activeChatId}
            editingValue={editingTitleValue}
            onValueChange={setEditingTitleValue}
            onStartEditing={startEditingTitle}
            onSave={saveTitle}
            onKeyDown={handleTitleKeyDown}
            onMerge={handleMerge}
            onPrune={handlePrune}
            isRootChat={isRootChat}
          />

          <BreadcrumbHeader
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={setActiveChatId}
          />

          <ChatWindow
            messages={visibleMessages}
            chats={chats}
            onBranchFromSelection={handleBranchFromSelection}
            onChatClick={setActiveChatId}
          />

          <ChatInput
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
          />
        </div>

        {/* Tree View Overlay */}
        {isTreeView && (
          <div className="absolute inset-0 z-50 bg-gradient-to-br from-white/98 via-blue-50/95 to-purple-50/95 backdrop-blur-md">
            <TreeCanvas
              chats={chats}
              messages={messages}
              activeChatId={activeChatId}
              onChatSelect={(chatId) => {
                setActiveChatId(chatId);
                setIsTreeView(false); // Close tree view when clicking a chat
              }}
              onBranchFromSelection={handleBranchFromSelection}
              onSendMessage={handleTreeSend}
            />
            {/* Close button */}
            <button
              onClick={() => setIsTreeView(false)}
              className="absolute top-4 left-4 z-50 p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-full shadow-2xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-110 group"
              title="Close tree view"
            >
              <svg
                className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// ...existing code...
