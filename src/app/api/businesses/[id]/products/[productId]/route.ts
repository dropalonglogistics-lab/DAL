import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// PUT /api/businesses/[id]/products/[productId] — update a product (owner only)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string, productId: string }> }
) {
    const { id: businessId, productId } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Verify ownership
    const { data: business } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
    if (!business || business.owner_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { data, error } = await supabase
        .from('products')
        .update(body)
        .eq('id', productId)
        .eq('business_id', businessId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ product: data });
}

// DELETE /api/businesses/[id]/products/[productId] — delete a product (owner only)
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string, productId: string }> }
) {
    const { id: businessId, productId } = await params;
    const auth = await requireUser();
    if (!auth.ok) return auth.response;

    const supabase = await createClient();

    // Verify ownership
    const { data: business } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
    if (!business || business.owner_id !== auth.data.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('business_id', businessId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Product deleted' });
}
