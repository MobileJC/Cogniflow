
import React from 'react';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, onInputChange, onSend }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <footer className="p-4 bg-background border-t border-border flex-shrink-0">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 pr-16 text-lg bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Type a message..."
        />
        <button
          onClick={onSend}
          className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default ChatInput;
