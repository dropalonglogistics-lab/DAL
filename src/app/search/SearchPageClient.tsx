'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowDownUp, Loader2, ArrowRight } from 'lucide-react';
import styles from './search.module.css';

interface RouteData {
    id: string;
    name: string;
    origin: string;
    destination: string;
    legs: Array<{
        vehicle: string;
        description: string;
        estimated_fare: number;
        estimated_minutes: number;
    }>;
    fare_min?: number;
    fare_max?: number;
    duration_minutes?: number;
    road_condition?: string;
    is_featured?: boolean;
}

export default function SearchPageClient({ featuredRoutes }: { featuredRoutes: RouteData[] }) {
    const [fromInput, setFromInput] = useState('');
    const [toInput, setToInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<RouteData[]>([]);
    
    // We handle the "routes are loading" completely empty state 
    // where Supabase returns 0 elements even for "featured"
    const [isDataLoaded, setIsDataLoaded] = useState(true);

    const supabase = createClient();
    const searchParams = useSearchParams();

    // Auto-search on mount if params are present
    useEffect(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (from) setFromInput(from);
        if (to) setToInput(to);
        
        if (from || to) {
            performSearch(from || '', to || '');
        }
    }, [searchParams]);

    const handleSwap = () => {
        const temp = fromInput;
        setFromInput(toInput);
        setToInput(temp);
    };

    const performSearch = async (start: string, dest: string) => {
        const cleanFrom = start.trim();
        const cleanTo = dest.trim();
        
        if (!cleanFrom && !cleanTo) {
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            let query = supabase.from('routes').select('*').eq('status', 'approved');

            if (cleanFrom && cleanTo) {
                query = query
                    .ilike('origin', `%${cleanFrom}%`)
                    .ilike('destination', `%${cleanTo}%`);
            } else if (cleanFrom) {
                query = query.ilike('origin', `%${cleanFrom}%`);
            } else if (cleanTo) {
                query = query.ilike('destination', `%${cleanTo}%`);
            }

            const { data, error } = await query.order('name', { ascending: true }).limit(50);
            
            if (error) throw error;
            setResults(data || []);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchClick = () => {
        performSearch(fromInput, toInput);
    };

    const handleFeaturedClick = (start: string, dest: string) => {
        setFromInput(start);
        setToInput(dest);
        performSearch(start, dest);
    };

    // Helper to get road condition rendering details
    const getConditionBadge = (condition?: string) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return { text: 'Fast', colorClass: styles.pillFast, dotClass: styles.dotClear, label: 'Clear' };
            case 'slow': return { text: 'Slow', colorClass: styles.pillBusy, dotClass: styles.dotSlow, label: 'Slow' };
            case 'blocked': return { text: 'Blocked', colorClass: styles.pillBlocked, dotClass: styles.dotBlocked, label: 'Blocked' };
            default: return null;
        }
    };

    const getConditionDot = (condition?: string) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return styles.dotClear;
            case 'slow': return styles.dotSlow;
            case 'blocked': return styles.dotBlocked;
            default: return styles.dotUnknown;
        }
    };

    const getConditionText = (condition?: string) => {
        switch (condition?.toLowerCase()) {
            case 'clear': return 'Clear';
            case 'slow': return 'Slow traffic';
            case 'blocked': return 'Blocked';
            default: return 'Unknown condition';
        }
    };

    // Fallbacks if data isn't backfilled yet
    const getEstimatedFare = (route: RouteData) => {
        if (route.fare_min && route.fare_max) return `₦${route.fare_min} - ₦${route.fare_max}`;
        if (route.fare_min) return `₦${route.fare_min}`;
        
        // Fallback to legs calculation
        if (route.legs && Array.isArray(route.legs)) {
             const sum = route.legs.reduce((acc, leg) => acc + (Number(leg.estimated_fare) || 0), 0);
             if (sum > 0) return `₦${sum}`;
        }
        return 'Est. unavailable';
    };

    const getEstimatedDuration = (route: RouteData) => {
        if (route.duration_minutes) return `${route.duration_minutes} min`;
        
        // Fallback to legs calculation
        if (route.legs && Array.isArray(route.legs)) {
             const sum = route.legs.reduce((acc, leg) => acc + (Number(leg.estimated_minutes) || 0), 0);
             if (sum > 0) return `${sum} min`;
        }
        return '--';
    };

    const getOriginDisplay = (origin?: string) => origin && origin !== 'undefined' ? origin : 'Unknown Origin';
    const getDestDisplay = (dest?: string) => dest && dest !== 'undefined' ? dest : 'Unknown Destination';

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
                    <div className={styles.inputInner}>
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            />
                            <button className={styles.swapBtn} onClick={handleSwap} aria-label="Swap locations" type="button">
                                <ArrowDownUp size={16} />
                            </button>
                        </div>

                        <div className={styles.inputGroupDivider}></div>

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
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            />
                        </div>
                    </div>
                </div>

                <button className={styles.submitBtn} onClick={handleSearchClick} disabled={isSearching} type="button">
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Find Route'}
                </button>

                {/* SECTION 3 & 4 - CONTENT AREA */}
                {!hasSearched ? (
                    <section>
                        <span className={styles.sectionLabel}>POPULAR ROUTES</span>
                        {featuredRoutes.length > 0 ? (
                            <div className={styles.popularGrid}>
                                {featuredRoutes.map((route) => {
                                    const badge = getConditionBadge(route.road_condition);
                                    
                                    return (
                                        <button 
                                            key={route.id} 
                                            className={styles.routeCard}
                                            onClick={() => handleFeaturedClick(getOriginDisplay(route.origin), getDestDisplay(route.destination))}
                                        >
                                            <div className={styles.cardHeader}>
                                                {badge ? (
                                                     <span className={`${styles.pill} ${badge.colorClass}`}>{badge.text}</span>
                                                ) : (
                                                     <span className={`${styles.pill} ${styles.pillPopular}`}>Popular</span>
                                                )}
                                            </div>
                                            <div className={styles.routeName}>
                                                {getOriginDisplay(route.origin)} <span className={styles.arrow}>→</span> {getDestDisplay(route.destination)}
                                            </div>
                                            <div className={styles.cardFooter}>
                                                <div className={styles.conditionRow}>
                                                    <div className={`${styles.dotStatus} ${getConditionDot(route.road_condition)}`}></div>
                                                    {getConditionText(route.road_condition)}
                                                </div>
                                                <div className={styles.metaText}>
                                                    {getEstimatedDuration(route)} • {getEstimatedFare(route)}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.loadingState}>
                                <p className={styles.emptySub}>Routes loading — check back shortly.</p>
                            </div>
                        )}
                    </section>
                ) : (
                    <section>
                        <div className={styles.resultsHeader}>
                            {isSearching ? 'Searching...' : `${results.length > 0 ? results.length : 'No'} routes found`}
                        </div>
                        
                        {results.length > 0 ? (
                            <div className={styles.resultsList}>
                                {results.map((route) => {
                                    return (
                                        <div key={route.id} className={styles.resultRow}>
                                            <div className={styles.resultMain}>
                                                <div className={styles.resultTitle}>
                                                    {getOriginDisplay(route.origin)} <span className={styles.arrow}>→</span> {getDestDisplay(route.destination)}
                                                </div>
                                                <div className={styles.resultMeta}>
                                                    <div className={`${styles.dotStatus} ${getConditionDot(route.road_condition)}`}></div>
                                                    {getConditionText(route.road_condition)}
                                                </div>
                                            </div>
                                            <div className={styles.resultStats}>
                                                <div className={styles.resultFare}>
                                                    {getEstimatedFare(route)}
                                                </div>
                                                <div className={styles.resultDuration}>
                                                    {getEstimatedDuration(route)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            !isSearching && (
                                <div className={styles.emptyState}>
                                    <h3 className={styles.emptyTitle}>Route not found yet</h3>
                                    <p className={styles.emptySub}>
                                        No routes found from <strong>"{fromInput || 'anywhere'}"</strong> to <strong>"{toInput || 'anywhere'}"</strong>.
                                    </p>
                                    
                                    <div className={styles.suggestBox}>
                                        <p className={styles.suggestText}>Are you an expert on this route? Help the community by mapping it.</p>
                                        <Link 
                                            href={`/suggest-route?from=${encodeURIComponent(fromInput)}&to=${encodeURIComponent(toInput)}`} 
                                            className={styles.primarySuggestBtn}
                                        >
                                            Suggest this route <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            )
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}
