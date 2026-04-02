import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireBotSecret } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/users/by-phone/[phone] — [BOT_SECRET] get user by phone
export async function GET(
    req: Request,
    { params }: { params: Promise<{ phone: string }> }
) {
    const auth = requireBotSecret(req);
    if (!auth.ok) return auth.response;

    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, avatar_url, points, is_premium')
        .eq('phone', decodedPhone)
        .single();

    if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: data });
}
