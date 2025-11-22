/**
 * Color management utilities for branch chatboxes
 */

import { BranchColor, Layer } from "../types";

// Color palette for branches
export const BRANCH_COLORS: BranchColor[] = [
  {
    bg: "bg-yellow-100",
    border: "border-yellow-400",
    dark: "dark:bg-yellow-900 dark:border-yellow-600",
    stroke: "rgb(234, 179, 8)",
  },
  {
    bg: "bg-red-100",
    border: "border-red-400",
    dark: "dark:bg-red-900 dark:border-red-600",
    stroke: "rgb(239, 68, 68)",
  },
  {
    bg: "bg-green-100",
    border: "border-green-400",
    dark: "dark:bg-green-900 dark:border-green-600",
    stroke: "rgb(34, 197, 94)",
  },
  {
    bg: "bg-blue-100",
    border: "border-blue-400",
    dark: "dark:bg-blue-900 dark:border-blue-600",
    stroke: "rgb(59, 130, 246)",
  },
  {
    bg: "bg-purple-100",
    border: "border-purple-400",
    dark: "dark:bg-purple-900 dark:border-purple-600",
    stroke: "rgb(168, 85, 247)",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-400",
    dark: "dark:bg-pink-900 dark:border-pink-600",
    stroke: "rgb(236, 72, 153)",
  },
  {
    bg: "bg-indigo-100",
    border: "border-indigo-400",
    dark: "dark:bg-indigo-900 dark:border-indigo-600",
    stroke: "rgb(99, 102, 241)",
  },
  {
    bg: "bg-orange-100",
    border: "border-orange-400",
    dark: "dark:bg-orange-900 dark:border-orange-600",
    stroke: "rgb(249, 115, 22)",
  },
];

/**
 * Get the next available color index for a new branch
 */
export const getNextBranchColor = (layers: Layer[]): number => {
  const usedColors = layers
    .filter((l) => l.color !== "primary")
    .map((l) => parseInt(l.color));
  for (let i = 0; i < BRANCH_COLORS.length; i++) {
    if (!usedColors.includes(i)) return i;
  }
  // If all colors used, cycle back
  return (
    layers.filter((l) => l.color !== "primary").length % BRANCH_COLORS.length
  );
};

/**
 * Get the color info for a layer
 */
export const getLayerColor = (layer: Layer): BranchColor | null => {
  if (layer.color === "primary") return null;
  const colorIndex = parseInt(layer.color);
  return BRANCH_COLORS[colorIndex];
};

/**
 * Get the color info for a branched message
 */
export const getBranchedMessageColor = (
  messageId: string,
  layers: Layer[]
): BranchColor | null => {
  const branchLayer = layers.find((l) => l.rootParentId === messageId);
  if (!branchLayer || branchLayer.color === "primary") return null;
  const colorIndex = parseInt(branchLayer.color);
  return BRANCH_COLORS[colorIndex];
};

/**
 * Check if a message has been branched from
 */
export const isMessageBranched = (
  messageId: string,
  layers: Layer[]
): boolean => {
  return layers.some((l) => l.rootParentId === messageId);
};
