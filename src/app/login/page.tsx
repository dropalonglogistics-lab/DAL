'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Lock, Mail, User, AlertCircle, LogOut } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check for active session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Router push is not strictly needed as state change will re-render profile view, 
                // but nice to refresh or redir if needed. 
                // For now, staying on page becomes "Profile Page".
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    // Profile View
    if (user) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.avatarLarge}>
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <h1 className={styles.title}>Your Profile</h1>
                        <p className={styles.subtitle}>{user.user_metadata?.full_name || 'User'}</p>
                    </div>

                    <div className={styles.profileDetails}>
                        <div className={styles.detailRow}>
                            <Mail size={18} className={styles.iconStatic} />
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <button onClick={handleSignOut} className={styles.signOutBtn}>
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    // Login/Signup View
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Join the community moving your city.' : 'Sign in to access your routes and alerts.'}
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className={styles.form}>
                    {isSignUp && (
                        <div className={styles.inputGroup}>
                            <User className={styles.icon} size={20} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={isSignUp}
                                className={styles.input}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <Mail className={styles.icon} size={20} />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.icon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className={styles.toggleBtn}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
