import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

// POST /api/businesses/apply — submit business application
export async function POST(req: Request) {
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { name, slogan, description, category, logo_url, banner_url, phone, email, address, city } = body;

    if (!name || !category || !phone || !address) {
        return NextResponse.json({ error: 'name, category, phone, and address are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if user already has a pending or active business
    const { data: existing } = await supabase.from('businesses').select('id, status').eq('owner_id', auth.data.id).maybeSingle();
    if (existing) return NextResponse.json({ error: `Business application already submitted (status: ${existing.status})` }, { status: 400 });

    // Generate slug from name
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const { data, error } = await supabase
        .from('businesses')
        .insert({
            owner_id: auth.data.id,
            name,
            slug,
            slogan: slogan ?? null,
            description: description ?? null,
            category,
            logo_url: logo_url ?? null,
            banner_url: banner_url ?? null,
            phone,
            email: email ?? auth.data.email,
            address,
            city: city ?? 'Port Harcourt',
            status: 'pending',
            verified: false
        })
        .select('id, slug')
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id, slug: data.slug, message: 'Business application submitted' }, { status: 201 });
}
