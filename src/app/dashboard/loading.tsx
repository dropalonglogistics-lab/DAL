import styles from './dashboard.module.css';

export default function DashboardLoading() {
    return (
        <div className={styles.page}>
            <div className={styles.greetingRow}>
                <div className="skeleton-text" style={{ width: '200px', height: '32px', marginBottom: '8px' }}></div>
                <div className="skeleton-text" style={{ width: '150px', height: '16px' }}></div>
            </div>

            <div className={styles.statsRow}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.statCard} style={{ opacity: 0.6 }}>
                        <div className="skeleton-circle" style={{ width: '36px', height: '36px', marginBottom: '12px' }}></div>
                        <div className="skeleton-text" style={{ width: '80%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeleton-text" style={{ width: '50%', height: '24px' }}></div>
                    </div>
                ))}
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: '32px' }}>
                <div className="skeleton-text" style={{ width: '150px', height: '24px' }}></div>
            </div>
            <div className={styles.card} style={{ height: '200px', opacity: 0.4 }}>
                <div className="skeleton-block" style={{ height: '100%' }}></div>
            </div>
        </div>
    );
}
