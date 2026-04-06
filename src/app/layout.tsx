import type { Metadata, Viewport } from 'next';
import './globals.css';
import PublicLayout from '@/components/layout/PublicLayout';
import OneSignalInit from '@/components/OneSignalInit';
import PostHogProvider from '@/components/Providers/PostHogProvider';
import CookieBanner from '@/components/legal/CookieBanner';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';

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
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            try {
                                var theme = localStorage.getItem('theme');
                                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                if (theme === 'dark' || (!theme && prefersDark)) {
                                    document.documentElement.classList.add('dark-mode');
                                } else {
                                    document.documentElement.classList.add('light-mode');
                                }
                            } catch (e) {}
                        })();
                    `
                }} />
            </head>
            <body className="antialiased">
                <PostHogProvider />
                <OneSignalInit />
                <AnalyticsTracker />
                <PublicLayout>
                    {children}
                </PublicLayout>
                <CookieBanner />
            </body>
        </html>
    );
}
