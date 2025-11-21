
import React from 'react';
import { Chat } from './TitleHeader';

interface OverlappingPagesProps {
  breadcrumbs: Chat[];
  onPageClick: (chatId: string) => void;
}

const OverlappingPages: React.FC<OverlappingPagesProps> = ({ breadcrumbs, onPageClick }) => {
  return (
    <div className="flex-shrink-0 w-24 bg-muted/40 border-r border-border flex items-center justify-center relative overflow-hidden">
      {breadcrumbs.slice(0, -1).map((crumb, index) => (
        <div
          key={crumb.id}
          onClick={() => onPageClick(crumb.id)}
          className="absolute bg-card border border-border rounded-lg shadow-sm cursor-pointer transition-all duration-300 hover:z-20"
          style={{
            width: '80%',
            height: '90%',
            transform: `translateX(-50%) translateY(-50%) rotate(2deg) translateX(${index * 8}px)`,
            left: '50%',
            top: '50%',
            zIndex: index,
          }}
        >
          <div className="p-2 text-xs text-muted-foreground truncate">{crumb.title}</div>
        </div>
      ))}
    </div>
  );
};

export default OverlappingPages;
