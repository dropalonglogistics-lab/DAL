'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HomepageExpressTile({ isLive }: { isLive: boolean }) {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Homepage User', phone, email: '', feature: 'f2' })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                toast.success("Done! You're on the list.");
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (isLive) {
        return (
            <Link href="/express" className="statCard expressLiveTile">
                <div className="statIcon" style={{ background: 'var(--color-gold)', color: '#1a1a1a' }}>
                    <Package size={22} />
                </div>
                <div className="statText">
                    <span className="statLabel">DAL Express</span>
                    <span className="statValue statValueGold">Order Now →</span>
                </div>
            </Link>
        );
    }

    return (
        <div className="statCard expressComingSoonTile" style={{ position: 'relative', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95))', zIndex: 1 }} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ background: 'var(--color-gold)', color: '#000', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px' }}>Coming Soon</span>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>DAL Express</h3>
                </div>
                
                {success ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontSize: '0.85rem', marginTop: '6px' }}>
                        <CheckCircle size={14} /> On the list!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', gap: '6px', marginTop: '6px' }}>
                        <input 
                            type="tel" 
                            placeholder="Phone number" 
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            disabled={loading}
                            style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', padding: '6px 8px', fontSize: '0.8rem' }}
                            required
                        />
                        <button type="submit" disabled={loading} style={{ background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '6px', padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={14} />
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
