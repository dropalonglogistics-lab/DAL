'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, MapPin, Calendar, Camera, LogOut, CheckCircle, AlertCircle, Shield, LayoutDashboard, Users as UsersIcon } from 'lucide-react'
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
    const [adminStats, setAdminStats] = useState<any>(null)

    const supabase = useState(() => createClient())[0]
    const router = useRouter()

    useEffect(() => {
        let isMounted = true

        async function loadProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (!isMounted) return

                if (!user) {
                    router.push('/login')
                    return
                }

                let { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (!isMounted) return

                if (fetchError && fetchError.code !== 'PGRST116') {
                    throw new Error(`Fetch error: ${fetchError.message} (${fetchError.code})`)
                }

                if (!data) {
                    const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([{
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        avatar_url: user.user_metadata?.avatar_url || '',
                        is_admin: false
                    }]).select().single()

                    if (!isMounted) return

                    if (insertError) {
                        throw new Error(`Profile creation failed. Error: ${insertError.message}`)
                    }
                    data = newProfile
                }

                if (data && isMounted) {
                    setProfile(data)
                    setPreviewUrl(data.avatar_url)

                    if (data.is_admin) {
                        try {
                            const stats = await fetchAdminStats()
                            if (isMounted) setAdminStats(stats)
                        } catch (err) {
                            console.error("Failed to fetch admin stats:", err)
                        }
                    }
                }
            } catch (err: any) {
                // Ignore benign abort errors
                if (err.name === 'AbortError') return

                console.error("Profile load error:", err)
                if (isMounted) setMessage({ type: 'error', text: 'Error loading profile: ' + (err.message || 'Unknown error') })
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        loadProfile()
        return () => { isMounted = false }
    }, [router])

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
                const { data: { user } } = await supabase.auth.getUser()
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

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                        <p style={{ color: 'var(--text-secondary)' }}>Loading your profile intelligence...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Special Error View for Missing Database Column
    if (message?.text.includes('PGRST204') || message?.text.includes('is_admin')) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ border: '2px solid var(--color-warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <AlertCircle size={32} color="var(--color-warning)" />
                        <div>
                            <h2 style={{ marginTop: 0 }}>⚠️ Database Repair Required</h2>
                            <p>Your profile is locked because the <code>is_admin</code> column is missing.</p>
                            <p><strong>Run this in your Supabase SQL Editor:</strong></p>
                            <pre style={{ background: '#1E293B', color: '#F8FAFC', padding: '15px', borderRadius: '8px', overflowX: 'auto', marginBottom: '16px' }}>
                                {`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
NOTIFY pgrst, 'reload schema';`}
                            </pre>
                            <button onClick={() => window.location.reload()} className={styles.saveBtn}>I've fixed it, Reload</button>
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
                    <User size={48} color="var(--text-secondary)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                    <h2>No Profile Found</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        We couldn't retrieve your profile data. This might be a connection issue.
                    </p>
                    <button onClick={() => window.location.reload()} className={styles.saveBtn}>
                        Force Re-sync Data
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
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

            <div className={`${styles.card} animate-fade-in-up`}>
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
                        <div className={styles.avatarSection}>
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
                                {profile?.is_admin && <span className={styles.adminBadge}>Administrator</span>}
                                <p className={styles.uploadHint}>Click the icon to change your photo</p>
                            </div>
                        </div>

                        {/* Personal Details Form */}
                        <div className={styles.section}>
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

                        <div className={styles.section}>
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
