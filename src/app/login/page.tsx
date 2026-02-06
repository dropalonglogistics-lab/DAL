'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { login, signup, signOut } from './actions';
import { Lock, Mail, User, AlertCircle, LogOut, CheckCircle2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [user, setUser] = useState<any>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check for active session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && !isSuccess) {
                router.push('/profile');
            }
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user && !isSuccess) {
                router.push('/profile');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth, router, isSuccess]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        if (isSignUp) formData.append('fullName', fullName);

        try {
            if (isSignUp) {
                const result = await signup(formData);
                if (result?.error) throw new Error(result.error);
                setSuccessMsg('Verification email sent! Check your inbox.');
            } else {
                const result = await login(formData);
                if (result?.error) throw new Error(result.error);

                // Show success state and redirect
                setIsSuccess(true);
                setSuccessMsg('Access granted. Entry secured.');

                setTimeout(() => {
                    router.push('/profile');
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Login/Signup View
    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${isSuccess ? styles.successExit : ''}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{isSignUp ? 'Join DAL' : 'Welcome to DAL'}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Create an account to start moving smarter' : 'Sign in to access your road intelligence'}
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className={styles.success}>
                        <CheckCircle2 size={20} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className={styles.form}>
                    {isSignUp && (
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={isSignUp}
                                className={styles.input}
                            />
                            <User className={styles.icon} size={20} />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <Mail className={styles.icon} size={20} />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <Lock className={styles.icon} size={20} />
                    </div>

                    {!isSignUp && (
                        <div className={styles.forgotPasswordLink}>
                            <Link href="/forgot-password">Trouble signing in?</Link>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div className="spinner-small"></div> Processing...
                            </span>
                        ) : (isSignUp ? 'Create Free Account' : 'Sign into Dashboard')}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isSignUp ? 'Member already?' : 'New to DAL?'}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className={styles.toggleBtn}
                        >
                            {isSignUp ? 'Sign In' : 'Join Now'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
