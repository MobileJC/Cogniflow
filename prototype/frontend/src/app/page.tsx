// ...existing code...
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/Sidebar";
import LogoPanel from "../components/LogoPanel";
import OverlappingPages from "../components/OverlappingPages";
import TitleHeader, { Chat } from "../components/TitleHeader";
import BreadcrumbHeader from "../components/BreadcrumbHeader";
import ChatWindow, { Message } from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { TreeCanvas } from "../components/TreeCanvas";
import {
  getRootNodeId,
  chatWithNode,
  branchFromNode,
  getNode,
  mergeNodes,
  summarizeBranch,
} from "../lib/api";

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [isTreeView, setIsTreeView] = useState(false);
  // Backend integration state: map frontend chats to backend node IDs
  const [chatNodeMap, setChatNodeMap] = useState<Record<string, string>>({});
  const [rootNodeId, setRootNodeId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [inlineBranchChatId, setInlineBranchChatId] = useState<string | null>(null);

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

      // Resolve backend root node and map it to the initial chat
      (async () => {
        try {
          const rid = await getRootNodeId();
          setRootNodeId(rid);
          setChatNodeMap((prev) => ({ ...prev, [initialChatId]: rid }));
        } catch (e: any) {
          setApiError(e?.message || "Failed to connect to backend");
        }
      })();
    }
  }, []); // Empty dependency array - only run once on mount

  const handleToggleTreeView = () => {
    setIsTreeView((prev) => !prev);
  };

  // Load messages when switching active chat if empty
  useEffect(() => {
    (async () => {
      if (!activeChatId) return;
      const nodeId = chatNodeMap[activeChatId];
      const hasMessages = messages.some((m) => m.chatId === activeChatId);
      if (!nodeId || hasMessages) return;
      try {
        const node = await getNode(nodeId);
        const loaded: Message[] = node.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: uuidv4(),
            chatId: activeChatId,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
        if (loaded.length) setMessages((prev) => [...prev, ...loaded]);
      } catch {
        // ignore
      }
    })();
  }, [activeChatId, chatNodeMap, messages]);

  // Utility: get messages visible inside a layer (those whose parentId === layer.rootParentId)
  // const messagesForLayer = (layer: LayerType) =>
  //   messages.filter((m) => m.parentId === layer.rootParentId);

  // Send message inside active layer
  const handleSend = async () => {
    if (!input.trim() || !activeChatId) return;

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

    // Look up or fallback to root node mapping
    let nodeId = chatNodeMap[activeChatId] || rootNodeId;
    if (!nodeId) {
      try {
        nodeId = await getRootNodeId();
        setRootNodeId(nodeId);
        setChatNodeMap((prev) => ({ ...prev, [activeChatId]: nodeId! }));
      } catch (e: any) {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: activeChatId,
          role: "assistant",
          content: `Error: ${e?.message || "Failed to reach backend"}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }
    }

    try {
      const reply = await chatWithNode(nodeId!, userMessageContent);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: activeChatId,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: activeChatId,
        role: "assistant",
        content: `Error: ${e?.message || "Chat failed"}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  // Send message from tree view
  const handleTreeSend = async (chatId: string, content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      chatId: chatId,
      role: "user",
      content: content,
    };
    setMessages((prev) => [...prev, userMessage]);

    let nodeId = chatNodeMap[chatId] || rootNodeId;
    if (!nodeId) {
      try {
        nodeId = await getRootNodeId();
        setRootNodeId(nodeId);
        setChatNodeMap((prev) => ({ ...prev, [chatId]: nodeId! }));
      } catch (e: any) {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId,
          role: "assistant",
          content: `Error: ${e?.message || "Failed to reach backend"}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }
    }

    try {
      const reply = await chatWithNode(nodeId!, content);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId,
        role: "assistant",
        content: `Error: ${e?.message || "Chat failed"}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  const handleBranchFromSelection = async (
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

    (async () => {
      try {
        // Map parent chat -> backend node
        let parentNodeId = chatNodeMap[sourceMessage.chatId] || rootNodeId;
        if (!parentNodeId) {
          parentNodeId = await getRootNodeId();
          setRootNodeId(parentNodeId);
        }
        // Create backend branch
        const branchId = await branchFromNode(parentNodeId!, {
          carry_messages: true,
        });
        setChatNodeMap((prev) => ({ ...prev, [newChatId]: branchId }));

        // Add the user's selected text to the branch and get AI reply
        const userMessage: Message = {
          id: uuidv4(),
          chatId: newChatId,
          role: "user",
          content: selectedText,
        };
        setMessages((prev) => [...prev, userMessage]);

        const reply = await chatWithNode(branchId, selectedText);
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: newChatId,
          role: "assistant",
          content: reply,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (e: any) {
        const assistantMessage: Message = {
          id: uuidv4(),
          chatId: newChatId,
          role: "assistant",
          content: `Error: ${e?.message || "Branch/chat failed"}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setActiveChatId(newChatId);
        setInput("");
      }
    })();
  };

  const handleInlineBranchCreate = async (
    sourceMessage: Message,
    selectedText: string,
    position: { x: number; y: number }
  ) => {
    const newChatId = uuidv4();
    console.log(`[handleInlineBranchCreate] Creating inline branch with ID: ${newChatId}, text: "${selectedText}"`);
    setInlineBranchChatId(newChatId);
    const newChat: Chat = {
      id: newChatId,
      parentId: sourceMessage.chatId,
      sourceMessageId: sourceMessage.id,
      title: selectedText.substring(0, 30),
    };
    setChats((prev) => [...prev, newChat]);

    try {
      // Map parent chat -> backend node
      let parentNodeId = chatNodeMap[sourceMessage.chatId] || rootNodeId;
      if (!parentNodeId) {
        parentNodeId = await getRootNodeId();
        setRootNodeId(parentNodeId);
      }
      // Create backend branch
      const branchId = await branchFromNode(parentNodeId!, {
        carry_messages: true,
      });
      console.log(`[handleInlineBranchCreate] Backend branch created with ID: ${branchId}`);
      setChatNodeMap((prev) => ({ ...prev, [newChatId]: branchId }));

      // Add the user's selected text to the branch and get AI reply
      const userMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "user",
        content: selectedText,
      };
      console.log(`[handleInlineBranchCreate] Adding user message to branch`);
      setMessages((prev) => [...prev, userMessage]);

      const reply = await chatWithNode(branchId, selectedText);
      console.log(`[handleInlineBranchCreate] Got AI response: "${reply.substring(0, 50)}..."`);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      console.error(`[handleInlineBranchCreate] Error: ${e?.message}`);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: `Error: ${e?.message || "Branch/chat failed"}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

  const handleMerge = async () => {
    const chatToMerge = activeChat;
    if (!chatToMerge || !chatToMerge.parentId) return;

    const parentId = chatToMerge.parentId;
    const messagesToMerge = messages.filter((m) => m.chatId === chatToMerge.id);

    const sourceNode = chatNodeMap[chatToMerge.id];
    const targetNode = chatNodeMap[parentId];
    if (sourceNode && targetNode) {
      try {
        await mergeNodes(targetNode, sourceNode);
        const node = await getNode(targetNode);
        const loaded: Message[] = node.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: uuidv4(),
            chatId: parentId,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
        setMessages((prev) => [
          ...prev.filter(
            (m) => m.chatId !== parentId && m.chatId !== chatToMerge.id
          ),
          ...loaded,
        ]);
      } catch {
        // Fallback to local merge
        setMessages((prev) => [
          ...prev.filter((m) => m.chatId !== chatToMerge.id),
          ...messagesToMerge.map((m) => ({ ...m, chatId: parentId })),
        ]);
      }
    }

    // Reconnect sub-branches to the parent node (preserve them)
    setChats((prev) =>
      prev
        .filter((c) => c.id !== chatToMerge.id) // Remove the merged chat
        .map((c) =>
          // Reconnect sub-branches to the parent
          c.parentId === chatToMerge.id ? { ...c, parentId: parentId } : c
        )
    );

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

  const handleInlineBranchSendMessage = async (
    branchChatId: string,
    content: string
  ): Promise<string> => {
    console.log(`[handleInlineBranchSendMessage] Sending message to branch ${branchChatId}: "${content}"`);
    const userMessage: Message = {
      id: uuidv4(),
      chatId: branchChatId,
      role: "user",
      content: content,
    };
    setMessages((prev) => [...prev, userMessage]);

    let nodeId = chatNodeMap[branchChatId];
    if (!nodeId) {
      const err = `No node mapped for chat ${branchChatId}`;
      console.error(`[handleInlineBranchSendMessage] Error: ${err}`);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: branchChatId,
        role: "assistant",
        content: `Error: ${err}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      throw new Error(err);
    }

    try {
      const reply = await chatWithNode(nodeId, content);
      console.log(`[handleInlineBranchSendMessage] Got response: "${reply.substring(0, 50)}..."`);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: branchChatId,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      return reply;
    } catch (e: any) {
      console.error(`[handleInlineBranchSendMessage] Chat error: ${e?.message}`);
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: branchChatId,
        role: "assistant",
        content: `Error: ${e?.message || "Chat failed"}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      throw e;
    }
  };

  const handleInlineBranchMerge = async (branchChatId: string): Promise<void> => {
    const chatToMerge = chats.find((c) => c.id === branchChatId);
    if (!chatToMerge || !chatToMerge.parentId) return;

    const parentId = chatToMerge.parentId;
    const messagesToMerge = messages.filter((m) => m.chatId === branchChatId);

    const sourceNode = chatNodeMap[branchChatId];
    const targetNode = chatNodeMap[parentId];
    if (sourceNode && targetNode) {
      try {
        await mergeNodes(targetNode, sourceNode);
        const node = await getNode(targetNode);
        const loaded: Message[] = node.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            id: uuidv4(),
            chatId: parentId,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
        setMessages((prev) => [
          ...prev.filter(
            (m) => m.chatId !== parentId && m.chatId !== branchChatId
          ),
          ...loaded,
        ]);
      } catch {
        // Fallback to local merge
        setMessages((prev) => [
          ...prev.filter((m) => m.chatId !== branchChatId),
          ...messagesToMerge.map((m) => ({ ...m, chatId: parentId })),
        ]);
      }
    }

    // Remove the merged inline chat and reconnect sub-branches to parent
    setChats((prev) =>
      prev
        .filter((c) => c.id !== branchChatId) // Remove the merged chat
        .map((c) =>
          // Reconnect sub-branches to the parent
          c.parentId === branchChatId ? { ...c, parentId: parentId } : c
        )
    );
  };

  const handleSummarize = async () => {
    const chatToSummarize = activeChat;
    if (!chatToSummarize) return;
    const sourceNode = chatNodeMap[chatToSummarize.id] || rootNodeId;
    if (!sourceNode) return;

    const newChatId = uuidv4();
    const newChat: Chat = {
      id: newChatId,
      parentId: chatToSummarize.id,
      title: `Summary of ${chatToSummarize.title}`,
    };
    setChats((prev) => [...prev, newChat]);

    try {
      const branchId = await summarizeBranch(sourceNode);
      setChatNodeMap((prev) => ({ ...prev, [newChatId]: branchId }));
      const node = await getNode(branchId);
      const loaded: Message[] = node.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          id: uuidv4(),
          chatId: newChatId,
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      if (loaded.length) setMessages((prev) => [...prev, ...loaded]);
    } catch (e: any) {
      const assistantMessage: Message = {
        id: uuidv4(),
        chatId: newChatId,
        role: "assistant",
        content: `Error: ${e?.message || "Summarize failed"}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setActiveChatId(newChatId);
    }
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
      <MainHeader title="Cogniflow" />

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <LogoPanel isCollapsed={isSidebarCollapsed} />
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!isSidebarCollapsed)}
            chats={chats}
            activeChatId={activeChatId}
            onChatClick={setActiveChatId}
            onToggleTreeView={handleToggleTreeView}
          />
        </div>

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
            onSummarize={handleSummarize}
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
            onInlineBranchCreate={handleInlineBranchCreate}
            onInlineBranchSendMessage={handleInlineBranchSendMessage}
            onInlineBranchMerge={handleInlineBranchMerge}
            inlineBranchChatId={inlineBranchChatId}
            allMessages={messages}
            onInlineBranchClose={() => setInlineBranchChatId(null)}
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
