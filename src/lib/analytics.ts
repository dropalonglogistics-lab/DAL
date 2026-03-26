import posthog from 'posthog-js';

export const initAnalytics = () => {
    if (typeof window !== 'undefined') {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_mock_analytics_key_dal', {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
            loaded: (ph) => {
                if (process.env.NODE_ENV === 'development') ph.debug(false);
            }
        });
    }
};

export const trackEvent = (name: string, props?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
        posthog.capture(name, props);
    }
};
