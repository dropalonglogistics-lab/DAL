'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/page.module.css';

interface Stats {
    verifiedCount: number;
    alertCount: number;
    memberCount: number;
}

export default function LiveStatsRow() {
    const [stats, setStats] = useState<Stats | null>(null);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/community/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Update every 60 seconds
        return () => clearInterval(interval);
    }, []);

    if (!stats) {
        return <div className={styles.statsRowPlaceholder} />;
    }

    return (
        <div className={styles.statsRow}>
            <div className={styles.statItem}>
                <span className={styles.statIcon}>🗺️</span>
                <span className={styles.statText}>
                    <strong>{stats.verifiedCount}</strong> verified routes
                </span>
            </div>
            <span className={styles.statDot}>·</span>
            <div className={styles.statItem}>
                <span className={styles.statIcon}>⚠️</span>
                <span className={styles.statText}>
                    <strong>{stats.alertCount}</strong> alerts today
                </span>
            </div>
            <span className={stats.memberCount > 0 ? styles.statDot : styles.hidden}>·</span>
            {stats.memberCount > 0 && (
                <div className={styles.statItem}>
                    <span className={styles.statIcon}>👥</span>
                    <span className={styles.statText}>
                        <strong>{stats.memberCount.toLocaleString()}</strong> members
                    </span>
                </div>
            )}
        </div>
    );
}
