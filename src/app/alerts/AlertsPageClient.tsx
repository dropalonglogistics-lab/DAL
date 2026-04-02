'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Bell, Filter, ThumbsUp, ThumbsDown, MapPin, AlertTriangle, Shield, TrafficCone, Loader, ChevronRight, Plus, X } from 'lucide-react';
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
    
    // Reporting form state
    const [showReportForm, setShowReportForm] = useState(false);
    const [newAlertType, setNewAlertType] = useState('traffic');
    const [newAlertArea, setNewAlertArea] = useState('');
    const [newAlertDesc, setNewAlertDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmitAlert = async () => {
        if (!newAlertDesc.trim() || !newAlertArea.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: newAlertType,
                    description: newAlertDesc,
                    area: newAlertArea,
                    severity: newAlertType === 'accident' || newAlertType === 'police' ? 'critical' : 'warning'
                }),
            });

            if (res.ok) {
                setNewAlertDesc('');
                setShowReportForm(false);
                fetchAlerts();
            } else if (res.status === 401) {
                alert('Please sign in to report alerts.');
            }
        } catch (err) {
            console.error('Submit Alert Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const severityColor = (s?: string) => {
        if (s === 'critical') return '#ef4444';
        if (s === 'warning') return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                        <Bell size={28} style={{ color: 'var(--color-gold)' }} />
                        Alerts
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                        Real-time road reports from Port Harcourt commuters
                    </p>
                </div>
                <button 
                    onClick={() => setShowReportForm(!showReportForm)}
                    style={{
                        background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)',
                        padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }}
                >
                    {showReportForm ? <X size={18} /> : <Plus size={18} />}
                    {showReportForm ? 'Cancel' : 'Report Alert'}
                </button>
            </div>

            {/* Inline Report Form */}
            {showReportForm && (
                <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--color-gold)', borderRadius: '18px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                    <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>Submit New Road Alert</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                            <select 
                                value={newAlertType} 
                                onChange={e => setNewAlertType(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#111', border: '1px solid var(--border)', color: '#fff' }}
                            >
                                <option value="traffic">🚦 Traffic</option>
                                <option value="police">👮 Checkpoint</option>
                                <option value="accident">⚠️ Accident</option>
                                <option value="flooding">🌧️ Flooding</option>
                                <option value="other">ℹ️ Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area</label>
                            <input 
                                type="text"
                                value={newAlertArea} 
                                onChange={e => setNewAlertArea(e.target.value)}
                                placeholder="e.g. Mile 1, Rumuola, Aba Road"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#111', border: '1px solid var(--border)', color: '#fff' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                        <textarea 
                            value={newAlertDesc}
                            onChange={e => setNewAlertDesc(e.target.value)}
                            placeholder="e.g. Heavy traffic build up at Rumuokoro flyover due to broken down truck..."
                            rows={3}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid var(--border)', color: '#fff' }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                            disabled={isSubmitting || !newAlertDesc.trim() || !newAlertArea.trim()}
                            onClick={handleSubmitAlert}
                            style={{
                                background: 'var(--color-gold)', color: '#000', fontWeight: 800,
                                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                opacity: (!newAlertDesc.trim() || !newAlertArea.trim() || isSubmitting) ? 0.6 : 1
                            }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Alert'}
                        </button>
                    </div>
                </div>
            )}

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
