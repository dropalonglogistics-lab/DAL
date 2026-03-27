import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

// Lazy load templates
import WelcomeEmail from '@/emails/welcome';
import OrderConfirmation from '@/emails/order-confirmation';
import DeliveryUpdate from '@/emails/delivery-update';
import PaymentReceipt from '@/emails/payment-receipt';
import PremiumActivated from '@/emails/premium-activated';
import DriverPremiumActivated from '@/emails/driver-premium-activated';
import WeeklyRiderSummary from '@/emails/weekly-rider-summary';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_for_build');

export async function POST(req: Request) {
    try {
        const { to, template, data, userId } = await req.json();

        let reactElement;
        let subject = '';

        if (template === 'welcome') {
            reactElement = <WelcomeEmail name={data.name} />;
            subject = 'Welcome to DAL!';
        } else if (template === 'order-confirmation') {
            reactElement = <OrderConfirmation {...data} />;
            subject = `Order Confirmed - ${data.refCode}`;
        } else if (template === 'delivery-update') {
            reactElement = <DeliveryUpdate {...data} />;
            subject = `Update on Order ${data.refCode}`;
        } else if (template === 'payment-receipt') {
            reactElement = <PaymentReceipt {...data} />;
            subject = 'Your Payment Receipt';
        } else if (template === 'premium-activated') {
            reactElement = <PremiumActivated />;
            subject = 'DAL Premium Unlocked!';
        } else if (template === 'driver-premium-activated') {
            reactElement = <DriverPremiumActivated />;
            subject = 'Welcome to DAL Driver Pro!';
        } else if (template === 'weekly-rider-summary') {
            reactElement = <WeeklyRiderSummary {...data} />;
            subject = 'Your DAL Weekly Summary';
        } else {
            // Provide a mock fallback for templates built later
            reactElement = <div>{template} content pending configuration</div>;
            subject = `Update from DAL: ${template}`;
        }

        const resendRes = await resend.emails.send({
            from: 'DAL Support <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            react: reactElement,
        });

        // Log to database
        const supabase = await createClient();
        await supabase.from('notifications_log').insert({
            user_id: userId || null,
            channel: 'email',
            template,
            status: resendRes.error ? 'failed' : 'sent',
            metadata: { to, error: resendRes.error }
        });

        if (resendRes.error) {
            return NextResponse.json({ error: resendRes.error }, { status: 400 });
        }

        return NextResponse.json({ success: true, id: resendRes.data?.id });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
