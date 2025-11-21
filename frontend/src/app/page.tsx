
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from 'uuid';
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/Sidebar";
import OverlappingPages from "../components/OverlappingPages";
import TitleHeader, { Chat } from "../components/TitleHeader";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import ChatWindow, { Message } from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  useEffect(() => {
    if (chats.length === 0) {
      const initialChatId = uuidv4();
      const initialChat: Chat = { id: initialChatId, parentId: null, title: 'Primary Chat' };
      setChats([initialChat]);
      setActiveChatId(initialChatId);
    }
  }, [chats.length]);

  const handleSend = () => {
    if (input.trim() && activeChatId) {
      const userMessage: Message = {
        id: uuidv4(),
        chatId: activeChatId,
        role: "user",
        content: input,
      };
      
      const currentMessages = messages.filter(m => m.chatId === activeChatId);
      if (currentMessages.length === 0) {
        setChats(chats.map(c => c.id === activeChatId ? { ...c, title: input } : c));
      }

      setMessages(prev => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: activeChatId,
          role: "assistant",
          content: `Mock response to: ${input}`,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 500);

      setInput("");
    }
  };

  const handleBranch = (sourceMessage: Message) => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      parentId: sourceMessage.chatId,
      title: `Branch from "${sourceMessage.content.substring(0, 20)}..."`
    };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newChatId);
  };
  
  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingTitleId(chatId);
    setEditingTitleValue(currentTitle);
  };

  const saveTitle = () => {
    if (editingTitleId) {
      setChats(chats.map(c => c.id === editingTitleId ? { ...c, title: editingTitleValue } : c));
    }
    setEditingTitleId(null);
    setEditingTitleValue("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') setEditingTitleId(null);
  };

  const breadcrumbs = useMemo(() => {
    const trail: Chat[] = [];
    let currentId = activeChatId;
    while (currentId) {
      const chat = chats.find(c => c.id === currentId);
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
  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <MainHeader title="Trinity Tinder" />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
          chats={chats}
          activeChatId={activeChatId}
          onChatClick={setActiveChatId}
        />
        
        <OverlappingPages breadcrumbs={breadcrumbs} onPageClick={setActiveChatId} />

        <div className="flex flex-col flex-1 min-w-0">
          <TitleHeader
            chat={activeChat}
            isEditing={editingTitleId === activeChatId}
            editingValue={editingTitleValue}
            onValueChange={setEditingTitleValue}
            onStartEditing={startEditingTitle}
            onSave={saveTitle}
            onKeyDown={handleTitleKeyDown}
          />

          <BreadcrumbHeader breadcrumbs={breadcrumbs} onBreadcrumbClick={setActiveChatId} />

          <ChatWindow messages={visibleMessages} onBranch={handleBranch} />

          <ChatInput input={input} onInputChange={setInput} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
