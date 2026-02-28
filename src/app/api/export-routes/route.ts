import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
            .from('community_routes')
            .select(`
                id,
                origin,
                destination,
                vehicle_type,
                price_estimated,
                duration_minutes,
                status,
                created_at,
                profiles(full_name, email)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) {
            return NextResponse.json({ message: 'No routes found' }, { status: 404 })
        }

        // Convert JSON to CSV manually to avoid adding dependencies
        const headers = ['ID', 'Origin', 'Destination', 'Vehicle', 'Fare (NGN)', 'Duration (Mins)', 'Status', 'Date Added', 'User Name', 'User Email']

        const csvRows = data.map((route: any) => {
            return [
                route.id,
                `"${route.origin}"`,
                `"${route.destination}"`,
                `"${route.vehicle_type || ''}"`,
                route.price_estimated || '',
                route.duration_minutes || '',
                route.status,
                new Date(route.created_at).toISOString().split('T')[0],
                `"${route.profiles?.full_name || 'Anonymous'}"`,
                `"${route.profiles?.email || 'N/A'}"`
            ].join(',')
        })

        const csvContent = headers.join(',') + '\n' + csvRows.join('\n')

        const response = new NextResponse(csvContent)
        response.headers.set('Content-Type', 'text/csv')
        response.headers.set('Content-Disposition', `attachment; filename="dal_routes_export_${new Date().toISOString().split('T')[0]}.csv"`)

        return response
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
