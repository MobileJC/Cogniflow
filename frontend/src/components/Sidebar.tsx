
import React from 'react';
import { Chat } from './TitleHeader';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (id: string) => void;
  onToggleTreeView: () => void;
}

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
  const rootChats = chats.filter(chat => chat.parentId === null);

  return (
    <aside className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && <h2 className="text-lg font-semibold">Chats</h2>}
        <div className="flex items-center gap-2">
          <button onClick={onToggleTreeView} className="text-muted-foreground hover:text-foreground">
            {/* Tree Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M18 18v-9a4 4 0 0 0-4-4H3"/>
            </svg>
          </button>
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            )}
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-grow">
        <ul className="space-y-1 p-2">
          {rootChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              chats={chats}
              depth={0}
              onChatClick={onChatClick}
              activeChatId={activeChatId}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
