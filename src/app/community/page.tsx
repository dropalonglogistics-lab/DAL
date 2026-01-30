import { Users, Trophy, MessageSquare, Heart, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export default async function CommunityPage() {
    const supabase = await createClient();

    // Fetch recent community suggestions
    const { data: suggestions } = await supabase
        .from('community_routes')
        .select(`
            *,
            profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

    const stats = [
        { label: 'Active Users', value: '1,240+', icon: <Users size={24} /> },
        { label: 'Reports Today', value: '86', icon: <MessageSquare size={24} /> },
        { label: 'Routes Verified', value: '412', icon: <ShieldCheck size={24} /> },
        { label: 'Safe Miles', value: '12K', icon: <Heart size={24} /> },
    ];

    const contributors = [
        { name: 'Adebayo O.', points: 2450, rank: 1 },
        { name: 'Sarah M.', points: 2100, rank: 2 },
        { name: 'John D.', points: 1950, rank: 3 },
        { name: 'Grace E.', points: 1800, rank: 4 },
        { name: 'Michael T.', points: 1650, rank: 5 },
    ];

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1>Community Hub</h1>
                <p>
                    Join thousands of commuters making Port Harcourt movement smarter and safer through
                    real-time reporting and cooperative route verification.
                </p>
                <div className={styles.heroActions}>
                    <Link href="/suggest-route" className={styles.primaryBtn}>
                        <Navigation size={18} /> Suggest a Route
                    </Link>
                    <Link href="/alerts" className={styles.secondaryBtn}>
                        Share an Alert
                    </Link>
                </div>
            </section>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                {/* Content Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Trophy size={24} className={styles.iconStatic} />
                        Top Contributors
                    </h2>
                    <div className={styles.leaderboard}>
                        {contributors.map((user, index) => (
                            <div key={index} className={styles.leaderboardItem}>
                                <div className={styles.userInfo}>
                                    <span className={styles.rank}>#{user.rank}</span>
                                    <div className={styles.avatar}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className={styles.userName}>{user.name}</span>
                                </div>
                                <span className={styles.userPoints}>{user.points} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Suggestions Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <MapPin size={24} className={styles.iconStatic} />
                        Latest Suggestions
                    </h2>
                    <div className={styles.suggestionsList}>
                        {suggestions && suggestions.length > 0 ? (
                            suggestions.map((route) => (
                                <div key={route.id} className={styles.suggestionCard}>
                                    <div className={styles.suggestionHeader}>
                                        <strong>{route.origin} → {route.destination}</strong>
                                        <span className={styles.suggestionBadge}>{route.vehicle_type}</span>
                                    </div>
                                    <p className={styles.proTips}>&quot;{route.pro_tips}&quot;</p>
                                    <div className={styles.suggestionFooter}>
                                        <span>By {(route.profiles as any)?.full_name || 'Anonymous'}</span>
                                        <span>₦{route.price_estimated}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <p>No community suggestions yet. Be the first!</p>
                                <Link href="/suggest-route">Start suggesting</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <section className={styles.cta}>
                <h2>Your Voice Matters</h2>
                <p>
                    Verified contributors earn points towards Premium features.
                </p>
                <div className={styles.ctaButtons}>
                    <Link href="/suggest-route" className={styles.ctaButton}>
                        Share Route Knowledge
                    </Link>
                </div>
            </section>
        </div>
    );
}
