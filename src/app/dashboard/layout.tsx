import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?next=/dashboard');
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
