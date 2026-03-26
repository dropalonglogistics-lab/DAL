'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, Bike, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComingSoonExpress() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);
    const [registered, setRegistered] = useState(false);

    const fetchCount = () => {
        fetch('/api/waitlist?feature=f2')
            .then(res => res.json())
            .then(data => setCount(data.count))
            .catch(() => {});
    };

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !email) return;
        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, feature: 'f2' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Done! You are on the list.');
                setRegistered(true);
                fetchCount();
            } else {
                if (data.message === 'You are already on the list!') {
                    toast.success('You are already on the list!');
                    setRegistered(true);
                } else {
                    toast.error(data.message || 'Error occurred');
                }
            }
        } catch (err) {
            toast.error('Network Error');
        } finally {
            setLoading(false);
        }
    };

    const tweetText = encodeURIComponent("I just joined the waitlist for DAL Express! Same-hour delivery coming to Port Harcourt soon. 🚀 #DALExpress");

    return (
        <div style={{ minHeight: '100vh', background: '#0D0D0D', color: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '60px', paddingBottom: '60px', paddingLeft: '24px', paddingRight: '24px', fontFamily: '"Syne", sans-serif' }}>
            
            <Image src="/dal-logo-light.png" alt="DAL" width={100} height={30} style={{ objectFit: 'contain', marginBottom: '40px' }} />

            <div style={{ background: 'var(--color-gold)', color: '#000', padding: '4px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>
                Coming Soon
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, textAlign: 'center', maxWidth: '800px', lineHeight: 1.1, marginBottom: '16px' }}>
                Same-Hour Delivery Across Port Harcourt. Soon.
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '600px', marginBottom: '48px', fontFamily: '"Inter", sans-serif' }}>
                DAL Express is almost ready. Be the first to know when it launches.
            </p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px', fontFamily: '"Inter", sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Bike size={20} color="var(--color-gold)" />
                    <span>Bike & Keke riders across PH</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Package size={20} color="var(--color-gold)" />
                    <span>Envelopes to large parcels</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Clock size={20} color="var(--color-gold)" />
                    <span>Average delivery under 45 mins</span>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-gold)', borderRadius: '24px', padding: '32px', boxShadow: '0 16px 48px rgba(201,162,39,0.15)', fontFamily: '"Inter", sans-serif' }}>
                {registered ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={48} color="var(--color-gold)" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-gold)' }}>You&apos;re heavily requested!</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>We&apos;ll notify you the minute DAL Express goes live.</p>
                    </div>
                ) : (
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input type="text" placeholder="Full Name" required value={name} onChange={e=>setName(e.target.value)} disabled={loading} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                        <input type="tel" placeholder="Phone (+234)" required value={phone} onChange={e=>setPhone(e.target.value)} disabled={loading} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                        <input type="email" placeholder="Email Address" required value={email} onChange={e=>setEmail(e.target.value)} disabled={loading} style={{ width: '100%', padding: '14px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                        
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: 'var(--color-gold)', border: 'none', borderRadius: '12px', color: '#000', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', marginTop: '8px' }}>
                            {loading ? 'Joining...' : 'Notify Me First'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                    Join <strong>{count}</strong> others already waiting
                </div>
            </div>

            <div style={{ marginTop: '48px', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Tell your friends</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <a href={`https://wa.me/?text=${tweetText}`} target="_blank" rel="noreferrer" style={{ padding: '10px 20px', background: '#25D366', color: '#FFF', textDecoration: 'none', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600 }}>WhatsApp</a>
                    <a href={`https://twitter.com/intent/tweet?text=${tweetText}`} target="_blank" rel="noreferrer" style={{ padding: '10px 20px', background: '#1DA1F2', color: '#FFF', textDecoration: 'none', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600 }}>Twitter</a>
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '60px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: '"Inter", sans-serif', textAlign: 'center' }}>
                Already have DAL? Your account auto-upgrades when we launch.
            </div>
        </div>
    );
}
