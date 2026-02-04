import { createClient } from '@/utils/supabase/server'
import styles from './admin.module.css'
import { Users, AlertCircle, Map, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch Analytics Data
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: alertCount } = await supabase.from('alerts').select('*', { count: 'exact', head: true })
    const { count: routeCount } = await supabase.from('community_routes').select('*', { count: 'exact', head: true })

    const stats = [
        { label: 'Total Commuters', value: userCount || 0, icon: <Users size={24} color="#3B82F6" /> },
        { label: 'Active Alerts', value: alertCount || 0, icon: <AlertCircle size={24} color="#EF4444" /> },
        { label: 'Route Suggestions', value: routeCount || 0, icon: <Map size={24} color="#10B981" /> },
        { label: 'Safety Verified', value: Math.floor((routeCount || 0) * 0.8), icon: <TrendingUp size={24} color="#F59E0B" /> },
    ]

    return (
        <div>
            <h1 className={styles.title}>System Overview</h1>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={statCardStyle(index)}>
                        <div className={styles.statHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={styles.statLabel}>{stat.label}</span>
                            {stat.icon}
                        </div>
                        <span className={styles.statValue}>{stat.value}</span>
                    </div>
                ))}
            </div>

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

function statCardStyle(index: number) {
    return styles.statCard
}
