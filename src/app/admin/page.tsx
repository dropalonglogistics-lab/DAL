import { createClient } from '@/utils/supabase/server'
import styles from './admin.module.css'
import { fetchAdminStats } from '@/components/Admin/actions'
import AdminStats from '@/components/Admin/AdminStats'
import { DownloadCloud, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
                <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={24} color="var(--color-primary)" /> Platform Data Sync
                </h2>
                <div className={styles.statCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', lineHeight: 1.6 }}>
                        Analytics engine active. Monitoring Port Harcourt traffic patterns and user report accuracy. You can export the current database of Community Routes for external analysis or ML-training purposes below.
                    </p>
                    <a href="/api/export-routes" download className={styles.saveBtn} style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 24px', width: 'auto' }}>
                        <DownloadCloud size={18} /> Export Routes (CSV)
                    </a>
                </div>
            </div>
        </div>
    )
}


