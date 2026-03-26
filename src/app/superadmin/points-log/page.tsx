'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Lock, Download, ArrowRight, Plus, Minus, Loader, RefreshCw } from 'lucide-react';
import styles from './PointsLog.module.css';

type LogEntry = {
    id: string;
    created_at: string;
    admin_name: string;
    target_email: string;
    direction: '+' | '-';
    amount: number;
    reason: string;
    balance_before: number;
    balance_after: number;
};

export default function PointsLogPage() {
    const [rows, setRows] = useState<LogEntry[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [adminFilter, setAdminFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState('all');

    const fetchLog = useCallback(async (pg = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.set('start', startDate);
            if (endDate) params.set('end', endDate);
            if (adminFilter) params.set('admin', adminFilter);
            if (directionFilter !== 'all') params.set('direction', directionFilter);
            params.set('page', String(pg));
            params.set('limit', '50');

            const res = await fetch(`/api/superadmin/points-log?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRows(data.rows || []);
                setTotal(data.total ?? 0);
                setPage(pg);
            }
        } catch (err) {
            console.error('Failed to fetch points log:', err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, adminFilter, directionFilter]);

    useEffect(() => { fetchLog(1); }, [fetchLog]);

    const handleExport = () => {
        if (rows.length === 0) { alert('No entries to export.'); return; }
        const header = 'Timestamp,Admin,Target User,Direction,Amount,Reason,Balance Before,Balance After';
        const csvRows = rows.map(r =>
            `"${r.created_at}","${r.admin_name}","${r.target_email}","${r.direction}","${r.amount}","${r.reason}","${r.balance_before}","${r.balance_after}"`
        );
        const csv = [header, ...csvRows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dal-points-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const totalPages = Math.ceil(total / 50);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Points Adjustment Log</h1>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                    {total.toLocaleString()} total entries
                </p>
            </div>

            <div className={styles.immutableBanner}>
                <Lock size={18} />
                This log is immutable. Records cannot be edited or deleted. All entries are cryptographically timestamped.
            </div>

            <div className={styles.toolbar}>
                <input
                    type="date" className={styles.filterInput} style={{ maxWidth: '160px' }}
                    value={startDate} onChange={e => setStartDate(e.target.value)} title="From date"
                />
                <input
                    type="date" className={styles.filterInput} style={{ maxWidth: '160px' }}
                    value={endDate} onChange={e => setEndDate(e.target.value)} title="To date"
                />
                <input
                    type="text" className={styles.filterInput} placeholder="Filter by admin name..."
                    value={adminFilter} onChange={e => setAdminFilter(e.target.value)}
                />
                <select className={styles.filterSelect} value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}>
                    <option value="all">All Directions</option>
                    <option value="+">Additions (+)</option>
                    <option value="-">Deductions (−)</option>
                </select>
                <button className={styles.exportBtn} onClick={handleExport}>
                    <Download size={16} /> Export CSV
                </button>
                <button className={styles.exportBtn} onClick={() => fetchLog(1)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
                    <RefreshCw size={16} />
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
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                                        <Loader size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                                        <br />Loading entries...
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                                        <FileText size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                        <br />No log entries match your filters.
                                    </td>
                                </tr>
                            ) : rows.map(log => (
                                <tr key={log.id}>
                                    <td className={styles.timestamp}>{formatDate(log.created_at)}</td>
                                    <td className={styles.adminName}>{log.admin_name}</td>
                                    <td className={styles.targetUser}>{log.target_email}</td>
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
                                            <span className={styles.balanceBefore}>{log.balance_before.toLocaleString()}</span>
                                            <ArrowRight size={12} className={styles.balanceArrow} />
                                            <span className={styles.balanceAfter}>{log.balance_after.toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && total > 0 && (
                    <div className={styles.pagination}>
                        <span>{rows.length} of {total.toLocaleString()} entries</span>
                        <button
                            className={styles.pageBtn}
                            disabled={page <= 1}
                            onClick={() => fetchLog(page - 1)}
                        >← Prev</button>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
                        <button
                            className={styles.pageBtn}
                            disabled={page >= totalPages}
                            onClick={() => fetchLog(page + 1)}
                        >Next →</button>
                    </div>
                )}
            </div>
        </div>
    );
}
