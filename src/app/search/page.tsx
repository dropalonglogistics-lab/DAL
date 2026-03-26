import { createClient } from '@/utils/supabase/server';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const start_location = typeof params.start_location === 'string' ? params.start_location : '';
    const destination = typeof params.destination === 'string' ? params.destination : '';

    const cleanOrigin = start_location.trim();
    const cleanDest = destination.trim();

    const ROUTE_COLUMNS = 'id, route_title, start_location, destination, stops_along_the_way, vehicle_type_used, estimated_travel_time_min, estimated_travel_time_max, fare_price_range_min, fare_price_range_max, difficulty_level, detailed_directions, tips_and_warnings, created_at';

    let query = supabase.from('routes').select(ROUTE_COLUMNS);

    if (cleanOrigin && cleanDest) {
        query = query.or(`start_location.ilike.%${cleanOrigin}%,destination.ilike.%${cleanDest}%,start_location.ilike.%${cleanDest}%,destination.ilike.%${cleanOrigin}%`);
    } else if (cleanOrigin || cleanDest) {
        const term = cleanOrigin || cleanDest;
        query = query.or(`start_location.ilike.%${term}%,destination.ilike.%${term}%`);
    }

    let { data: routes } = await query;

    if (!routes || routes.length === 0) {
        const { data: allRoutes } = await supabase.from('routes').select(ROUTE_COLUMNS).limit(20);
        routes = allRoutes;
    }

    const resultsTitle = cleanOrigin && cleanDest
        ? `${cleanOrigin} to ${cleanDest}`
        : cleanOrigin || cleanDest
            ? `Routes near ${cleanOrigin || cleanDest}`
            : 'Explore Routes';

    return <SearchPageClient initialRoutes={routes || []} initialTitle={resultsTitle} />;
}
