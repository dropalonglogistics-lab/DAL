'use client'

import React, { useState, useEffect } from 'react'
import { Users, AlertCircle, Map, TrendingUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import styles from '@/app/admin/Admin.module.css'

interface AdminStatsProps {
    userCount: number
    alertCount: number
    routeCount: number
    verifiedCount: number
}

export default function AdminStats({ 
    userCount: initialUserCount, 
    alertCount: initialAlertCount, 
    routeCount: initialRouteCount,
    verifiedCount: initialVerifiedCount
}: AdminStatsProps) {
    const [counts, setCounts] = useState({
        users: initialUserCount,
        alerts: initialAlertCount,
        routes: initialRouteCount,
        verified: initialVerifiedCount
    })

    const supabase = createClient()

    useEffect(() => {
        // Real-time subscription to global counts
        const channel = supabase
            .channel('dashboard-stats')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
                setCounts(prev => ({ ...prev, users: prev.users + 1 }))
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, () => {
                setCounts(prev => ({ ...prev, users: Math.max(0, prev.users - 1) }))
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, () => {
                setCounts(prev => ({ ...prev, alerts: prev.alerts + 1 }))
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'routes' }, (payload: any) => {
                setCounts(prev => {
                    const newRoutes = prev.routes + 1
                    const newVerified = payload.new?.status === 'approved' ? prev.verified + 1 : prev.verified
                    return { ...prev, routes: newRoutes, verified: newVerified }
                })
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'routes' }, (payload: any) => {
                // Track approval changes live
                if (payload.old?.status !== 'approved' && payload.new?.status === 'approved') {
                    setCounts(prev => ({ ...prev, verified: prev.verified + 1 }))
                } else if (payload.old?.status === 'approved' && payload.new?.status !== 'approved') {
                    setCounts(prev => ({ ...prev, verified: Math.max(0, prev.verified - 1) }))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const stats = [
        { label: 'Total Commuters', value: counts.users, icon: <Users size={24} color="#3B82F6" /> },
        { label: 'Active Alerts', value: counts.alerts, icon: <AlertCircle size={24} color="#EF4444" /> },
        { label: 'Route Suggestions', value: counts.routes, icon: <Map size={24} color="#10B981" /> },
        { label: 'Safety Verified', value: counts.verified, icon: <TrendingUp size={24} color="#F59E0B" /> },
    ]

    return (
        <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>{stat.label}</span>
                        {stat.icon}
                    </div>
                    <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    )
}
