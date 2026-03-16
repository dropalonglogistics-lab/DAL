'use client';

import { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, XCircle, AlertTriangle, AlertOctagon, Info, MapPin, Clock, User } from 'lucide-react';
import styles from './AdminAlerts.module.css';

// Mock Data
const MOCK_ALERTS = [
    {
        id: 'ALT-4921', type: 'Accident', location: 'Eleme Junction',
        reporter: 'Victor N.', time: '10 mins ago', upvotes: 45,
        status: 'pending', severity: 'high',
        desc: 'Major collision blocking 2 lanes.'
    },
    {
        id: 'ALT-4920', type: 'Traffic Jam', location: 'Aba Road',
        reporter: 'System Auto', time: '15 mins ago', upvotes: 120,
        status: 'verified', severity: 'medium',
        desc: 'Heavy buildup from Waterlines to Garrison.'
    },
    {
        id: 'ALT-4919', type: 'Taskforce', location: 'Agip Estate Area',
        reporter: 'Kelvin R.', time: '45 mins ago', upvotes: 8,
        status: 'pending', severity: 'medium',
        desc: 'Local government taskforce impounding vehicles by the roundabout.'
    },
    {
        id: 'ALT-4915', type: 'Road Closed', location: 'Old GRA',
        reporter: 'Boma O.', time: '2 hours ago', upvotes: 2,
        status: 'dismissed', severity: 'low',
        desc: 'Minor pothole repair, road is actually mostly clear now.'
    }
];

export default function AdminAlertsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredAlerts = MOCK_ALERTS.filter(alert =>
        (filterStatus === 'all' || alert.status === filterStatus) &&
        (alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIconForType = (type: string) => {
        switch (type) {
            case 'Accident': return <AlertOctagon size={16} />;
            case 'Traffic Jam': return <AlertTriangle size={16} />;
            case 'Taskforce': return <ShieldAlert size={16} />;
            default: return <Info size={16} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified': return <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>;
            case 'dismissed': return <span className={`${styles.badge} ${styles.badgeDismissed}`}>Dismissed</span>;
            case 'escalated': return <span className={`${styles.badge} ${styles.badgeEscalated}`}>Escalated</span>;
            default: return <span className={`${styles.badge} ${styles.badgePending}`}>Pending Review</span>;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Live Alerts Moderation</h1>
                    <p className={styles.subtitle}>Verify, dismiss, or escalate community reported incidents across Port Harcourt.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.filterWrap}>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Review</option>
                        <option value="verified">Verified Active</option>
                        <option value="dismissed">Dismissed/Resolved</option>
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search locations or types..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Alert Details</th>
                            <th>Location & Time</th>
                            <th>Reporter</th>
                            <th>Status & Trust</th>
                            <th className={styles.actionsBox}>Moderation Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                            <tr key={alert.id} className={styles.trHover}>
                                <td className={styles.cellMain}>
                                    <div className={styles.typeWrap}>
                                        <div className={`${styles.typeIcon} ${alert.severity === 'high' ? styles.iconHigh : styles.iconNormal}`}>
                                            {getIconForType(alert.type)}
                                        </div>
                                        <div>
                                            <div className={styles.typeText}>{alert.type}</div>
                                            <div className={styles.idText}>{alert.id}</div>
                                        </div>
                                    </div>
                                    <p className={styles.descText}>{alert.desc}</p>
                                </td>
                                <td>
                                    <div className={styles.metaRow}>
                                        <MapPin size={14} className={styles.metaIcon} />
                                        <span className={styles.metaMain}>{alert.location}</span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <Clock size={14} className={styles.metaIcon} />
                                        <span className={styles.metaSub}>{alert.time}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.metaRow}>
                                        <User size={14} className={styles.metaIcon} />
                                        <span className={styles.metaMain}>{alert.reporter}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.statusWrap}>
                                        {getStatusBadge(alert.status)}
                                        <div className={styles.upvoteWrap}>
                                            <span className={styles.upvoteCount}>{alert.upvotes}</span>
                                            <span className={styles.upvoteLabel}>Confirms</span>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.actionsBox}>
                                    {alert.status === 'pending' ? (
                                        <div className={styles.actionGrid}>
                                            <button className={`${styles.actionBtn} ${styles.btnVerify}`} title="Verify & Broadcast">
                                                <CheckCircle size={16} /> Verify
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.btnDismiss}`} title="Dismiss as False">
                                                <XCircle size={16} /> Dismiss
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.btnEscalate}`} title="Escalate to Emergency Services">
                                                <ShieldAlert size={16} /> Escalate
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={styles.resolvedText}>Action taken</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className={styles.emptyTable}>
                                    <ShieldAlert size={32} className={styles.emptyIcon} />
                                    <p>No alerts match your filter criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
