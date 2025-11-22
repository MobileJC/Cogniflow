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
 * Calculate arrow path between parent layer and child layer
 */
const getArrowPath = (
  parent: Layer,
  child: Layer
): string => {
  // Start from the right center of the parent
  const startX = parent.x + parent.width;
  const startY = parent.y + parent.height / 2;

  // End at the left center of the child
  const endX = child.x;
  const endY = child.y + child.height / 2;

  // Create a smooth curved path using cubic bezier
  const controlPoint1X = startX + (endX - startX) * 0.5;
  const controlPoint1Y = startY;
  const controlPoint2X = startX + (endX - startX) * 0.5;
  const controlPoint2Y = endY;

  const path = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

  return path;
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
        {/* Create filters for glow effects */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Create a colored marker for each layer */}
        {layers.map((layer) => {
          if (!layer.rootParentId) return null;
          const layerColor = getLayerColor(layer);
          const strokeColor = layerColor ? layerColor.stroke : "rgb(59, 130, 246)";
          return (
            <marker
              key={`marker-${layer.id}`}
              id={`arrowhead-${layer.id}`}
              markerWidth="12"
              markerHeight="12"
              refX="11"
              refY="6"
              orient="auto"
            >
              <path
                d="M 2 2 L 10 6 L 2 10 L 4 6 Z"
                fill={strokeColor}
                stroke={strokeColor}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </marker>
          );
        })}
      </defs>

      {/* Draw arrows from parent to child layers */}
      {layers.map((layer) => {
        const parentLayer = findParentLayer(layer, layers, messages);
        if (!parentLayer || !layer.rootParentId) return null;

        const path = getArrowPath(parentLayer, layer);
        const layerColor = getLayerColor(layer);
        const strokeColor = layerColor ? layerColor.stroke : "rgb(59, 130, 246)";

        return (
          <g key={`arrow-${layer.id}`}>
            {/* Shadow/glow layer */}
            <path
              d={path}
              stroke={strokeColor}
              strokeWidth="6"
              fill="none"
              opacity="0.2"
              filter="url(#glow)"
            />
            {/* Main arrow */}
            <path
              d={path}
              stroke={strokeColor}
              strokeWidth="3"
              fill="none"
              markerEnd={`url(#arrowhead-${layer.id})`}
              opacity="0.9"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
};
