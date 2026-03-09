'use client';

import { useState } from 'react';
import { Map, Bell, BellOff, Trash2, Plus, Search, Navigation } from 'lucide-react';
import Link from 'next/link';
import styles from '../dashboard.module.css';

interface SavedRoute {
    id: number;
    name: string;
    from: string;
    to: string;
    alertCount: number;
    lastUsed: string;
    alertsEnabled: boolean;
}

const INITIAL_ROUTES: SavedRoute[] = [
    { id: 1, name: 'Home → Work', from: 'GRA Phase 2', to: 'Trans-Amadi Estate', alertCount: 3, lastUsed: 'Yesterday', alertsEnabled: true },
    { id: 2, name: 'Market Run', from: 'Mile 3 Market', to: 'New GRA', alertCount: 1, lastUsed: '3 days ago', alertsEnabled: false },
    { id: 3, name: 'Airport Trip', from: 'D/Line', to: 'PH Int\'l Airport', alertCount: 0, lastUsed: '1 week ago', alertsEnabled: true },
];

export default function RoutesPage() {
    const [routes, setRoutes] = useState<SavedRoute[]>(INITIAL_ROUTES);
    const [search, setSearch] = useState('');
    const [removing, setRemoving] = useState<number | null>(null);

    const toggleAlert = (id: number) => {
        setRoutes(rs => rs.map(r => r.id === id ? { ...r, alertsEnabled: !r.alertsEnabled } : r));
    };

    const removeRoute = (id: number) => {
        setRemoving(id);
        setTimeout(() => {
            setRoutes(rs => rs.filter(r => r.id !== id));
            setRemoving(null);
        }, 300);
    };

    return (
        <div className={styles.page}>
            <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle} style={{ fontSize: '1.35rem', fontWeight: 800 }}>Saved Routes</h1>
                <Link href="/search" className={styles.btnGold}>
                    <Plus size={15} /> Add Route
                </Link>
            </div>

            {/* Search box */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search your saved routes…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.fieldInput}
                    style={{ paddingLeft: 40 }}
                />
            </div>

            <div className={styles.card}>
                {routes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Map size={22} /></div>
                        <p className={styles.emptyTitle}>No saved routes</p>
                        <p className={styles.emptyText}>Search for a route and save it for quick access and instant alerts.</p>
                    </div>
                ) : (
                    routes
                        .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) ||
                            r.from.toLowerCase().includes(search.toLowerCase()) ||
                            r.to.toLowerCase().includes(search.toLowerCase()))
                        .map((route, i, arr) => (
                            <div
                                key={route.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                                    opacity: removing === route.id ? 0 : 1,
                                    transition: 'opacity 0.3s',
                                }}
                            >
                                {/* Icon */}
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(201,162,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-gold)', flexShrink: 0 }}>
                                    <Map size={16} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{route.name}</span>
                                        {route.alertCount > 0 && (
                                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '1px 7px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                                {route.alertCount} alerts
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                                        {route.from} → {route.to} · Last used {route.lastUsed}
                                    </div>
                                </div>

                                {/* WhatsApp alert toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                        {route.alertsEnabled ? <Bell size={13} /> : <BellOff size={13} />}
                                    </span>
                                    <label className={styles.toggle}>
                                        <input type="checkbox" checked={route.alertsEnabled} onChange={() => toggleAlert(route.id)} />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                </div>

                                {/* Navigate */}
                                <Link href={`/search?q=${encodeURIComponent(route.from + ' to ' + route.to)}`} className={styles.btnGold} style={{ padding: '7px 14px', fontSize: '0.8rem', flexShrink: 0, textDecoration: 'none' }}>
                                    <Navigation size={13} />
                                </Link>

                                {/* Remove */}
                                <button
                                    onClick={() => removeRoute(route.id)}
                                    style={{ width: 32, height: 32, border: 'none', background: 'rgba(239,68,68,0.08)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}
                                    aria-label="Remove route"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                )}
            </div>

            <div style={{ padding: '14px 18px', background: 'rgba(201,162,39,0.06)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: 12 }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--brand-gold)' }}>🔔 WhatsApp Alerts</strong> — Toggle alerts on a route to receive real-time traffic and hazard notifications direct to your WhatsApp. Premium users get instant priority alerts.
                </p>
            </div>
        </div>
    );
}
