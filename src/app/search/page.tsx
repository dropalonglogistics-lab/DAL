import { createClient } from '@/utils/supabase/server';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
    const supabase = await createClient();
    
    // Fetch popular routes for default state
    const { data: featuredRoutes } = await supabase
        .from('routes')
        .select('id, start_location, destination, road_condition, estimated_travel_time_min, estimated_travel_time_max, fare_price_range_min, fare_price_range_max, is_featured')
        .eq('is_featured', true)
        .limit(6);

    return <SearchPageClient featuredRoutes={featuredRoutes || []} />;
}
