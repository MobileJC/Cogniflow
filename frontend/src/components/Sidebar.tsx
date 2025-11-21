
import React from 'react';
import { Chat } from './TitleHeader';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, chats, activeChatId, onChatClick }) => {
    const renderChatTree = (parentId: string | null) => {
        return chats
            .filter(chat => chat.parentId === parentId)
            .map(chat => (
                <div key={chat.id} className="ml-4">
                    <button
                        onClick={() => onChatClick(chat.id)}
                        className={`text-left w-full p-2 rounded text-sm hover:bg-accent ${activeChatId === chat.id ? 'bg-accent font-semibold' : ''}`}>
                        {chat.title}
                    </button>
                    {renderChatTree(chat.id)}
                </div>
            ));
    };

  return (
    <div className={`relative transition-all duration-300 bg-background border-r border-border ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <button onClick={onToggle} className="absolute top-1/2 -right-3 z-10 transform -translate-y-1/2 bg-secondary p-1 rounded-full text-secondary-foreground focus:outline-none ring-1 ring-border">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <div className={`p-4 transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        <button className="w-full mb-4 p-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-accent">Toggle Tree View</button>
        <h3 className="text-lg font-semibold mb-2 text-foreground">Chats</h3>
        {renderChatTree(null)}
      </div>
    </div>
  );
};

export default Sidebar;
