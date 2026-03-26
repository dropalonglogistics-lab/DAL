import { Search, Navigation, Users, Bell, Shield, Info, MapPin, AlertTriangle, TrafficCone, Coins, Sparkles, ChevronRight, TrendingUp, ShieldCheck, Package } from 'lucide-react';
import Link from 'next/link';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import HomeTicker from '@/components/HomeTicker';
import HomepageExpressTile from '@/components/Express/HomepageExpressTile';
import HomepageShopperTile from '@/components/Shopper/HomepageShopperTile';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const supabase = await createClient();

    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

    const { count: communityCount } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true });

    const { count: verifiedCount } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

    const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Trending routes — 3 most recently updated community routes
    const { data: trending } = await supabase
        .from('community_routes')
        .select('id, origin, destination, vehicle_type, price_estimated, fare_min')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);

    const { data: configData } = await supabase
        .from('platform_config')
        .select('key, value')
        .in('key', ['f2_express_live', 'f3_shopper_live']);
    
    const isF2Live = configData?.find(c => c.key === 'f2_express_live')?.value === 'true';
    const isF3Live = configData?.find(c => c.key === 'f3_shopper_live')?.value === 'true';

    return (
        <div className={styles.page}>
            {/* ── Live Ticker Banner ── */}
            <HomeTicker />

            {/* ── Hero Section ── */}
            <section className={styles.hero}>
                <div className={styles.heroInner}>
                    <h1 className={styles.heroTitle}>Move Smarter in Port Harcourt</h1>
                    <p className={styles.heroSub}>Intelligent road transit routing. Community-powered intelligence.</p>
                    <div className={styles.searchBox}>
                        <RouteSearch />
                    </div>
                </div>
            </section>

            {/* ── Community Stats Bar ── */}
            <section className={styles.statsBar}>
                <div className={styles.statsBarInner}>
                    <div className={styles.statsBarItem}>
                        <ShieldCheck size={18} />
                        <span><strong>{verifiedCount ?? 0}</strong> routes verified</span>
                    </div>
                    <div className={styles.statsBarDivider} />
                    <div className={styles.statsBarItem}>
                        <Bell size={18} />
                        <span><strong>{alertCount ?? 0}</strong> alerts today</span>
                    </div>
                    <div className={styles.statsBarDivider} />
                    <div className={styles.statsBarItem}>
                        <Users size={18} />
                        <span><strong>{(memberCount ?? 0).toLocaleString()}</strong> members</span>
                    </div>
                </div>
            </section>

            {/* ── Stat Cards ── */}
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <Search size={22} />
                        </div>
                        <div className={styles.statText}>
                            <span className={styles.statLabel}>Route Coverage</span>
                            <span className={styles.statValue}>45+ active paths verified</span>
                        </div>
                    </div>
                    <Link href="/suggest-route" className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <Navigation size={22} />
                        </div>
                        <div className={styles.statText}>
                            <span className={styles.statLabel}>Report / Suggest</span>
                            <span className={styles.statValue}>Help the community grow</span>
                        </div>
                    </Link>
                    <Link href="/community" className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconIndigo}`}>
                            <Users size={22} />
                        </div>
                        <div className={styles.statText}>
                            <span className={styles.statLabel}>Community Hub</span>
                            <span className={styles.statValue}>{communityCount || 0} active locales</span>
                        </div>
                    </Link>

                    <HomepageExpressTile isLive={Boolean(isF2Live)} />
                    <HomepageShopperTile isLive={Boolean(isF3Live)} />
                </div>
            </section>

            {/* ── Trending Routes ── */}
            {trending && trending.length > 0 && (
                <section className={styles.trendingSection}>
                    <div className={styles.trendingHeader}>
                        <h2 className={styles.sectionTitle}>
                            <TrendingUp size={22} /> Trending Routes This Week
                        </h2>
                        <Link href="/search" className={styles.seeAll}>See all →</Link>
                    </div>
                    <div className={styles.trendingGrid}>
                        {trending.map((route, i) => (
                            <Link
                                key={route.id}
                                href={`/search?origin=${encodeURIComponent(route.origin)}&destination=${encodeURIComponent(route.destination)}`}
                                className={styles.trendingCard}
                            >
                                <div className={styles.trendingRank}>#{i + 1}</div>
                                <div className={styles.trendingRoute}>
                                    <span className={styles.trendingFrom}>{route.origin}</span>
                                    <ChevronRight size={14} className={styles.trendingArrow} />
                                    <span className={styles.trendingTo}>{route.destination}</span>
                                </div>
                                <div className={styles.trendingMeta}>
                                    <span className={styles.trendingVehicle}>{route.vehicle_type}</span>
                                    {(route.price_estimated || route.fare_min) && (
                                        <span className={styles.trendingFare}>
                                            ₦{(route.price_estimated || route.fare_min)?.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Live Road Intelligence ── */}
            <section className={styles.intelSection}>
                <h2 className={styles.sectionTitle}>Live Road Intelligence</h2>
                <div className={styles.intelGrid}>
                    {alerts && alerts.length > 0 && alerts.map((alert) => (
                        <div key={alert.id} className={styles.intelCard}>
                            <div className={styles.intelIcon}>
                                {alert.type === 'police' ? <Shield size={20} /> :
                                    alert.type === 'traffic' ? <TrafficCone size={20} /> :
                                        <AlertTriangle size={20} />}
                            </div>
                            <div className={styles.intelContent}>
                                <span className={styles.intelTitle}>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Report</span>
                                <p className={styles.intelText}>{alert.description}</p>
                                <span className={styles.intelTime}>Just now</span>
                            </div>
                        </div>
                    ))}
                    {communityCount !== null && communityCount > 0 && (
                        <div className={styles.intelCard}>
                            <div className={styles.intelIcon}>
                                <Users size={20} />
                            </div>
                            <div className={styles.intelContent}>
                                <span className={styles.intelTitle}>Community Hub</span>
                                <p className={styles.intelText}>{communityCount} crowd-sourced routes ready for exploration.</p>
                                <span className={styles.intelTime}>Always Learning</span>
                            </div>
                        </div>
                    )}
                    {(!alerts || alerts.length === 0) && (!communityCount || communityCount === 0) && (
                        <div className={styles.intelCard}>
                            <div className={styles.intelIcon}>
                                <Info size={20} />
                            </div>
                            <div className={styles.intelContent}>
                                <span className={styles.intelTitle}>Roads are Clear</span>
                                <p className={styles.intelText}>No major incidents reported in Port Harcourt right now.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Premium Section ── */}
            <section className={styles.premium}>
                <div className={styles.premiumContent}>
                    <div className={styles.premiumBadge}>
                        <Sparkles size={14} />
                        <span>Coming Soon</span>
                    </div>
                    <h2 className={styles.premiumTitle}>Advanced Logistics Intelligence</h2>
                    <p className={styles.premiumDesc}>
                        Upgrade to <strong>DAL Premium</strong> for our most advanced data layer.
                        Get real-time traffic heatmaps, predictive fare analytics, and priority route intelligence.
                    </p>
                    <div className={styles.premiumGrid}>
                        <div className={styles.premiumFeature}>
                            <div className={styles.premiumFeatureIcon}><Shield size={20} /></div>
                            <div>
                                <strong>Priority Alerts</strong>
                                <span>Real-time hazard updates</span>
                            </div>
                        </div>
                        <div className={styles.premiumFeature}>
                            <div className={styles.premiumFeatureIcon}><Navigation size={20} /></div>
                            <div>
                                <strong>Smart Routing</strong>
                                <span>Traffic-optimized paths</span>
                            </div>
                        </div>
                        <div className={styles.premiumFeature}>
                            <div className={styles.premiumFeatureIcon}><Coins size={20} /></div>
                            <div>
                                <strong>Fare Analytics</strong>
                                <span>Price auditing & trends</span>
                            </div>
                        </div>
                    </div>
                    <button className={styles.waitlistBtn} disabled>
                        Join the Premium Waitlist <ChevronRight size={18} />
                    </button>
                </div>
                <div className={styles.premiumVisual}>
                    <div className={styles.visualOrb}></div>
                    <div className={styles.visualOrb2}></div>
                    <div className={styles.glassCard}>
                        <div className={styles.glassRow}>
                            <div className={styles.glassDot}></div>
                            <div className={styles.glassLine}></div>
                        </div>
                        <div className={styles.glassShimmer}></div>
                        <div className={styles.glassShimmer} style={{ width: '70%', marginTop: '10px' }}></div>
                        <div className={styles.glassShimmer} style={{ width: '45%', marginTop: '10px' }}></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
