'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Info, DollarSign, Clock, Send, CheckCircle, AlertCircle, ArrowLeft, Shield, TrafficCone, AlertTriangle, Construction, Navigation } from 'lucide-react'
import Link from 'next/link'
import { suggestRoute } from './actions'
import styles from './suggest-route.module.css'

export default function SuggestRoutePage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [view, setView] = useState<'route' | 'incident'>('route')
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        formData.append('type', view) // Distinguish between route suggestion and incident report
        const result = await suggestRoute(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
            setLoading(false)
        } else {
            setMessage({ type: 'success', text: view === 'route' ? 'Thank you! Your route suggestion has been shared.' : 'Report submitted successfully. Stay safe!' })
            setTimeout(() => {
                router.push(view === 'route' ? '/community' : '/alerts')
            }, 2000)
        }
    }

    return (
        <div className={styles.container}>
            <Link href="/community" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to Community
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>{view === 'route' ? 'Suggest a Route' : 'Report Road Incident'}</h1>
                <p className={styles.subtitle}>
                    {view === 'route'
                        ? 'Help others move smarter by sharing your expert knowledge of Port Harcourt roads.'
                        : 'Real-time road intelligence helps everyone avoid delays and stay safe.'}
                </p>
            </div>

            <div className={styles.toggleGroup}>
                <button
                    className={`${styles.toggleBtn} ${view === 'route' ? styles.activeToggle : ''}`}
                    onClick={() => setView('route')}
                >
                    <Navigation size={18} /> Suggest Route
                </button>
                <button
                    className={`${styles.toggleBtn} ${view === 'incident' ? styles.activeToggle : ''}`}
                    onClick={() => setView('incident')}
                >
                    <AlertTriangle size={18} /> Report Incident
                </button>
            </div>

            <div className={`${styles.card} animate-fade-in-up`}>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]} animate-fade-in`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {view === 'route' ? (
                        <>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Origin (Start Point)</label>
                                    <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            type="text"
                                            name="origin"
                                            required
                                            placeholder="e.g. Mile 1 Park"
                                            className={styles.input}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Destination (End Point)</label>
                                    <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            type="text"
                                            name="destination"
                                            required
                                            placeholder="e.g. Rumuokoro Junction"
                                            className={styles.input}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Recommended Vehicle</label>
                                    <select name="vehicleType" className={styles.select}>
                                        <option value="taxi">Taxi</option>
                                        <option value="bus">Bus</option>
                                        <option value="keke">Keke</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup} style={{ flex: 2 }}>
                                    <label className={styles.label}>Estimated Price Range (₦)</label>
                                    <div className={styles.inputWrapper} style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                            <input
                                                type="number"
                                                name="fareMin"
                                                placeholder="Min"
                                                className={styles.input}
                                                style={{ paddingLeft: '32px' }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <DollarSign size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                            <input
                                                type="number"
                                                name="fareMax"
                                                placeholder="Max"
                                                className={styles.input}
                                                style={{ paddingLeft: '32px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Estimated Duration (minutes)</label>
                                    <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                        <Clock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            placeholder="e.g. 30"
                                            className={styles.input}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Stops & Vehicle Switches</label>
                                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                    <Navigation size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} />
                                    <textarea
                                        name="itinerary"
                                        placeholder="List major stops or where to switch vehicles...&#10;e.g. Stop 1: Rumuokoro (Switch to Bus)&#10;Stop 2: Garrison"
                                        className={styles.textarea}
                                        style={{ paddingLeft: '40px', minHeight: '120px' }}
                                    />
                                </div>
                                <p className={styles.inputHint}>Format: Location (Action/Vehicle)</p>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Pro Tips & Instructions</label>
                                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                    <Info size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-secondary)' }} />
                                    <textarea
                                        name="proTips"
                                        placeholder="Best time to go, where exactly to board, or shortcuts to take..."
                                        className={styles.textarea}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Incident Type</label>
                                <div className={styles.incidentGrid}>
                                    <label className={styles.incidentOption}>
                                        <input type="radio" name="incidentType" value="police" defaultChecked className={styles.hiddenRadio} />
                                        <div className={styles.incidentBox}>
                                            <Shield size={24} />
                                            <span>Police</span>
                                        </div>
                                    </label>
                                    <label className={styles.incidentOption}>
                                        <input type="radio" name="incidentType" value="traffic" className={styles.hiddenRadio} />
                                        <div className={styles.incidentBox}>
                                            <TrafficCone size={24} />
                                            <span>Traffic</span>
                                        </div>
                                    </label>
                                    <label className={styles.incidentOption}>
                                        <input type="radio" name="incidentType" value="slow" className={styles.hiddenRadio} />
                                        <div className={styles.incidentBox}>
                                            <Clock size={24} />
                                            <span>Slow</span>
                                        </div>
                                    </label>
                                    <label className={styles.incidentOption}>
                                        <input type="radio" name="incidentType" value="blocked" className={styles.hiddenRadio} />
                                        <div className={styles.incidentBox}>
                                            <Construction size={24} />
                                            <span>Blocked</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Location Details</label>
                                <div className={styles.inputWrapper} style={{ position: 'relative' }}>
                                    <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        placeholder="e.g. Near Rumuola Bridge"
                                        className={styles.input}
                                        style={{ paddingLeft: '40px' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Describe what's happening</label>
                                <textarea
                                    name="description"
                                    placeholder="Tell others what to expect..."
                                    className={styles.textarea}
                                />
                            </div>
                        </>
                    )}

                    <div className={styles.actions}>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? (
                                <>
                                    <div className="spinner-small"></div> Sharing...
                                </>
                            ) : (
                                <>
                                    <Send size={18} /> {view === 'route' ? 'Share with Community' : 'Post Incident Report'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
