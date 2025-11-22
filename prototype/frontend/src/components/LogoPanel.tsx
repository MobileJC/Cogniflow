import React from 'react';

interface LogoPanelProps {
  isCollapsed: boolean;
}

const LogoPanel: React.FC<LogoPanelProps> = ({ isCollapsed }) => {
  return (
    <div className="bg-card border-b border-border flex items-center justify-center p-3">
      <img
        src="/logo.png"
        alt="Logo"
        className={isCollapsed ? 'h-12 w-12 object-contain' : 'h-48 w-48 object-contain'}
      />
    </div>
  );
};

export default LogoPanel;
