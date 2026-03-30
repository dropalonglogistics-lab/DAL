'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import CityGrid from '@/components/Visuals/CityGrid';
import styles from './page.module.css';

export default function HomePage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [stats, setStats] = useState({ verifiedCount: 0, alertCount: 0, memberCount: 0 });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [config, setConfig] = useState({ f2_express_live: false, f3_shopper_live: false });
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // 1. Fetch Stats on 60s interval
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/community/stats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error('Stats fetch failed', e);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Config & Alerts & Leaderboard
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Config
                const configRes = await fetch('/api/config');
                const configData = await configRes.json();
                setConfig(configData);

                // Alerts (Top 3 active)
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const { data: alertsData } = await supabase
                    .from('alerts')
                    .select('*')
                    .eq('status', 'active')
                    .gt('created_at', yesterday)
                    .order('created_at', { ascending: false })
                    .limit(3);
                setAlerts(alertsData || []);

                // Leaderboard (Top 3)
                const lbRes = await fetch('/api/community/leaderboard');
                const lbData = await lbRes.json();
                setLeaderboard(lbData.data?.slice(0, 3) || []);

            } catch (e) {
                console.error('Initial data fetch failed', e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

    const handleSearch = () => {
        if (!from && !to) return;
        router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className={styles.container}>
            {/* SECTION 1 — HERO */}
            <section className={styles.heroSection}>
                <div className={styles.heroVisual}>
                    <CityGrid />
                </div>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>PORT HARCOURT&apos;S INTELLIGENCE LAYER</span>
                    <h1 className={styles.h1}>Move Smarter.<br />Deliver Faster.<br />Stress Less.</h1>
                    <p className={styles.subText}>
                        Community-powered routing, same-hour delivery, and personal shopping —
                        all in one platform built for Port Harcourt.
                    </p>
                    <div className={styles.ctaRow}>
                        <Link href="/signup" className={styles.ctaGold}>Get Started Free</Link>
                        <Link href="/about" className={styles.ctaGhost}>See How It Works</Link>
                    </div>
                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>🗺️ <strong>{stats.verifiedCount.toLocaleString()}</strong> verified routes</div>
                        <div className={styles.statItem}>⚠️ <strong>{stats.alertCount.toLocaleString()}</strong> alerts today</div>
                        <div className={styles.statItem}>👥 <strong>{stats.memberCount.toLocaleString()}</strong> members</div>
                    </div>
                </div>
            </section>

            {/* SECTION 2 — LIVE ROAD INTELLIGENCE */}
            <section className={styles.darkSection}>
                <div className={styles.intelligenceGrid}>
                    <div>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>What&apos;s Happening Right Now</h2>
                            <p className={styles.sectionSub}>Community-reported, in real time</p>
                        </div>
                        <div className={styles.alertsList}>
                            {alerts.length > 0 ? alerts.map((alert) => (
                                <div key={alert.id} className={styles.alertCard}>
                                    <div className={styles.alertIcon}>{alert.type_icon || '⚠️'}</div>
                                    <div className={styles.alertBody}>
                                        <div className={styles.alertMeta}>
                                            <span className={styles.alertArea}>{alert.area}</span>
                                            <span className={styles.alertTime}>{timeAgo(alert.created_at)}</span>
                                        </div>
                                        <p className={styles.alertDesc}>{alert.description}</p>
                                        <div className={styles.alertFooter}>
                                            {alert.upvotes || 0} Upvotes
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className={styles.textMuted}>No active alerts. Roads are clear.</p>
                            )}
                            <Link href="/alerts" className={styles.seeAllLink}>See All Alerts →</Link>
                        </div>
                    </div>

                    <div className={styles.searchWidget}>
                        <h3 className={styles.featureTitle} style={{ marginBottom: '24px', fontSize: '18px' }}>Find Your Route</h3>
                        <div className={styles.inputGroup}>
                            <label>Starting point</label>
                            <input
                                className={styles.darkInput}
                                placeholder="e.g. Mile 1 Market"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Destination</label>
                            <input
                                className={styles.darkInput}
                                placeholder="e.g. Garrison Junction"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                        </div>
                        <button className={styles.findBtn} onClick={handleSearch}>Find Route</button>
                        <p style={{ fontSize: '10px', color: '#555', marginTop: '16px', textAlign: 'center' }}>
                            Keke, Taxi, Shuttle, Bus, Bike — Port Harcourt Coverage.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 3 — THREE FEATURES */}
            <section className={styles.featureSection}>
                <div className={styles.featureGrid}>
                    <Link href="/search" className={`${styles.featureCard} ${styles.blackCard}`}>
                        <div className={styles.featureIcon}>📍</div>
                        <div>
                            <h3 className={styles.featureTitle}>F1 ROUTING</h3>
                            <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Intelligent routing for PH commuters. Fare estimates and transit mapping.</p>
                        </div>
                        <div className={styles.featureCTA}>Explore Routes →</div>
                    </Link>

                    {config.f2_express_live ? (
                        <Link href="/express" className={`${styles.featureCard} ${styles.goldCard}`}>
                            <div className={styles.featureIcon}>📦</div>
                            <div>
                                <h3 className={styles.featureTitle}>F2 EXPRESS</h3>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>Same-hour delivery within Port Harcourt. Reliable and tracked.</p>
                            </div>
                            <div className={styles.featureCTA}>Order a Delivery →</div>
                        </Link>
                    ) : (
                        <div className={`${styles.featureCard} ${styles.goldCard}`} style={{ opacity: 0.9 }}>
                            <div className={styles.featureIcon}>📦</div>
                            <div>
                                <h3 className={styles.featureTitle}>F2 EXPRESS</h3>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>Same-hour delivery. Launching across the city soon.</p>
                                <span style={{ background: '#FFF', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>COMING SOON</span>
                            </div>
                            <div className={styles.featureCTA}>Notify Me →</div>
                        </div>
                    )}

                    {config.f3_shopper_live ? (
                        <Link href="/shopper" className={`${styles.featureCard} ${styles.blackCard}`}>
                            <div className={styles.featureIcon}>🛒</div>
                            <div>
                                <h3 className={styles.featureTitle}>F3 SHOPPER</h3>
                                <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>Personal shopping and market errands. Handled by professionals.</p>
                            </div>
                            <div className={styles.featureCTA}>Book a Shopper →</div>
                        </Link>
                    ) : (
                        <div className={`${styles.featureCard} ${styles.blackCard}`} style={{ opacity: 0.6 }}>
                            <div className={styles.featureIcon}>🛒</div>
                            <div>
                                <h3 className={styles.featureTitle}>F3 SHOPPER</h3>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>Personal shopping. Launching soon.</p>
                                <span style={{ background: '#C9A227', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>COMING SOON</span>
                            </div>
                            <div className={styles.featureCTA}>Notify Me →</div>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 4 — FOR BUSINESSES */}
            <section className={styles.splitSection}>
                <div className={styles.splitGrid}>
                    <div>
                        <h2 className={styles.sectionTitle}>Your Digital Storefront.<br />PH-Wide Reach.</h2>
                        <p className={styles.subText}>List your business on DAL and access our fleet for deliveries, logistics, and visibility.</p>
                        <Link href="/list-your-business" className={styles.ctaGold} style={{ display: 'inline-block' }}>List Your Business Free →</Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)' }}>500+</span>
                            <span style={{ fontSize: '11px', color: '#555' }}>Vendors</span>
                        </div>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)' }}>12k+</span>
                            <span style={{ fontSize: '11px', color: '#555' }}>Orders</span>
                        </div>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)' }}>100%</span>
                            <span style={{ fontSize: '11px', color: '#555' }}>Coverage</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — PREMIUM PITCH */}
            <section className={styles.premiumSection}>
                <span className={styles.premiumPill}>Everything Better with DAL Premium</span>
                <h2 className={styles.h1} style={{ fontSize: '48px' }}>₦700/month</h2>
                
                <div style={{ maxWidth: '800px', margin: '60px auto', background: '#111', padding: '40px', borderRadius: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <th style={{ padding: '20px', color: '#888' }}>Feature</th>
                                <th style={{ padding: '20px', color: '#888' }}>Free</th>
                                <th style={{ padding: '20px', color: 'var(--gold)' }}>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '20px' }}>Route Search</td>
                                <td style={{ padding: '20px' }}>✓</td>
                                <td style={{ padding: '20px', color: 'var(--gold)' }}>Priority</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '20px' }}>Road Intelligence</td>
                                <td style={{ padding: '20px' }}>3/day</td>
                                <td style={{ padding: '20px', color: 'var(--gold)' }}>Unlimited</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '20px' }}>WhatsApp Bot</td>
                                <td style={{ padding: '20px' }}>-</td>
                                <td style={{ padding: '20px', color: 'var(--gold)' }}>Full Access</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #222' }}>
                                <td style={{ padding: '20px' }}>Earning Multiplier</td>
                                <td style={{ padding: '20px' }}>1x</td>
                                <td style={{ padding: '20px', color: 'var(--gold)' }}>1.5x</td>
                            </tr>
                        </tbody>
                    </table>
                    <Link href="/premium" className={styles.ctaGold} style={{ display: 'block', marginTop: '40px', textAlign: 'center' }}>Upgrade Now</Link>
                </div>
            </section>

            {/* SECTION 6 — SOCIAL PROOF */}
            <section className={styles.socialProofSection}>
                <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
                    <h2 className={styles.sectionTitle}>Built by Port Harcourt, for Port Harcourt</h2>
                </div>
                <div className={styles.testimonialGrid}>
                    <div className={styles.testimonialCard}>
                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '16px' }}>&quot;DAL has completely changed how I navigate traffic. The alerts are always spot on.&quot;</p>
                        <strong>Adaobi O.</strong>
                        <div style={{ fontSize: '12px', color: '#888' }}>Routine Commuter</div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '16px' }}>&quot;Best delivery platform in Rivers State. We use it for our restaurant daily.&quot;</p>
                        <strong>Chidi K.</strong>
                        <div style={{ fontSize: '12px', color: '#888' }}>Business Owner</div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: '16px' }}>&quot;I earn extra points just by reporting road blocks. Love the community feel.&quot;</p>
                        <strong>Emeka J.</strong>
                        <div style={{ fontSize: '12px', color: '#888' }}>DAL Contributor</div>
                    </div>
                </div>

                <div style={{ background: '#000', color: '#FFF', padding: '60px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 className={styles.sectionTitle} style={{ fontSize: '24px' }}>Community Leaderboard</h3>
                        <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
                            {leaderboard.map((user, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifySelf: 'center', fontWeight: 'bold', color: '#000', justifyContent: 'center' }}>
                                        {user.display_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '700' }}>#{i+1} {user.display_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--gold)' }}>{user.points} pts</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link href="/community" className={styles.ctaGhost}>See Full Leaderboard →</Link>
                </div>
            </section>

            {/* SECTION 7 — WHATSAPP STRIP */}
            <section className={styles.whatsappStrip}>
                <div>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '18px', marginBottom: '8px' }}>DAL is also on WhatsApp</h3>
                    <p style={{ fontSize: '14px', color: '#888' }}>Access everything in one chat. <span style={{ color: 'var(--gold)' }}>Full access — Premium feature.</span></p>
                </div>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                    Chat Now
                </a>
            </section>
        </div>
    );
}
