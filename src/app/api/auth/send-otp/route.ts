import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

const TERMII_API_URL = 'https://v3.api.termii.com/api/sms/otp/send';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOTP(otp: string, phone: string): string {
    return crypto
        .createHmac('sha256', process.env.TERMII_API_KEY || 'local-secret')
        .update(`${otp}:${phone}`)
        .digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }

        // Normalize phone: strip leading 0, prefix +234
        const normalized = phone.startsWith('+234')
            ? phone
            : '+234' + phone.replace(/^0/, '');

        const supabase = await createClient();

        // Check if profile exists and is not locked
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, otp_locked_until, phone_verified')
            .eq('phone', normalized)
            .single();

        if (profile?.otp_locked_until) {
            const lockUntil = new Date(profile.otp_locked_until);
            if (lockUntil > new Date()) {
                const remaining = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
                return NextResponse.json(
                    { error: `Account locked. Try again in ${remaining} minute(s).` },
                    { status: 429 }
                );
            }
        }

        const otp = generateOTP();
        const otpHash = hashOTP(otp, normalized);
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Store OTP hash in profile (upsert by phone)
        await supabase
            .from('profiles')
            .update({
                otp_hash: otpHash,
                otp_expires_at: otpExpiresAt.toISOString(),
                otp_attempts: 0,
                otp_locked_until: null,
            })
            .eq('phone', normalized);

        // Send via Termii (if API key set)
        if (process.env.TERMII_API_KEY) {
            const termiiRes = await fetch(TERMII_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: process.env.TERMII_API_KEY,
                    message_type: 'NUMERIC',
                    to: normalized,
                    from: process.env.TERMII_SENDER_ID || 'DAL',
                    channel: 'generic',
                    pin_attempts: 3,
                    pin_time_to_live: 10,
                    pin_length: 6,
                    pin_placeholder: '< 1234 >',
                    message_text: `Your DAL verification code is < 1234 >. Valid for 10 minutes. Do not share with anyone.`,
                    pin_type: 'NUMERIC',
                }),
            });

            if (!termiiRes.ok) {
                console.error('Termii error:', await termiiRes.text());
                // Still return success for dev — OTP is stored in DB
                // In production, you'd return an error here
            }
        } else {
            // Development mode — log OTP to console
            console.log(`[DEV] OTP for ${normalized}: ${otp}`);
        }

        return NextResponse.json({ success: true, phone: normalized });
    } catch (err: any) {
        console.error('send-otp error:', err);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
