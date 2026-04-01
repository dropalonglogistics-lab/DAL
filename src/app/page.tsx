'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    MapPin, AlertTriangle, Users, 
    ArrowRight, Box, ShoppingCart, 
    Check, Zap, MessageCircle, Star 
} from 'lucide-react';
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
                setLeaderboard(lbData.leaderboard?.slice(0, 3) || []);

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
            {/* SECTION 1 — HERO + SEARCH */}
            <section className={styles.heroSection}>
                <div className={styles.heroVisual}>
                    <CityGrid />
                </div>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>PORT HARCOURT&apos;S INTELLIGENCE LAYER</span>
                    <h1 className={styles.h1}>Move Smarter in<br />Port Harcourt.</h1>
                    <p className={styles.subText}>
                        Intelligent road transit routing. Community-powered intelligence.
                        Fare estimates, live alerts, and real-time navigation — all free.
                    </p>
                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <MapPin size={16} color="var(--color-gold)" /> 
                            <strong>{loading ? '...' : stats.verifiedCount.toLocaleString()}</strong> routes
                        </div>
                        <div className={styles.statItem}>
                            <AlertTriangle size={16} color="#F87171" /> 
                            <strong>{loading ? '...' : stats.alertCount.toLocaleString()}</strong> alerts today
                        </div>
                        <div className={styles.statItem}>
                            <Users size={16} color="#60A5FA" /> 
                            <strong>{loading ? '...' : stats.memberCount.toLocaleString()}</strong> members
                        </div>
                    </div>
                </div>

                {/* Search Card — right side of hero */}
                <div className={styles.heroSearchCard}>
                    <h3 className={styles.heroSearchTitle}>Where to?</h3>
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
                    <p className={styles.heroSearchVehicles}>
                        🛺 Keke &nbsp; 🚐 Keke Bus &nbsp; 🚌 Bus &nbsp; 🚕 Taxi &nbsp; 🏍️ Bike
                    </p>
                </div>
            </section>

            {/* SECTION 3 — THREE FEATURES */}
            <section className={styles.featureSection}>
                <div className={styles.featureGrid}>
                    <Link href="/search" className={`${styles.featureCard} ${styles.blackCard}`}>
                        <div className={styles.featureIcon}><MapPin size={32} color="var(--color-gold)" /></div>
                        <div>
                            <h3 className={styles.featureTitle}>F1 ROUTING</h3>
                            <p style={{ fontSize: '15px', marginTop: '12px', opacity: 0.8, lineHeight: '1.5' }}>Intelligent routing for PH commuters. Fare estimates and transit mapping.</p>
                        </div>
                        <div className={styles.featureCTA}>Explore Routes <ArrowRight size={16} /></div>
                    </Link>

                    {config.f2_express_live ? (
                        <Link href="/express" className={`${styles.featureCard} ${styles.goldCard}`}>
                            <div className={styles.featureIcon}><Box size={32} /></div>
                            <div>
                                <h3 className={styles.featureTitle}>F2 EXPRESS</h3>
                                <p style={{ fontSize: '15px', marginTop: '12px', fontWeight: '500' }}>Same-hour delivery within Port Harcourt. Reliable and tracked.</p>
                            </div>
                            <div className={styles.featureCTA}>Order a Delivery <ArrowRight size={16} /></div>
                        </Link>
                    ) : (
                        <div className={`${styles.featureCard} ${styles.goldCard}`} style={{ opacity: 0.9 }}>
                            <div className={styles.featureIcon}><Box size={32} /></div>
                            <div>
                                <h3 className={styles.featureTitle}>F2 EXPRESS</h3>
                                <p style={{ fontSize: '15px', marginTop: '12px' }}>Same-hour delivery. Launching across the city soon.</p>
                                <span style={{ background: 'var(--foreground)', color: 'var(--background)', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '12px' }}>COMING SOON</span>
                            </div>
                            <div className={styles.featureCTA}>Notify Me <ArrowRight size={16} /></div>
                        </div>
                    )}

                    {config.f3_shopper_live ? (
                        <Link href="/shopper" className={`${styles.featureCard} ${styles.blackCard}`}>
                            <div className={styles.featureIcon}><ShoppingCart size={32} color="var(--color-gold)" /></div>
                            <div>
                                <h3 className={styles.featureTitle}>F3 SHOPPER</h3>
                                <p style={{ fontSize: '15px', marginTop: '12px', opacity: 0.8 }}>Personal shopping and market errands. Handled by professionals.</p>
                            </div>
                            <div className={styles.featureCTA}>Book a Shopper <ArrowRight size={16} /></div>
                        </Link>
                    ) : (
                        <div className={`${styles.featureCard} ${styles.blackCard}`} style={{ opacity: 0.6 }}>
                            <div className={styles.featureIcon}><ShoppingCart size={32} color="var(--color-gold)" /></div>
                            <div>
                                <h3 className={styles.featureTitle}>F3 SHOPPER</h3>
                                <p style={{ fontSize: '15px', marginTop: '12px' }}>Personal shopping. Launching soon.</p>
                                <span style={{ background: 'var(--color-gold)', color: '#000', fontSize: '10px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-block', marginTop: '12px' }}>COMING SOON</span>
                            </div>
                            <div className={styles.featureCTA}>Notify Me <ArrowRight size={16} /></div>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 4 — FOR BUSINESSES */}
            <section className={styles.splitSection}>
                <div className={styles.splitGrid}>
                    <div>
                        <h2 className={styles.sectionTitle}>Your Digital Storefront.<br />PH-Wide Reach.</h2>
                        <p className={styles.subText} style={{ marginBottom: '32px' }}>List your business on DAL and access our fleet for deliveries, logistics, and visibility.</p>
                        <Link href="/list-your-business" className={styles.ctaGold} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            List Your Business Free <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gold)' }}>500+</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Vendors</span>
                        </div>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gold)' }}>12k+</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Orders</span>
                        </div>
                        <div className={styles.statItem} style={{ flexDirection: 'column', textAlign: 'center' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-gold)' }}>100%</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coverage</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — PREMIUM PITCH */}
            <section className={styles.premiumSection}>
                <span className={styles.premiumPill}>Everything Better with DAL Premium</span>
                <h2 className={styles.h1} style={{ fontSize: '48px' }}>₦700/month</h2>
                
                <div style={{ maxWidth: '900px', margin: '60px auto', background: 'var(--card-bg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '24px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Feature</th>
                                <th style={{ padding: '24px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Free</th>
                                <th style={{ padding: '24px', color: 'var(--color-gold)', fontWeight: '800', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.1em' }}>Premium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Route Search', free: '✓', premium: 'Priority' },
                                { name: 'Road Intelligence', free: '3/day', premium: 'Unlimited' },
                                { name: 'WhatsApp Bot', free: '-', premium: 'Full Access' },
                                { name: 'Earning Multiplier', free: '1x', premium: '1.5x' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: i === 3 ? 'none' : '1px solid var(--border)' }}>
                                    <td style={{ padding: '24px', fontWeight: '600' }}>{row.name}</td>
                                    <td style={{ padding: '24px', color: 'var(--text-secondary)' }}>{row.free}</td>
                                    <td style={{ padding: '24px', color: 'var(--color-gold)', fontWeight: '700' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Check size={16} /> {row.premium}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Link href="/premium" className={styles.ctaGold} style={{ display: 'block', marginTop: '40px', textAlign: 'center', fontSize: '18px' }}>Get Premium Access Now</Link>
                </div>
            </section>

            {/* SECTION 6 — SOCIAL PROOF */}
            <section className={styles.socialProofSection}>
                <div className={styles.sectionHeader} style={{ textAlign: 'center' }}>
                    <h2 className={styles.sectionTitle}>Built by Port Harcourt, for Port Harcourt</h2>
                </div>
                <div className={styles.testimonialGrid}>
                    <div className={styles.testimonialCard}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: 'var(--color-gold)' }}>
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.7' }}>&quot;DAL has completely changed how I navigate traffic. The alerts are always spot on.&quot;</p>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Adaobi O.</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Routine Commuter</span>
                        </div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: 'var(--color-gold)' }}>
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.7' }}>&quot;Best delivery platform in Rivers State. We use it for our restaurant daily.&quot;</p>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Chidi K.</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Business Owner</span>
                        </div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: 'var(--color-gold)' }}>
                            {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.7' }}>&quot;I earn extra points just by reporting road blocks. Love the community feel.&quot;</p>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Emeka J.</strong>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>DAL Contributor</span>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '60px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-lg)' }}>
                    <div>
                        <h3 className={styles.sectionTitle} style={{ fontSize: '28px', color: 'inherit' }}>Community Leaderboard</h3>
                        <div style={{ display: 'flex', gap: '40px', marginTop: '32px' }}>
                            {leaderboard.map((user, i) => (
                                <div key={user.id || i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifySelf: 'center', fontWeight: '900', color: '#000', justifyContent: 'center', fontSize: '20px' }}>
                                        {user.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '800', fontSize: '16px' }}>#{user.rank || i+1} {user.name}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-gold)', fontWeight: '700' }}>{user.points.toLocaleString()} pts</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link href="/community" className={styles.ctaGhost} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                        See Full Leaderboard <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* SECTION 7 — WHATSAPP STRIP */}
            <section className={styles.whatsappStrip}>
                <div>
                    <h3 className={styles.sectionTitle} style={{ fontSize: '24px', marginBottom: '8px' }}>DAL is also on WhatsApp</h3>
                    <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Access everything in one chat. <span style={{ color: 'var(--color-gold)', fontWeight: '700' }}>Full access — Premium feature.</span></p>
                </div>
                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                    <MessageCircle size={24} fill="currentColor" /> Chat Now
                </a>
            </section>
        </div>
    );
}
