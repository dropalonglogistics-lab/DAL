import Link from 'next/link';
import Image from 'next/image';
import styles from './welcome.module.css';

export default function WelcomePage() {
    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.checkmark}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <Image
                    src="/dal-logo-dark.png"
                    alt="Drop Along Logistics"
                    height={40}
                    width={160}
                    style={{ objectFit: 'contain', marginBottom: 16 }}
                />
                <h1 className={styles.title}>You're all set!</h1>
                <p className={styles.subtitle}>
                    Your phone is verified. Welcome to the DAL community — Port Harcourt's smartest mobility platform.
                </p>
                <Link href="/" className={styles.ctaBtn}>
                    Explore DAL →
                </Link>
                <Link href="/profile" className={styles.secondaryLink}>
                    Set up your profile
                </Link>
            </div>
        </div>
    );
}
