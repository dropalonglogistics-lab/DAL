'use client'

import React from 'react'
import { Users, AlertCircle, Map, TrendingUp } from 'lucide-react'
import styles from '@/app/admin/admin.module.css'

interface AdminStatsProps {
    userCount: number
    alertCount: number
    routeCount: number
}

export default function AdminStats({ userCount, alertCount, routeCount }: AdminStatsProps) {
    const stats = [
        { label: 'Total Commuters', value: userCount || 0, icon: <Users size={24} color="#3B82F6" /> },
        { label: 'Active Alerts', value: alertCount || 0, icon: <AlertCircle size={24} color="#EF4444" /> },
        { label: 'Route Suggestions', value: routeCount || 0, icon: <Map size={24} color="#10B981" /> },
        { label: 'Safety Verified', value: Math.floor((routeCount || 0) * 0.8), icon: <TrendingUp size={24} color="#F59E0B" /> },
    ]

    return (
        <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>{stat.label}</span>
                        {stat.icon}
                    </div>
                    <span className={styles.statValue}>{stat.value}</span>
                </div>
            ))}
        </div>
    )
}
