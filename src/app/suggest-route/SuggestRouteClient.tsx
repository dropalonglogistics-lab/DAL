'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Navigation, Info, 
    Clock, Wallet, Plus, Trash2,
    Zap, Award, ShieldCheck, User as UserIcon,
    Eye, Car
} from 'lucide-react';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import styles from './suggest-route.module.css';

const VEHICLE_OPTIONS = [
    { id: 'keke', label: 'Keke', icon: '🛺' },
    { id: 'keke bus', label: 'Keke Bus', icon: '🚐' },
    { id: 'bus', label: 'Bus', icon: '🚌' },
    { id: 'taxi', label: 'Taxi', icon: '🚕' },
    { id: 'bike', label: 'Bike', icon: '🏍️' }
];

interface Stop {
    id: string;
    location: string;
}

type FormStep = 'builder' | 'success';

export default function SuggestRouteClient() {
    const [step, setStep] = useState<FormStep>('builder');
    const [routeTitle, setRouteTitle] = useState('');
    const [startLocation, setStartLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [stops, setStops] = useState<Stop[]>([
        { id: '1', location: '' }
    ]);
    const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['keke bus']);
    const [timeMin, setTimeMin] = useState('');
    const [timeMax, setTimeMax] = useState('');
    const [fareMin, setFareMin] = useState('');
    const [fareMax, setFareMax] = useState('');
    const [difficulty, setDifficulty] = useState('Moderate');
    const [roadCondition, setRoadCondition] = useState('Good');
    const [detailedDirections, setDetailedDirections] = useState('');
    const [tipsAndWarnings, setTipsAndWarnings] = useState('');
    
    const [description, setDescription] = useState('');
    const [attributionName, setAttributionName] = useState('');
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        async function getAuth() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);
            if (authUser?.user_metadata?.full_name) {
                setAttributionName(authUser.user_metadata.full_name);
            }
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', authUser.id).single();
                setIsAdmin(!!profile?.is_admin);
            }
        }
        getAuth();
    }, [supabase]);

    const toggleVehicle = (id: string) => {
        setSelectedVehicles(prev => 
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        );
    };

    const addStop = () => {
        setStops([...stops, { id: Math.random().toString(36).substr(2, 9), location: '' }]);
    };

    const removeStop = (id: string) => {
        if (stops.length > 1) setStops(stops.filter(s => s.id !== id));
    };

    const updateStop = (id: string, val: string) => {
        setStops(stops.map(s => s.id === id ? { ...s, location: val } : s));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!routeTitle.trim()) newErrors.routeTitle = 'Route title required';
        if (!startLocation.trim()) newErrors.startLocation = 'Start point required';
        if (!destination.trim()) newErrors.destination = 'Final destination required';
        if (selectedVehicles.length === 0) newErrors.vehicles = 'Select at least one vehicle';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            formData.append('type', 'route');
            formData.append('routeTitle', routeTitle);
            formData.append('start_location', startLocation);
            formData.append('destination', destination);
            formData.append('vehicle_type_used', selectedVehicles.join(', '));
            formData.append('timeMin', timeMin);
            formData.append('timeMax', timeMax);
            formData.append('fareMin', fareMin);
            formData.append('fareMax', fareMax);
            formData.append('difficulty', difficulty);
            formData.append('roadCondition', roadCondition);
            formData.append('detailedDirections', detailedDirections);
            formData.append('tipsAndWarnings', tipsAndWarnings);
            formData.append('description', description);

            const stopsAlongTheWay = [
                { type: 'start', location: startLocation, instruction: 'Starting point.', vehicle: selectedVehicles[0], fare: 0 },
                ...stops.filter(s => s.location.trim()).map(s => ({
                    type: 'stop', location: s.location, instruction: 'Stop along the way.', vehicle: selectedVehicles[0], fare: 0
                })),
                { type: 'end', location: destination, instruction: 'Final destination.', vehicle: 'None', fare: 0 }
            ];

            formData.append('stopsJSON', JSON.stringify(stopsAlongTheWay));

            const { suggestRoute } = await import('./actions');
            const result = await suggestRoute(formData);

            if (result.error) throw new Error(result.error);

            if (user) {
                const totalPoints = 50 + (detailedDirections.length > 50 ? 50 : 0);
                await supabase.from('community_points').insert({
                    user_id: user.id,
                    points: totalPoints,
                    reason: isAdmin ? 'admin_data_ingestion' : 'route_intelligence_architect'
                });
                await supabase.rpc('increment_profile_points', { user_id: user.id, amount: totalPoints });
            }

            setStep('success');
        } catch (err: any) {
            console.error('Submission error:', err);
            setErrorMsg(err.message || 'Failed to submit. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setRouteTitle('');
        setStartLocation('');
        setDestination('');
        setStops([{ id: '1', location: '' }]);
        setSelectedVehicles(['keke bus']);
        setTimeMin('');
        setTimeMax('');
        setFareMin('');
        setFareMax('');
        setDifficulty('Moderate');
        setRoadCondition('Good');
        setDetailedDirections('');
        setTipsAndWarnings('');
        setDescription('');
        setErrors({});
        setStep('builder');
        setErrorMsg('');
    };

    // Computed preview values
    const previewStops = [startLocation, ...stops.map(s => s.location), destination].filter(Boolean).join(' → ');

    if (step === 'success') {
        return (
            <div className={styles.container}>
                <div className={styles.successWrapper}>
                    <div className={styles.coinAnimation}>
                        <Award size={80} className={styles.successIcon} />
                        <div className={styles.coinGlow} />
                    </div>
                    <h1 className={styles.successTitle}>Route Intelligence Captured!</h1>
                    <p className={styles.successDesc}>
                        Your route details have been saved. The DAL community thanks you for mapping the network.
                        <span className={styles.pointReward}> +{50 + (detailedDirections.length > 50 ? 50 : 0)} XP</span>
                    </p>
                    <div className={styles.successActions}>
                        <button className={styles.primaryBtn} onClick={resetForm}>Map Another Route</button>
                        <a href="/community" className={styles.secondaryBtn}>View Rankings</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.architectCard}>
                {/* ─── Header ─── */}
                <header className={styles.header}>
                    <div className={styles.badgeRow}>
                        <div className={styles.intelligenceBadge}>
                            <Zap size={14} /> ROUTE ARCHITECT
                        </div>
                        {isAdmin && (
                            <div className={styles.adminBadge}>
                                <ShieldCheck size={14} /> ADMIN — Direct Insert
                            </div>
                        )}
                    </div>
                    <h1 className={styles.title}>Suggest a Route</h1>
                    <p className={styles.subtitle}>
                        Fill in the details below. Your submission maps directly to the routes database.
                    </p>
                </header>

                {/* ─── Two-Column Layout ─── */}
                <div className={styles.layoutWrapper}>

                    {/* ─── LEFT: Form Builder ─── */}
                    <div className={styles.builderBody}>

                        {/* Section 1: Route Identity */}
                        <section className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNum}>1</span>
                                Route Identity
                            </h2>
                            <div className={styles.field}>
                                <label><Info size={12} /> Route Title</label>
                                <input 
                                    placeholder="e.g. Rumuokoro to Choba via University" 
                                    value={routeTitle} 
                                    onChange={e => setRouteTitle(e.target.value)}
                                    className={errors.routeTitle ? styles.errorInput : ''}
                                />
                                {errors.routeTitle && <span className={styles.errorText}>{errors.routeTitle}</span>}
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><MapPin size={12} /> Start Location</label>
                                    <input 
                                        placeholder="Major park or landmark" 
                                        value={startLocation} 
                                        onChange={e => setStartLocation(e.target.value)}
                                        className={errors.startLocation ? styles.errorInput : ''}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label><Navigation size={12} /> Destination</label>
                                    <input 
                                        placeholder="Target destination" 
                                        value={destination} 
                                        onChange={e => setDestination(e.target.value)}
                                        className={errors.destination ? styles.errorInput : ''}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Stops Along the Way */}
                        <section className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNum}>2</span>
                                Stops Along the Way
                            </h2>
                            <div className={styles.stopsBuilder}>
                                {stops.map((stop, index) => (
                                    <div key={stop.id} className={styles.stopRow}>
                                        <div className={styles.stopIndicator}>
                                            <div className={styles.stopDot} />
                                            {index < stops.length - 1 && <div className={styles.stopLine} />}
                                        </div>
                                        <input 
                                            placeholder={`Stop #${index + 1} — landmark or junction`}
                                            value={stop.location}
                                            onChange={e => updateStop(stop.id, e.target.value)}
                                        />
                                        {stops.length > 1 && (
                                            <button type="button" onClick={() => removeStop(stop.id)} className={styles.stopRemove}>
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addStop} className={styles.addStopBtn}>
                                    <Plus size={14} /> Add another stop
                                </button>
                            </div>
                        </section>

                        {/* Section 3: Vehicles & Condition */}
                        <section className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNum}>3</span>
                                Vehicles & Transport
                            </h2>
                            <div className={styles.field}>
                                <label><Car size={12} /> Vehicle Types (select all that apply)</label>
                                <div className={styles.vehicleGrid}>
                                    {VEHICLE_OPTIONS.map(v => (
                                        <button 
                                            key={v.id} 
                                            type="button"
                                            className={`${styles.vehicleChip} ${selectedVehicles.includes(v.id) ? styles.selected : ''}`}
                                            onClick={() => toggleVehicle(v.id)}
                                        >
                                            <span className={styles.chipIcon}>{v.icon}</span>
                                            <span className={styles.chipLabel}>{v.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.vehicles && <span className={styles.errorText}>{errors.vehicles}</span>}
                            </div>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><Zap size={12} /> Road Condition</label>
                                    <select value={roadCondition} onChange={e => setRoadCondition(e.target.value)}>
                                        <option>Good</option>
                                        <option>Fair</option>
                                        <option>Potholes</option>
                                        <option>Flooded</option>
                                        <option>Under Construction</option>
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label><Info size={12} /> Difficulty Level</label>
                                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                        <option>Easy</option>
                                        <option>Moderate</option>
                                        <option>Challenging</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Journey Metrics */}
                        <section className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNum}>4</span>
                                Journey Metrics
                            </h2>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><Clock size={12} /> Estimated Travel Time (minutes)</label>
                                    <div className={styles.miniRow}>
                                        <input type="number" value={timeMin} onChange={e => setTimeMin(e.target.value)} placeholder="Min" />
                                        <input type="number" value={timeMax} onChange={e => setTimeMax(e.target.value)} placeholder="Max" />
                                    </div>
                                </div>
                                <div className={styles.field}>
                                    <label><Wallet size={12} /> Fare Price Range (₦)</label>
                                    <div className={styles.miniRow}>
                                        <input type="number" value={fareMin} onChange={e => setFareMin(e.target.value)} placeholder="Min" />
                                        <input type="number" value={fareMax} onChange={e => setFareMax(e.target.value)} placeholder="Max" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 5: Directions & Tips */}
                        <section className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionNum}>5</span>
                                Directions & Tips
                            </h2>
                            <div className={styles.field}>
                                <label><Navigation size={12} /> Detailed Directions</label>
                                <textarea 
                                    value={detailedDirections} 
                                    onChange={e => setDetailedDirections(e.target.value)}
                                    placeholder="Step-by-step: Take a keke from X park, stop at Y junction, then board a bus to Z..."
                                    rows={4}
                                />
                            </div>
                            <div className={styles.field}>
                                <label><ShieldCheck size={12} /> Tips & Warnings</label>
                                <textarea 
                                    value={tipsAndWarnings} 
                                    onChange={e => setTipsAndWarnings(e.target.value)}
                                    placeholder="Safety tips, best times to travel, areas to avoid..."
                                    rows={3}
                                />
                            </div>

                            {!user && (
                                <div className={styles.field}>
                                    <label><UserIcon size={12} /> Your Name (for attribution)</label>
                                    <input 
                                        placeholder="Name or alias" 
                                        value={attributionName} 
                                        onChange={e => setAttributionName(e.target.value)} 
                                    />
                                </div>
                            )}
                        </section>

                        {/* Submit Area */}
                        <div className={styles.submitSection}>
                            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
                            <button 
                                className={styles.submitBtn} 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className={styles.spinner} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        {isAdmin ? 'Publish Route' : 'Submit for Review'}
                                    </>
                                )}
                            </button>
                        </div>

                    </div>{/* END builderBody */}

                    {/* ─── RIGHT: Live Preview ─── */}
                    <aside className={styles.previewSidebar}>
                        <div className={styles.stickyPreview}>
                            <div className={styles.previewHeader}>
                                <span className={styles.previewLabel}>
                                    <Eye size={14} /> LIVE PREVIEW
                                </span>
                                <div className={styles.liveIndicator} />
                            </div>
                            <p className={styles.previewHint}>
                                This is how your route will appear to other users.
                            </p>
                            <div className={styles.previewCardWrap}>
                                <RouteResultCard 
                                    id="preview"
                                    route_title={routeTitle || 'Your Route Title'}
                                    start_location={startLocation || 'Start Location'}
                                    destination={destination || 'Destination'}
                                    vehicle_type_used={selectedVehicles.join(', ') || 'None selected'}
                                    estimated_travel_time_min={parseInt(timeMin) || 0}
                                    estimated_travel_time_max={parseInt(timeMax) || 0}
                                    fare_price_range_min={parseInt(fareMin) || 0}
                                    fare_price_range_max={parseInt(fareMax) || 0}
                                    difficulty_level={difficulty}
                                    detailed_directions={detailedDirections || 'Directions will appear here...'}
                                    tips_and_warnings={tipsAndWarnings || 'Tips will appear here...'}
                                    stops_along_the_way={previewStops || 'Start → Destination'}
                                    isExpanded={true}
                                />
                            </div>
                        </div>
                    </aside>{/* END previewSidebar */}

                </div>{/* END layoutWrapper */}
            </div>{/* END architectCard */}
        </div>
    );
}
