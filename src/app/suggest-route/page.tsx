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
            const successText = view === 'route'
                ? 'Thank you! Your route suggestion has been shared.'
                : 'Report submitted successfully. Stay safe!'

            setMessage({
                type: 'success',
                text: result.isGuest
                    ? `${successText} Why not sign up to track your contributions?`
                    : successText
            })

            if (!result.isGuest) {
                setTimeout(() => {
                    router.push(view === 'route' ? '/community' : '/alerts')
                }, 2000)
            } else {
                setLoading(false) // Keep them on the page to see the CTA
            }
        }
    }

    return (
        <div className={styles.container}>
            <Link href="/community" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Community
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>{view === 'route' ? 'Share your knowledge' : 'Report an incident'}</h1>
                <p className={styles.subtitle}>
                    {view === 'route'
                        ? 'Help Port Harcourt move smarter by sharing your expert route knowledge.'
                        : 'Real-time road intelligence helps everyone avoid delays.'}
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
                    {message?.type === 'success' && !loading && (
                        <div className={styles.guestCTA}>
                            <p>Join the community to get more out of DAL!</p>
                            <div className={styles.ctaButtons}>
                                <Link href="/auth/signup" className={styles.ctaBtnPrimary}>Join DAL</Link>
                                <Link href="/login" className={styles.ctaBtnSecondary}>Login</Link>
                            </div>
                        </div>
                    )}
                    {view === 'route' ? (
                        <>
                            <div className={styles.sectionHeader}>
                                <h2>Where are you going?</h2>
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Starting Point</label>
                                    <div className={styles.inputWrapper}>
                                        <MapPin size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="origin"
                                            required
                                            placeholder="e.g. Mile 1 Park"
                                            className={styles.inputWithIcon}
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>End Point</label>
                                    <div className={styles.inputWrapper}>
                                        <MapPin size={18} className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="destination"
                                            required
                                            placeholder="e.g. Rumuokoro Junction"
                                            className={styles.inputWithIcon}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionHeader}>
                                <h2>Route Details</h2>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Best Vehicle</label>
                                    <select name="vehicleType" className={styles.select}>
                                        <option value="taxi">Taxi</option>
                                        <option value="bus">Bus</option>
                                        <option value="keke">Keke</option>
                                        <option value="private">Private Car</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Approx. Cost (₦)</label>
                                    <div className={styles.inputWrapper}>
                                        <DollarSign size={16} className={styles.inputIcon} />
                                        <input
                                            type="number"
                                            name="fareMax"
                                            placeholder="e.g. 500"
                                            className={styles.inputWithIcon}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>How long does it take? (mins)</label>
                                    <div className={styles.inputWrapper}>
                                        <Clock size={18} className={styles.inputIcon} />
                                        <input
                                            type="number"
                                            name="durationMinutes"
                                            placeholder="e.g. 30"
                                            className={styles.inputWithIcon}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sectionHeader}>
                                <h2>Directions</h2>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Step-by-Step Directions</label>
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        name="itinerary"
                                        placeholder="List major stops or turn-by-turn directions..."
                                        className={styles.textarea}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Important Advice</label>
                                <div className={styles.inputWrapper}>
                                    <textarea
                                        name="proTips"
                                        placeholder="Best time to go, where to board, or pitfalls to avoid..."
                                        className={styles.textarea}
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
                                <label className={styles.label}>Location</label>
                                <div className={styles.inputWrapper}>
                                    <MapPin size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        placeholder="e.g. Near Rumuola Bridge"
                                        className={styles.inputWithIcon}
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
