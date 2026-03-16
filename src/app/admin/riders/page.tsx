'use client';

import { useState } from 'react';
import { Search, Bike, User, Star, MoreVertical, X, MapPin, Package, AlertTriangle, Navigation, ShieldOff, CheckCircle } from 'lucide-react';
import styles from './AdminRiders.module.css';

// Mock Data
const MOCK_RIDERS = [
    {
        id: 'RDR-005', name: 'Emmanuel T.', phone: '+234 800 999 0000',
        status: 'online', isVerified: true, rating: 4.9, joined: '2026-01-15',
        vehicle: 'Kasea 150cc', location: 'GRA Phase 2',
        completedTrips: 142,
        history: [{ id: 'TRP-1002', dest: 'Peter Odili', date: 'Today at 2pm', status: 'completed' }]
    },
    {
        id: 'RDR-012', name: 'Samuel K.', phone: '+234 901 112 2334',
        status: 'offline', isVerified: true, rating: 4.5, joined: '2026-02-20',
        vehicle: 'TVS XL100', location: 'Trans-Amadi',
        completedTrips: 87,
        history: [{ id: 'TRP-900', dest: 'Woji', date: 'Yesterday', status: 'completed' }]
    },
    {
        id: 'RDR-099', name: 'David O.', phone: '+234 703 445 6677',
        status: 'pending_docs', isVerified: false, rating: 0, joined: '2026-03-16',
        vehicle: 'Qlink 150', location: 'Unknown',
        completedTrips: 0,
        history: []
    }
];

export default function AdminRidersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRider, setSelectedRider] = useState<any>(null);

    const filteredRiders = MOCK_RIDERS.filter(rider =>
        (filterStatus === 'all' ||
            (filterStatus === 'active' && (rider.status === 'online' || rider.status === 'offline')) ||
            (filterStatus === rider.status)
        ) &&
        (rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rider.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case 'online': return <div className={`${styles.statusDot} ${styles.dotOnline}`} title="Online & Ready" />;
            case 'offline': return <div className={`${styles.statusDot} ${styles.dotOffline}`} title="Offline" />;
            case 'pending_docs': return <div className={`${styles.statusDot} ${styles.dotPending}`} title="Pending Verification" />;
            default: return <div className={`${styles.statusDot} ${styles.dotSuspended}`} title="Suspended" />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Delivery Fleet</h1>
                    <p className={styles.subtitle}>Track active riders, verify documents, and manage fleet performance.</p>
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
                        <option value="active">Active (On/Offline)</option>
                        <option value="online">Online Currently</option>
                        <option value="pending_docs">Pending Docs</option>
                    </select>
                </div>

                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search rider name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Riders Table */}
                <div className={`${styles.tableWrap} ${selectedRider ? styles.shrinkTable : ''}`}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Driver Info</th>
                                <th>Contact & Vehicle</th>
                                <th>Location</th>
                                <th>Performance</th>
                                <th>Docs</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRiders.length > 0 ? filteredRiders.map(rider => (
                                <tr
                                    key={rider.id}
                                    className={`${styles.trHover} ${selectedRider?.id === rider.id ? styles.trActive : ''}`}
                                    onClick={() => setSelectedRider(rider)}
                                >
                                    <td>
                                        <div className={styles.riderInfo}>
                                            <div className={styles.avatarWrap}>
                                                {getStatusIndicator(rider.status)}
                                                <Bike size={18} />
                                            </div>
                                            <div>
                                                <div className={styles.riderName}>{rider.name}</div>
                                                <div className={styles.riderId}>{rider.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactRow}>{rider.phone}</div>
                                        <div className={styles.vehicleRow}>{rider.vehicle}</div>
                                    </td>
                                    <td>
                                        <div className={styles.locRow}>
                                            <MapPin size={12} /> {rider.location}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.perfWrap}>
                                            <span className={styles.ratingText}><Star size={12} fill="currentColor" /> {rider.rating > 0 ? rider.rating : 'N/A'}</span>
                                            <span className={styles.tripText}>{rider.completedTrips} trips</span>
                                        </div>
                                    </td>
                                    <td>
                                        {rider.isVerified ? (
                                            <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
                                        ) : (
                                            <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setSelectedRider(rider); }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className={styles.emptyTable}>
                                        <Bike size={32} className={styles.emptyIcon} />
                                        <p>No riders match your criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Side Panel */}
                {selectedRider && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h2>Fleet Details</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedRider(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.panelBody}>
                            {/* Profile Header */}
                            <div className={styles.profileHero}>
                                <div className={styles.heroAvatar}>
                                    <Bike size={32} />
                                    <div className={styles.heroStatusWrap}>
                                        {getStatusIndicator(selectedRider.status)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className={styles.heroName}>{selectedRider.name}</h3>
                                    <p className={styles.heroId}>{selectedRider.id}</p>
                                </div>
                            </div>

                            {/* Verification Block */}
                            <div className={styles.sectionWrap}>
                                <h4 className={styles.sectionTitle}>Verification Status</h4>
                                {selectedRider.isVerified ? (
                                    <div className={styles.verifyBoxSuccess}>
                                        <CheckCircle size={20} />
                                        <div>
                                            <strong>All Clear</strong>
                                            <p>Driver License and Guarantor forms verified.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.verifyBoxPending}>
                                        <AlertTriangle size={20} />
                                        <div style={{ flex: 1 }}>
                                            <strong>Documents Pending</strong>
                                            <p>New uploads require review.</p>
                                        </div>
                                        <button className={styles.btnReviewDocs}>Review Docs</button>
                                    </div>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Rating</span>
                                    <strong className={styles.statValueStar}><Star size={16} fill="currentColor" /> {selectedRider.rating > 0 ? selectedRider.rating : '-'}</strong>
                                </div>
                                <div className={styles.statBox}>
                                    <span className={styles.statLabel}>Total Trips</span>
                                    <strong className={styles.statValueRoute}>{selectedRider.completedTrips}</strong>
                                </div>
                            </div>

                            {/* Trip History */}
                            <div className={styles.sectionWrap}>
                                <h4 className={styles.sectionTitle}><Package size={16} /> Recent Trips</h4>
                                {selectedRider.history.length > 0 ? (
                                    selectedRider.history.map((trip: any) => (
                                        <div key={trip.id} className={styles.tripRow}>
                                            <div className={styles.tripInfo}>
                                                <strong>{trip.dest}</strong>
                                                <span className={styles.tripId}>{trip.id}</span>
                                            </div>
                                            <span className={styles.tripDate}>{trip.date}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.emptyText}>No trip history recorded.</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={styles.actionsWrapPanel}>
                                <h4 className={styles.sectionTitle}>Fleet Controls</h4>

                                {selectedRider.status !== 'suspended' ? (
                                    <button className={styles.btnDanger}>
                                        <ShieldOff size={16} /> Suspend Rider (Requires Reason)
                                    </button>
                                ) : (
                                    <button className={styles.btnSuccess}>
                                        <CheckCircle size={16} /> Lift Suspension
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
