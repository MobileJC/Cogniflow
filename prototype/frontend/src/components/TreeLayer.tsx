/**
 * TreeLayer Component
 * Layer component for tree view with text selection and context menu for branching
 */

"use client";

import React, { useState, useEffect } from "react";
import { Layer as LayerType } from "./types";
import {
  getBranchedMessageColor,
  isMessageBranched,
  BRANCH_COLORS,
} from "./utils/colorUtils";
import ContextMenu from "./ContextMenu";

interface Message {
  id: string;
  parentId: string | null;
  role: "user" | "assistant";
  content: string;
}

interface TreeLayerProps {
  layer: LayerType;
  messages: Message[];
  isActive: boolean;
  input: string;
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  layers: LayerType[];
  onLayerClick: (e: React.MouseEvent, layerId: string) => void;
  onHeaderDrag: (
    e: React.MouseEvent | React.TouchEvent,
    layerId: string
  ) => void;
  onResize: (e: React.MouseEvent | React.TouchEvent, layerId: string) => void;
  onBranch: (messageId: string, layerId: string) => void;
  onInputChange: (layerId: string, value: string) => void;
  onSend: (layerId: string) => void;
}

export const TreeLayer: React.FC<TreeLayerProps> = ({
  layer,
  isActive,

  onLayerClick,
  onHeaderDrag,
  onResize,
}) => {
  // Get layer color for visual styling
  const isPrimary = layer.color === "primary";
  const layerColor =
    !isPrimary && layer.color ? BRANCH_COLORS[parseInt(layer.color)] : null;

  return (
    <div
      onClick={(e) => onLayerClick(e, layer.id)}
      onMouseDown={(e) => onHeaderDrag(e, layer.id)}
      onTouchStart={(e) => onHeaderDrag(e, layer.id)}
      className={`
        absolute cursor-move
        rounded-xl shadow-lg
        transform transition-all duration-200
        hover:scale-105 hover:shadow-2xl
        ${isActive ? "ring-4 ring-blue-500 ring-opacity-60" : ""}
        ${
          layerColor
            ? `${layerColor.bg} ${layerColor.border} border-3`
            : "bg-gradient-to-br from-gray-50 to-gray-100 border-3 border-gray-300"
        }
      `}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Title card - centered */}
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        {/* Title */}
        <h3
          className={`
            text-lg font-bold leading-snug
            px-3
            ${layerColor ? "text-gray-900" : "text-gray-800"}
          `}
        >
          {layer.title}
        </h3>

        {/* Active badge */}
        {isActive && (
          <div className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-md">
            Active
          </div>
        )}
      </div>

      {/* Optional resize handle - minimal */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize(e, layer.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onResize(e, layer.id);
        }}
        className="absolute bottom-1 right-1 w-3 h-3 cursor-se-resize opacity-20 hover:opacity-60 transition-opacity"
      >
        <svg
          className="w-full h-full text-gray-700"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M14 14V10l-4 4h4z M14 14V6l-8 8h8z" />
        </svg>
      </div>
    </div>
  );
};
