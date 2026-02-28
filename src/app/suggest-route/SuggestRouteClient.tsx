'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { suggestRoute } from './actions';
import {
    AlertTriangle,
    Shield,
    TrafficCone,
    Construction,
    MapPin,
    ChevronLeft,
    Send,
    PlusCircle,
    Navigation,
    Coins,
    Award
} from 'lucide-react';
import styles from './suggest-route.module.css';

interface RouteStop {
    id: string;
    location: string;
    instructions: string;
    vehicle: string;
    fare: string;
}

type SuggestType = 'incident' | 'route';
type IncidentType = 'police' | 'traffic' | 'blocked' | 'checkpoint';

export default function SuggestRouteClient() {
    const [mode, setMode] = useState<SuggestType>('incident');
    const [incidentType, setIncidentType] = useState<IncidentType>('traffic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [stops, setStops] = useState<RouteStop[]>([
        { id: '1', location: '', instructions: '', vehicle: '', fare: '' }
    ]);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user;
            setUser(authUser);
        };
        checkUser();
    }, [supabase]);

    const addStop = () => {
        setStops([...stops, { id: Date.now().toString(), location: '', instructions: '', vehicle: '', fare: '' }]);
    };

    const removeStop = (id: string) => {
        if (stops.length > 1) {
            setStops(stops.filter(stop => stop.id !== id));
        }
    };

    const updateStop = (id: string, field: keyof RouteStop, value: string) => {
        setStops(stops.map(stop => stop.id === id ? { ...stop, [field]: value } : stop));
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append('type', mode);
        if (mode === 'incident') {
            formData.append('incidentType', incidentType);
        }

        const result = await suggestRoute(formData);

        if (result.success) {
            setSubmitted(true);
            router.refresh(); // Update points in navbar
        } else {
            alert(result.error || 'Something went wrong');
        }

        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                        <Send size={40} />
                    </div>
                    <h2 className={styles.title}>Thank You!</h2>
                    <p className={styles.subtitle}>Your contribution helps make Port Harcourt transit smarter for everyone.</p>
                    <Link href="/" className={styles.submitBtn} style={{ marginTop: '32px', textDecoration: 'none' }}>
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ChevronLeft size={18} />
                Back to Search
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>Community Intelligence</h1>
                <p className={styles.subtitle}>Real-time updates and new route suggestions from the collective.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.toggleGroup}>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${mode === 'incident' ? styles.activeToggle : ''}`}
                        onClick={() => setMode('incident')}
                    >
                        <AlertTriangle size={18} />
                        Report Incident
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${mode === 'route' ? styles.activeToggle : ''}`}
                        onClick={() => setMode('route')}
                    >
                        <PlusCircle size={18} />
                        Suggest Route
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {mode === 'incident' ? (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>What's going on?</h2>
                            </div>
                            <div className={styles.incidentGrid}>
                                <label className={styles.incidentOption}>
                                    <input
                                        type="radio"
                                        name="incident"
                                        value="traffic"
                                        className={styles.hiddenRadio}
                                        checked={incidentType === 'traffic'}
                                        onChange={() => setIncidentType('traffic')}
                                    />
                                    <div className={styles.incidentBox}>
                                        <TrafficCone size={24} />
                                        <span>Slow Traffic</span>
                                    </div>
                                </label>
                                <label className={styles.incidentOption}>
                                    <input
                                        type="radio"
                                        name="incident"
                                        value="police"
                                        className={styles.hiddenRadio}
                                        checked={incidentType === 'police'}
                                        onChange={() => setIncidentType('police')}
                                    />
                                    <div className={styles.incidentBox}>
                                        <Shield size={24} />
                                        <span>Police</span>
                                    </div>
                                </label>
                                <label className={styles.incidentOption}>
                                    <input
                                        type="radio"
                                        name="incident"
                                        value="blocked"
                                        className={styles.hiddenRadio}
                                        checked={incidentType === 'blocked'}
                                        onChange={() => setIncidentType('blocked')}
                                    />
                                    <div className={styles.incidentBox}>
                                        <Construction size={24} />
                                        <span>Blocked Road</span>
                                    </div>
                                </label>
                                <label className={styles.incidentOption}>
                                    <input
                                        type="radio"
                                        name="incident"
                                        value="checkpoint"
                                        className={styles.hiddenRadio}
                                        checked={incidentType === 'checkpoint'}
                                        onChange={() => setIncidentType('checkpoint')}
                                    />
                                    <div className={styles.incidentBox}>
                                        <AlertTriangle size={24} />
                                        <span>Checkpoint</span>
                                    </div>
                                </label>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location / Landmark</label>
                                <div className={styles.inputWrapper}>
                                    <MapPin size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g. Rumuokoro Junction, Opposite Oil Mill..."
                                        className={styles.inputWithIcon}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Additional Details (Optional)</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    placeholder="Describe what you see..."
                                    rows={3}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>Detailed Route Path</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                                    Help others by providing step-by-step directions for this route.
                                </p>
                            </div>

                            {!user && (
                                <div className={styles.guestIncentive}>
                                    <Award size={20} className={styles.awardIcon} />
                                    <div>
                                        <strong>Earn Points for Suggestions!</strong>
                                        <p>Signed-up members earn reputation points for verified route data. <Link href="/login">Join the network →</Link></p>
                                    </div>
                                </div>
                            )}

                            {user && (
                                <div className={styles.memberIncentive}>
                                    <Coins size={18} />
                                    <span>You'll earn <strong>1 Point</strong> for this contribution!</span>
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Starting Point (Origin)</label>
                                <div className={styles.inputWrapper}>
                                    <Navigation size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="origin"
                                        placeholder="Where does the journey begin? e.g. Rumuokoro"
                                        className={styles.inputWithIcon}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Final Destination</label>
                                <div className={styles.inputWrapper}>
                                    <MapPin size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="destination"
                                        placeholder="Where does the journey end? e.g. Choba"
                                        className={styles.inputWithIcon}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dynamically build stops from here */}

                            <div className={styles.stopsContainer}>
                                <h3>Step-by-Step Directions</h3>
                                {stops.map((stop, index) => (
                                    <div key={stop.id} className={styles.stopCard}>
                                        <div className={styles.stopHeader}>
                                            <h4>Stop {index + 1}</h4>
                                            {stops.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeStop(stop.id)}
                                                    className={styles.removeStopBtn}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Location</label>
                                            <input
                                                type="text"
                                                value={stop.location}
                                                onChange={(e) => updateStop(stop.id, 'location', e.target.value)}
                                                placeholder="e.g. Alakahia Junction"
                                                className={styles.input}
                                                required
                                            />
                                        </div>

                                        <div className={styles.stopSplitGrid}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Take a (Vehicle)</label>
                                                <input
                                                    type="text"
                                                    value={stop.vehicle}
                                                    onChange={(e) => updateStop(stop.id, 'vehicle', e.target.value)}
                                                    placeholder="e.g. Keke, Bus, Taxi"
                                                    className={styles.input}
                                                    required
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Est. Fare (₦)</label>
                                                <input
                                                    type="number"
                                                    value={stop.fare}
                                                    onChange={(e) => updateStop(stop.id, 'fare', e.target.value)}
                                                    placeholder="200"
                                                    className={styles.input}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Directions / Instructions</label>
                                            <textarea
                                                value={stop.instructions}
                                                onChange={(e) => updateStop(stop.id, 'instructions', e.target.value)}
                                                placeholder="e.g. Drop at junction, cross the road and take a Keke."
                                                className={styles.textarea}
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addStop}
                                    className={styles.addStopBtn}
                                >
                                    <PlusCircle size={16} /> Add Next Stop
                                </button>

                                <input type="hidden" name="stopsJSON" value={JSON.stringify(stops)} />
                            </div>

                            <div className={styles.stopSplitGrid} style={{ marginTop: '24px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Total Est. Fare (₦)</label>
                                    <input
                                        type="number"
                                        name="fareMax"
                                        placeholder="Sum of all fares e.g. 500"
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Est. Duration (mins)</label>
                                    <input
                                        type="number"
                                        name="durationMinutes"
                                        placeholder="e.g. 45"
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending Intelligence...' : 'Submit Report'}
                        {!isSubmitting && <Send size={18} />}
                    </button>
                </form>
            </div>

            <div className={styles.staggerEntry} style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Submissions are automatically verified by nearby users.
                </p>
            </div>
        </div >
    );
}
