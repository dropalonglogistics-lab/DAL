'use client';

import { useState, useMemo } from 'react';
import {
    Package, FileText, X, Download, Star,
    ChevronRight, RotateCcw, MapPin, User as UserIcon, Phone
} from 'lucide-react';
import styles from '../dashboard.module.css';

type OrderStatus = 'pending' | 'active' | 'delivered' | 'cancelled' | 'disputed';

interface Order {
    id: string;
    type: string;
    status: OrderStatus;
    route: string;
    amount: string;
    date: string;
    rider?: string;
    riderPhone?: string;
    timeline: { label: string; time: string; done: boolean }[];
}

const ALL_ORDERS: Order[] = [
    {
        id: 'ORD-2026-001', type: 'Route', status: 'delivered', route: 'GRA → Trans-Amadi',
        amount: '₦1,200', date: '2026-03-08',
        rider: 'Chukwuemeka Obi', riderPhone: '0801 234 5678',
        timeline: [
            { label: 'Order placed', time: '2026-03-08 08:02', done: true },
            { label: 'Rider assigned', time: '2026-03-08 08:05', done: true },
            { label: 'Pickup confirmed', time: '2026-03-08 08:20', done: true },
            { label: 'Delivered', time: '2026-03-08 09:10', done: true },
        ],
    },
    {
        id: 'ORD-2026-002', type: 'Errand', status: 'active', route: 'Mile 3 → New GRA',
        amount: '₦800', date: '2026-03-07',
        rider: 'Blessing Nwosu', riderPhone: '0901 876 5432',
        timeline: [
            { label: 'Order placed', time: '2026-03-07 14:30', done: true },
            { label: 'Rider assigned', time: '2026-03-07 14:38', done: true },
            { label: 'En route', time: '2026-03-07 14:55', done: true },
            { label: 'Delivered', time: '—', done: false },
        ],
    },
    {
        id: 'ORD-2026-003', type: 'Route', status: 'pending', route: 'Rumuola → Eleme Jct',
        amount: '₦600', date: '2026-03-06',
        timeline: [
            { label: 'Order placed', time: '2026-03-06 11:00', done: true },
            { label: 'Rider assigned', time: '—', done: false },
            { label: 'Pickup confirmed', time: '—', done: false },
            { label: 'Delivered', time: '—', done: false },
        ],
    },
    {
        id: 'ORD-2026-004', type: 'Route', status: 'cancelled', route: 'D/Line → Stadium',
        amount: '₦500', date: '2026-03-05',
        timeline: [
            { label: 'Order placed', time: '2026-03-05 09:15', done: true },
            { label: 'Cancelled by user', time: '2026-03-05 09:20', done: true },
        ],
    },
    {
        id: 'ORD-2026-005', type: 'Errand', status: 'disputed', route: 'Woji → PH Int\'l Airport',
        amount: '₦2,500', date: '2026-03-03',
        rider: 'Emeka Ibe', riderPhone: '0811 111 2222',
        timeline: [
            { label: 'Order placed', time: '2026-03-03 07:00', done: true },
            { label: 'Rider assigned', time: '2026-03-03 07:10', done: true },
            { label: 'Delivered (disputed)', time: '2026-03-03 08:30', done: true },
        ],
    },
];

function StatusPill({ status }: { status: OrderStatus }) {
    const map: Record<OrderStatus, string> = {
        pending: styles.pillPending, active: styles.pillActive,
        delivered: styles.pillDelivered, cancelled: styles.pillCancelled, disputed: styles.pillDisputed,
    };
    return <span className={`${styles.pill} ${map[status]}`}>{status}</span>;
}

