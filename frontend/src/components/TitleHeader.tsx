
import React from 'react';

// Define the shape of a Chat object, to be shared across components
export interface Chat {
  id: string;
  parentId: string | null;
  title: string;
}

interface TitleHeaderProps {
  chat: Chat | undefined;
  isEditing: boolean;
  editingValue: string;
  onValueChange: (value: string) => void;
  onStartEditing: (chatId: string, currentTitle: string) => void;
  onSave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({
  chat,
  isEditing,
  editingValue,
  onValueChange,
  onStartEditing,
  onSave,
  onKeyDown,
}) => {
  const handleTitleClick = () => {
    if (chat) {
      onStartEditing(chat.id, chat.title);
    }
  };

  if (!chat) {
    return (
      <header className="flex items-center gap-2 p-4 border-b border-border bg-background flex-shrink-0">
        <h2 className="text-lg font-semibold truncate text-muted-foreground">...</h2>
      </header>
    );
  }

  return (
    <header className="flex items-center gap-2 p-4 border-b border-border bg-background flex-shrink-0">
      {isEditing ? (
        <input
          type="text"
          value={editingValue}
          onChange={(e) => onValueChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={onKeyDown}
          className="text-lg font-semibold bg-transparent border-b-2 border-primary focus:outline-none w-full"
          autoFocus
        />
      ) : (
        <h2 onClick={handleTitleClick} className="text-lg font-semibold cursor-pointer truncate text-foreground">
          {chat.title}
        </h2>
      )}
      <button onClick={handleTitleClick} className="text-muted-foreground hover:text-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.829-2.828z" />
        </svg>
      </button>
    </header>
  );
};

export default TitleHeader;
