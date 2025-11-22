/**
 * Tree layout utilities for automatic positioning of branch chatboxes
 */

import { Layer, Message } from "../types";

// Spacing configuration
export const TREE_CONFIG = {
  horizontalSpacing: 520, // Space between siblings
  verticalSpacing: 150, // Space between levels
};

/**
 * Find parent layer for a given layer based on rootParentId
 */
export const findParentLayer = (
  layer: Layer,
  layers: Layer[],
  messages: Message[]
): Layer | null => {
  if (!layer.rootParentId) return null;
  // rootParentId is the parent chat's ID, so just find the layer with that ID
  return layers.find((l) => l.id === layer.rootParentId) || null;
};

/**
 * Calculate tree-based position for new branch
 */
export const calculateTreePosition = (
  parentLayer: Layer,
  layers: Layer[],
  messages: Message[]
): { x: number; y: number } => {
  // Count how many children the parent layer already has
  const siblingLayers = layers.filter((l) => {
    const parentOfL = findParentLayer(l, layers, messages);
    return parentOfL?.id === parentLayer.id;
  });

  const siblingCount = siblingLayers.length;

  // Calculate position based on tree layout
  // Position children in a row below the parent
  const parentCenterX = parentLayer.x + parentLayer.width / 2;
  const startX =
    parentCenterX - ((siblingCount * TREE_CONFIG.horizontalSpacing) / 2);
  const childX = startX + siblingCount * TREE_CONFIG.horizontalSpacing;
  const childY = parentLayer.y + parentLayer.height + TREE_CONFIG.verticalSpacing;

  return { x: childX, y: childY };
};
