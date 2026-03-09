import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import PublicLayout from '@/components/layout/PublicLayout';

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Drop Along Logistics (DAL)',
    description: 'Intelligent Urban Routing & Mobility Platform',
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
                                const theme = localStorage.getItem('theme');
                                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                if (theme === 'dark' || (!theme && systemTheme)) {
                                    document.documentElement.classList.add('dark-mode');
                                    document.body && document.body.classList.add('dark-mode');
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body className={`${dmSans.className} ${syne.variable}`}>
                <PublicLayout>
                    {children}
                </PublicLayout>
            </body>
        </html>
    );
}
