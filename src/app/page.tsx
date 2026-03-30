import { 
    Search, MapPin, Package, ShoppingCart, 
    ArrowRight, MessageCircle, Shield, 
    TrafficCone, AlertTriangle, Check, X,
    TrendingUp, Users, Star, BarChart3,
    ShieldCheck, Zap, CreditCard, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import RouteSearch from '@/components/RouteSearch/RouteSearch';
import HomeTicker from '@/components/HomeTicker';
import { createClient } from '@/utils/supabase/server';
import styles from './page.module.css';
import LiveStatsRow from '@/components/Home/LiveStatsRow';
import AnimatedCityGrid from '@/components/Home/AnimatedCityGrid';

export const dynamic = 'force-dynamic';

function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

export default async function Home() {
    const supabase = await createClient();

    // Fetch 3 most recent alerts
    const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    // Fetch platform configuration
    const { data: configData } = await supabase
        .from('platform_config')
        .select('key, value')
        .in('key', ['f2_express_live', 'f3_shopper_live']);
    
    const isF2Live = configData?.find(c => c.key === 'f2_express_live')?.value === 'true';
    const isF3Live = configData?.find(c => c.key === 'f3_shopper_live')?.value === 'true';

    // Fetch top 3 leaderboard for social proof
    const { data: topUsers } = await supabase
        .from('profiles')
        .select('full_name, points, avatar_url')
        .not('points', 'is', null)
        .order('points', { ascending: false })
        .limit(3);

    return (
        <div className={styles.page}>
            <HomeTicker />

            {/* SECTION 1 — HERO */}
            <section className={styles.hero}>
                <div className={styles.heroLeft}>
                    <span className={styles.eyebrow}>Port Harcourt&apos;s Intelligence Layer</span>
                    <h1 className={styles.heroTitle}>Move Smarter. Deliver Faster. Stress Less.</h1>
                    <p className={styles.heroSub}>
                        Community-powered routing, same-hour delivery, and personal shopping — 
                        all in one platform built for Port Harcourt.
                    </p>
                    <div className={styles.heroCTAs}>
                        <Link href="/signup" className={styles.ctaPrimary}>Get Started Free</Link>
                        <Link href="/about" className={styles.ctaGhost}>See How It Works</Link>
                    </div>
                    <LiveStatsRow />
                </div>
                <div className={styles.heroRight}>
                    <AnimatedCityGrid />
                </div>
            </section>

            {/* SECTION 2 — LIVE ROAD INTELLIGENCE */}
            <section className={styles.intelSection}>
                <div className={styles.intelHeader}>
                    <h2 className={styles.intelTitle}>What&apos;s Happening Right Now</h2>
                    <span className={styles.intelSub}>Community-reported, in real time</span>
                </div>
                
                <div className={styles.intelLayout}>
                    <div className={styles.alertsColumn}>
                        {alerts?.map((alert) => (
                            <div key={alert.id} className={styles.alertCard}>
                                <div className={styles.alertIconLarge}>
                                    {alert.type === 'police' ? <Shield size={32} /> :
                                     alert.type === 'traffic' ? <TrafficCone size={32} /> :
                                     <AlertTriangle size={32} />}
                                </div>
                                <div className={styles.alertInfo}>
                                    <div className={styles.alertArea}>{alert.area || 'Unknown Area'}</div>
                                    <p className={styles.alertDesc}>{alert.description}</p>
                                    <div className={styles.alertMeta}>
                                        <span>{timeAgo(alert.created_at)}</span>
                                        <div className={styles.upvoteCount}>
                                            <TrendingUp size={14} /> {alert.upvotes || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Link href="/alerts" className={styles.seeAllLink}>
                            See All Alerts <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className={styles.searchWidgetWrapper}>
                        <div className={styles.searchWidget}>
                            <h3>Find Route</h3>
                            <RouteSearch showTitle={false} />
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3 — THREE FEATURES */}
            <section className={styles.featuresSection}>
                <div className={styles.featuresGrid}>
                    {/* F1 ROUTING */}
                    <Link href="/search" className={`${styles.featureCard} ${styles.cardBlack}`}>
                        <div className={styles.featureIcon}><MapPin size={40} color="var(--primary-gold)" /></div>
                        <div>
                            <h3>F1 Routing</h3>
                            <p>Real-time transit optimization for Keke, Taxi, and Buses.</p>
                        </div>
                        <div className={styles.cardCTA}>Find a Route <ArrowRight size={16} /></div>
                    </Link>

                    {/* F2 EXPRESS */}
                    <div className={`${styles.featureCard} ${styles.cardGold}`}>
                        <div className={styles.featureIcon}><Package size={40} color="#000" /></div>
                        <div>
                            <h3>F2 Express</h3>
                            <p>Reliable same-hour delivery across Port Harcourt.</p>
                        </div>
                        {isF2Live ? (
                            <Link href="/express" className={styles.cardCTA} style={{color: '#000'}}>Order a Delivery <ArrowRight size={16} /></Link>
                        ) : (
                            <>
                                <span className={styles.comingSoon}>Coming Soon</span>
                                <Link href="/express/notify" className={styles.cardCTA} style={{color: '#000'}}>Notify Me <ArrowRight size={16} /></Link>
                            </>
                        )}
                    </div>

                    {/* F3 SHOPPER */}
                    <div className={`${styles.featureCard} ${styles.cardBlack}`}>
                        <div className={styles.featureIcon}><ShoppingCart size={40} color="var(--primary-gold)" /></div>
                        <div>
                            <h3>F3 Shopper</h3>
                            <p>Personal shopping and errand runners at your service.</p>
                        </div>
                        {isF3Live ? (
                            <Link href="/shopper" className={styles.cardCTA}>Shop Now <ArrowRight size={16} /></Link>
                        ) : (
                            <>
                                <span className={styles.comingSoon}>Coming Soon</span>
                                <Link href="/shopper/notify" className={styles.cardCTA}>Notify Me <ArrowRight size={16} /></Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* SECTION 4 — FOR BUSINESSES */}
            <section className={styles.businessSection}>
                <div className={styles.businessLeft}>
                    <h2 className={styles.businessTitle}>Your Digital Storefront. PH-Wide Reach.</h2>
                    <Link href="/list-your-business" className={styles.ctaPrimary}>List Your Business Free <ChevronRight size={18} style={{display: 'inline', marginLeft: '4px'}} /></Link>
                </div>
                <div className={styles.businessRight}>
                    <div className={styles.businessStats}>
                        <div className={styles.bStat}>
                            <span className={styles.bStatValue}>500+</span>
                            <span className={styles.bStatLabel}>Local Partners</span>
                        </div>
                        <div className={styles.bStat}>
                            <span className={styles.bStatValue}>PH-Wide</span>
                            <span className={styles.bStatLabel}>Delivery Core</span>
                        </div>
                        <div className={styles.bStat}>
                            <span className={styles.bStatValue}>0%</span>
                            <span className={styles.bStatLabel}>Listing Fees</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 — PREMIUM PITCH */}
            <section className={styles.premiumSection}>
                <span className={styles.premiumBadge}>DAL PREMIUM</span>
                <h2 className={styles.premiumTitle}>Everything Better with DAL Premium</h2>
                
                <div className={styles.comparisonWrapper}>
                    <table className={styles.comparisonTable}>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Free</th>
                                <th>Premium (₦700/mo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Real-time Routing</td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                            </tr>
                            <tr>
                                <td>Community Alerts</td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                            </tr>
                            <tr>
                                <td>Priority Matching</td>
                                <td><X className={styles.crossIcon} size={18} /></td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                            </tr>
                            <tr>
                                <td>WhatsApp Full Access</td>
                                <td><X className={styles.crossIcon} size={18} /></td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                            </tr>
                            <tr>
                                <td>Fare Diagnostics</td>
                                <td><X className={styles.crossIcon} size={18} /></td>
                                <td><Check className={styles.checkIcon} size={18} /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Link href="/premium" className={styles.upgradeBtnLarge}>Upgrade Now</Link>
            </section>

            {/* SECTION 6 — SOCIAL PROOF */}
            <section className={styles.socialSection}>
                <h2 className={styles.testimonialsTitle}>Built by Port Harcourt, for Port Harcourt</h2>
                
                <div className={styles.testimonialGrid}>
                    <div className={styles.testimonialCard}>
                        <p className={styles.quote}>&quot;DAL changed how I move from Choba to Town. No more guessing fares.&quot;</p>
                        <div className={styles.author}>
                            <div className={styles.authorAvatar} />
                            <span>Emeka O.</span>
                        </div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <p className={styles.quote}>&quot;As a business owner, the F2 Express layer is a lifesaver for our deliveries.&quot;</p>
                        <div className={styles.author}>
                            <div className={styles.authorAvatar} />
                            <span>Sarah W.</span>
                        </div>
                    </div>
                    <div className={styles.testimonialCard}>
                        <p className={styles.quote}>&quot;The community alerts saved me from a 2-hour jam at Waterlines.&quot;</p>
                        <div className={styles.author}>
                            <div className={styles.authorAvatar} />
                            <span>Tunde A.</span>
                        </div>
                    </div>
                </div>

                <div className={styles.leaderboardTeaser}>
                    <h3 style={{fontFamily: 'var(--font-heading)', marginBottom: '24px'}}>Top Community Contributors</h3>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px'}}>
                        {topUsers?.map((user, i) => (
                            <div key={user.full_name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px'}}>
                                    {i + 1}
                                </div>
                                <span style={{fontWeight: '700', fontSize: '0.9rem'}}>{user.full_name.split(' ')[0]}</span>
                                <span style={{fontSize: '0.8rem', color: '#666'}}>{user.points} pts</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/community" className={styles.seeAllLink} style={{justifyContent: 'center'}}>
                        See Full Leaderboard <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* SECTION 7 — WHATSAPP STRIP */}
            <section className={styles.whatsappStrip}>
                <div>
                    <span className={styles.waText}>DAL is also on WhatsApp. Access everything in one chat.</span>
                    <span className={styles.waSub}>Full access — Premium feature</span>
                </div>
                <Link href="https://wa.me/234XXXXXXXXXX" className={styles.waButton}>
                    <MessageCircle size={24} />
                    Chat Now
                </Link>
            </section>
        </div>
    );
}
