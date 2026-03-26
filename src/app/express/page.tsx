import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import ComingSoonExpress from '@/components/Express/ComingSoonExpress';
import ExpressLanding from '@/components/Express/ExpressLanding';

export const metadata: Metadata = {
    title: 'Same-Hour Delivery Port Harcourt | DAL Express',
};

export const revalidate = 60; // Cache this route for 60 seconds globally

export default async function ExpressPage() {
    const supabase = await createClient();
    const { data } = await supabase.from('platform_config').select('value').eq('key', 'f2_express_live').single();
    
    const isLive = data?.value === true || data?.value === 'true';

    if (!isLive) return <ComingSoonExpress />;
    return <ExpressLanding />;
}
