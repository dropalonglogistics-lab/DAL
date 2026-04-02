import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/businesses/[id]/products — list all products for a business
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: businessId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ products: data ?? [] });
}

// POST /api/businesses/[id]/products — add a new product (owner only)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: businessId } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Verify ownership
    const { data: business } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
    if (!business || business.owner_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, image_url, category, in_stock = true } = body;

    if (!name || isNaN(price)) {
        return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('products')
        .insert({
            business_id: businessId,
            name,
            description: description ?? null,
            price,
            image_url: image_url ?? null,
            category: category ?? null,
            in_stock,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data }, { status: 201 });
}
