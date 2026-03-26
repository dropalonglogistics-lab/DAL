import { createClient } from '@/utils/supabase/server';
import ComingSoonShopper from '@/components/Shopper/ComingSoonShopper';
import ShopperLanding from '@/components/Shopper/ShopperLanding';

export const revalidate = 60; // 60s global cache

export default async function ShopperPage() {
    const supabase = await createClient();
    const { data } = await supabase.from('platform_config').select('value').eq('key', 'f3_shopper_live').single();
    
    const isLive = data?.value === true || data?.value === 'true';

    if (!isLive) return <ComingSoonShopper />;
    return <ShopperLanding />;
}
