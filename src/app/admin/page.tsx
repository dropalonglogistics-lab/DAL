import { createClient } from '@/utils/supabase/server'
import styles from './admin.module.css'
import { fetchAdminStats } from '@/components/Admin/actions'
import AdminStats from '@/components/Admin/AdminStats'

export default async function AdminDashboard() {
    const stats = await fetchAdminStats()

    return (
        <div>
            <h1 className={styles.title}>System Overview</h1>

            <AdminStats
                userCount={stats.userCount}
                alertCount={stats.alertCount}
                routeCount={stats.routeCount}
            />

            <div style={{ marginTop: '48px' }}>
                <h2 style={{ marginBottom: '24px' }}>Platform Activity</h2>
                <div className={styles.statCard}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Analytics engine active. Monitoring Port Harcourt traffic patterns and user report accuracy.
                    </p>
                </div>
            </div>
        </div>
    )
}


