'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, Download, Check, X, AlertCircle, BarChart2, Loader } from 'lucide-react';
import styles from './Financials.module.css';

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const MRR_DATA = [820000, 940000, 1050000, 1280000, 1400000, 1310000, 1670000, 1920000, 2100000, 2450000, 2800000, 3120000];
const MAX_MRR = Math.max(...MRR_DATA);

const PENDING_PAYOUTS = [
    { id: 1, name: 'Emeka Okafor', type: 'Rider', trips: 48, amount: 92400, dueDate: '2026-03-16', checked: false },
    { id: 2, name: 'Adaeze Emmanuel', type: 'Errand Worker', trips: 22, amount: 38500, dueDate: '2026-03-16', checked: false },
    { id: 3, name: 'Bello Yusuf', type: 'Rider', trips: 35, amount: 64200, dueDate: '2026-03-15', checked: false },
    { id: 4, name: 'Chiamaka Nwosu', type: 'Errand Worker', trips: 18, amount: 29700, dueDate: '2026-03-15', checked: false },
];

const DISPUTES = [
    { id: 'd1', orderId: 'ORD-9021', customer: 'Tunde Adeyemi', amount: 4500, reason: 'Order not received', status: 'Open', date: '2026-03-14' },
    { id: 'd2', orderId: 'ORD-8931', customer: 'Grace Obi', amount: 10200, reason: 'Wrong item delivered', status: 'Escalated', date: '2026-03-13' },
    { id: 'd3', orderId: 'ORD-9101', customer: 'Musa Danladi', amount: 2800, reason: 'Delivery damaged', status: 'Open', date: '2026-03-16' },
];

