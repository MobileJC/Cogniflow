
import React from 'react';

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onBranch: (message: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onBranch }) => {
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
            <div className={`max-w-lg p-4 rounded-xl shadow-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border'}`}>
              {message.content}
              {message.role === 'assistant' && (
                <div className="mt-2">
                  <button onClick={() => onBranch(message)} className="text-xs text-muted-foreground hover:text-foreground">
                    Branch
                  </button>
                </div>
              )}
            </div>
            {message.role === 'user' && (
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    U
                </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default ChatWindow;
