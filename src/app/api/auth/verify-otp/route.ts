import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 10;

function hashOTP(otp: string, phone: string): string {
    return crypto
        .createHmac('sha256', process.env.TERMII_API_KEY || 'local-secret')
        .update(`${otp}:${phone}`)
        .digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const { phone, code } = await request.json();

        if (!phone || !code) {
            return NextResponse.json({ error: 'Phone and code required' }, { status: 400 });
        }

        const normalized = phone.startsWith('+234')
            ? phone
            : '+234' + phone.replace(/^0/, '');

        const supabase = await createClient();

        const { data: profile, error: fetchErr } = await supabase
            .from('profiles')
            .select('id, otp_hash, otp_expires_at, otp_attempts, otp_locked_until')
            .eq('phone', normalized)
            .single();

        if (fetchErr || !profile) {
            return NextResponse.json({ error: 'Phone number not found' }, { status: 404 });
        }

        // Check lockout
        if (profile.otp_locked_until) {
            const lockUntil = new Date(profile.otp_locked_until);
            if (lockUntil > new Date()) {
                const remaining = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
                return NextResponse.json(
                    { error: `Account locked. Try again in ${remaining} minute(s).`, locked: true },
                    { status: 429 }
                );
            }
        }

        // Check expiry
        if (!profile.otp_expires_at || new Date(profile.otp_expires_at) < new Date()) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Verify hash
        const submittedHash = hashOTP(code, normalized);
        const attempts = (profile.otp_attempts || 0) + 1;

        if (submittedHash !== profile.otp_hash) {
            const remaining = MAX_ATTEMPTS - attempts;
            let lockUntil: string | null = null;

            if (attempts >= MAX_ATTEMPTS) {
                lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
            }

            await supabase
                .from('profiles')
                .update({ otp_attempts: attempts, otp_locked_until: lockUntil })
                .eq('id', profile.id);

            if (attempts >= MAX_ATTEMPTS) {
                return NextResponse.json(
                    { error: `Too many attempts. Account locked for ${LOCKOUT_MINUTES} minutes.`, locked: true },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Incorrect code. ${remaining} attempt(s) remaining.`, attemptsLeft: remaining },
                { status: 400 }
            );
        }

        // Success — mark phone verified, clear OTP fields
        await supabase
            .from('profiles')
            .update({
                phone_verified: true,
                otp_hash: null,
                otp_expires_at: null,
                otp_attempts: 0,
                otp_locked_until: null,
            })
            .eq('id', profile.id);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('verify-otp error:', err);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
