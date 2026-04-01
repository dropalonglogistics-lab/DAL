'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Navigation, Loader, X } from 'lucide-react';
import styles from './RouteSearch.module.css';

const VEHICLE_ICONS: Record<string, string> = {
    keke: '🛺', taxi: '🚕', shuttle: '🚐', 'keke bus': '🚐', bus: '🚌', bike: '🏍️', walk: '🚶',
};

type Area = string;

function fuzzyMatch(query: string, areas: Area[]): Area[] {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return areas.filter(a => a.toLowerCase().includes(q)).slice(0, 8);
}

export default function RouteSearch({ showTitle = true }: { showTitle?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [start_location, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [areas, setAreas] = useState<Area[]>([]);
    const [originSugg, setOriginSugg] = useState<Area[]>([]);
    const [destSugg, setDestSugg] = useState<Area[]>([]);
    const [geoLoading, setGeoLoading] = useState(false);
    const [activeField, setActiveField] = useState<'start_location' | 'destination' | null>(null);

    const originRef = useRef<HTMLInputElement>(null);
    const destRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setOrigin(searchParams.get('start_location') || '');
        setDestination(searchParams.get('destination') || '');
    }, [searchParams]);

    useEffect(() => {
        fetch('/ph-areas.json').then(r => r.json()).then(setAreas).catch(() => { });
    }, []);

    const handleOriginChange = (val: string) => {
        setOrigin(val);
        setOriginSugg(val.length >= 2 ? fuzzyMatch(val, areas) : []);
    };

    const handleDestChange = (val: string) => {
        setDestination(val);
        setDestSugg(val.length >= 2 ? fuzzyMatch(val, areas) : []);
    };

    const handleNearMe = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported in your browser.'); return; }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            () => {
                // In production this would reverse-geocode via Mapbox / Google
                // For now, use closest PH area name as placeholder
                setOrigin('My Location (PH)');
                setOriginSugg([]);
                setGeoLoading(false);
            },
            () => {
                alert('Unable to detect location. Please enable location permissions.');
                setGeoLoading(false);
            },
            { timeout: 8000 }
        );
    };

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        if (start_location.trim()) params.set('start_location', start_location.trim());
        if (destination.trim()) params.set('destination', destination.trim());
        router.push(`/search?${params.toString()}`);
    };

    const handleClear = () => {
        setOrigin('');
        setDestination('');
        setOriginSugg([]);
        setDestSugg([]);
        router.push('/');
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!originRef.current?.parentElement?.contains(e.target as Node) &&
                !destRef.current?.parentElement?.contains(e.target as Node)) {
                setOriginSugg([]);
                setDestSugg([]);
                setActiveField(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const SuggList = ({ items, onSelect }: { items: Area[]; onSelect: (a: Area) => void }) =>
        items.length === 0 ? null : (
            <div className={styles.suggList}>
                {items.map(a => (
                    <button key={a} className={styles.suggItem} onMouseDown={() => onSelect(a)}>
                        <MapPin size={12} style={{ flexShrink: 0, color: 'var(--color-gold)' }} />
                        {a}
                    </button>
                ))}
            </div>
        );

    return (
        <form id="search" className={`${styles.container} ${!showTitle ? styles.compact : ''}`} onSubmit={handleSearch}>
            {showTitle && <h2 className={styles.title}>Where to?</h2>}

            {/* Origin Field */}
            <div className={styles.fieldWrap}>
                <div className={styles.inputGroup}>
                    <div className={styles.iconWrapper}>
                        <MapPin size={20} className={styles.startIcon} />
                    </div>
                    <input
                        ref={originRef}
                        type="text"
                        placeholder="Start location"
                        className={styles.input}
                        value={start_location}
                        autoComplete="off"
                        onChange={(e) => handleOriginChange(e.target.value)}
                        onFocus={() => setActiveField('start_location')}
                    />
                    {/* Near Me button */}
                    <button
                        type="button"
                        className={styles.nearMeBtn}
                        onClick={handleNearMe}
                        title="Use my location"
                        disabled={geoLoading}
                    >
                        {geoLoading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Navigation size={15} />}
                        <span className={styles.nearMeLabel}>Near Me</span>
                    </button>
                </div>
                <SuggList items={originSugg} onSelect={(a) => { setOrigin(a); setOriginSugg([]); destRef.current?.focus(); }} />
            </div>

            {showTitle && (
                <div className={styles.dots}>
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                </div>
            )}

            {/* Destination Field */}
            <div className={styles.fieldWrap}>
                <div className={styles.inputGroup}>
                    <div className={styles.iconWrapper}>
                        <MapPin size={20} className={styles.endIcon} />
                    </div>
                    <input
                        ref={destRef}
                        type="text"
                        placeholder="Destination"
                        className={styles.input}
                        value={destination}
                        autoComplete="off"
                        onChange={(e) => handleDestChange(e.target.value)}
                        onFocus={() => setActiveField('destination')}
                    />
                    {destination && (
                        <button type="button" className={styles.clearFieldBtn} onClick={() => { setDestination(''); setDestSugg([]); }}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <SuggList items={destSugg} onSelect={(a) => { setDestination(a); setDestSugg([]); }} />
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.searchBtn}>
                    <Search size={20} />
                    {showTitle ? 'Find Best Route' : 'Search'}
                </button>
                {(start_location || destination) && showTitle && (
                    <button type="button" className={styles.clearBtn} onClick={handleClear}>
                        Reset Search
                    </button>
                )}
            </div>
        </form>
    );
}