export default function FinancialsPage() {
    const [selected, setSelected] = useState<number[]>([]);
    const [payouts, setPayouts] = useState(PENDING_PAYOUTS);
    const [approving, setApproving] = useState<number[]>([]);
    const [disputeModal, setDisputeModal] = useState<typeof DISPUTES[0] | null>(null);

    const toggleSelect = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const approvePayouts = async (ids: number[]) => {
        const targets = payouts.filter(p => ids.includes(p.id));
        setApproving(ids);
        try {
            const res = await fetch('/api/superadmin/payouts/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payouts: targets }),
            });
            const data = await res.json();
            const results = data.results || [];
            const successIds = results.filter((r: { status: string }) => r.status === 'success' || r.status === 'simulated').map((r: { id: number }) => r.id);
            const messages = results.map((r: { id: number; message: string }) => r.message).join('\n');
            alert(messages || `Approved ${ids.length} payout(s).`);
            // Remove approved payouts from the list
            if (successIds.length > 0) {
                setPayouts(prev => prev.filter(p => !successIds.includes(p.id)));
            }
            setSelected([]);
        } catch (err) {
            alert('Network error approving payouts.');
        } finally {
            setApproving([]);
        }
    };

    const handleBulkApprove = () => {
        if (selected.length === 0) return alert('No payouts selected.');
        if (!confirm(`Approve ${selected.length} payout(s) via Paystack Transfer?`)) return;
        approvePayouts(selected);
    };

    const handleRefund = (type: string) => {
        alert(`Resolved dispute for ${disputeModal?.orderId} — ${type} Refund issued.`);
        setDisputeModal(null);
    };

    const fmt = (n: number) => '₦' + n.toLocaleString();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Financials Overview</h1>
                    <p className={styles.subtitle}>Revenue streams, pending payouts, and dispute management.</p>
                </div>
                <div className={styles.headerActions}>
                    <select className={styles.dateFilter}>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>This Year</option>
                    </select>
                    <button className={styles.exportBtn} onClick={() => alert('Exporting CSV...')}>
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className={styles.kpiGrid}>
                {[
                    { icon: DollarSign, label: 'Monthly Recurring Revenue', value: fmt(3120000), trend: '+11.4% vs last month', up: true },
                    { icon: TrendingUp, label: 'Delivery Revenue (MTD)', value: fmt(1840000), trend: '+8.2% vs last month', up: true },
                    { icon: CreditCard, label: 'Subscriptions (MTD)', value: fmt(920000), trend: '+21.0% vs last month', up: true },
                    { icon: Users, label: 'Marketplace & Errand', value: fmt(360000), trend: '-3.5% vs last month', up: false },
                ].map(({ icon: Icon, label, value, trend, up }) => (
                    <div key={label} className={styles.kpiCard}>
                        <div className={styles.kpiLabel}><Icon size={18} /> {label}</div>
                        <h2 className={styles.kpiValue}>{value}</h2>
                        <span className={`${styles.kpiTrend} ${up ? styles.trendUp : styles.trendDown}`}>{trend}</span>
                    </div>
                ))}
            </div>

            {/* MRR Chart */}
            <div className={styles.chartSection}>
                <div className={styles.chartHeader}>
                    <h3><BarChart2 size={20} /> MRR — Last 12 Months</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>April 2025 → March 2026</span>
                </div>
                <div className={styles.chartPlaceholder}>
                    {MRR_DATA.map((val, i) => (
                        <div
                            key={i}
                            className={styles.bar}
                            style={{ height: `${(val / MAX_MRR) * 95}%` }}
                        >
                            <div className={styles.barTooltip}>{MONTHS[i]}: {fmt(val)}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                    {MONTHS.map(m => (
                        <span key={m} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m}</span>
                    ))}
                </div>
            </div>

            {/* Pending Payouts */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h3><DollarSign size={20} /> Pending Payouts</h3>
                    <div className={styles.tableActions}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                            {selected.length} selected
                        </span>
                        <button className={styles.bulkApproveBtn} onClick={handleBulkApprove}>
                            Bulk Approve
                        </button>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th><input type="checkbox" onChange={e => setSelected(e.target.checked ? PENDING_PAYOUTS.map(p => p.id) : [])} /></th>
                                <th>Worker</th>
                                <th>Type</th>
                                <th>Trips</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(p => (
                                <tr key={p.id}>
                                    <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td><span className={`${styles.badge} ${styles.badgePending}`}>{p.type}</span></td>
                                    <td>{p.trips}</td>
                                    <td><span className={styles.amount}>{fmt(p.amount)}</span></td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.dueDate}</td>
                                    <td>
                                        <div className={styles.actionGroup}>
                                            <button className={styles.btnApprove} onClick={() => approvePayouts([p.id])} disabled={approving.includes(p.id)}>
                                                {approving.includes(p.id) ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />} Approve
                                            </button>
                                            <button className={styles.btnHold} onClick={() => alert(`Payout for ${p.name} placed on hold.`)}>
                                                Hold
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dispute Management */}
            <div className={styles.tableSection}>
                <div className={styles.tableHeader}>
                    <h3><AlertCircle size={20} /> Open Disputes</h3>
                </div>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Date Filed</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DISPUTES.map(d => (
                                <tr key={d.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{d.orderId}</td>
                                    <td>{d.customer}</td>
                                    <td><span className={styles.amount}>{fmt(d.amount)}</span></td>
                                    <td>{d.reason}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{d.date}</td>
                                    <td>
                                        <span className={`${styles.badge} ${d.status === 'Escalated' ? styles.badgeHighPriority : styles.badgePending}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.btnDetail} onClick={() => setDisputeModal(d)}>Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dispute Modal */}
            {disputeModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Dispute — {disputeModal.orderId}</h2>
                            <button onClick={() => setDisputeModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.disputeDetail}>
                                <p><strong>Customer:</strong> {disputeModal.customer}</p>
                                <p><strong>Order Amount:</strong> {fmt(disputeModal.amount)}</p>
                                <p><strong>Reason:</strong> {disputeModal.reason}</p>
                                <p><strong>Filed:</strong> {disputeModal.date}</p>
                                <p><strong>Status:</strong> {disputeModal.status}</p>
                            </div>
                            <h4>Resolution Action</h4>
                            <div className={styles.refundOptions}>
                                <button className={`${styles.refundBtn} ${styles.full}`} onClick={() => handleRefund('Full')}>
                                    Full Refund<br />{fmt(disputeModal.amount)}
                                </button>
                                <button className={`${styles.refundBtn} ${styles.partial}`} onClick={() => handleRefund('Partial')}>
                                    Partial Refund<br />{fmt(Math.floor(disputeModal.amount / 2))}
                                </button>
                                <button className={`${styles.refundBtn} ${styles.no}`} onClick={() => handleRefund('No')}>
                                    No Refund<br />Close Dispute
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
