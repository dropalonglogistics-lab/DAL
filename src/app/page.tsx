import { Search, Navigation, Users, Bell, Shield, Info, MapPin, AlertTriangle, TrafficCone, Coins, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import RouteResultCard from '@/components/RouteResults/RouteResultCard';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const supabase = await createClient();

    // Fetch alerts for "Highlights"
    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);

    // Fetch community stats
    const { count: communityCount } = await supabase
        .from('community_routes')
        .select('*', { count: 'exact', head: true });

    return (
        <div className={styles.pageContainer}>
            <section className={styles.searchSection}>
                <div className={styles.heroText}>
                    <h1>Move Smarter in Port Harcourt</h1>
                    <p>Intelligent road transit routing. No manual vehicle selection needed.</p>
                </div>

                <div className={styles.mainSearchWrapper}>
                    <RouteSearch />
                </div>

                <div className={styles.shortcuts}>
                    <div className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon}>
                            <Search size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Route Coverage</span>
                            <span className={styles.shortcutHighlight}>45+ active paths verified</span>
                        </div>
                    </div>
                    <Link href="/suggest-route" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                            <Navigation size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Report/Suggest</span>
                            <span className={styles.shortcutHighlight}>Help the community grow</span>
                        </div>
                    </Link>
                    <Link href="/community" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                            <Users size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Community Hub</span>
                            <span className={styles.shortcutHighlight}>{communityCount || 0} active locales</span>
                        </div>
                    </Link>
                    <Link href="/alerts" className={styles.shortcutCard}>
                        <div className={styles.shortcutIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <Bell size={24} />
                        </div>
                        <div className={styles.shortcutText}>
                            <span className={styles.shortcutLabel}>Live Alerts</span>
                            <span className={styles.shortcutHighlight}>{alerts?.length || 0} active incidents</span>
                        </div>
                    </Link>
                </div>

                <div className={styles.highlightsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Live Road Intelligence</h2>
                    </div>
                    <div className={styles.highlightsGrid}>
                        {alerts && alerts.length > 0 && alerts.map((alert) => (
                            <div key={alert.id} className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    {alert.type === 'police' ? <Shield size={20} /> :
                                        alert.type === 'traffic' ? <TrafficCone size={20} /> :
                                            <AlertTriangle size={20} />}
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Report</span>
                                    <p className={styles.highlightText}>{alert.description}</p>
                                    <span className={styles.highlightTime}>Just now</span>
                                </div>
                            </div>
                        ))}
                        {communityCount !== null && communityCount > 0 && (
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    <Users size={20} />
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>Community Hub</span>
                                    <p className={styles.highlightText}>{communityCount} crowd-sourced routes ready for exploration.</p>
                                    <span className={styles.highlightTime}>Always Learning</span>
                                </div>
                            </div>
                        )}
                        {(!alerts || alerts.length === 0) && (!communityCount || communityCount === 0) && (
                            <div className={styles.highlightCard}>
                                <div className={styles.highlightIcon}>
                                    <Info size={20} />
                                </div>
                                <div className={styles.highlightContent}>
                                    <span className={styles.highlightTitle}>Roads are Clear</span>
                                    <p className={styles.highlightText}>No major incidents reported in Port Harcourt right now.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Premium Teaser Section */}
            <section className={styles.premiumSection}>
                <div className={styles.premiumOverlay}></div>
                <div className={styles.premiumContent}>
                    <div className={styles.premiumHeader}>
                        <div className={`${styles.badgeWrapper} ${styles.premiumBanner}`}>
                            <Sparkles size={14} className={styles.sparkleIcon} />
                            <span className={styles.premiumBadge}>Coming Soon</span>
                        </div>
                        <h2 className={styles.premiumTitle}>Advanced Logistics Intelligence</h2>
                    </div>
                    <p className={styles.premiumDescription}>
                        Upgrade to <strong>DAL Premium</strong> for our most advanced data layer.
                        Get real-time traffic heatmaps, predictive fare analytics, and priority route intelligence.
                    </p>
                    <div className={styles.premiumFeatures}>
                        <div className={styles.pFeature}>
                            <div className={styles.pFeatureIcon}><Shield size={18} /></div>
                            <div className={styles.pFeatureText}>
                                <strong>Priority Alerts</strong>
                                <span>Real-time hazard updates</span>
                            </div>
                        </div>
                        <div className={styles.pFeature}>
                            <div className={styles.pFeatureIcon}><Navigation size={18} /></div>
                            <div className={styles.pFeatureText}>
                                <strong>Smart Routing</strong>
                                <span>Traffic-optimized paths</span>
                            </div>
                        </div>
                        <div className={styles.pFeature}>
                            <div className={styles.pFeatureIcon}><Coins size={18} /></div>
                            <div className={styles.pFeatureText}>
                                <strong>Fare Analytics</strong>
                                <span>Price auditing & trends</span>
                            </div>
                        </div>
                    </div>
                    <button className={styles.waitlistBtn} disabled>
                        Join the Premium Waitlist <ChevronRight size={18} />
                    </button>
                </div>
                <div className={styles.premiumVisual}>
                    <div className={styles.visualContainer}>
                        <div className={`${styles.floatingElement} ${styles.float1}`}></div>
                        <div className={`${styles.floatingElement} ${styles.float2}`}></div>
                        <div className={styles.glassCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardCircle}></div>
                                <div className={styles.cardLine}></div>
                            </div>
                            <div className={styles.shimmerLine}></div>
                            <div className={styles.shimmerLine} style={{ width: '70%', marginTop: '12px' }}></div>
                            <div className={styles.shimmerLine} style={{ width: '40%', marginTop: '12px' }}></div>
                            <div className={styles.cardStats}>
                                <div className={styles.statMini}></div>
                                <div className={styles.statMini}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
