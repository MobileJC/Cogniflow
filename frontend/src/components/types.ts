/**
 * Shared types for the Trinity Tinder application
 */

export interface Message {
  id: string;
  parentId: string | null;
  role: "user" | "assistant";
  content: string;
}

export interface Layer {
  id: string;
  rootParentId: string | null; // which branch this layer is rooted at (null = primary)
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  title: string;
  color: string; // Color for this branch
}

export interface BranchColor {
  bg: string;
  border: string;
  dark: string;
  stroke: string;
}
