import ShopperRequestClient from './ShopperRequestClient';
import { createClient } from '@/utils/supabase/server';

export default async function ShopperRequestPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data: p } = await supabase.from('profiles').select('wallet_balance, full_name, phone').eq('id', user.id).single();
        profile = p;
    }

    return <ShopperRequestClient user={user} profile={profile} />;
}
