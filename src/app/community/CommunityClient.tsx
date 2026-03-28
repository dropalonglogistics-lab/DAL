'use client';

import { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ChevronDown, ChevronUp, MapPin, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import Link from 'next/link';

type Competition = {
    id: string;
    title: string;
    prize: string;
    rules?: string;
    status: string;
    start_date: string;
    end_date: string;
    winners?: Array<{ name: string; points: number; rank: number }>;
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
    verifiedCount: number;
    myRank: number;
    myPoints: number;
    top25Threshold: number;
    pastCompetitions: Competition[];
}

// ── Countdown component ──
function Countdown({ endDate }: { endDate: string }) {
    const [remaining, setRemaining] = useState({ days: 0, hours: 0, mins: 0 });

    useEffect(() => {
        const calc = () => {
            const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
            setRemaining({
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                mins: Math.floor((diff % 3600000) / 60000),
            });
        };
        calc();
        const t = setInterval(calc, 60000);
        return () => clearInterval(t);
    }, [endDate]);

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {([['days', remaining.days], ['hrs', remaining.hours], ['min', remaining.mins]] as [string, number][]).map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '6px 12px', minWidth: '52px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#C9A227', lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                </div>
            ))}
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>remaining</span>
        </div>
    );
}

const ROW_STYLES: Record<number, React.CSSProperties> = {
    1: { background: 'rgba(201,162,39,0.18)', borderColor: 'rgba(201,162,39,0.5)' },
    2: { background: 'rgba(232,232,232,0.08)', borderColor: 'rgba(232,232,232,0.25)' },
    3: { background: 'rgba(232,201,154,0.1)', borderColor: 'rgba(232,201,154,0.3)' },
};

