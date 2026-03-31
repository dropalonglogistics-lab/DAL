import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, DM_Sans } from 'next/font/google';
import './globals.css';
import PublicLayout from '@/components/layout/PublicLayout';
import OneSignalInit from '@/components/OneSignalInit';
import PostHogProvider from '@/components/Providers/PostHogProvider';

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-heading',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Drop Along Logistics (DAL)',
    description: 'Intelligent Urban Routing & Mobility Platform',
    icons: { icon: '/dal-logo-light.png' },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('dal-theme') || 'dark';
                                document.documentElement.classList.add(theme);
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body className="antialiased">
                <PostHogProvider />
                <OneSignalInit />
                <PublicLayout>
                    {children}
                </PublicLayout>
            </body>
        </html>
    );
}
