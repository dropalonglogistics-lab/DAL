'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Bus, Navigation, Info, 
    CheckCircle2, Clock, Wallet, ChevronRight, 
    ArrowLeft, User as UserIcon, Plus, Trash2,
    Zap, Award, ShieldCheck
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
    const [legs, setLegs] = useState<RouteLeg[]>([
        { id: '1', from: '', to: '', vehicle: 'Keke', fare: '' }
    ]);
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
        if (!legs[0].from.trim()) newErrors.from_0 = 'Start point required';
        if (!legs[legs.length - 1].to.trim()) newErrors[`to_${legs.length - 1}`] = 'End point required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // Serialize Intelligence Report
            const intelligenceReport = legs.map((leg, i) => (
                `Leg ${i+1}: ${leg.from} to ${leg.to} via ${leg.vehicle}${leg.fare ? ` (Fare: ₦${leg.fare})` : ''}`
            )).join('\n');

            const fullDescription = `${intelligenceReport}\n\nAdditional Intel: ${description}\nPeak Hours: ${peakHours}`;

            const { error: suggestError } = await supabase
                .from('route_suggestions')
                .insert({
                    from_location: legs[0].from,
                    to_location: legs[legs.length - 1].to,
                    vehicle_type: legs[0].vehicle, // Primary vehicle
                    expected_fare: legs.reduce((acc, l) => acc + (parseInt(l.fare) || 0), 0).toString(),
                    peak_hours: peakHours,
                    description: fullDescription,
                    submitted_by: user?.id || null,
                    status: 'pending'
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
                    <h1 className={styles.successTitle}>Route Architecture Captured!</h1>
                    <p className={styles.successDesc}>
                        Your intelligence has been saved. The DAL community thanks you for mapping the network.
                        <span className={styles.pointReward}> +{10 + (legs.length > 1 ? 5 : 0) + (description.length > 20 ? 5 : 0)} XP</span>
                    </p>
                    <div className={styles.successActions}>
                        <button className={styles.primaryBtn} onClick={resetForm}>Map Another Route</button>
                        <a href="/community" className={styles.secondaryBtn}>View Performance</a>
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
                    <h1 className={styles.title}>Intelligence Architect</h1>
                    <p className={styles.subtitle}>Map a new route in the Port Harcourt network</p>
                </header>

                <div className={styles.builderBody}>
                    <div className={styles.timeline}>
                        {legs.map((leg, index) => (
                            <div key={leg.id} className={styles.legSegment}>
                                <div className={styles.segmentIndicator}>
                                    <div className={styles.dot} />
                                    {index < legs.length - 1 && <div className={styles.connector} />}
                                </div>
                                <div className={styles.legContent}>
                                    <div className={styles.legHeader}>
                                        <h3 className={styles.legTitle}>Leg {index + 1}</h3>
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
                                                <option>Bus</option>
                                                <option>Motorcycle</option>
                                                <option>Walking</option>
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
                        
                        <button className={styles.addLegBtn} onClick={addLeg}>
                            <Plus size={16} /> Add a Stop / Connection
                            <span className={styles.pointIncentive}>+10 XP</span>
                        </button>
                    </div>

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
                        {isSubmitting ? 'Archiving Intelligence...' : 'Upload Route Architecture'}
                        <ShieldCheck size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
