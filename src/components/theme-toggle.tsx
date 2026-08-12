'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light-theme', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme);

    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Dark and Light Theme"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#16212d] text-white transition-all hover:bg-white/10 active:scale-95 shadow-sm"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={20} className="text-indigo-400 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
