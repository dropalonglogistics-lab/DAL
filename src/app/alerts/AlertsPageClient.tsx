'use client';

import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { Bell, Filter, ThumbsUp, ThumbsDown, MapPin, AlertTriangle, Shield, TrafficCone, Loader, ChevronRight, Plus, X } from 'lucide-react';
import Link from 'next/link';
import styles from './Alerts.module.css';

const PH_AREAS_TOP = [
    'All Areas', 'Mile 1', 'Mile 3', 'Aba Road', 'Ada George', 'Choba', 'D-Line',
    'GRA Phase 1', 'GRA Phase 2', 'GRA Phase 3', 'Ikokwu', 'Rumuola', 'Rumuokoro',
    'Trans-Amadi', 'Woji', 'Peter Odili Road', 'Elelenwo', 'Airport Road'
];

const SEVERITY_TABS = [
    { key: 'all', label: 'All', color: 'var(--text-secondary)' },
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
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Bell size={28} style={{ color: 'var(--color-gold)' }} />
                        Alerts
                    </h1>
                    <p className={styles.subtitle}>
                        Real-time road reports from Port Harcourt commuters
                    </p>
                </div>
                <button 
                    onClick={() => setShowReportForm(!showReportForm)}
                    className={styles.reportBtn}
                >
                    {showReportForm ? <X size={18} /> : <Plus size={18} />}
                    {showReportForm ? 'Cancel' : 'Report Alert'}
                </button>
            </div>

            {/* Inline Report Form */}
            {showReportForm && (
                <div className={styles.reportForm}>
                    <h3 style={{ margin: '0 0 20px', fontWeight: 800 }}>Submit New Road Alert</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Type</label>
                            <select 
                                value={newAlertType} 
                                onChange={e => setNewAlertType(e.target.value)}
                                className={styles.select}
                            >
                                <option value="traffic">🚦 Traffic</option>
                                <option value="police">👮 Checkpoint</option>
                                <option value="accident">⚠️ Accident</option>
                                <option value="flooding">🌧️ Flooding</option>
                                <option value="other">ℹ️ Other</option>
                            </select>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Area</label>
                            <input 
                                type="text"
                                value={newAlertArea} 
                                onChange={e => setNewAlertArea(e.target.value)}
                                placeholder="e.g. Mile 1, Rumuola, Aba Road"
                                className={styles.input}
                            />
                        </div>
                    </div>
                    <div className={styles.fieldGroup} style={{ marginBottom: '24px' }}>
                        <label className={styles.label}>Description</label>
                        <textarea 
                            value={newAlertDesc}
                            onChange={e => setNewAlertDesc(e.target.value)}
                            placeholder="e.g. Heavy traffic build up at Rumuokoro flyover due to broken down truck..."
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            disabled={isSubmitting || !newAlertDesc.trim() || !newAlertArea.trim()}
                            onClick={handleSubmitAlert}
                            className={styles.postBtn}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Alert'}
                        </button>
                    </div>
                </div>
            )}

            {/* Severity Tabs */}
            <div className={styles.tabsRow}>
                {SEVERITY_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setSeverity(tab.key)}
                        className={`${styles.tabBtn} ${severity === tab.key ? styles.activeTab : ''}`}
                        style={{
                            borderColor: severity === tab.key ? tab.color : 'var(--border)',
                            color: severity === tab.key ? tab.color : 'var(--text-secondary)',
                            background: severity === tab.key ? `${tab.color}10` : 'transparent',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Area Filter */}
            <div className={styles.filterRow}>
                <Filter size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <select
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    className={styles.select}
                    style={{ width: 'auto', minWidth: '160px' }}
                >
                    {PH_AREAS_TOP.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span className={styles.countText}>
                    {loading ? 'Updating…' : `${alerts.length} reports active`}
                </span>
            </div>

            {/* Alert List */}
            {loading ? (
                <div className={styles.loading}>
                    <Loader size={32} className={styles.spinner} />
                    <p>Fetching road intelligence reports…</p>
                </div>
            ) : alerts.length === 0 ? (
                <div className={styles.loading}>
                    <MapPin size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>No alerts match your current filters. Roads look clear!</p>
                </div>
            ) : (
                <div className={styles.alertList}>
                    {alerts.map(alert => (
                        <div key={alert.id} className={styles.alertCard}>
                            {/* Severity bar */}
                            <div className={styles.severityIndicator} style={{ background: severityColor(alert.severity) }} />
                            
                            {/* Icon */}
                            <div className={styles.iconWrap} style={{ background: `${severityColor(alert.severity)}15`, color: severityColor(alert.severity) }}>
                                {ICON_MAP[alert.type] ?? <AlertTriangle size={18} />}
                            </div>

                            {/* Content */}
                            <div className={styles.alertMain}>
                                <div className={styles.alertHeader}>
                                    <span className={styles.alertType}>{alert.type}</span>
                                    {alert.area && (
                                        <span className={styles.areaBadge}>
                                            <MapPin size={12} /> {alert.area}
                                        </span>
                                    )}
                                    {alert.severity && alert.severity !== 'info' && (
                                        <span className={styles.severityBadge} style={{ background: `${severityColor(alert.severity)}20`, color: severityColor(alert.severity) }}>
                                            {alert.severity}
                                        </span>
                                    )}
                                </div>
                                <p className={styles.alertDesc}>
                                    {alert.description}
                                </p>
                                <div className={styles.alertFooter}>
                                    <span className={styles.timeText}>{timeAgo(alert.created_at)}</span>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => handleVote(alert.id, 1)}
                                            className={styles.voteBtn}
                                            style={{
                                                background: voted[alert.id] === 1 ? 'rgba(34,197,94,0.1)' : 'transparent',
                                                color: voted[alert.id] === 1 ? '#22c55e' : 'var(--text-secondary)',
                                                borderColor: voted[alert.id] === 1 ? '#22c55e40' : 'var(--border)',
                                            }}
                                        >
                                            <ThumbsUp size={14} /> {(alert.vote_score ?? 0) > 0 ? alert.vote_score : ''}
                                        </button>
                                        <button
                                            onClick={() => handleVote(alert.id, -1)}
                                            className={styles.voteBtn}
                                            style={{
                                                background: voted[alert.id] === -1 ? 'rgba(239,68,68,0.1)' : 'transparent',
                                                color: voted[alert.id] === -1 ? '#ef4444' : 'var(--text-secondary)',
                                                borderColor: voted[alert.id] === -1 ? '#ef444440' : 'var(--border)',
                                            }}
                                        >
                                            <ThumbsDown size={14} />
                                        </button>
                                        <Link href={`/alerts/${alert.id}`} className={styles.detailsLink}>
                                            View <ChevronRight size={14} />
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
