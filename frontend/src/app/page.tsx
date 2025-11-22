
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
  const [isTreeView, setIsTreeView] = useState(false);

  useEffect(() => {
    if (chats.length === 0) {
      const initialChatId = uuidv4();
      const initialChat: Chat = { id: initialChatId, parentId: null, title: 'Primary Chat' };
      setChats([initialChat]);
      setActiveChatId(initialChatId);
    }
  }, [chats.length]);

  const handleToggleTreeView = () => {
    setIsTreeView(prev => !prev);
  };

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

  const handleBranchFromSelection = (sourceMessage: Message, selectedText: string) => {
    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      parentId: sourceMessage.chatId,
      title: selectedText.substring(0, 40) + "..."
    };
    setChats(prev => [...prev, newChat]);

    const userMessage: Message = {
      id: uuidv4(),
      chatId: newChatId,
      role: "user",
      content: selectedText,
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: `Mock response to: ${selectedText}`,
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);

    setActiveChatId(newChatId);
    setInput("");
  };

  const handleMerge = () => {
    const chatToMerge = activeChat;
    if (!chatToMerge || !chatToMerge.parentId) return;
    
    const parentId = chatToMerge.parentId;
    const messagesToMerge = messages.filter(m => m.chatId === chatToMerge.id);
    
    setMessages(prev => [...prev.filter(m => m.chatId !== chatToMerge.id), ...messagesToMerge.map(m => ({ ...m, chatId: parentId }))]);
    setChats(prev => prev.filter(c => c.id !== chatToMerge.id));
    setActiveChatId(parentId);
  };

  const handlePrune = () => {
    const chatToPrune = activeChat;
    if (!chatToPrune || !chatToPrune.parentId) return;

    const parentId = chatToPrune.parentId;
    const childIds = chats.filter(c => c.parentId === chatToPrune.id).map(c => c.id);
    const allIdsToDelete = [chatToPrune.id, ...childIds];

    setMessages(prev => prev.filter(m => !allIdsToDelete.includes(m.chatId)));
    setChats(prev => prev.filter(c => !allIdsToDelete.includes(c.id)));
    setActiveChatId(parentId);
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
            onMerge={handleMerge}
            onPrune={handlePrune}
            isRootChat={isRootChat}
          />

          <BreadcrumbHeader breadcrumbs={breadcrumbs} onBreadcrumbClick={setActiveChatId} />

          <ChatWindow messages={visibleMessages} onBranchFromSelection={handleBranchFromSelection} />

          <ChatInput input={input} onInputChange={setInput} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
