import styles from '@/app/content-pages.module.css';

export default function HelpPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Help Center</h1>
            
            <div className={styles.content}>
                <p>
                    Find answers to common questions about using the DAL platform.
                </p>

                <h2>Frequently Asked Questions</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>How do I earn points?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            You earn points by suggesting routes, reporting road alerts, and participating in community verification. Check the <a href="/community" style={{ color: 'var(--color-gold)' }}>Community page</a> for a full breakdown.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>What is "Verified" status?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            When a route or alert is submitted, our community and moderators review it for accuracy. Once confirmed, it receives a "Verified" badge and becomes a trusted data point for all users.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>How do I report a false route?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            You can flag any route for review by clicking the "Report" button on the route details page. Our team will investigate immediately.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '64px', padding: '32px', background: 'var(--card-bg)', borderRadius: '24px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 12px' }}>Still need help?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Our support team is available 24/7.</p>
                    <a href="/contact" style={{ display: 'inline-block', padding: '12px 32px', background: 'var(--brand-gold)', color: '#000', borderRadius: '12px', fontWeight: 800, textDecoration: 'none' }}>Contact Support</a>
                </div>
            </div>
        </div>
    );
}
