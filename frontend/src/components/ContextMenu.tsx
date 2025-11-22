
import React from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  show: boolean;
  onClose: () => void;
  onBranch: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, show, onClose, onBranch }) => {
  if (!show) {
    return null;
  }

  const handleBranchClick = () => {
    onBranch();
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-card border border-border rounded-md shadow-lg"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()} 
    >
      <ul className="py-1">
        <li>
          <button
            onClick={handleBranchClick}
            className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent"
          >
            Create new branch
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
