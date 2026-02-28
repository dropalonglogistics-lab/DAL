import { Search, Navigation, Users, Bell, Shield, Info, MapPin, AlertTriangle, TrafficCone, Coins } from 'lucide-react';
import Link from 'next/link';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface HomeProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
    const supabase = await createClient();
    const params = await searchParams;

    const origin = typeof params.origin === 'string' ? params.origin : '';
    const destination = typeof params.destination === 'string' ? params.destination : '';

    let query = supabase.from('routes').select('*');

    const cleanOrigin = origin.trim();
    const cleanDest = destination.trim();

    if (cleanOrigin && cleanDest) {
        // If both provided, try to find a direct match in either direction
        query = query.or(`origin.ilike.%${cleanOrigin}%,destination.ilike.%${cleanDest}%,origin.ilike.%${cleanDest}%,destination.ilike.%${cleanOrigin}%`);
    } else if (cleanOrigin || cleanDest) {
        const term = cleanOrigin || cleanDest;
        query = query.or(`origin.ilike.%${term}%,destination.ilike.%${term}%`);
    }

    let { data: routes, error } = await query;

    // Reliability: If search returns nothing, show everything as "Recommended"
    const isShowingSearch = !!(cleanOrigin || cleanDest);
    let resultsTitle = isShowingSearch ? `Search results for "${cleanDest || cleanOrigin}"` : 'Recommended for You';

    if (!routes || routes.length === 0) {
        const { data: allRoutes } = await supabase.from('routes').select('*').limit(10);
        routes = allRoutes;
        if (isShowingSearch) {
            resultsTitle = `No exact match for your search. Showing all available routes:`;
        }
    }

    // Fetch alerts for "Highlights"
    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

    // Fetch community stats
    const { count: communityCount } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true });

    return (
        <div className={styles.pageContainer}>
            <section className={styles.searchSection}>
                <div className={styles.heroText}>
                    <h1>Move Smarter in Port Harcourt</h1>
                    <p>Intelligent road transit routing. No manual vehicle selection needed.</p>
                </div>

                <div className={styles.mainSearchWrapper}>
                    <RouteSearch />
                </div>

                <div className={styles.shortcuts}>
                    <Link href="#search-results" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon}>
                            <Search size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Find Route</span>
                            <span className={styles.shortcutHighlight}>{routes?.length || 0} paths verified today</span>
                        </div>
                    </Link>
                    <Link href="/suggest-route" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                            <Navigation size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Report/Suggest</span>
                            <span className={styles.shortcutHighlight}>3 new community reports</span>
                        </div>
                    </Link>
                    <Link href="/community" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <Users size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Community</span>
                            <span className={styles.shortcutHighlight}>{communityCount || 0} active locales</span>
                        </div>
                    </Link>
                    <Link href="/alerts" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <Bell size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Live Alerts</span>
                            <span className={styles.shortcutHighlight}>{alerts?.length || 0} active incidents</span>
                        </div>
                    </Link>
                </div>

                <div className={styles.highlightsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Live Road Intelligence</h2>
                    </div>
                    {/* ... alerts logic ... */}
                    <div className={styles.highlightsGrid}>
                        {alerts && alerts.length > 0 && alerts.map((alert) => (
                            <div key={alert.id} className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    {alert.type === 'police' ? <Shield size={20} /> :
                                        alert.type === 'traffic' ? <TrafficCone size={20} /> :
                                            <AlertTriangle size={20} />}
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Report</span>
                                    <p className={styles.highlightText}>{alert.description}</p>
                                    <span className={styles.highlightTime}>Just now</span>
                                </div>
                            </div>
                        ))}
                        {communityCount !== null && communityCount > 0 && (
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    <Users size={20} />
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>Community Hub</span>
                                    <p className={styles.highlightText}>{communityCount} crowd-sourced routes ready for exploration.</p>
                                    <span className={styles.highlightTime}>Always Learning</span>
                                </div>
                            </div>
                        )}
                        {(!alerts || alerts.length === 0) && (!communityCount || communityCount === 0) && (
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    <Info size={20} />
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>Roads are Clear</span>
                                    <p className={styles.highlightText}>No major incidents reported in Port Harcourt right now.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.resultsSection} id="search-results">
                {isShowingSearch ? (
                    <>
                        <div className={styles.sectionHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2>{resultsTitle}</h2>
                                {routes && <span className={styles.resultsCount}>{routes.length} found</span>}
                            </div>
                            <span className={styles.subtext}>Smart Search</span>
                        </div>

                        <div className={styles.resultsGrid}>
                            {routes && routes.length > 0 ? (
                                routes.map((route) => (
                                    <RouteResultCard
                                        key={route.id}
                                        title={`${route.origin} → ${route.destination}`}
                                        time={`${route.duration_minutes} min`}
                                        fare_min={route.fare_min || route.price_estimated}
                                        fare_max={route.fare_max || route.price_estimated}
                                        traffic="clear"
                                        isRecommended={true}
                                        itinerary={route.itinerary}
                                    />
                                ))
                            ) : (
                                <div className={styles.emptyState}>
                                    <p>No exact routes found. Try adjusting your search.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '0px 24px 24px 24px' }}>
                        {/* Start Search State - Routes are hidden by default */}
                    </div>
                )}
            </section>

            {/* Premium Teaser Section */}
            <section className={styles.premiumSection}>
                <div className={styles.premiumContent}>
                    <div className={styles.premiumHeader}>
                        <span className={styles.premiumBadge}>Coming Soon</span>
                        <h2>Elevate Your Commute</h2>
                    </div>
                    <p className={styles.premiumDescription}>
                        Unlock <strong>DAL Premium</strong> for advanced route analytics, real-time congestion heatmaps,
                        and priority incident reports. Move faster, smarter, and safer.
                    </p>
                    <div className={styles.premiumFeatures}>
                        <div className={styles.pFeature}>
                            <Shield size={18} />
                            <span>Priority Alerts</span>
                        </div>
                        <div className={styles.pFeature}>
                            <Navigation size={18} />
                            <span>AI Routing</span>
                        </div>
                        <div className={styles.pFeature}>
                            <Coins size={18} />
                            <span>Fare Predictions</span>
                        </div>
                    </div>
                </div>
                <div className={styles.premiumVisual}>
                    <div className={styles.glassCard}>
                        <div className={styles.shimmerLine}></div>
                        <div className={styles.shimmerLine} style={{ width: '70%' }}></div>
                        <div className={styles.shimmerLine} style={{ width: '90%' }}></div>
                    </div>
                </div>
            </section>
        </div>
    );
}
