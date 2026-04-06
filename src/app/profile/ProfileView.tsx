'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { signOut } from '../login/actions'
import styles from './profile.module.css'
import Spinner from '@/components/UI/Spinner'
import { 
    Camera, 
    User, 
    Mail, 
    MapPin as Map, 
    Award, 
    Activity, 
    LogOut, 
    Settings, 
    Globe, 
    Zap,
    Trophy,
    CheckCircle2
} from 'lucide-react'

interface ProfileClientProps {
    initialUser: any;
    initialProfile: any;
}

export default function ProfileClient({ initialUser, initialProfile }: ProfileClientProps) {
    const [profile, setProfile] = useState<any>(initialProfile)
    const [loading, setLoading] = useState(!initialProfile) // Only load if profile is missing
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [counts, setCounts] = useState({ routes: 0, reports: 0 })

    const supabase = useState(() => createClient())[0]
    const router = useRouter()

    useEffect(() => {
        let isMounted = true
        async function refreshData() {
            try {
                // 1. Handle missing profile if server-side fetch was null
                if (!profile && initialUser) {
                    setLoading(true)
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', initialUser.id)
                        .maybeSingle();

                    if (!profileData) {
                        // Auto-create profile if missing
                        const { data: newProfile } = await supabase
                            .from('profiles')
                            .upsert({
                                id: initialUser.id,
                                email: initialUser.email,
                                full_name: initialUser.user_metadata?.full_name || 'Member',
                                onboarding_completed: false
                            })
                            .select()
                            .maybeSingle();
                        if (isMounted) setProfile(newProfile || { id: initialUser.id, email: initialUser.email, full_name: 'Member', points: 0 });
                    } else {
                        if (isMounted) setProfile(profileData)
                    }
                    if (isMounted) setLoading(false)
                }

                // 2. Parallel Background Fetch for metrics
                if (initialUser) {
                    const [routeRes, alertRes] = await Promise.all([
                        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('submitted_by', initialUser.id),
                        supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('reported_by', initialUser.id)
                    ])

                    if (isMounted) {
                        setCounts({
                            routes: (routeRes as any).count || 0,
                            reports: (alertRes as any).count || 0
                        })
                    }
                }
            } catch (error: any) {
                console.error('[Profile] Loading Error:', error.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        refreshData()
    }, [supabase, initialUser])

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            setProfile({ ...profile, full_name: formData.get('full_name'), bio: formData.get('bio') })
            setTimeout(() => setMessage(null), 3000)
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
        }
        setSaving(false)
    }

    if (loading && !profile) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spinner size="large" />
            </div>
        )
    }

    if (!profile && !initialUser) return null;

    const getInitials = (name: string) => {
        if (!name) return 'DL';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className={styles.container}>
            {/* 1. Hero / Cover Section */}
            <section className={styles.heroSection}>
                <div className={styles.cover}></div>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatar}>
                            {getInitials(profile?.full_name || initialUser?.user_metadata?.full_name)}
                        </div>
                        <button className={styles.cameraBtn} title="Change Profile Picture">
                            <Camera size={18} />
                        </button>
                    </div>
                    <div className={styles.userInfo}>
                        <h1 className={styles.userName}>{profile?.full_name || initialUser?.user_metadata?.full_name || 'DAL Member'}</h1>
                        <p className={styles.userEmail}>{profile?.email || initialUser?.email}</p>
                        <div className={styles.badgeGroup}>
                            <span className={`${styles.badge} ${styles.tealBadge}`}>
                                <Zap size={14} /> {profile?.points || 0} Journey Points
                            </span>
                            <span className={`${styles.badge} ${styles.blueBadge}`}>
                                <Award size={14} /> Elite Navigator
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <main className={styles.mainContent}>
                {/* 2. Metrics Bar */}
                <section className={styles.metricsBar}>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'var(--profile-teal-bg)', color: 'var(--profile-teal-text)' }}>
                            <Activity size={24} />
                        </div>
                        <div className={styles.metricInfo}>
                            <span className={styles.metricValue}>{profile?.points || 0}</span>
                            <span className={styles.metricLabel}>Journey Points</span>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'var(--profile-blue-bg)', color: 'var(--profile-blue-text)' }}>
                            <Map size={24} />
                        </div>
                        <div className={styles.metricInfo}>
                            <span className={styles.metricValue}>{counts.routes}</span>
                            <span className={styles.metricLabel}>Routes Suggested</span>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon} style={{ background: 'rgba(239, 159, 39, 0.1)', color: 'var(--profile-gold)' }}>
                            <Trophy size={24} />
                        </div>
                        <div className={styles.metricInfo}>
                            <span className={styles.metricValue}>Top 5%</span>
                            <span className={styles.metricLabel}>Community Rank</span>
                        </div>
                    </div>
                </section>

                {/* 3. Dashboard Grid */}
                <div className={styles.dashboardGrid}>
                    {/* Left Column: Form Settings */}
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Settings size={20} /> Profile Details
                        </h3>
                        <form onSubmit={handleUpdateProfile} className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        name="full_name" 
                                        defaultValue={profile?.full_name || initialUser?.user_metadata?.full_name} 
                                        placeholder="Your full name" 
                                    />
                                </div>
                            </div>
                            <div className={styles.formField}>
                                <label>Bio & Interests</label>
                                <textarea 
                                    name="bio" 
                                    defaultValue={profile?.bio} 
                                    placeholder="Tell the community about your typical routes or travel preferences..." 
                                />
                            </div>
                            
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => window.location.reload()}>
                                    Discard
                                </button>
                                <button type="submit" disabled={saving} className={styles.saveBtn}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            
                            {message && (
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    color: message.type === 'success' ? '#10B981' : '#EF4444', 
                                    fontSize: '0.9rem', 
                                    marginTop: '10px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                }}>
                                    {message.type === 'success' && <CheckCircle2 size={16} />}
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </section>

                    {/* Right Column: Your Influence */}
                    <aside className={`${styles.card} ${styles.influenceCard}`}>
                        <h3 className={styles.cardTitle}>
                            <Globe size={20} /> Your Influence
                        </h3>
                        <div className={styles.influenceRow}>
                            <div className={styles.influenceLabel}>
                                <Map size={16} /> Routes Shared
                            </div>
                            <div className={styles.influenceValue}>{counts.routes}</div>
                        </div>
                        <div className={styles.influenceRow}>
                            <div className={styles.influenceLabel}>
                                <Zap size={16} /> Global Points
                            </div>
                            <div className={styles.influenceValue}>{profile?.points || 0}</div>
                        </div>
                        <div className={styles.influenceRow}>
                            <div className={styles.influenceLabel}>
                                <Activity size={16} /> Reported Incidents
                            </div>
                            <div className={styles.influenceValue}>{counts.reports}</div>
                        </div>
                        <div className={styles.influenceRow} style={{ marginTop: '20px', borderBottom: 'none' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--profile-text-muted)', lineHeight: '1.5' }}>
                                Your contributions help thousands of commuters in the DAL network find safer and faster routes.
                            </div>
                        </div>
                    </aside>
                </div>

                {/* 4. Footer Actions */}
                <div className={styles.profileFooter}>
                    <button onClick={() => signOut()} className={styles.signOutBtn}>
                        <LogOut size={18} /> Sign Out of Platform
                    </button>
                    <div style={{ fontSize: '0.75rem', color: 'var(--profile-text-muted)' }}>
                        User ID: {profile?.id?.substring(0, 8) || initialUser?.id?.substring(0, 8)}...
                    </div>
                </div>
            </main>
        </div>
    )
}
