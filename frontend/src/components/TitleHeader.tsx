
import React from 'react';

// Define the shape of a Chat object, to be shared across components
export interface Chat {
  id: string;
  parentId: string | null;
  sourceMessageId?: string; // The ID of the message this chat branched from
  title: string;
  branchedFromMessageId?: string; // ID of the message that created this branch
}

interface TitleHeaderProps {
  chat: Chat | undefined;
  isEditing: boolean;
  editingValue: string;
  onValueChange: (value: string) => void;
  onStartEditing: (chatId: string, currentTitle: string) => void;
  onSave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMerge: () => void;
  onPrune: () => void;
  isRootChat: boolean;
}

const TitleHeader: React.FC<TitleHeaderProps> = ({
  chat,
  isEditing,
  editingValue,
  onValueChange,
  onStartEditing,
  onSave,
  onKeyDown,
  onMerge,
  onPrune,
  isRootChat,
}) => {
  const handleTitleClick = () => {
    if (chat && !isEditing) {
      onStartEditing(chat.id, chat.title);
    }
  };

  if (!chat) {
    return (
      <header className="flex items-center justify-between p-4 border-b border-border bg-background flex-shrink-0 h-[69px]">
        <h2 className="text-lg font-semibold truncate text-muted-foreground">...</h2>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-background flex-shrink-0 h-[69px]">
      <div className="flex items-center gap-2 flex-grow min-w-0">
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
          <h2 onClick={handleTitleClick} className="text-lg font-semibold cursor-pointer truncate text-foreground" title={chat.title}>
            {chat.title}
          </h2>
        )}
        <button onClick={handleTitleClick} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.829-2.828z" />
          </svg>
        </button>
      </div>
      
      {!isRootChat && (
        <div className="flex items-center gap-2 pl-4 flex-shrink-0">
          <span className="text-sm text-muted-foreground">Merge?</span>
          <button
            onClick={onMerge}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white shadow-xs hover:bg-green-600"
            title="Merge into parent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button
            onClick={onPrune}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white shadow-xs hover:bg-red-600"
            title="Prune this branch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default TitleHeader;
