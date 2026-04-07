'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Menu, X,
    LogOut, Shield, User, ChevronDown,
    Sun, Moon
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
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        // Sync theme with document class
        const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
        setTheme(currentTheme);

        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Auth initialization
        const loadInitialData = async () => {
            // 1. Check for locally cached session immediately
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            if (currentUser) {
                setUser(currentUser);
                // Also fetch profile
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, role, full_name, is_premium, avatar_url')
                    .eq('id', currentUser.id)
                    .maybeSingle();
                if (userProfile) setProfile(userProfile);
                
                // 2. Re-validate on network (secure)
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) setUser(authUser);
            }
        };
        loadInitialData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            
            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin, role, full_name, is_premium, avatar_url')
                    .eq('id', currentUser.id)
                    .maybeSingle();
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

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
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
                        height={42}
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

                    {/* Theme Toggle */}
                    <button 
                        className={styles.themeToggleBtn} 
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className={`${styles.avatarWrap} ${styles.desktopOnly}`} ref={dropdownRef}>
                            <button
                                className={styles.avatarBtn}
                                onClick={() => setIsAvatarDropdownOpen(p => !p)}
                                aria-label="User menu"
                            >
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImg} />
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
                        <Link href="/auth/login" className={`${styles.signInBtn} ${styles.desktopOnly}`}>
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
                        <Link href="/auth/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                    
                    <div className={styles.dividerLine} />
                    
                    <button className={styles.mobileNavLink} onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                        </div>
                    </button>
                </div>
            </div>
        </nav>
    );
}
