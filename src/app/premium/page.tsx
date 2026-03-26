'use client';

import { useState } from 'react';
import { CheckCircle, Crown, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PremiumPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const subscribe = async (planType: string) => {
        setLoading(planType);
        try {
            // Simulated user info fetch
            const res = await fetch('/api/payments/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'user@example.com', // Would normally be pulled from session
                    userId: 'mock-user-id',
                    planCode: process.env.NEXT_PUBLIC_PAYSTACK_PREMIUM_PLAN_CODE || 'PLN_premium_mock'
                })
            });
            const data = await res.json();
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                toast.error(data.error || 'Setup failed');
            }
        } catch (err) {
            toast.error('Network Error');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div style={{ minHeight: '85vh', background: 'var(--bg-default)', color: '#FFF', fontFamily: '"Inter", sans-serif', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', marginBottom: '16px' }}>
                    <Crown size={32} />
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, marginBottom: '16px', fontFamily: '"Syne", sans-serif' }}>Upgrade to DAL Premium</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>Unlock exclusive community features, priority matching, and heavily discounted service fees.</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
                
                {/* Monthly Plan */}
                <div style={{ flex: '1 1 300px', background: 'var(--card-bg)', border: '2px solid var(--color-gold)', borderRadius: '24px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-gold)', color: '#000', padding: '4px 16px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        Most Popular (Discounted)
                    </div>
                    
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Monthly</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '24px' }}>₦700<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/mo</span></div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                        {['Priority Errand Worker Matching', 'Free Route Adjustments', 'Verified Community Badge', 'Dedicated Support Line'].map(f => (
                            <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <CheckCircle size={20} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{f}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled={loading === 'monthly'} onClick={() => subscribe('monthly')} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, var(--color-gold), #D97706)', color: '#000', border: 'none', borderRadius: '100px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {loading === 'monthly' ? <Loader size={20} className="spin" /> : 'Subscribe Now'}
                    </button>
                </div>

                {/* Annual Plan */}
                <div style={{ flex: '1 1 300px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Annual</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}>₦7,000<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/yr</span></div>
                    <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>Save ₦1,400 per year</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, marginBottom: '32px' }}>
                        {['All Monthly Features', '2 Months Free', 'Exclusive Annual Event Access', 'Early Feature Previews'].map(f => (
                            <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <CheckCircle size={20} color="var(--color-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{f}</span>
                            </div>
                        ))}
                    </div>

                    <button disabled={loading === 'annual'} onClick={() => subscribe('annual')} style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', color: '#FFF', border: '1px solid var(--border)', borderRadius: '100px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {loading === 'annual' ? <Loader size={20} className="spin" /> : 'Subscribe Annual'}
                    </button>
                </div>
            </div>
        </div>
    );
}
