import styles from '@/app/content-pages.module.css';

export default function BlogPlaceholder() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>DAL Blog</h1>
            
            <div className={styles.content}>
                <p>
                    Insights on urban mobility, platform updates, and community stories.
                </p>

                <div style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.2)', borderRadius: '24px', padding: '48px 32px', textAlign: 'center', marginTop: '48px' }}>
                    <h2 style={{ margin: '0 0 12px' }}>Coming Soon</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px' }}>
                        We're currently preparing our first batch of insights. Subscribe to get notified.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
                        <input type="email" placeholder="Your email address" style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: '#111', border: '1px solid #333', color: '#fff' }} />
                        <button style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--brand-gold)', color: '#000', fontWeight: 800, border: 'none' }}>Subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
