'use client';

import { useState } from 'react';
import { Search, Store, CheckCircle, XCircle, FileText, MapPin, Package, Eye, X, Star } from 'lucide-react';
import styles from './AdminBusinesses.module.css';

// Mock Data
const MOCK_BUSINESSES = [
    {
        id: 'BIZ-092', name: 'Kilimanjaro GRA', owner: 'Amaka P.',
        category: 'Food', type: 'Products', status: 'active', tier: 'premium',
        rating: 4.8, orders: 1250, location: 'GRA Phase 2'
    },
    {
        id: 'BIZ-090', name: 'Port Harcourt Auto Repairs', owner: 'Victor S.',
        category: 'Auto', type: 'Services', status: 'active', tier: 'free',
        rating: 4.2, orders: 85, location: 'Trans-Amadi'
    }
];

const MOCK_APPS = [
    {
        id: 'APP-105', name: 'Spice Route Express', owner: 'Chinedu O.',
        category: 'Food', type: 'Products', date: '2026-03-16', status: 'pending',
        phone: '+234 800 123 4567', whatsapp: '+234 800 123 4567', email: 'chinedu@spiceroute.com',
        address: '15 Aba Road, Port Harcourt',
        zones: ['GRA', 'D-Line', 'Diobu'],
        hours: { open: '08:00', close: '22:00' },
        docs: ['brand_logo.jpg', 'kitchen_interior.jpg', 'menu_sample.pdf']
    },
    {
        id: 'APP-104', name: 'Glow Up Beauty Hub', owner: 'Boma I.',
        category: 'Health & Beauty', type: 'Services', date: '2026-03-15', status: 'pending',
        phone: '+234 901 987 6543', whatsapp: '', email: 'hello@glowup.ng',
        address: 'Peter Odili Road',
        zones: ['Trans-Amadi', 'Woji'],
        hours: { open: '09:00', close: '18:00' },
        docs: ['logo.png', 'salon_front.jpg']
    }
];

export default function AdminBusinessesPage() {
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'queue'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApp, setSelectedApp] = useState<any>(null);

    const filteredActive = MOCK_BUSINESSES.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredApps = MOCK_APPS.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Business Partner Management</h1>
                    <p className={styles.subtitle}>Review new seller applications and manage active storefronts.</p>
                </div>
            </div>

            <div className={styles.toolbar}>
                <div className={styles.tabsWrap}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'active' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Businesses
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'queue' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('queue')}
                    >
                        Application Queue <span className={styles.tabBadge}>{MOCK_APPS.length}</span>
                    </button>
                </div>

                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search business or owner..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrap}>
                {activeTab === 'active' ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Business Name</th>
                                <th>Category & Type</th>
                                <th>Owner</th>
                                <th>Metrics</th>
                                <th>Tier</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActive.length > 0 ? filteredActive.map(biz => (
                                <tr key={biz.id} className={styles.trHover}>
                                    <td className={styles.cellMain}>
                                        <div className={styles.bizHeader}>
                                            <div className={styles.bizIcon}><Store size={16} /></div>
                                            <div>
                                                <div className={styles.bizName}>{biz.name}</div>
                                                <div className={styles.bizLoc}><MapPin size={12} /> {biz.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.catWrap}>
                                            <span className={styles.typeBadge}>{biz.type}</span>
                                            <span className={styles.catText}>{biz.category}</span>
                                        </div>
                                    </td>
                                    <td>{biz.owner}</td>
                                    <td>
                                        <div className={styles.metricsCol}>
                                            <span className={styles.ratingText}><Star size={12} fill="currentColor" /> {biz.rating}</span>
                                            <span className={styles.orderText}><Package size={12} /> {biz.orders}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.tierBadge} ${biz.tier === 'premium' ? styles.tierPremium : styles.tierFree}`}>
                                            {biz.tier}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn}>Manage</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className={styles.emptyTable}>No active businesses found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Application Info</th>
                                <th>Business Type</th>
                                <th>Owner & Contact</th>
                                <th>Date Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApps.length > 0 ? filteredApps.map(app => (
                                <tr key={app.id} className={styles.trHover}>
                                    <td className={styles.cellMain}>
                                        <div className={styles.bizName}>{app.name}</div>
                                        <div className={styles.appId}>{app.id}</div>
                                    </td>
                                    <td>
                                        <div className={styles.catWrap}>
                                            <span className={styles.typeBadge}>{app.type}</span>
                                            <span className={styles.catText}>{app.category}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.ownerCol}>
                                            <span className={styles.ownerTitle}>{app.owner}</span>
                                            <span className={styles.ownerSub}>{app.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.dateText}>{app.date}</span>
                                    </td>
                                    <td>
                                        <button className={styles.reviewBtn} onClick={() => setSelectedApp(app)}>
                                            <Eye size={16} /> Review
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className={styles.emptyTable}>No pending applications.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Application Review Modal */}
            {selectedApp && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Review Application: {selectedApp.name}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedApp(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoCard}>
                                    <h3>Business Details</h3>
                                    <div className={styles.dataRow}><span>Name:</span> <strong>{selectedApp.name}</strong></div>
                                    <div className={styles.dataRow}><span>Category:</span> <strong>{selectedApp.category} ({selectedApp.type})</strong></div>
                                    <div className={styles.dataRow}><span>Address:</span> <strong>{selectedApp.address}</strong></div>
                                    <div className={styles.dataRow}><span>Operating Hrs:</span> <strong>{selectedApp.hours.open} - {selectedApp.hours.close}</strong></div>
                                    <div className={styles.dataRow}>
                                        <span>Delivery Zones:</span>
                                        <div className={styles.tagWrap}>
                                            {selectedApp.zones.map((zone: string) => (
                                                <span key={zone} className={styles.zoneTag}>{zone}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.infoCard}>
                                    <h3>Owner Details</h3>
                                    <div className={styles.dataRow}><span>Name:</span> <strong>{selectedApp.owner}</strong></div>
                                    <div className={styles.dataRow}><span>Email:</span> <strong>{selectedApp.email}</strong></div>
                                    <div className={styles.dataRow}><span>Phone:</span> <strong>{selectedApp.phone}</strong></div>
                                    {selectedApp.whatsapp && <div className={styles.dataRow}><span>WhatsApp:</span> <strong>{selectedApp.whatsapp}</strong></div>}
                                </div>
                            </div>

                            <div className={styles.docsSection}>
                                <h3>Uploaded Documents</h3>
                                <div className={styles.docGrid}>
                                    {selectedApp.docs.map((doc: string) => (
                                        <div key={doc} className={styles.docItem}>
                                            <FileText size={24} className={styles.docIcon} />
                                            <span>{doc}</span>
                                            <button className={styles.textBtn}>View</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.decisionPanel}>
                                <div className={styles.decisionTop}>
                                    <h3>Moderation Decision</h3>
                                    <p>Approving will create the storefront and notify the owner.</p>
                                </div>

                                <div className={styles.tierSelectWrap}>
                                    <label>Set Approved Tier:</label>
                                    <select className={styles.tierSelect}>
                                        <option value="free">Free Tier (Standard features)</option>
                                        <option value="premium">Premium Trial (3 Months Free)</option>
                                        <option value="pro">Pro (Commission Based)</option>
                                    </select>
                                </div>

                                <div className={styles.actionRow}>
                                    <button className={styles.btnApprove}>
                                        <CheckCircle size={18} /> Approve Application
                                    </button>
                                    <button className={styles.btnReject}>
                                        <XCircle size={18} /> Reject (Reason Required)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
