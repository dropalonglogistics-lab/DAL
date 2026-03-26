import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const body = await request.json();
        const { name, phone, email, feature = 'f2' } = body;
        
        let userId = null;
        try {
            const { data } = await supabase.auth.getUser();
            if (data.user) userId = data.user.id;
        } catch (e) { }

        // Note: phone+feature and email+feature must be unique normally, handle safely
        const { error } = await supabase.from('waitlist').insert({
            name,
            phone,
            email,
            feature,
            user_id: userId
        });

        if (error) {
            if (error.code === '23505') {
                 return NextResponse.json({ success: false, message: 'You are already on the list!' }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature') || 'f2';
    const supabase = await createClient();

    const { count, error } = await supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('feature', feature);
    
    if (error) return NextResponse.json({ count: 0 });
    return NextResponse.json({ count });
}
