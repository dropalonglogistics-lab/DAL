'use client';

import { useEffect } from 'react';
import { recordVisit } from '@/app/admin/actions';

/**
 * AnalyticsTracker
 * A silent component that records the user's "Last Visited" timestamp
 * on initial mount. This helps admins track active users in real-time.
 */
export default function AnalyticsTracker() {
    useEffect(() => {
        // Record visit on mount (usually once per session/hard refresh)
        recordVisit();
        
        // Optional: Periodically update if the user stays on the site for a long time
        const interval = setInterval(() => {
            recordVisit();
        }, 1000 * 60 * 10); // Every 10 minutes

        return () => clearInterval(interval);
    }, []);

    return null; // This component has no UI
}
