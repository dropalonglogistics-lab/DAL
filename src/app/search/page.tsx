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
            route_title,
            start_location,
            destination,
            stops_along_the_way,
            vehicle_type_used,
            estimated_travel_time_min,
            estimated_travel_time_max,
            fare_price_range_min,
            fare_price_range_max,
            difficulty_level,
            detailed_directions,
            tips_and_warnings,
            created_at,
            is_featured,
            road_condition
        `)
        .eq('is_featured', true)
        .order('route_title', { ascending: true })
        .limit(6);

    return <SearchPageClient featuredRoutes={featuredRoutes || []} />;
}
