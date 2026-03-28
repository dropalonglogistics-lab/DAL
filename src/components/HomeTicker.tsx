'use client';
import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';

export default function HomeTicker() {
    const [count, setCount] = useState<number | null>(null);

    const fetchCount = async () => {
        try {
            const res = await fetch('/api/alerts?count=true', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCount(data.count ?? 0);
            }
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, []);

    const text = count === null
        ? 'Connecting to road intelligence…'
        : count === 0
            ? 'LIVE: Roads look clear in Port Harcourt right now'
            : `LIVE: ${count} active road alert${count !== 1 ? 's' : ''} in Port Harcourt right now`;

    return (
        <div style={{
            background: '#0a0a0a',
            borderBottom: '1px solid rgba(201,162,39,0.3)',
            padding: '8px 0',
            overflow: 'hidden',
            position: 'relative',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px',
            }}>
                <Radio size={14} style={{ color: '#C9A227', flexShrink: 0, animation: 'pulse 2s infinite' }} />
                <div style={{
                    overflow: 'hidden',
                    flex: 1,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '48px',
                        animation: 'marquee 25s linear infinite',
                        whiteSpace: 'nowrap',
                    }}>
                        <span style={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: '#e2e8f0', fontWeight: 500 }}>
                            {text}
                        </span>
                        <span style={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: '#94a3b8' }}>·</span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            Community-powered · Updated live
                        </span>
                        <span style={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: '#e2e8f0', fontWeight: 500 }}>
                            {text}
                        </span>
                    </div>
                </div>
                <a href="/alerts" style={{ fontSize: '0.72rem', color: '#C9A227', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0, textDecoration: 'none' }}>
                    View All →
                </a>
            </div>
            <style>{`
                @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}
