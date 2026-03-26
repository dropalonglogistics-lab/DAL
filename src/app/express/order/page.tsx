import ExpressOrderClient from './ExpressOrderClient';
import { createClient } from '@/utils/supabase/server';

export default async function ExpressOrderPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get per_km_rate from config
    const { data: cfg } = await supabase.from('platform_config').select('value').eq('key', 'f2_per_km_rate').single();
    const perKmRate = parseInt(cfg?.value?.toString() || '200', 10);

    // Get user wallet balance if auth'd
    let profile = null;
    if (user) {
        const { data: p } = await supabase.from('profiles').select('wallet_balance, full_name, phone').eq('id', user.id).single();
        profile = p;
    }

    return <ExpressOrderClient user={user} profile={profile} perKmRate={perKmRate} />;
}
