import Link from 'next/link';
import { ShoppingCart, FileText, Pill, CreditCard, Clock, Wrench, ArrowRight } from 'lucide-react';

export default function ShopperLanding() {
    const ERRANDS = [
        { icon: <ShoppingCart size={24} />, name: 'Market Run', desc: "We go to the market so you don't have to", price: 1500 },
        { icon: <FileText size={24} />, name: 'Document Drop', desc: "Bank, office, anywhere in PH", price: 700 },
        { icon: <Pill size={24} />, name: 'Pharmacy Pick-up', desc: "Prescription ready? We'll get it.", price: 1000 },
        { icon: <CreditCard size={24} />, name: 'Bill Payment', desc: "PHCN, water, subscriptions", price: 800 },
        { icon: <Clock size={24} />, name: 'Queue for Me', desc: "We stand in line so you don't have to", price: 1200 },
        { icon: <Wrench size={24} />, name: 'Custom Errand', desc: "Tell us what you need", price: 1000 }
    ];

    return (
        <div style={{ minHeight: '85vh', background: 'var(--bg-default)', color: 'var(--text-primary)', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '60px' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '20px', fontFamily: '"Syne", sans-serif', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--color-gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Your Personal Shopper is One Message Away
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Market runs. Document drops. Pharmacy pick-ups. Queue waiting. If it&apos;s an errand, DAL handles it.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px', marginBottom: '60px' }}>
                {ERRANDS.map((e, idx) => (
                    <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            {e.icon}
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{e.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', flex: 1 }}>{e.desc}</p>
                        <div style={{ marginTop: '16px', fontWeight: 600, color: 'var(--color-gold)' }}>
                            from ₦{e.price.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ width: '100%', maxWidth: '800px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', padding: '40px', marginBottom: '60px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>How It Works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)', marginBottom: '8px' }}>1</div>
                        <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Request</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tell us what you need and set a budget.</p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)', marginBottom: '8px' }}>2</div>
                        <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Worker Accepts</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A verified errand worker claims your task instantly.</p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-gold)', marginBottom: '8px' }}>3</div>
                        <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Done!</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Chat in-app and relax while your errand gets done.</p>
                    </div>
                </div>
            </div>

            <Link href="/shopper/request" style={{ background: 'var(--color-gold)', color: '#000', textDecoration: 'none', padding: '20px 48px', borderRadius: '100px', fontSize: '1.15rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 16px 40px rgba(201,162,39,0.25)', transition: 'transform 0.2s' }}>
                <ShoppingCart />
                Request a Worker
                <ArrowRight />
            </Link>
        </div>
    );
}
