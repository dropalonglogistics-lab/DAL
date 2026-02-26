'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { learnNewRoutePattern, processIncidentImpact } from '@/utils/ai-learning'

export async function suggestRoute(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
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
                user_id: userId,
                type: incidentData.type,
                description: `${incidentData.location_text}: ${incidentData.description}`,
            }])

        if (error) return { error: error.message }

        // Award Point (Incident)
        if (user && user.id) {
            try {
                const { data: profile } = await supabase.from('profiles').select('points, full_name').eq('id', user.id).single()
                const { error: upsertError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email || '',
                    points: (profile?.points || 0) + 1,
                    full_name: profile?.full_name || (user.user_metadata?.full_name as string) || 'Community Member'
                })
                if (upsertError) console.error('Point Award Error (Incident):', upsertError)
            } catch (err) {
                console.error('Point error (Incident):', err)
            }
        }

        // Conceptual AI Learning
        await processIncidentImpact(incidentData.type, incidentData.description)

        revalidatePath('/')
        revalidatePath('/alerts')
        return { success: true }
    }

    const routeData: any = {
        user_id: userId,
        origin: formData.get('origin') as string,
        destination: formData.get('destination') as string,
        vehicle_type: formData.get('vehicleType') as string,
        price_estimated: parseFloat(formData.get('fareMax') as string) || null, // Mapping to correct column
        duration_minutes: parseInt(formData.get('durationMinutes') as string) || null,
        pro_tips: formData.get('proTips') as string,
    }

    // Parse itinerary from text
    const itineraryText = formData.get('itinerary') as string
    if (itineraryText) {
        const lines = itineraryText.split('\n').filter(line => line.trim())
        const itinerary = lines.map((line, index) => {
            let type: 'start' | 'stop' | 'switch' | 'end' = 'stop'
            if (index === 0) type = 'start'
            else if (index === lines.length - 1) type = 'end'
            else if (line.toLowerCase().includes('switch') || line.toLowerCase().includes('change')) type = 'switch'

            const match = line.match(/(.*?)\((.*?)\)/)
            const location = match ? match[1].trim() : line.trim()
            const instruction = match ? match[2].trim() : line.trim()

            return {
                type,
                location,
                instruction,
                vehicle: line.toLowerCase().includes('bus') ? 'Bus' : line.toLowerCase().includes('keke') ? 'Keke' : line.toLowerCase().includes('taxi') ? 'Taxi' : undefined
            }
        })
        routeData.itinerary = itinerary
    }

    if (!routeData.origin || !routeData.destination) {
        return { error: 'Origin and destination are required.' }
    }

    const { error } = await supabase
        .from('community_routes')
        .insert([routeData])

    if (error) {
        return { error: error.message }
    }

    // Award Point (Route)
    if (user && user.id) {
        try {
            const { data: profile } = await supabase.from('profiles').select('points, full_name').eq('id', user.id).single()
            const { error: upsertError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email || '',
                points: (profile?.points || 0) + 1,
                full_name: profile?.full_name || (user.user_metadata?.full_name as string) || 'Community Member'
            })
            if (upsertError) console.error('Point Award Error (Route):', upsertError)
        } catch (err) {
            console.error('Point error (Route):', err)
        }
    }

    // Conceptual AI Learning
    await learnNewRoutePattern(routeData.origin, routeData.destination, routeData.vehicle_type, routeData.itinerary || [])

    revalidatePath('/')
    revalidatePath('/community')
    return { success: true, isGuest: !userId }
}
