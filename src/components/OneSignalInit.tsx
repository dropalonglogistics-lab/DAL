'use client';

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { createClient } from '@/utils/supabase/client';

export default function OneSignalInit() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        let timer: NodeJS.Timeout;

        const connect = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user && process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
                // Wait 30 seconds after detecting an authenticated session
                timer = setTimeout(async () => {
                    try {
                        await OneSignal.init({
                            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
                            allowLocalhostAsSecureOrigin: true,
                            notifyButton: { enable: false } as any
                        } as any);
                        
                        await OneSignal.login(user.id);
                        
                        // Show prompt natively 
                        await OneSignal.Slidedown.promptPushCategories();
                    } catch (err) {
                        console.error('OneSignal initialization failed:', err);
                    }
                }, 30000);
            }
        };

        connect();

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []);

    return null;
}
