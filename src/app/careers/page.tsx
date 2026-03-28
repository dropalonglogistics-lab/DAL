import styles from '@/app/content-pages.module.css';

export default function CareersPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Careers</h1>
            
            <div className={styles.content}>
                <p>
                    Help us build the future of urban mobility in Nigeria.
                </p>

                <h2>Open Roles</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Community Lead</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 700 }}>Full-time</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px' }}>
                            Drive growth and engagement within our contributor community in Port Harcourt.
                        </p>
                        <button style={{ background: 'none', border: '1px solid var(--border)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>View Details</button>
                    </div>

                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', opacity: 0.6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Software Engineer (Mobile)</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Coming Soon</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0' }}>
                            Help us scale the DAL mobile experience to millions.
                        </p>
                    </div>
                </div>

                <p style={{ marginTop: '48px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Don't see a role for you? Send your CV to <strong>careers@dropalonglogistics.com</strong>
                </p>
            </div>
        </div>
    );
}
