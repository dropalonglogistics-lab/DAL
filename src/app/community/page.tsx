import { Users, Trophy, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function CommunityPage() {
    // Mock data for community stats and leaderboard
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
                    Join thousands of commuters making city movement smarter and safer through
                    real-time reporting and cooperative route verification.
                </p>
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

            {/* CTA Section */}
            <section className={styles.cta}>
                <h2>Your Voice Matters</h2>
                <p>
                    See something on your route? Report it to help others avoid delays.
                    Verified contributors earn points towards Premium features.
                </p>
                <Link href="/alerts" className={styles.ctaButton}>
                    Share an Update
                </Link>
            </section>
        </div>
    );
}
