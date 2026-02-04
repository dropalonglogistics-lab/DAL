import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Drop Along Logistics (DAL)',
    description: 'Intelligent Urban Routing & Mobility Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Default to light mode, but system preference will be handled by CSS or JS if needed.
    // We can add a script to avoid FOUC for dark mode later if we get advanced.
    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                const theme = localStorage.getItem('theme');
                                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                if (theme === 'dark' || (!theme && systemTheme)) {
                                    document.documentElement.classList.add('dark-mode');
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body className={inter.className}>
                <Navbar />
                <main className="container">
                    {children}
                </main>
            </body>
        </html>
    );
}
