
import React from 'react';
import { Chat } from './TitleHeader'; // Assuming Chat interface is in TitleHeader.tsx

interface BreadcrumbHeaderProps {
  breadcrumbs: Chat[];
  onBreadcrumbClick: (chatId: string) => void;
}

const BreadcrumbHeader: React.FC<BreadcrumbHeaderProps> = ({ breadcrumbs, onBreadcrumbClick }) => {
  return (
    <header className="flex items-center p-2 border-b border-border bg-muted/40 flex-shrink-0 overflow-x-auto">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          <button onClick={() => onBreadcrumbClick(crumb.id)} className="text-xs font-medium text-muted-foreground hover:text-foreground max-w-[150px] truncate">
            {crumb.title}
          </button>
          {index < breadcrumbs.length - 1 && <span className="mx-2 text-muted-foreground">/</span>}
        </React.Fragment>
      ))}
    </header>
  );
};

export default BreadcrumbHeader;
