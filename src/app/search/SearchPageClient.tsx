'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { ArrowRight, ArrowDownUp, Loader2 } from 'lucide-react';
import styles from './search.module.css';

interface RouteData {
    id: string;
    start_location: string;
    destination: string;
    road_condition: string;
    estimated_travel_time_min: number;
    estimated_travel_time_max: number;
    fare_price_range_min: number;
    fare_price_range_max: number;
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
        setFromInput(toInput);
        setToInput(fromInput);
    };

    const handleSearch = async () => {
        if (!fromInput.trim() && !toInput.trim()) return;
        
        setIsSearching(true);
        setHasSearched(true);
        
        const cleanFrom = fromInput.trim();
        const cleanTo = toInput.trim();
        
        let query = supabase.from('routes').select('id, start_location, destination, road_condition, estimated_travel_time_min, estimated_travel_time_max, fare_price_range_min, fare_price_range_max');
        
        if (cleanFrom && cleanTo) {
            query = query.or(`start_location.ilike.%${cleanFrom}%,destination.ilike.%${cleanFrom}%`).or(`start_location.ilike.%${cleanTo}%,destination.ilike.%${cleanTo}%`);
        } else if (cleanFrom) {
            query = query.or(`start_location.ilike.%${cleanFrom}%,destination.ilike.%${cleanFrom}%`);
        } else if (cleanTo) {
            query = query.or(`start_location.ilike.%${cleanTo}%,destination.ilike.%${cleanTo}%`);
        }
        
        const { data, error } = await query;
        if (!error && data) {
            setResults(data);
        } else {
            setResults([]);
        }
        setIsSearching(false);
    };

    const handleCardClick = (route: RouteData) => {
        setFromInput(route.start_location);
        setToInput(route.destination);
        // Force state update then search
        setTimeout(() => {
            handleSearchClick(route.start_location, route.destination);
        }, 0);
    };

    const handleSearchClick = async (start: string, dest: string) => {
        setIsSearching(true);
        setHasSearched(true);
        let query = supabase.from('routes').select('id, start_location, destination, road_condition, estimated_travel_time_min, estimated_travel_time_max, fare_price_range_min, fare_price_range_max');
        
        query = query.or(`start_location.ilike.%${start}%,destination.ilike.%${start}%`).or(`start_location.ilike.%${dest}%,destination.ilike.%${dest}%`);
        
        const { data } = await query;
        setResults(data || []);
        setIsSearching(false);
    };

    const getConditionTag = (condition: string) => {
        const c = (condition || '').toLowerCase();
        if (c === 'clear') return { label: 'Fast', css: styles.tagGreen, dot: styles.dotGreen };
        if (c === 'slow') return { label: 'Busy now', css: styles.tagOrange, dot: styles.dotOrange };
        if (c === 'blocked') return { label: 'Blocked', css: styles.tagRed, dot: styles.dotRed };
        return { label: 'Popular', css: styles.tagGold, dot: styles.dotGray }; // Default for unknown/featured
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
                        {featuredRoutes.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyTitle}>Routes loading — check back shortly.</p>
                            </div>
                        ) : (
                            <>
                                <h2 className={styles.popularHeader}>POPULAR ROUTES</h2>
                                <div className={styles.popularGrid}>
                                    {featuredRoutes.map((route) => {
                                        const tag = getConditionTag(route.road_condition);
                                        return (
                                            <div key={route.id} className={styles.routeCard} onClick={() => handleCardClick(route)}>
                                                <span className={`${styles.cardTag} ${tag.css}`}>{tag.label}</span>
                                                <h3 className={styles.cardTitle}>
                                                    {route.start_location} <ArrowRight size={14} className={styles.cardArrow} /> {route.destination}
                                                </h3>
                                                <div className={styles.cardMeta}>
                                                    <div className={`${styles.conditionDot} ${tag.dot}`}></div>
                                                    <span>{route.road_condition === 'clear' ? 'Clear' : route.road_condition === 'slow' ? 'Slow traffic' : route.road_condition === 'blocked' ? 'Blocked' : 'Unknown'}</span>
                                                    <div className={styles.metaDivider}></div>
                                                    <span>{route.estimated_travel_time_min}{route.estimated_travel_time_max && route.estimated_travel_time_max !== route.estimated_travel_time_min ? `-${route.estimated_travel_time_max}` : ''} min</span>
                                                    <div className={styles.metaDivider}></div>
                                                    <span>₦{route.fare_price_range_min || 0}{route.fare_price_range_max && route.fare_price_range_max !== route.fare_price_range_min ? `-${route.fare_price_range_max}` : ''}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>
                )}

                {/* SECTION 4 - LIVE SEARCH RESULTS */}
                {hasSearched && (
                    <section>
                        <h2 className={styles.resultsHeader}>
                            {results.length === 1 ? '1 route found' : `${results.length} routes found`}
                        </h2>
                        
                        {results.length > 0 ? (
                            <div className={styles.resultsList}>
                                {results.map((route) => {
                                    const tag = getConditionTag(route.road_condition);
                                    return (
                                        <div key={route.id} className={styles.resultRow}>
                                            <div className={styles.resultLeft}>
                                                <div className={styles.resultName}>
                                                    {route.start_location} <ArrowRight size={12} className={styles.cardArrow} /> {route.destination}
                                                </div>
                                                <div className={styles.resultCondition}>
                                                    <div className={`${styles.conditionDot} ${tag.dot}`}></div>
                                                    <span>{route.road_condition === 'clear' ? 'Clear' : route.road_condition === 'slow' ? 'Slow traffic' : route.road_condition === 'blocked' ? 'Blocked' : 'Unknown traffic'}</span>
                                                </div>
                                            </div>
                                            <div className={styles.resultRight}>
                                                <div className={styles.resultFare}>
                                                    ₦{route.fare_price_range_min?.toLocaleString() || 0}{route.fare_price_range_max && route.fare_price_range_max !== route.fare_price_range_min ? `-₦${route.fare_price_range_max.toLocaleString()}` : ''}
                                                </div>
                                                <div className={styles.resultDuration}>
                                                    {route.estimated_travel_time_min}{route.estimated_travel_time_max && route.estimated_travel_time_max !== route.estimated_travel_time_min ? `-${route.estimated_travel_time_max}` : ''} min
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyTitle}>No routes found from {fromInput || '[Any]'} to {toInput || '[Any]'}.</p>
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
