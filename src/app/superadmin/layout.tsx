import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isSuperAdmin } from '@/utils/supabase/admin-check'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?next=/superadmin');
    }

    // Role Check
    const userIsSuperAdmin = await isSuperAdmin();

    if (!userIsSuperAdmin) {
        redirect('/dashboard'); // Standard admin or user is redirected away
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
