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
    const [vehicleTypeUsed, setVehicleTypeUsed] = useState('Keke bus');
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

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!routeTitle.trim()) newErrors.routeTitle = 'Route title required';
        if (!startLocation.trim()) newErrors.startLocation = 'Start point required';
        if (!destination.trim()) newErrors.destination = 'Final destination required';
        
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
            formData.append('vehicle_type_used', vehicleTypeUsed);
            formData.append('timeMin', timeMin);
            formData.append('timeMax', timeMax);
            formData.append('fareMin', fareMin);
            formData.append('fareMax', fareMax);
            formData.append('difficulty', difficulty);
            formData.append('roadCondition', roadCondition);
            formData.append('detailedDirections', detailedDirections);
            formData.append('tipsAndWarnings', tipsAndWarnings);
            formData.append('description', description);

            // Send simplified stops
            const stopsAlongTheWay = [
                { type: 'start', location: startLocation, instruction: 'Starting point.', vehicle: vehicleTypeUsed, fare: 0 },
                { type: 'end', location: destination, instruction: 'Final destination.', vehicle: 'None', fare: 0 }
            ];

            formData.append('stopsJSON', JSON.stringify(stopsAlongTheWay));

            // Run the server action
            const { suggestRoute } = await import('./actions');
            const result = await suggestRoute(formData);

            if (result.error) throw new Error(result.error);

            if (user) {
                const totalPoints = 30 + (detailedDirections.length > 50 ? 20 : 0);
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
        setVehicleTypeUsed('Keke bus');
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
                        <span className={styles.pointReward}> +{30 + (detailedDirections.length > 50 ? 20 : 0)} XP</span>
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
                                    value={startLocation} 
                                    onChange={e => setStartLocation(e.target.value)}
                                    className={errors.startLocation ? styles.errorInput : ''}
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
                        <h2 className={styles.sectionTitle}>Logic & Logistics</h2>
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
                                <label><Bus size={12} /> Primary Vehicle</label>
                                <select value={vehicleTypeUsed} onChange={e => setVehicleTypeUsed(e.target.value)}>
                                    <option>Keke</option>
                                    <option>Keke bus</option>
                                    <option>Bus</option>
                                    <option>Taxi</option>
                                    <option>Bike</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label><Info size={12} /> Primary Difficulty</label>
                            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                <option>Easy</option>
                                <option>Moderate</option>
                                <option>Challenging</option>
                            </select>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Expert Intelligence Layer</h2>
                        <div className={styles.field}>
                            <label><Navigation size={12} /> Detailed Navigational Instructions</label>
                            <textarea 
                                value={detailedDirections} 
                                onChange={e => setDetailedDirections(e.target.value)}
                                placeholder="Exact turns, landmarks to watch for, and how to spot the right vehicle..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.field}>
                            <label><ShieldCheck size={12} /> Survival Tips & Warnings</label>
                            <textarea 
                                value={tipsAndWarnings} 
                                onChange={e => setTipsAndWarnings(e.target.value)}
                                placeholder="Pickpocket zones, busy hours, alternative routes when flooded..."
                                rows={3}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>
                                <Info size={12} /> General Expert Notes
                                <span className={styles.pointIncentive}>+10 XP</span>
                            </label>
                            <textarea 
                                value={description} 
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Any extra 'Street Intel' — loading park location, landmarks to watch for..."
                                rows={2}
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
                    </section>

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
