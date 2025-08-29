import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-surface border-b border-slate-700">
      <div className="container mx-auto px-4 md:px-8 py-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
          Virtual Wardrobe
        </h1>
        <p className="text-sm text-text-secondary mt-1">Built by Harsh</p>
      </div>
    </header>
  );
};