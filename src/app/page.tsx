import { Search, Navigation, Users, Bell, Shield, Info, MapPin, AlertTriangle, TrafficCone } from 'lucide-react';
import Link from 'next/link';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

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

                <div className={styles.shortcuts}>
                    <Link href="#search" className={styles.shortcutCard}>
                        <Search size={24} />
                        <span className={styles.shortcutLabel}>Find Route</span>
                    </Link>
                    <Link href="/suggest-route" className={styles.shortcutCard}>
                        <Navigation size={24} />
                        <span className={styles.shortcutLabel}>Report/Suggest</span>
                    </Link>
                    <Link href="/community" className={styles.shortcutCard}>
                        <Users size={24} />
                        <span className={styles.shortcutLabel}>Community</span>
                    </Link>
                    <Link href="/alerts" className={styles.shortcutCard}>
                        <Bell size={24} />
                        <span className={styles.shortcutLabel}>Live Alerts</span>
                    </Link>
                </div>

                <RouteSearch />

                <div className={styles.highlightsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Live Road Intelligence</h2>
                    </div>
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

            <section className={styles.resultsSection}>
                <div className={styles.sectionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h2>{resultsTitle}</h2>
                        {isShowingSearch && routes && <span className={styles.resultsCount}>{routes.length} found</span>}
                    </div>
                    <span className={styles.subtext}>{isShowingSearch ? 'Smart Search' : 'AI Optimized'}</span>
                </div>

                <div className={styles.resultsGrid}>
                    {routes && routes.length > 0 ? (
                        routes.map((route) => (
                            <RouteResultCard
                                key={route.id}
                                title={`${route.origin} → ${route.destination}`}
                                time={`${route.duration_minutes} min`}
                                fare={`₦${route.price_estimated}`}
                                fareRange={route.fare_min && route.fare_max ? `₦${route.fare_min} - ₦${route.fare_max}` : undefined}
                                traffic="clear"
                                isRecommended={true}
                                vehicleType={route.vehicle_type}
                                itinerary={route.itinerary}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>Enter your destination to see recommended routes and vehicles.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
