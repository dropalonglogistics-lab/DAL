'use client';

import { useState } from 'react';
import {
    User, MapPin, Wallet, Bell, Crown, Shield,
    AlertTriangle, X, Check, Plus, Trash2, Eye, EyeOff, LogOut
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

// ─── Section ids ──────────────────────────
type Section = 'profile' | 'addresses' | 'wallet' | 'notifications' | 'subscription' | 'security' | 'danger';

const SECTIONS: { id: Section; label: string; icon: any }[] = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Address Book', icon: MapPin },
    { id: 'wallet', label: 'DAL Wallet', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

// ─── Sub-components ────────────────────────

function PersonalInfo() {
    const [form, setForm] = useState({ fullName: 'Emeka Okafor', email: 'emeka@example.com', phone: '08012345678' });
    const [saved, setSaved] = useState(false);
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
    const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>Personal Info</h2>
            <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Full Name</label>
                    <input className={styles.fieldInput} value={form.fullName} onChange={set('fullName')} />
                </div>
                <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Email</label>
                    <input className={styles.fieldInput} type="email" value={form.email} onChange={set('email')} />
                </div>
            </div>
            <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input className={styles.fieldInput} type="tel" value={form.phone} onChange={set('phone')} placeholder="08012345678" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Changing your phone will require OTP re-verification.</span>
            </div>
            <button className={styles.btnGold} onClick={save}>
                {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
            </button>
        </div>
    );
}

interface Address { id: number; label: string; address: string; }
function AddressBook() {
    const [addresses, setAddresses] = useState<Address[]>([
        { id: 1, label: 'Home', address: '23 Azikiwe Street, GRA Phase 2, PH' },
        { id: 2, label: 'Work', address: 'Trans-Amadi Industrial Layout, PH' },
    ]);
    const [editing, setEditing] = useState<Address | null>(null);
    const remove = (id: number) => setAddresses(a => a.filter(x => x.id !== id));
    const addNew = () => setAddresses(a => a.length < 5 ? [...a, { id: Date.now(), label: 'Other', address: '' }] : a);
    return (
        <div>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Address Book</h2>
                <button className={styles.btnOutline} onClick={addNew} disabled={addresses.length >= 5}>
                    <Plus size={14} /> Add ({addresses.length}/5)
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {addresses.map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', border: '1.5px solid var(--border)', borderRadius: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201,162,39,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-gold)', flexShrink: 0 }}>
                            <MapPin size={16} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.label}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{a.address || 'No address set'}</div>
                        </div>
                        <button onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={15} /></button>
                    </div>
                ))}
                {addresses.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><MapPin size={20} /></div>
                        <p className={styles.emptyTitle}>No addresses saved</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const WALLET_TXNS = [
    { date: '2026-03-08', desc: 'Top-up via Paystack', amount: '+₦5,000', type: 'credit' },
    { date: '2026-03-07', desc: 'Order payment ORD-2026-002', amount: '-₦800', type: 'debit' },
    { date: '2026-03-06', desc: 'Top-up via Paystack', amount: '+₦2,000', type: 'credit' },
];
function DalWallet() {
    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>DAL Wallet</h2>
            <div style={{ background: 'linear-gradient(135deg, #0D0D0D, #1a1a1a)', borderRadius: 16, padding: '24px', marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(201,162,39,0.08)' }} />
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Available Balance</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#C9A227' }}>₦6,200.00</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Last topped up 3 Mar 2026</div>
            </div>
            <button className={styles.btnGold} style={{ marginBottom: 24, width: '100%', justifyContent: 'center' }}>
                <Wallet size={16} /> Top Up with Paystack
            </button>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Transaction History</h3>
            <div className={styles.card} style={{ marginBottom: 0 }}>
                {WALLET_TXNS.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < WALLET_TXNS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.desc}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.date}</div>
                        </div>
                        <span style={{ fontWeight: 800, color: t.type === 'credit' ? '#10B981' : '#EF4444' }}>{t.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const NOTIF_EVENTS = ['New alert on saved route', 'Order status update', 'Points earned', 'Community reply', 'Promotional offers'];
const NOTIF_CHANNELS = ['Email', 'Push', 'WhatsApp'];
function Notifications() {
    const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
        const t: Record<string, boolean> = {};
        NOTIF_EVENTS.forEach(e => NOTIF_CHANNELS.forEach(c => { t[`${e}__${c}`] = e !== 'Promotional offers'; }));
        return t;
    });
    const flip = (key: string) => setToggles(t => ({ ...t, [key]: !t[key] }));
    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>Notifications</h2>
            <div className={styles.card} style={{ marginBottom: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: `1fr repeat(${NOTIF_CHANNELS.length}, 80px)`, gap: 0 }}>
                    {/* Header row */}
                    <div style={{ padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }} />
                    {NOTIF_CHANNELS.map(c => (
                        <div key={c} style={{ padding: '10px 0', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>{c}</div>
                    ))}
                    {/* Event rows */}
                    {NOTIF_EVENTS.map((e, ei) => (
                        <>
                            <div key={e} style={{ padding: '14px 16px', fontSize: '0.875rem', borderBottom: ei < NOTIF_EVENTS.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center' }}>{e}</div>
                            {NOTIF_CHANNELS.map(c => (
                                <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: ei < NOTIF_EVENTS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <label className={styles.toggle}>
                                        <input type="checkbox" checked={!!toggles[`${e}__${c}`]} onChange={() => flip(`${e}__${c}`)} />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                </div>
                            ))}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Subscription() {
    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>Subscription</h2>
            <div style={{ padding: '20px', border: '1.5px solid var(--border)', borderRadius: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>Free Plan</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Basic route search and community access</div>
                    </div>
                    <span className={`${styles.pill} ${styles.pillCancelled}`}>Current Plan</span>
                </div>
            </div>
            <div style={{ padding: '20px', border: '2px solid var(--brand-gold)', borderRadius: 14, background: 'rgba(201,162,39,0.04)', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Crown size={16} style={{ color: 'var(--brand-gold)' }} />
                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>DAL Premium</span>
                        </div>
                        <ul style={{ margin: '10px 0 0', padding: '0 0 0 18px', fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <li>Priority alert notifications</li>
                            <li>Traffic heatmaps &amp; fare analytics</li>
                            <li>Unlimited saved routes</li>
                            <li>Early access to new features</li>
                        </ul>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--brand-gold)' }}>₦2,500<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/mo</span></div>
                    </div>
                </div>
                <button className={styles.btnGold} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                    <Crown size={16} /> Upgrade to Premium
                </button>
            </div>
        </div>
    );
}

function Security() {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const sessions = [
        { device: 'Chrome on Windows', location: 'Port Harcourt, NG', lastActive: 'Now', current: true },
        { device: 'Safari on iPhone', location: 'Port Harcourt, NG', lastActive: '2 days ago', current: false },
    ];
    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>Security</h2>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 14 }}>Change Password</h3>
            <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Current Password</label>
                <div style={{ position: 'relative' }}>
                    <input type={showOld ? 'text' : 'password'} value={oldPw} onChange={e => setOldPw(e.target.value)} className={styles.fieldInput} style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowOld(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
            <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>New Password</label>
                <div style={{ position: 'relative' }}>
                    <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className={styles.fieldInput} style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>
            <button className={styles.btnGold} style={{ marginBottom: 28 }}>Update Password</button>

            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 14 }}>Active Sessions</h3>
            <div className={styles.card} style={{ marginBottom: 0 }}>
                {sessions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {s.device}
                                {s.current && <span style={{ fontSize: '0.68rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '1px 7px', borderRadius: 99, fontWeight: 700 }}>Current</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.location} · {s.lastActive}</div>
                        </div>
                        {!s.current && (
                            <button className={styles.btnOutline} style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                                <LogOut size={13} /> Revoke
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function DangerZone() {
    const [confirm, setConfirm] = useState(false);
    const [input, setInput] = useState('');
    const supabase = createClient();
    const router = useRouter();

    const handleDelete = async () => {
        if (input !== 'DELETE') return;
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20, color: '#EF4444' }}>Danger Zone</h2>
            <div style={{ padding: '20px', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 14, background: 'rgba(239,68,68,0.03)' }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Delete Account</div>
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Permanently deletes your account, profile, saved routes, order history, and all associated data. This action cannot be undone.
                </p>
                <button className={styles.btnDanger} onClick={() => setConfirm(true)}>
                    <AlertTriangle size={15} /> Delete My Account
                </button>
            </div>

            {confirm && (
                <div className={styles.modalOverlay} onClick={() => setConfirm(false)}>
                    <div className={styles.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle} style={{ color: '#EF4444' }}>Delete Account</h2>
                            <button className={styles.modalCloseBtn} onClick={() => setConfirm(false)}><X size={16} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                This will permanently delete your account and all data. Type <strong>DELETE</strong> to confirm.
                            </p>
                            <input className={styles.fieldInput} value={input} onChange={e => setInput(e.target.value)} placeholder="Type DELETE to confirm" style={{ marginBottom: 16 }} />
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className={styles.btnDanger} disabled={input !== 'DELETE'} onClick={handleDelete}>
                                    Permanently Delete
                                </button>
                                <button className={styles.btnOutline} onClick={() => setConfirm(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
export default function SettingsPage() {
    const [active, setActive] = useState<Section>('profile');

    const CONTENT: Record<Section, React.ReactNode> = {
        profile: <PersonalInfo />,
        addresses: <AddressBook />,
        wallet: <DalWallet />,
        notifications: <Notifications />,
        subscription: <Subscription />,
        security: <Security />,
        danger: <DangerZone />,
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.sectionTitle} style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 24 }}>Settings</h1>
            <div className={styles.settingsLayout}>
                {/* Sidebar tabs */}
                <div className={styles.settingsTabs}>
                    {SECTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            className={`${styles.settingsTab} ${active === id ? styles.settingsTabActive : ''}`}
                            onClick={() => setActive(id)}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content panel */}
                <div className={`${styles.card} ${styles.settingsContent}`} style={{ marginBottom: 0 }}>
                    <div className={styles.cardPadded}>
                        {CONTENT[active]}
                    </div>
                </div>
            </div>
        </div>
    );
}
