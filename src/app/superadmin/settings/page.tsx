'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, CreditCard, Percent, Award, ToggleRight, Rocket, Map, Loader, Check, Navigation, Hand } from 'lucide-react';
import styles from './Settings.module.css';

type ConfigSection = {
    value: Record<string, unknown>;
    updatedAt?: string;
    updatedByName?: string;
};

type Config = {
    pricing?: ConfigSection;
    commissions?: ConfigSection;
    points?: ConfigSection;
    flags?: ConfigSection;
    f2_launch?: ConfigSection;
    f3_launch?: ConfigSection;
    admin_launch_control?: ConfigSection;
};

const DEFAULT_PRICING = { baseFee: 1500, perKm: 100, premiumFull: 3000, premiumDiscount: 2000, businessListing: 5000 };
const DEFAULT_COMMISSIONS = { rider: 85, marketplace: 5, errandMin: 500, errandMax: 5000 };
const DEFAULT_POINTS = { route: 50, alert: 10, order: 5, referral: 200, redemptionTarget: 500, redemptionValue: 200 };
const DEFAULT_FLAGS = { f1Routing: true, f2Express: false, f3Shopper: false, whatsappBot: true, newReg: true, bizApp: true, riderApp: true, errandApp: false, driverApp: true };
const DEFAULT_F2 = { status: 'coming_soon', waitlist: 1245, message: 'DAL Express Delivery is now LIVE in Port Harcourt! Order your first delivery today: https://dal.app/express' };
const DEFAULT_F3 = { status: 'coming_soon', waitlist: 802, message: 'DAL Personal Shopper is now LIVE in Port Harcourt! Let us do the shopping for you: https://dal.app/shopper' };

