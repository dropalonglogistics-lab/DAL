import Link from 'next/link';
import { Package, Bike, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function ExpressLanding() {
    const supabase = await createClient();

    // Since this is just a quick landing page flow, we mock live stats for effect, 
    // or fetch count of completed orders (this falls under "live active riders stats").
    // Let's get real counts if we can
    const { count: riders } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_rider', true);
    
    return (
        <div style={{ minHeight: '85vh', background: 'var(--bg-default)', color: 'var(--text-primary)', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '60px' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '20px', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--color-gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Same-Hour Delivery Is Here.
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>DAL Express reliably delivers anything across Port Harcourt—from urgent envelopes to heavy boxes—in under 45 minutes.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px', marginBottom: '60px' }}>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '8px' }}>{riders || 45}+</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Active Riders</div>
                </div>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '8px' }}>~35m</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Average Delivery</div>
                </div>
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', marginBottom: '8px' }}>₦500</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Deliveries Start At</div>
                </div>
            </div>

            <Link href="/express/order" style={{ background: 'var(--color-gold)', color: '#000', textDecoration: 'none', padding: '20px 48px', borderRadius: '100px', fontSize: '1.15rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 16px 40px rgba(201,162,39,0.25)', transition: 'transform 0.2s' }}>
                <Package />
                Order Express Delivery
                <ArrowRight />
            </Link>
        </div>
    );
}
