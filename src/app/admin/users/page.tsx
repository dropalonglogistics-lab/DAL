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
        <div className="animate-fade-in">
            <h1 className={styles.title}>User Management</h1>
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
                Control access and promote community leaders to Administrative roles.
            </p>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles?.map((profile) => (
                            <tr key={profile.id}>
                                <td>
                                    <div className={styles.userName}>{profile.full_name}</div>
                                    <div className={styles.userEmail}>{profile.email}</div>
                                </td>
                                <td>
                                    {profile.is_admin ? (
                                        <span className={`${styles.badge} ${styles.badgeAdmin}`}>
                                            <Shield size={14} /> Admin
                                        </span>
                                    ) : (
                                        <span className={`${styles.badge} ${styles.badgeUser}`}>User</span>
                                    )}
                                </td>
                                <td>
                                    {!profile.is_admin && (
                                        <form action={promoteToAdmin}>
                                            <input type="hidden" name="userId" value={profile.id} />
                                            <button type="submit" className={styles.promoteBtn}>
                                                <UserCheck size={14} /> Make Admin
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!profiles || profiles.length === 0) && (
                    <div className={styles.emptyState}>
                        <p>No community users found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
