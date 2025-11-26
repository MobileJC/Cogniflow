
import React, { useEffect, useState } from 'react';
import { Chat } from './TitleHeader';
import SidebarHeader from './sidebar/SidebarHeader';
import ChatTree from './sidebar/ChatTree';
import CapturePanel from './sidebar/CapturePanel';
import { CLIPBOARD_ADD_HIGHLIGHT } from '../lib/events';

/**
 * SidebarProps
 * - isCollapsed: whether the sidebar is collapsed (affects width and labels)
 * - onToggle: collapse/expand the sidebar
 * - chats: list of chats (root and branches) displayed in the tree
 * - activeChatId: currently selected chat id
 * - onChatClick: navigate to a chat when clicked
 * - onToggleTreeView: opens the full-screen tree canvas overlay
 */
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (id: string) => void;
  onToggleTreeView: () => void;
}

/**
 * ChatListItemProps
 * - chat: the chat to render
 * - chats: all chats (used to find children)
 * - depth: indentation level for nested items
 * - onChatClick: navigate to a chat when clicked
 * - activeChatId: highlights the active chat
 * - isCollapsed: compact rendering when true
 */
interface ChatListItemProps {
  chat: Chat;
  chats: Chat[];
  depth: number;
  onChatClick: (id: string) => void;
  activeChatId: string | null;
  isCollapsed: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chat, chats, depth, onChatClick, activeChatId, isCollapsed }) => {
  const children = chats.filter(c => c.parentId === chat.id);
  const paddingLeft = `${1 + depth * 1.5}rem`;

  return (
    <li>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onChatClick(chat.id); }}
        className={`block truncate py-2 rounded-md ${activeChatId === chat.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} ${isCollapsed ? 'text-center px-0' : 'pr-4'}`}
        style={{ paddingLeft: !isCollapsed ? paddingLeft : undefined }}
        title={chat.title}
      >
        {isCollapsed ? chat.title.charAt(0).toUpperCase() : chat.title}
      </a>
      {!isCollapsed && children.length > 0 && (
        <ul className="space-y-1 mt-1">
          {children.map(child => (
            <ChatListItem
              key={child.id}
              chat={child}
              chats={chats}
              depth={depth + 1}
              onChatClick={onChatClick}
              activeChatId={activeChatId}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, chats, activeChatId, onChatClick, onToggleTreeView }) => {
  // Toggle for the "capture" panel that stores highlighted texts within the sidebar only
  const [showCaptureBox, setShowCaptureBox] = useState(false);

  // Placeholder storage for highlighted snippets (to be wired to ChatWindow later)
  const [captured, setCaptured] = useState<Array<{ id: string; text: string; checked: boolean }>>([]);

  // Toggle a snippet's checked state
  const toggleItem = (id: string) => {
    setCaptured(prev => prev.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  // Remove all checked items (Discard button)
  const discardChecked = () => {
    setCaptured(prev => prev.filter(it => !it.checked));
  };

  // Placeholder handler: create secondary branches for all checked items
  // NOTE: This will be wired to backend/ChatWindow later. It intentionally does not navigate away.
  const createBranchesFromChecked = () => {
    const selected = captured.filter(it => it.checked);
    // Placeholder: replace with real integration
    console.log('Create branches from:', selected.map(s => s.text));
  };

  // TEMP: helper to add a sample snippet for demo purposes
  const addSample = () => {
    const id = Math.random().toString(36).slice(2);
    setCaptured(prev => [...prev, { id, text: `Sample highlight #${prev.length + 1}`, checked: false }]);
  };

  // Listen for clipboard additions from ChatWindow (global event bus approach)
  // Event name: 'clipboard:add-highlight' with detail { text: string, messageId?: string }
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ text: string; messageId?: string }>;
      const text = ce.detail?.text?.trim();
      if (!text) return;
      const id = Math.random().toString(36).slice(2);
      // Default to checked = true as requested
      setCaptured(prev => [{ id, text, checked: true }, ...prev]);
    };
    window.addEventListener('clipboard:add-highlight', handler as EventListener);
    return () => window.removeEventListener('clipboard:add-highlight', handler as EventListener);
  }, []);

  return (
    <aside className={`bg-card border-r border-border flex flex-col h-full transition-[width] duration-500 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        onToggleTreeView={onToggleTreeView}
        onToggleCapture={() => setShowCaptureBox((v) => !v)}
      />
      <div
        className={`overflow-y-auto flex-grow transition-opacity transition-transform duration-500 ease-in-out ${
          isCollapsed ? 'opacity-0 -translate-x-2 pointer-events-none select-none' : 'opacity-100 translate-x-0'
        }`}
        aria-hidden={isCollapsed}
      >
        {showCaptureBox ? (
          <CapturePanel
            items={captured}
            isCollapsed={isCollapsed}
            onToggleItem={toggleItem}
            onDiscard={discardChecked}
            onCreateBranches={createBranchesFromChecked}
            onAddSample={addSample}
          />
        ) : (
          <ChatTree
            chats={chats}
            activeChatId={activeChatId}
            onChatClick={onChatClick}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
