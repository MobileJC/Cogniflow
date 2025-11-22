import React, { useState, useRef, useEffect } from 'react';
import { Chat } from './TitleHeader'; // Import Chat interface
import ContextMenu from './ContextMenu'; // Import the new ContextMenu

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  chats: Chat[]; // Pass chats to find branches
  onBranchFromSelection: (sourceMessage: Message, selectedText: string) => void;
  onChatClick: (chatId: string) => void; // To navigate to the branch
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, chats, onBranchFromSelection, onChatClick }) => {
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; text: string; message: Message; } | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const selectedText = window.getSelection()?.toString();
    if (selectedText && selectedText.trim() !== '') {
      const messageElement = (e.target as HTMLElement).closest('[data-message-id]');
      if (messageElement) {
        const messageId = messageElement.getAttribute('data-message-id');
        const message = messages.find(m => m.id === messageId);
        if (message) {
          setContextMenu({ show: true, x: e.clientX, y: e.clientY, text: selectedText, message });
          return;
        }
      }
    }
    setContextMenu(null);
  };

  const handleBranch = () => {
    if (contextMenu) {
      onBranchFromSelection(contextMenu.message, contextMenu.text);
      closeContextMenu();
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (contextMenu) {
            closeContextMenu();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  return (
    <div 
        ref={chatWindowRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" 
        onContextMenu={handleContextMenu}
    >
      {messages.map((message) => {
        const branchedChats = chats.filter(c => c.sourceMessageId === message.id);

        return (
          <div key={message.id} data-message-id={message.id}>
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{message.content}</p>
              </div>
            </div>
            {branchedChats.length > 0 && (
              <div className="mt-2 flex justify-start">
                <div className="w-2/3 ml-10 space-y-1">
                  {branchedChats.map(branch => (
                    <button 
                      key={branch.id} 
                      onClick={() => onChatClick(branch.id)}
                      className="w-full text-left p-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-150"
                    >
                       <span className="font-semibold text-xs">↪ Branched:</span>
                      <p className="text-sm truncate text-gray-800 dark:text-gray-200">{branch.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          show={contextMenu.show}
          onClose={closeContextMenu}
          onBranch={handleBranch}
        />
      )}
    </div>
  );
};

export default ChatWindow;
