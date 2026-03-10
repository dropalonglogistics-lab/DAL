import Image from 'next/image';
import Link from 'next/link';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children }) {
    return (
        <div className={styles.authRoot}>
            {/* Dot-grid background */}
            <div className={styles.dotGrid} aria-hidden="true" />

            <div className={styles.authCard}>
                {/* Logo centred at top */}
                <div className={styles.authLogo}>
                    <Link href="/">
                        <img
                            src="/dal-logo-light.png"
                            alt="Drop Along Logistics"
                            className={styles.authImage}
                        />
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
