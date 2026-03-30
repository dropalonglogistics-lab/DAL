'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, Bus, Navigation, Info, 
    CheckCircle2, Clock, Wallet, ChevronRight, 
    ArrowLeft, User as UserIcon
} from 'lucide-react';
import styles from './suggest-route.module.css';

type Step = 'details' | 'community' | 'success';

export default function SuggestRouteClient() {
    const [step, setStep] = useState<Step>('details');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [vehicleType, setVehicleType] = useState('Keke');
    const [expectedFare, setExpectedFare] = useState('');
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

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!from.trim()) newErrors.from = 'Required';
        if (!to.trim()) newErrors.to = 'Required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep1()) setStep('community');
    };

    const prevStep = () => setStep('details');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // 1. Insert to route_suggestions
            const { error: suggestError } = await supabase
                .from('route_suggestions')
                .insert({
                    from_location: from,
                    to_location: to,
                    vehicle_type: vehicleType,
                    expected_fare: expectedFare,
                    peak_hours: peakHours,
                    description: description,
                    submitted_by: user?.id || null,
                    status: 'pending'
                });

            if (suggestError) throw suggestError;

            // 2. If user is logged in, insert to community_points
            if (user) {
                const { error: pointsError } = await supabase
                    .from('community_points')
                    .insert({
                        user_id: user.id,
                        points: 10,
                        reason: 'route_suggestion'
                    });
                if (pointsError) console.error('Points error:', pointsError);
                
                // Update local profile points if needed (handled by DB trigger usually, but good for UI)
                await supabase.rpc('increment_profile_points', { user_id: user.id, amount: 10 });
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
        setFrom('');
        setTo('');
        setVehicleType('Keke');
        setExpectedFare('');
        setPeakHours('');
        setDescription('');
        setErrors({});
        setStep('details');
        setErrorMsg('');
    };

    if (step === 'success') {
        return (
            <div className={styles.container}>
                <div className={styles.successWrapper}>
                    <div className={styles.coinAnimation}>
                        <CheckCircle2 size={80} className={styles.successIcon} />
                        <div className={styles.coinGlow} />
                    </div>
                    <h1 className={styles.successTitle}>Contribution Received!</h1>
                    <p className={styles.successDesc}>
                        Your route suggestion has been sent to the intelligence layer for verification. 
                        <strong> +10 Community Points</strong> awarded.
                    </p>
                    <div className={styles.successActions}>
                        <button className={styles.primaryBtn} onClick={resetForm}>Suggest Another</button>
                        <a href="/community" className={styles.secondaryBtn}>View Leaderboard</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.wizardCard}>
                {/* Header */}
                <header className={styles.wizardHeader}>
                    <div className={styles.stepper}>
                        <div className={`${styles.stepDot} ${step === 'details' ? styles.activeDot : ''}`} />
                        <div className={styles.stepLine} />
                        <div className={`${styles.stepDot} ${step === 'community' ? styles.activeDot : ''}`} />
                    </div>
                    <h1 className={styles.title}>Grow the network</h1>
                    <p className={styles.subtitle}>
                        {step === 'details' ? 'Phase 1: Route Intelligence' : 'Phase 2: Community Attribution'}
                    </p>
                </header>

                {/* Body */}
                <div className={styles.wizardBody}>
                    {step === 'details' ? (
                        <div className={styles.detailsView}>
                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><MapPin size={14} /> Starting Point</label>
                                    <input 
                                        placeholder="e.g. Mile 1 Park" 
                                        value={from} 
                                        onChange={e => setFrom(e.target.value)}
                                        className={errors.from ? styles.errorInput : ''}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label><Navigation size={14} /> Destination</label>
                                    <input 
                                        placeholder="e.g. Uniport Choba" 
                                        value={to} 
                                        onChange={e => setTo(e.target.value)}
                                        className={errors.to ? styles.errorInput : ''}
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label><Bus size={14} /> Vehicle Type</label>
                                <div className={styles.vehicleGrid}>
                                    {['Keke', 'Bus', 'Motorcycle', 'Walking'].map(type => (
                                        <button 
                                            key={type}
                                            className={`${styles.typeBtn} ${vehicleType === type ? styles.activeType : ''}`}
                                            onClick={() => setVehicleType(type)}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label><Wallet size={14} /> Est. Fare (₦)</label>
                                    <input placeholder="200, 500, etc." value={expectedFare} onChange={e => setExpectedFare(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label><Clock size={14} /> Peak Hours</label>
                                    <input placeholder="e.g. 7am - 9am" value={peakHours} onChange={e => setPeakHours(e.target.value)} />
                                </div>
                            </div>

                            <button className={styles.stepBtn} onClick={nextStep}>
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className={styles.communityView}>
                            <div className={styles.field}>
                                <label><Info size={14} /> Route Notes (Optional)</label>
                                <textarea 
                                    placeholder="Add landmarks, specific junctions, or fare nuances..." 
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className={styles.field}>
                                <label><UserIcon size={14} /> Contributor Name</label>
                                <input 
                                    placeholder={user ? attributionName : "Anonymous"} 
                                    value={attributionName}
                                    onChange={e => setAttributionName(e.target.value)}
                                    disabled={!!user}
                                />
                                <span className={styles.subtext}>Verified contributors earn higher trust scores.</span>
                            </div>

                            {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

                            <div className={styles.btnRow}>
                                <button className={styles.backBtn} onClick={prevStep} disabled={isSubmitting}>
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button className={styles.primaryBtn} onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? 'Processing...' : 'Submit Suggestion'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