const RANK_BADGES: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function CommunityClient({
    competition, competitionState, leaderboard, totalParticipants,
    myRank, myPoints, top25Threshold, pastCompetitions,
}: Props) {
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState(leaderboard);
    const [prevRows, setPrevRows] = useState<LeaderboardRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [howToOpen, setHowToOpen] = useState(false);
    const [pastOpen, setPastOpen] = useState(false);

    const ptsToTop25 = Math.max(0, top25Threshold - myPoints);

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/community/leaderboard?page=${page}`);
            const data = await res.json();
            setPrevRows(rows);
            setRows(data.leaderboard || []);
            setLastUpdated(new Date());
        } finally {
            setLoading(false);
        }
    };

    const loadPage = async (p: number) => {
        setLoading(true);
        setPage(p);
        try {
            const res = await fetch(`/api/community/leaderboard?page=${p}`);
            const data = await res.json();
            setPrevRows(rows);
            setRows(data.leaderboard || []);
        } finally {
            setLoading(false);
        }
    };

    const getRankChange = (row: LeaderboardRow) => {
        const prev = prevRows.find(r => r.id === row.id);
        if (!prev) return 'unchanged';
        if (prev.rank > row.rank) return 'up';
        if (prev.rank < row.rank) return 'down';
        return 'unchanged';
    };

    const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    const minsAgo = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 900, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                    Growth via Intelligence
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Real humans. Real data. Real impact in Port Harcourt.
                </p>
                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px' }}>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{verifiedCount.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verified Routes</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{totalParticipants.toLocaleString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Members</div>
                    </div>
                </div>
            </div>

            {/* ── SECTION 1: Competition Banner ── */}
            {competitionState === 'active' && competition ? (
                <section style={{ background: 'linear-gradient(135deg, #0a0900 0%, #1a1200 100%)', border: '1.5px solid rgba(201,162,39,0.5)', borderRadius: '20px', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(201,162,39,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                            <Trophy size={32} style={{ color: '#C9A227', flexShrink: 0 }} />
                            <div>
                                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 900, fontFamily: "'Syne', sans-serif", color: '#fff', margin: 0 }}>{competition.title}</h2>
                                <p style={{ color: '#C9A227', fontWeight: 700, margin: '4px 0 0' }}>{competition.prize}</p>
                            </div>
                        </div>
                        {competition.rules && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: '0 0 12px', lineHeight: 1.6 }}>{competition.rules}</p>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{fmtDate(competition.start_date)} – {fmtDate(competition.end_date)}</span>
                        </div>
                        <Countdown endDate={competition.end_date} />
                        <button onClick={() => setHowToOpen(o => !o)} style={{ marginTop: '14px', background: 'none', border: '1px solid rgba(201,162,39,0.4)', color: '#C9A227', padding: '7px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                            How to earn points {howToOpen ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />}
                        </button>
                    </div>
                </section>
            ) : (
                <section style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px 28px', textAlign: 'center' }}>
                    <Trophy size={32} style={{ color: 'var(--text-secondary)', opacity: 0.4, marginBottom: '10px' }} />
                    <h2 style={{ fontWeight: 700, margin: '0 0 6px' }}>Next competition coming soon</h2>
                    {competition && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Last: <strong>{competition.title}</strong> — {competition.prize} · {fmtDate(competition.start_date)} to {fmtDate(competition.end_date)}
                        </p>
                    )}
                    {competition?.winners && (competition.winners as any[]).length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                            {(competition.winners as any[]).map((w: any, i: number) => (
                                <div key={i} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center' }}>
                                    <div>{RANK_BADGES[w.rank] || '#' + w.rank}</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{w.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{w.points} pts</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ── SECTION 2: Leaderboard ── */}
            <section style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} style={{ color: 'var(--color-gold)' }} />
                        {competitionState === 'active' && competition ? `${competition.title} — Live Standings` : 'All-Time Leaderboard'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Last updated: {minsAgo === 0 ? 'just now' : `${minsAgo} min${minsAgo !== 1 ? 's' : ''} ago`}
                        </span>
                        <button onClick={refresh} disabled={loading} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--background)' }}>
                                {['Rank', 'Player', 'Points', 'Location', 'Change'].map(col => (
                                    <th key={col} style={{ padding: '10px 16px', textAlign: col === 'Points' ? 'right' : 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => {
                                const change = getRankChange(row);
                                return (
                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', ...ROW_STYLES[row.rank] }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '1rem', width: '56px' }}>
                                            {RANK_BADGES[row.rank] ? <span>{RANK_BADGES[row.rank]}</span> : <span style={{ color: 'var(--text-secondary)' }}>#{row.rank}</span>}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.name}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--color-gold)' }}>{row.points.toLocaleString()}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MapPin size={12} /> {row.location}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {change === 'up' && <TrendingUp size={16} style={{ color: '#22c55e' }} />}
                                            {change === 'down' && <TrendingDown size={16} style={{ color: '#ef4444' }} />}
                                            {change === 'unchanged' && <Minus size={16} style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderTop: '1px solid var(--border)' }}>
                    {[1, 2, 3].map(p => (
                        <button key={p} onClick={() => loadPage(p)} style={{ width: '34px', height: '34px', borderRadius: '8px', border: `1.5px solid ${page === p ? 'var(--color-gold)' : 'var(--border)'}`, background: page === p ? 'rgba(201,162,39,0.1)' : 'transparent', color: page === p ? 'var(--color-gold)' : 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                            {p}
                        </button>
                    ))}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{totalParticipants.toLocaleString()} total participants</span>
                </div>
            </section>

            {/* ── SECTION 3: My Rank Card ── */}
            <section style={{ background: 'linear-gradient(135deg, rgba(201,162,39,0.06) 0%, var(--card-bg) 100%)', border: '1.5px solid rgba(201,162,39,0.4)', borderRadius: '18px', padding: '22px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={20} style={{ color: 'var(--color-gold)' }} /> Your Standing
                    </h3>
                    <Link href="/dashboard/points" style={{ fontSize: '0.82rem', color: 'var(--color-gold)', fontWeight: 700, textDecoration: 'none' }}>See my full stats →</Link>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px' }}>
                    Your current rank: <span style={{ color: 'var(--color-gold)' }}>#{myRank}</span> out of {totalParticipants.toLocaleString()} participants
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 14px' }}>
                    {myPoints.toLocaleString()} points this period
                </p>
                {/* Progress bar */}
                {myRank > 25 ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Progress to Top 25</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 700 }}>{ptsToTop25} pts needed</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--background)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #C9A227, #E8C84A)', borderRadius: '10px', width: `${Math.min(100, (myPoints / (myPoints + ptsToTop25)) * 100)}%`, transition: 'width 0.5s ease' }} />
                        </div>
                    </div>
                ) : (
                    <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎉</span>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem' }}>You&apos;re in the Top 25! Keep earning!</span>
                    </div>
                )}
            </section>

            {/* ── SECTION 4: How to Earn ── */}
            <section style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
                <button onClick={() => setHowToOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem' }}>
                    <span>💡 How to Earn Points</span>
                    {howToOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {howToOpen && (
                    <div style={{ padding: '0 22px 22px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>Activity</th>
                                    <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Suggest a route (verified)', '+50 pts'],
                                    ['Submit a road alert (community-verified)', '+30 pts'],
                                    ['Confirm an alert (your upvote counts)', '+20 pts'],
                                    ['Complete a delivery order (F2 — when live)', '+10 pts'],
                                    ['Complete an errand (F3 — when live)', '+10 pts'],
                                    ['Refer a new user (first order)', '+100 pts'],
                                    ['Write a verified business review', '+15 pts'],
                                ].map(([activity, pts]) => (
                                    <tr key={activity} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '11px 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>{activity}</td>
                                        <td style={{ padding: '11px 0', textAlign: 'right', fontWeight: 800, color: 'var(--color-gold)', whiteSpace: 'nowrap' }}>{pts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link href="/suggest-route" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(201,162,39,0.1)', color: '#C9A227',
                                padding: '10px 20px', borderRadius: '12px', fontWeight: 700,
                                textDecoration: 'none', border: '1px solid rgba(201,162,39,0.3)',
                                fontSize: '0.9rem', transition: 'all 0.2s'
                            }}>
                                <MapPin size={16} /> Suggest a new route
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            {/* ── SECTION 5: Past Winners ── */}
            {pastCompetitions.length > 0 && (
                <section style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
                    <button onClick={() => setPastOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem' }}>
                        <span>🏆 Past Winners</span>
                        {pastOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {pastOpen && (
                        <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pastCompetitions.map(comp => (
                                <div key={comp.id} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
                                    <h4 style={{ margin: '0 0 4px', fontWeight: 800 }}>{comp.title}</h4>
                                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--color-gold)' }}>{comp.prize}</p>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{fmtDate(comp.start_date)} – {fmtDate(comp.end_date)}</span>
                                    {comp.winners && (comp.winners as any[]).length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                            {(comp.winners as any[]).map((w: any, i: number) => (
                                                <div key={i} style={{ background: 'var(--card-bg)', borderRadius: '10px', padding: '8px 12px', textAlign: 'center' }}>
                                                    <div>{RANK_BADGES[w.rank] || '#' + w.rank}</div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{w.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
