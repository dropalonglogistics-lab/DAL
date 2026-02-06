'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, MapPin, Calendar, Camera, LogOut, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateProfile } from './actions'
import { signOut } from '../login/actions'
import styles from './profile.module.css'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // If profile doesn't exist (or fetch error), try to create it based on auth data
            if (!data) {
                console.log("Profile not found, creating default profile...")
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || '',
                        avatar_url: user.user_metadata?.avatar_url || '',
                        is_admin: false
                    }])
                    .select()
                    .single()

                if (newProfile) {
                    data = newProfile
                } else {
                    console.error("Error creating profile:", createError)
                    setMessage({ type: 'error', text: 'Failed to load or create profile. Please try refreshing.' })
                }
            }

            if (data) {
                setProfile(data)
                setPreviewUrl(data.avatar_url)
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase, router])

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
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Profile</h1>
                <p className={styles.subtitle}>Manage your personal information and preferences.</p>
            </div>

            <div className={`${styles.card} animate-fade-in-up`}>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]} animate-fade-in`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                            <p className={styles.uploadHint}>Click the icon to change your photo</p>
                        </div>
                    </div>

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
                {saving && uploadProgress > 0 && (
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
            </div>
        </div>
    )
}
