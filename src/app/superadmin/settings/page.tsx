'use client';

import { useState } from 'react';
import { Settings, CreditCard, Percent, Award, ToggleRight, Rocket, Map, Save, Navigation, Hand } from 'lucide-react';
import styles from './Settings.module.css';

export default function PlatformSettingsPage() {
    const [pricing, setPricing] = useState({
        baseFee: '1500', perKm: '100', premiumFull: '3000', premiumDiscount: '2000', businessListing: '5000'
    });
    const [commissions, setCommissions] = useState({
        rider: '85', marketplace: '5', errandMin: '500', errandMax: '5000'
    });
    const [points, setPoints] = useState({
        route: '50', alert: '10', order: '5', referral: '200', redemptionTarget: '500', redemptionValue: '200'
    });

    const [flags, setFlags] = useState({
        f1Routing: true, f2Express: false, f3Shopper: false, whatsappBot: true,
        newReg: true, bizApp: true, riderApp: true, errandApp: false, driverApp: true
    });

    const [launchExpress, setLaunchExpress] = useState({
        status: 'coming_soon', waitlist: 1245, message: 'DAL Express Delivery is now LIVE in Port Harcourt! Order your first delivery today: https://dal.app/express'
    });

    const [launchShopper, setLaunchShopper] = useState({
        status: 'coming_soon', waitlist: 802, message: 'DAL Personal Shopper is now LIVE in Port Harcourt! Let us do the shopping for you: https://dal.app/shopper'
    });

    const [adminLaunchControl, setAdminLaunchControl] = useState(false);

    // Modal states for Launch Confirmations
    const [showLaunchModal, setShowLaunchModal] = useState<string | null>(null);

    const handleSave = (section: string) => {
        alert(`${section} settings saved successfully.`);
    };

    const confirmLaunch = (moduleCode: string) => {
        if (moduleCode === 'F2') {
            setLaunchExpress({ ...launchExpress, status: 'live' });
            setFlags({ ...flags, f2Express: true });
        }
        if (moduleCode === 'F3') {
            setLaunchShopper({ ...launchShopper, status: 'live' });
            setFlags({ ...flags, f3Shopper: true });
        }
        setShowLaunchModal(null);
        alert(`Successfully launched ${moduleCode}! Waitlist users will be notified.`);
    };

    const deactivateLaunch = (moduleCode: string) => {
        if (confirm(`Are you sure you want to deactivate ${moduleCode}? This sets it back to "Coming Soon".`)) {
            if (moduleCode === 'F2') {
                setLaunchExpress({ ...launchExpress, status: 'coming_soon' });
                setFlags({ ...flags, f2Express: false });
            }
            if (moduleCode === 'F3') {
                setLaunchShopper({ ...launchShopper, status: 'coming_soon' });
                setFlags({ ...flags, f3Shopper: false });
            }
        }
    };

    const toggleFlag = (key: keyof typeof flags) => setFlags(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Platform Settings</h1>
                    <p className={styles.subtitle}>Configure core economic levers, access features, and app mechanics.</p>
                </div>
            </div>

            {/* SECTION 1: PRICING */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><CreditCard size={20} /> Pricing Models</h2>
                        <p className={styles.sectionDesc}>Adjust base fees and subscription costs across the platform.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button className={styles.saveBtn} onClick={() => handleSave('Pricing')}>Save Changes</button>
                        <div className={styles.lastUpdated}>Last updated by Christopher E. at 10:00 AM</div>
                    </div>
                </div>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Delivery Base Fee</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={pricing.baseFee} onChange={e => setPricing({ ...pricing, baseFee: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Per-Kilometer Rate</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={pricing.perKm} onChange={e => setPricing({ ...pricing, perKm: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>User Premium (Full Price)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix} ${styles.hasSuffix}`} value={pricing.premiumFull} onChange={e => setPricing({ ...pricing, premiumFull: e.target.value })} />
                            <span className={styles.suffix}>/mo</span>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>User Premium (Discounted)</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix} ${styles.hasSuffix}`} value={pricing.premiumDiscount} onChange={e => setPricing({ ...pricing, premiumDiscount: e.target.value })} />
                            <span className={styles.suffix}>/mo</span>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Business Listing Plan</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix} ${styles.hasSuffix}`} value={pricing.businessListing} onChange={e => setPricing({ ...pricing, businessListing: e.target.value })} />
                            <span className={styles.suffix}>/mo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: COMMISSIONS */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><Percent size={20} /> Commission Structures</h2>
                        <p className={styles.sectionDesc}>Define the platform cut and payout percentages.</p>
                    </div>
                    <div>
                        <button className={styles.saveBtn} onClick={() => handleSave('Commissions')}>Save Changes</button>
                        <div className={styles.lastUpdated}>Last updated by System at 00:00 AM</div>
                    </div>
                </div>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Rider Payout Rate (Slider)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="range" min="50" max="100" value={commissions.rider} onChange={e => setCommissions({ ...commissions, rider: e.target.value })} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
                            <span style={{ fontWeight: 600, width: '40px' }}>{commissions.rider}%</span>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Marketplace Sale Fee (Slider)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input type="range" min="0" max="30" value={commissions.marketplace} onChange={e => setCommissions({ ...commissions, marketplace: e.target.value })} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
                            <span style={{ fontWeight: 600, width: '40px' }}>{commissions.marketplace}%</span>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Errand Service Fee Floor</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={commissions.errandMin} onChange={e => setCommissions({ ...commissions, errandMin: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Errand Service Fee Ceiling</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.prefix}>₦</span>
                            <input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={commissions.errandMax} onChange={e => setCommissions({ ...commissions, errandMax: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: POINTS ECONOMY */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><Award size={20} /> Points Economy</h2>
                        <p className={styles.sectionDesc}>Set the gamification rules and point-to-naira values.</p>
                    </div>
                    <div>
                        <button className={styles.saveBtn} onClick={() => handleSave('Points')}>Save Changes</button>
                    </div>
                </div>
                <div className={styles.grid3}>
                    <div className={styles.inputGroup}>
                        <label>Per Route Suggestion</label>
                        <input type="number" className={styles.input} value={points.route} onChange={e => setPoints({ ...points, route: e.target.value })} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Per Alert Confirmation</label>
                        <input type="number" className={styles.input} value={points.alert} onChange={e => setPoints({ ...points, alert: e.target.value })} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Per Delivered Order</label>
                        <input type="number" className={styles.input} value={points.order} onChange={e => setPoints({ ...points, order: e.target.value })} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Successful Referral</label>
                        <input type="number" className={styles.input} value={points.referral} onChange={e => setPoints({ ...points, referral: e.target.value })} />
                    </div>
                </div>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Redemption Rate Exchange</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <div className={styles.inputWrapper}>
                                <input type="number" className={`${styles.input} ${styles.hasSuffix}`} value={points.redemptionTarget} onChange={e => setPoints({ ...points, redemptionTarget: e.target.value })} />
                                <span className={styles.suffix}>Pts =</span>
                            </div>
                        </div>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <div className={styles.inputWrapper}>
                                <span className={styles.prefix}>₦</span>
                                <input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={points.redemptionValue} onChange={e => setPoints({ ...points, redemptionValue: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 4: FEATURE FLAGS */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><ToggleRight size={20} /> Feature Flags</h2>
                        <p className={styles.sectionDesc}>Instantly toggle modules and registration flows across the app.</p>
                    </div>
                    <div>
                        <button className={styles.saveBtn} onClick={() => handleSave('Features')}>Save Changes</button>
                    </div>
                </div>
                <div className={styles.grid3}>
                    {Object.entries(flags).map(([key, value]) => {
                        const labels: Record<string, string> = {
                            f1Routing: 'F1 Routing Module', f2Express: 'F2 Express Delivery', f3Shopper: 'F3 Personal Shopper',
                            whatsappBot: 'WhatsApp Bot Integration', newReg: 'Allow New User Auth', bizApp: 'Accept Biz Applications',
                            riderApp: 'Accept Rider Applications', errandApp: 'Accept Errand Worker Apps', driverApp: 'Accept Driver Applications'
                        };
                        return (
                            <label key={key} className={styles.toggleCard}>
                                <div className={styles.toggleInfo}>
                                    <h4>{labels[key]}</h4>
                                    <p>{value ? 'Active' : 'Disabled'}</p>
                                </div>
                                <div className={styles.switch}>
                                    <input type="checkbox" checked={value} onChange={() => toggleFlag(key as keyof typeof flags)} />
                                    <span className={styles.slider}></span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 5: FEATURE LAUNCH CONTROLS */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><Rocket size={20} /> Feature Launch Controls</h2>
                        <p className={styles.sectionDesc}>Command center for launching massive new platform features.</p>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label className={styles.toggleCard} style={{ maxWidth: '400px' }}>
                        <div className={styles.toggleInfo}>
                            <h4>Standard Admins Can Launch</h4>
                            <p>Allow non-superadmins to flip these toggles.</p>
                        </div>
                        <div className={styles.switch}>
                            <input type="checkbox" checked={adminLaunchControl} onChange={() => setAdminLaunchControl(!adminLaunchControl)} />
                            <span className={styles.slider}></span>
                        </div>
                    </label>
                </div>

                <div className={styles.grid2}>
                    {/* Launch Card 1 */}
                    <div className={styles.launchCard}>
                        <div className={styles.launchHeader}>
                            <h3 style={{ margin: 0 }}>F2 Express Delivery</h3>
                            <div className={styles.launchStatusToggle}>
                                <span className={styles.statusLabel} style={{ color: launchExpress.status === 'coming_soon' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Coming Soon</span>
                                <div className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={launchExpress.status === 'live'}
                                        onChange={() => {
                                            if (launchExpress.status === 'live') deactivateLaunch('F2');
                                            else setShowLaunchModal('F2');
                                        }}
                                    />
                                    <span className={styles.slider}></span>
                                </div>
                                <span className={styles.statusLabel} style={{ color: launchExpress.status === 'live' ? 'var(--color-gold)' : 'var(--text-primary)' }}>Live</span>
                            </div>
                        </div>
                        <div className={styles.waitlistBadge}>
                            Waitlist: {launchExpress.waitlist.toLocaleString()} people waiting
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Launch Announcement Message</label>
                            <textarea
                                className={styles.textarea}
                                value={launchExpress.message}
                                onChange={e => setLaunchExpress({ ...launchExpress, message: e.target.value })}
                                disabled={launchExpress.status === 'live'}
                            />
                        </div>
                        <div className={styles.launchActions}>
                            <button className={styles.btnSecondary} onClick={() => alert("Preview:\n\n" + launchExpress.message)}>Preview Message</button>
                        </div>
                    </div>

                    {/* Launch Card 2 */}
                    <div className={styles.launchCard}>
                        <div className={styles.launchHeader}>
                            <h3 style={{ margin: 0 }}>F3 Personal Shopper</h3>
                            <div className={styles.launchStatusToggle}>
                                <span className={styles.statusLabel} style={{ color: launchShopper.status === 'coming_soon' ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Coming Soon</span>
                                <div className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={launchShopper.status === 'live'}
                                        onChange={() => {
                                            if (launchShopper.status === 'live') deactivateLaunch('F3');
                                            else setShowLaunchModal('F3');
                                        }}
                                    />
                                    <span className={styles.slider}></span>
                                </div>
                                <span className={styles.statusLabel} style={{ color: launchShopper.status === 'live' ? 'var(--color-gold)' : 'var(--text-primary)' }}>Live</span>
                            </div>
                        </div>
                        <div className={styles.waitlistBadge}>
                            Waitlist: {launchShopper.waitlist.toLocaleString()} people waiting
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Launch Announcement Message</label>
                            <textarea
                                className={styles.textarea}
                                value={launchShopper.message}
                                onChange={e => setLaunchShopper({ ...launchShopper, message: e.target.value })}
                                disabled={launchShopper.status === 'live'}
                            />
                        </div>
                        <div className={styles.launchActions}>
                            <button className={styles.btnSecondary} onClick={() => alert("Preview:\n\n" + launchShopper.message)}>Preview Message</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 6: SERVICE ZONES */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}><Map size={20} /> Operational Service Zones</h2>
                        <p className={styles.sectionDesc}>Define the active polygons where riders and errands can operate.</p>
                    </div>
                    <div>
                        <button className={styles.saveBtn} onClick={() => handleSave('Zones')}>Save Polygon Map</button>
                    </div>
                </div>
                <div className={styles.mapPlaceholder}>
                    <img src="https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/7.000,4.800,11/1000x400?access_token=pk.mock" alt="Mapbox preview" onError={(e) => (e.currentTarget.style.display = 'none')} />

                    <div className={styles.mapToolbar}>
                        <button title="Draw Polygon"><Hand size={18} /></button>
                        <button title="Edit Zones"><Settings size={18} /></button>
                        <button title="Center PH"><Navigation size={18} /></button>
                    </div>

                    <div style={{ zIndex: 5, textAlign: 'center' }}>
                        <Map size={48} color="var(--color-gold)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <h3 style={{ margin: 0, color: 'var(--color-gold)' }}>Mapbox Region Editor</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                            Interactive polygon drawing tool loaded here. (Mock representation for admin panel).
                            Active Zone: Greater Port Harcourt.
                        </p>
                    </div>
                </div>
            </div>

            {/* Launch Confirmation Modal */}
            {showLaunchModal && (
                <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface-card)', padding: '32px', borderRadius: '16px', maxWidth: '500px', width: '100%', border: '1px solid var(--color-primary)' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--color-gold)' }}>Confirm Massive Launch 🚀</h2>
                        <p>You are about to switch out of "Coming Soon" and set <strong>{showLaunchModal === 'F2' ? 'Express Delivery' : 'Personal Shopper'}</strong> to LIVE.</p>

                        <div style={{ margin: '24px 0', padding: '16px', background: 'rgba(67, 97, 238, 0.1)', borderRadius: '8px' }}>
                            <strong>This action will instantly:</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Enable {showLaunchModal} routing logic globally.</li>
                                <li>Email <strong>{showLaunchModal === 'F2' ? launchExpress.waitlist.toLocaleString() : launchShopper.waitlist.toLocaleString()}</strong> users on the waitlist.</li>
                                <li>Send WhatsApp blasts to Premium members on the waitlist.</li>
                                <li>Remove "Coming Soon" styling from the homepage.</li>
                            </ul>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className={styles.btnSecondary} onClick={() => setShowLaunchModal(null)}>Cancel</button>
                            <button className={styles.saveBtn} style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => confirmLaunch(showLaunchModal)}>Initialize Launch Sequence</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
