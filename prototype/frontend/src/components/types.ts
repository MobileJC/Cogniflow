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
  rootParentId: string | null; // Parent chat ID (null = primary/root chat)
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  title: string;
  color: string; // Color for this branch
  branchedFromMessageId?: string; // ID of the message that created this branch
}

export interface BranchColor {
  bg: string;
  border: string;
  dark: string;
  stroke: string;
}
