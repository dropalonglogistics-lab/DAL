'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
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
}

export default function SearchPageClient({ featuredRoutes }: { featuredRoutes: RouteData[] }) {
    const [fromInput, setFromInput] = useState('');
    const [toInput, setToInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [results, setResults] = useState<RouteData[]>([]);
    const supabase = createClient();

    const getLegsInfo = (legs: RouteData['legs']) => {
        if (!legs || !Array.isArray(legs)) return { fare: 0, minutes: 0 };
        return legs.reduce((acc, leg) => ({
            fare: acc.fare + (Number(leg.estimated_fare) || 0),
            minutes: acc.minutes + (Number(leg.estimated_minutes) || 0)
        }), { fare: 0, minutes: 0 });
    };

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
                id, name, origin, destination, legs
            `).eq('status', 'approved');

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

    const handleFeaturedClick = (start: string, dest: string) => {
        setFromInput(start);
        setToInput(dest);
        performDirectSearch(start, dest);
    };

    const performDirectSearch = async (start: string, dest: string) => {
        setIsSearching(true);
        setHasSearched(true);
        try {
            const { data } = await supabase.from('routes')
                .select('*')
                .eq('status', 'approved')
                .ilike('origin', `%${start}%`)
                .ilike('destination', `%${dest}%`)
                .limit(50);
            setResults(data || []);
        } finally {
            setIsSearching(false);
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
                                {featuredRoutes.map((route) => {
                                    const info = getLegsInfo(route.legs);
                                    return (
                                        <button 
                                            key={route.id} 
                                            className={styles.routeCard}
                                            onClick={() => handleFeaturedClick(route.origin, route.destination)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <span className={styles.pillPopular}>Popular</span>
                                            </div>
                                            <div className={styles.routeName}>
                                                {route.origin} <span className={styles.arrow}>→</span> {route.destination}
                                            </div>
                                            <div className={styles.cardFooter}>
                                                <div className={styles.conditionRow}>
                                                    <div className={`${styles.dotStatus} ${styles.dotClear}`}></div>
                                                    Active
                                                </div>
                                                <div className={styles.metaText}>
                                                    {info.minutes}m • ₦{info.fare}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
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
                                {results.map((route) => {
                                    const info = getLegsInfo(route.legs);
                                    return (
                                        <div key={route.id} className={styles.resultRow}>
                                            <div className={styles.resultMain}>
                                                <div className={styles.resultTitle}>
                                                    {route.origin} <span className={styles.arrow}>→</span> {route.destination}
                                                </div>
                                                <div className={styles.resultMeta}>
                                                    <div className={`${styles.dotStatus} ${styles.dotClear}`}></div>
                                                    Active
                                                </div>
                                            </div>
                                            <div className={styles.resultStats}>
                                                <div className={styles.resultFare}>
                                                    ₦{info.fare}
                                                </div>
                                                <div className={styles.resultDuration}>
                                                    {info.minutes} mins
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
