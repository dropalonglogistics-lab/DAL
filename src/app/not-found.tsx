'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/layout/Footer';
import styles from './not-found.module.css';

export default function NotFound() {
    return (
        <>
            <Navbar />
            <main className={styles.container}>
                <h1 className={styles.title} style={{ fontFamily: "'Syne', sans-serif" }}>
                    404
                </h1>
                <p className={styles.subtitle}>
                    Looks like this route doesn't exist.
                </p>
                
                <div className={styles.btnGroup}>
                    <Link href="/" className={styles.primaryBtn}>
                        Go Home
                    </Link>
                    <Link href="/search" className={styles.secondaryBtn}>
                        Search a Route
                    </Link>
                </div>
            </main>
            <Footer />
        </>
    );
}
