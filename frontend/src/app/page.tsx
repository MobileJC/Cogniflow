
"use client";

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  parentId: string | null;
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<string | null>>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; content: string }[]>([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const buildBreadcrumbs = () => {
      const trail: { id: string; content: string }[] = [];
      let currentId = activeParentId;
      while (currentId) {
        const parentMessage = messages.find(msg => msg.id === currentId);
        if (parentMessage) {
          trail.unshift({ id: parentMessage.id, content: parentMessage.content });
          currentId = parentMessage.parentId;
        } else {
          break; 
        }
      }
      setBreadcrumbs(trail);
    };
    buildBreadcrumbs();
  }, [activeParentId, messages]);

  const handleSend = () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: uuidv4(),
        parentId: activeParentId,
        role: "user",
        content: input,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Mock assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: uuidv4(),
          parentId: activeParentId,
          role: "assistant",
          content: `You said: ${input}`,
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }, 500);

      setInput("");
    }
  };

  const handleBranch = (messageId: string) => {
    setNavigationHistory(prev => [...prev, activeParentId]);
    setActiveParentId(messageId);
  };

  const handleGoBack = () => {
    const previousParentId = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory(prev => prev.slice(0, -1));
    setActiveParentId(previousParentId);
  };

  const handleBreadcrumbClick = (messageId: string | null) => {
    const newHistory: Array<string | null> = [];
    let currentId = messageId;
    while (currentId !== null) {
      const parentMessage = messages.find(msg => msg.id === currentId);
      if (parentMessage) {
        newHistory.unshift(parentMessage.parentId);
        currentId = parentMessage.parentId;
      } else {
        break;
      }
    }
    setNavigationHistory(newHistory);
    setActiveParentId(messageId);
  };

  const handleMerge = () => {
    if (activeParentId) {
      const previousParentId = navigationHistory[navigationHistory.length - 1];
      const updatedMessages = messages.map(msg => {
        if (msg.parentId === activeParentId) {
          return { ...msg, parentId: previousParentId };
        }
        return msg;
      });
      setMessages(updatedMessages);
      handleGoBack();
    }
  };

  const handlePrune = () => {
    if (activeParentId) {
      setMessages(messages.filter(msg => msg.parentId !== activeParentId));
      handleGoBack();
    }
  };

  const visibleMessages = messages.filter((msg) => msg.parentId === activeParentId);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Top Header for Team Name */}
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white">Trinity Tinder</h1>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <div className={`relative transition-all duration-300 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-1 rounded-full text-gray-600 dark:text-gray-300 focus:outline-none"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
          </button>
          <div className={`p-4 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <p className="text-gray-500 dark:text-gray-400">Sidebar</p>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Second Header (Breadcrumbs and Actions) */}
          <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center overflow-x-auto whitespace-nowrap">
                <button onClick={() => handleBreadcrumbClick(null)} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Primary</button>
                {breadcrumbs.map((crumb) => (
                    <React.Fragment key={crumb.id}>
                    <span className="mx-2 text-gray-400">/</span>
                    <button onClick={() => handleBreadcrumbClick(crumb.id)} className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white max-w-[200px] truncate">
                        {crumb.content}
                    </button>
                    </React.Fragment>
                ))}
            </div>
            {activeParentId && (
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <button 
                  onClick={handleMerge}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  Merge
                </button>
                <button 
                  onClick={handlePrune}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Prune
                </button>
                {navigationHistory.length > 0 && <button 
                  onClick={handleGoBack} 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go Back
                </button>}
              </div>
            )}
          </header>

          {/* Main Chat Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                  )}
                  <div
                    className={`max-w-lg p-4 rounded-xl ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"}`}>
                    {message.content}
                    {message.role === 'assistant' && (
                      <div className="mt-2">
                        <button 
                          onClick={() => handleBranch(message.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Branch
                        </button>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">U</div>
                  )}
                </div>
              ))}
            </div>
          </main>

          {/* Footer (Input) */}
          <footer className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full p-4 pr-16 text-lg bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSend}
                className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
