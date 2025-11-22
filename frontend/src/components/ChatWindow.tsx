
import React, { useState, useEffect } from 'react';
import ContextMenu from './ContextMenu';

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onBranchFromSelection: (sourceMessage: Message, selectedText: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onBranchFromSelection }) => {
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, sourceMessage: null as Message | null, selectedText: '' });

  const handleContextMenu = (sourceMessage: Message) => (event: React.MouseEvent) => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && sourceMessage.role === 'assistant') {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, show: true, sourceMessage, selectedText });
    }
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleBranch = () => {
    if (contextMenu.sourceMessage && contextMenu.selectedText) {
      onBranchFromSelection(contextMenu.sourceMessage, contextMenu.selectedText);
    }
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-background">
      <div className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    A
                </div>
            )}
            <div 
              onContextMenu={handleContextMenu(message)}
              className={`max-w-lg p-4 rounded-xl shadow-sm cursor-text ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border'}`}>
              {message.content}
            </div>
            {message.role === 'user' && (
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    U
                </div>
            )}
          </div>
        ))}
      </div>
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        show={contextMenu.show}
        onClose={closeContextMenu}
        onBranch={handleBranch}
      />
    </main>
  );
};

export default ChatWindow;
