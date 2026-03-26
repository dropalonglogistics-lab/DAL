'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomepageShopperTile({ isLive }: { isLive: boolean }) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Guest', phone, email: 'guest@dal.app', feature: 'f3' })
            });
            const data = await res.json();
            if (data.success || data.message === 'You are already on the list!') {
                toast.success(data.success ? 'Added to waitlist!' : 'You are already on the list!');
                setPhone('');
            } else {
                toast.error(data.message || 'Error occurred');
            }
        } catch {
            toast.error('Network Error');
        } finally {
            setLoading(false);
        }
    };

    if (isLive) {
        return (
            <Link href="/shopper" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <ShoppingBag size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Personal Shopper</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                    Market runs, pharmacy, bill payments. We run your errands.
                </p>
                <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.9rem' }}>
                    Book a worker <ArrowRight size={16} />
                </div>
            </Link>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Gated Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,13,13,0.7)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <div style={{ background: 'var(--color-gold)', color: '#000', padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>Coming Soon</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>Errand Workers</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Let DAL handle your market runs.</p>
                
                <form onSubmit={submit} style={{ display: 'flex', width: '100%', gap: '8px' }}>
                    <input type="tel" placeholder="Phone to be notified" value={phone} onChange={e=>setPhone(e.target.value)} disabled={loading} style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                    <button type="submit" disabled={loading} style={{ background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                        {loading ? '...' : 'Notify'}
                    </button>
                </form>
            </div>

            {/* Blurred background content */}
            <div style={{ opacity: 0.3, filter: 'blur(2px)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <ShoppingBag size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Personal Shopper</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                    Market runs, pharmacy, bill payments. We run your errands.
                </p>
                <div style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.9rem' }}>
                    Book a worker <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
}
