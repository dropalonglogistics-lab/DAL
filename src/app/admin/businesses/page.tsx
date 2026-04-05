'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Store, CheckCircle, XCircle, FileText, MapPin, Package, Eye, X, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getAdminBusinesses } from '../actions';
import styles from './AdminBusinesses.module.css';

interface Business {
    id: string;
    name: string;
    category: string;
    type: string;
    status: string;
    subscription_tier: string;
    address: string;
    rating_average: number;
    total_orders: number;
    created_at: string;
    email: string;
    phone: string;
    whatsapp?: string;
    owner_id: string;
    profiles?: { full_name: string };
    delivery_zones: string[];
    operating_hours: any;
    gallery_urls: string[];
}

export default function AdminBusinessesPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApp, setSelectedApp] = useState<Business | null>(null);

    const supabase = createClient();

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        const result = await getAdminBusinesses();
        if (result.success) {
            setBusinesses(result.data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBusinesses();

        const channel = supabase
            .channel('admin_businesses_all')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
                fetchBusinesses();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchBusinesses]);

    const handleDecision = async (bizId: string, status: string) => {
        if (!confirm(`Are you sure you want to set this business to ${status}?`)) return;
        
        // We'll assume updateBusinessStatus exists in actions.ts
        const { updateBusinessStatus } = await import('../actions');
        const formData = new FormData();
        formData.append('businessId', bizId);
        formData.append('status', status);
        
        const result = await updateBusinessStatus(formData);
        if (result.success) {
            setSelectedApp(null);
            fetchBusinesses();
        } else {
            alert(result.error);
        }
    };

    const filtered = businesses.filter(b => {
        const matchesStatus = activeTab === 'active' ? b.status === 'active' : b.status === 'pending';
        const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (b.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = businesses.filter(b => b.status === 'pending').length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Business Partner Management</h1>
                    <p className={styles.subtitle}>Review new seller applications and manage active storefronts in real-time.</p>
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
                        className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Application Queue <span className={styles.tabBadge}>{pendingCount}</span>
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
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div className={styles.spinner} />
                        <p>Syncing partner registry...</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            {activeTab === 'active' ? (
                                <tr>
                                    <th>Business Name</th>
                                    <th>Category & Type</th>
                                    <th>Owner</th>
                                    <th>Metrics</th>
                                    <th>Tier</th>
                                    <th>Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Application Info</th>
                                    <th>Business Type</th>
                                    <th>Owner & Contact</th>
                                    <th>Date Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(biz => (
                                <tr key={biz.id} className={styles.trHover}>
                                    {activeTab === 'active' ? (
                                        <>
                                            <td className={styles.cellMain}>
                                                <div className={styles.bizHeader}>
                                                    <div className={styles.bizIcon}><Store size={16} /></div>
                                                    <div>
                                                        <div className={styles.bizName}>{biz.name}</div>
                                                        <div className={styles.bizLoc}><MapPin size={12} /> {biz.address || 'Global'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.catWrap}>
                                                    <span className={styles.typeBadge}>{biz.type}</span>
                                                    <span className={styles.catText}>{biz.category}</span>
                                                </div>
                                            </td>
                                            <td>{biz.profiles?.full_name || 'Individual'}</td>
                                            <td>
                                                <div className={styles.metricsCol}>
                                                    <span className={styles.ratingText}><Star size={12} fill="currentColor" /> {biz.rating_average || 0}</span>
                                                    <span className={styles.orderText}><Package size={12} /> {biz.total_orders || 0}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.tierBadge} ${biz.subscription_tier === 'premium' ? styles.tierPremium : styles.tierFree}`}>
                                                    {biz.subscription_tier || 'free'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className={styles.actionBtn} onClick={() => setSelectedApp(biz)}>Details</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className={styles.cellMain}>
                                                <div className={styles.bizName}>{biz.name}</div>
                                                <div className={styles.appId}>{biz.id.slice(0, 8)}...</div>
                                            </td>
                                            <td>
                                                <div className={styles.catWrap}>
                                                    <span className={styles.typeBadge}>{biz.type}</span>
                                                    <span className={styles.catText}>{biz.category}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.ownerCol}>
                                                    <span className={styles.ownerTitle}>{biz.profiles?.full_name || 'Applicant'}</span>
                                                    <span className={styles.ownerSub}>{biz.email}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.dateText}>{new Date(biz.created_at).toLocaleDateString()}</span>
                                            </td>
                                            <td>
                                                <button className={styles.reviewBtn} onClick={() => setSelectedApp(biz)}>
                                                    <Eye size={16} /> Review
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className={styles.emptyTable}>No records found in this queue.</td>
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
                            <h2>{selectedApp.status === 'pending' ? 'Review Application' : 'Partner Profile'}: {selectedApp.name}</h2>
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
                                    <div className={styles.dataRow}>
                                        <span>Delivery Zones:</span>
                                        <div className={styles.tagWrap}>
                                            {selectedApp.delivery_zones?.map((zone: string) => (
                                                <span key={zone} className={styles.zoneTag}>{zone}</span>
                                            )) || 'Not specified'}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.infoCard}>
                                    <h3>Owner & Contact</h3>
                                    <div className={styles.dataRow}><span>Owner:</span> <strong>{selectedApp.profiles?.full_name || 'Individual'}</strong></div>
                                    <div className={styles.dataRow}><span>Email:</span> <strong>{selectedApp.email}</strong></div>
                                    <div className={styles.dataRow}><span>Phone:</span> <strong>{selectedApp.phone}</strong></div>
                                    <div className={styles.dataRow}><span>WhatsApp:</span> <strong>{selectedApp.whatsapp || 'N/A'}</strong></div>
                                </div>
                            </div>

                            <div className={styles.decisionPanel}>
                                <div className={styles.decisionTop}>
                                    <h3>Administrative Actions</h3>
                                    <p>Current Status: <strong style={{ textTransform: 'uppercase' }}>{selectedApp.status}</strong></p>
                                </div>

                                <div className={styles.actionRow}>
                                    {selectedApp.status === 'pending' ? (
                                        <>
                                            <button className={styles.btnApprove} onClick={() => handleDecision(selectedApp.id, 'active')}>
                                                <CheckCircle size={18} /> Approve Application
                                            </button>
                                            <button className={styles.btnReject} onClick={() => handleDecision(selectedApp.id, 'suspended')}>
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </>
                                    ) : (
                                        <button className={styles.btnReject} onClick={() => handleDecision(selectedApp.id, selectedApp.status === 'active' ? 'suspended' : 'active')}>
                                            {selectedApp.status === 'active' ? 'Suspend Business' : 'Reactivate Business'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
