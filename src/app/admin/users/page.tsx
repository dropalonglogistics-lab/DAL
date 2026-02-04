import { createClient } from '@/utils/supabase/server'
import styles from '../admin.module.css'
import { promoteToAdmin } from '../actions'
import { UserCheck, Shield } from 'lucide-react'

export default async function UserManagement() {
    const supabase = await createClient()
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div>
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                Control access and promote community leaders to Administrative roles.
            </p>

            <div className={styles.statCard} style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--background)', textAlign: 'left' }}>
                        <tr>
                            <th style={{ padding: '16px' }}>User</th>
                            <th style={{ padding: '16px' }}>Status</th>
                            <th style={{ padding: '16px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles?.map((profile) => (
                            <tr key={profile.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 700 }}>{profile.full_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{profile.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {profile.is_admin ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Shield size={14} /> Admin
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>User</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    {!profile.is_admin && (
                                        <form action={promoteToAdmin}>
                                            <input type="hidden" name="userId" value={profile.id} />
                                            <button
                                                type="submit"
                                                style={{
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <UserCheck size={14} /> Make Admin
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