function exportCSV(orders: Order[]) {
    const header = 'Reference,Type,Status,Route,Amount,Date';
    const rows = orders.map(o => `${o.id},${o.type},${o.status},"${o.route}",${o.amount},${o.date}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dal-orders.csv'; a.click();
    URL.revokeObjectURL(url);
}

const TABS = ['All', 'Active', 'Completed', 'Cancelled'] as const;

export default function OrdersPage() {
    const [tab, setTab] = useState<typeof TABS[number]>('All');
    const [selected, setSelected] = useState<Order | null>(null);
    const [rating, setRating] = useState(0);

    const filtered = useMemo(() => {
        switch (tab) {
            case 'Active': return ALL_ORDERS.filter(o => o.status === 'active' || o.status === 'pending');
            case 'Completed': return ALL_ORDERS.filter(o => o.status === 'delivered');
            case 'Cancelled': return ALL_ORDERS.filter(o => o.status === 'cancelled' || o.status === 'disputed');
            default: return ALL_ORDERS;
        }
    }, [tab]);

    return (
        <div className={styles.page}>
            <div className={styles.sectionHeader}>
                <h1 className={styles.sectionTitle} style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Orders</h1>
                <button className={styles.btnOutline} onClick={() => exportCSV(filtered)}>
                    <Download size={15} /> Export CSV
                </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabsRow}>
                {TABS.map(t => (
                    <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
                        {t}
                        <span style={{ marginLeft: 5, opacity: 0.6, fontSize: '0.72rem' }}>
                            {t === 'All' ? ALL_ORDERS.length :
                                t === 'Active' ? ALL_ORDERS.filter(o => o.status === 'active' || o.status === 'pending').length :
                                    t === 'Completed' ? ALL_ORDERS.filter(o => o.status === 'delivered').length :
                                        ALL_ORDERS.filter(o => o.status === 'cancelled' || o.status === 'disputed').length}
                        </span>
                    </button>
                ))}
            </div>

            <div className={styles.card}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Package size={22} /></div>
                        <p className={styles.emptyTitle}>No orders here</p>
                        <p className={styles.emptyText}>Orders in this category will appear here.</p>
                    </div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Reference</th><th>Type</th><th>Status</th>
                                    <th>Route</th><th>Amount</th><th>Date</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(order => (
                                    <tr key={order.id} className={styles.tableRow} onClick={() => setSelected(order)}>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8rem' }}>{order.id}</td>
                                        <td>{order.type}</td>
                                        <td><StatusPill status={order.status} /></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{order.route}</td>
                                        <td style={{ fontWeight: 700 }}>{order.amount}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{order.date}</td>
                                        <td><ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selected && (
                <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 className={styles.modalTitle}>{selected.id}</h2>
                                <StatusPill status={selected.status} />
                            </div>
                            <button className={styles.modalCloseBtn} onClick={() => setSelected(null)}><X size={16} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            {/* Route */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: 12, background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                                <MapPin size={16} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                                <span style={{ fontWeight: 600 }}>{selected.route}</span>
                                <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{selected.amount}</span>
                            </div>

                            {/* Rider info */}
                            {selected.rider && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, border: '1px solid var(--border)', borderRadius: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,162,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-gold)', flexShrink: 0 }}>
                                        <UserIcon size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selected.rider}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <Phone size={12} /> {selected.riderPhone}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>
                                Order Timeline
                            </h3>
                            <div className={styles.timeline}>
                                {selected.timeline.map((t, i) => (
                                    <div key={i} className={styles.timelineItem}>
                                        <div className={styles.timelineDotWrap}>
                                            <div className={`${styles.timelineDot} ${!t.done ? styles.timelineDotGrey : ''}`} />
                                            {i < selected.timeline.length - 1 && <div className={styles.timelineLine} />}
                                        </div>
                                        <div className={styles.timelineContent}>
                                            <div className={styles.timelineLabel} style={{ opacity: t.done ? 1 : 0.4 }}>{t.label}</div>
                                            <div className={styles.timelineTime}>{t.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Rating — only for delivered */}
                            {selected.status === 'delivered' && (
                                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>Rate this delivery</div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button key={s} onClick={() => setRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                                <Star size={24} fill={s <= rating ? '#C9A227' : 'none'} color={s <= rating ? '#C9A227' : 'var(--border)'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                {(selected.status === 'delivered' || selected.status === 'cancelled') && (
                                    <button className={styles.btnGold}>
                                        <RotateCcw size={15} /> Reorder
                                    </button>
                                )}
                                <button className={styles.btnOutline}>
                                    <FileText size={15} /> Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
