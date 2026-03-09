import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PublicLayout from '@/components/layout/PublicLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Drop Along Logistics (DAL)',
    description: 'Intelligent Urban Routing & Mobility Platform',
    icons: { icon: '/dal-logo.png' },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('theme');
                                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                if (theme === 'dark' || (!theme && prefersDark)) {
                                    document.documentElement.classList.add('dark-mode');
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body className={inter.className}>
                <PublicLayout>
                    {children}
                </PublicLayout>
            </body>
        </html>
    );
}
