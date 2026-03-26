import type { Metadata } from 'next';

export const defaultSEO: Metadata = {
    title: {
        template: '%s | DAL',
        default: 'DAL — Move Smarter in Port Harcourt'
    },
    description: 'DAL (Drop Along Logistics) is the leading intelligent urban routing and mobility platform in Port Harcourt. Navigate smarter, earn faster, and get your errands handled instantly.',
    openGraph: {
        type: 'website',
        locale: 'en_NG',
        url: 'https://dal.com',
        siteName: 'DAL',
        title: 'DAL — Move Smarter in Port Harcourt',
        description: 'DAL (Drop Along Logistics) is the leading intelligent urban routing and mobility platform in Port Harcourt. Navigate smarter, earn faster, and get your errands handled instantly.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Drop Along Logistics in Port Harcourt',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DAL — Move Smarter in Port Harcourt',
        description: 'Navigate smarter, earn faster, and get your errands handled instantly.',
        images: ['/og-image.png'],
        creator: '@dalHQ',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dal.com'),
};
