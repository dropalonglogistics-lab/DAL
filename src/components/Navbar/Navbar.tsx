'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Menu, X,
    LogOut, Shield, User, ChevronDown
} from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
    { href: '/search', label: 'Route Search' },
    { href: '/alerts', label: 'Alerts' },
    { href: '/community', label: 'Community' },
    { href: '/suggest-route', label: 'Suggest Route' },
];

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Force dark mode globally to prevent flash
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');

        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Auth initialization
        const loadInitialData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);
            if (authUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, role, full_name, is_premium')
                    .eq('id', authUser.id)
                    .single();
                setProfile(userProfile);
            }
        };
        loadInitialData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, role, full_name, is_premium')
                    .eq('id', currentUser.id)
                    .single();
                setProfile(userProfile);
                if (_event === 'SIGNED_IN') router.refresh();
            } else {
                setProfile(null);
                if (_event === 'SIGNED_OUT') {
                    router.push('/');
                    router.refresh();
                }
            }
        });

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
        };
    }, []);

    const handleSignOut = async () => {
        setUser(null);
        setProfile(null);
        setIsAvatarDropdownOpen(false);
        setIsMobileMenuOpen(false);
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    const getInitials = () => {
        if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
        return user?.email?.charAt(0).toUpperCase() ?? 'U';
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} ref={navbarRef}>
            <div className={styles.navContainer}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <img
                        src="/dal-logo-light.png"
                        alt="Drop Along Logistics"
                        height={28}
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
                            <Shield size={15} style={{ marginRight: '6px' }} />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Go Premium */}
                    <Link href="/premium" className={`${styles.goPremiumBtn} ${styles.desktopOnly}`}>
                        Go Premium
                    </Link>

                    {user ? (
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
                                    <div className={styles.dropdownDivider} />
                                    <button className={`${styles.dropdownItem} ${styles.dropdownSignOut}`} onClick={handleSignOut}>
                                        <LogOut size={15} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className={`${styles.signInBtn} ${styles.desktopOnly}`}>
                            Sign In
                        </Link>
                    )}

                    {/* Mobile Hamburger Menu Button */}
                    <button
                        className={`${styles.unifiedMenuBtn} ${styles.mobileOnly}`}
                        onClick={() => setIsMobileMenuOpen(p => !p)}
                        aria-label="Mobile Menu"
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Panel */}
            <div className={`${styles.mobileDropdown} ${isMobileMenuOpen ? styles.mobileDropdownOpen : ''}`}>
                <div className={styles.dropdownLinksGroup}>
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.mobileNavLink} ${isActive(href) ? styles.mobileNavLinkActive : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {label}
                        </Link>
                    ))}
                    <div className={styles.dividerLine} />
                    {user ? (
                        <>
                            <Link href="/profile" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                                My Profile
                            </Link>
                            <Link href="/premium" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                                Go Premium
                            </Link>
                            <button className={`${styles.mobileNavLink} ${styles.mobileSignOutLink}`} onClick={handleSignOut}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
