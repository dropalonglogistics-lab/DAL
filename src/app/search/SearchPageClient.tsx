'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowDownUp, Loader2, ArrowRight } from 'lucide-react';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import styles from './search.module.css';

interface RouteData {
    id: string;
    route_title: string;
    start_location: string;
    destination: string;
    stops_along_the_way: string;
    vehicle_type_used: string;
    estimated_travel_time_min: number;
    estimated_travel_time_max: number;
    fare_price_range_min: number;
    fare_price_range_max: number;
    difficulty_level: string;
    detailed_directions: string;
    tips_and_warnings: string;
    created_at: string;
    road_condition: string;
}

export default function SearchPageClient({ featuredRoutes }: { featuredRoutes: RouteData[] }) {
    const [fromInput, setFromInput] = useState('');
    const [toInput, setToInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<RouteData[]>([]);
    const [didYouMean, setDidYouMean] = useState<RouteData[]>([]);
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
    const supabase = createClient();

    const handleSwap = () => {
        setFromInput(toInput);
        setToInput(fromInput);
    };

    const handleSearch = async () => {
        const cleanFrom = fromInput.trim();
        const cleanTo = toInput.trim();
        
        // If neither, return the first 20 alpha routes (but the requirement says "when neither filled")
        // But the search button shouldn't do nothing if empty.
        
        setIsSearching(true);
        setHasSearched(true);
        setDidYouMean([]);
        setExpandedRouteId(null);

        const fetchRoutes = async (start: string, dest: string, isFallback = false) => {
            let query = supabase.from('routes').select(`
                id, route_title, start_location, destination, stops_along_the_way, 
                vehicle_type_used, estimated_travel_time_min, estimated_travel_time_max, 
                fare_price_range_min, fare_price_range_max, difficulty_level, 
                detailed_directions, tips_and_warnings, created_at, road_condition
            `);

            if (start && dest) {
                query = query
                    .or(`start_location.ilike.%${start}%,route_title.ilike.%${start}%`)
                    .or(`destination.ilike.%${dest}%,route_title.ilike.%${dest}%`);
            } else if (start) {
                query = query.or(`start_location.ilike.%${start}%,route_title.ilike.%${start}%`);
            } else if (dest) {
                query = query.or(`destination.ilike.%${dest}%,route_title.ilike.%${dest}%`);
            } else {
                // If neither is filled, return first 20 alpha
                query = query.order('route_title', { ascending: true }).limit(20);
            }

            const { data, error } = await query;
            return data || [];
        };

        const initialResults = await fetchRoutes(cleanFrom, cleanTo);
        
        if (initialResults.length > 0) {
            setResults(initialResults);
        } else {
            setResults([]);
            // BUG 1 fallback logic: split on space and use first word
            const fallbackFrom = cleanFrom.split(' ')[0];
            const fallbackTo = cleanTo.split(' ')[0];
            
            if (fallbackFrom || fallbackTo) {
                const fallbackResults = await fetchRoutes(fallbackFrom, fallbackTo, true);
                setDidYouMean(fallbackResults);
            }
        }
        
        setIsSearching(false);
    };

    const handleToggleExpand = (id: string, isExpanded: boolean) => {
        setExpandedRouteId(isExpanded ? id : null);
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
                    {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Find Route'}
                </button>

                {/* SECTION 3 - DEFAULT STATE (POPULAR ROUTES) */}
                {!hasSearched && (
                    <section>
                        <h2 className={styles.popularHeader}>POPULAR ROUTES</h2>
                        <div className={styles.resultsList}>
                            {featuredRoutes.map((route) => (
                                <RouteResultCard 
                                    key={route.id} 
                                    {...route} 
                                    isExpanded={expandedRouteId === route.id}
                                    onToggleExpand={(expanded) => handleToggleExpand(route.id, expanded)}
                                />
                            ))}
                            {featuredRoutes.length === 0 && (
                                <div className={styles.emptyState}>
                                    <p className={styles.emptyTitle}>Routes loading — check back shortly.</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* SECTION 4 - LIVE SEARCH RESULTS */}
                {hasSearched && (
                    <section>
                        {results.length > 0 ? (
                            <>
                                <h2 className={styles.resultsHeader}>
                                    {results.length === 1 ? '1 route found' : `${results.length} routes found`}
                                </h2>
                                <div className={styles.resultsList}>
                                    {results.map((route) => (
                                        <RouteResultCard 
                                            key={route.id} 
                                            {...route} 
                                            isExpanded={expandedRouteId === route.id}
                                            onToggleExpand={(expanded) => handleToggleExpand(route.id, expanded)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : didYouMean.length > 0 ? (
                            <>
                                <h2 className={styles.resultsHeader}>Did you mean these routes?</h2>
                                <div className={styles.resultsList}>
                                    {didYouMean.map((route) => (
                                        <RouteResultCard 
                                            key={route.id} 
                                            {...route} 
                                            isExpanded={expandedRouteId === route.id}
                                            onToggleExpand={(expanded) => handleToggleExpand(route.id, expanded)}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyTitle}>0 routes found</div>
                                <p className={styles.emptySub}>No results for "{fromInput || '[Any]'}" to "{toInput || '[Any]'}".</p>
                                <Link href="/suggest-route" className={styles.suggestLink}>
                                    Suggest this route <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </section>
                )}

            </div>
        </div>
    );
}
