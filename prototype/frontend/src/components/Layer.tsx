/**
 * Layer Component
 * Represents an individual chatbox/layer with messages, input, and resize functionality
 */

"use client";

import React from "react";
import { Layer as LayerType, Message } from "./types";
import {
  getBranchedMessageColor,
  isMessageBranched,
} from "./utils/colorUtils";

interface LayerProps {
  layer: LayerType;
  messages: Message[];
  isActive: boolean;
  activeLayerId: string;
  input: string;
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  layers: LayerType[];
  onLayerClick: (e: React.MouseEvent, layerId: string) => void;
  onHeaderDrag: (
    e: React.MouseEvent | React.TouchEvent,
    layerId: string
  ) => void;
  onResize: (e: React.MouseEvent | React.TouchEvent, layerId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onBranch: (messageId: string, layerId: string) => void;
}

export const Layer: React.FC<LayerProps> = ({
  layer,
  messages,
  isActive,
  activeLayerId,
  input,
  messageRefs,
  layers,
  onLayerClick,
  onHeaderDrag,
  onResize,
  onInputChange,
  onKeyDown,
  onSend,
  onBranch,
}) => {
  return (
    <div
      onClick={(e) => onLayerClick(e, layer.id)}
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        zIndex: layer.z,
      }}
      className={`absolute rounded-lg shadow-lg border ${
        isActive ? "ring-2 ring-blue-400" : "ring-0"
      } bg-white dark:bg-gray-800 overflow-hidden`}
    >
      {/* header (drag handle) */}
      <div
        onMouseDown={(e) => onHeaderDrag(e, layer.id)}
        onTouchStart={(e) => onHeaderDrag(e, layer.id)}
        className="cursor-move px-3 py-2 bg-gray-50 dark:bg-gray-700 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-indigo-500 text-white rounded-sm flex items-center justify-center text-xs">
            C
          </div>
          <div className="text-sm font-medium truncate max-w-[240px]">
            {layer.title}
          </div>
        </div>
        <div className="text-xs text-gray-500">{isActive ? "Active" : ""}</div>
      </div>

      {/* messages inside layer */}
      <div className="p-3 overflow-auto h-[calc(100%-112px)]">
        <div className="space-y-3">
          {messages.map((message) => {
            const isBranched = isMessageBranched(message.id, layers);
            const branchColor = isBranched
              ? getBranchedMessageColor(message.id, layers)
              : null;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-600 rounded-full flex-shrink-0" />
                )}
                <div
                  ref={(el) => {
                    if (el) {
                      messageRefs.current.set(message.id, el);
                    } else {
                      messageRefs.current.delete(message.id);
                    }
                  }}
                  className={`p-2 rounded-md max-w-[260px] ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : isBranched && branchColor
                      ? `${branchColor.bg} ${branchColor.dark} text-gray-900 dark:text-white border-2 ${branchColor.border} ${branchColor.dark}`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  {message.content}
                  {message.role === "assistant" && (
                    <div className="mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBranch(message.id, layer.id);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Branch
                      </button>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                    U
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* footer input specific to this layer */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700 flex gap-2 items-center">
        <input
          value={activeLayerId === layer.id ? input : ""}
          onChange={(e) => {
            if (activeLayerId === layer.id) onInputChange(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeLayerId === layer.id) onKeyDown(e);
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-full bg-white dark:bg-gray-800 border focus:outline-none"
        />
        <button
          onClick={() => {
            if (activeLayerId === layer.id) onSend();
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded-full"
        >
          Send
        </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={(e) => onResize(e, layer.id)}
        onTouchStart={(e) => onResize(e, layer.id)}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-tl-md"
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      >
        <svg
          className="absolute bottom-0.5 right-0.5 w-3 h-3 text-gray-600 dark:text-gray-300"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M14 14V6l-8 8h8z" />
        </svg>
      </div>
    </div>
  );
};
