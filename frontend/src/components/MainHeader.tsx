
import React from 'react';

interface MainHeaderProps {
  title: string;
}

const MainHeader: React.FC<MainHeaderProps> = ({ title }) => {
  return (
    <header className="w-full p-4 bg-background border-b border-border">
      <h1 className="text-xl font-bold text-center text-foreground">{title}</h1>
    </header>
  );
};

export default MainHeader;
