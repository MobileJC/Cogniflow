export const CLIPBOARD_ADD_HIGHLIGHT = 'clipboard:add-highlight';

export type AddHighlightDetail = { text: string; messageId?: string };

export function dispatchAddHighlight(detail: AddHighlightDetail) {
  window.dispatchEvent(new CustomEvent(CLIPBOARD_ADD_HIGHLIGHT, { detail }));
}

