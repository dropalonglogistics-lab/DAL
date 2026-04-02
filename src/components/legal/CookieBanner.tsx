'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CookieBanner.module.css';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('dal_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = (type: 'all' | 'essential') => {
        localStorage.setItem('dal_cookie_consent', type);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <Image
                    src="/favicon.ico"
                    alt="DAL"
                    width={24}
                    height={24}
                    style={{ borderRadius: '50%' }}
                />
                <p className={styles.text}>
                    DAL uses cookies to enhance your intelligence experience on our platform.{' '}
                    <Link href="/legal/cookies" className={styles.link}>
                        Learn more
                    </Link>.
                </p>
            </div>
            <div className={styles.actions}>
                <button 
                    onClick={() => handleAccept('essential')} 
                    className={styles.ghostBtn}
                >
                    Essential Only
                </button>
                <button 
                    onClick={() => handleAccept('all')} 
                    className={styles.primaryBtn}
                >
                    Accept All
                </button>
            </div>
        </div>
    );
}