export default function PlatformSettingsPage() {
    const [configMeta, setConfigMeta] = useState<Config>({});
    const [loading, setLoading] = useState(true);
    const [savingSection, setSavingSection] = useState<string | null>(null);

    const [pricing, setPricing] = useState<Record<string, string>>({
        baseFee: '1500', perKm: '100', premiumFull: '3000', premiumDiscount: '2000', businessListing: '5000'
    });
    const [commissions, setCommissions] = useState<Record<string, string>>({
        rider: '85', marketplace: '5', errandMin: '500', errandMax: '5000'
    });
    const [points, setPoints] = useState<Record<string, string>>({
        route: '50', alert: '10', order: '5', referral: '200', redemptionTarget: '500', redemptionValue: '200'
    });
    const [flags, setFlags] = useState<Record<string, boolean>>(DEFAULT_FLAGS);
    const [launchExpress, setLaunchExpress] = useState<Record<string, unknown>>(DEFAULT_F2);
    const [launchShopper, setLaunchShopper] = useState<Record<string, unknown>>(DEFAULT_F3);
    const [adminLaunchControl, setAdminLaunchControl] = useState(false);
    const [showLaunchModal, setShowLaunchModal] = useState<string | null>(null);
    const [savedSections, setSavedSections] = useState<Record<string, boolean>>({});

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/platform-config');
            if (res.ok) {
                const data = await res.json();
                const c: Config = data.config || {};
                setConfigMeta(c);

                if (c.pricing?.value) {
                    const v = c.pricing.value as typeof DEFAULT_PRICING;
                    setPricing({ baseFee: String(v.baseFee ?? 1500), perKm: String(v.perKm ?? 100), premiumFull: String(v.premiumFull ?? 3000), premiumDiscount: String(v.premiumDiscount ?? 2000), businessListing: String(v.businessListing ?? 5000) });
                }
                if (c.commissions?.value) {
                    const v = c.commissions.value as typeof DEFAULT_COMMISSIONS;
                    setCommissions({ rider: String(v.rider ?? 85), marketplace: String(v.marketplace ?? 5), errandMin: String(v.errandMin ?? 500), errandMax: String(v.errandMax ?? 5000) });
                }
                if (c.points?.value) {
                    const v = c.points.value as typeof DEFAULT_POINTS;
                    setPoints({ route: String(v.route ?? 50), alert: String(v.alert ?? 10), order: String(v.order ?? 5), referral: String(v.referral ?? 200), redemptionTarget: String(v.redemptionTarget ?? 500), redemptionValue: String(v.redemptionValue ?? 200) });
                }
                if (c.flags?.value) setFlags(c.flags.value as typeof DEFAULT_FLAGS);
                if (c.f2_launch?.value) setLaunchExpress(c.f2_launch.value as typeof DEFAULT_F2);
                if (c.f3_launch?.value) setLaunchShopper(c.f3_launch.value as typeof DEFAULT_F3);
                if (c.admin_launch_control?.value !== undefined) { const v = c.admin_launch_control.value as unknown; setAdminLaunchControl(v === true || v === 'true'); }
            }
        } catch (err) {
            console.error('Failed to fetch config:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchConfig(); }, [fetchConfig]);

    const saveSection = async (key: string, value: Record<string, unknown>, label: string) => {
        setSavingSection(key);
        try {
            const res = await fetch('/api/superadmin/platform-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            if (res.ok) {
                setSavedSections(prev => ({ ...prev, [key]: true }));
                setTimeout(() => setSavedSections(prev => ({ ...prev, [key]: false })), 3000);
                await fetchConfig(); // Refresh to get updated_by info
            } else {
                const d = await res.json();
                alert(`Error saving ${label}: ${d.error}`);
            }
        } finally {
            setSavingSection(null);
        }
    };

    const SaveBtn = ({ sectionKey, label, value }: { sectionKey: string; label: string; value: Record<string, unknown> }) => (
        <button
            className={styles.saveBtn}
            onClick={() => saveSection(sectionKey, value, label)}
            disabled={savingSection === sectionKey}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
            {savingSection === sectionKey ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : savedSections[sectionKey] ? <Check size={14} color="var(--color-success)" /> : null}
            {savingSection === sectionKey ? 'Saving...' : savedSections[sectionKey] ? 'Saved!' : 'Save Changes'}
        </button>
    );

    const MetaInfo = ({ meta }: { meta?: ConfigSection }) => {
        if (!meta?.updatedAt) return <div className={styles.lastUpdated}>Never saved</div>;
        const d = new Date(meta.updatedAt);
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return <div className={styles.lastUpdated}>Last updated by {meta.updatedByName || 'Admin'} on {dateStr} at {timeStr}</div>;
    };

    const toggleFlag = (key: keyof typeof flags) => setFlags(prev => ({ ...prev, [key]: !prev[key] }));

    const confirmLaunch = async (code: string) => {
        const newData = { ...(code === 'F2' ? launchExpress : launchShopper), status: 'live' };
        if (code === 'F2') {
            setLaunchExpress(newData);
            await saveSection('f2_launch', newData, 'F2 Launch');
            await saveSection('flags', { ...flags, f2Express: true }, 'Flags');
        } else {
            setLaunchShopper(newData);
            await saveSection('f3_launch', newData, 'F3 Launch');
            await saveSection('flags', { ...flags, f3Shopper: true }, 'Flags');
        }
        setShowLaunchModal(null);
    };

    const deactivateLaunch = async (code: string) => {
        if (!confirm(`Set ${code} back to "Coming Soon"? This won't affect active orders.`)) return;
        const newData = { ...(code === 'F2' ? launchExpress : launchShopper), status: 'coming_soon' };
        if (code === 'F2') {
            setLaunchExpress(newData);
            await saveSection('f2_launch', newData, 'F2 Launch');
            await saveSection('flags', { ...flags, f2Express: false }, 'Flags');
        } else {
            setLaunchShopper(newData);
            await saveSection('f3_launch', newData, 'F3 Launch');
            await saveSection('flags', { ...flags, f3Shopper: false }, 'Flags');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)' }}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p>Loading platform configuration...</p>
            </div>
        );
    }

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
                        <SaveBtn sectionKey="pricing" label="Pricing" value={{
                            baseFee: Number(pricing.baseFee), perKm: Number(pricing.perKm),
                            premiumFull: Number(pricing.premiumFull), premiumDiscount: Number(pricing.premiumDiscount),
                            businessListing: Number(pricing.businessListing)
                        }} />
                        <MetaInfo meta={configMeta.pricing} />
                    </div>
                </div>
                <div className={styles.grid2}>
                    {[
                        { key: 'baseFee', label: 'Delivery Base Fee', suffix: null },
                        { key: 'perKm', label: 'Per-Kilometer Rate', suffix: null },
                        { key: 'premiumFull', label: 'User Premium (Full Price)', suffix: '/mo' },
                        { key: 'premiumDiscount', label: 'User Premium (Discounted)', suffix: '/mo' },
                        { key: 'businessListing', label: 'Business Listing Plan', suffix: '/mo' },
                    ].map(({ key, label, suffix }) => (
                        <div key={key} className={styles.inputGroup}>
                            <label>{label}</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.prefix}>₦</span>
                                <input
                                    type="number"
                                    className={`${styles.input} ${styles.hasPrefix} ${suffix ? styles.hasSuffix : ''}`}
                                    value={pricing[key]}
                                    onChange={e => setPricing({ ...pricing, [key]: e.target.value })}
                                />
                                {suffix && <span className={styles.suffix}>{suffix}</span>}
                            </div>
                        </div>
                    ))}
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
                        <SaveBtn sectionKey="commissions" label="Commissions" value={{
                            rider: Number(commissions.rider), marketplace: Number(commissions.marketplace),
                            errandMin: Number(commissions.errandMin), errandMax: Number(commissions.errandMax)
                        }} />
                        <MetaInfo meta={configMeta.commissions} />
                    </div>
                </div>
                <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                        <label>Rider Payout Rate — <strong>{commissions.rider}%</strong></label>
                        <input type="range" min="50" max="100" value={commissions.rider} onChange={e => setCommissions({ ...commissions, rider: e.target.value })} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Marketplace Sale Fee — <strong>{commissions.marketplace}%</strong></label>
                        <input type="range" min="0" max="30" value={commissions.marketplace} onChange={e => setCommissions({ ...commissions, marketplace: e.target.value })} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Errand Service Fee Floor</label>
                        <div className={styles.inputWrapper}><span className={styles.prefix}>₦</span><input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={commissions.errandMin} onChange={e => setCommissions({ ...commissions, errandMin: e.target.value })} /></div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Errand Service Fee Ceiling</label>
                        <div className={styles.inputWrapper}><span className={styles.prefix}>₦</span><input type="number" className={`${styles.input} ${styles.hasPrefix}`} value={commissions.errandMax} onChange={e => setCommissions({ ...commissions, errandMax: e.target.value })} /></div>
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
                        <SaveBtn sectionKey="points" label="Points" value={{
                            route: Number(points.route), alert: Number(points.alert), order: Number(points.order),
                            referral: Number(points.referral), redemptionTarget: Number(points.redemptionTarget), redemptionValue: Number(points.redemptionValue)
                        }} />
                    </div>
                </div>
                <div className={styles.grid3}>
                    {[
                        { key: 'route', label: 'Per Route Suggestion' },
                        { key: 'alert', label: 'Per Alert Confirmation' },
                        { key: 'order', label: 'Per Delivered Order' },
                        { key: 'referral', label: 'Successful Referral' },
                    ].map(({ key, label }) => (
                        <div key={key} className={styles.inputGroup}>
                            <label>{label}</label>
                            <input type="number" className={styles.input} value={points[key]} onChange={e => setPoints({ ...points, [key]: e.target.value })} />
                        </div>
                    ))}
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
                        <SaveBtn sectionKey="flags" label="Flags" value={flags} />
                        <MetaInfo meta={configMeta.flags} />
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
                                    <h4>{labels[key] || key}</h4>
                                    <p>{value ? 'Active' : 'Disabled'}</p>
                                </div>
                                <div className={styles.switch}>
                                    <input type="checkbox" checked={!!value} onChange={() => toggleFlag(key as keyof typeof flags)} />
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

                {/* Admin launch permission toggle */}
                <div style={{ marginBottom: '20px' }}>
                    <label className={styles.toggleCard} style={{ maxWidth: '420px' }}>
                        <div className={styles.toggleInfo}>
                            <h4>Standard Admins Can Flip Launch Toggles</h4>
                            <p>Allow non-superadmins to control feature launches. (Default: OFF)</p>
                        </div>
                        <div className={styles.switch}>
                            <input type="checkbox" checked={adminLaunchControl} onChange={async () => {
                                const newVal = !adminLaunchControl;
                                setAdminLaunchControl(newVal);
                                await saveSection('admin_launch_control', newVal as unknown as Record<string, unknown>, 'Admin Launch Control');
                            }} />
                            <span className={styles.slider}></span>
                        </div>
                    </label>
                </div>

                <div className={styles.grid2}>
                    {/* F2 Card */}
                    {[
                        { code: 'F2', label: 'F2 Express Delivery', launch: launchExpress, setLaunch: setLaunchExpress },
                        { code: 'F3', label: 'F3 Personal Shopper', launch: launchShopper, setLaunch: setLaunchShopper },
                    ].map(({ code, label, launch, setLaunch }) => {
                        const isLive = launch.status === 'live';
                        return (
                            <div key={code} className={styles.launchCard}>
                                <div className={styles.launchHeader}>
                                    <h3 style={{ margin: 0 }}>{label}</h3>
                                    <div className={styles.launchStatusToggle}>
                                        <span className={styles.statusLabel} style={{ color: !isLive ? 'var(--text-secondary)' : 'var(--text-primary)' }}>Coming Soon</span>
                                        <div className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={isLive}
                                                onChange={() => { if (isLive) deactivateLaunch(code); else setShowLaunchModal(code); }}
                                            />
                                            <span className={styles.slider}></span>
                                        </div>
                                        <span className={styles.statusLabel} style={{ color: isLive ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                                            {isLive ? '🟡 LIVE' : 'Live'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.waitlistBadge}>
                                    Waitlist: {(launch.waitlist as number)?.toLocaleString() ?? 0} people waiting
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <label style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Launch Announcement Message</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={launch.message as string}
                                        onChange={e => setLaunch({ ...launch, message: e.target.value })}
                                        disabled={isLive}
                                    />
                                </div>
                                <div className={styles.launchActions}>
                                    <button className={styles.btnSecondary} onClick={() => alert(`PREVIEW:\n\n${launch.message as string}`)}>Preview Message</button>
                                    {isLive && (
                                        <button onClick={() => deactivateLaunch(code)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px' }}>
                                            Deactivate (Coming Soon)
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
                        <button className={styles.saveBtn}>Save Polygon Map</button>
                    </div>
                </div>
                <div className={styles.mapPlaceholder}>
                    <div className={styles.mapToolbar}>
                        <button title="Draw Polygon"><Hand size={18} /></button>
                        <button title="Edit Zones"><Settings size={18} /></button>
                        <button title="Center PH"><Navigation size={18} /></button>
                    </div>
                    <div style={{ zIndex: 5, textAlign: 'center' }}>
                        <Map size={48} color="var(--color-gold)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                        <h3 style={{ margin: 0, color: 'var(--color-gold)' }}>Mapbox Region Editor</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                            Interactive polygon drawing tool loaded here. Active Zone: Greater Port Harcourt.
                        </p>
                    </div>
                </div>
            </div>

            {/* Launch Confirmation Modal */}
            {showLaunchModal && (
                <div className={styles.modalOverlay} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--surface-card)', padding: '32px', borderRadius: '16px', maxWidth: '520px', width: '100%', border: '1px solid var(--color-primary)' }}>
                        <h2 style={{ marginTop: 0, color: 'var(--color-gold)' }}>Confirm Massive Launch 🚀</h2>
                        <p>You are about to set <strong>{showLaunchModal === 'F2' ? 'Express Delivery' : 'Personal Shopper'}</strong> to LIVE.</p>
                        <div style={{ margin: '24px 0', padding: '16px', background: 'rgba(67, 97, 238, 0.1)', borderRadius: '8px' }}>
                            <strong>This action will instantly:</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                                <li>Enable {showLaunchModal} routing logic globally.</li>
                                <li>Notify <strong>{showLaunchModal === 'F2' ? (launchExpress.waitlist as number)?.toLocaleString() : (launchShopper.waitlist as number)?.toLocaleString()}</strong> users on the waitlist via email.</li>
                                <li>Send WhatsApp blasts to Premium members on the waitlist.</li>
                                <li>Remove "Coming Soon" from the homepage tile and /express or /shopper page.</li>
                            </ul>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button className={styles.btnSecondary} onClick={() => setShowLaunchModal(null)}>Cancel</button>
                            <button className={styles.saveBtn} style={{ background: 'var(--color-primary)', color: 'white' }} onClick={() => confirmLaunch(showLaunchModal)}>
                                {savingSection ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null} Initialize Launch Sequence
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
