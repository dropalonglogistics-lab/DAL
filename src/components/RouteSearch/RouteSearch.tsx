'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import styles from './RouteSearch.module.css';

export default function RouteSearch({ showTitle = true }: { showTitle?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');

    useEffect(() => {
        setOrigin(searchParams.get('origin') || '');
        setDestination(searchParams.get('destination') || '');
    }, [searchParams]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        const trimmedOrigin = origin.trim();
        const trimmedDestination = destination.trim();

        if (trimmedOrigin) params.set('origin', trimmedOrigin);
        if (trimmedDestination) params.set('destination', trimmedDestination);

        router.push(`/search?${params.toString()}`);
    };

    const handleClear = () => {
        setOrigin('');
        setDestination('');
        router.push('/');
    };

    return (
        <form id="search" className={`${styles.container} ${!showTitle ? styles.compact : ''}`} onSubmit={handleSearch}>
            {showTitle && <h2 className={styles.title}>Where to?</h2>}

            <div className={styles.inputGroup}>
                <div className={styles.iconWrapper}>
                    <MapPin size={20} className={styles.startIcon} />
                </div>
                <input
                    type="text"
                    placeholder="Start location"
                    className={styles.input}
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                />
            </div>

            {showTitle && (
                <div className={styles.dots}>
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                    <div className={styles.dot} />
                </div>
            )}

            <div className={styles.inputGroup}>
                <div className={styles.iconWrapper}>
                    <MapPin size={20} className={styles.endIcon} />
                </div>
                <input
                    type="text"
                    placeholder="Destination"
                    className={styles.input}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
            </div>


            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.searchBtn}>
                    <Search size={20} />
                    {showTitle ? 'Find Best Route' : 'Search'}
                </button>
                {(origin || destination) && showTitle && (
                    <button type="button" className={styles.clearBtn} onClick={handleClear}>
                        Reset Search
                    </button>
                )}
            </div>
        </form>
    );
}
