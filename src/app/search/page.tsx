import { createClient } from '@/utils/supabase/server';
import SearchPageClient from './SearchPageClient';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const origin = typeof params.origin === 'string' ? params.origin : '';
    const destination = typeof params.destination === 'string' ? params.destination : '';

    const cleanOrigin = origin.trim();
    const cleanDest = destination.trim();

    let query = supabase.from('routes').select('*');

    if (cleanOrigin && cleanDest) {
        query = query.or(`origin.ilike.%${cleanOrigin}%,destination.ilike.%${cleanDest}%,origin.ilike.%${cleanDest}%,destination.ilike.%${cleanOrigin}%`);
    } else if (cleanOrigin || cleanDest) {
        const term = cleanOrigin || cleanDest;
        query = query.or(`origin.ilike.%${term}%,destination.ilike.%${term}%`);
    }

    let { data: routes } = await query;

    if (!routes || routes.length === 0) {
        const { data: allRoutes } = await supabase.from('routes').select('*').limit(10);
        routes = allRoutes;
    }

    const resultsTitle = cleanOrigin && cleanDest
        ? `${cleanOrigin} to ${cleanDest}`
        : cleanOrigin || cleanDest
            ? `Routes near ${cleanOrigin || cleanDest}`
            : 'Explore Routes';

    return <SearchPageClient initialRoutes={routes || []} initialTitle={resultsTitle} />;
}
