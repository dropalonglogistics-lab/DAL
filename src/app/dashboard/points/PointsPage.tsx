'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, X, Gift, Check, ChevronRight } from 'lucide-react';
import styles from '../dashboard.module.css';

const TIERS = [
    { name: 'Community Member', min: 0, max: 499, color: '#6B7280', emoji: '🌱' },
    { name: 'Contributor', min: 500, max: 1499, color: '#3B82F6', emoji: '✨' },
    { name: 'Route Pioneer', min: 1500, max: 3999, color: '#10B981', emoji: '🗺️' },
    { name: 'Traffic Guardian', min: 4000, max: 9999, color: '#8B5CF6', emoji: '🛡️' },
    { name: 'DAL Champion', min: 10000, max: Infinity, color: '#C9A227', emoji: '🏆' },
];

const EARN_ACTIONS = [
    { action: 'Submit a route suggestion', points: '+25 pts' },
    { action: 'Report a road alert', points: '+15 pts' },
    { action: 'Verify an existing route', points: '+10 pts' },
    { action: 'Complete an order', points: '+5 pts' },
    { action: 'Daily login streak (7 days)', points: '+50 pts' },
    { action: 'Refer a friend', points: '+100 pts' },
];

const HISTORY = [
    { date: '2026-03-08', action: 'Route suggestion approved', earned: 25, type: 'earn', balance: 320 },
    { date: '2026-03-07', action: 'Road alert submitted', earned: 15, type: 'earn', balance: 295 },
    { date: '2026-03-06', action: 'Order completed', earned: 5, type: 'earn', balance: 280 },
    { date: '2026-03-05', action: 'Points redeemed', earned: -50, type: 'spend', balance: 275 },
    { date: '2026-03-04', action: 'Daily streak bonus', earned: 50, type: 'earn', balance: 325 },
];

const REDEEM_OPTIONS = [
    { id: 1, name: 'Free Route Search Pass', cost: 100, desc: 'Unlimited searches for 24 hours' },
    { id: 2, name: '10% Order Discount', cost: 200, desc: 'Applied to your next order' },
    { id: 3, name: 'Premium Trial (7 days)', cost: 500, desc: 'Unlock all Premium features' },
];

function useCountUp(target: number, duration = 1500) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    useEffect(() => {
        if (started.current) return;
        started.current = true;
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(Math.round(target * ease));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [target, duration]);
    return val;
}

export default function PointsPage() {
    const POINTS = 320; // replace with real profile.points_balance
    const count = useCountUp(POINTS);
    const [redeemItem, setRedeemItem] = useState<typeof REDEEM_OPTIONS[0] | null>(null);
    const [redeemed, setRedeemed] = useState(false);

    const tier = TIERS.find(t => POINTS >= t.min && POINTS <= t.max) || TIERS[0];
    const nextTier = TIERS[TIERS.indexOf(tier) + 1];
    const progress = nextTier
        ? ((POINTS - tier.min) / (nextTier.min - tier.min)) * 100
        : 100;

    const confirmRedeem = () => {
        setRedeemed(true);
        setTimeout(() => { setRedeemItem(null); setRedeemed(false); }, 1500);
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.sectionTitle} style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 24 }}>
                Points &amp; Rewards
            </h1>

            {/* Animated balance */}
            <div className={styles.card} style={{ marginBottom: 20 }}>
                <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
                        <Star size={28} fill="#C9A227" color="#C9A227" />
                        <span style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--brand-gold)', lineHeight: 1 }}>
                            {count.toLocaleString()}
                        </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>DAL Points balance</div>
                </div>

                {/* Tier card */}
                <div style={{ margin: '0 20px 20px', padding: '16px', background: `${tier.color}12`, border: `1.5px solid ${tier.color}30`, borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1.2rem' }}>{tier.emoji}</span>
                            <div>
                                <div style={{ fontWeight: 800, color: tier.color }}>{tier.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Current tier</div>
                            </div>
                        </div>
                        {nextTier && (
                            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>{(nextTier.min - POINTS).toLocaleString()}</strong> pts to
                                <div style={{ fontWeight: 700, color: nextTier.color }}>{nextTier.name} {nextTier.emoji}</div>
                            </div>
                        )}
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, ${tier.color}99)` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        <span>{tier.min.toLocaleString()}</span>
                        {nextTier && <span>{nextTier.min.toLocaleString()}</span>}
                    </div>
                </div>

                {/* All tiers */}
                <div style={{ padding: '0 20px 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {TIERS.map(t => (
                        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: t.name === tier.name ? `${t.color}15` : 'transparent', border: `1px solid ${t.name === tier.name ? t.color + '40' : 'var(--border)'}` }}>
                            <span style={{ fontSize: '0.8rem' }}>{t.emoji}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: t.name === tier.name ? 700 : 500, color: t.name === tier.name ? t.color : 'var(--text-secondary)' }}>{t.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Points History */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Points History</h2>
            </div>
            <div className={styles.card} style={{ marginBottom: 24 }}>
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Date</th><th>Action</th><th>Points</th><th>Balance</th></tr>
                        </thead>
                        <tbody>
                            {HISTORY.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{h.date}</td>
                                    <td>{h.action}</td>
                                    <td style={{ fontWeight: 700, color: h.type === 'earn' ? '#10B981' : '#EF4444' }}>
                                        {h.earned > 0 ? '+' : ''}{h.earned}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{h.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* How to earn */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>How to Earn Points</h2>
            </div>
            <div className={styles.card} style={{ marginBottom: 24 }}>
                {EARN_ACTIONS.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < EARN_ACTIONS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ChevronRight size={14} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.875rem' }}>{e.action}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{e.points}</span>
                    </div>
                ))}
            </div>

            {/* Redeem */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Redeem Points</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14, marginBottom: 28 }}>
                {REDEEM_OPTIONS.map(opt => (
                    <div key={opt.id} className={styles.card} style={{ marginBottom: 0 }}>
                        <div style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <Gift size={18} style={{ color: 'var(--brand-gold)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.name}</span>
                            </div>
                            <p style={{ margin: '0 0 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{opt.desc}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 800, color: 'var(--brand-gold)' }}>{opt.cost} pts</span>
                                <button
                                    className={styles.btnGold}
                                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    disabled={POINTS < opt.cost}
                                    onClick={() => setRedeemItem(opt)}
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Redeem confirmation modal */}
            {redeemItem && (
                <div className={styles.modalOverlay} onClick={() => !redeemed && setRedeemItem(null)}>
                    <div className={styles.modal} style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Confirm Redemption</h2>
                            {!redeemed && <button className={styles.modalCloseBtn} onClick={() => setRedeemItem(null)}><X size={16} /></button>}
                        </div>
                        <div className={styles.modalBody}>
                            {redeemed ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#10B981' }}>
                                        <Check size={24} />
                                    </div>
                                    <p style={{ fontWeight: 700, margin: 0 }}>Redeemed successfully!</p>
                                </div>
                            ) : (
                                <>
                                    <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                        Redeem <strong>{redeemItem.name}</strong> for <strong style={{ color: 'var(--brand-gold)' }}>{redeemItem.cost} points</strong>?
                                        Your balance will be updated immediately.
                                    </p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className={styles.btnGold} onClick={confirmRedeem}>Confirm</button>
                                        <button className={styles.btnOutline} onClick={() => setRedeemItem(null)}>Cancel</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
