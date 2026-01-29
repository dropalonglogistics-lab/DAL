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
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile(data)
            }
            setLoading(false)
        }

        loadProfile()
    }, [supabase, router])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage({ type: 'error', text: result.error })
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            // Update local state to show change in avatar immediately
            const newAvatar = formData.get('avatarUrl') as string
            if (newAvatar) setProfile({ ...profile, avatar_url: newAvatar })
        }
        setSaving(false)
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

            <div className={styles.card}>
                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className={styles.avatarSection}>
                    <div className={styles.avatarDisplay}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className={styles.avatarImage} />
                        ) : (
                            profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{profile?.full_name || 'User'}</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{profile?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
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
                            <MapPin size={20} /> Location & Identity
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
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Profile Picture URL</label>
                                <input
                                    type="url"
                                    name="avatarUrl"
                                    defaultValue={profile?.avatar_url || ''}
                                    className={styles.input}
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={() => signOut()} className={styles.signOutBtn}>
                            <LogOut size={18} /> Sign Out
                        </button>
                        <button type="submit" disabled={saving} className={styles.saveBtn}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
