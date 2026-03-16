'use client';

import { useState } from 'react';
import { FileText, Lock, Download, ArrowRight, Plus, Minus } from 'lucide-react';
import styles from './PointsLog.module.css';

const MOCK_LOG = [
    { id: 1, timestamp: '2026-03-16 21:45:03', admin: 'Christopher Eke', target: 'adaeze@example.com', direction: '+', amount: 500, reason: 'Competition winner — March 2026', before: 1200, after: 1700 },
    { id: 2, timestamp: '2026-03-16 19:10:22', admin: 'Belinda Osb', target: 'musa.dan@example.com', direction: '-', amount: 100, reason: 'Escalated abuse report — false alert filed', before: 850, after: 750 },
    { id: 3, timestamp: '2026-03-15 14:33:01', admin: 'Christopher Eke', target: 'grace.obi@example.com', direction: '+', amount: 200, reason: 'Referral bonus manual correction', before: 300, after: 500 },
    { id: 4, timestamp: '2026-03-15 10:12:47', admin: 'Christopher Eke', target: 'tunde.ad@example.com', direction: '+', amount: 50, reason: 'Route suggestion approval (milestone)', before: 950, after: 1000 },
    { id: 5, timestamp: '2026-03-14 09:00:00', admin: 'Belinda Osb', target: 'emeka.ok@example.com', direction: '-', amount: 200, reason: 'Policy violation — inappropriate content report', before: 2100, after: 1900 },
    { id: 6, timestamp: '2026-03-13 16:55:30', admin: 'Christopher Eke', target: 'chima.nw@example.com', direction: '+', amount: 1000, reason: 'Early adopter bonus (Batch 1)', before: 0, after: 1000 },
    { id: 7, timestamp: '2026-03-12 11:20:00', admin: 'Christopher Eke', target: 'bello.yu@example.com', direction: '+', amount: 200, reason: 'Successful referral — 3 users joined', before: 400, after: 600 },
    { id: 8, timestamp: '2026-03-10 08:30:11', admin: 'Belinda Osb', target: 'alice.ph@example.com', direction: '-', amount: 50, reason: 'Minor infraction — late order reporting', before: 750, after: 700 },
];

export default function PointsLogPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [adminFilter, setAdminFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState('all');

    const filtered = MOCK_LOG.filter(log => {
        const matchAdmin = !adminFilter || log.admin.toLowerCase().includes(adminFilter.toLowerCase());
        const matchDir = directionFilter === 'all' || log.direction === directionFilter;
        const matchStart = !startDate || log.timestamp >= startDate;
        const matchEnd = !endDate || log.timestamp <= endDate + ' 23:59:59';
        return matchAdmin && matchDir && matchStart && matchEnd;
    });

    const handleExport = () => {
        const header = 'Timestamp,Admin,Target User,Direction,Amount,Reason,Balance Before,Balance After';
        const rows = filtered.map(r =>
            `"${r.timestamp}","${r.admin}","${r.target}","${r.direction}","${r.amount}","${r.reason}","${r.before}","${r.after}"`
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dal-points-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Points Adjustment Log</h1>
            </div>

            <div className={styles.immutableBanner}>
                <Lock size={18} />
                This log is immutable. Records cannot be edited or deleted. All entries are cryptographically timestamped.
            </div>

            <div className={styles.toolbar}>
                <input
                    type="date"
                    className={styles.filterInput}
                    style={{ maxWidth: '160px' }}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    title="From date"
                />
                <input
                    type="date"
                    className={styles.filterInput}
                    style={{ maxWidth: '160px' }}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    title="To date"
                />
                <input
                    type="text"
                    className={styles.filterInput}
                    placeholder="Filter by admin name..."
                    value={adminFilter}
                    onChange={e => setAdminFilter(e.target.value)}
                />
                <select
                    className={styles.filterSelect}
                    value={directionFilter}
                    onChange={e => setDirectionFilter(e.target.value)}
                >
                    <option value="all">All Directions</option>
                    <option value="+">Additions (+)</option>
                    <option value="-">Deductions (−)</option>
                </select>
                <button className={styles.exportBtn} onClick={handleExport}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Admin</th>
                                <th>Target User</th>
                                <th>Direction</th>
                                <th>Points</th>
                                <th>Reason</th>
                                <th>Balance Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                                        <FileText size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                        <br />
                                        No log entries match your filters.
                                    </td>
                                </tr>
                            ) : filtered.map(log => (
                                <tr key={log.id}>
                                    <td className={styles.timestamp}>{log.timestamp}</td>
                                    <td className={styles.adminName}>{log.admin}</td>
                                    <td className={styles.targetUser}>{log.target}</td>
                                    <td>
                                        {log.direction === '+' ? (
                                            <span className={styles.directionPlus}><Plus size={12} /> Add</span>
                                        ) : (
                                            <span className={styles.directionMinus}><Minus size={12} /> Deduct</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={styles.amount} style={{ color: log.direction === '+' ? 'var(--color-success)' : 'var(--color-error)' }}>
                                            {log.direction}{log.amount.toLocaleString()} pts
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.reason}>{log.reason}</div>
                                    </td>
                                    <td>
                                        <div className={styles.balance}>
                                            <span className={styles.balanceBefore}>{log.before.toLocaleString()}</span>
                                            <ArrowRight size={12} className={styles.balanceArrow} />
                                            <span className={styles.balanceAfter}>{log.after.toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={styles.pagination}>
                    <span>{filtered.length} entries</span>
                    <button className={styles.pageBtn}>← Prev</button>
                    <button className={styles.pageBtn}>Next →</button>
                </div>
            </div>
        </div>
    );
}
