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
            </div>

            {/* COMPETITION BANNER */}
            {competitionState === 'active' && competition && (
                <section className={styles.competitionCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Trophy size={24} color="#C9A227" />
                        <h2 className={styles.cardTitle}>{competition.title.replace(/March Madness Routes?/i, 'Easter Egg Route challenge')}</h2>
                    </div>
                    <p className={styles.prize}>{competition.prize.replace(/\+ \d+ months DAL Premium/i, '').replace(/\+\s*$/,'').trim()}</p>
                    <p className={styles.rules}>{competition.rules}</p>
                    
                    <div className={styles.howToEarn}>
                        <button className={styles.ghostBtn} onClick={() => setHowToOpen(!howToOpen)}>
                            {howToOpen ? 'Hide' : 'How to earn points'}
                        </button>
                        {howToOpen && (
                            <div className={styles.earnList}>
                                <div className={styles.earnItem}>
                                    <span>Suggest a route (verified)</span>
                                    <span className={styles.earnPoints}>+50 pts</span>
                                </div>
                                <div className={styles.earnItem}>
                                    <span>Report a road alert</span>
                                    <span className={styles.earnPoints}>+20 pts</span>
                                </div>
                                <div className={styles.earnItem}>
                                    <span>Successful order (F2)</span>
                                    <span className={styles.earnPoints}>+10 pts</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* LEADERBOARD */}
            <section className={styles.section}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div className={styles.rankBadge} style={{ background: 'var(--color-gold)', color: '#000' }}>
                        <TrendingUp size={14} />
                    </div>
                    <h2 className={styles.sectionTitle}>Elite Contributors</h2>
                </div>

                <div className={styles.leaderboardCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th align="left">Rank</th>
                                <th align="left">Contributor</th>
                                <th align="right">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((row) => {
                                const isTop3 = row.rank <= 3;
                                const topClass = isTop3 ? styles[`top${row.rank}`] : '';
                                
                                return (
                                    <tr key={row.id} className={`${topClass} ${row.id === 'me' ? styles.myRow : ''}`}>
                                        <td>
                                            <span className={styles.rankBadge}>#{row.rank}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{row.name}</div>
                                            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{row.location}</div>
                                        </td>
                                        <td align="right">
                                            <span className={styles.pointsValue}>{row.points.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                );
                            })}
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
