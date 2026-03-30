'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import CityGrid from '@/components/Visuals/CityGrid';
import styles from './page.module.css';

export default function HomePage() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [routeCount, setRouteCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // Intersection Observer for reveal animations
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.revealActive);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll(`.${styles.reveal}`);
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading, alerts]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const { data: alertsData } = await supabase
                    .from('alerts')
                    .select('*')
                    .eq('status', 'active')
                    .gt('created_at', yesterday)
                    .order('created_at', { ascending: false });
                setAlerts(alertsData || []);

                const { count } = await supabase
                    .from('routes')
                    .select('*', { count: 'exact', head: true });
                setRouteCount(count);
            } catch (error) {
                console.error('Error fetching data:', error);
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

    const handleSwap = () => {
        const temp = from;
        setFrom(to);
        setTo(temp);
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
            <CityGrid />

            {/* SECTION 1 — HERO */}
            <section className={`${styles.hero} ${styles.reveal}`}>
                <div className={styles.heroSpotlight} />
                <span className={styles.heroTag}>PORT HARCOURT&apos;S INTELLIGENCE LAYER</span>
                <h1 className={styles.headline}>
                    Nigeria&apos;s informal economy<br />
                    moves on <span className={styles.goldText}>DAL.</span>
                </h1>
                <p className={styles.subheading}>
                    Route intelligence, on-demand delivery, and personal shopping — powered by the community that built it. Starting in Port Harcourt.
                </p>

                <div className={styles.searchContainer} style={{ animationDelay: '0.4s' }}>
                    <div className={styles.searchRow}>
                        <div className={`${styles.dotIcon} ${styles.dotGold}`} />
                        <input
                            className={styles.searchInput}
                            placeholder="Where from?"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                        <button className={styles.swapBtn} onClick={handleSwap}>⇅</button>
                    </div>
                    <div className={styles.connector} />
                    <div className={styles.searchRow}>
                        <div className={`${styles.dotIcon} ${styles.dotWhite}`} />
                        <input
                            className={styles.searchInput}
                            placeholder="Where to?"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>

                <button className={styles.findRouteBtn} onClick={handleSearch}>
                    Find Route
                </button>

                <div className={styles.secondaryRow}>
                    <Link href="/about" className={styles.secondaryBtn}>See How It Works</Link>
                    <Link href="/signup" className={styles.secondaryBtn}>Join the Community</Link>
                </div>
            </section>

            {/* SECTION 2 — FEATURES */}
            <section className={`${styles.section} ${styles.reveal}`}>
                <span className={styles.label}>WHAT DAL DOES</span>
                <div className={styles.featureGrid}>
                    <div className={`${styles.card} ${styles.cardGold}`} style={{ transitionDelay: '0.1s' }}>
                        <div className={styles.iconBox} style={{ background: '#1E1A0A', color: '#C9A227' }}>F1</div>
                        <h3 className={styles.featureTitle}>Route Intelligence</h3>
                        <p className={styles.featureDesc}>Community-powered routing and live road alerts for keke, bus, bike, and walking.</p>
                        <span className={styles.statusPill} style={{ color: '#4CAF50', backgroundColor: '#0A1A0A', borderColor: 'rgba(76, 175, 80, 0.18)' }}>
                            <div className={styles.pulse} />
                            Live now
                        </span>
                    </div>

                    <div className={styles.card} style={{ transitionDelay: '0.2s' }}>
                        <div className={styles.iconBox} style={{ background: '#0A160A', color: '#4CAF50' }}>F2</div>
                        <h3 className={styles.featureTitle}>Express Delivery</h3>
                        <p className={styles.featureDesc}>Same-hour delivery across Port Harcourt. DAL-employed riders. From ₦2,000.</p>
                        <span className={styles.statusPill} style={{ color: '#888', backgroundColor: '#1A1A0A', borderColor: 'rgba(51, 51, 48, 0.37)' }}>Launching soon</span>
                    </div>

                    <div className={styles.card} style={{ transitionDelay: '0.3s' }}>
                        <div className={styles.iconBox} style={{ background: '#0A0A1A', color: '#888' }}>F3</div>
                        <h3 className={styles.featureTitle}>Personal Shopper</h3>
                        <p className={styles.featureDesc}>Market runs, pharmacy, bill payments, queuing. DAL handles your errands.</p>
                        <span className={styles.statusPill} style={{ color: '#888', backgroundColor: '#1A1A0A', borderColor: 'rgba(51, 51, 48, 0.37)' }}>Launching soon</span>
                    </div>
                </div>
            </section>

            {/* SECTION 3 — LIVE ROAD ALERTS */}
            <section className={`${styles.section} ${styles.reveal}`}>
                <div className={styles.alertsHeader}>
                    <span className={styles.label}>LIVE ROAD INTELLIGENCE</span>
                    <Link href="/alerts" className={styles.allAlertsLink}>See all alerts →</Link>
                </div>

                {loading ? (
                    <div className={styles.featureGrid}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${styles.card} ${styles.skeleton}`} style={{ height: '80px' }} />
                        ))}
                    </div>
                ) : alerts.length > 0 ? (
                    <div className={styles.featureGrid}>
                        {alerts.map((alert, idx) => (
                            <div key={alert.id} className={styles.card} style={{ transitionDelay: `${idx * 0.1}s` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{alert.type_icon} {alert.area}</span>
                                    <span style={{ fontSize: '10px', color: '#555' }}>{timeAgo(alert.created_at)}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{alert.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`${styles.card} ${styles.emptyAlertsCard}`}>
                        <div className={styles.indicator} />
                        <h3 className={styles.emptyTitle}>Roads are clear across Port Harcourt</h3>
                        <p className={styles.emptySub}>No active alerts. Community is watching.</p>
                        <Link href="/alerts" className={styles.reportBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>Report a condition</Link>
                    </div>
                )}
            </section>

            {/* SECTION 4 — INTELLIGENCE DATA */}
            <section className={`${styles.section} ${styles.reveal}`}>
                <span className={styles.label}>THE DATA BEHIND THE PLATFORM</span>
                <div className={styles.dataGrid}>
                    <div className={styles.card}>
                        {loading ? (
                            <div className={styles.skeleton} style={{ height: '100px', borderRadius: '8px' }} />
                        ) : routeCount && routeCount > 0 ? (
                            <>
                                <div className={styles.statNumber}>{routeCount.toLocaleString()}</div>
                                <div className={styles.statLabel}>Routes in the database</div>
                                <div className={styles.statSub}>Rivers State coverage · Growing daily</div>
                            </>
                        ) : (
                            <div className={styles.emptyTitle}>Building the database — routes coming soon.</div>
                        )}
                    </div>
                    <div className={styles.card}>
                        <p className={styles.statementText}>Every delivery builds the moat.</p>
                        <div className={styles.statLabel}>DAL Grid · DAL Routes · DAL Intelligence</div>
                        <div className={styles.statSub}>The infrastructure layer — coming Era 2</div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — PREMIUM */}
            <section className={`${styles.section} ${styles.reveal}`}>
                <span className={styles.label}>DAL PREMIUM</span>
                <div className={`${styles.card} ${styles.premiumCard}`}>
                    <div className={styles.premiumHeader}>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px' }}>Everything better with Premium</h3>
                            <span className={styles.statLabel} style={{ fontSize: '11px' }}>Unlock the full intelligence layer</span>
                        </div>
                        <span className={styles.premiumPrice}>₦700 / month</span>
                    </div>

                    {[
                        { label: 'Real-time route alerts', value: '✓ Premium', gold: true },
                        { label: 'WhatsApp bot access', value: '✓ Premium', gold: true },
                        { label: 'Priority F2 + F3 queue', value: '✓ Premium', gold: true },
                        { label: 'Fare diagnostics + analytics', value: '✓ Premium', gold: true },
                        { label: '1.5× community points', value: '✓ Premium', gold: true },
                        { label: 'Basic route search', value: 'Free', gold: false },
                    ].map((row, i) => (
                        <div key={i} className={styles.featureRow}>
                            <span style={{ fontSize: '12px' }}>{row.label}</span>
                            <span className={row.gold ? styles.featureValueGold : styles.featureValueMuted}>{row.value}</span>
                        </div>
                    ))}

                    <Link href="/premium" className={styles.premiumCTA}>Get DAL Premium — ₦700/month</Link>
                </div>
            </section>

            {/* SECTION 6 — WHATSAPP */}
            <section className={`${styles.section} ${styles.reveal}`} style={{ paddingBottom: '100px' }}>
                <div className={`${styles.card} ${styles.whatsappBand}`}>
                    <div>
                        <h3 className={styles.whatsappTitle}>DAL is also on WhatsApp</h3>
                        <p className={styles.whatsappSub}>Search routes, report alerts, and book errands — all in one chat. Premium feature.</p>
                    </div>
                    <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                        Chat on WhatsApp
                    </a>
                </div>
            </section>
        </div>
    );
}
