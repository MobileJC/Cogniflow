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
import { sendChatMessage, mergeChatNodes } from "../lib/api/chatService";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [isTreeView, setIsTreeView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendNodeId, setBackendNodeId] = useState<string | null>(null); // Store backend node_id

  useEffect(() => {
    // Only create initial chat if there are no chats at all
    // Use a function to ensure this only runs once on mount
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
  }, []); // Empty dependency array - only run once on mount

  const handleToggleTreeView = () => {
    setIsTreeView((prev) => !prev);
  };

  // Utility: get messages visible inside a layer (those whose parentId === layer.rootParentId)
  // const messagesForLayer = (layer: LayerType) =>
  //   messages.filter((m) => m.parentId === layer.rootParentId);

  // Send message inside active layer
  const handleSend = async () => {
    if (!input.trim() || !activeChatId || isLoading) return;

    const userMessageContent = input.trim();
    const userMessage: Message = {
      id: uuidv4(),
      chatId: activeChatId,
      role: "user",
      content: userMessageContent,
    };

    // Update chat title if this is the first message
    const currentMessages = messages.filter((m) => m.chatId === activeChatId);
    if (currentMessages.length === 0) {
      setChats(
        chats.map((c) =>
          c.id === activeChatId
            ? { ...c, title: userMessageContent.substring(0, 40) }
            : c
        )
      );
    }

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Get conversation history for context
      const conversationHistory = currentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the current user message to history
      conversationHistory.push({
        role: "user",
        content: userMessageContent,
      });

      // Call the backend API
      // Always use backendNodeId for all chats since backend doesn't track frontend branches
      const response = await sendChatMessage(
        userMessageContent,
        backendNodeId || undefined,
        conversationHistory
      );

      // Store backend node_id for future requests
      if (response.chatId) {
        setBackendNodeId(response.chatId);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: response.messageId || uuidv4(),
        chatId: activeChatId,
        role: "assistant",
        content: response.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");

      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        chatId: activeChatId,
        role: "assistant",
        content: `❌ Error: ${err.message || "Failed to get response from server"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message from tree view
  const handleTreeSend = async (chatId: string, content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      role: "user",
      content: content,
    };

    const currentMessages = messages.filter((m) => m.chatId === chatId);
    if (currentMessages.length === 0) {
      setChats(
        chats.map((c) =>
          c.id === chatId ? { ...c, title: content.substring(0, 40) } : c
        )
      );
    }

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Get conversation history for context
      const conversationHistory = currentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      conversationHistory.push({
        role: "user",
        content: content,
      });

      // Call the backend API
      // Always use backendNodeId for all chats since backend doesn't track frontend branches
      const response = await sendChatMessage(
        content,
        backendNodeId || undefined,
        conversationHistory
      );

      // Store backend node_id for future requests
      if (response.chatId) {
        setBackendNodeId(response.chatId);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: response.messageId || uuidv4(),
        chatId: chatId,
        role: "assistant",
        content: response.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error sending message:", err);

      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        chatId: chatId,
        role: "assistant",
        content: `❌ Error: ${err.message || "Failed to get response from server"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchFromSelection = async (
    sourceMessage: Message,
    selectedText: string
  ) => {
    if (isLoading) return;

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

    setActiveChatId(newChatId);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call backend to get response for the branched conversation
      // Use the backend root node ID since the backend doesn't track frontend branches
      const response = await sendChatMessage(
        selectedText,
        backendNodeId || undefined,
        [{ role: "user", content: selectedText }]
      );

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: response.messageId || uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Error sending branch message:", err);

      // Add error message to chat
      const errorMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: `❌ Error: ${err.message || "Failed to get response from server"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerge = async () => {
    const chatToMerge = activeChat;
    if (!chatToMerge || !chatToMerge.parentId) return;

    const parentId = chatToMerge.parentId;
    const messagesToMerge = messages.filter((m) => m.chatId === chatToMerge.id);

    // Merge messages to parent
    setMessages((prev) => [
      ...prev.filter((m) => m.chatId !== chatToMerge.id),
      ...messagesToMerge.map((m) => ({ ...m, chatId: parentId })),
    ]);

    // Reconnect sub-branches to the parent node (preserve them)
    setChats((prev) =>
      prev
        .filter((c) => c.id !== chatToMerge.id) // Remove the merged chat
        .map((c) =>
          // Reconnect sub-branches to the parent
          c.parentId === chatToMerge.id
            ? { ...c, parentId: parentId }
            : c
        )
    );

    setActiveChatId(parentId);

    // Optional: Call backend merge API (though backend doesn't track frontend branches)
    try {
      await mergeChatNodes(backendNodeId || parentId, chatToMerge.id);
    } catch (err) {
      console.error("Backend merge failed (non-critical):", err);
      // Continue even if backend merge fails since frontend branching is independent
    }
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
            isLoading={isLoading}
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
