'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, Map, Navigation, User, Calendar, 
    ThumbsUp, Eye, Check, X, AlertCircle, 
    Save, Trash2, Plus, Clock, Wallet, Car,
    ChevronDown, ChevronUp, History, ShieldCheck
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { updateRouteDetails, updateRouteStatus, approveRoute } from '../actions';
import styles from './AdminRoutes.module.css';

interface RouteLeg {
    type: string;
    location: string;
    instruction: string;
    vehicle: string;
    fare: number;
}

interface Route {
    id: string;
    name: string;
    origin: string;
    destination: string;
    description: string;
    status: string;
    submitted_by: string;
    profiles?: { full_name: string };
    upvote_count: number;
    created_at: string;
    legs: RouteLeg[];
    duration_minutes: number;
    fare_min: number;
    fare_max: number;
    vehicle_type_used: string;
}

export default function AdminRoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Editor State
    const [editName, setEditName] = useState('');
    const [editOrigin, setEditOrigin] = useState('');
    const [editDest, setEditDest] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLegs, setEditLegs] = useState<RouteLeg[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const supabase = createClient();

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('routes')
            .select('*, profiles(full_name)')
            .order('created_at', { ascending: false });

        if (data) setRoutes(data as any);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchRoutes();

        // Realtime Subscription
        const channel = supabase
            .channel('admin_routes_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, () => {
                fetchRoutes();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchRoutes]);

    const handleReview = (route: Route) => {
        setSelectedRoute(route);
        setEditName(route.name);
        setEditOrigin(route.origin);
        setEditDest(route.destination);
        setEditDesc(route.description || '');
        setEditLegs(Array.isArray(route.legs) ? route.legs : []);
        setIsEditing(false);
    };

    const addLeg = () => {
        setEditLegs([...editLegs, { type: 'stop', location: '', instruction: '', vehicle: 'bus', fare: 0 }]);
    };

    const removeLeg = (index: number) => {
        setEditLegs(editLegs.filter((_, i) => i !== index));
    };

    const updateLeg = (index: number, field: keyof RouteLeg, value: any) => {
        const newLegs = [...editLegs];
        newLegs[index] = { ...newLegs[index], [field]: value };
        setEditLegs(newLegs);
    };

    const handleSaveDetails = async () => {
        if (!selectedRoute) return;
        setIsSaving(true);
        const formData = new FormData();
        formData.append('routeId', selectedRoute.id);
        formData.append('name', editName);
        formData.append('start_location', editOrigin);
        formData.append('destination', editDest);
        formData.append('description', editDesc);
        formData.append('status', selectedRoute.status);
        formData.append('stopsJSON', JSON.stringify(editLegs));
        
        const result = await updateRouteDetails(formData);
        if (result.success) {
            setIsEditing(false);
            fetchRoutes();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleApprove = async () => {
        if (!selectedRoute) return;
        setIsSaving(true);
        const formData = new FormData();
        formData.append('routeId', selectedRoute.id);
        const result = await approveRoute(formData);
        if (result.success) {
            setSelectedRoute(null);
            fetchRoutes();
        } else {
            alert(result.error);
        }
        setIsSaving(false);
    };

    const handleReject = async () => {
        if (!selectedRoute) return;
        if (!confirm('Are you sure you want to reject this route?')) return;
        setIsSaving(true);
        const formData = new FormData();
        formData.append('routeId', selectedRoute.id);
        formData.append('status', 'rejected');
        const result = await updateRouteStatus(formData);
        if (result.success) {
            setSelectedRoute(null);
            fetchRoutes();
        }
        setIsSaving(false);
    };

    const tabs = [
        { id: 'pending', label: 'Pending Review' },
        { id: 'approved', label: 'Approved Routes' },
        { id: 'rejected', label: 'Rejected' }
    ];

    const filteredRoutes = routes.filter(r =>
        r.status === activeTab &&
        (r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.destination?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                    <button className={styles.actionBtn} onClick={fetchRoutes}>
                        <History size={16} /> Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Route Name</th>
                            <th>Path (Origin - Destination)</th>
                            <th>Submitted By</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className={styles.emptyTable}>
                                    <div className={styles.spinner} />
                                    <p>Loading routes...</p>
                                </td>
                            </tr>
                        ) : filteredRoutes.length > 0 ? filteredRoutes.map(route => (
                            <tr key={route.id} className={styles.trHover}>
                                <td className={styles.cellMain}>
                                    <div className={styles.routeName}>{route.name || 'Unnamed Route'}</div>
                                    <div className={styles.routeId}>{route.id.slice(0, 8)}...</div>
                                </td>
                                <td>
                                    <div className={styles.pathData}>
                                        <span className={styles.pathNode}>{route.origin}</span>
                                        <Navigation size={12} className={styles.pathArrow} />
                                        <span className={styles.pathNode}>{route.destination}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.iconData}>
                                        <User size={14} className={styles.dataIcon} /> {route.profiles?.full_name || 'Anonymous'}
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles['status_' + route.status]}`}>
                                        {route.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.iconData}>
                                        <Calendar size={14} className={styles.dataIcon} /> {new Date(route.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <button className={styles.actionBtn} onClick={() => handleReview(route)}>
                                        <Eye size={16} /> Review
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyTable}>
                                    <Map size={32} className={styles.emptyIcon} />
                                    <p>No routes found in this queue.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Review & Editor Panel */}
            {selectedRoute && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{isEditing ? 'Edit Route Details' : 'Review Route Submission'}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedRoute(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {!isEditing ? (
                                <>
                                    <div className={styles.modalTopMetrics}>
                                        <div className={styles.metricSquare}>
                                            <span>Route Identity</span>
                                            <strong>{selectedRoute.name}</strong>
                                        </div>
                                        <div className={styles.metricSquare}>
                                            <span>Submitted By</span>
                                            <strong className={styles.userLink}>{selectedRoute.profiles?.full_name || 'Anonymous'}</strong>
                                        </div>
                                        <div className={styles.metricSquare}>
                                            <span>Current Status</span>
                                            <strong className={`${styles.textSuccess} ${styles['status_' + selectedRoute.status]}`}>
                                                {selectedRoute.status}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className={styles.descBox}>
                                        <h3>User Description</h3>
                                        <p>{selectedRoute.description || 'No description provided.'}</p>
                                    </div>

                                    <div className={styles.legsTitle}>
                                        <Navigation size={18} /> Route Legs ({selectedRoute.legs?.length || 0})
                                    </div>
                                    
                                    <div className={styles.legsContainer}>
                                        {selectedRoute.legs?.map((leg, i) => (
                                            <div key={i} className={styles.legRow}>
                                                <div>
                                                    <div className={styles.legHeader}>Step {i+1}</div>
                                                    <strong>{leg.location}</strong>
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Instruction</div>
                                                    <span>{leg.instruction || 'None'}</span>
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Vehicle</div>
                                                    <span style={{ textTransform: 'capitalize' }}>{leg.vehicle}</span>
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Fare</div>
                                                    <span>₦{leg.fare}</span>
                                                </div>
                                                <div />
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.actionPanel}>
                                        {selectedRoute.status === 'pending' && (
                                            <>
                                                <button className={styles.btnApprove} onClick={handleApprove} disabled={isSaving}>
                                                    <Check size={18} /> {isSaving ? 'Approving...' : 'Approve to Core Map'}
                                                </button>
                                                <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>
                                                    <AlertCircle size={18} /> Edit Route Data
                                                </button>
                                                <button className={styles.btnDeny} onClick={handleReject} disabled={isSaving}>
                                                    <X size={18} /> Deny Route
                                                </button>
                                            </>
                                        )}
                                        {selectedRoute.status !== 'pending' && (
                                            <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>
                                                <AlertCircle size={18} /> Modify Metadata
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className={styles.editorForm}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Route Name</label>
                                            <input className={styles.input} value={editName} onChange={e => setEditName(e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Origin</label>
                                            <input className={styles.input} value={editOrigin} onChange={e => setEditOrigin(e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Destination</label>
                                            <input className={styles.input} value={editDest} onChange={e => setEditDest(e.target.value)} />
                                        </div>
                                        <div className={styles.field}>
                                            <label className={styles.label}>Description</label>
                                            <textarea className={styles.textarea} value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className={styles.legsTitle}>
                                        <Car size={18} /> Edit Junctions & Legs
                                    </div>

                                    <div className={styles.legsContainer}>
                                        {editLegs.map((leg, i) => (
                                            <div key={i} className={styles.legRow}>
                                                <div>
                                                    <div className={styles.legHeader}>Step {i+1} Location</div>
                                                    <input className={styles.input} value={leg.location} onChange={e => updateLeg(i, 'location', e.target.value)} />
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Instruction</div>
                                                    <input className={styles.input} value={leg.instruction} onChange={e => updateLeg(i, 'instruction', e.target.value)} />
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Vehicle</div>
                                                    <select className={styles.select} value={leg.vehicle} onChange={e => updateLeg(i, 'vehicle', e.target.value)}>
                                                        <option value="bus">Bus</option>
                                                        <option value="keke">Keke</option>
                                                        <option value="taxi">Taxi</option>
                                                        <option value="bike">Bike</option>
                                                        <option value="walking">Walking</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <div className={styles.legHeader}>Fare (₦)</div>
                                                    <input type="number" className={styles.input} value={leg.fare} onChange={e => updateLeg(i, 'fare', parseInt(e.target.value) || 0)} />
                                                </div>
                                                <button className={styles.removeLegBtn} onClick={() => removeLeg(i)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button className={styles.addLegBtn} onClick={addLeg}>
                                            <Plus size={16} /> Add Next Leg
                                        </button>
                                    </div>

                                    <div className={styles.actionPanel} style={{ marginTop: '32px' }}>
                                        <button className={styles.btnApprove} onClick={handleSaveDetails} disabled={isSaving}>
                                            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button className={styles.btnDeny} onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
