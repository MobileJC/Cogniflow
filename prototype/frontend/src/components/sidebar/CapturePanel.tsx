import React from 'react';

type Item = { id: string; text: string; checked: boolean };

type Props = {
  items: Item[];
  isCollapsed: boolean;
  onToggleItem: (id: string) => void;
  onDiscard: () => void;
  onCreateBranches: () => void;
  onAddSample: () => void;
};

export default function CapturePanel({ items, isCollapsed, onToggleItem, onDiscard, onCreateBranches, onAddSample }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 text-sm text-muted-foreground">
        {isCollapsed ? null : (
          <p>Captured highlights (placeholder). This will be populated from the chat window later.</p>
        )}
      </div>
      <div className="px-2 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2">
            No highlights yet.
            {!isCollapsed && (
              <button onClick={onAddSample} className="ml-2 text-primary underline">Add sample</button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 p-2 bg-muted rounded">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleItem(item.id)}
                  className="mt-1"
                  aria-label="Select highlight"
                />
                <span className="text-sm leading-snug break-words">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="p-3 border-t border-border flex items-center justify-end gap-2">
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 text-sm rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
        >
          Discard
        </button>
        <button
          onClick={onCreateBranches}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          Create new branch
        </button>
      </div>
    </div>
  );
}

