'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('dal-theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(savedTheme);
        } else {
            // Default to dark
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('dal-theme', newTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full transition-all duration-200 
                dark:bg-[#1A1A24] dark:border dark:border-[#2A2A3A] dark:text-[#A1A1AA] dark:hover:text-[#D4A843]
                bg-white border border-[#E4E4E7] text-[#3F3F46] hover:text-[#B8860B]"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
}
