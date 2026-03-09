import { redirect } from 'next/navigation'
import { isAdmin } from '@/utils/supabase/admin-check'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const admin = await isAdmin()

    if (!admin) {
        redirect('/')
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
