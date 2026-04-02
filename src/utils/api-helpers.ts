/**
 * Shared helpers for DAL API routes.
 * - requireUser: validates session, returns user or 401 response
 * - requireAdmin: validates session + admin flag, returns profile or 403 response
 * - requireBotSecret: validates X-Bot-Secret header
 * - haversineKm: distance between two lat/lng coords
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

export async function requireUser(): Promise<ApiResult<{ id: string; email: string | undefined }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
    return { ok: true, data: { id: user.id, email: user.email } };
}

export async function requireAdmin(): Promise<ApiResult<{ userId: string; profile: any }>> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return { ok: false, response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };

    return { ok: true, data: { userId: user.id, profile } };
}

export function requireBotSecret(req: Request): ApiResult<null> {
    const secret = req.headers.get('x-bot-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
    if (!secret || secret !== process.env.BOT_SECRET) {
        return { ok: false, response: NextResponse.json({ error: 'Invalid bot secret' }, { status: 403 }) };
    }
    return { ok: true, data: null };
}

export function serviceRoleClient() {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function err(message: string, status: number) {
    return NextResponse.json({ error: message }, { status });
}
