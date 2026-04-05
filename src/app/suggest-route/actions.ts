'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { learnNewRoutePattern, processIncidentImpact } from '@/utils/ai-learning'

export async function suggestRoute(formData: FormData) {
    const supabase = await createClient()

    const { data } = await supabase.auth.getUser()
    const user = data?.user
    const userId = user?.id || null

    const type = formData.get('type') as 'route' | 'incident'

    if (type === 'incident') {
        const incidentData = {
            user_id: userId,
            type: formData.get('incidentType') as string,
            description: formData.get('description') as string,
            location_text: formData.get('location') as string,
        }

        const { error } = await supabase
            .from('alerts')
            .insert([{
                reported_by: userId,
                type: incidentData.type,
                description: `${incidentData.location_text}: ${incidentData.description}`,
            }])

        if (error) return { error: error.message }

        // Award Points (Incident/Alert)
        if (user && user.id) {
            await supabase.from('points_history').insert({
                user_id: user.id,
                action: 'alert_submission',
                points_change: 20,
                balance_after: 0,
                description: `Incident Report: ${incidentData.type} at ${incidentData.location_text}`,
            });
        }

        // Conceptual AI Learning
        await processIncidentImpact(incidentData.type, incidentData.description)

        revalidatePath('/')
        revalidatePath('/alerts')
        return { success: true }
    }

    const stopsJSON = formData.get('stopsJSON') as string
    let stops_along_the_way: any[] = [];
    const vehicleTypes = new Set<string>();

    if (stopsJSON) {
        try {
            stops_along_the_way = JSON.parse(stopsJSON);
            // Deduce unique vehicle types
            stops_along_the_way.forEach((stop: any) => {
                if (stop.vehicle) {
                    stop.vehicle.split(',').forEach((v: string) => vehicleTypes.add(v.trim()));
                }
            });
        } catch (e) {
            console.error('Failed to parse stops JSON', e);
        }
    }

    // Role check to determine target table
    let isAdmin = false;
    if (userId) {
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userId).single();
        isAdmin = !!profile?.is_admin;
    }

    const targetTable = isAdmin ? 'routes' : 'route_suggestions';
    const status = isAdmin ? 'approved' : 'pending';

    const routeData: any = {
        route_title: formData.get('routeTitle') as string,
        start_location: formData.get('start_location') as string,
        destination: formData.get('destination') as string,
        vehicle_type_used: (formData.get('vehicle_type_used') as string) || Array.from(vehicleTypes).join(', ') || 'Various',
        fare_price_range_min: parseFloat(formData.get('fareMin') as string) || null,
        fare_price_range_max: parseFloat(formData.get('fareMax') as string) || null,
        estimated_travel_time_min: parseInt(formData.get('timeMin') as string) || null,
        estimated_travel_time_max: parseInt(formData.get('timeMax') as string) || null,
        stops_along_the_way: stops_along_the_way,
        difficulty_level: formData.get('difficulty') as string || 'Moderate',
        road_condition: formData.get('roadCondition') as string || 'Good',
        detailed_directions: formData.get('detailedDirections') as string || '',
        tips_and_warnings: formData.get('tipsAndWarnings') as string || '',
        description: formData.get('description') as string || '',
        status: status
    }

    if (targetTable === 'route_suggestions') {
        routeData.submitted_by = userId;
        routeData.from_location = routeData.start_location;
        routeData.to_location = routeData.destination;
        routeData.expected_fare = routeData.fare_price_range_max?.toString() || '0';
    }

    if (!routeData.start_location || !routeData.destination) {
        return { error: 'Start location and destination are required.' }
    }

    const { error } = await supabase
        .from(targetTable)
        .insert([routeData])

    if (error) {
        return { error: error.message }
    }

    // Award Points (Route Suggestion)
    if (userId) {
        await supabase.from('points_history').insert({
            user_id: userId,
            action: 'route_suggestion',
            points_change: 50,
            balance_after: 0,
            description: `Route Suggestion: ${routeData.start_location} to ${routeData.destination}`,
        });
    }

    // Points are awarded by admin on approval (+50 pts) - Wait, I'll award them on suggest too per plan

    // Conceptual AI Learning
    await learnNewRoutePattern(routeData.start_location, routeData.destination, routeData.vehicle_type_used, routeData.stops_along_the_way || [])

    revalidatePath('/')
    revalidatePath('/community')
    return { success: true, isGuest: !userId }
}
