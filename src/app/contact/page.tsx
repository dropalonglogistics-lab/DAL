import styles from '@/app/content-pages.module.css';

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Contact Us</h1>
            
            <div className={styles.content}>
                <p>
                    Have a question or feedback? We'd love to hear from you.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '48px' }}>
                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
                        <h3 style={{ margin: '0 0 24px' }}>Send a Message</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name</label>
                                <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
                                <input type="email" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Message</label>
                                <textarea rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#111', border: '1px solid #333', color: '#fff' }} />
                            </div>
                            <button disabled style={{ padding: '14px', borderRadius: '8px', background: 'var(--brand-gold)', color: '#000', fontWeight: 800, border: 'none', opacity: 0.7 }}>Send Message</button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <h4 style={{ color: 'var(--color-gold)', margin: '0 0 8px' }}>Email</h4>
                            <p style={{ margin: 0 }}>hello@dropalonglogistics.com</p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--color-gold)', margin: '0 0 8px' }}>Office</h4>
                            <p style={{ margin: 0 }}>Port Harcourt, Rivers State, Nigeria</p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--color-gold)', margin: '0 0 8px' }}>Social</h4>
                            <p style={{ margin: 0 }}>@dropalong on X and Instagram</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
