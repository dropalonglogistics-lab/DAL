'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, updateAvatarUrl } from './actions'
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
    CheckCircle2,
    Loader2
} from 'lucide-react'

interface ProfileClientProps {
    initialUser: any;
    initialProfile: any;
}

export default function ProfileClient({ initialUser, initialProfile }: ProfileClientProps) {
    const [profile, setProfile] = useState<any>(initialProfile)
    const [loading, setLoading] = useState(!initialProfile)
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [counts, setCounts] = useState({ routes: 0, reports: 0 })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = useState(() => createClient())[0]
    const router = useRouter()

    useEffect(() => {
        let isMounted = true
        async function refreshData() {
            try {
                if (!profile && initialUser) {
                    setLoading(true)
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', initialUser.id)
                        .maybeSingle();

                    if (!profileData) {
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

    // --- Avatar Upload Logic ---
    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Validation
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size should be under 2MB' })
            return
        }

        setUploadingAvatar(true)
        setMessage(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const fileExt = file.name.split('.').pop()
            const fileName = `avatar-${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // 2. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            // 4. Update Database
            const res = await updateAvatarUrl(publicUrl)
            if (res.error) throw new Error(res.error)

            // 5. Update Local State
            setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }))
            setMessage({ type: 'success', text: 'Profile picture updated!' })
            
            // Cleanup: Clear formal state after a while
            setTimeout(() => setMessage(null), 3000)
        } catch (error: any) {
            console.error('[Upload] Error:', error.message)
            setMessage({ type: 'error', text: error.message || 'Failed to upload image' })
        } finally {
            setUploadingAvatar(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated!' })
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
                            {uploadingAvatar ? (
                                <Loader2 className="animate-spin" size={30} color="var(--brand-gold)" />
                            ) : profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className={styles.avatarImg} />
                            ) : (
                                getInitials(profile?.full_name || initialUser?.user_metadata?.full_name)
                            )}
                        </div>
                        <button 
                            className={`${styles.cameraBtn} ${uploadingAvatar ? styles.btnDisabled : ''}`} 
                            onClick={handleAvatarClick}
                            disabled={uploadingAvatar}
                            title="Change Profile Picture"
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
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

                <div className={styles.dashboardGrid}>
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Settings size={20} /> Profile Details
                        </h3>
                        <form onSubmit={handleUpdateProfile} className={styles.formGrid}>
                            <div className={styles.formField}>
                                <label>Full Name</label>
                                <input 
                                    name="full_name" 
                                    defaultValue={profile?.full_name || initialUser?.user_metadata?.full_name} 
                                    placeholder="Your full name" 
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>Bio & Interests</label>
                                <textarea 
                                    name="bio" 
                                    defaultValue={profile?.bio} 
                                    placeholder="Tell the community about your travel preferences..." 
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
                                <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage} style={{ marginTop: '1.5rem' }}>
                                    {message.type === 'success' && <CheckCircle2 size={16} />}
                                    {message.text}
                                </div>
                            )}
                        </form>
                    </section>

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
                        <div className={styles.influenceRow} style={{ borderBottom: 'none' }}>
                            <div className={styles.influenceLabel}>
                                <Activity size={16} /> Reported Incidents
                            </div>
                            <div className={styles.influenceValue}>{counts.reports}</div>
                        </div>
                    </aside>
                </div>

                <div className={styles.profileFooter}>
                    <button onClick={() => signOut()} className={styles.signOutBtn}>
                        <LogOut size={18} /> Sign Out of Platform
                    </button>
                    <div style={{ fontSize: '12px', color: 'var(--profile-text-muted)' }}>
                        User ID: {profile?.id?.substring(0, 8)}...
                    </div>
                </div>
            </main>
        </div>
    )
}
