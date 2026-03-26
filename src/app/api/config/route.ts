import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getCachedConfig = unstable_cache(
    async (keyStr: string) => {
        const { data } = await supabase.from('platform_config').select('value').eq('key', keyStr).single();
        return data?.value ?? null;
    },
    ['platform_config_key'],
    { revalidate: 60, tags: ['platform_config'] }
);

export async function GET() {
    try {
        const val = await getCachedConfig('f2_express_live');
        return NextResponse.json({ f2_express_live: val === true || val === 'true' });
    } catch (e) {
        return NextResponse.json({ f2_express_live: false }, { status: 500 });
    }
}
