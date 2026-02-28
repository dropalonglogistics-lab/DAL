import { Users, Trophy, MessageSquare, Heart, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export default async function CommunityPage() {
    const supabase = await createClient();

    // 1. Fetch real stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

    // Reports in last 24h
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    const { count: reportCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', yesterday.toISOString());

    const { count: verifiedCount } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: totalRoutes } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true });

    // 2. Fetch recent community suggestions
    const { data: suggestions } = await supabase
        .from('community_routes')
        .select(`
            *,
            profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    // 3. Fetch Top Contributors (Ordered by points, then by suggestion count)
    // For now, we fetch by points; if most are 0, we'll just show the existing users
    const { data: topUsers } = await supabase
        .from('profiles')
        .select('full_name, points')
        .order('points', { ascending: false })
        .limit(5);

    const stats = [
        { label: 'Active Users', value: `${userCount || 0}+`, icon: <Users size={24} /> },
        { label: 'Reports Today', value: `${reportCount || 0}`, icon: <MessageSquare size={24} /> },
        { label: 'Routes Verified', value: `${verifiedCount || 0}`, icon: <ShieldCheck size={24} /> },
        { label: 'Community Impact', value: `${(totalRoutes || 0) * 12}K`, icon: <Heart size={24} /> },
    ];

    const contributors = topUsers?.map((u, i) => ({
        name: u.full_name || 'Anonymous Contributor',
        points: u.points || 0,
        rank: i + 1
    })) || [];

    const getAvatarColor = (name: string) => {
        const colors = [
            '#4361EE', '#3A0CA3', '#7209B7', '#B5179E',
            '#F72585', '#4CC9F0', '#4895EF', '#480CA8'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <h1 className={styles.heroTitle}>Community Hub</h1>
                <p>
                    Join {userCount || 'thousands of'} commuters making Port Harcourt movement smarter and safer through
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
                        <div className={styles.statIcon}>{stat.icon}</div>
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
                        {contributors.length > 0 ? contributors.map((user, index) => {
                            const avatarColor = getAvatarColor(user.name);
                            return (
                                <div key={index} className={styles.leaderboardItem}>
                                    <div className={styles.userInfo}>
                                        <span className={styles.rank}>#{user.rank}</span>
                                        <div
                                            className={styles.avatar}
                                            style={{ backgroundColor: avatarColor, color: 'white', borderColor: 'transparent' }}
                                        >
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className={styles.userName}>{user.name}</span>
                                    </div>
                                    <span className={styles.userPoints}>{user.points} pts</span>
                                </div>
                            );
                        }) : (
                            <div className={styles.emptyState} style={{ padding: '20px' }}>
                                <p>No contributors yet. Be the first!</p>
                            </div>
                        )}
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
                            suggestions.map((route, idx) => (
                                <div key={route.id} className={styles.suggestionCard}>
                                    <div className={styles.suggestionHeader}>
                                        <div className={styles.routeInfo}>
                                            <strong>{route.origin} → {route.destination}</strong>
                                            {idx === 0 && <span className={styles.trendingTag}>Trending</span>}
                                        </div>
                                        <span className={styles.suggestionBadge}>{route.vehicle_type}</span>
                                    </div>
                                    <p className={styles.proTips}>{route.pro_tips ? `"${route.pro_tips}"` : 'Direct route through major stops.'}</p>
                                    <div className={styles.suggestionFooter}>
                                        <span>By {route.created_by_admin ? 'DAL Team' : ((route.profiles as any)?.full_name || 'Anonymous')}</span>
                                        <span className={styles.priceTag}>₦{route.price_estimated || route.fare_min}</span>
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
