'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { suggestRoute } from './actions';
import {
    ChevronLeft, Send, Plus, X, MapPin, Navigation, Clock, Coins, Award, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import styles from './suggest-route.module.css';

const VEHICLE_OPTIONS = [
    { key: 'keke', label: '🛺 Keke' },
    { key: 'bus', label: '🚌 Bus' },
    { key: 'shuttle', label: '🚐 Shuttle' },
    { key: 'taxi', label: '🚕 Taxi' },
];

const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Hard'] as const;
type Difficulty = typeof DIFFICULTY_OPTIONS[number];

interface FormErrors {
    [key: string]: string;
}

export default function SuggestRouteClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Form state
    const [title, setTitle] = useState('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [stops, setStops] = useState<string[]>([]);
    const [stopInput, setStopInput] = useState('');
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [timeMin, setTimeMin] = useState('');
    const [timeMax, setTimeMax] = useState('');
    const [fareMin, setFareMin] = useState('');
    const [fareMax, setFareMax] = useState('');
    const [difficulty, setDifficulty] = useState<Difficulty>('Moderate');
    const [directions, setDirections] = useState('');
    const [tips, setTips] = useState('');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data?.user);
        };
        checkUser();
    }, [supabase]);

    const addStop = () => {
        const trimmed = stopInput.trim();
        if (!trimmed || stops.length >= 8) return;
        setStops([...stops, trimmed]);
        setStopInput('');
        if (errors.stops) { const e = { ...errors }; delete e.stops; setErrors(e); }
    };

    const removeStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const toggleVehicle = (key: string) => {
        setVehicles(prev =>
            prev.includes(key) ? prev.filter(v => v !== key) : [...prev, key]
        );
        if (errors.vehicles) { const e = { ...errors }; delete e.vehicles; setErrors(e); }
    };

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!title.trim()) e.title = 'Route title is required';
        if (!origin.trim()) e.origin = 'Start location is required';
        if (!destination.trim()) e.destination = 'Destination is required';
        if (stops.length < 1) e.stops = 'Add at least 1 stop';
        if (vehicles.length === 0) e.vehicles = 'Select at least 1 vehicle type';
        if (!timeMin || !timeMax) e.time = 'Both min and max time are required';
        if (!fareMin || !fareMax) e.fare = 'Both min and max fare are required';
        if (!directions.trim()) e.directions = 'Directions are required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('type', 'route');
        formData.append('origin', origin);
        formData.append('destination', destination);
        formData.append('fareMax', fareMax);
        formData.append('durationMinutes', timeMax);

        const itinerary = stops.map((stop, i) => ({
            id: String(i + 1),
            location: stop,
            instructions: '',
            vehicle: vehicles.join(', '),
            fare: '',
        }));
        formData.append('stopsJSON', JSON.stringify(itinerary));

        const result = await suggestRoute(formData);
        if (result.success) {
            setSubmitted(true);
            router.refresh();
        } else {
            alert(result.error || 'Something went wrong');
        }
        setIsSubmitting(false);
    };

    const handleStopKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); addStop(); }
    };

    // ── Success State ──
    if (submitted) {
        return (
            <div className={styles.page}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>
                        <CheckCircle size={48} />
                    </div>
                    <h2>Thanks! Your route suggestion has been submitted for review. 🚌</h2>
                    <p>Your contribution helps make Port Harcourt transit smarter for everyone.</p>
                    <Link href="/" className={styles.submitBtn} style={{ textDecoration: 'none', marginTop: '24px' }}>
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    // ── Preview Card ──
    const PreviewCard = () => (
        <div className={styles.previewCard}>
            <h3 className={styles.previewTitle}>Route Preview</h3>
            <div className={styles.previewBody}>
                <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Title</span>
                    <span className={styles.previewValue}>{title || '—'}</span>
                </div>
                <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>From</span>
                    <span className={styles.previewValue}>{origin || '—'}</span>
                </div>
                <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>To</span>
                    <span className={styles.previewValue}>{destination || '—'}</span>
                </div>
                {stops.length > 0 && (
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Stops</span>
                        <span className={styles.previewValue}>{stops.join(' → ')}</span>
                    </div>
                )}
                {vehicles.length > 0 && (
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Vehicles</span>
                        <span className={styles.previewValue}>
                            {vehicles.map(v => VEHICLE_OPTIONS.find(o => o.key === v)?.label).join(', ')}
                        </span>
                    </div>
                )}
                {(timeMin || timeMax) && (
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Duration</span>
                        <span className={styles.previewValue}>{timeMin || '?'} – {timeMax || '?'} min</span>
                    </div>
                )}
                {(fareMin || fareMax) && (
                    <div className={styles.previewRow}>
                        <span className={styles.previewLabel}>Fare</span>
                        <span className={styles.previewValue}>₦{fareMin || '?'} – ₦{fareMax || '?'}</span>
                    </div>
                )}
                <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Difficulty</span>
                    <span className={`${styles.previewValue} ${styles[`diff${difficulty}`]}`}>{difficulty}</span>
                </div>
                {directions && (
                    <div className={styles.previewDirections}>
                        <span className={styles.previewLabel}>Directions</span>
                        <p>{directions.substring(0, 200)}{directions.length > 200 ? '…' : ''}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link href="/" className={styles.backLink}>
                    <ChevronLeft size={18} /> Back
                </Link>
                {user && (
                    <div className={styles.pointsBanner}>
                        <Coins size={16} />
                        <span>You'll earn <strong>1 Point</strong> for this contribution!</span>
                    </div>
                )}
                {!user && (
                    <div className={styles.pointsBanner}>
                        <Award size={16} />
                        <span><Link href="/login" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>Sign in</Link> to earn points!</span>
                    </div>
                )}
            </div>

            <div className={styles.pageHeader}>
                <h1>Suggest a Route</h1>
                <p>Help the community by sharing a route you know well.</p>
            </div>

            {/* Mobile preview toggle */}
            <button className={styles.previewToggle} onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <><EyeOff size={16} /> Hide Preview</> : <><Eye size={16} /> Show Preview</>}
            </button>

            {showPreview && <div className={styles.mobilePreview}><PreviewCard /></div>}

            <div className={styles.layout}>
                {/* ── Form ── */}
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {/* 1. Route Title */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Route Title <span className={styles.req}>*</span></label>
                        <input
                            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                            placeholder="e.g. Mile 3 → Choba"
                            value={title} onChange={e => { setTitle(e.target.value); if (errors.title) { const er = { ...errors }; delete er.title; setErrors(er); } }}
                        />
                        {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                    </div>

                    {/* 2 + 3. Origin + Destination */}
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Start Location <span className={styles.req}>*</span></label>
                            <div className={styles.inputIcon}>
                                <Navigation size={16} />
                                <input
                                    className={`${styles.input} ${errors.origin ? styles.inputError : ''}`}
                                    placeholder="e.g. Mile 1 Motor Park, Diobu"
                                    value={origin} onChange={e => { setOrigin(e.target.value); if (errors.origin) { const er = { ...errors }; delete er.origin; setErrors(er); } }}
                                />
                            </div>
                            {errors.origin && <span className={styles.errorText}>{errors.origin}</span>}
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Destination <span className={styles.req}>*</span></label>
                            <div className={styles.inputIcon}>
                                <MapPin size={16} />
                                <input
                                    className={`${styles.input} ${errors.destination ? styles.inputError : ''}`}
                                    placeholder="e.g. Diobu"
                                    value={destination} onChange={e => { setDestination(e.target.value); if (errors.destination) { const er = { ...errors }; delete er.destination; setErrors(er); } }}
                                />
                            </div>
                            {errors.destination && <span className={styles.errorText}>{errors.destination}</span>}
                        </div>
                    </div>

                    {/* 4. Stops */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Stops Along the Way <span className={styles.req}>*</span> <span className={styles.hint}>({stops.length}/8)</span></label>
                        <div className={styles.stopInputRow}>
                            <input
                                className={`${styles.input} ${errors.stops ? styles.inputError : ''}`}
                                placeholder="Type a stop name and press Enter or click +"
                                value={stopInput}
                                onChange={e => setStopInput(e.target.value)}
                                onKeyDown={handleStopKeyDown}
                                disabled={stops.length >= 8}
                            />
                            <button type="button" className={styles.addStopBtn} onClick={addStop} disabled={stops.length >= 8}>
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        {errors.stops && <span className={styles.errorText}>{errors.stops}</span>}
                        {stops.length > 0 && (
                            <div className={styles.stopPills}>
                                {stops.map((s, i) => (
                                    <span key={i} className={styles.pill}>
                                        {s}
                                        <button type="button" onClick={() => removeStop(i)} className={styles.pillX}><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 5. Vehicle Types */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Vehicle Types Used <span className={styles.req}>*</span></label>
                        <div className={styles.vehicleToggles}>
                            {VEHICLE_OPTIONS.map(v => (
                                <button
                                    key={v.key}
                                    type="button"
                                    className={`${styles.vehicleBtn} ${vehicles.includes(v.key) ? styles.vehicleActive : ''}`}
                                    onClick={() => toggleVehicle(v.key)}
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                        {errors.vehicles && <span className={styles.errorText}>{errors.vehicles}</span>}
                    </div>

                    {/* 6 + 7. Time + Fare */}
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Estimated Travel Time <span className={styles.req}>*</span></label>
                            <div className={styles.rangeRow}>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.time ? styles.inputError : ''}`} type="number" placeholder="Min" value={timeMin} onChange={e => { setTimeMin(e.target.value); if (errors.time) { const er = { ...errors }; delete er.time; setErrors(er); } }} />
                                <span className={styles.rangeSep}>–</span>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.time ? styles.inputError : ''}`} type="number" placeholder="Max" value={timeMax} onChange={e => { setTimeMax(e.target.value); if (errors.time) { const er = { ...errors }; delete er.time; setErrors(er); } }} />
                                <span className={styles.rangeUnit}>min</span>
                            </div>
                            {errors.time && <span className={styles.errorText}>{errors.time}</span>}
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Fare Price Range <span className={styles.req}>*</span></label>
                            <div className={styles.rangeRow}>
                                <span className={styles.rangePrefix}>₦</span>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.fare ? styles.inputError : ''}`} type="number" placeholder="Min" value={fareMin} onChange={e => { setFareMin(e.target.value); if (errors.fare) { const er = { ...errors }; delete er.fare; setErrors(er); } }} />
                                <span className={styles.rangeSep}>–</span>
                                <span className={styles.rangePrefix}>₦</span>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.fare ? styles.inputError : ''}`} type="number" placeholder="Max" value={fareMax} onChange={e => { setFareMax(e.target.value); if (errors.fare) { const er = { ...errors }; delete er.fare; setErrors(er); } }} />
                            </div>
                            {errors.fare && <span className={styles.errorText}>{errors.fare}</span>}
                        </div>
                    </div>

                    {/* 8. Difficulty */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Difficulty Level</label>
                        <div className={styles.segmented}>
                            {DIFFICULTY_OPTIONS.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    className={`${styles.segBtn} ${difficulty === d ? styles.segActive : ''} ${difficulty === d ? styles[`seg${d}`] : ''}`}
                                    onClick={() => setDifficulty(d)}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 9. Detailed Directions */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Detailed Directions <span className={styles.req}>*</span></label>
                        <textarea
                            className={`${styles.textarea} ${errors.directions ? styles.inputError : ''}`}
                            rows={5}
                            placeholder="Describe the route step by step — mention road names, turns, landmarks, crossings..."
                            value={directions}
                            onChange={e => { setDirections(e.target.value); if (errors.directions) { const er = { ...errors }; delete er.directions; setErrors(er); } }}
                        />
                        {errors.directions && <span className={styles.errorText}>{errors.directions}</span>}
                    </div>

                    {/* 10. Tips */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tips & Warnings <span className={styles.optional}>(optional)</span></label>
                        <textarea
                            className={styles.textarea}
                            rows={3}
                            placeholder="e.g. Avoid this road during rainy season, negotiate fare before boarding..."
                            value={tips}
                            onChange={e => setTips(e.target.value)}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Route Suggestion'}
                        {!isSubmitting && <Send size={18} />}
                    </button>
                </form>

                {/* ── Desktop Preview ── */}
                <aside className={styles.sidebar}>
                    <PreviewCard />
                </aside>
            </div>
        </div>
    );
}
