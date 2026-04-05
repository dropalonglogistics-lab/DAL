'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, MapPin, Calendar, Camera, LogOut, CheckCircle, AlertCircle, Shield, LayoutDashboard, Users as UsersIcon, Coins, Award, Navigation, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { signOut } from '../login/actions'
import styles from './profile.module.css'

import { fetchAdminStats } from '@/components/Admin/actions'
import AdminStats from '@/components/Admin/AdminStats'
import Spinner from '@/components/UI/Spinner'

export default function ProfileClient() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isStuck, setIsStuck] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [viewMode, setViewMode] = useState<'profile' | 'admin'>('profile')
    const [adminStats, setAdminStats] = useState<any>(null)
    const [counts, setCounts] = useState({ routes: 0, reports: 0 })

    const supabase = useState(() => createClient())[0]
    const router = useRouter()

    useEffect(() => {
        let isMounted = true
        let timer = setTimeout(() => {
            if (loading && isMounted) setIsStuck(true)
        }, 5000)

        async function loadProfile() {
            const startTime = performance.now()
            console.log("[Profile] Starting load flow...")
            setLoading(true)
            setIsStuck(false)
            setMessage(null)

            try {
                // 1. Get Session FAST
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                console.log(`[Profile] Session checked: ${Math.round(performance.now() - startTime)}ms`);
                
                let user = session?.user;
                if (!user) {
                    const { data: { user: authUser } } = await supabase.auth.getUser()
                    user = authUser;
                }

                if (!user) {
                    if (isMounted) router.push('/auth/login')
                    return
                }

                // 2. Fetch Profile FAST (Core Information)
                console.log("[Profile] Fetching core profile...");
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                console.log(`[Profile] Core data loaded: ${Math.round(performance.now() - startTime)}ms`);

                if (!isMounted) return;

                // 3. Update core state immediately (Show name and bio)
                if (profileData) {
                    setProfile(profileData)
                    setPreviewUrl(profileData.avatar_url)
                    setLoading(false) // UNBLOCK THE UI NOW!
                }

                if (profileError) {
                    throw profileError;
                }

                // 4. Fetch Secondary Stats in BACKGROUND (Deferred)
                console.log("[Profile] Background fetch for stats started...");
                Promise.all([
                    supabase.from('routes').select('*', { count: 'exact', head: true }).eq('submitted_by', user.id),
                    supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('reported_by', user.id)
                ]).then(([routeRes, alertRes]) => {
                    if (isMounted) {
                        setCounts({
                            routes: (routeRes as any).count || 0,
                            reports: (alertRes as any).count || 0
                        })
                        console.log(`[Profile] Background stats loaded: ${Math.round(performance.now() - startTime)}ms`);
                    }
                }).catch(err => console.warn("[Profile] Background stats failed:", err.message));

                // 5. DEFER Admin Stats to speed up rendering
                if (isMounted && profileData?.is_admin) {
                   fetchAdminStats().then(stats => {
                      if (isMounted) setAdminStats(stats);
                   }).catch(() => null);
                }

                clearTimeout(timer);

            } catch (error: any) {
                console.error('[Profile] Loading Error:', error.message)
                if (isMounted) setMessage({ type: 'error', text: 'Connection failed. Please retry.' })
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadProfile()

        // Sync with layout state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_OUT' && isMounted) {
                router.push('/login')
            }
        })

        return () => {
            isMounted = false
            clearTimeout(timer)
            subscription.unsubscribe()
        }
    }, [supabase, router])

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            setProfile({ ...profile, full_name: formData.get('full_name'), bio: formData.get('bio') })
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
        }
        setSaving(false)
    }

    const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setSaving(true)
            const reader = new FileReader()
            reader.onload = (e) => setPreviewUrl(e.target?.result as string)
            reader.readAsDataURL(file)

            const fileExt = file.name.split('.').pop()
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            const formData = new FormData()
            formData.append('avatar_url', publicUrl)
            await updateProfile(formData)
            
            setProfile({ ...profile, avatar_url: publicUrl })
            setMessage({ type: 'success', text: 'Avatar updated!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <Spinner size="large" />
                    <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Initializing secure connection...</p>
                    {isStuck && (
                        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'var(--card-hover)', borderRadius: '12px' }}>
                            <AlertCircle size={24} color="var(--warning)" style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '0.9rem' }}>Taking longer than usual. This might be due to a slow connection or RLS session sync.</p>
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }} 
                                style={{ 
                                    marginTop: '15px', 
                                    padding: '8px 16px', 
                                    backgroundColor: 'var(--primary)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Force Reset Session
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '20px' }} />
                    <h2>Connection Interrupt</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>We found your account, but your profile details are currently hidden or taking too long to load.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Header / Banner */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.avatarWrapper}>
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}><User size={40} /></div>
                        )}
                        <label className={styles.cameraBtn}>
                            <Camera size={14} />
                            <input type="file" hidden accept="image/*" onChange={handleUploadAvatar} disabled={saving} />
                        </label>
                    </div>
                    <div className={styles.infoGroup}>
                        <h1 className={styles.name}>{profile.full_name || 'Anonymous'}</h1>
                        <p className={styles.email}><Mail size={14} /> {profile.email}</p>
                        <div className={styles.badgeRow}>
                            {profile.is_admin && <span className={styles.adminBadge}><Shield size={12} /> Admin Oversight</span>}
                            <span className={styles.pointsBadge}><Coins size={12} /> {profile.points_total || 0} Journey Points</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button onClick={() => setViewMode(viewMode === 'profile' ? 'admin' : 'profile')} className={styles.secondaryBtn}>
                            {viewMode === 'profile' ? (
                                <><LayoutDashboard size={14} /> Stats</>
                            ) : (
                                <><User size={14} /> Edit</>
                            )}
                        </button>
                        <button onClick={() => signOut()} className={styles.logoutBtn}><LogOut size={14} /> Sign Out</button>
                    </div>
                </div>
            </div>

            {viewMode === 'profile' ? (
                <div className={styles.contentGrid}>
                    <div className={styles.mainCol}>
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2>Profile Details</h2>
                            </div>
                            <form onSubmit={handleUpdateProfile} className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input name="full_name" defaultValue={profile.full_name} placeholder="Your name" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Bio</label>
                                    <textarea name="bio" defaultValue={profile.bio} placeholder="Tell us about yourself..." />
                                </div>
                                <div className={styles.formActions}>
                                    <button type="submit" disabled={saving} className={styles.primaryBtn}>
                                        {saving ? <Spinner size="small" /> : 'Save Changes'}
                                    </button>
                                </div>
                                {message && (
                                    <div className={`${styles.statusMsg} ${styles[message.type]}`}>
                                        {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                        {message.text}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className={styles.sideCol}>
                        <div className={styles.statsCard}>
                            <h3>Your Influence</h3>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}><Navigation size={14} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statVal}>{counts.routes}</span>
                                    <span className={styles.statLbl}>Paths Suggested</span>
                                </div>
                            </div>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}><Activity size={14} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statVal}>{counts.reports}</span>
                                    <span className={styles.statLbl}>Road Alerts</span>
                                </div>
                            </div>
                            <div className={styles.statRow}>
                                <div className={styles.statIcon}><Award size={14} /></div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statVal}>{profile.points_total || 0}</span>
                                    <span className={styles.statLbl}>Contribution Pts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.adminView}>
                    <AdminStats 
                        userCount={adminStats?.userCount || 0}
                        alertCount={adminStats?.alertCount || 0}
                        routeCount={adminStats?.routeCount || 0}
                        verifiedCount={adminStats?.verifiedCount || 0}
                    />
                </div>
            )}
        </div>
    )
}
