'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Bus, Navigation, Info, 
    Clock, Wallet, Plus, Trash2,
    Zap, Award, ShieldCheck, User as UserIcon
} from 'lucide-react';
import styles from './suggest-route.module.css';

interface RouteLeg {
    id: string;
    from: string;
    to: string;
    vehicle: string;
    fare: string;
}

type Step = 'builder' | 'success';

export default function SuggestRouteClient() {
    const [step, setStep] = useState<Step>('builder');
    const [routeTitle, setRouteTitle] = useState('');
    const [startLocation, setStartLocation] = useState('');
    const [destination, setDestination] = useState('');
    const [legs, setLegs] = useState<RouteLeg[]>([
        { id: '1', from: '', to: '', vehicle: 'Keke', fare: '' }
    ]);
    const [timeMin, setTimeMin] = useState('');
    const [timeMax, setTimeMax] = useState('');
    const [fareMin, setFareMin] = useState('');
    const [fareMax, setFareMax] = useState('');
    const [difficulty, setDifficulty] = useState('Moderate');
    const [detailedDirections, setDetailedDirections] = useState('');
    const [tipsAndWarnings, setTipsAndWarnings] = useState('');
    
    const [peakHours, setPeakHours] = useState('');
    const [description, setDescription] = useState('');
    const [attributionName, setAttributionName] = useState('');
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        async function getAuth() {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);
            if (authUser?.user_metadata?.full_name) {
                setAttributionName(authUser.user_metadata.full_name);
            }
        }
        getAuth();
    }, [supabase]);

    const addLeg = () => {
        const lastLeg = legs[legs.length - 1];
        setLegs([...legs, { 
            id: Math.random().toString(36).substr(2, 9), 
            from: lastLeg.to || '', 
            to: '', 
            vehicle: 'Bus', 
            fare: '' 
        }]);
    };

    const removeLeg = (id: string) => {
        if (legs.length > 1) {
            setLegs(legs.filter(l => l.id !== id));
        }
    };

    const updateLeg = (id: string, field: keyof RouteLeg, value: string) => {
        setLegs(legs.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!routeTitle.trim()) newErrors.routeTitle = 'Route title required';
        if (!legs[0].from.trim()) newErrors.from_0 = 'Start point required';
        if (!destination.trim()) newErrors.destination = 'Final destination required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // Serialize stops
            const stopsAlongTheWay = legs.map((leg, i) => ({
                step: i + 1,
                from: leg.from,
                to: leg.to,
                vehicle: leg.vehicle,
                fare: leg.fare
            }));

            const { error: suggestError } = await supabase
                .from('route_suggestions')
                .insert({
                    route_title: routeTitle,
                    start_location: legs[0].from,
                    destination: destination,
                    stops_along_the_way: stopsAlongTheWay,
                    vehicle_type_used: Array.from(new Set(legs.map(l => l.vehicle))).join(', '),
                    estimated_travel_time_min: parseInt(timeMin) || null,
                    estimated_travel_time_max: parseInt(timeMax) || null,
                    fare_price_range_min: parseInt(fareMin) || null,
                    fare_price_range_max: parseInt(fareMax) || null,
                    difficulty_level: difficulty,
                    detailed_directions: detailedDirections,
                    tips_and_warnings: tipsAndWarnings,
                    peak_hours: peakHours,
                    description: description,
                    submitted_by: user?.id || null,
                    status: 'pending',
                    from_location: legs[0].from,
                    to_location: destination,
                    expected_fare: fareMax || fareMin || '0'
                });

            if (suggestError) throw suggestError;

            if (user) {
                const totalPoints = 10 + (legs.length > 1 ? 5 : 0) + (description.length > 20 ? 5 : 0);
                await supabase.from('community_points').insert({
                    user_id: user.id,
                    points: totalPoints,
                    reason: 'route_intelligence_architect'
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
        setLegs([{ id: '1', from: '', to: '', vehicle: 'Keke', fare: '' }]);
        setRouteTitle('');
        setDestination('');
        setTimeMin('');
        setTimeMax('');
        setFareMin('');
        setFareMax('');
        setDifficulty('Moderate');
        setDetailedDirections('');
        setTipsAndWarnings('');
        setPeakHours('');
        setDescription('');
        setErrors({});
        setStep('builder');
        setErrorMsg('');
    };

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
                        <span className={styles.pointReward}> +{10 + (legs.length > 1 ? 5 : 0) + (description.length > 20 ? 5 : 0)} XP</span>
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
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.badgeRow}>
                        <div className={styles.intelligenceBadge}>
                            <Zap size={14} /> LIVE INTELLIGENCE
                        </div>
                        {user && (
                            <div className={styles.pointsBadge}>
                                <Award size={14} /> Current Level: {user.user_metadata?.points || 0}
                            </div>
                        )}
                    </div>
                    <h1 className={styles.title}>Map a New Route</h1>
                    <p className={styles.subtitle}>Share your knowledge to help the community navigate better</p>
                </header>

                <div className={styles.builderBody}>
                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Route Overview</h2>
                        <div className={styles.field}>
                            <label><Info size={12} /> Route Title (e.g., Mile 3 to Choba)</label>
                            <input 
                                placeholder="Descriptive title" 
                                value={routeTitle} 
                                onChange={e => setRouteTitle(e.target.value)}
                                className={errors.routeTitle ? styles.errorInput : ''}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label><MapPin size={12} /> Start Origin</label>
                                <input 
                                    placeholder="Major landmark or park" 
                                    value={legs[0].from} 
                                    onChange={e => updateLeg(legs[0].id, 'from', e.target.value)}
                                    className={errors.from_0 ? styles.errorInput : ''}
                                />
                            </div>
                            <div className={styles.field}>
                                <label><Navigation size={12} /> Final Destination</label>
                                <input 
                                    placeholder="Final stop" 
                                    value={destination} 
                                    onChange={e => setDestination(e.target.value)}
                                    className={errors.destination ? styles.errorInput : ''}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Route Steps & Transport</h2>
                        <div className={styles.timeline}>
                            {legs.map((leg, index) => (
                                <div key={leg.id} className={styles.legSegment}>
                                    <div className={styles.segmentIndicator}>
                                        <div className={styles.dot} />
                                        {index < legs.length - 1 && <div className={styles.connector} />}
                                    </div>
                                    <div className={styles.legContent}>
                                        <div className={styles.legHeader}>
                                            {/* Leg title removed */}
                                            {legs.length > 1 && (
                                                <button onClick={() => removeLeg(leg.id)} className={styles.removeBtn}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className={styles.row}>
                                            <div className={styles.field}>
                                                <label><MapPin size={12} /> From</label>
                                                <input 
                                                    placeholder="Starting point" 
                                                    value={leg.from} 
                                                    onChange={e => updateLeg(leg.id, 'from', e.target.value)}
                                                    className={errors[`from_${index}`] ? styles.errorInput : ''}
                                                />
                                            </div>
                                            <div className={styles.field}>
                                                <label><Navigation size={12} /> To</label>
                                                <input 
                                                    placeholder="Junction or End" 
                                                    value={leg.to} 
                                                    onChange={e => updateLeg(leg.id, 'to', e.target.value)}
                                                    className={errors[`to_${index}`] ? styles.errorInput : ''}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.row}>
                                            <div className={styles.field}>
                                                <label><Bus size={12} /> Vehicle</label>
                                                <select 
                                                    value={leg.vehicle} 
                                                    onChange={e => updateLeg(leg.id, 'vehicle', e.target.value)}
                                                >
                                                    <option>Keke</option>
                                                    <option>Keke bus</option>
                                                    <option>Bus</option>
                                                </select>
                                            </div>
                                            <div className={styles.field}>
                                                <label>
                                                    <Wallet size={12} /> Fare (₦)
                                                    <span className={styles.pointIncentive}>+5 XP</span>
                                                </label>
                                                <input 
                                                    placeholder="Amount" 
                                                    value={leg.fare} 
                                                    onChange={e => updateLeg(leg.id, 'fare', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className={styles.addLegBtn} onClick={addLeg}>
                            <Plus size={16} /> Add a Connection or Stop
                            <span className={styles.pointIncentive}>+10 XP</span>
                        </button>
                    </section>

                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Time & Fare Estimates</h2>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label><Clock size={12} /> Time (Min Minutes)</label>
                                <input type="number" value={timeMin} onChange={e => setTimeMin(e.target.value)} placeholder="0" />
                            </div>
                            <div className={styles.field}>
                                <label><Clock size={12} /> Time (Max Minutes)</label>
                                <input type="number" value={timeMax} onChange={e => setTimeMax(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label><Wallet size={12} /> Fare Min (₦)</label>
                                <input type="number" value={fareMin} onChange={e => setFareMin(e.target.value)} placeholder="0" />
                            </div>
                            <div className={styles.field}>
                                <label><Wallet size={12} /> Fare Max (₦)</label>
                                <input type="number" value={fareMax} onChange={e => setFareMax(e.target.value)} placeholder="0" />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Expert Survival Tips & Directions</h2>
                        <div className={styles.field}>
                            <label><Zap size={12} /> Difficulty Level</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                <option>Easy</option>
                                <option>Moderate</option>
                                <option>Challenging</option>
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label><Navigation size={12} /> Detailed Directions</label>
                            <textarea 
                                value={detailedDirections} 
                                onChange={e => setDetailedDirections(e.target.value)}
                                placeholder="Step-by-step instructions for a first-timer..."
                                rows={2}
                            />
                        </div>

                        <div className={styles.field}>
                            <label><ShieldCheck size={12} /> Tips & Warnings</label>
                            <textarea 
                                value={tipsAndWarnings} 
                                onChange={e => setTipsAndWarnings(e.target.value)}
                                placeholder="Watch out for pickpockets at this junction, best time to board, etc."
                                rows={2}
                            />
                        </div>
                    </section>

                    <div className={styles.extraSection}>
                        <div className={styles.field}>
                            <label>
                                <Clock size={12} /> Peak Hours (e.g., 7am-9am)
                                <span className={styles.pointIncentive}>+5 XP</span>
                            </label>
                            <input value={peakHours} onChange={e => setPeakHours(e.target.value)} placeholder="When is it busiest?" />
                        </div>

                        <div className={styles.field}>
                            <label>
                                <Info size={12} /> Expert Notes & Landmarks
                                <span className={styles.pointIncentive}>+10 XP</span>
                            </label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Tell us the 'Street Intel' — loading park location, landmarks to watch for..."
                                rows={3}
                            />
                        </div>

                        {!user && (
                            <div className={styles.field}>
                                <label><UserIcon size={12} /> Contributor Name</label>
                                <input 
                                    placeholder="Anonymous" 
                                    value={attributionName} 
                                    onChange={e => setAttributionName(e.target.value)} 
                                />
                            </div>
                        )}
                    </div>

                    {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

                    <button 
                        className={styles.submitBtn} 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting Knowledge...' : 'Submit Route Intelligence'}
                        <ShieldCheck size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
