/**
 * ConnectionArrows Component
 * Renders colored arrows connecting parent messages to child branch chatboxes
 */

"use client";

import React from "react";
import { Layer, Message } from "./types";
import { getLayerColor } from "./utils/colorUtils";
import { findParentLayer } from "./utils/treeLayout";

interface ConnectionArrowsProps {
  layers: Layer[];
  messages: Message[];
  messageRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

/**
 * Calculate arrow path between parent message and child layer
 */
const getArrowPath = (
  parent: Layer,
  child: Layer,
  branchedMessageId: string,
  messageRefs: Map<string, HTMLDivElement>,
  containerRef: HTMLDivElement | null,
  zoom: number
): { path: string; markerEnd: string } => {
  // Try to get the position of the specific message that was branched from
  const messageElement = messageRefs.get(branchedMessageId);

  let startX, startY;

  if (messageElement) {
    // Use the specific message position
    const rect = messageElement.getBoundingClientRect();
    const containerRect = containerRef?.getBoundingClientRect();

    if (containerRect) {
      // Calculate position relative to the scaled canvas
      const scrollLeft = containerRef?.scrollLeft || 0;
      const scrollTop = containerRef?.scrollTop || 0;

      // Get message position in canvas coordinates
      startX =
        (rect.left - containerRect.left + scrollLeft) / zoom +
        rect.width / (2 * zoom);
      startY =
        (rect.top - containerRect.top + scrollTop) / zoom +
        rect.height / (2 * zoom);
    } else {
      // Fallback to parent layer center
      startX = parent.x + parent.width / 2;
      startY = parent.y + parent.height / 2;
    }
  } else {
    // Fallback to parent layer center if message ref not found
    startX = parent.x + parent.width / 2;
    startY = parent.y + parent.height / 2;
  }

  // Calculate child layer center for end point
  const childCenterX = child.x + child.width / 2;
  const childCenterY = child.y + child.height / 2;

  // Determine which edge of child layer to connect to
  let endX, endY;
  const dx = childCenterX - startX;
  const dy = childCenterY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    // More horizontal
    if (dx > 0) {
      endX = child.x;
      endY = childCenterY;
    } else {
      endX = child.x + child.width;
      endY = childCenterY;
    }
  } else {
    // More vertical
    if (dy > 0) {
      endX = childCenterX;
      endY = child.y;
    } else {
      endX = childCenterX;
      endY = child.y + child.height;
    }
  }

  // Create a curved path using quadratic bezier
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const path = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

  return { path, markerEnd: "url(#arrowhead)" };
};

export const ConnectionArrows: React.FC<ConnectionArrowsProps> = ({
  layers,
  messages,
  messageRefs,
  containerRef,
  zoom,
}) => {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          className="fill-blue-500 dark:fill-blue-400"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            className="fill-blue-500 dark:fill-blue-400"
          />
        </marker>
      </defs>
      {/* Draw arrows from parent to child layers */}
      {layers.map((layer) => {
        const parentLayer = findParentLayer(layer, layers, messages);
        if (!parentLayer || !layer.rootParentId) return null;
        const { path, markerEnd } = getArrowPath(
          parentLayer,
          layer,
          layer.rootParentId,
          messageRefs.current,
          containerRef.current,
          zoom
        );
        const layerColor = getLayerColor(layer);
        const strokeColor = layerColor ? layerColor.stroke : "rgb(59, 130, 246)";
        return (
          <path
            key={`arrow-${layer.id}`}
            d={path}
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            markerEnd={markerEnd}
            opacity="0.6"
          />
        );
      })}
    </svg>
  );
};
