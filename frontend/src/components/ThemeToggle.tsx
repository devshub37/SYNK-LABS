'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 sm:p-2 rounded-full border border-glass-border bg-surface hover:bg-accent-light text-foreground transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center"
      title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
      )}
    </button>
  );
}
