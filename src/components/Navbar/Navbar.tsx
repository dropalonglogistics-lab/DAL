'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Moon, Sun, Menu, X, Map, AlertTriangle, Users,
    Navigation, LogOut, Shield, Coins, User, ChevronDown,
    Star, Bell, ShoppingBag, Package
} from 'lucide-react';
import styles from './Navbar.module.css';
import CartSidebar from '../shop/CartSidebar';

const NAV_LINKS = [
    { href: '/search', label: 'Route Search', icon: Map },
    { href: '/express', label: 'Express', icon: Package },
    { href: '/shopper', label: 'Errand Worker', icon: ShoppingBag },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/suggest-route', label: 'Suggest Route', icon: Navigation },
];

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [f2Live, setF2Live] = useState(false);
    const [f3Live, setF3Live] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Scroll listener for backdrop-blur intensity
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Gates
        fetch('/api/config?key=f2_express_live').then(res => res.json()).then(data => setF2Live(data.f2_express_live)).catch(() => {});
        fetch('/api/config?key=f3_shopper_live').then(res => res.json()).then(data => setF3Live(data.f3_shopper_live)).catch(() => {});

        // Theme
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dark = saved === 'dark' || (!saved && prefersDark);
        setIsDarkMode(dark);

        // Auth
        const loadInitialData = async () => {
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user;
            setUser(authUser);
            if (authUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, points, role, full_name, is_premium')
                    .eq('id', authUser.id)
                    .single();
                setProfile(userProfile);
            }
        };
        loadInitialData();

        let profileChannel: any = null;
        const setupProfileListener = (uid: string) => {
            if (profileChannel) supabase.removeChannel(profileChannel);
            profileChannel = supabase
                .channel(`profile-nav-${uid}`)
                .on('postgres_changes', {
                    event: 'UPDATE', schema: 'public', table: 'profiles',
                    filter: `id=eq.${uid}`
                }, (payload: any) => setProfile(payload.new as any))
                .subscribe();
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, points, role, full_name, is_premium')
                    .eq('id', currentUser.id)
                    .single();
                setProfile(userProfile);
                setupProfileListener(currentUser.id);
                if (_event === 'SIGNED_IN') router.refresh();
            } else {
                setProfile(null);
                if (profileChannel) supabase.removeChannel(profileChannel);
                if (_event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    router.push('/');
                    router.refresh();
                }
            }
        });

        // Close dropdown on outside click
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsAvatarDropdownOpen(false);
            }
            if (navbarRef.current && !navbarRef.current.contains(e.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            subscription.unsubscribe();
            if (profileChannel) supabase.removeChannel(profileChannel);
        };
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Scroll lock removed because a dropdown shouldn't lock scroll
    }, [isMobileMenuOpen]);

    const handleSignOut = async () => {
        setUser(null);
        setProfile(null);
        setIsAvatarDropdownOpen(false);
        setIsMobileMenuOpen(false);
        try {
            await supabase.auth.signOut();
            router.push('/');
            router.refresh();
        } catch {
            window.location.href = '/';
        }
    };

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    const getInitials = () => {
        if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
        return user?.email?.charAt(0).toUpperCase() ?? 'U';
    };

    const showGoPremium = !profile?.is_premium;

    return (
        <>
            <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} ref={navbarRef}>
                <div className={styles.navContainer}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/dal-logo-light.png"
                            alt="Drop Along Logistics"
                            height={40}
                            width={160}
                            style={{ objectFit: 'contain', objectPosition: 'left', padding: '8px' }}
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className={styles.desktopNav}>
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`${styles.navLink} ${isActive(href) ? styles.navLinkActive : ''}`}
                            >
                                {label}
                                {href === '/express' && !f2Live && <span className={styles.soonBadgeNav}>Soon</span>}
                                {href === '/shopper' && !f3Live && <span className={styles.soonBadgeNav}>Soon</span>}
                            </Link>
                        ))}
                        {profile?.is_admin && (
                            <Link
                                href="/admin"
                                className={`${styles.navLink} ${styles.adminLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}
                            >
                                <Shield size={15} />
                                Admin
                            </Link>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {/* Theme toggle */}
                        <button
                            onClick={() => setIsDarkMode(p => !p)}
                            className={`${styles.iconBtn} ${styles.themeToggleBtn}`}
                            aria-label="Toggle theme"
                        >
                            <div className={styles.iconWrapper}>
                                {isDarkMode
                                    ? <Sun size={19} className={styles.sunIcon} />
                                    : <Moon size={19} className={styles.moonIcon} />
                                }
                            </div>
                        </button>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={styles.iconBtn}
                            aria-label="Open cart"
                        >
                            <div className={styles.iconWrapper}>
                                <ShoppingBag size={19} />
                            </div>
                        </button>

                        {/* Go Premium (mobile compact) */}
                        {showGoPremium && (
                            <div className={`${styles.goPremiumBtn} ${styles.goPremiumMobile} ${styles.mobileOnly}`} aria-hidden="true">
                                <Star size={13} fill="currentColor" />
                                Premium
                            </div>
                        )}

                        {user ? (
                            <>
                                {/* Points badge (desktop only) */}
                                {profile && (
                                    <div className={`${styles.pointsBadge} ${styles.desktopOnly}`}>
                                        <Coins size={13} className={styles.coinIcon} />
                                        <span>{profile.points ?? 0}</span>
                                    </div>
                                )}

                                {/* Go Premium (desktop only) */}
                                {showGoPremium && (
                                    <button className={`${styles.goPremiumBtn} ${styles.desktopOnly}`} disabled>
                                        <Star size={13} fill="currentColor" />
                                        Go Premium
                                    </button>
                                )}

                                {/* Avatar dropdown (desktop only) */}
                                <div className={`${styles.avatarWrap} ${styles.desktopOnly}`} ref={dropdownRef}>
                                    <button
                                        className={styles.avatarBtn}
                                        onClick={() => setIsAvatarDropdownOpen(p => !p)}
                                        aria-label="User menu"
                                    >
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.avatarImg} />
                                        ) : (
                                            <span className={styles.avatarInitials}>{getInitials()}</span>
                                        )}
                                        <ChevronDown size={14} className={`${styles.chevron} ${isAvatarDropdownOpen ? styles.chevronOpen : ''}`} />
                                    </button>

                                    {isAvatarDropdownOpen && (
                                        <div className={styles.dropdown}>
                                            <div className={styles.dropdownHeader}>
                                                <span className={styles.dropdownName}>
                                                    {profile?.full_name || user.email?.split('@')[0]}
                                                </span>
                                                <span className={styles.dropdownEmail}>{user.email}</span>
                                            </div>
                                            <div className={styles.dropdownDivider} />
                                            <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsAvatarDropdownOpen(false)}>
                                                <User size={15} /> Profile
                                            </Link>
                                            {profile?.is_admin && (
                                                <Link href="/admin" className={styles.dropdownItem} onClick={() => setIsAvatarDropdownOpen(false)}>
                                                    <Shield size={15} /> Admin Portal
                                                </Link>
                                            )}
                                            <div className={styles.dropdownDivider} />
                                            <button className={`${styles.dropdownItem} ${styles.dropdownSignOut}`} onClick={handleSignOut}>
                                                <LogOut size={15} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Unified Mobile Menu Button (logged in) */}
                                <button
                                    className={`${styles.unifiedMenuBtn} ${styles.mobileOnly}`}
                                    onClick={() => setIsMobileMenuOpen(p => !p)}
                                    aria-label="Mobile Menu"
                                >
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.avatarImg} />
                                    ) : (
                                        <span className={styles.avatarInitials}>{getInitials()}</span>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Go Premium (desktop only) */}
                                {showGoPremium && (
                                    <button className={`${styles.goPremiumBtn} ${styles.desktopOnly}`} disabled>
                                        <Star size={13} fill="currentColor" />
                                        Go Premium
                                    </button>
                                )}

                                {/* Sign In (desktop only) */}
                                <Link href="/login" className={`${styles.signInBtn} ${styles.desktopOnly}`}>
                                    Sign In
                                </Link>

                                {/* Unified Mobile Menu Button (logged out) */}
                                <button
                                    className={`${styles.unifiedMenuBtn} ${styles.mobileOnly}`}
                                    onClick={() => setIsMobileMenuOpen(p => !p)}
                                    aria-label="Mobile Menu"
                                >
                                    <Menu size={24} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {/* Full-width mobile dropdown */}
                <div className={`${styles.mobileDropdown} ${isMobileMenuOpen ? styles.mobileDropdownOpen : ''}`}>
                    {/* Close button X top right */}
                    <button className={styles.closeDropdownBtn} onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>

                    {/* Logged in header block */}
                    {user && profile && (
                        <>
                            <div className={styles.dropdownProfileHeader}>
                                <div className={styles.largeAvatar}>
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.largeAvatarImg} />
                                    ) : (
                                        <span className={styles.largeAvatarInitials}>{getInitials()}</span>
                                    )}
                                </div>
                                <div className={styles.dropdownProfileName}>{profile.full_name || user.email?.split('@')[0]}</div>
                                <div className={styles.dropdownProfileEmail}>{user.email}</div>
                            </div>
                            <div className={styles.dividerLine} />
                        </>
                    )}

                    <div className={styles.dropdownLinksGroup}>
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`${styles.mobileNavLink} ${isActive(href) ? styles.mobileNavLinkActive : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {label}
                                {href === '/express' && !f2Live && <span className={styles.soonBadgeNav}>Soon</span>}
                                {href === '/shopper' && !f3Live && <span className={styles.soonBadgeNav}>Soon</span>}
                            </Link>
                        ))}
                        {profile?.is_admin && (
                            <Link href="/admin" className={`${styles.mobileNavLink} ${isActive('/admin') ? styles.mobileNavLinkActive : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                Admin Portal
                            </Link>
                        )}
                    </div>

                    <div className={styles.dividerLine} />

                    {/* Footer / Auth actions block */}
                    {user ? (
                        <div className={styles.dropdownLinksGroup}>
                            <Link href="/dashboard" className={`${styles.mobileNavLink} ${isActive('/dashboard') ? styles.mobileNavLinkActive : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                My Dashboard
                            </Link>
                            <Link href="/dashboard/points" className={`${styles.mobileNavLink} ${isActive('/dashboard/points') ? styles.mobileNavLinkActive : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                My Points: {profile?.points ?? 0}
                            </Link>
                            <Link href="/dashboard/settings" className={`${styles.mobileNavLink} ${isActive('/dashboard/settings') ? styles.mobileNavLinkActive : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                                Settings
                            </Link>
                            <div className={styles.dividerLine} />
                            <button className={`${styles.mobileNavLink} ${styles.mobileSignOutLink}`} onClick={handleSignOut}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className={styles.mobileAuthActions}>
                            <Link href="/login" className={styles.mobileActionSignIn} onClick={() => setIsMobileMenuOpen(false)}>
                                Sign In
                            </Link>
                            <Link href="/register" className={styles.mobileActionJoin} onClick={() => setIsMobileMenuOpen(false)}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>

                <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </nav>
        </>
    );
}
