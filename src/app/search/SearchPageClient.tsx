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

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        setActiveStepIndex(null); // Reset step when switching routes
    };

    return (
        <div className={styles.searchContainer}>
            <header className={styles.searchHeader}>
                <div className={styles.headerContent}>
                    <Link href="/" className={styles.logo}>DAL</Link>
                    <div className={styles.searchBarWrapper}>
                        <RouteSearch />
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.resultsSidebar}>
                    <div className={styles.resultsHeader}>
                        <Link href="/" className={styles.backLink}>
                            <ChevronLeft size={16} /> Back to Home
                        </Link>
                        <h1>{initialTitle}</h1>
                        <p>{initialRoutes?.length || 0} routes found</p>
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
                                        activeStepIndex={selectedRoute?.id === route.id ? activeStepIndex : null}
                                        onStepSelect={(idx) => {
                                            handleRouteSelect(route);
                                            setActiveStepIndex(idx);
                                        }}
                                        onExpand={() => handleRouteSelect(route)}
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

                <div className={styles.mapStickyContainer}>
                    {selectedRoute ? (
                        <div className={styles.globalMapWrapper}>
                            <RouteMap
                                activeStepIndex={activeStepIndex}
                                locations={selectedRoute.itinerary.map((step: any, idx: number) => ({
                                    title: step.location,
                                    desc: step.instruction || `Step ${idx + 1}`,
                                    city: 'Port Harcourt',
                                    type: step.type
                                }))}
                            />
                            <div className={styles.mapOverlayInfo}>
                                <div className={styles.overlayHeader}>
                                    <Navigation size={16} />
                                    <span>LIVE ROUTE</span>
                                </div>
                                <h3>{selectedRoute.origin} → {selectedRoute.destination}</h3>
                                <p>{selectedRoute.duration_minutes} min • {selectedRoute.itinerary.length} stops</p>
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
        </div>
    );
}
