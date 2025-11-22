/**
 * TreeCanvas Component
 * Tree-based canvas view with draggable, resizable chatboxes, arrows, and branching
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Layer as LayerType } from "./types";
import { Message as ChatMessage } from "./ChatWindow";
import { Chat } from "./TitleHeader";
import { ConnectionArrows } from "./ConnectionArrows";
import { TreeLayer } from "./TreeLayer";
import { getNextBranchColor } from "./utils/colorUtils";
import { calculateTreePosition } from "./utils/treeLayout";

interface TreeCanvasProps {
  chats: Chat[];
  messages: ChatMessage[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onBranchFromSelection: (
    sourceMessage: ChatMessage,
    selectedText: string
  ) => void;
  onSendMessage: (chatId: string, content: string) => void;
}

// Convert Chat to Layer format
const chatToLayer = (
  chat: Chat,
  index: number,
  chats: Chat[],
  colorIndex: string
): LayerType => {
  // Calculate position based on tree structure
  const depth = getDepth(chat, chats);
  const siblingsBeforeThis = chats.filter(
    (c) => c.parentId === chat.parentId && chats.indexOf(c) < index
  ).length;

  const x = 80 + depth * 400;
  const y = 80 + siblingsBeforeThis * 200;

  return {
    id: chat.id,
    rootParentId: chat.parentId, // Use chat's parentId to track parent chat
    x,
    y,
    width: 280,
    height: 120,
    z: index + 1,
    title: chat.title || "Untitled",
    color: chat.parentId === null ? "primary" : colorIndex,
    branchedFromMessageId: chat.branchedFromMessageId, // Store for future use
  };
};

// Calculate depth in tree (how many parents)
const getDepth = (chat: Chat, chats: Chat[]): number => {
  let depth = 0;
  let currentId = chat.parentId;
  while (currentId) {
    depth++;
    const parent = chats.find((c) => c.id === currentId);
    currentId = parent?.parentId || null;
  }
  return depth;
};

// Convert Message format (chatId to parentId structure)
interface LayerMessage {
  id: string;
  parentId: string | null;
  role: "user" | "assistant";
  content: string;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  chats,
  messages,
  activeChatId,
  onChatSelect,
  onBranchFromSelection,
  onSendMessage,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [layerInputs, setLayerInputs] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Dragging and resizing refs
  const draggingRef = useRef<{
    layerId: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizingRef = useRef<{
    layerId: string | null;
    startX: number;
    startY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);

  // Convert chats to layers with colors
  const layers = useMemo(() => {
    return chats.map((chat, index) => {
      let colorIndex = "primary";
      if (chat.parentId !== null) {
        const nextColor = getNextBranchColor(
          chats.slice(0, index).map((c) => chatToLayer(c, index, chats, "0"))
        );
        colorIndex = nextColor.toString();
      }
      return chatToLayer(chat, index, chats, colorIndex);
    });
  }, [chats]);

  // Convert messages to layer format
  const layerMessages: LayerMessage[] = useMemo(() => {
    return messages.map((msg) => ({
      id: msg.id,
      parentId: msg.chatId,
      role: msg.role,
      content: msg.content,
    }));
  }, [messages]);

  // Get messages for a specific layer
  const messagesForLayer = (layer: LayerType) =>
    layerMessages.filter((m) => m.parentId === layer.id);

  // Drag and resize handlers
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current) {
        const drag = draggingRef.current;
        const point =
          "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
        if (!point) return;
        const dx = (point.clientX - drag.startX) / zoom;
        const dy = (point.clientY - drag.startY) / zoom;
        // Update layer position via DOM manipulation for performance
        const layerElement = document.querySelector(
          `[data-layer-id="${drag.layerId}"]`
        ) as HTMLElement;
        if (layerElement) {
          layerElement.style.left = `${drag.origX + dx}px`;
          layerElement.style.top = `${drag.origY + dy}px`;
        }
      } else if (resizingRef.current) {
        const resize = resizingRef.current;
        const point =
          "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
        if (!point) return;
        const dx = (point.clientX - resize.startX) / zoom;
        const dy = (point.clientY - resize.startY) / zoom;
        const layerElement = document.querySelector(
          `[data-layer-id="${resize.layerId}"]`
        ) as HTMLElement;
        if (layerElement) {
          layerElement.style.width = `${Math.max(
            200,
            resize.origWidth + dx
          )}px`;
          layerElement.style.height = `${Math.max(
            100,
            resize.origHeight + dy
          )}px`;
        }
      }
    };

    const onUp = () => {
      draggingRef.current = null;
      resizingRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [zoom]);

  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    layerId: string
  ) => {
    e.stopPropagation();
    const point =
      "touches" in e
        ? (e as React.TouchEvent).touches[0]
        : (e as React.MouseEvent);
    const layerElement = document.querySelector(
      `[data-layer-id="${layerId}"]`
    ) as HTMLElement;
    if (!layerElement) return;

    bringLayerToFront(layerId);
    draggingRef.current = {
      layerId,
      startX: point.clientX,
      startY: point.clientY,
      origX: parseFloat(layerElement.style.left || "0"),
      origY: parseFloat(layerElement.style.top || "0"),
    };
  };

  const startResize = (
    e: React.MouseEvent | React.TouchEvent,
    layerId: string
  ) => {
    e.stopPropagation();
    const point =
      "touches" in e
        ? (e as React.TouchEvent).touches[0]
        : (e as React.MouseEvent);
    const layerElement = document.querySelector(
      `[data-layer-id="${layerId}"]`
    ) as HTMLElement;
    if (!layerElement) return;

    bringLayerToFront(layerId);
    resizingRef.current = {
      layerId,
      startX: point.clientX,
      startY: point.clientY,
      origWidth: layerElement.offsetWidth,
      origHeight: layerElement.offsetHeight,
    };
  };

  const bringLayerToFront = (layerId: string) => {
    const maxZ = Math.max(...layers.map((l) => l.z), 0);
    const layerElement = document.querySelector(
      `[data-layer-id="${layerId}"]`
    ) as HTMLElement;
    if (layerElement) {
      layerElement.style.zIndex = (maxZ + 1).toString();
    }
    onChatSelect(layerId);
  };

  const handleLayerClick = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    bringLayerToFront(layerId);
  };

  // Zoom handlers
  const changeZoom = (next: number) => {
    const z = Math.max(0.3, Math.min(2.5, next));
    setZoom(z);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 0.05 : -0.05;
      changeZoom(zoom + factor);
    }
  };

  // Handle text selection and branch creation
  const handleBranch = (messageId: string, _layerId: string) => {
    const sourceMessage = messages.find((m) => m.id === messageId);
    if (sourceMessage) {
      // Get selected text
      const selection = window.getSelection();
      const selectedText =
        selection?.toString().trim() || sourceMessage.content;
      onBranchFromSelection(sourceMessage, selectedText);
    }
  };

  // Handle input change for a specific layer
  const handleInputChange = (layerId: string, value: string) => {
    setLayerInputs((prev) => ({ ...prev, [layerId]: value }));
  };

  // Handle send message for a specific layer
  const handleSend = (layerId: string) => {
    const input = layerInputs[layerId] || "";
    if (input.trim() && layerId === activeChatId) {
      onSendMessage(layerId, input);
      setLayerInputs((prev) => ({ ...prev, [layerId]: "" }));
    }
  };

  return (
    <main
      className="flex-1 relative overflow-auto"
      onWheel={onWheel}
      ref={containerRef}
    >
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 bg-white p-3 rounded-xl shadow-2xl border-2 border-gray-200">
        <button
          onClick={() => changeZoom(zoom - 0.1)}
          className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 font-bold text-gray-700 shadow-sm transition-all"
        >
          −
        </button>
        <div className="text-sm w-14 text-center font-bold text-gray-700">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => changeZoom(zoom + 0.1)}
          className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg hover:from-gray-200 hover:to-gray-300 font-bold text-gray-700 shadow-sm transition-all"
        >
          +
        </button>
      </div>

      {/* Title for tree view */}
      {/* <div className="absolute top-4 left-20 z-50 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl shadow-2xl border-2 border-blue-200">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Conversation Tree
        </h2>
        <p className="text-xs text-gray-600 mt-1">
          Click any chat card to view and exit
        </p>
      </div> */}

      {/* Canvas background with scale transform */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`,
          minHeight: "2000px",
          minWidth: "2000px",
        }}
        className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30"
      >
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Connection Arrows */}
        <ConnectionArrows
          layers={layers}
          messages={layerMessages}
          messageRefs={messageRefs}
          containerRef={containerRef}
          zoom={zoom}
        />

        {/* Render layers */}
        {layers.map((layer) => {
          const isActive = layer.id === activeChatId;
          const msgs = messagesForLayer(layer);
          return (
            <div
              key={layer.id}
              data-layer-id={layer.id}
              style={{
                position: "absolute",
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                zIndex: layer.z,
              }}
            >
              <TreeLayer
                layer={layer}
                messages={msgs}
                isActive={isActive}
                input={layerInputs[layer.id] || ""}
                messageRefs={messageRefs}
                layers={layers}
                onLayerClick={handleLayerClick}
                onHeaderDrag={startDrag}
                onResize={startResize}
                onBranch={handleBranch}
                onInputChange={handleInputChange}
                onSend={handleSend}
              />
            </div>
          );
        })}
      </div>
    </main>
  );
};
