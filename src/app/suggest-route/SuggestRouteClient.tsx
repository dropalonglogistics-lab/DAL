'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { suggestRoute } from './actions';
import InteractiveMapWrapper from '@/components/Map/InteractiveMapWrapper';
import {
    ChevronLeft, Send, Plus, X, MapPin, Navigation, Clock, Coins, Award, CheckCircle, Trash2, ArrowDown
} from 'lucide-react';
import styles from './suggest-route.module.css';

const VEHICLE_OPTIONS = [
    { key: 'keke', label: '🛺 Keke' },
    { key: 'taxi', label: '🚕 Taxi' },
    { key: 'shuttle', label: '🚐 Shuttle' },
    { key: 'bus', label: '🚌 Bus' },
    { key: 'bike', label: '🏍️ Bike' },
    { key: 'walk', label: '🚶 Walk' },
];

interface Leg {
    from: string;
    to: string;
    vehicle: string;
    description: string;
}

interface FormErrors {
    [key: string]: string;
}

export default function SuggestRouteClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Form state
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [legs, setLegs] = useState<Leg[]>([{ from: '', to: '', vehicle: 'keke', description: '' }]);
    const [timeMin, setTimeMin] = useState('');
    const [timeMax, setTimeMax] = useState('');
    const [fareMin, setFareMin] = useState('');
    const [fareMax, setFareMax] = useState('');
    const [tips, setTips] = useState('');
    const [activeField, setActiveField] = useState<string>('origin');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }: any) => setUser(data?.user));
    }, [supabase]);

    // Populate first leg from when origin changes
    useEffect(() => {
        setLegs(prev => {
            const updated = [...prev];
            if (updated.length > 0) updated[0] = { ...updated[0], from: origin };
            return updated;
        });
    }, [origin]);

    // Populate last leg to when destination changes
    useEffect(() => {
        setLegs(prev => {
            const updated = [...prev];
            if (updated.length > 0) updated[updated.length - 1] = { ...updated[updated.length - 1], to: destination };
            return updated;
        });
    }, [destination]);

    const addLeg = () => {
        if (legs.length >= 8) return;
        const lastTo = legs[legs.length - 1]?.to || '';
        setLegs([...legs, { from: lastTo, to: destination, vehicle: 'keke', description: '' }]);
    };

    const removeLeg = (i: number) => setLegs(legs.filter((_, idx) => idx !== i));

    const updateLeg = (i: number, field: keyof Leg, value: string) => {
        const updated = [...legs];
        updated[i] = { ...updated[i], [field]: value };
        // Chain: when one leg's 'to' changes, update next leg's 'from'
        if (field === 'to' && i < updated.length - 1) {
            updated[i + 1] = { ...updated[i + 1], from: value };
        }
        setLegs(updated);
    };

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!origin.trim()) e.origin = 'Start location required';
        if (!destination.trim()) e.destination = 'Destination required';
        if (legs.some(l => !l.from.trim() || !l.to.trim())) e.legs = 'All leg from/to fields are required';
        if (!timeMin || !timeMax) e.time = 'Both min and max time are required';
        if (!fareMin || !fareMax) e.fare = 'Both min and max fare are required';
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

        const itinerary = legs.map((leg, i) => ({
            id: String(i + 1),
            location: leg.from,
            instructions: leg.description || `Take ${leg.vehicle} from ${leg.from} to ${leg.to}`,
            vehicle: leg.vehicle,
            fare: '',
        }));
        // Add destination as final stop
        itinerary.push({ id: String(legs.length + 1), location: destination, instructions: 'Arrive at destination', vehicle: '', fare: '' });

        formData.append('stopsJSON', JSON.stringify(itinerary));
        if (tips) formData.append('proTips', tips);

        const result = await suggestRoute(formData);
        if (result.success) { setSubmitted(true); router.refresh(); }
        else alert(result.error || 'Something went wrong');
        setIsSubmitting(false);
    };

    // ── Success State ──
    if (submitted) {
        return (
            <div className={styles.page}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}><CheckCircle size={48} /></div>
                    <h2>Route submitted for review! 🚌</h2>
                    <p>Your contribution helps make Port Harcourt transit smarter for everyone.</p>
                    <div style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '12px', padding: '16px 20px', margin: '8px 0', textAlign: 'center' }}>
                        <strong style={{ color: 'var(--color-gold)', fontSize: '1.1rem' }}>+50 pts</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Awarded to your account when a moderator approves your route</p>
                    </div>
                    <Link href="/" className={styles.submitBtn} style={{ textDecoration: 'none', marginTop: '20px' }}>
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link href="/" className={styles.backLink}><ChevronLeft size={18} /> Back</Link>
                {user ? (
                    <div className={styles.pointsBanner}><Coins size={16} /><span>Earn <strong>+50 pts</strong> on approval</span></div>
                ) : (
                    <div className={styles.pointsBanner}><Award size={16} /><span><Link href="/login" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>Sign in</Link> to earn points!</span></div>
                )}
            </div>

            <div className={styles.pageHeader}>
                <h1>Suggest a Route</h1>
                <p>Help the community by sharing a route you know well.</p>
            </div>

            <div className={styles.layout}>
                <form className={styles.form} onSubmit={handleSubmit} noValidate>
                    {/* 1 + 2. Origin + Destination */}
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Route Start <span className={styles.req}>*</span></label>
                            <div className={styles.inputIcon}>
                                <Navigation size={16} />
                                <input className={`${styles.input} ${errors.origin ? styles.inputError : ''}`}
                                    placeholder="e.g. Mile 3 Motor Park"
                                    onFocus={() => setActiveField('origin')}
                                    value={origin} onChange={e => { setOrigin(e.target.value); if (errors.origin) { const er = { ...errors }; delete er.origin; setErrors(er); } }} />
                            </div>
                            {errors.origin && <span className={styles.errorText}>{errors.origin}</span>}
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Destination <span className={styles.req}>*</span></label>
                            <div className={styles.inputIcon}>
                                <MapPin size={16} />
                                <input className={`${styles.input} ${errors.destination ? styles.inputError : ''}`}
                                    placeholder="e.g. University of PH"
                                    onFocus={() => setActiveField('destination')}
                                    value={destination} onChange={e => { setDestination(e.target.value); if (errors.destination) { const er = { ...errors }; delete er.destination; setErrors(er); } }} />
                            </div>
                            {errors.destination && <span className={styles.errorText}>{errors.destination}</span>}
                        </div>
                    </div>

                    {/* Route Legs */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Route Legs <span className={styles.req}>*</span> <span className={styles.hint}>({legs.length}/8) — one segment per vehicle change</span></label>
                        {errors.legs && <span className={styles.errorText}>{errors.legs}</span>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                            {legs.map((leg, i) => (
                                <div key={i} style={{ background: 'rgba(201,162,39,0.04)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leg {i + 1}</span>
                                        {legs.length > 1 && (
                                            <button type="button" onClick={() => removeLeg(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                        <input className={styles.input} value={leg.from} onFocus={() => setActiveField(`leg-${i}-from`)} onChange={e => updateLeg(i, 'from', e.target.value)} placeholder="From" style={{ fontSize: '0.9rem' }} />
                                        <ArrowDown size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                        <input className={styles.input} value={leg.to} onFocus={() => setActiveField(`leg-${i}-to`)} onChange={e => updateLeg(i, 'to', e.target.value)} placeholder="To" style={{ fontSize: '0.9rem' }} />
                                    </div>
                                    {/* Vehicle selector */}
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                        {VEHICLE_OPTIONS.map(v => (
                                            <button key={v.key} type="button"
                                                className={`${styles.vehicleBtn} ${leg.vehicle === v.key ? styles.vehicleActive : ''}`}
                                                onClick={() => updateLeg(i, 'vehicle', v.key)}
                                                style={{ padding: '5px 10px', fontSize: '0.82rem' }}
                                            >
                                                {v.label}
                                            </button>
                                        ))}
                                    </div>
                                    <input className={styles.input} value={leg.description} onChange={e => updateLeg(i, 'description', e.target.value)} placeholder="Optional: instructions for this leg" style={{ fontSize: '0.88rem' }} />
                                </div>
                            ))}
                        </div>
                        {legs.length < 8 && (
                            <button type="button" className={styles.addStopBtn} onClick={addLeg} style={{ marginTop: '10px' }}>
                                <Plus size={16} /> Add Leg
                            </button>
                        )}
                    </div>

                    {/* Time + Fare */}
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}><Clock size={14} /> Est. Travel Time <span className={styles.req}>*</span></label>
                            <div className={styles.rangeRow}>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.time ? styles.inputError : ''}`} type="number" placeholder="Min" value={timeMin} onChange={e => { setTimeMin(e.target.value); if (errors.time) { const er = { ...errors }; delete er.time; setErrors(er); } }} />
                                <span className={styles.rangeSep}>–</span>
                                <input className={`${styles.input} ${styles.rangeInput} ${errors.time ? styles.inputError : ''}`} type="number" placeholder="Max" value={timeMax} onChange={e => { setTimeMax(e.target.value); if (errors.time) { const er = { ...errors }; delete er.time; setErrors(er); } }} />
                                <span className={styles.rangeUnit}>min</span>
                            </div>
                            {errors.time && <span className={styles.errorText}>{errors.time}</span>}
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Fare Range <span className={styles.req}>*</span></label>
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

                    {/* Tips */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Tips & Warnings <span className={styles.optional}>(optional)</span></label>
                        <textarea className={styles.textarea} rows={3}
                            placeholder="e.g. Avoid this road during rainy season, negotiate fare before boarding…"
                            value={tips} onChange={e => setTips(e.target.value)} />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting…' : 'Submit Route Suggestion'}
                        {!isSubmitting && <Send size={18} />}
                    </button>
                </form>

                {/* Desktop Preview / Map */}
                <aside className={styles.sidebar}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 16px var(--color-shadow)' }}>
                        <InteractiveMapWrapper onLocationSelect={(loc) => {
                            if (activeField === 'origin') setOrigin(loc);
                            else if (activeField === 'destination') setDestination(loc);
                            else if (activeField.startsWith('leg-')) {
                                const parts = activeField.split('-');
                                const idx = parseInt(parts[1], 10);
                                updateLeg(idx, parts[2] as 'from' | 'to', loc);
                            }
                        }} />
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                            Click the map to select: <strong style={{color: 'var(--color-gold)', textTransform: 'uppercase'}}>{activeField.replace(/leg-\d+-/, '')}</strong>
                        </div>
                    </div>
                    <div className={styles.previewCard}>
                        <h3 className={styles.previewTitle}>Route Preview</h3>
                        <div className={styles.previewBody}>
                            {origin && (
                                <div className={styles.previewRow}>
                                    <span className={styles.previewLabel}>From</span>
                                    <span className={styles.previewValue}>{origin}</span>
                                </div>
                            )}
                            {destination && (
                                <div className={styles.previewRow}>
                                    <span className={styles.previewLabel}>To</span>
                                    <span className={styles.previewValue}>{destination}</span>
                                </div>
                            )}
                            {/* Timeline preview */}
                            {legs.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    {legs.map((leg, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', flexShrink: 0, marginTop: '4px' }} />
                                                {i < legs.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border)', marginTop: '4px' }} />}
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: '8px' }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{leg.from || '…'}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                    {VEHICLE_OPTIONS.find(v => v.key === leg.vehicle)?.label} → {leg.to || '…'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: '4px' }} />
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{destination || '…'}</div>
                                    </div>
                                </div>
                            )}
                            {(timeMin || timeMax) && (
                                <div className={styles.previewRow} style={{ marginTop: '12px' }}>
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
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(201,162,39,0.08)', borderRadius: '10px', border: '1px solid rgba(201,162,39,0.2)', textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-gold)' }}>+50 pts on approval</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Earn points when your route is verified</div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
