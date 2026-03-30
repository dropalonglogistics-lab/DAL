'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, Award, MapPin } from 'lucide-react';
import Link from 'next/link';
import styles from './Community.module.css';

type Competition = {
    id: string;
    title: string;
    prize: string;
    rules?: string;
    status: string;
    start_date: string;
    end_date: string;
};

type LeaderboardRow = {
    rank: number;
    id: string;
    name: string;
    points: number;
    location: string;
};

interface Props {
    competition: Competition | null;
    competitionState: 'active' | 'ended' | 'none';
    leaderboard: LeaderboardRow[];
    totalParticipants: number;
    reportsToday: number;
    verifiedCount: number;
    myRank: number;
    myPoints: number;
    top25Threshold: number;
    pastCompetitions: Competition[];
}

export default function CommunityClient({
    competition, competitionState, leaderboard, totalParticipants, reportsToday, verifiedCount,
    myRank, myPoints, top25Threshold, pastCompetitions,
}: Props) {
    const [howToOpen, setHowToOpen] = useState(false);

    const ptsToTop25 = Math.max(0, top25Threshold - myPoints);

    return (
        <div className={styles.container}>
            {/* HER0 - HEADLINE & STATS */}
            <div className={styles.hero}>
                <h1 className={styles.headline}>Growth via Intelligence</h1>
                <p className={styles.subheadline}>Real humans. Real data. Real impact in Port Harcourt.</p>
                
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{totalParticipants.toLocaleString()}</div>
                        <div className={styles.statLabel}>Active Members</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{reportsToday}</div>
                        <div className={styles.statLabel}>Reports Today</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{verifiedCount}</div>
                        <div className={styles.statLabel}>Routes Verified</div>
                    </div>
                </div>
            </div>

            {/* COMPETITION BANNER */}
            {competitionState === 'active' && competition && (
                <section className={styles.competitionCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Trophy size={24} color="#C9A227" />
                        <h2 className={styles.cardTitle}>{competition.title}</h2>
                    </div>
                    <p className={styles.prize}>{competition.prize}</p>
                    <p className={styles.rules}>{competition.rules}</p>
                    
                    <div className={styles.howToEarn}>
                        <button className={styles.ghostBtn} onClick={() => setHowToOpen(!howToOpen)}>
                            {howToOpen ? 'Hide' : 'How to earn points'}
                        </button>
                        {howToOpen && (
                            <div className={styles.earnList}>
                                <div>• Suggest a route (approved) → +10 pts</div>
                                <div>• Report a road alert → +5 pts</div>
                                <div>• Successful order (F2) → +20 pts</div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* LEADERBOARD */}
            <section className={styles.section}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <TrendingUp size={18} color="#C9A227" />
                    <h2 className={styles.sectionTitle}>Top Contributors</h2>
                </div>

                <div className={styles.leaderboardCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th align="left">Rank</th>
                                <th align="left">Player</th>
                                <th align="right">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((row) => (
                                <tr key={row.id} className={row.id === 'me' ? styles.myRow : ''}>
                                    <td>#{row.rank}</td>
                                    <td>{row.name}</td>
                                    <td align="right">{row.points.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* USER STANDING */}
            <section className={styles.section}>
                <div className={styles.standingCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 className={styles.standingTitle}>Your Standing</h3>
                            <p className={styles.standingValue}>Rank #{myRank} · {myPoints} pts</p>
                        </div>
                        <Award size={20} color="#C9A227" />
                    </div>
                    
                    {myRank > 25 && (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '4px' }}>
                                <span>Progress to Top 25</span>
                                <span>{ptsToTop25} pts needed</span>
                            </div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${Math.min(100, (myPoints / top25Threshold) * 100)}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
