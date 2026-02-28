import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EditRouteClient from './EditRouteClient'
import { isAdmin } from '@/utils/supabase/admin-check'

export const dynamic = 'force-dynamic'

export default async function EditRoutePage({ params }: { params: { id: string } }) {
    const admin = await isAdmin()

    if (!admin) {
        redirect('/')
    }

    const { id } = params
    const supabase = await createClient()

    const { data: route } = await supabase
        .from('community_routes')
        .select('*')
        .eq('id', id)
        .single()

    if (!route) {
        redirect('/admin/all-routes')
    }

    return <EditRouteClient routeData={route} />
}
