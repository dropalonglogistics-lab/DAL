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
                        <Image
                            src="/dal-logo.png"
                            alt="Drop Along Logistics"
                            height={44}
                            width={176}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
