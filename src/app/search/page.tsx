import { createClient } from '@/utils/supabase/server';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
    const supabase = await createClient();
    
    // Fetch popular routes for default state
    const { data: featuredRoutes } = await supabase
        .from('routes')
        .select(`
            id,
            name,
            origin,
            destination,
            description,
            legs,
            status,
            upvote_count,
            created_at
        `)
        .eq('status', 'approved')
        .order('name', { ascending: true })
        .limit(6);

    return <SearchPageClient featuredRoutes={featuredRoutes || []} />;
}
