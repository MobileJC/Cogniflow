// ...existing code...
"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Layer as LayerType, Message } from "@/components/types";
import { ConnectionArrows } from "@/components/ConnectionArrows";
import { Layer } from "@/components/Layer";
import { getNextBranchColor } from "@/components/utils/colorUtils";
import { calculateTreePosition } from "@/components/utils/treeLayout";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [navigationHistory, setNavigationHistory] = useState<
    Array<string | null>
  >([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string; content: string }[]
  >([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Layers state
  const [layers, setLayers] = useState<LayerType[]>(() => [
    {
      id: "layer-root",
      rootParentId: null,
      x: 80,
      y: 80,
      width: 480,
      height: 360,
      z: 1,
      title: "Primary",
      color: "primary", // Primary doesn't have a color
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string>("layer-root");
  const [zoom, setZoom] = useState<number>(1);

  // Dragging refs
  const draggingRef = useRef<{
    layerId: string | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Resizing refs
  const resizingRef = useRef<{
    layerId: string | null;
    startX: number;
    startY: number;
    origWidth: number;
    origHeight: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Refs to track message DOM elements for arrow positioning
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build breadcrumbs based on active layer's rootParentId
  useEffect(() => {
    const buildBreadcrumbs = () => {
      const trail: { id: string; content: string }[] = [];
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      let currentId = activeLayer ? activeLayer.rootParentId : null;
      while (currentId) {
        const parentMessage = messages.find((msg) => msg.id === currentId);
        if (parentMessage) {
          trail.unshift({
            id: parentMessage.id,
            content: parentMessage.content,
          });
          currentId = parentMessage.parentId;
        } else {
          break;
        }
      }
      setBreadcrumbs(trail);
    };
    buildBreadcrumbs();
  }, [activeLayerId, layers, messages]);

  // Utility: get messages visible inside a layer (those whose parentId === layer.rootParentId)
  const messagesForLayer = (layer: LayerType) =>
    messages.filter((m) => m.parentId === layer.rootParentId);

  // Send message inside active layer
  const handleSend = () => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;
    if (input.trim()) {
      const userMessage: Message = {
        id: uuidv4(),
        parentId: activeLayer.rootParentId,
        role: "user",
        content: input,
      };
      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: uuidv4(),
          parentId: activeLayer.rootParentId,
          role: "assistant",
          content: `You said: ${input}`,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }, 350);

      setInput("");
    }
  };

  // When branch clicked inside a layer's assistant message -> create new layer rooted at that message
  const handleBranch = (messageId: string, clickedInLayerId: string) => {
    const maxZ = layers.reduce((acc, l) => Math.max(acc, l.z), 0);
    const clickedLayer =
      layers.find((l) => l.id === clickedInLayerId) || layers[0];

    // Calculate tree-based position
    const { x, y } = calculateTreePosition(clickedLayer, layers, messages);

    // Get color for this branch
    const colorIndex = getNextBranchColor(layers);

    const newLayer: LayerType = {
      id: uuidv4(),
      rootParentId: messageId,
      x,
      y,
      width: 480,
      height: 360,
      z: maxZ + 1,
      title:
        (messages.find((m) => m.id === messageId)?.content || "Branch").slice(
          0,
          40
        ) || "Branch",
      color: colorIndex.toString(),
    };
    setLayers((prev) => [...prev, newLayer]);
    setNavigationHistory((prev) => [...prev, clickedLayer.rootParentId]);
    setActiveLayerId(newLayer.id);
  };

  const bringLayerToFront = (layerId: string) => {
    const maxZ = layers.reduce((acc, l) => Math.max(acc, l.z), 0);
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, z: maxZ + 1 } : l))
    );
    setActiveLayerId(layerId);
  };

  // Layer drag and resize handlers
  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (draggingRef.current) {
        const drag = draggingRef.current;
        const point =
          "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
        if (!point) return;
        // account for zoom: movement in real pixels should be divided by zoom
        const dx = (point.clientX - drag.startX) / zoom;
        const dy = (point.clientY - drag.startY) / zoom;
        setLayers((prev) =>
          prev.map((l) =>
            l.id === drag.layerId
              ? { ...l, x: drag.origX + dx, y: drag.origY + dy }
              : l
          )
        );
      } else if (resizingRef.current) {
        const resize = resizingRef.current;
        const point =
          "touches" in e ? (e as TouchEvent).touches[0] : (e as MouseEvent);
        if (!point) return;
        // account for zoom
        const dx = (point.clientX - resize.startX) / zoom;
        const dy = (point.clientY - resize.startY) / zoom;
        setLayers((prev) =>
          prev.map((l) =>
            l.id === resize.layerId
              ? {
                  ...l,
                  width: Math.max(300, resize.origWidth + dx),
                  height: Math.max(250, resize.origHeight + dy),
                }
              : l
          )
        );
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
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    bringLayerToFront(layerId);
    draggingRef.current = {
      layerId,
      startX: point.clientX,
      startY: point.clientY,
      origX: layer.x,
      origY: layer.y,
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
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) return;
    bringLayerToFront(layerId);
    resizingRef.current = {
      layerId,
      startX: point.clientX,
      startY: point.clientY,
      origWidth: layer.width,
      origHeight: layer.height,
    };
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

  // Helpers: merge/prune similar to before but scoped to active layer rootParentId
  const handleGoBack = () => {
    const previousParentId = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory((prev) => prev.slice(0, -1));
    // find layer that had that rootParentId or switch to root if null
    const target =
      layers.find((l) => l.rootParentId === previousParentId) || layers[0];
    if (target) bringLayerToFront(target.id);
  };

  const handleMerge = () => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;
    const previousParentId = navigationHistory[navigationHistory.length - 1];
    const updatedMessages = messages.map((msg) => {
      if (msg.parentId === activeLayer.rootParentId) {
        return { ...msg, parentId: previousParentId };
      }
      return msg;
    });
    setMessages(updatedMessages);
    handleGoBack();
  };

  const handlePrune = () => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;
    setMessages((prev) =>
      prev.filter((msg) => msg.parentId !== activeLayer.rootParentId)
    );
    handleGoBack();
  };

  // click canvas to deselect (optional)
  const onCanvasClick = () => {
    // keep active if clicked inside layer; clicking canvas background deselects to root
    bringLayerToFront("layer-root");
  };

  const handleLayerClick = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    bringLayerToFront(layerId);
  };

  // Render
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <header className="w-full p-4 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white">
          Trinity Tinder
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`relative transition-all duration-300 bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-1 rounded-full text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                isSidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className={`p-4 ${isSidebarCollapsed ? "hidden" : "block"}`}>
            <p className="text-gray-500 dark:text-gray-400">Sidebar</p>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between p-2 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
            <div className="flex items-center overflow-x-auto whitespace-nowrap px-3">
              <button
                onClick={() => {
                  bringLayerToFront("layer-root");
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-2"
              >
                Primary
              </button>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.id}>
                  <span className="mx-2 text-gray-400">/</span>
                  <button
                    onClick={() => {
                      // find layer for this breadcrumb or create a new focused layer for it
                      const layerFor = layers.find(
                        (l) => l.rootParentId === crumb.id
                      );
                      if (layerFor) bringLayerToFront(layerFor.id);
                    }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white max-w-[200px] truncate"
                  >
                    {crumb.content}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-3 px-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeZoom(zoom - 0.1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  -
                </button>
                <div className="text-sm w-12 text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => changeZoom(zoom + 0.1)}
                  className="px-2 py-1 bg-gray-100 rounded"
                >
                  +
                </button>
              </div>

              {/** Merge / Prune / Go Back for active non-root */}
              {layers.find(
                (l) => l.id === activeLayerId && l.rootParentId !== null
              ) && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMerge}
                    className="text-sm text-green-600"
                  >
                    Merge
                  </button>
                  <button
                    onClick={handlePrune}
                    className="text-sm text-red-600"
                  >
                    Prune
                  </button>
                  {navigationHistory.length > 0 && (
                    <button
                      onClick={handleGoBack}
                      className="text-sm text-blue-600"
                    >
                      Go Back
                    </button>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Canvas area */}
          <main
            className="flex-1 relative overflow-auto bg-white dark:bg-gray-900"
            onWheel={onWheel}
            ref={containerRef}
          >
            {/* canvas background with scale transform */}
            <div
              onClick={onCanvasClick}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
                width: `${100 / zoom}%`,
                height: `${100 / zoom}%`,
              }}
              className="w-full h-full"
            >
              {/* grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(#e6e6e6 1px,transparent 1px),linear-gradient(90deg,#e6e6e6 1px,transparent 1px)] bg-[length:24px_24px] dark:bg-[linear-gradient(#2a2a2a_1px,transparent_1px),linear-gradient(90deg,#2a2a2a_1px,transparent_1px)] pointer-events-none" />

              {/* Connection Arrows */}
              <ConnectionArrows
                layers={layers}
                messages={messages}
                messageRefs={messageRefs}
                containerRef={containerRef}
                zoom={zoom}
              />

              {/* render layers ordered by z */}
              {layers
                .slice()
                .sort((a, b) => a.z - b.z)
                .map((layer) => {
                  const isActive = layer.id === activeLayerId;
                  const msgs = messagesForLayer(layer);
                  return (
                    <Layer
                      key={layer.id}
                      layer={layer}
                      messages={msgs}
                      isActive={isActive}
                      activeLayerId={activeLayerId}
                      input={input}
                      messageRefs={messageRefs}
                      layers={layers}
                      onLayerClick={handleLayerClick}
                      onHeaderDrag={startDrag}
                      onResize={startResize}
                      onInputChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleSend}
                      onSend={handleSend}
                      onBranch={handleBranch}
                    />
                  );
                })}
            </div>
          </main>

          {/* main footer not used (inputs embedded in layers) */}
          <footer className="p-2 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex-shrink-0 text-center text-xs text-gray-500">
            Tip: Use Ctrl/Cmd + mouse roll to zoom in and out
          </footer>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
