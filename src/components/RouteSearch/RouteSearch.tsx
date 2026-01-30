'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import styles from './RouteSearch.module.css';

export default function RouteSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');

    useEffect(() => {
        // Sync state with URL params on mount/update
        setOrigin(searchParams.get('origin') || '');
        setDestination(searchParams.get('destination') || '');
    }, [searchParams]);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (origin) params.set('origin', origin);
        if (destination) params.set('destination', destination);

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Where to?</h2>

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

            <div className={styles.dots}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
            </div>

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


            <button className={styles.searchBtn} onClick={handleSearch}>
                <Search size={20} />
                Find Best Route
            </button>
        </div>
    );
}
