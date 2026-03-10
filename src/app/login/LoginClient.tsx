'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { login, signup, signOut } from './actions';
import { Lock, Mail, User, AlertCircle, LogOut, CheckCircle2 } from 'lucide-react';
import styles from './login.module.css';

export default function LoginClient() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('user');
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
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;
            if (user && !isSuccess) {
                router.push('/profile');
            }
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
        if (isSignUp) {
            formData.append('fullName', fullName);
            formData.append('phone', phone);
            formData.append('role', role);
        }

        try {
            if (isSignUp) {
                const result = await signup(formData);
                if (result?.error) throw new Error(result.error);
                setSuccessMsg('Account Created! Waiting for confirmation...');

                // Automate: Start polling for session
                const pollInterval = setInterval(async () => {
                    const { data } = await supabase.auth.getSession();
                    if (data.session) {
                        clearInterval(pollInterval);
                        setIsSuccess(true);
                        setSuccessMsg('Identity Confirmed. Accessing Dashboard...');
                        setTimeout(() => {
                            const routeMap: Record<string, string> = {
                                'user': '/dashboard',
                                'rider': '/become-a-rider',
                                'errand_worker': '/become-an-errand-worker',
                                'driver': '/become-a-driver'
                            };
                            router.push(routeMap[role] || '/dashboard');
                        }, 1000);
                    }
                }, 2000);

                // Cleanup interval after 3 minutes if no session found
                setTimeout(() => clearInterval(pollInterval), 180000);
            } else {
                const result = await login(formData);
                if (result?.error) throw new Error(result.error);

                // Show success state and redirect quickly
                setIsSuccess(true);
                setSuccessMsg('Access granted. Entry secured.');

                setTimeout(() => {
                    router.push('/profile');
                }, 500);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Login/Signup View
    return (
        <div className={styles.container}>
            <div className={`${styles.card} ${isSuccess ? styles.successExit : ''}`} key={isSignUp ? 'signup' : 'login'}>
                <div className={`${styles.header} ${styles.staggerEntry}`}>
                    <h1 className={styles.title}>{isSignUp ? 'Create Your Account' : 'Welcome to Drop Along'}</h1>
                    <p className={styles.subtitle}>
                        Move smarter. Send faster. Live easier.
                    </p>
                </div>

                {error && (
                    <div className={`${styles.error} ${styles.staggerEntry}`}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className={`${styles.success} ${styles.staggerEntry}`}>
                        <CheckCircle2 size={20} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className={styles.form}>
                    {isSignUp && (
                        <>
                            <div className={`${styles.inputGroup} ${styles.staggerEntry} ${styles.delay_1}`}>
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
                            <div className={`${styles.inputGroup} ${styles.staggerEntry} ${styles.delay_1}`}>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required={isSignUp}
                                    className={styles.input}
                                />
                                <Lock className={styles.icon} size={20} />
                            </div>
                        </>
                    )}

                    <div className={`${styles.inputGroup} ${styles.staggerEntry} ${isSignUp ? styles.delay_2 : styles.delay_1}`}>
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

                    <div className={`${styles.inputGroup} ${styles.staggerEntry} ${isSignUp ? styles.delay_3 : styles.delay_2}`}>
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
                        <div className={`${styles.forgotPasswordLink} ${styles.staggerEntry} ${styles.delay_3}`}>
                            <Link href="/forgot-password">Trouble signing in?</Link>
                        </div>
                    )}

                    {isSignUp && (
                        <div className={`${styles.radioGroup} ${styles.staggerEntry} ${styles.delay_3}`}>
                            <div className={`${styles.radioCard} ${role === 'user' ? styles.active : ''}`} onClick={() => setRole('user')}>
                                <div className={styles.emojiIcon}>🗺️</div>
                                <div className={styles.radioBody}>
                                    <div className={styles.radioHeader}>Regular User</div>
                                    <div className={styles.radioDesc}>Routes, alerts & deliveries</div>
                                </div>
                                {role === 'user' && <CheckCircle2 className={styles.checkIcon} size={20} />}
                            </div>
                            <div className={`${styles.radioCard} ${role === 'rider' ? styles.active : ''}`} onClick={() => setRole('rider')}>
                                <div className={styles.emojiIcon}>🏍️</div>
                                <div className={styles.radioBody}>
                                    <div className={styles.radioHeader}>Delivery Rider</div>
                                    <div className={styles.radioDesc}>Earn delivering packages</div>
                                </div>
                                {role === 'rider' && <CheckCircle2 className={styles.checkIcon} size={20} />}
                            </div>
                            <div className={`${styles.radioCard} ${role === 'errand_worker' ? styles.active : ''}`} onClick={() => setRole('errand_worker')}>
                                <div className={styles.emojiIcon}>🛒</div>
                                <div className={styles.radioBody}>
                                    <div className={styles.radioHeader}>Errand Worker</div>
                                    <div className={styles.radioDesc}>Earn doing errands</div>
                                </div>
                                {role === 'errand_worker' && <CheckCircle2 className={styles.checkIcon} size={20} />}
                            </div>
                            <div className={`${styles.radioCard} ${role === 'driver' ? styles.active : ''}`} onClick={() => setRole('driver')}>
                                <div className={styles.emojiIcon}>🚗</div>
                                <div className={styles.radioBody}>
                                    <div className={styles.radioHeader}>Driver</div>
                                    <div className={styles.radioDesc}>Road intelligence & errand income</div>
                                </div>
                                {role === 'driver' && <CheckCircle2 className={styles.checkIcon} size={20} />}
                            </div>
                        </div>
                    )}

                    <button type="submit" className={`${styles.submitBtn} ${styles.staggerEntry} ${styles.delay_4}`} disabled={loading}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div className="spinner-small"></div> Processing...
                            </span>
                        ) : (isSignUp ? 'Create Account' : 'Access Dashboard')}
                    </button>

                    <div className={styles.divider}>or</div>

                    <button
                        type="button"
                        className={`${styles.googleBtn} ${styles.staggerEntry} ${styles.delay_4}`}
                        onClick={async () => {
                            await supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: { redirectTo: 'https://dal-three.vercel.app/auth/callback' }
                            });
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <div className={`${styles.footer} ${styles.staggerEntry} ${styles.delay_5}`}>
                    <p>
                        {isSignUp ? 'Member already?' : 'New to Drop Along?'}
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
