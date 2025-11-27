import React from 'react';
import { Chat } from '../TitleHeader';

type Props = {
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (id: string) => void;
  isCollapsed: boolean;
};

function ChatListItem({ chat, chats, depth, onChatClick, activeChatId, isCollapsed }: any) {
  const children = chats.filter((c: Chat) => c.parentId === chat.id);
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
          {children.map((child) => (
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
}

export default function ChatTree({ chats, activeChatId, onChatClick, isCollapsed }: Props) {
  const rootChats = chats.filter((chat) => chat.parentId === null);
  return (
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
  );
}

