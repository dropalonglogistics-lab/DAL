'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Moon, Sun, Menu, User, Map, AlertTriangle, Users, Lock, LogOut, Navigation, Shield } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check system preference
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeMediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeMediaQuery.addEventListener('change', handleChange);

        // Check Auth Session & Profile
        const loadInitialData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            setUser(authUser);
            if (authUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', authUser.id)
                    .single();
                setProfile(userProfile);
            }
        };
        loadInitialData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', currentUser.id)
                    .single();
                setProfile(userProfile);
            } else {
                setProfile(null);
            }
            if (_event === 'SIGNED_OUT') {
                setProfile(null);
                router.refresh();
            }
        });

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
            subscription.unsubscribe();
        };
    }, [supabase, router]);

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
                    <Link href="/suggest-route" className={`${styles.navLink} ${styles.suggestLink}`}>
                        <Navigation size={18} />
                        Suggest Route
                    </Link>
                    <button className={`${styles.navLink} ${styles.premium}`} disabled>
                        <Lock size={14} />
                        Premium
                    </button>
                    {profile?.is_admin && (
                        <Link href="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                            <Shield size={18} />
                            Admin
                        </Link>
                    )}
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
                    <Link href="/suggest-route" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                        Suggest Route
                    </Link>
                    {profile?.is_admin && (
                        <Link href="/admin" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-warning)' }}>
                            Admin Portal
                        </Link>
                    )}
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
