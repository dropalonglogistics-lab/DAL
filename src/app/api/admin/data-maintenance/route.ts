import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Fetch all routes to identify duplicates and missing data
        const { data: allRoutes, error: fetchError } = await supabase
            .from('routes')
            .select('*');

        if (fetchError) throw fetchError;
        if (!allRoutes) return NextResponse.json({ message: 'No routes found' });

        const seen = new Set();
        const toDelete: string[] = [];
        const toUpdate: any[] = [];

        // 2. Process routes in JS for deduplication and local fixing
        allRoutes.forEach(route => {
            const origin = (route.start_location || '').trim().toLowerCase();
            const dest = (route.destination || '').trim().toLowerCase();
            const key = `${origin}|${dest}`;

            if (key !== '|' && seen.has(key)) {
                toDelete.push(route.id);
            } else if (key !== '|') {
                seen.add(key);
            }

            // Fix origin if null or 'undefined'
            let updatedRoute = { ...route };
            let needsUpdate = false;

            if (!route.start_location || route.start_location === 'undefined') {
                const parts = route.route_title?.split(' to ');
                if (parts && parts.length > 0) {
                    updatedRoute.start_location = parts[0].trim();
                    needsUpdate = true;
                }
            }

            // Backfill fares/durations
            if (!route.fare_price_range_min || route.fare_price_range_min === 0) {
                const duration = route.estimated_travel_time_min || 20;
                if (duration < 15) {
                    updatedRoute.fare_price_range_min = 150;
                    updatedRoute.fare_price_range_max = 200;
                } else if (duration < 30) {
                    updatedRoute.fare_price_range_min = 300;
                    updatedRoute.fare_price_range_max = 450;
                } else {
                    updatedRoute.fare_price_range_min = 500;
                    updatedRoute.fare_price_range_max = 800;
                }
                updatedRoute.estimated_travel_time_min = duration;
                updatedRoute.estimated_travel_time_max = route.estimated_travel_time_max || (duration + 15);
                needsUpdate = true;
            }

            if (needsUpdate) {
                toUpdate.push(updatedRoute);
            }
        });

        // 3. Perform Deletions (Deduplication)
        if (toDelete.length > 0) {
            // Delete in batches if too many
            await supabase.from('routes').delete().in('id', toDelete);
        }

        // 4. Perform Updates
        for (const route of toUpdate) {
            await supabase.from('routes').update({
                start_location: route.start_location,
                fare_price_range_min: route.fare_price_range_min,
                fare_price_range_max: route.fare_price_range_max,
                estimated_travel_time_min: route.estimated_travel_time_min,
                estimated_travel_time_max: route.estimated_travel_time_max,
                road_condition: route.road_condition || 'clear'
            }).eq('id', route.id);
        }

        // 5. Set Popular Routes
        const popularKeywords = ['Rumuokoro', 'Garrison', 'Mile 1', 'Choba', 'Eleme', 'Waterlines'];
        const featuredIds: string[] = [];
        
        allRoutes.forEach(r => {
            if (featuredIds.length < 6) {
                if (popularKeywords.some(k => r.route_title?.includes(k))) {
                    featuredIds.push(r.id);
                }
            }
        });

        if (featuredIds.length > 0) {
            await supabase.from('routes').update({ is_featured: true }).in('id', featuredIds);
        }

        return NextResponse.json({
            success: true,
            deduplicated: toDelete.length,
            updated: toUpdate.length,
            featured: featuredIds.length
        });

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
