'use client';

import { useState } from 'react';
import { Search, Map, Navigation, User, Calendar, ThumbsUp, Eye, Check, X, AlertCircle } from 'lucide-react';
import styles from './AdminRoutes.module.css';

const MOCK_ROUTES = [
    {
        id: 'RT-1002', name: 'GRA Phase 2 Bypass', from: 'Rumuola Road', to: 'Tombia Street',
        submitter: 'Alex O.', upvotes: 45, date: '2026-03-15', status: 'pending',
        desc: 'Quickest way to avoid the evening gridlock around Rumuola junction by passing through the inner GRA streets.'
    },
    {
        id: 'RT-0998', name: 'Peter Odili Safe Route', from: 'Trans-Amadi', to: 'Slaughter',
        submitter: 'Kingsley E.', upvotes: 12, date: '2026-03-14', status: 'pending',
        desc: 'Avoids the main bad spots on the road.'
    },
    {
        id: 'RT-0950', name: 'NTA Road Shortcut', from: 'Choba', to: 'Rumuokwuta',
        submitter: 'Sarah M.', upvotes: 110, date: '2026-03-10', status: 'approved',
        desc: 'Very efficient route missing the market traffic.'
    },
];

export default function AdminRoutesPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoute, setSelectedRoute] = useState<any>(null);

    const tabs = [
        { id: 'pending', label: 'Pending Review' },
        { id: 'approved', label: 'Approved Routes' },
        { id: 'denied', label: 'Denied' }
    ];

    const filteredRoutes = MOCK_ROUTES.filter(r =>
        r.status === activeTab &&
        (r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.to.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Route Submissions</h1>
                    <p className={styles.subtitle}>Review community proposed routes for integration into the core map.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.tabsWrap}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.actionsWrap}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search routes..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                </div>
            </div>

            {/* Bulk Actions Placeholder */}
            {activeTab === 'pending' && filteredRoutes.length > 0 && (
                <div className={styles.bulkActions}>
                    <label className={styles.checkboxLabel}>
                        <input type="checkbox" className={styles.checkbox} /> Select All
                    </label>
                    <button className={styles.bulkApproveBtn} disabled>
                        <Check size={16} /> Approve Selected
                    </button>
                </div>
            )}

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {activeTab === 'pending' && <th className={styles.checkCol}></th>}
                            <th>Route Name</th>
                            <th>Path (From - To)</th>
                            <th>Submitted By</th>
                            <th>Upvotes</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoutes.length > 0 ? filteredRoutes.map(route => (
                            <tr key={route.id} className={styles.trHover}>
                                {activeTab === 'pending' && (
                                    <td className={styles.checkCol}>
                                        <input type="checkbox" className={styles.checkbox} onClick={(e) => e.stopPropagation()} />
                                    </td>
                                )}
                                <td className={styles.cellMain}>
                                    <div className={styles.routeName}>{route.name}</div>
                                    <div className={styles.routeId}>{route.id}</div>
                                </td>
                                <td>
                                    <div className={styles.pathData}>
                                        <span className={styles.pathNode}>{route.from}</span>
                                        <Navigation size={12} className={styles.pathArrow} />
                                        <span className={styles.pathNode}>{route.to}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.iconData}>
                                        <User size={14} className={styles.dataIcon} /> {route.submitter}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.successData}>
                                        <ThumbsUp size={14} className={styles.dataIconInfo} /> {route.upvotes}
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.iconData}>
                                        <Calendar size={14} className={styles.dataIcon} /> {route.date}
                                    </div>
                                </td>
                                <td>
                                    <button className={styles.actionBtn} onClick={() => setSelectedRoute(route)}>
                                        <Eye size={16} /> Review
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={activeTab === 'pending' ? 7 : 6} className={styles.emptyTable}>
                                    <Map size={32} className={styles.emptyIcon} />
                                    <p>No routes found in this queue.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Review Panel */}
            {selectedRoute && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Review Route Submission</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedRoute(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.modalTopMetrics}>
                                <div className={styles.metricSquare}>
                                    <span>Route Name</span>
                                    <strong>{selectedRoute.name}</strong>
                                </div>
                                <div className={styles.metricSquare}>
                                    <span>Submitted By</span>
                                    <a href="#" className={styles.userLink}>{selectedRoute.submitter}</a>
                                </div>
                                <div className={styles.metricSquare}>
                                    <span>Community Trust</span>
                                    <strong className={styles.textSuccess}>{selectedRoute.upvotes} Upvotes</strong>
                                </div>
                            </div>

                            <div className={styles.descBox}>
                                <h3>Description & Reason</h3>
                                <p>{selectedRoute.desc}</p>
                            </div>

                            <div className={styles.mapMockup}>
                                <div className={styles.mapOverlay}>
                                    <Map size={24} />
                                    <span>Mapbox Preview (Coordinates Loaded)</span>
                                </div>
                                {/* CSS Path Drawing Mockup */}
                                <svg className={styles.mockPath} viewBox="0 0 100 50">
                                    <path d="M10,40 Q30,20 50,30 T90,10" fill="none" stroke="var(--brand-gold)" strokeWidth="3" strokeDasharray="5,5" />
                                    <circle cx="10" cy="40" r="4" fill="#3B82F6" />
                                    <circle cx="90" cy="10" r="4" fill="#10B981" />
                                </svg>
                            </div>

                            {selectedRoute.status === 'pending' && (
                                <div className={styles.actionPanel}>
                                    <button className={styles.btnApprove}>
                                        <Check size={18} /> Approve to Core Map
                                    </button>
                                    <button className={styles.btnEdit}>
                                        <AlertCircle size={18} /> Request Edit (Reason)
                                    </button>
                                    <button className={styles.btnDeny}>
                                        <X size={18} /> Deny Route (Reason)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
