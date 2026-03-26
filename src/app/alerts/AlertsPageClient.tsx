'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Bell, Filter, ThumbsUp, ThumbsDown, MapPin, AlertTriangle, Shield, TrafficCone, Loader, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PH_AREAS_TOP = [
    'All Areas', 'Mile 1', 'Mile 3', 'Aba Road', 'Ada George', 'Choba', 'D-Line',
    'GRA Phase 1', 'GRA Phase 2', 'GRA Phase 3', 'Ikokwu', 'Rumuola', 'Rumuokoro',
    'Trans-Amadi', 'Woji', 'Peter Odili Road', 'Elelenwo', 'Airport Road'
];

const SEVERITY_TABS = [
    { key: 'all', label: 'All', color: '#94a3b8' },
    { key: 'critical', label: '🔴 Critical', color: '#ef4444' },
    { key: 'warning', label: '🟡 Warning', color: '#f59e0b' },
    { key: 'info', label: '🔵 Info', color: '#3b82f6' },
];

type Alert = {
    id: string;
    type: string;
    description: string;
    area?: string;
    severity?: string;
    vote_score?: number;
    created_at: string;
};

function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

const ICON_MAP: Record<string, ReactElement> = {
    police: <Shield size={18} />,
    traffic: <TrafficCone size={18} />,
    accident: <AlertTriangle size={18} />,
    flooding: <MapPin size={18} />,
};

export default function AlertsPageClient() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [area, setArea] = useState('All Areas');
    const [severity, setSeverity] = useState('all');
    const [voted, setVoted] = useState<Record<string, 1 | -1 | 0>>({});

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (area !== 'All Areas') params.set('area', area);
        if (severity !== 'all') params.set('severity', severity);
        try {
            const res = await fetch(`/api/alerts?${params}`);
            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            }
        } finally {
            setLoading(false);
        }
    }, [area, severity]);

    useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

    const handleVote = async (alertId: string, vote: 1 | -1) => {
        const current = voted[alertId] ?? 0;
        const newVote = current === vote ? 0 : vote;

        // Optimistic update
        setAlerts(prev => prev.map(a => {
            if (a.id !== alertId) return a;
            const delta = newVote - current;
            return { ...a, vote_score: (a.vote_score ?? 0) + delta };
        }));
        setVoted(prev => ({ ...prev, [alertId]: newVote as 1 | -1 | 0 }));

        try {
            await fetch(`/api/alerts/${alertId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vote: newVote === 0 ? (vote === 1 ? -1 : 1) : vote }),
            });
        } catch { /* silent */ }
    };

    const severityColor = (s?: string) => {
        if (s === 'critical') return '#ef4444';
        if (s === 'warning') return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bell size={28} style={{ color: 'var(--color-gold)' }} />
                    Community Alerts
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Real-time road reports from Port Harcourt commuters
                </p>
            </div>

            {/* Severity Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {SEVERITY_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setSeverity(tab.key)}
                        style={{
                            padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${severity === tab.key ? tab.color : 'var(--border)'}`,
                            background: severity === tab.key ? `${tab.color}18` : 'transparent',
                            color: severity === tab.key ? tab.color : 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Area Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <Filter size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    style={{
                        padding: '8px 14px', borderRadius: '10px', border: '1.5px solid var(--border)',
                        background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.9rem',
                        cursor: 'pointer', fontWeight: 500, outline: 'none',
                    }}
                >
                    {PH_AREAS_TOP.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {loading ? 'Loading…' : `${alerts.length} alerts`}
                </span>
            </div>

            {/* Alert List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <Loader size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                    <p>Loading alerts…</p>
                </div>
            ) : alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                    <MapPin size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>No alerts match your filters. Roads look clear!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {alerts.map(alert => (
                        <div key={alert.id} style={{
                            background: 'var(--card-bg)', border: `1px solid var(--border)`, borderRadius: '16px',
                            padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start',
                            transition: 'border-color 0.2s', position: 'relative',
                        }}>
                            {/* Severity bar */}
                            <div style={{
                                position: 'absolute', left: 0, top: '14px', bottom: '14px',
                                width: '3px', borderRadius: '0 2px 2px 0',
                                background: severityColor(alert.severity),
                            }} />
                            {/* Icon */}
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                                background: `${severityColor(alert.severity)}18`,
                                color: severityColor(alert.severity),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {ICON_MAP[alert.type] ?? <AlertTriangle size={18} />}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{alert.type}</span>
                                    {alert.area && (
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <MapPin size={11} /> {alert.area}
                                        </span>
                                    )}
                                    {alert.severity && alert.severity !== 'info' && (
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px',
                                            background: `${severityColor(alert.severity)}20`, color: severityColor(alert.severity), textTransform: 'uppercase',
                                        }}>
                                            {alert.severity}
                                        </span>
                                    )}
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                                    {alert.description}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{timeAgo(alert.created_at)}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {/* Vote buttons */}
                                        <button
                                            onClick={() => handleVote(alert.id, 1)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: '14px', border: '1px solid var(--border)',
                                                background: voted[alert.id] === 1 ? 'rgba(34,197,94,0.12)' : 'transparent',
                                                color: voted[alert.id] === 1 ? '#22c55e' : 'var(--text-secondary)',
                                                cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                                            }}
                                        >
                                            <ThumbsUp size={13} /> {(alert.vote_score ?? 0) > 0 ? `+${alert.vote_score}` : ''}
                                        </button>
                                        <button
                                            onClick={() => handleVote(alert.id, -1)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '4px 10px', borderRadius: '14px', border: '1px solid var(--border)',
                                                background: voted[alert.id] === -1 ? 'rgba(239,68,68,0.12)' : 'transparent',
                                                color: voted[alert.id] === -1 ? '#ef4444' : 'var(--text-secondary)',
                                                cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                                            }}
                                        >
                                            <ThumbsDown size={13} />
                                        </button>
                                        <Link href={`/alerts/${alert.id}`} style={{ fontSize: '0.78rem', color: 'var(--color-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Details <ChevronRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
