'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, MapPin, Calendar, Camera, LogOut, CheckCircle, AlertCircle, Shield, LayoutDashboard, Users as UsersIcon, Coins, Award } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { signOut } from '../login/actions'
import styles from './profile.module.css'

import { fetchAdminStats } from '@/components/Admin/actions'
import AdminStats from '@/components/Admin/AdminStats'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [viewMode, setViewMode] = useState<'profile' | 'admin'>('profile')
    const [debugLog, setDebugLog] = useState<string[]>([])
    const [adminStats, setAdminStats] = useState<any>(null)
    const addLog = (msg: string) => setDebugLog(prev => [...prev.slice(-10), msg])

    const supabase = useState(() => createClient())[0]
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            const loadId = Math.random().toString(36).substring(7)
            addLog(`[${loadId}] Starting initialization...`)
            setLoading(true)

            try {
                // 1. Auth check
                const { data, error: userError } = await supabase.auth.getUser()
                const user = data?.user
                if (userError) addLog(`Auth Error: ${userError.message}`)

                if (!isMounted) return
                if (!user) {
                    addLog("No user, redirecting...")
                    router.push('/login')
                    return
                }

                addLog(`Authenticated as ${user.email}`)

                // 2. Fetch Profile
                addLog("Fetching profile from DB...")
                const { data: dbData, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (fetchError) {
                    addLog(`Fetch Error: ${fetchError.code} - ${fetchError.message}`)
                    if (fetchError.code !== 'PGRST116') throw fetchError
                }

                let profileData = dbData

                // 3. Auto-Create
                if (!profileData) {
                    addLog("Profile missing, attempting creation...")
                    const { data: neu, error: insErr } = await supabase.from('profiles').insert([{
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || 'Member',
                        is_admin: false
                    }]).select().single()

                    if (insErr) {
                        addLog(`Creation failed: ${insErr.message}`)
                        throw insErr
                    }
                    addLog("Profile created successfully")
                    profileData = neu
                }

                // 4. Admin Stats with TIMEOUT
                if (profileData?.is_admin) {
                    addLog("User is admin, fetching stats (with timeout)...")
                    try {
                        // Use a Promise.race to ensure we don't hang
                        const stats = await Promise.race([
                            fetchAdminStats(),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Stats Timeout')), 5000))
                        ])
                        if (isMounted) setAdminStats(stats)
                        addLog("Admin stats loaded")
                    } catch (err: any) {
                        addLog(`Stats failed or timed out: ${err.message}`)
                    }
                }

                if (isMounted) {
                    setProfile(profileData)
                    setPreviewUrl(profileData?.avatar_url)
                    addLog("Loading complete")
                }
            } catch (err: any) {
                addLog(`CRITICAL ERROR: ${err.message}`)
                if (isMounted) setMessage({ type: 'error', text: err.message })
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadProfile()
        return () => { isMounted = false }
    }, [router, supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setMessage(null)
        setUploadProgress(10)

        try {
            const formData = new FormData(e.currentTarget)
            const file = formData.get('avatarFile') as File
            let avatarUrl = profile?.avatar_url

            // 1. Handle File Upload if a new file is selected
            if (file && file.size > 0) {
                const { data: authData } = await supabase.auth.getUser()
                const user = authData?.user
                if (!user) throw new Error('Not authenticated')

                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Math.random()}.${fileExt}`
                const filePath = fileName

                setUploadProgress(30)
                const { error: uploadError, data } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true })

                if (uploadError) throw uploadError

                setUploadProgress(60)
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath)

                avatarUrl = publicUrl
                formData.set('avatarUrl', avatarUrl)
            }

            setUploadProgress(80)
            // 2. Update Database Profile
            const result = await updateProfile(formData)

            if (result?.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully!' })
                setProfile({ ...profile, avatar_url: avatarUrl })
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred' })
        } finally {
            setSaving(false)
            setUploadProgress(0)
        }
    }

    async function handleSync() {
        console.log("[Profile] 🔄 MANUALLY TRIGGERED RE-SYNC")
        setLoading(true)
        setMessage(null)
        try {
            const { data, error } = await supabase.auth.refreshSession()
            console.log("[Profile] 🔄 Session Refresh Result:", { success: !!data.session, error })
            // Re-run the mounting effect logic
            window.location.reload()
        } catch (err) {
            console.error("[Profile] ❌ Sync failed:", err)
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </div>
                <div className={styles.card}>
                    <div className={styles.avatarSection}>
                        <div className={`${styles.skeleton} ${styles.skeletonCircle}`} />
                        <div className={styles.avatarInfo}>
                            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                            <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                        </div>
                    </div>
                </div>

                {/* Debug Console */}
                <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    background: '#1E293B',
                    color: '#94A3B8',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '8px', color: '#F8FAFC' }}>
                        🔍 Real-time Diagnostic Log
                    </div>
                    {debugLog.length === 0 && <div>Waiting for process...</div>}
                    {debugLog.map((log, i) => (
                        <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
                    ))}
                </div>
            </div>
        )
    }

    // Special Error View for Missing Database Column
    if (message?.text.includes('PGRST204') || message?.text.includes('is_admin') || message?.text.includes('DB Error')) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ border: '2px solid var(--color-warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <AlertCircle size={32} color="var(--color-warning)" />
                        <div>
                            <h2 style={{ marginTop: 0 }}>⚠️ Connection or Database Issue</h2>
                            <p>{message.text}</p>
                            <p><strong>Common Fix:</strong> Run the 'Sync Data' command or verify your database schema.</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={handleSync} className={styles.saveBtn}>Force Re-sync Session</button>
                                <button onClick={() => window.location.reload()} className={styles.signOutBtn}>Reload Page</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!profile && !loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className={styles.staggerEntry}>
                        <User size={48} color="var(--text-secondary)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <h2>Profile Data Not Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            We found your account, but your profile details are taking too long to load or are currently hidden.
                        </p>

                        {message && (
                            <div style={{
                                margin: '0 auto 24px auto',
                                padding: '12px',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                color: 'var(--color-error)',
                                fontSize: '0.85rem',
                                maxWidth: '400px'
                            }}>
                                <strong>Technical Detail:</strong> {message.text}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                            <button onClick={handleSync} className={styles.saveBtn}>
                                Force Re-sync Data
                            </button>
                            <button onClick={() => window.location.reload()} className={styles.signOutBtn}>
                                Refresh Browser
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.header} ${styles.staggerEntry} ${styles.delay_1}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 className={styles.title}>{viewMode === 'admin' ? 'Admin Dashboard' : 'Your Profile'}</h1>
                        <p className={styles.subtitle}>{viewMode === 'admin' ? 'System overview and statistics.' : 'Manage your personal information.'}</p>
                    </div>

                    {profile?.is_admin && (
                        <div className={styles.toggleContainer}>
                            <button
                                type="button"
                                className={`${styles.toggleBtn} ${viewMode === 'profile' ? styles.active : ''}`}
                                onClick={() => setViewMode('profile')}
                            >
                                <User size={18} /> Profile
                            </button>
                            <button
                                type="button"
                                className={`${styles.toggleBtn} ${viewMode === 'admin' ? styles.active : ''}`}
                                onClick={() => setViewMode('admin')}
                            >
                                <Shield size={18} /> Admin
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={`${styles.card} ${styles.staggerEntry} ${styles.delay_2}`}>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]} animate-fade-in`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                {viewMode === 'admin' && adminStats ? (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '32px' }}>
                            <AdminStats
                                userCount={adminStats.userCount}
                                alertCount={adminStats.alertCount}
                                routeCount={adminStats.routeCount}
                            />
                        </div>

                        <div className={styles.adminSection}>
                            <div className={styles.sectionTitle}>
                                <Shield size={20} color="var(--color-warning)" /> Quick Actions
                            </div>
                            <div className={styles.adminGrid}>
                                <a href="/admin" className={styles.adminCard}>
                                    <div className={styles.adminCardIcon}>
                                        <LayoutDashboard size={20} />
                                    </div>
                                    <div className={styles.adminCardContent}>
                                        <h4>Full Dashboard</h4>
                                        <p>Go to main admin portal</p>
                                    </div>
                                </a>
                                <a href="/admin/users" className={styles.adminCard}>
                                    <div className={styles.adminCardIcon}>
                                        <UsersIcon size={20} />
                                    </div>
                                    <div className={styles.adminCardContent}>
                                        <h4>User Management</h4>
                                        <p>Manage roles and permissions</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Avatar Section */}
                        <div className={`${styles.avatarSection} ${styles.staggerEntry} ${styles.delay_3}`}>
                            <div className={styles.avatarDisplay}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className={styles.avatarImage} />
                                ) : (
                                    profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()
                                )}
                                <label className={styles.avatarOverlay}>
                                    <Camera size={24} />
                                    <input
                                        type="file"
                                        name="avatarFile"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className={styles.fileInput}
                                    />
                                </label>
                            </div>
                            <div className={styles.avatarInfo}>
                                <h3 style={{ margin: 0 }}>{profile?.full_name || 'User'}</h3>
                                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{profile?.email}</p>
                                <div className={styles.profileStatRow}>
                                    <div className={styles.pointsDisplay}>
                                        <Coins size={16} />
                                        <span>{profile?.points || 0} Points Earned</span>
                                    </div>
                                    {profile?.points >= 10 && (
                                        <div className={styles.rankBadge}>
                                            <Award size={14} />
                                            <span>Master Scout</span>
                                        </div>
                                    )}
                                </div>
                                {profile?.is_admin && <span className={styles.adminBadge}>Administrator</span>}
                                <p className={styles.uploadHint}>Click the icon to change your photo</p>
                            </div>
                        </div>

                        {/* Personal Details Form */}
                        <div className={`${styles.section} ${styles.staggerEntry} ${styles.delay_4}`}>
                            <div className={styles.sectionTitle}>
                                <User size={20} /> Personal Details
                            </div>
                            <div className={styles.grid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        defaultValue={profile?.full_name || ''}
                                        className={styles.input}
                                        required
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        defaultValue={profile?.date_of_birth || ''}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.section} ${styles.staggerEntry} ${styles.delay_5}`}>
                            <div className={styles.sectionTitle}>
                                <MapPin size={20} /> Location Information
                            </div>
                            <div className={styles.grid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label className={styles.label}>Home Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        defaultValue={profile?.address || ''}
                                        className={styles.input}
                                        placeholder="Street, City, Country"
                                    />
                                </div>
                                <input type="hidden" name="avatarUrl" defaultValue={profile?.avatar_url || ''} />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button type="button" onClick={() => signOut()} className={styles.signOutBtn}>
                                <LogOut size={18} /> Sign Out
                            </button>
                            <button type="submit" disabled={saving} className={styles.saveBtn}>
                                {saving ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="spinner-small"></div> Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}

                {saving && uploadProgress > 0 && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
            </div>
        </div>
    )
}
