'use client';

import { useState } from 'react';
import { CheckCircle, Car, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverPremiumPage() {
    const [loading, setLoading] = useState(false);

    const subscribe = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payments/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'driver@example.com',
                    userId: 'mock-driver-id',
                    planCode: process.env.NEXT_PUBLIC_PAYSTACK_DRIVER_PLAN_CODE || 'PLN_driver_mock'
                })
            });
            const data = await res.json();
            if (data.authorization_url) {
                // 7-day trial Logic is baked into the Paystack Plan definition
                window.location.href = data.authorization_url;
            } else {
                toast.error(data.error || 'Setup failed');
            }
        } catch (err) {
            toast.error('Network Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '85vh', background: 'var(--bg-default)', color: '#FFF', fontFamily: '"Inter", sans-serif', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', marginBottom: '16px' }}>
                    <Car size={32} />
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '16px', fontFamily: '"Syne", sans-serif' }}>DAL Driver Premium</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Zero commission rates. Total freedom. Unlock your complete driver dashboard for a flat monthly fee.</p>
            </div>

            <div style={{ width: '100%', maxWidth: '500px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Driver Pro</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>₦1,500<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/mo</span></div>
                    <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600, marginTop: '8px' }}>7-Day Free Trial Included</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    {['Keep 100% of your earnings', 'Access to premium delivery requests', 'Uncapped dashboard insights', 'Instant payout triggers'].map(f => (
                        <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <CheckCircle size={20} color="var(--color-gold)" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '1rem', color: '#FFF' }}>{f}</span>
                        </div>
                    ))}
                </div>

                <button disabled={loading} onClick={subscribe} style={{ width: '100%', padding: '18px', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '100px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 8px 32px rgba(201,162,39,0.2)' }}>
                    {loading ? <Loader size={20} className="spin" /> : 'Start Free 7-Day Trial'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You won&apos;t be charged until day 8. Cancel anytime.</div>
            </div>
        </div>
    );
}
