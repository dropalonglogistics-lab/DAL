'use client';

import Link from 'next/link';
import {
    Star, Package, Map, Zap, Crown, Navigation,
    ArrowRight, TrendingUp, Users, AlertTriangle
} from 'lucide-react';
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

// Mock recent orders (replace with real Supabase query when orders table exists)
const MOCK_ORDERS = [
    { id: 'ORD-2024-001', type: 'Route', status: 'delivered', route: 'GRA → Trans-Amadi', amount: '₦1,200', date: '8 Mar 2026' },
    { id: 'ORD-2024-002', type: 'Errand', status: 'active', route: 'Mile 3 → New GRA', amount: '₦800', date: '7 Mar 2026' },
    { id: 'ORD-2024-003', type: 'Route', status: 'pending', route: 'Rumuola → Eleme Jct', amount: '₦600', date: '6 Mar 2026' },
];

// Mock saved routes (replace with real query when saved_routes table exists)
const MOCK_ROUTES = [
    { id: 1, name: 'Home → Work', alertCount: 3, lastUsed: 'Yesterday' },
    { id: 2, name: 'Market Run', alertCount: 1, lastUsed: '3 days ago' },
];

function StatusPill({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: styles.pillPending,
        active: styles.pillActive,
        delivered: styles.pillDelivered,
        cancelled: styles.pillCancelled,
        disputed: styles.pillDisputed,
    };
    return <span className={`${styles.pill} ${map[status] || styles.pillCancelled}`}>{status}</span>;
}

export default function DashboardOverview({
    profile,
    contributions,
    alertContributions,
}: {
    profile: any;
    contributions: number;
    alertContributions: number;
}) {
    const firstName = profile?.full_name?.split(' ')[0] || 'there';
    const totalContributions = contributions + alertContributions;

    const stats = [
        { icon: Star, label: 'Points Balance', value: (profile?.points_balance ?? 0).toLocaleString(), sub: 'DAL Points' },
        { icon: Package, label: 'Active Orders', value: '2', sub: 'In progress' },
        { icon: Map, label: 'Routes Saved', value: String(MOCK_ROUTES.length), sub: 'Quick navigate' },
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
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Route</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_ORDERS.map(o => (
                                <tr key={o.id} className={styles.tableRow}>
                                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.id}</td>
                                    <td>{o.type}</td>
                                    <td><StatusPill status={o.status} /></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{o.route}</td>
                                    <td style={{ fontWeight: 700 }}>{o.amount}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{o.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Saved Routes */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Saved Routes</h2>
                <Link href="/dashboard/routes" className={styles.sectionLink}>
                    Manage <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </Link>
            </div>
            <div className={styles.card} style={{ marginBottom: 28 }}>
                {MOCK_ROUTES.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Map size={22} /></div>
                        <p className={styles.emptyTitle}>No saved routes yet</p>
                        <p className={styles.emptyText}>Search for a route and save it for quick access.</p>
                    </div>
                ) : (
                    MOCK_ROUTES.map((r, i) => (
                        <div key={r.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px',
                            borderBottom: i < MOCK_ROUTES.length - 1 ? '1px solid var(--border)' : 'none',
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
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Last used {r.lastUsed}
                                        {r.alertCount > 0 && (
                                            <span style={{
                                                marginLeft: 8,
                                                background: 'rgba(239,68,68,0.1)',
                                                color: '#EF4444',
                                                padding: '1px 7px',
                                                borderRadius: 99,
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                            }}>
                                                {r.alertCount} alerts
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link href={`/search?route=${encodeURIComponent(r.name)}`} className={styles.btnGold} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                                <Navigation size={13} /> Navigate
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
                                <strong style={{ color: 'var(--text-primary)' }}>0</strong> route verifications
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
