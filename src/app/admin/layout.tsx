import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/utils/supabase/admin-check'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/admin');
    }

    // Role Check
    const isUserAdmin = await isAdmin();

    if (!isUserAdmin) {
        redirect('/dashboard');
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
