import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import styles from '../../login/login.module.css'; // Reusing login styles for consistency

export default function AuthErrorPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div style={{ color: 'var(--color-error)', marginBottom: '16px' }}>
                        <AlertCircle size={48} style={{ margin: '0 auto' }} />
                    </div>
                    <h1 className={styles.title}>Authentication Error</h1>
                    <p className={styles.subtitle}>
                        Something went wrong during the authentication process.
                    </p>
                </div>

                <div className={styles.error} style={{ marginBottom: '24px' }}>
                    <p>Possible causes:</p>
                    <ul style={{ textAlign: 'left', marginTop: '8px', paddingLeft: '20px' }}>
                        <li>The confirmation link has expired.</li>
                        <li>The link has already been used.</li>
                        <li>Your account might not be fully set up yet.</li>
                    </ul>
                </div>

                <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} />
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}
