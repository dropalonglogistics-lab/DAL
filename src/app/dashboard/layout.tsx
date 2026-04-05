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

    // Parallelize onboarding check and any other layout level fetches
    const profile = (await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle())?.data;
    
    // Check if onboarding is completed if profile exists
    if (profile && profile.onboarding_completed === false) {
        redirect('/welcome');
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
