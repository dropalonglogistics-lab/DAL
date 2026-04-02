import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/businesses/[slug] — public-ish detail or owner view
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('businesses')
    .select('*, products(*)')
    .eq('slug', slug)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  return NextResponse.json({ business: data });
}

// PUT /api/businesses/[slug] — update business (owner only)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await createClient();
  const { data: business } = await supabase.from('businesses').select('owner_id').eq('slug', slug).single();
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  if (business.owner_id !== auth.data.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updates = await req.json();
  const { data: updated, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('slug', slug)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business: updated });
}
