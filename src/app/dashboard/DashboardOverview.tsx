'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Star, Package, Map, Zap, Crown, Navigation,
    ArrowRight, TrendingUp, Users, AlertTriangle, Clock
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from './dashboard.module.css';

const GREETINGS = ['Good morning', 'Good afternoon', 'Good evening'];
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return GREETINGS[0];
    if (h < 17) return GREETINGS[1];
    return GREETINGS[2];
}

function formatDate() {
    return new Date().toLocaleDateString('en-NG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: styles.pillPending,
        active: styles.pillActive,
        delivered: styles.pillDelivered,
        completed: styles.pillDelivered, 
        cancelled: styles.pillCancelled,
        disputed: styles.pillDisputed,
    };
    return <span className={`${styles.pill} ${map[status] || styles.pillCancelled}`}>{status}</span>;
}

export default function DashboardOverview({
    profile,
    contributions,
    alertContributions,
    initialOrders = [],
    initialRoutes = []
}: {
    profile: any;
    contributions: number;
    alertContributions: number;
    initialOrders: any[];
    initialRoutes: any[];
}) {
    const [orders, setOrders] = useState(initialOrders);
    const [routes, setRoutes] = useState(initialRoutes);
    const supabase = createClient();

    const firstName = profile?.full_name?.split(' ')[0] || 'there';
    const totalContributions = contributions + alertContributions;

    useEffect(() => {
        if (!profile?.id) return;

        // Realmember Realtime: Subscribe to orders and routes for this user
        const channel = supabase
            .channel(`user-dashboard-${profile.id}`)
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'orders', 
                filter: `user_id=eq.${profile.id}` 
            }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new, ...prev].slice(0, 5));
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
                }
            })
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'routes', 
                filter: `submitted_by=eq.${profile.id}` 
            }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setRoutes(prev => [payload.new, ...prev].slice(0, 5));
                } else if (payload.eventType === 'UPDATE') {
                    setRoutes(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, profile?.id]);

    const stats = [
        { icon: Star, label: 'Points Balance', value: (profile?.points_balance ?? 0).toLocaleString(), sub: 'DAL Points' },
        { icon: Package, label: 'Recent Orders', value: String(orders.length), sub: 'Live status' },
        { icon: Map, label: 'Your Routes', value: String(routes.length), sub: 'Contributions' },
        {
            icon: Crown,
            label: 'Subscription',
            value: profile?.is_premium ? 'Premium' : 'Free',
            sub: profile?.is_premium ? 'Active' : 'Upgrade available',
        },
    ];

    return (
        <div className={styles.page}>
            {/* Greeting */}
            <div className={styles.greetingRow}>
                <div>
                    <h1 className={styles.greeting}>
                        {getGreeting()}, {firstName} 👋
                    </h1>
                    <p className={styles.greetingDate}>{formatDate()}</p>
                </div>
                {profile?.is_premium && (
                    <div className={styles.premiumBadge}>
                        <Crown size={12} /> Premium
                    </div>
                )}
            </div>

            {/* Stat cards */}
            <div className={styles.statsRow}>
                {stats.map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className={styles.statCard}>
                        <div className={styles.statIcon}><Icon size={18} /></div>
                        <span className={styles.statLabel}>{label}</span>
                        <span className={styles.statValue}>{value}</span>
                        <span className={styles.statSub}>{sub}</span>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Orders</h2>
                <Link href="/dashboard/orders" className={styles.sectionLink}>
                    View all <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </Link>
            </div>
            <div className={styles.card} style={{ marginBottom: 28 }}>
                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Package size={22} /></div>
                        <p className={styles.emptyTitle}>No orders yet</p>
                        <p className={styles.emptyText}>Request a delivery or errand to see it here.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Dest.</th>
                                    <th>Fee</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id} className={styles.tableRow}>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.reference || '...'}</td>
                                        <td>{o.type}</td>
                                        <td><StatusPill status={o.status} /></td>
                                        <td style={{ color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {o.dropoff_address || 'N/A'}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>₦{((o.fee_amount || 0) / 100).toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            {new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Your Routes */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Your Route Suggestions</h2>
                <Link href="/dashboard/routes" className={styles.sectionLink}>
                    Manage <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </Link>
            </div>
            <div className={styles.card} style={{ marginBottom: 28 }}>
                {routes.length === 0 ? (
                    <div className={styles.emptyState} style={{ padding: '40px 20px' }}>
                        <div className={styles.emptyIcon}><Map size={22} /></div>
                        <p className={styles.emptyTitle}>No routes yet</p>
                        <p className={styles.emptyText}>Suggest a route to help the community and earn points!</p>
                        <Link href="/suggest-route" className={styles.btnGold} style={{ marginTop: '16px', display: 'inline-flex' }}>
                            Suggest Route
                        </Link>
                    </div>
                ) : (
                    routes.map((r, i) => (
                        <div key={r.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderBottom: i < routes.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: 'rgba(201,162,39,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--brand-gold)',
                                }}>
                                    <Map size={16} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} /> {new Date(r.created_at).toLocaleDateString()}
                                        </span>
                                        <span className={`${styles.pill} ${r.status === 'approved' ? styles.pillDelivered : r.status === 'pending' ? styles.pillPending : styles.pillCancelled}`}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link href={`/search?route=${encodeURIComponent(r.name)}`} className={styles.btnGold} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                <Navigation size={13} /> View
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {/* Community Contribution */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Community Contribution</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This month</span>
            </div>
            <div className={styles.card}>
                <div style={{ display: 'flex', gap: 20, padding: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '-0.04em' }}>
                            {totalContributions}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            Total contributions this month
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{contributions}</strong> route suggestion{contributions !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{alertContributions}</strong> road alert{alertContributions !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{profile?.total_routes_verified || 0}</strong> route verifications
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
