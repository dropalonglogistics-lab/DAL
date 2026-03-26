import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { userId, segment, title, body, url } = await req.json();

        // OneSignal REST API payload
        const payload: any = {
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            headings: { en: title },
            contents: { en: body },
            url: url || 'https://dal.com',
        };

        if (userId) {
            payload.include_external_user_ids = [userId];
        } else if (segment) {
            payload.included_segments = [segment];
        } else {
            return NextResponse.json({ error: 'Must provide userId or segment' }, { status: 400 });
        }

        const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        // Optional: log to notifications_log
        const supabase = await createClient();
        await supabase.from('notifications_log').insert({
            user_id: userId || null,
            channel: 'push',
            template: title,
            status: data.errors ? 'failed' : 'sent',
            metadata: { segment, response: data }
        });

        if (data.errors) {
            return NextResponse.json({ error: data.errors }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
