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
            route_title,
            start_location,
            vehicle_type_used,
            fare_price_range_min,
            fare_price_range_max,
            estimated_travel_time_min,
            estimated_travel_time_max,
            difficulty_level,
            stops_along_the_way,
            detailed_directions,
            tips_and_warnings,
            legs,
            status,
            fare_min,
            fare_max,
            duration_minutes,
            road_condition,
            is_featured
        `)
        .eq('status', 'approved')
        .eq('is_featured', true)
        .order('name', { ascending: true })
        .limit(6);

    return <SearchPageClient featuredRoutes={featuredRoutes || []} />;
}
