'use client';

import { useState, useEffect, useCallback } from 'react';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import RouteMap from '@/components/Map/RouteMap';
import styles from './search.module.css';
import { Navigation, Search as SearchIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SearchPageClient({ initialRoutes, initialTitle }: { initialRoutes: any[], initialTitle: string }) {
    const [selectedRoute, setSelectedRoute] = useState<any | null>(initialRoutes?.[0] || null);
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [showRouteMap, setShowRouteMap] = useState<boolean>(true);
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
    const [allAlerts, setAllAlerts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/alerts').then(r => r.json()).then(data => setAllAlerts(data.alerts || [])).catch(() => {});
        fetch('/api/config?key=show_route_map')
            .then(r => r.json())
            .then(data => {
                if (data.show_route_map !== undefined) setShowRouteMap(data.show_route_map === 'true' || data.show_route_map === true);
            })
            .catch(() => {});
    }, []);

    const getAlertsForRoute = useCallback((route: any) => {
        if (!route) return [];
        const areas = new Set([route.start_location?.toLowerCase(), route.destination?.toLowerCase()].filter(Boolean));
        
        let stops = [];
        if (typeof route.stops_along_the_way === 'string') {
            try {
                stops = JSON.parse(route.stops_along_the_way);
            } catch (e) {
                // Fallback for legacy comma-separated strings
                stops = route.stops_along_the_way.split(/[,;\n]+/).map((s: string) => ({ location: s.trim() }));
            }
        } else if (Array.isArray(route.stops_along_the_way)) {
            stops = route.stops_along_the_way;
        }
            
        stops.forEach((step: any) => {
            if (step.location) areas.add(step.location.toLowerCase());
        });
        
        return allAlerts.filter(a => a.area && areas.has(a.area.toLowerCase()));
    }, [allAlerts]);

    const getTrafficForRoute = useCallback((routeAlerts: any[]) => {
        if (routeAlerts.some(a => a.severity === 'critical')) return 'heavy';
        if (routeAlerts.some(a => a.severity === 'warning')) return 'moderate';
        return 'clear';
    }, []);

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        setActiveStepIndex(null); // Reset step when switching routes
    };

    return (
        <div className={styles.searchContainer}>
            <header className={styles.searchHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.logoRow}>
                        <Link href="/" className={styles.logo}>DAL</Link>
                        {initialRoutes?.length > 0 && (
                            <span className={styles.resultsBadge}>{initialRoutes.length} found</span>
                        )}
                    </div>
                    <div className={styles.searchBarWrapper}>
                        <RouteSearch showTitle={false} />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={`${styles.resultsSidebar} ${viewMode === 'map' ? styles.hideOnMobile : ''}`}>
                    <div className={styles.resultsHeader}>
                        <Link href="/" className={styles.backLink}>
                            <ChevronLeft size={16} /> Back to Home
                        </Link>
                        <h1 className={styles.titleText}>{initialTitle}</h1>
                    </div>

                    <div className={styles.resultsList}>
                        {initialRoutes && initialRoutes.length > 0 ? (
                            initialRoutes.map((route) => (
                                <div
                                    key={route.id}
                                    className={`${styles.cardWrapper} ${selectedRoute?.id === route.id ? styles.selectedCard : ''}`}
                                >
                                    <RouteResultCard
                                        route_title={route.route_title}
                                        start_location={route.start_location}
                                        destination={route.destination}
                                        estimated_travel_time_min={route.estimated_travel_time_min}
                                        estimated_travel_time_max={route.estimated_travel_time_max}
                                        fare_price_range_min={route.fare_price_range_min}
                                        fare_price_range_max={route.fare_price_range_max}
                                        vehicle_type_used={route.vehicle_type_used}
                                        difficulty_level={route.difficulty_level}
                                        detailed_directions={route.detailed_directions}
                                        tips_and_warnings={route.tips_and_warnings}
                                        traffic={getTrafficForRoute(getAlertsForRoute(route))}
                                        routeAlerts={getAlertsForRoute(route)}
                                        isRecommended={true}
                                        stops_along_the_way={route.stops_along_the_way}
                                        isGlobalMode={true}
                                        isExpanded={expandedRouteId === route.id}
                                        activeStepIndex={selectedRoute?.id === route.id ? activeStepIndex : null}
                                        onStepSelect={(idx) => {
                                            handleRouteSelect(route);
                                            setActiveStepIndex(idx);
                                        }}
                                        onExpand={() => handleRouteSelect(route)}
                                        onToggleExpand={(expanded) => {
                                            setExpandedRouteId(expanded ? route.id : null);
                                            if (expanded) handleRouteSelect(route);
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <SearchIcon size={48} />
                                <p>No routes found for this search.</p>
                            </div>
                        )}
                    </div>
                </div>

                {showRouteMap && (
                <div className={`${styles.mapStickyContainer} ${viewMode === 'list' ? styles.hideOnMobile : ''}`}>
                    {selectedRoute ? (
                        <div className={styles.globalMapWrapper}>
                            <RouteMap
                                activeStepIndex={activeStepIndex}
                                locations={(() => {
                                    let stops = [];
                                    if (typeof selectedRoute.stops_along_the_way === 'string') {
                                        try {
                                            stops = JSON.parse(selectedRoute.stops_along_the_way);
                                        } catch (e) {
                                            stops = selectedRoute.stops_along_the_way.split(/[,;\n]+/).map((s: string) => ({ location: s.trim() }));
                                        }
                                    } else if (Array.isArray(selectedRoute.stops_along_the_way)) {
                                        stops = selectedRoute.stops_along_the_way;
                                    }
                                    return stops.map((step: any, idx: number) => ({
                                        title: step.location,
                                        desc: step.instruction || `Step ${idx + 1}`,
                                        city: 'Port Harcourt',
                                        type: step.type || 'stop'
                                    }));
                                })()}
                                traffic={getTrafficForRoute(getAlertsForRoute(selectedRoute))}
                            />
                            <div className={styles.mapOverlayInfo}>
                                <div className={styles.overlayHeader}>
                                    <Navigation size={16} />
                                    <span>LIVE ROUTE</span>
                                </div>
                                <h3>{selectedRoute.route_title || `${selectedRoute.start_location} → ${selectedRoute.destination}`}</h3>
                                <p>{selectedRoute.estimated_travel_time_min}{selectedRoute.estimated_travel_time_max ? `-${selectedRoute.estimated_travel_time_max}` : ''} min</p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.placeholderMap}>
                            <Navigation size={64} className={styles.mapIcon} />
                            <h3>Select a route to view on map</h3>
                        </div>
                    )}
                </div>
                )}
            </main>

            {showRouteMap && (
            <button
                className={styles.mobileToggleButton}
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
                {viewMode === 'list' ? (
                    <>
                        <Navigation size={18} />
                        <span>Show Map</span>
                    </>
                ) : (
                    <>
                        <SearchIcon size={18} />
                        <span>Show List</span>
                    </>
                )}
            </button>
            )}
        </div>
    );
}
