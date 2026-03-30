import styles from '@/app/content-pages.module.css';

export default function CareersPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Join the Network</h1>
            <span className={styles.lastUpdated}>Build the future of Port Harcourt mobility.</span>
            
            <div className={styles.content}>
                <p>
                    Drop Along Logistics is more than a platform; it&apos;s a mission-driven organization built by the people who move our city. We are looking for individuals who share our passion for intelligent urban mobility.
                </p>

                <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {/* Role 1 */}
                    <div style={{ background: '#111111', border: '0.5px solid #1E1E1E', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#C9A227', margin: 0 }}>Express Rider (F2)</h3>
                            <span style={{ fontSize: '10px', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '4px 10px', borderRadius: '20px', border: '0.5px solid rgba(76, 175, 80, 0.3)' }}>Hiring Now</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                            Join our core delivery team. We offer guaranteed hourly pay, safety equipment, and a roadmap to asset ownership. Must have a valid bike license and expert knowledge of PH roads.
                        </p>
                        <a href="mailto:careers@dropalonglogistics.com" style={{ fontSize: '13px', color: '#FFFFFF', textDecoration: 'none', borderBottom: '1px solid #C9A227', paddingBottom: '2px' }}>Apply via Email →</a>
                    </div>

                    {/* Role 2 */}
                    <div style={{ background: '#111111', border: '0.5px solid #1E1E1E', borderRadius: '12px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>Intelligence Contributor</h3>
                            <span style={{ fontSize: '10px', background: 'rgba(201, 162, 39, 0.1)', color: '#C9A227', padding: '4px 10px', borderRadius: '20px', border: '0.5px solid rgba(201, 162, 39, 0.3)' }}>Community</span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                            Help us map the city. Intelligence contributors identify new routes, verify fare averages, and maintain the accuracy of our road alerts. Earn points and climb the monthly leaderboards.
                        </p>
                        <a href="/signup" style={{ fontSize: '13px', color: '#FFFFFF', textDecoration: 'none', borderBottom: '1px solid #C9A227', paddingBottom: '2px' }}>Join the Community Hub →</a>
                    </div>

                </div>

                <div style={{ marginTop: '60px', padding: '32px', background: '#0A0A0A', border: '0.5px solid #1E1E1E', borderRadius: '12px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Partner with DAL</h2>
                    <p style={{ fontSize: '14px', color: '#666', maxWidth: '480px', margin: '0 auto 24px' }}>
                        Own a fleet of kekes or buses? Let&apos;s talk about integrating your operations into the DAL Intelligence Layer.
                    </p>
                    <a href="/contact" style={{ display: 'inline-block', backgroundColor: '#C9A227', color: '#0D0D0D', padding: '12px 24px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>Contact Partnership Team</a>
                </div>
            </div>
        </div>
    );
}
