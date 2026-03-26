import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function parseCSV(text: string): any[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
        return obj;
    });
}

function mapRow(row: any) {
    return {
        start_location: row.start_location || row.from || row.start || '',
        destination: row.destination || row.to || row.end || '',
        vehicle_type_used: row.vehicle_type_used || row.vehicle || row.transport || 'Various',
        estimated_travel_time_min: parseInt(row.estimated_travel_time_min || row.duration || '0') || null,
        fare_price_range_min: parseFloat(row.fare_price_range_min || row.fare || row.price || '0') || null,
        status: 'approved',
        stops_along_the_way: [],
    };
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // Admin check
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', authData.user.id).single();
    if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const text = await file.text();
    let rows: any[] = [];

    try {
        if (file.name.endsWith('.json')) {
            const parsed = JSON.parse(text);
            rows = Array.isArray(parsed) ? parsed : [parsed];
        } else if (file.name.endsWith('.csv')) {
            rows = parseCSV(text);
        } else {
            return NextResponse.json({ error: 'Only .json and .csv files are supported' }, { status: 400 });
        }
    } catch (e: any) {
        return NextResponse.json({ error: `Parse error: ${e.message}` }, { status: 400 });
    }

    if (rows.length === 0) {
        return NextResponse.json({ error: 'File is empty or has no valid rows' }, { status: 400 });
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Insert in batches of 50
    const BATCH = 50;
    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const mapped = batch.map((row, idx) => {
            const m = mapRow(row);
            if (!m.start_location || !m.destination) {
                errors.push(`Row ${i + idx + 1}: missing start_location or destination`);
                failed++;
                return null;
            }
            return m;
        }).filter(Boolean);

        if (mapped.length === 0) continue;

        const { error, data } = await supabase.from('community_routes').insert(mapped).select();
        if (error) {
            failed += mapped.length;
            errors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${error.message}`);
        } else {
            success += data?.length ?? mapped.length;
        }
    }

    return NextResponse.json({ success, failed, errors });
}
