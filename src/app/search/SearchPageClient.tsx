'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowDownUp, Loader2, ArrowRight } from 'lucide-react';
import styles from './search.module.css';

interface RouteData {
    id: string;
    route_title: string;
    start_location: string;
    destination: string;
    fare_price_range_min: number;
    fare_price_range_max: number;
    estimated_travel_time_min: number;
    estimated_travel_time_max: number;
    road_condition: string;
    is_featured: boolean;
}

export default function SearchPageClient({ featuredRoutes }: { featuredRoutes: RouteData[] }) {
    const [fromInput, setFromInput] = useState('');
    const [toInput, setToInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<RouteData[]>([]);
    const supabase = createClient();

    const handleSwap = () => {
        const temp = fromInput;
        setFromInput(toInput);
        setToInput(temp);
    };

    const handleSearch = async () => {
        const cleanFrom = fromInput.trim();
        const cleanTo = toInput.trim();
        
        if (!cleanFrom && !cleanTo) {
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            let query = supabase.from('routes').select(`
                id, route_title, start_location, destination, 
                fare_price_range_min, fare_price_range_max, 
                estimated_travel_time_min, estimated_travel_time_max, 
                road_condition, is_featured
            `);

            // Fuzzy logic: 
            // If both: match both. 
            // If one: match that one (either start or dest if only one field is used? 
            // The prompt says: "typing 'mile' should match 'Mile 1', 'Mile 3', etc. 
            // If only From is filled, return all routes where origin matches. 
            // If only To is filled, return all routes where destination matches.")
            
            if (cleanFrom && cleanTo) {
                query = query
                    .ilike('start_location', `%${cleanFrom}%`)
                    .ilike('destination', `%${cleanTo}%`);
            } else if (cleanFrom) {
                query = query.ilike('start_location', `%${cleanFrom}%`);
            } else if (cleanTo) {
                query = query.ilike('destination', `%${cleanTo}%`);
            }

            const { data, error } = await query.order('route_title', { ascending: true }).limit(50);
            
            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFeaturedClick = (start: string, dest: string) => {
        setFromInput(start);
        setToInput(dest);
        // We use a small delay or just call search directly with the new values
        // To be safe, we'll implement a functional search that takes params
        performDirectSearch(start, dest);
    };

    const performDirectSearch = async (start: string, dest: string) => {
        setIsSearching(true);
        setHasSearched(true);
        try {
            const { data } = await supabase.from('routes')
                .select('*')
                .ilike('start_location', `%${start}%`)
                .ilike('destination', `%${dest}%`)
                .limit(50);
            setResults(data || []);
        } finally {
            setIsSearching(false);
        }
    };

    const getConditionColor = (condition: string) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return styles.dotClear;
            case 'slow': return styles.dotSlow;
            case 'blocked': return styles.dotBlocked;
            default: return styles.dotUnknown;
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                
                {/* SECTION 1 - HEADER */}
                <header className={styles.headerSection}>
                    <span className={styles.subLabel}>ROUTE INTELLIGENCE</span>
                    <h1 className={styles.pageTitle}>Find your <span className={styles.goldText}>route</span></h1>
                </header>

                {/* SECTION 2 - SEARCH INPUT BOX */}
                <div className={styles.searchContainer}>
                    <div className={styles.connectorLine}></div>
                    
                    <div className={styles.inputRow}>
                        <div className={styles.iconWrapper}>
                            <div className={styles.dotGold}></div>
                        </div>
                        <input 
                            type="text" 
                            className={styles.inputField} 
                            placeholder="Where from?" 
                            value={fromInput}
                            onChange={(e) => setFromInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className={styles.swapBtn} onClick={handleSwap} aria-label="Swap locations" type="button">
                            <ArrowDownUp size={16} />
                        </button>
                    </div>

                    <div className={styles.inputRow}>
                        <div className={styles.iconWrapper}>
                            <div className={styles.dotWhite}></div>
                        </div>
                        <input 
                            type="text" 
                            className={styles.inputField} 
                            placeholder="Where to?" 
                            value={toInput}
                            onChange={(e) => setToInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>

                <button className={styles.submitBtn} onClick={handleSearch} disabled={isSearching} type="button">
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Find Route'}
                </button>

                {/* SECTION 3 & 4 - CONTENT AREA */}
                {!hasSearched ? (
                    <section>
                        <span className={styles.sectionLabel}>POPULAR ROUTES</span>
                        {featuredRoutes.length > 0 ? (
                            <div className={styles.popularGrid}>
                                {featuredRoutes.map((route) => (
                                    <button 
                                        key={route.id} 
                                        className={styles.routeCard}
                                        onClick={() => handleFeaturedClick(route.start_location, route.destination)}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={`${styles.pill} ${
                                                route.road_condition === 'clear' ? styles.pillFast : 
                                                route.road_condition === 'slow' ? styles.pillBusy : styles.pillPopular
                                            }`}>
                                                {route.road_condition === 'clear' ? 'Fast' : 
                                                 route.road_condition === 'slow' ? 'Busy now' : 'Popular'}
                                            </span>
                                        </div>
                                        <div className={styles.routeName}>
                                            {route.start_location} <span className={styles.arrow}>→</span> {route.destination}
                                        </div>
                                        <div className={styles.cardFooter}>
                                            <div className={styles.conditionRow}>
                                                <div className={`${styles.dotStatus} ${getConditionColor(route.road_condition)}`}></div>
                                                {route.road_condition || 'Unknown'}
                                            </div>
                                            <div className={styles.metaText}>
                                                {route.estimated_travel_time_min}-{route.estimated_travel_time_max}m • ₦{route.fare_price_range_min}-₦{route.fare_price_range_max}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p className={styles.emptySub}>Routes loading — check back shortly.</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <section>
                        <div className={styles.resultsHeader}>
                            {isSearching ? 'Searching...' : `${results.length} ROUTES FOUND`}
                        </div>
                        
                        {results.length > 0 ? (
                            <div className={styles.resultsList}>
                                {results.map((route) => (
                                    <div key={route.id} className={styles.resultRow}>
                                        <div className={styles.resultMain}>
                                            <div className={styles.resultTitle}>
                                                {route.start_location} <span className={styles.arrow}>→</span> {route.destination}
                                            </div>
                                            <div className={styles.resultMeta}>
                                                <div className={`${styles.dotStatus} ${getConditionColor(route.road_condition)}`}></div>
                                                {route.road_condition || 'Unknown'}
                                            </div>
                                        </div>
                                        <div className={styles.resultStats}>
                                            <div className={styles.resultFare}>
                                                ₦{route.fare_price_range_min}-{route.fare_price_range_max}
                                            </div>
                                            <div className={styles.resultDuration}>
                                                {route.estimated_travel_time_min}-{route.estimated_travel_time_max} mins
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !isSearching && (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyTitle}>0 routes found</div>
                                    <p className={styles.emptySub}>No routes found from "{fromInput || '[Any]'}" to "{toInput || '[Any]'}".</p>
                                    <Link href="/suggest-route" className={styles.suggestLink}>
                                        Suggest this route <ArrowRight size={14} />
                                    </Link>
                                </div>
                            )
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
