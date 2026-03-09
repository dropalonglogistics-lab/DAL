'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Moon, Sun, Menu, X, Map, AlertTriangle, Users,
    Navigation, LogOut, Shield, Coins, User, ChevronDown,
    Star, Bell
} from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { href: '/search', label: 'Route Search', icon: Map },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/community', label: 'Community', icon: Users },
    { href: '/suggest-route', label: 'Suggest Route', icon: Navigation },
];

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll listener for backdrop-blur intensity
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });

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

    // Lock scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
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
            <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.navContainer}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <Image
                            src="/dal-logo.png"
                            alt="Drop Along Logistics"
                            height={40}
                            width={160}
                            style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain', objectPosition: 'left' }}
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
                            className={styles.iconBtn}
                            aria-label="Toggle theme"
                        >
                            <div className={styles.iconWrapper}>
                                {isDarkMode
                                    ? <Sun size={19} className={styles.sunIcon} />
                                    : <Moon size={19} className={styles.moonIcon} />
                                }
                            </div>
                        </button>

                        {user ? (
                            <>
                                {/* Points badge */}
                                {profile && (
                                    <div className={styles.pointsBadge}>
                                        <Coins size={13} className={styles.coinIcon} />
                                        <span>{profile.points ?? 0}</span>
                                    </div>
                                )}

                                {/* Go Premium (non-premium logged-in) */}
                                {showGoPremium && (
                                    <button className={styles.goPremiumBtn} disabled>
                                        <Star size={13} fill="currentColor" />
                                        Go Premium
                                    </button>
                                )}

                                {/* Avatar dropdown */}
                                <div className={styles.avatarWrap} ref={dropdownRef}>
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
                            </>
                        ) : (
                            <>
                                {showGoPremium && (
                                    <button className={styles.goPremiumBtn} disabled>
                                        <Star size={13} fill="currentColor" />
                                        Go Premium
                                    </button>
                                )}
                                <Link href="/login" className={styles.signInBtn}>
                                    Sign In
                                </Link>
                            </>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            className={styles.mobileMenuBtn}
                            onClick={() => setIsMobileMenuOpen(p => !p)}
                            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full-screen mobile drawer */}
            <div className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.drawerHeader}>
                    <Image src="/images/dal-logo-full.png" alt="DAL" height={36} width={140} style={{ objectFit: 'contain' }} />
                    <button className={styles.drawerClose} onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.drawerNav}>
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.drawerLink} ${isActive(href) ? styles.drawerLinkActive : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Icon size={20} />
                            {label}
                        </Link>
                    ))}
                    {profile?.is_admin && (
                        <Link href="/admin" className={`${styles.drawerLink} ${styles.drawerAdminLink}`} onClick={() => setIsMobileMenuOpen(false)}>
                            <Shield size={20} /> Admin Portal
                        </Link>
                    )}
                </nav>

                <div className={styles.drawerFooter}>
                    {showGoPremium && (
                        <button className={`${styles.goPremiumBtn} ${styles.goPremiumFull}`} disabled>
                            <Star size={14} fill="currentColor" /> Go Premium
                        </button>
                    )}
                    {user ? (
                        <>
                            <Link href="/profile" className={styles.drawerLink} onClick={() => setIsMobileMenuOpen(false)}>
                                <User size={20} /> Profile
                            </Link>
                            <button className={`${styles.drawerLink} ${styles.drawerSignOut}`} onClick={handleSignOut}>
                                <LogOut size={20} /> Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.drawerSignIn} onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* Drawer backdrop */}
            {isMobileMenuOpen && (
                <div className={styles.drawerBackdrop} onClick={() => setIsMobileMenuOpen(false)} />
            )}
        </>
    );
}
