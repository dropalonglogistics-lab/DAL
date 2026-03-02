'use client';

import { useState } from 'react';
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
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

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
                                        title={`${route.origin} → ${route.destination}`}
                                        time={`${route.duration_minutes} min`}
                                        fare_min={route.fare_min || route.price_estimated}
                                        fare_max={route.fare_max || route.price_estimated}
                                        traffic="clear"
                                        isRecommended={true}
                                        itinerary={route.itinerary}
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

                <div className={`${styles.mapStickyContainer} ${viewMode === 'list' ? styles.hideOnMobile : ''}`}>
                    {selectedRoute ? (
                        <div className={styles.globalMapWrapper}>
                            <RouteMap
                                activeStepIndex={activeStepIndex}
                                locations={selectedRoute.itinerary?.map((step: any, idx: number) => ({
                                    title: step.location,
                                    desc: step.instruction || `Step ${idx + 1}`,
                                    city: 'Port Harcourt',
                                    type: step.type
                                })) || []}
                            />
                            <div className={styles.mapOverlayInfo}>
                                <div className={styles.overlayHeader}>
                                    <Navigation size={16} />
                                    <span>LIVE ROUTE</span>
                                </div>
                                <h3>{selectedRoute.origin} → {selectedRoute.destination}</h3>
                                <p>{selectedRoute.duration_minutes} min • {selectedRoute.itinerary?.length || 0} stops</p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.placeholderMap}>
                            <Navigation size={64} className={styles.mapIcon} />
                            <h3>Select a route to view on map</h3>
                        </div>
                    )}
                </div>
            </main>

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
        </div>
    );
}
