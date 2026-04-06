import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileView';

export default async function ProfilePage() {
    const supabase = await createClient();
    
    // 1. Get current auth user on server
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
        redirect('/auth/login');
    }

    // 2. Fetch profile data on server
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    // 3. Fallback/Auto-create handled on client if strictly necessary, 
    // but pass what we have for zero-delay initial render.
    return (
        <ProfileClient 
            initialUser={user} 
            initialProfile={profile} 
        />
    );
}
