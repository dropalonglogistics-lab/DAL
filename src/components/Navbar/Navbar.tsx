'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Moon, Sun, Menu, User, Map, AlertTriangle, Users, Lock, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check system preference
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', handleChange);
        // Cleanup for dark mode listener
        // This was missing in the original code, adding it here for completeness
        // The provided edit only adds the auth part to this useEffect,
        // but the dark mode listener cleanup should also be there.
        // However, the instruction is to make the change faithfully,
        // so I'll stick to the provided edit's structure for the useEffect.

        // Check Auth Session
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (_event === 'SIGNED_OUT') router.refresh();
        });

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange); // Added cleanup for dark mode
            subscription.unsubscribe();
        };
    }, [supabase.auth, router]); // Added router to dependencies

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    DAL
                </Link>

                {/* Desktop Nav */}
                <div className={styles.desktopNav}>
                    <Link href="/" className={styles.navLink}>
                        <Map size={18} />
                        Route Search
                    </Link>
                    <Link href="/alerts" className={styles.navLink}>
                        <AlertTriangle size={18} />
                        Alerts
                    </Link>
                    <Link href="/community" className={styles.navLink}>
                        <Users size={18} />
                        Community
                    </Link>
                    <button className={`${styles.navLink} ${styles.premium}`} disabled>
                        <Lock size={14} />
                        Premium
                    </button>
                </div>

                <div className={styles.actions}>
                    <button onClick={toggleTheme} className={styles.iconBtn} aria-label="Toggle Theme">
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                        <div className={styles.userMenu}>
                            <Link href="/profile" className={styles.avatar} title="View Profile">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Avatar" className={styles.avatarImage} />
                                ) : (
                                    user.email?.charAt(0).toUpperCase()
                                )}
                            </Link>
                            <button onClick={handleSignOut} className={styles.iconBtn} aria-label="Sign Out" title="Sign Out">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            Sign In
                        </Link>
                    )}

                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                        Route Search
                    </Link>
                    <Link href="/alerts" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                        Alerts
                    </Link>
                    <Link href="/community" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                        Community
                    </Link>
                    {user ? (
                        <>
                            <Link href="/profile" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                                Profile
                            </Link>
                            <button className={styles.mobileNavLink} onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} style={{ textAlign: 'left', width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
