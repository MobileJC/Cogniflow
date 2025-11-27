import React from 'react';

type Props = {
  isCollapsed: boolean;
  onToggle: () => void;
  onToggleTreeView: () => void;
  onToggleCapture: () => void;
};

// Header controls for the sidebar: title, capture toggle, tree toggle, collapse toggle
export default function SidebarHeader({ isCollapsed, onToggle, onToggleTreeView, onToggleCapture }: Props) {
  return (
    <div className="p-4 flex items-center justify-between flex-shrink-0">
      {!isCollapsed && (
        <h2 className="text-lg font-semibold transition-opacity duration-300 ease-out delay-100 opacity-100">
          Chats
        </h2>
      )}
      <div className="flex items-center gap-2">
        {isCollapsed ? (
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" title="Expand sidebar" aria-label="Expand sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <div className="flex items-center gap-2 transition-all duration-300 ease-out delay-150 opacity-100 translate-x-0">
            <button
              onClick={onToggleCapture}
              className="text-muted-foreground hover:text-foreground"
              title="Toggle captured highlights"
              aria-label="Toggle captured highlights"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="4" rx="1"/>
                <path d="M9 2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/>
              </svg>
            </button>
            <button onClick={onToggleTreeView} className="text-muted-foreground hover:text-foreground" title="Open tree view" aria-label="Open tree view">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 18v-9a4 4 0 0 0-4-4H3"/>
              </svg>
            </button>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground" title="Collapse sidebar" aria-label="Collapse sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
